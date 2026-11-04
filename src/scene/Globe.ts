import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { latLonToVec3 } from './latLon'

const TEXTURE_URLS = [
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-dark.jpg',
  'https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg',
]

/**
 * 3D 地球场景：贴图球体 + 星空 + 大气辉光 + Bloom 后期。
 * 贴图按候选链依次尝试（load 事件后加载，不阻塞页面），全部失败时降级为
 * 深色线框风格球体，功能不受影响。
 */
export class Globe {
  readonly scene = new THREE.Scene()
  readonly camera: THREE.PerspectiveCamera
  readonly renderer: THREE.WebGLRenderer
  readonly controls: OrbitControls
  readonly composer: EffectComposer

  readonly earth: THREE.Mesh
  private earthMaterial: THREE.MeshPhongMaterial
  private stars: THREE.Points
  private fallbackWire: THREE.LineSegments | null = null

  /** 贴图就绪（或确认降级）后 resolve */
  readonly ready: Promise<'texture' | 'fallback'>

  private container: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    const width = container.clientWidth
    const height = container.clientHeight

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height)
    this.renderer.setClearColor(0x04060e, 1)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    // EffectComposer 每个 pass 都会 reset info；关闭 autoReset 改为整帧手动累计，
    // 使 renderer.info 反映完整帧的 draw calls/triangles（性能基线用）
    this.renderer.info.autoReset = false
    container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.05, 200)
    // 初始远景（ intro 飞行的起点）
    this.camera.position.copy(latLonToVec3(8, 150, 7.2))
    this.scene.add(this.camera)

    // 光照：环境光 + 跟随相机的主光，保证可见面始终被照亮
    this.scene.add(new THREE.AmbientLight(0xbfd4ff, 0.75))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35)
    keyLight.position.set(0.6, 0.5, 1)
    this.camera.add(keyLight)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enablePan = false
    this.controls.minDistance = 1.35
    this.controls.maxDistance = 6
    this.controls.rotateSpeed = 0.45
    this.controls.zoomSpeed = 0.6
    // 限制俯仰角，保持"北极朝上"的阅读方向
    this.controls.minPolarAngle = 0.15
    this.controls.maxPolarAngle = Math.PI - 0.15

    // ---- 地球本体 ----
    const geometry = new THREE.SphereGeometry(1, 96, 96)
    this.earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x18263b,
      specular: new THREE.Color(0x1b2b40),
      shininess: 6,
    })
    this.earth = new THREE.Mesh(geometry, this.earthMaterial)
    this.scene.add(this.earth)

    this.ready = this.initEarthSurface().then((mode) => {
      if (mode === 'fallback') this.addFallbackWireframe()
      return mode
    })

    // ---- 大气辉光（菲涅尔外壳） ----
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(max(0.0, 0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.4);
            gl_FragColor = vec4(0.32, 0.6, 1.0, 1.0) * intensity * 0.95;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      }),
    )
    this.scene.add(atmosphere)

    // ---- 星空 ----
    this.stars = this.createStars()
    this.scene.add(this.stars)

    // ---- 后期：Bloom ----
    this.composer = new EffectComposer(this.renderer)
    this.composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.45, 0.5, 0.62)
    this.composer.addPass(bloom)
    this.composer.addPass(new OutputPass())
    this.composer.setSize(width, height)

    window.addEventListener('resize', () => this.onResize())
  }

  /**
   * 地表贴图加载：window load 之后再启动（不阻塞页面 load 事件），
   * 每个候选源 12 秒超时；全部失败则降级为线框球。ready 一旦结算，迟到
   * 的贴图仍会被应用。
   */
  private initEarthSurface(): Promise<'texture' | 'fallback'> {
    return new Promise((resolve) => {
      let settled = false
      const settle = (mode: 'texture' | 'fallback'): void => {
        if (!settled) {
          settled = true
          resolve(mode)
        }
      }
      const applyTexture = (texture: THREE.Texture): void => {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        this.earthMaterial.map = texture
        this.earthMaterial.color.set(0xffffff)
        this.earthMaterial.needsUpdate = true
        if (this.fallbackWire) {
          this.scene.remove(this.fallbackWire)
          this.fallbackWire.geometry.dispose()
          ;(this.fallbackWire.material as THREE.Material).dispose()
          this.fallbackWire = null
        }
        settle('texture')
      }

      const start = (): void => {
        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin('anonymous')
        let index = 0
        const tryNext = (): void => {
          if (index >= TEXTURE_URLS.length) {
            settle('fallback')
            return
          }
          const url = TEXTURE_URLS[index++]
          const timer = window.setTimeout(() => tryNext(), 12000)
          loader.load(
            url,
            (texture) => {
              window.clearTimeout(timer)
              applyTexture(texture)
            },
            undefined,
            () => {
              window.clearTimeout(timer)
              tryNext()
            },
          )
        }
        tryNext()
      }

      if (document.readyState === 'complete') {
        start()
      } else {
        window.addEventListener('load', start, { once: true })
      }
    })
  }

  /** 贴图全部不可用时的降级外观：深蓝球体 + 经纬线框 */
  private addFallbackWireframe(): void {
    this.earthMaterial.color.set(0x0d1b2e)
    this.fallbackWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(1.001, 48, 24)),
      new THREE.LineBasicMaterial({ color: 0x2a4a6a, transparent: true, opacity: 0.28 }),
    )
    this.scene.add(this.fallbackWire)
  }

  private createStars(): THREE.Points {
    const count = 2400
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // 均匀分布在远处球壳上
      const r = 30 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0x9db4ff,
      size: 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    })
    return new THREE.Points(geometry, material)
  }

  private onResize(): void {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.composer.setSize(width, height)
  }

  update(dt: number): void {
    this.stars.rotation.y += dt * 0.006
  }

  render(): void {
    this.controls.update()
    this.renderer.info.reset()
    this.composer.render()
  }
}
