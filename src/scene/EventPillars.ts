import * as THREE from 'three'
import { appStore, isActive, matchesFilters, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { latLonToVec3 } from './latLon'

interface Entry {
  ev: HistoryEvent
  surface: THREE.Vector3
  normal: THREE.Vector3
  baseScaleY: number
  velY: number
}

interface EntryTarget {
  pillarScale: number
  pillarAlpha: number
  tileAlpha: number
  groupScale: number
  selected: boolean
}

const PILLAR_HEIGHT = [0.13, 0.2, 0.29] // 重要度 1/2/3 对应的棱柱高度

/** 给 MeshBasicMaterial 注入 per-instance alpha（aAlpha 属性 → 漫反射透明度） */
function patchInstanceAlpha(material: THREE.MeshBasicMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nattribute float aAlpha;\nvarying float vAlpha;',
      )
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvAlpha = aAlpha;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vAlpha;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vAlpha;')
  }
  // 共享同一份补丁编译产物，避免程序缓存击穿
  material.customProgramCacheKey = () => 'chrono-instance-alpha'
}

/**
 * 历史事件六棱柱层（InstancedMesh 合批版）：
 * 底部常亮六边形地块 + 随时间窗口升降的棱柱，全部事件合并为 2 个 InstancedMesh
 * （per-instance 颜色 setColorAt + per-instance 透明度 aAlpha 注入 + 每帧弹簧矩阵），
 * 将 119×2 独立 draw call 合并为 2 次，为 140+ 事件扩容做性能准备。
 * 高度由事件重要度决定，颜色按事件类型区分，生长动画为轻微欠阻尼弹簧。
 */
export class EventPillars {
  readonly root = new THREE.Group()
  private readonly tileMesh: THREE.InstancedMesh
  private readonly pillarMesh: THREE.InstancedMesh
  private readonly ids: string[] = []
  private readonly entries: Entry[] = []
  private readonly tileAlpha: Float32Array
  private readonly pillarAlpha: Float32Array
  private readonly targets = new Map<string, EntryTarget>()
  private readonly raycaster = new THREE.Raycaster()
  private readonly dummy = new THREE.Object3D()
  /** 减少动态偏好下退回指数缓动，无回弹 */
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor(scene: THREE.Scene) {
    const n = EVENTS.length
    const tileGeo = new THREE.CylinderGeometry(0.017, 0.017, 0.007, 6)
    const pillarGeo = new THREE.CylinderGeometry(0.008, 0.016, 1, 6)
    pillarGeo.translate(0, 0.5, 0) // 底部对齐地表，scale.y 即高度

    this.tileAlpha = new Float32Array(n).fill(0.9)
    this.pillarAlpha = new Float32Array(n)

    tileGeo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(this.tileAlpha, 1))
    pillarGeo.setAttribute('aAlpha', new THREE.InstancedBufferAttribute(this.pillarAlpha, 1))

    const tileMaterial = new THREE.MeshBasicMaterial({ transparent: true })
    const pillarMaterial = new THREE.MeshBasicMaterial({ transparent: true })
    patchInstanceAlpha(tileMaterial)
    patchInstanceAlpha(pillarMaterial)

