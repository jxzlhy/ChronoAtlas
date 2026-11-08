import { ROUTES, ROUTE_KINDS, type HistoricalRoute } from '../data/routes'
import { PEOPLE } from '../data/people'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { SOURCES } from '../data/sources'
import { appStore } from '../store'
import type { RoutePoint } from '../data/model'
import { panelIn } from './motion'

/**
 * 历史航线探索面板（PHASE B4/B5）：
 * 路线列表 → 详情（背景/类型/年代/人物/事件/来源/不确定性）→ 播放控制
 * （播放/暂停/重置/节点跳转）。播放中摄像机跟随播放头；用户拖动画布即接管。
 */
export function initRoutesPanel(
  routeArcs: {
    show: (id: string | null) => void
    setProgress: (p: number) => void
    pointAt: (i: number) => { x: number; y: number; z: number } | null
    currentNodeIndex: number
  },
  camera: {
    /** 相机跟随播放头（叙事模式）；用户接管由接管回调触发 */
    follow: (point: { x: number; y: number; z: number }) => void
    flyTo: (lat: number, lon: number, dist?: number, duration?: number) => void
    onUserDrag: (cb: () => void) => void
    /** 面板侧结束跟随（暂停/关闭/重置）时恢复相机控制 */
    release: () => void
  },
  onGoEvent: (eventId: string) => void,
  onOpenPerson: (personId: string) => void,
): {
    isPlaying: () => boolean
    pause: () => void
    /** 播放状态变化通知（main 用于热区密度波联动） */
    setPlayingListener: (cb: (v: boolean) => void) => void
  } {
  // 播放状态变化通知（main 用于热区密度波联动）
  const onPlayingChange = (v: boolean): void => {
    routePanelStateRef.isPlaying = () => v
  }
  const routePanelStateRef: { isPlaying: () => boolean } = { isPlaying: () => false }
  void routePanelStateRef
  const toggle = document.getElementById('routes-toggle') as HTMLButtonElement
  const panel = document.getElementById('routes-panel') as HTMLElement
  const list = document.getElementById('routes-list') as HTMLElement
  const detail = document.getElementById('routes-detail') as HTMLElement

  let open = false
  let current: HistoricalRoute | null = null
  let playing = false
  let progress = 0
  let raf = 0
  let lastTs = 0
  let suppressStore = false // 面板内部选择时避免与 store 订阅回环

  const setOpen = (v: boolean): void => {
    open = v
    panel.hidden = !v
    toggle.setAttribute('aria-expanded', String(v))
    toggle.classList.toggle('is-open', v)
    appStore.getState().selectRoute(v ? (current?.id ?? null) : null)
    if (!v) {
      playing = false
      cancelAnimationFrame(raf)
      camera.release()
      routeArcs.show(null)
    }
  }
  toggle.addEventListener('click', () => setOpen(!open))
  panel.querySelector('[data-routes-close]')?.addEventListener('click', () => setOpen(false))
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false)
  })

  const kindBadge = (id: keyof typeof ROUTE_KINDS): string => {
    const k = ROUTE_KINDS[id]
    return `<span class="rp-kind" style="--k:${k.color}">${k.zh} · ${k.en}</span>`
  }

  const renderList = (): void => {
    list.innerHTML = ROUTES.map(
      (r) => `
        <button class="rp-row${current?.id === r.id ? ' is-active' : ''}" type="button" data-route="${r.id}"
                title="${r.name.en}">
          <span class="rp-dot" style="--k:${ROUTE_KINDS[r.kind].color}" aria-hidden="true"></span>
          <span class="rp-main">
            <span class="rp-title">${r.name.zh}</span>
            <span class="rp-sub">${r.name.en}</span>
          </span>
          <span class="rp-meta">${r.start < 0 ? `${-r.start} BCE` : `${r.start}`} · ${ROUTE_KINDS[r.kind].zh}</span>
        </button>`,
    ).join('')
  }

  const select = (id: string): void => {
    current = ROUTES.find((r) => r.id === id) ?? null
    playing = false
    progress = 0
    routeArcs.show(current?.id ?? null)
    // 同步 store → URL hash rt= 参数（PHASE F4 分享恢复）
    suppressStore = true
    appStore.getState().selectRoute(current?.id ?? null)
    suppressStore = false
    renderList()
    renderDetail()
    if (current) {
      const p0 = current.points[0]
      camera.flyTo(p0.lat, p0.lon, 2.6, 1.2)
    }
  }

  const renderDetail = (): void => {
    if (!current) {
      detail.hidden = true
      return
    }
    const k = ROUTE_KINDS[current.kind]
    const persons = (current.personIds ?? [])
      .map((pid) => PEOPLE.find((x) => x.id === pid))
      .filter((x) => x !== undefined)
    const events = (current.eventIds ?? [])
      .map((eid) => EVENTS.find((x) => x.id === eid))
      .filter((x) => x !== undefined)
    const sources = current.sourceIds
      .map((sid) => SOURCES.find((x) => x.id === sid))
      .filter((x) => x !== undefined)

    detail.hidden = false
    detail.innerHTML = `
      <div class="rp-head2">
        <span class="rp-title2">${current.name.zh}</span>
        <span class="rp-title2-en">${current.name.en}</span>
        ${kindBadge(current.kind)}
      </div>
      <p class="rp-desc">${current.desc.zh}</p>
      <p class="rp-desc-en">${current.desc.en}</p>
      <div class="rp-facts">
        <span>年代 · Era：${current.start < 0 ? `公元前 ${-current.start} 年` : `公元 ${current.start} 年`} – ${current.end < 0 ? `公元前 ${-current.end} 年` : `公元 ${current.end} 年`}</span>
        <span>时期 · Period：${current.era.zh} · ${current.era.en}</span>
      </div>
      ${
        current.uncertainty
          ? `<p class="rp-uncertain">⚠ ${current.uncertainty.zh}<span class="rp-uncertain-en">${current.uncertainty.en}</span></p>`
          : ''
      }
      ${
        persons.length > 0
          ? `<div class="rp-links-label">相关人物 · Figures</div><div class="rp-chips">${persons
              .map(
                (x) =>
                  `<button class="ec-chip ec-chip--person" type="button" data-person="${x.id}">${x.name.zh}</button>`,
              )
              .join('')}</div>`
          : ''
      }
      ${
        events.length > 0
          ? `<div class="rp-links-label">关联事件 · Events</div><div class="rp-chips">${events
              .map(
                (x) =>
                  `<button class="ec-chip ec-chip--effect" type="button" data-event="${x.id}" style="--chip-color:${EVENT_TYPES[x.type].color}">${x.title.zh}</button>`,
              )
              .join('')}</div>`
          : ''
      }
      <div class="rp-links-label">播放 · Playback</div>
      <div class="rp-controls">
        <button class="rp-play" type="button" data-play>${playing ? '⏸ 暂停' : '▶ 播放叙事'}</button>
        <button class="rp-reset" type="button" data-reset>↺ 重置</button>
        <span class="rp-progress-label" id="rp-progress">0%</span>
      </div>
      <div class="rp-stops">
        ${current.points
          .map(
            (pt, i) =>
              `<button class="rp-stop" type="button" data-stop="${i}">
                 <span class="rp-stop-idx">${i + 1}</span>
                 <span class="rp-stop-name">${pt.name.zh}<span class="rp-stop-en">${pt.name.en}</span></span>
                 ${pt.year !== undefined ? `<span class="rp-stop-year">${pt.year < 0 ? `${-pt.year} BCE` : pt.year}</span>` : ''}
               </button>`,
          )
          .join('')}
      </div>
      <div class="rp-links-label">参考资料 · Sources</div>
      <ul class="ec-sources">
        ${sources
          .map(
            (s) =>
              `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name.zh}<span class="ec-source-pub">${s.publisher.zh}</span></a></li>`,
          )
          .join('')}
      </ul>`
  }

  // ---- 播放循环（叙事模式）：进度推进 + 相机跟随 ----
  const tick = (ts: number): void => {
    if (!playing || !current) return
    if (lastTs === 0) lastTs = ts
    const dt = Math.min((ts - lastTs) / 1000, 0.1)
    lastTs = ts
    progress = Math.min(1, progress + dt / 30)
    routeArcs.setProgress(progress)
    const pt = routeArcs.pointAt(routeArcs.currentNodeIndex) ?? routeArcs.pointAt(0)
    if (pt) camera.follow(pt)
    const label = document.getElementById('rp-progress')
    if (label) label.textContent = `${Math.round(progress * 100)}%`
    if (progress >= 1) {
      playing = false
      const btn = detail.querySelector('[data-play]')
      if (btn) btn.textContent = '▶ 重播'
      return
    }
    raf = requestAnimationFrame(tick)
  }

  let playingListener: ((v: boolean) => void) | null = null
  const startPlay = (): void => {
    if (!current) return
    if (progress >= 1) progress = 0
    playing = true
    lastTs = 0
    playingListener?.(true)
    raf = requestAnimationFrame(tick)
    renderDetail()
  }
  const pausePlay = (): void => {
    playing = false
    playingListener?.(false)
    cancelAnimationFrame(raf)
    camera.release()
    renderDetail()
  }

  // ---- 面板事件 ----
  list.addEventListener('click', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-route]')
    if (row?.dataset.route) select(row.dataset.route)
  })

  detail.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-play]')) {
      playing ? pausePlay() : startPlay()
      return
    }
    if (target.closest('[data-reset]')) {
      progress = 0
      playing = false
      camera.release()
      routeArcs.setProgress(0)
      renderDetail()
      const p0 = current?.points[0]
      if (p0) camera.flyTo(p0.lat, p0.lon, 2.1, 1.0)
      return
    }
    const stop = target.closest<HTMLElement>('[data-stop]')
    if (stop?.dataset.stop && current) {
      const i = Number(stop.dataset.stop)
      const pts = current.points
      // 节点 i 的弧长比例 ≈ i/(n-1)
      const p = i / Math.max(pts.length - 1, 1)
      progress = p
      routeArcs.setProgress(p)
      camera.flyTo(pts[i].lat, pts[i].lon, 2.0, 1.0)
      const label = document.getElementById('rp-progress')
      if (label) label.textContent = `${Math.round(progress * 100)}%`
      return
    }
    const personBtn = target.closest<HTMLElement>('[data-person]')
    if (personBtn?.dataset.person) {
      pausePlay()
      onOpenPerson(personBtn.dataset.person)
      return
    }
    const eventBtn = target.closest<HTMLElement>('[data-event]')
    if (eventBtn?.dataset.event) {
      pausePlay()
      onGoEvent(eventBtn.dataset.event)
      return
    }
  })

  // 用户拖动地球 → 停止相机跟随（保留播放），"随时接管摄像机"
  camera.onUserDrag(() => {
    if (playing) playing = false
    cancelAnimationFrame(raf)
    if (detail.querySelector('[data-play]')) renderDetail()
  })

  renderList()

  // store 订阅：URL rt= 恢复时自动选中（suppressStore 防内部选择回环）
  appStore.subscribe((s) => {
    if (suppressStore) return
    if (s.selectedRouteId && s.selectedRouteId !== current?.id) {
      if (!open) setOpen(true)
      select(s.selectedRouteId)
    }
  })

  return {
    isPlaying: () => playing,
    pause: pausePlay,
    setPlayingListener: (cb: (v: boolean) => void) => {
      playingListener = cb
    },
  }
}
