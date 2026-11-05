import * as THREE from 'three'
import { ROUTES, type HistoricalRoute } from '../data/routes'
import { latLonToVec3 } from './latLon'

/**
 * 历史路线层（PHASE B3）：把选中路线沿球面大圆逐段绘制。
 * - 途经点为顶点，相邻点大圆 slerp 插值；跨日期变更线自然连续（向量插值不涉经度回绕）；
 * - 逐段 TubeGeometry（与事件弧线同质感）：全线淡描 + 已播放段高亮；
 * - 途经点节点小球 + 当前播放头（白色光球）；
 * - 播放进度 progress ∈ [0,1] 由面板叙事模式驱动（按弧长归一）。
 */

const ARC_SEGMENTS = 32 // 每段插值数

interface RouteVisual {
  route: HistoricalRoute
  vertices: THREE.Vector3[]
  /** 每段累计弧长占比 */
  cumulative: number[]
  baseTubes: THREE.Mesh[]
  progressTubes: THREE.Mesh[]
  nodeDots: THREE.Mesh[]
  playhead: THREE.Mesh
}

export class RouteArcs {
  readonly root = new THREE.Group()
  private visual: RouteVisual | null = null
  private progress = 0
  private readonly reducedMotion: boolean

  constructor(scene: THREE.Scene) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.root.visible = false
    scene.add(this.root)
  }

  get count(): number {
    return ROUTES.length
  }

  get currentProgress(): number {
    return this.progress
  }

  /** 当前播放头所在途经点索引（叙事模式跳节点用） */
  get currentNodeIndex(): number {
    if (!this.visual) return 0
    const { cumulative } = this.visual
    for (let i = 0; i < cumulative.length; i++) {
      if (this.progress <= cumulative[i] + 1e-6) return i
    }
    return cumulative.length - 1
  }

  /** 大圆 slerp 插值点 */
  private static slerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
    const angle = a.angleTo(b)
    if (angle === 0) return a.clone()
    const sinA = Math.sin((1 - t) * angle)
    const sinB = Math.sin(t * angle)
    return a.clone().multiplyScalar(sinA).add(b.clone().multiplyScalar(sinB)).multiplyScalar(1 / Math.sin(angle))
  }

  /** 显示某条路线（null 隐藏）；进度重置 0 */
  show(routeId: string | null): void {
    this.disposeVisual()
    this.progress = 0
    if (!routeId) {
      this.root.visible = false
      return
    }
    const route = ROUTES.find((r) => r.id === routeId)
    if (!route || route.points.length < 2) return

    const vertices = route.points.map((p) => latLonToVec3(p.lat, p.lon, 1.008))
    const segLens: number[] = []
    for (let i = 0; i < vertices.length - 1; i++) segLens.push(vertices[i].angleTo(vertices[i + 1]))
    const totalLen = segLens.reduce((s, x) => s + x, 0)
    const cumulative: number[] = []
    let acc = 0
    for (const l of segLens) {
      acc += l
      cumulative.push(acc / totalLen)
    }

    const color = new THREE.Color('#f5c97b') // 低饱和金（PHASE E 方向）
    const baseTubes: THREE.Mesh[] = []
    const progressTubes: THREE.Mesh[] = []
    for (let i = 0; i < vertices.length - 1; i++) {
      const pts: THREE.Vector3[] = []
      for (let s = 0; s <= ARC_SEGMENTS; s++) {
        pts.push(RouteArcs.slerp(vertices[i], vertices[i + 1], s / ARC_SEGMENTS).setLength(1.009))
      }
      const curve = new THREE.CatmullRomCurve3(pts)
      const geo = new THREE.TubeGeometry(curve, ARC_SEGMENTS, 0.0042, 6, false)

      const base = new THREE.Mesh(
        geo.clone(),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.28, depthWrite: false }),
      )
      const prog = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false }),
      )
      prog.geometry.setDrawRange(0, 0)
      this.root.add(base, prog)
      baseTubes.push(base)
      progressTubes.push(prog)
    }

    const nodeDots = vertices.map((v) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.0095, 10, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, depthWrite: false }),
      )
      dot.position.copy(v)
      this.root.add(dot)
      return dot
    })

    const playhead = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false }),
    )
    playhead.position.copy(vertices[0]).setLength(1.012)
    this.root.add(playhead)

    this.root.visible = true
    this.visual = { route, vertices, cumulative, baseTubes, progressTubes, nodeDots, playhead }
  }

  /** 设定播放进度 [0,1]：逐段点亮 + 段内 drawRange */
  setProgress(p: number): void {
    this.progress = Math.min(1, Math.max(0, p))
    if (!this.visual) return
    const { progressTubes, playhead, vertices, cumulative } = this.visual
    for (let i = 0; i < progressTubes.length; i++) {
      const segEnd = cumulative[i]
      if (this.progress >= segEnd) {
        progressTubes[i].visible = true
        progressTubes[i].geometry.setDrawRange(0, Infinity)
      } else {
        const segStart = i === 0 ? 0 : cumulative[i - 1]
        const frac = (this.progress - segStart) / (segEnd - segStart)
        if (frac > 0) {
          progressTubes[i].visible = true
          // TubeGeometry index 顺序沿路径：部分显示
          const idxCount = progressTubes[i].geometry.index!.count
          progressTubes[i].geometry.setDrawRange(0, Math.floor(idxCount * frac))
        } else {
          progressTubes[i].visible = false
        }
        break
      }
    }

    // 播放头：当前段内球面插值
    const segIdx = Math.min(cumulative.length - 1, Math.floor(this.progress * cumulative.length))
    const segStart = segIdx === 0 ? 0 : cumulative[segIdx - 1]
    const segEnd = cumulative[segIdx]
    const t = segEnd === segStart ? 0 : (this.progress - segStart) / (segEnd - segStart)
    playhead.position.copy(RouteArcs.slerp(vertices[segIdx], vertices[segIdx + 1], t)).setLength(1.014)
  }

  /** 叙事自动播放：durationSec 秒走完全程 */
  update(dt: number, playing: boolean, durationSec = 30): void {
    if (!this.visual || !playing || this.reducedMotion) return
    if (this.progress < 1) {
      this.setProgress(Math.min(1, this.progress + dt / durationSec))
    }
  }

  private disposeVisual(): void {
    if (!this.visual) return
    const { baseTubes, progressTubes, nodeDots, playhead } = this.visual
    for (const m of [...baseTubes, ...progressTubes, ...nodeDots, playhead]) {
      this.root.remove(m)
      m.geometry.dispose()
      ;(m.material as THREE.Material).dispose()
    }
    this.visual = null
  }

  /** 当前播放头位置（相机跟随用） */
  currentPoint(): THREE.Vector3 | null {
    return this.visual ? this.visual.playhead.position.clone() : null
  }

  pointAt(index: number): THREE.Vector3 | null {
    return this.visual && this.visual.vertices[index] ? this.visual.vertices[index].clone() : null
  }
}