    this.tileMesh = new THREE.InstancedMesh(tileGeo, tileMaterial, n)
    this.pillarMesh = new THREE.InstancedMesh(pillarGeo, pillarMaterial, n)
    this.tileMesh.frustumCulled = false
    this.pillarMesh.frustumCulled = false

    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < n; i++) {
      const ev = EVENTS[i]
      this.ids.push(ev.id)
      const surface = latLonToVec3(ev.lat, ev.lon, 1.004)
      const normal = surface.clone().normalize()
      this.entries.push({ ev, surface, normal, baseScaleY: 0.0001, velY: 0 })
      // per-instance 颜色（事件类型主题色，静态）
      this.tileMesh.setColorAt(i, new THREE.Color(EVENT_TYPES[ev.type].color))
      this.pillarMesh.setColorAt(i, new THREE.Color(EVENT_TYPES[ev.type].color))

      // 初始矩阵：地块贴地、棱柱隐没
      this.dummy.position.copy(surface).addScaledVector(normal, 0.0035)
      this.dummy.quaternion.setFromUnitVectors(up, normal)
      this.dummy.scale.setScalar(0.62)
      this.dummy.updateMatrix()
      this.tileMesh.setMatrixAt(i, this.dummy.matrix)

      this.dummy.position.copy(surface)
      this.dummy.scale.set(0.62, 0.0001, 0.62)
      this.dummy.updateMatrix()
      this.pillarMesh.setMatrixAt(i, this.dummy.matrix)
    }
    if (this.tileMesh.instanceColor) this.tileMesh.instanceColor.needsUpdate = true
    if (this.pillarMesh.instanceColor) this.pillarMesh.instanceColor.needsUpdate = true

    this.root.add(this.tileMesh, this.pillarMesh)
    scene.add(this.root)

    appStore.subscribe(() => this.recalcTargets())
    this.recalcTargets()
  }

  private recalcTargets(): void {
    const s = appStore.getState()
    for (const e of this.entries) {
      // 年份窗口 + 快照筛选（类型/大洲）共同决定棱柱是否升起
      const active = isActive(e.ev, s.year, s.windowSize) && matchesFilters(e.ev, s)
      const selected = s.selectedId === e.ev.id
      const hovered = s.hoverId === e.ev.id
      this.targets.set(e.ev.id, {
        pillarScale: active ? PILLAR_HEIGHT[e.ev.importance - 1] : 0.0001,
        pillarAlpha: active ? (selected ? 0.95 : hovered ? 0.8 : 0.58) : 0,
        tileAlpha: selected ? 1 : hovered ? 1 : active ? 0.9 : 0.38,
        groupScale: selected ? 1.35 : hovered ? 1.12 : active ? 1 : 0.62,
        selected,
      })
    }
  }

  /** 每帧向目标状态缓动；棱柱用轻微欠阻尼弹簧，生长带一次柔和回弹 */
  update(dt: number, t: number): void {
    const k = 1 - Math.exp(-dt * 8)
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < this.entries.length; i++) {
      const e = this.entries[i]
      const target = this.targets.get(e.ev.id)
      if (!target) continue

      if (this.reducedMotion) {
        e.baseScaleY += (target.pillarScale - e.baseScaleY) * k
      } else {
        // 弹簧：刚度 120 / 阻尼 ~13.5 → 阻尼比约 0.6，约 10% 过冲
        e.velY += (target.pillarScale - e.baseScaleY) * 120 * dt
        e.velY *= Math.exp(-dt * 13.5)
        e.baseScaleY += e.velY * dt
        if (e.baseScaleY < 0.0001 && e.velY < 0) {
          e.baseScaleY = 0.0001
          e.velY = 0
        }
      }
      const pulse = target.selected ? 1 + Math.sin(t * 4.2) * 0.08 : 1
      const height = Math.max(e.baseScaleY * pulse, 0.0001)

      // 地块矩阵（贴地 + groupScale）
      this.dummy.position.copy(e.surface).addScaledVector(e.normal, 0.0035)
      this.dummy.quaternion.setFromUnitVectors(up, e.normal)
      this.dummy.scale.setScalar(target.groupScale)
      this.dummy.updateMatrix()
      this.tileMesh.setMatrixAt(i, this.dummy.matrix)

      // 棱柱矩阵（半径随 groupScale，高度为弹簧值 × groupScale）
      this.dummy.position.copy(e.surface)
      this.dummy.scale.set(target.groupScale, height * target.groupScale, target.groupScale)
      this.dummy.updateMatrix()
      this.pillarMesh.setMatrixAt(i, this.dummy.matrix)

      // per-instance 透明度渐变
      this.pillarAlpha[i] += (target.pillarAlpha - this.pillarAlpha[i]) * k
      this.tileAlpha[i] += (target.tileAlpha - this.tileAlpha[i]) * k
    }
    this.tileMesh.instanceMatrix.needsUpdate = true
    this.pillarMesh.instanceMatrix.needsUpdate = true
    const tileAttr = this.tileMesh.geometry.getAttribute('aAlpha') as THREE.InstancedBufferAttribute
    const pillarAttr = this.pillarMesh.geometry.getAttribute('aAlpha') as THREE.InstancedBufferAttribute
    tileAttr.needsUpdate = true
    pillarAttr.needsUpdate = true
  }

  /** 屏幕坐标拾取，返回命中的事件 id 或 null（InstancedMesh 命中 instanceId → 事件 id） */
  pick(clientX: number, clientY: number, camera: THREE.Camera, canvas: HTMLElement): string | null {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, camera)
    const hits = this.raycaster.intersectObjects([this.tileMesh, this.pillarMesh], false)
    for (const hit of hits) {
      const mesh = hit.object as THREE.InstancedMesh
      const idx = hit.instanceId
      if (idx === undefined || idx === null) continue
      const id = this.ids[idx]
      if (!id) continue
      // 隐没的棱柱（alpha≈0）不参与拾取，保持"空白点击取消选中"行为
      if (mesh === this.pillarMesh && this.pillarAlpha[idx] < 0.05) continue
      return id
    }
    return null
  }
}
