import './styles.css'
import * as THREE from 'three'
import { Globe } from './scene/Globe'
import { EventPillars } from './scene/EventPillars'
import { CameraRig } from './scene/CameraRig'
import { LinkArcs } from './scene/LinkArcs'
import { HotZones } from './scene/HotZones'
import { RouteArcs } from './scene/RouteArcs'
import { PersonMarkers } from './scene/PersonMarkers'
import { appStore, isActive, matchesFilters, YEAR_MAX, YEAR_MIN, type HistoryEvent } from './store'
import { EVENTS, CONTINENTS } from './data/events'
import { LINKS } from './data/links'
import { PEOPLE } from './data/people'
import { ROUTES } from './data/routes'
import { initTimeline } from './ui/timeline'
import { initSearch } from './ui/search'
import { initEventCard, getCompassEl } from './ui/eventCard'
import { initPersonCard, getPersonCompassEl } from './ui/personCard'
import { initContinents } from './ui/continents'
import { initLegend } from './ui/legend'
import { initSnapshot } from './ui/snapshot'
import { initNetwork } from './ui/network'
import { initRoutesPanel } from './ui/routesPanel'
import { playSelect, playFly } from './ui/sound'

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
  const routeArcs = new RouteArcs(globe.scene)
  const personMarkers = new PersonMarkers(globe.scene)

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
    const rtId = params.get('rt')
    if (rtId && ROUTES.some((x) => x.id === rtId)) s.selectRoute(rtId)
  }
  // store → hash（replaceState，不打断导航）；boot 时也写回一次以清理无效参数
  {
    let lastHash = ''
    const writeHash = (): void => {
      const s = appStore.getState()
      const p = new URLSearchParams()
      p.set('y', String(s.year))
      if (s.selectedId) p.set('ev', s.selectedId)
      if (s.selectedPersonId) p.set('p', s.selectedPersonId)
      if (s.selectedRouteId) p.set('rt', s.selectedRouteId)
      const h = `#${p.toString()}`
      if (h !== lastHash) {
        lastHash = h
        window.history.replaceState(null, '', h)
      }
    }
    appStore.subscribe(writeHash)
    writeHash()
  }

  // ---- 拾取：区分拖拽与点击 ----
  let downPoint: { x: number; y: number } | null = null
  const canvas = globe.renderer.domElement
  canvas.style.cursor = 'grab'

  canvas.addEventListener('pointerdown', (e) => {
    downPoint = { x: e.clientX, y: e.clientY }
    canvas.style.cursor = 'grabbing'
    // 用户拖动地球 → 历史航线播放中接管镜头
    onRouteUserDrag?.()
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
      if (state.soundOn) playSelect()
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
    if (s.soundOn) playFly()
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

  // ---- 人物档案卡（PHASE C1：活动地图紫点 + 地点点击飞往）----
  initPersonCard(
    goToEvent,
    (lat, lon) => rig.flyTo(lat, lon, 2.0, 1.0),
    (places) => personMarkers.setPlaces(places),
  )

  // 网络浮层打开时暂停地球渲染循环（浮层全遮挡，省电）
  const pauseRender = (): void => globe.renderer.setAnimationLoop(null)
  const resumeRender = (): void => globe.renderer.setAnimationLoop(renderLoop)

  // ---- 历史航线面板（PHASE B4/B5）：播放跟随 + 用户拖动接管 ----
  let routeFollow = false
  let onRouteUserDrag: (() => void) | null = null
  initRoutesPanel(
    routeArcs,
    {
      follow: (point) => {
        // 叙事跟随：相机沿播放头方向定位，保持当前距离，北极恒朝上
        rig.kill()
        routeFollow = true
        globe.controls.enabled = false
        const dist = Math.min(Math.max(globe.camera.position.length(), 1.9), 2.7)
        globe.camera.position.set(point.x, point.y, point.z).setLength(dist)
        globe.camera.lookAt(0, 0, 0)
        globe.controls.update()
      },
      flyTo: (lat, lon, dist = 2.1, duration = 1.2) => rig.flyTo(lat, lon, dist, duration),
      onUserDrag: (cb) => {
        onRouteUserDrag = cb
      },
      release: () => {
        if (routeFollow) {
          routeFollow = false
          globe.controls.enabled = true
        }
      },
    },
    (eventId) => {
      const ev = EVENTS.find((x) => x.id === eventId)
      if (ev) goToEvent(ev)
    },
    (personId) => appStore.getState().selectPerson(personId),
  )

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
    if (s.soundOn) {
      playSelect()
      playFly()
    }
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
    } else if (e.key === 'p' || e.key === 'P') {
      ;(document.getElementById('slice-toggle') as HTMLButtonElement)?.click()
    } else if (e.key === 'j' || e.key === 'J') {
      ;(document.getElementById('routes-toggle') as HTMLButtonElement)?.click()
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
    // 卡片罗盘：指向选中棱柱（事件卡=选中事件；人物卡=人物主事件）
    const s2 = appStore.getState()
    const compassEl = getCompassEl()
    const personCompass = getPersonCompassEl()
    if (personCompass && s2.selectedPersonId) {
      const person = PEOPLE.find((x) => x.id === s2.selectedPersonId)
      const anchorId = person?.eventIds[0]
      const target = anchorId ? pillars.projectScreen(anchorId, globe.camera, globe.renderer.domElement) : null
      if (target) {
        const cardRect = personCompass.parentElement!.getBoundingClientRect()
        const angle =
          (Math.atan2(target.y - (cardRect.top + 40), target.x - (cardRect.left + cardRect.width / 2)) * 180) / Math.PI +
          90
        personCompass.style.setProperty('--ec-angle', `${angle.toFixed(1)}deg`)
        personCompass.hidden = false
      } else {
        personCompass.hidden = true
      }
    } else if (compassEl && s2.selectedId) {
      const target = pillars.projectScreen(s2.selectedId, globe.camera, globe.renderer.domElement)
      if (target) {
        const cardRect = compassEl.parentElement!.getBoundingClientRect()
        const cx = cardRect.left + cardRect.width / 2
        const cy = cardRect.top + 40
        const angle = (Math.atan2(target.y - cy, target.x - cx) * 180) / Math.PI + 90
        compassEl.style.setProperty('--ec-angle', `${angle.toFixed(1)}deg`)
        const dist = Math.hypot(target.x - cx, target.y - cy)
        compassEl.title = `指向事件棱柱（${Math.round(dist)}px） · Points to the pillar`
        compassEl.hidden = false
      } else {
        compassEl.hidden = true
      }
    }
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
