import './styles.css'
import * as THREE from 'three'
import { Globe } from './scene/Globe'
import { EventPillars } from './scene/EventPillars'
import { CameraRig } from './scene/CameraRig'
import { LinkArcs } from './scene/LinkArcs'
import { HotZones } from './scene/HotZones'
import { appStore, isActive, matchesFilters, YEAR_MAX, YEAR_MIN, type HistoryEvent } from './store'
import { EVENTS, CONTINENTS } from './data/events'
import { LINKS } from './data/links'
import { PEOPLE } from './data/people'
import { initTimeline } from './ui/timeline'
import { initSearch } from './ui/search'
import { initEventCard } from './ui/eventCard'
import { initPersonCard } from './ui/personCard'
import { initContinents } from './ui/continents'
import { initLegend } from './ui/legend'
import { initSnapshot } from './ui/snapshot'
import { initNetwork } from './ui/network'

function boot(): void {
  const container = document.getElementById('scene-container') as HTMLElement
  const loadingEl = document.getElementById('loading') as HTMLElement
  const errorEl = document.getElementById('webgl-error') as HTMLElement

  let globe: Globe
  try {
    globe = new Globe(container)
  } catch (err) {
    console.error('[ChronoAtlas] WebGL 初始化失败:', err)
    errorEl.hidden = false
    loadingEl.classList.add('done')
    return
  }

  const pillars = new EventPillars(globe.scene)
  const rig = new CameraRig(globe.camera, globe.controls)
  const arcs = new LinkArcs(globe.scene)
  const hotspots = new HotZones(globe.scene)

  // ---- URL hash 状态还原（分享链接 #y=1850&ev=<id>&p=<人物>）----
  {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const s = appStore.getState()
    if (params.has('y')) {
      const y = Number(params.get('y'))
      if (Number.isInteger(y) && y >= YEAR_MIN && y <= YEAR_MAX) s.setYear(y)
    }
    const evId = params.get('ev')
    if (evId && EVENTS.some((e) => e.id === evId)) s.select(evId)
    const pId = params.get('p')
    if (pId && PEOPLE.some((x) => x.id === pId)) s.selectPerson(pId)
  }
  // store → hash（replaceState，不打断导航）
  {
    let lastHash = ''
    appStore.subscribe((s) => {
      const p = new URLSearchParams()
      p.set('y', String(s.year))
      if (s.selectedId) p.set('ev', s.selectedId)
      if (s.selectedPersonId) p.set('p', s.selectedPersonId)
      const h = `#${p.toString()}`
      if (h !== lastHash) {
        lastHash = h
        window.history.replaceState(null, '', h)
      }
    })
  }

  // ---- 拾取：区分拖拽与点击 ----
  let downPoint: { x: number; y: number } | null = null
  const canvas = globe.renderer.domElement
  canvas.style.cursor = 'grab'

  canvas.addEventListener('pointerdown', (e) => {
    downPoint = { x: e.clientX, y: e.clientY }
    canvas.style.cursor = 'grabbing'
  })

  window.addEventListener('pointerup', (e) => {
    canvas.style.cursor = appStore.getState().hoverId ? 'pointer' : 'grab'
    if (!downPoint) return
    const dx = e.clientX - downPoint.x
    const dy = e.clientY - downPoint.y
    downPoint = null
    if (dx * dx + dy * dy > 64) return // 视为拖拽

    const id = pillars.pick(e.clientX, e.clientY, globe.camera, canvas) ?? hotspots.pick(e.clientX, e.clientY, globe.camera, canvas)
    const state = appStore.getState()
    if (id) {
      const ev = EVENTS.find((x) => x.id === id)
      if (!ev) return
      state.select(id)
      // 保持当前观察距离，但收敛到舒适区间
      const dist = Math.min(Math.max(globe.camera.position.length(), 1.8), 2.7)
      rig.flyTo(ev.lat, ev.lon, dist, 0.9)
    } else if (state.selectedId) {
      state.select(null)
    }
  })

  // ---- 悬停高亮（节流） ----
  let lastHover = 0
  canvas.addEventListener('pointermove', (e) => {
    const now = performance.now()
    if (now - lastHover < 70) return
    lastHover = now
    const id = pillars.pick(e.clientX, e.clientY, globe.camera, canvas) ?? hotspots.pick(e.clientX, e.clientY, globe.camera, canvas)
    if (id !== appStore.getState().hoverId) {
      appStore.getState().setHover(id)
    }
    if (!downPoint) canvas.style.cursor = id ? 'pointer' : 'grab'
  })

  // ---- 大洲定位 ----
  initContinents((key) => {
    const c = CONTINENTS[key]
    if (c) rig.flyTo(c.lat, c.lon, c.dist)
  })

  // ---- 事件跳转（搜索/切片/关联链共用）：事件不在当前时间窗口内时，把年份带到事件起点 ----
  const goToEvent = (ev: HistoryEvent): void => {
    const s = appStore.getState()
    if (!isActive(ev, s.year, s.windowSize) && s.windowSize < 9999) {
      s.setYear(ev.start)
    }
    s.select(ev.id)
    rig.flyTo(ev.lat, ev.lon, 2.0, 1.0)
  }
  initSearch(goToEvent, (pid) => {
    appStore.getState().selectPerson(pid)
  })

  // ---- 事件卡片（chips 沿链跳转复用 goToEvent）----
  initEventCard(
    (ev) => rig.flyTo(ev.lat, ev.lon, 1.8, 0.9),
    goToEvent,
  )

  // ---- 人物档案卡（人物作为独立探索入口）----
  initPersonCard(goToEvent)

  // 网络浮层打开时暂停地球渲染循环（浮层全遮挡，省电）
  const pauseRender = (): void => globe.renderer.setAnimationLoop(null)
  const resumeRender = (): void => globe.renderer.setAnimationLoop(renderLoop)

  // ---- 随机发现（尊重当前时间窗口与快照筛选；排除最近 5 个避免连续重复）----
  const recentRandom: string[] = []
  ;(document.getElementById('random-btn') as HTMLButtonElement).addEventListener('click', () => {
    const s = appStore.getState()
    const pool = EVENTS.filter((ev) => isActive(ev, s.year, s.windowSize) && matchesFilters(ev, s))
    const source = pool.length > 0 ? pool : EVENTS
    const fresh = source.filter((ev) => !recentRandom.includes(ev.id))
    const candidates = fresh.length > 0 ? fresh : source
    const ev = candidates[Math.floor(Math.random() * candidates.length)]
    recentRandom.push(ev.id)
    if (recentRandom.length > 5) recentRandom.shift()
    s.select(ev.id)
    rig.flyTo(ev.lat, ev.lon, 2.0, 1.1)
  })

  initTimeline()
  initLegend()
  initNetwork(pauseRender, resumeRender)

  // ---- 全局键盘快捷键（输入框/下拉内不触发；/ 聚焦搜索与 ←→ 年份在各自模块）----
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement)
    ) {
      return
    }
    const s = appStore.getState()
    if (e.key === 'n' || e.key === 'N') {
      ;(document.getElementById('network-toggle') as HTMLButtonElement)?.click()
    } else if (e.key === 'h' || e.key === 'H') {
      s.setHotspotsOn(!s.hotspotsOn)
    } else if (e.key === 'r' || e.key === 'R') {
      ;(document.getElementById('random-btn') as HTMLButtonElement)?.click()
    }
  })
  // 世界快照面板：onGo 跳转事件；大洲 chip 复用大洲导航的飞行参数
  initSnapshot(goToEvent, (key) => {
    const c = CONTINENTS[key]
    if (c) rig.flyTo(c.lat, c.lon, c.dist)
  })

  // ---- 主循环 ----
  const clock = new THREE.Clock()
  const renderLoop = (): void => {
    const dt = Math.min(clock.getDelta(), 0.05)
    globe.update(dt)
    pillars.update(dt, clock.elapsedTime)
    arcs.update(dt, clock.elapsedTime)
    hotspots.update(dt, clock.elapsedTime)
    globe.render()
  }
  globe.renderer.setAnimationLoop(renderLoop)

  // 调试/自动化测试钩子：暂停渲染以便截图，或直接驱动状态
  ;(window as unknown as Record<string, unknown>).__chrono = {
    pause: () => globe.renderer.setAnimationLoop(null),
    resume: () => globe.renderer.setAnimationLoop(renderLoop),
    /** 完整跳转：定位 + 选中（与搜索/切片行点击同一路径） */
    goTo: (id: string) => {
      const ev = EVENTS.find((e) => e.id === id)
      if (ev) goToEvent(ev)
    },
    /** 当前弧线数（自动化断言用） */
    arcsCount: () => arcs.count,
    /** 当前可见热区数（自动化断言用） */
    hotspotsCount: () =>
      hotspots.root.visible
        ? hotspots.root.children.filter((c) => (c as THREE.Mesh).visible).length
        : 0,
    /** 渲染性能摘要（自动化基线记录用，总任务书 §6.6 先测量再优化） */
    perf: () => {
      const info = globe.renderer.info
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory
      return {
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length ?? 0,
        heapMB: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
      }
    },
    /** 手动渲染一帧并导出 JPEG dataURL（同一任务内调用，缓冲区未被清除） */
    capture: (maxWidth = 1280) => {
      renderLoop()
      const src = globe.renderer.domElement
      const scale = Math.min(1, maxWidth / src.width)
      const out = document.createElement('canvas')
      out.width = Math.round(src.width * scale)
      out.height = Math.round(src.height * scale)
      const ctx = out.getContext('2d')!
      ctx.drawImage(src, 0, 0, out.width, out.height)
      return out.toDataURL('image/jpeg', 0.82)
    },
    store: appStore,
    events: EVENTS,
    links: LINKS,
  }

  // ---- 就绪：收起加载层，入场飞行 ----
  void Promise.all([globe.ready, new Promise((r) => setTimeout(r, 900))]).then(() => {
    loadingEl.classList.add('done')
    document.body.classList.add('ready')
    rig.flyTo(22, 12, 3.0, 2.4)
    window.setTimeout(() => loadingEl.remove(), 900)
  })
}

boot()
