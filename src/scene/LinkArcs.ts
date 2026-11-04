import * as THREE from 'three'
import { appStore } from '../store'
import { EVENTS } from '../data/events'
import { LINKS } from '../data/links'
import { latLonToVec3 } from './latLon'

interface Arc {
  tube: THREE.Mesh
  material: THREE.MeshBasicMaterial
  curve: THREE.QuadraticBezierCurve3
  marker: THREE.Mesh
  markerMaterial: THREE.MeshBasicMaterial
  phase: number
  baseOpacity: number
}

const CAUSE_COLOR = new THREE.Color('#a78bfa') // 前因（过去）紫
const EFFECT_COLOR = new THREE.Color('#22d3ee') // 后果（未来）青
const DEPTH_OPACITY = [0, 0.65, 0.34, 0.16] // 相对选中事件的链路深度 → 弧线透明度
const MAX_DEPTH = 3

/** 选中事件的多跳关联：事件 id → { 深度, 方向 }（方向相对选中事件） */
interface Hop {
  depth: number
  dir: 'cause' | 'effect'
}

/**
 * 事件关联弧线："历史长河"模式 — 以选中事件为原点沿因果图 BFS 至多三跳，
 * 前因紫色、后果青色，透明度随深度衰减，光点只在一跳弧线上流动。
 */
export class LinkArcs {
  readonly root = new THREE.Group()
  private arcs: Arc[] = []
  private currentId: string | null = null
  private readonly reducedMotion: boolean

  constructor(scene: THREE.Scene) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.root.visible = false
    scene.add(this.root)

    appStore.subscribe((s) => {
      if (s.selectedId !== this.currentId) this.showFor(s.selectedId)
    })
  }

  /** 当前可见弧线数（自动化测试用） */
  get count(): number {
    return this.arcs.length
  }

  private showFor(id: string | null): void {
    this.currentId = id
    this.disposeArcs()
    if (!id) {
      this.root.visible = false
      return
    }

    // BFS：沿因果图扩散至多 MAX_DEPTH 跳，方向沿边传播
    const hops = new Map<string, Hop>()
    hops.set(id, { depth: 0, dir: 'cause' })
    let frontier: string[] = [id]
    for (let depth = 1; depth <= MAX_DEPTH && frontier.length > 0; depth++) {
      const next: string[] = []
      for (const cur of frontier) {
        const dir = hops.get(cur)!.dir
        for (const link of LINKS) {
          let other: string | null = null
          let otherDir: 'cause' | 'effect' = dir
          if (link.from === cur) {
            other = link.to
            otherDir = 'effect'
          } else if (link.to === cur) {
            other = link.from
            otherDir = 'cause'
          }
          if (!other || hops.has(other)) continue
          hops.set(other, { depth, dir: otherDir })
          next.push(other)
        }
      }
      frontier = next
    }

    const byId = new Map(EVENTS.map((e) => [e.id, e]))
    for (const [otherId, hop] of hops) {
      if (otherId === id) continue
      const other = byId.get(otherId)
      if (!other) continue
      this.addArc(id, other, hop)
    }

    this.root.visible = this.arcs.length > 0
  }

  private addArc(fromId: string, to: (typeof EVENTS)[number], hop: Hop): void {
    const from = EVENTS.find((e) => e.id === fromId)
    if (!from) return

    const a = latLonToVec3(from.lat, from.lon, 1.01)
    const b = latLonToVec3(to.lat, to.lon, 1.01)
    // 控制点：中点方向抬升，跨度越大抬得越高
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize()
    const angle = a.angleTo(b)
    const lift = 1 + 0.12 + 0.25 * (angle / Math.PI)
    const curve = new THREE.QuadraticBezierCurve3(a, mid.multiplyScalar(lift), b)

    const color = hop.dir === 'effect' ? EFFECT_COLOR : CAUSE_COLOR
    const baseOpacity = DEPTH_OPACITY[Math.min(hop.depth, MAX_DEPTH)]

    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.0035, 6, false), material)

    // 光点只在一跳弧线上流动，避免多跳后画面杂乱
    const withMarker = hop.depth === 1
    const markerMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 10), markerMaterial)
    if (!withMarker) marker.visible = false

    this.root.add(tube, marker)
    this.arcs.push({ tube, material, curve, marker, markerMaterial, phase: Math.random(), baseOpacity })
  }

  private disposeArcs(): void {
    for (const arc of this.arcs) {
      arc.tube.geometry.dispose()
      arc.material.dispose()
      arc.marker.geometry.dispose()
      arc.markerMaterial.dispose()
      this.root.remove(arc.tube, arc.marker)
    }
    this.arcs = []
  }

  update(dt: number, t: number): void {
    if (!this.root.visible) return
    const fadeIn = 1 - Math.exp(-dt * 6)
    const pulse = this.reducedMotion ? 1 : 0.65 + Math.sin(t * 2.4) * 0.2
    for (const arc of this.arcs) {
      arc.material.opacity += (arc.baseOpacity * pulse - arc.material.opacity) * fadeIn
      arc.markerMaterial.opacity += (0.95 - arc.markerMaterial.opacity) * fadeIn
      if (!this.reducedMotion) {
        const u = (t * 0.22 + arc.phase) % 1
        arc.marker.position.copy(arc.curve.getPointAt(u))
      } else {
        arc.marker.position.copy(arc.curve.getPointAt(0.5))
      }
    }
  }
}
