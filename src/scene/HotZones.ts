import * as THREE from 'three'
import { appStore, isActive, matchesFilters } from '../store'
import { EVENTS } from '../data/events'
import { latLonToVec3 } from './latLon'

interface Cluster {
  lat: number
  lon: number
  count: number
  /** 簇内重要度最高的事件（点击下钻目标） */
  topId: string
}

interface Zone {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  opacity: number
  /** 透明度目标（update 每帧逼近） */
  target: number
}

const CELL = 15 // 聚类网格边长（度）
const MIN_COUNT = 2 // 少于该数的格子不生成热区（单事件由棱柱表达）
const MAX_ZONES = 28 // 复用池上限

/**
 * 历史热区模式（V1.0-M3 II）：把当前年份窗口+筛选下的活跃事件按网格聚类，
 * 在密集处生成贴地光晕（大小/亮度随事件数），点击光晕下钻到簇内代表事件。
 * ⚠️ 表达的是"已收录事件的空间密度"，不是真实历史事件发生概率（UI 有标注）。
 */
export class HotZones {
  readonly root = new THREE.Group()
  private zones: Zone[] = []
  private pickables: THREE.Mesh[] = []
  private raycaster = new THREE.Raycaster()
  private texture: THREE.Texture
  private reducedMotion: boolean
  private clusters: Cluster[] = []
  /** 航线叙事播放中标志（routesPanel 经 main 注入） */
  narrativePlaying = false

  constructor(scene: THREE.Scene) {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.texture = HotZones.makeGlowTexture()
    for (let i = 0; i < MAX_ZONES; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: this.texture,
        color: 0x22d3ee,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
      mesh.visible = false
      mesh.userData.zoneIndex = i
      this.root.add(mesh)
      this.zones.push({ mesh, material, opacity: 0, target: 0 })
      this.pickables.push(mesh)
    }
    this.root.visible = false
    scene.add(this.root)

    appStore.subscribe(() => this.recalc())
    this.recalc()
  }

  /** 径向渐变光晕贴图（模块生命周期内共享一张） */
  private static makeGlowTexture(): THREE.Texture {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }

  /** 网格聚类当前活跃事件，返回密度达标（≥MIN_COUNT）的簇，按密度降序 */
  private computeClusters(): Cluster[] {
    const s = appStore.getState()
    const cells = new Map<string, { latSum: number; lonSum: number; count: number; topId: string; topImp: number; weight: number }>()
    // 时代视角下：时代核心段事件权重 ×1.5（密度波集中于"段落"）
    const eraBoost = (ev: (typeof EVENTS)[number]): number => {
      if (!s.hotspotsEraBoost) return 1
      return ev.start >= s.year - 10 && ev.end <= s.year + 10 ? 1.5 : 0.6
    }
    for (const ev of EVENTS) {
      if (!isActive(ev, s.year, s.windowSize) || !matchesFilters(ev, s)) continue
      const boost = eraBoost(ev)
      if (boost === 0) continue
      const key = `${Math.floor((ev.lat + 90) / CELL)}:${Math.floor((ev.lon + 180) / CELL)}`
      const cell = cells.get(key) ?? { latSum: 0, lonSum: 0, count: 0, topId: ev.id, topImp: 0, weight: 0 }
      cell.latSum += ev.lat * boost
      cell.lonSum += ev.lon * boost
      cell.weight += boost
      cell.count++
      // topId 按 importance×boost 加权选择（时代视角下核心事件优先成为下钻目标）
      const score = ev.importance * boost
      if (score > cell.topImp || (score === cell.topImp && boost > 1 && !cells.get(key))) {
        cell.topImp = score
        cell.topId = ev.id
      }
      cells.set(key, cell)
    }
    return [...cells.values()]
      .filter((c) => c.weight >= MIN_COUNT)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_ZONES)
      .map((c) => ({ lat: c.latSum / c.weight, lon: c.lonSum / c.weight, count: Math.round(c.weight), topId: c.topId }))
  }

  private recalc(): void {
    const s = appStore.getState()
    if (!s.hotspotsOn) {
      this.root.visible = false
      return
    }
    this.root.visible = true
    this.clusters = this.computeClusters()

    for (let i = 0; i < this.zones.length; i++) {
      const zone = this.zones[i]
      const cluster = this.clusters[i]
      if (!cluster) {
        zone.target = 0
        continue
      }
      const surface = latLonToVec3(cluster.lat, cluster.lon, 1.006)
      const normal = surface.clone().normalize()
      zone.mesh.position.copy(surface)
      zone.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
      const size = 0.16 + 0.045 * Math.min(cluster.count, 8)
      zone.mesh.scale.setScalar(size)
      zone.target = Math.min(0.62, 0.2 + 0.055 * cluster.count)
    }
  }

  /** 屏幕坐标拾取，返回簇内代表事件 id 或 null */
  pick(clientX: number, clientY: number, camera: THREE.Camera, canvas: HTMLElement): string | null {
    if (!this.root.visible) return null
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const ndc = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(ndc, camera)
    const visible = this.pickables.filter((m) => m.visible)
    const hits = this.raycaster.intersectObjects(visible, false)
    if (hits.length === 0) return null
    const idx = hits[0].object.userData.zoneIndex as number
    return this.clusters[idx]?.topId ?? null
  }

  /**
   * 每帧更新：透明度逼近目标 + 呼吸脉动。
   * 播放联动（PHASE）：自动播放或航线叙事播放中，各簇随"本簇事件距当前
   * 年份的偏移"产生相位差呼吸——密度波随时间推移在地球上流动。
   */
  update(_dt: number, t: number, narrativeOverride?: boolean): void {
    if (!this.root.visible) return
    const k = 1 - Math.exp(-_dt * 5)
    const s = appStore.getState()
    const playing = s.playing || this.narrativePlaying || narrativeOverride === true
    for (const zone of this.zones) {
      if (zone.target === 0 && zone.opacity < 0.01) {
        zone.mesh.visible = false
        continue
      }
      zone.mesh.visible = true
      zone.opacity += (zone.target - zone.opacity) * k
      // 播放联动：按簇在 zones 数组中的序号产生相位差（密度波流动感）
      const zonePhase = (this.zones.findIndex((z) => z === zone) * 0.9) % (Math.PI * 2)
      const wave = playing && !this.reducedMotion ? 0.82 + Math.sin(t * 2.6 + zonePhase) * 0.18 : 1
      const pulse = this.reducedMotion ? 1 : 0.9 + Math.sin(t * 1.8) * 0.1
      zone.material.opacity = zone.opacity * pulse * wave
    }
  }

  /** 释放共享资源（显式释放以备场景重建） */
  dispose(): void {
    this.texture.dispose()
    for (const zone of this.zones) {
      zone.mesh.geometry.dispose()
      zone.material.dispose()
    }
  }
}
