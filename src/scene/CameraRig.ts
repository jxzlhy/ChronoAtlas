import gsap from 'gsap'
import * as THREE from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { latLonToVec3 } from './latLon'

/**
 * 相机飞行控制器：沿球面插值（方向 slerp + 距离 lerp），
 * 全程保持 +Y 为天顶，即"北极朝上"。
 */
export class CameraRig {
  private tween: gsap.core.Tween | null = null
  private readonly zAxis = new THREE.Vector3(0, 0, 1)

  constructor(
    private camera: THREE.PerspectiveCamera,
    private controls: OrbitControls,
  ) {}

  /** 终止进行中的飞行动画（叙事跟随接管相机前调用，避免 tween 与跟随打架） */
  kill(): void {
    this.tween?.kill()
    this.tween = null
    this.controls.enabled = true
  }

  flyTo(lat: number, lon: number, dist: number, duration = 1.2): void {
    this.tween?.kill()

    const startPos = this.camera.position
    const startDir = startPos.clone().normalize()
    const endDir = latLonToVec3(lat, lon, 1).normalize()
    const startR = startPos.length()

    const qa = new THREE.Quaternion().setFromUnitVectors(this.zAxis, startDir)
    const qb = new THREE.Quaternion().setFromUnitVectors(this.zAxis, endDir)
    const state = { p: 0 }

    this.controls.enabled = false
    this.tween = gsap.to(state, {
      p: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        const q = qa.clone().slerp(qb, state.p)
        const dir = this.zAxis.clone().applyQuaternion(q)
        const r = THREE.MathUtils.lerp(startR, dist, state.p)
        this.camera.position.copy(dir.multiplyScalar(r))
        this.camera.lookAt(0, 0, 0)
        this.controls.update()
      },
      onComplete: () => {
        this.controls.enabled = true
      },
    })
  }
}
