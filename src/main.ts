import './styles.css'
import * as THREE from 'three'
import { Globe } from './scene/Globe'
import { EventPillars } from './scene/EventPillars'
import { CameraRig } from './scene/CameraRig'
import { LinkArcs } from './scene/LinkArcs'
import { appStore, isActive, matchesFilters, YEAR_MAX, YEAR_MIN, type HistoryEvent } from './store'
import { EVENTS, CONTINENTS } from './data/events'
import { LINKS } from './data/links'
import { initTimeline } from './ui/timeline'
import { initSearch } from './ui/search'
import { initEventCard } from './ui/eventCard'
import { initContinents } from './ui/continents'
import { initLegend } from './ui/legend'
import { initSnapshot } from './ui/snapshot'

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

  // ---- URL hash 状态还原（分享链接 #y=1850&ev=<id>）----
  {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const s = appStore.getState()
    if (params.has('y')) {
      const y = Number(params.get('y'))
      if (Number.isInteger(y) && y >= YEAR_MIN && y <= YEAR_MAX) s.setYear(y)
    }
    const evId = params.get('ev')
    if (evId && EVENTS.some((e) => e.id === evId)) s.select(evId)
  }
  // store → hash（replaceState，不打断导航）
  {
    let lastHash = ''
    appStore.subscribe((s) => {
      const p = new URLSearchParams()
      p.set('y', String(s.year))
      if (s.selectedId) p.set('ev', s.selectedId)
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

    const id = pillars.pick(e.clientX, e.clientY, globe.camera, canvas)
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
    const id = pillars.pick(e.clientX, e.clientY, globe.camera, canvas)
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
  initSearch(goToEvent)

  // ---- 事件卡片（chips 沿链跳转复用 goToEvent）----
  initEventCard(
    (ev) => rig.flyTo(ev.lat, ev.lon, 1.8, 0.9),
    goToEvent,
  )

  // ---- 随机发现（尊重当前时间窗口与快照筛选）----
  ;(document.getElementById('random-btn') as HTMLButtonElement).addEventListener('click', () => {
    const s = appStore.getState()
    const pool = EVENTS.filter((ev) => isActive(ev, s.year, s.windowSize) && matchesFilters(ev, s))
    const source = pool.length > 0 ? pool : EVENTS
    const ev = source[Math.floor(Math.random() * source.length)]
    s.select(ev.id)
    rig.flyTo(ev.lat, ev.lon, 2.0, 1.1)
  })

  initTimeline()
  initLegend()
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
