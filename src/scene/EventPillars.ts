import * as THREE from 'three'
import { appStore, isActive, matchesFilters, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { latLonToVec3 } from './latLon'

interface Entry {
  ev: HistoryEvent
  group: THREE.Group
  tile: THREE.Mesh
  pillar: THREE.Mesh
  baseScaleY: number
  velY: number
}

interface EntryTarget {
  pillarScale: number
  pillarOpacity: number
  tileOpacity: number
  groupScale: number
  selected: boolean
}

const PILLAR_HEIGHT = [0.13, 0.2, 0.29] // 重要度 1/2/3 对应的棱柱高度

/**
 * 历史事件六棱柱层：底部常亮的六边形地块 + 随时间窗口升降的棱柱。
 * 高度由事件重要度决定，颜色按事件类型区分，生长动画为轻微欠阻尼弹簧。
 */
export class EventPillars {
  readonly root = new THREE.Group()
  private readonly entries: Entry[] = []
  private readonly pickables: THREE.Mesh[] = []
  private readonly raycaster = new THREE.Raycaster()
  private readonly targets = new Map<string, EntryTarget>()
  /** 减少动态偏好下退回指数缓动，无回弹 */
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  constructor(scene: THREE.Scene) {
    for (const ev of EVENTS) {
      const color = new THREE.Color(EVENT_TYPES[ev.type].color)
      const surface = latLonToVec3(ev.lat, ev.lon, 1.004)
      const normal = surface.clone().normalize()

      const group = new THREE.Group()
      group.position.copy(surface)
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)

      // 常亮六边形地块（点击热区）
      const tile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.017, 0.007, 6),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }),
      )
      tile.position.y = 0.0035
      tile.userData.eventId = ev.id

      // 六棱柱（时间窗口内升起）
      const pillarGeometry = new THREE.CylinderGeometry(0.008, 0.016, 1, 6)
      pillarGeometry.translate(0, 0.5, 0) // 底部对齐地表，scale.y 即高度
      const pillar = new THREE.Mesh(
        pillarGeometry,
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }),
      )
      pillar.scale.y = 0.0001
      pillar.userData.eventId = ev.id

      group.add(tile, pillar)
      this.root.add(group)
      this.entries.push({ ev, group, tile, pillar, baseScaleY: 0.0001, velY: 0 })
      this.pickables.push(tile, pillar)
    }
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
        pillarOpacity: active ? (selected ? 0.95 : hovered ? 0.8 : 0.58) : 0,
        tileOpacity: selected ? 1 : hovered ? 1 : active ? 0.9 : 0.38,
        groupScale: selected ? 1.35 : hovered ? 1.12 : active ? 1 : 0.62,
        selected,
      })
    }
  }

  /** 每帧向目标状态缓动；棱柱用轻微欠阻尼弹簧，生长带一次柔和回弹 */
  update(dt: number, t: number): void {
    const k = 1 - Math.exp(-dt * 8)
    for (const e of this.entries) {
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
      e.pillar.scale.y = Math.max(e.baseScaleY * pulse, 0.0001)

      const pillarMaterial = e.pillar.material as THREE.MeshBasicMaterial
      pillarMaterial.opacity += (target.pillarOpacity - pillarMaterial.opacity) * k

      const tileMaterial = e.tile.material as THREE.MeshBasicMaterial
      tileMaterial.opacity += (target.tileOpacity - tileMaterial.opacity) * k

      const s = e.group.scale.x + (target.groupScale - e.group.scale.x) * k
      e.group.scale.setScalar(s)
    }
  }

  /** 屏幕坐标拾取，返回命中的事件 id 或 null */
  pick(clientX: number, clientY: number, camera: THREE.Camera, canvas: HTMLElement): string | null {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, camera)
    const hits = this.raycaster.intersectObjects(this.pickables, false)
    return hits.length > 0 ? ((hits[0].object.userData.eventId as string) ?? null) : null
  }
}
