import { appStore, isActive, matchesFilters, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { ERA_BANDS, eraOf } from '../data/eras'
import { panelIn } from './motion'
import { setEraSpanYear } from './timeline'
import { CIVILIZATIONS } from '../data/model'
import type { ContinentKey, EventType } from '../data/model'

/** 文明标签展示名（PHASE D） */
const CIV_LABEL: Record<string, { zh: string; en: string }> = {
  chinese: { zh: '中华', en: 'Chinese' },
  ottoman: { zh: '奥斯曼', en: 'Ottoman' },
  european: { zh: '欧洲', en: 'European' },
  russian: { zh: '俄罗斯', en: 'Russian' },
  indian: { zh: '印度', en: 'Indian' },
  japanese: { zh: '日本', en: 'Japanese' },
  african: { zh: '非洲', en: 'African' },
  'latin-american': { zh: '拉美', en: 'Latin America' },
  'north-american': { zh: '北美', en: 'North America' },
  'islamic-world': { zh: '伊斯兰', en: 'Islamic World' },
}

/**
 * 世界快照面板（V1.0-M2）：年份驱动的时代切片。
 * - 头部：公元年份 + 时代名 + 一句话时代背景
 * - 年份概览：类型统计 chips（可筛选）
 * - 大洲概览：有活跃事件的各大洲 chips（点击飞往 + 筛选）
 * - 排序切换：重要度 / 时间 / 地理 / 类型
 * - 事件列表：点击定位，悬停联动地球
 * 类型/大洲筛选写入全局 store（联动地球棱柱明暗与随机发现）；
 * 排序为面板局部 UI 状态。二者均不进 URL。
 */

type SortBy = 'importance' | 'time' | 'geo' | 'type'
type ViewMode = 'list' | 'sync' | 'civ'

const SORT_LABEL: Record<SortBy, { zh: string; en: string }> = {
  importance: { zh: '重要度', en: 'Importance' },
  time: { zh: '时间', en: 'Time' },
  geo: { zh: '地理', en: 'Geography' },
  type: { zh: '类型', en: 'Type' },
}

/** 同时代模式下每个大洲展示的代表事件数上限 */
const SYNC_TOP_N = 3

const DATA_CONTINENTS: ContinentKey[] = [
  'asia',
  'europe',
  'africa',
  'north-america',
  'south-america',
  'oceania',
]

/** 快照大洲 chips 仅覆盖六大洲（polar/antarctica 不参与分组） */
const CONTINENT_LABEL: Partial<Record<ContinentKey, { zh: string; en: string }>> = {
  asia: { zh: '亚洲', en: 'Asia' },
  europe: { zh: '欧洲', en: 'Europe' },
  africa: { zh: '非洲', en: 'Africa' },
  'north-america': { zh: '北美', en: 'N. America' },
  'south-america': { zh: '南美', en: 'S. America' },
  oceania: { zh: '大洋洲', en: 'Oceania' },
}

export function initSnapshot(
  onGo: (ev: HistoryEvent) => void,
  onFlyContinent: (key: string) => void,
  onFlyPoint: (lat: number, lon: number) => void,
): void {
  const toggle = document.getElementById('slice-toggle') as HTMLButtonElement
  const countEl = document.getElementById('active-count') as HTMLElement
  const panel = document.getElementById('slice-panel') as HTMLElement
  const list = document.getElementById('slice-list') as HTMLElement
  const yearEl = document.getElementById('slice-year') as HTMLElement
  const eraEl = document.getElementById('snapshot-era') as HTMLElement
  const eraChipsEl = document.getElementById('era-chips') as HTMLElement
  const blurbEl = document.getElementById('snapshot-blurb') as HTMLElement
  const typesEl = document.getElementById('snapshot-types') as HTMLElement
  const contEl = document.getElementById('snapshot-continents') as HTMLElement
  const sortEl = document.getElementById('snapshot-sort') as HTMLElement
  const viewEl = document.getElementById('snapshot-view') as HTMLElement

  let open = false
  let signature = ''
  let sortBy: SortBy = 'importance'
  let viewMode: ViewMode = 'list'
  /** 时代视角模式（V2.1）：开启后时间窗口锁定为当前时代起止 */
  let eraSpanMode = false

  const setOpen = (v: boolean): void => {
    open = v
    panel.hidden = !v
    toggle.setAttribute('aria-expanded', String(v))
    toggle.classList.toggle('is-open', v)
    if (v) {
      render(true) // 打开时强制刷新（筛选可能已变）
      panelIn(panel)
    }
  }

  toggle.addEventListener('click', () => setOpen(!open))

  const typeEntry = (t: EventType | null): { zh: string; en: string; color: string } =>
    t === null
      ? { zh: '全部', en: 'All', color: 'var(--accent)' }
      : EVENT_TYPES[t]

  const renderSort = (): void => {
    const keys: SortBy[] = ['importance', 'time', 'geo', 'type']
    sortEl.innerHTML =
      `<span class="snap-sort-label">排序 · Sort</span>` +
      keys
        .map(
          (k) =>
            `<button class="snap-sort-btn${sortBy === k ? ' is-active' : ''}" type="button" data-sort="${k}" title="${SORT_LABEL[k].en}">${SORT_LABEL[k].zh}</button>`,
        )
        .join('')
  }

  const renderTypes = (counts: Map<EventType | null, number>, typeFilter: EventType | null): void => {
    const keys: (EventType | null)[] = [null, 'politics', 'war', 'science', 'economy', 'ideas', 'exploration', 'society']
    typesEl.innerHTML = keys
      .map((k) => {
        const label = typeEntry(k)
        const n = counts.get(k) ?? 0
        const active = typeFilter === k
        return `
          <button class="snap-chip${active ? ' is-active' : ''}" type="button" data-type="${k ?? 'all'}"
                  title="${label.en}" style="--chip-color:${label.color}" ${n === 0 && k !== null ? 'disabled' : ''}>
            <span class="snap-chip-dot" aria-hidden="true"></span>${label.zh}
            <span class="snap-chip-count">${n}</span>
          </button>`
      })
      .join('')
  }

  const renderContinents = (counts: Map<ContinentKey, number>, contFilter: ContinentKey | null): void => {
    const chips = DATA_CONTINENTS.map((c) => {
      const n = counts.get(c) ?? 0
      const label = CONTINENT_LABEL[c]
      if (!label) return ''
      const active = contFilter === c
      return `
        <button class="snap-chip snap-chip--cont${active ? ' is-active' : ''}" type="button" data-continent="${c}"
                title="${label.en}" ${n === 0 ? 'disabled' : ''}>
          ${label.zh}<span class="snap-chip-count">${n}</span>
        </button>`
    }).join('')
    contEl.innerHTML = chips
  }

  const sortEvents = (rows: HistoryEvent[]): HistoryEvent[] => {
    const rows2 = [...rows]
    if (sortBy === 'importance') {
      rows2.sort((a, b) => b.importance - a.importance || a.start - b.start)
    } else if (sortBy === 'time') {
      rows2.sort((a, b) => a.start - b.start || b.importance - a.importance)
    } else if (sortBy === 'geo') {
      rows2.sort(
        (a, b) =>
          DATA_CONTINENTS.indexOf(a.continent) - DATA_CONTINENTS.indexOf(b.continent) ||
          a.start - b.start,
      )
    } else {
      const order: EventType[] = ['politics', 'war', 'science', 'economy', 'ideas', 'exploration', 'society']
      rows2.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.start - b.start)
    }
    return rows2
  }

  const renderView = (): void => {
    viewEl.innerHTML =
      `<span class="snap-sort-label">视图 · View</span>` +
      ([
        ['list', '列表'],
        ['sync', '同时代'],
        ['civ', '文明'],
      ] as const)
        .map(
          ([k, zh]) =>
            `<button class="snap-sort-btn${viewMode === k ? ' is-active' : ''}" type="button" data-view="${k}">${zh}</button>`,
        )
        .join('')
  }

  /** 文明视图（PHASE F 对比深化）：按文明并置当年代表事件，事件按时代分组——跨文明+跨时代双维对比 */
  const renderCiv = (rows: HistoryEvent[], selectedId: string | null): string => {
    const byCiv = new Map<string, Map<string, HistoryEvent[]>>()
    for (const ev of rows) {
      for (const c of ev.civilizations ?? []) {
        const civMap = byCiv.get(c) ?? new Map<string, HistoryEvent[]>()
        const band = eraOf(ev.start)
        const arr = civMap.get(band.name.zh) ?? []
        arr.push(ev)
        civMap.set(band.name.zh, arr)
        byCiv.set(c, civMap)
      }
    }
    const sections = CIVILIZATIONS.filter((c) => (byCiv.get(c)?.size ?? 0) > 0)
    if (sections.length === 0) {
      return '<div class="slice-empty">该筛选下没有活跃事件。<span class="slice-empty-en">No active events under this filter.</span></div>'
    }
    return sections
      .map((c) => {
        const civMap = byCiv.get(c)!
        const label = CIV_LABEL[c] ?? { zh: c, en: c }
        const total = [...civMap.values()].reduce((s, arr) => s + arr.length, 0)
        const bandBlocks = [...civMap.entries()]
          .sort((a, b) => eraOf(byCiv.get(c)!.get(a[0])![0].start).from - eraOf(byCiv.get(c)!.get(b[0])![0].start).from)
          .map(([bandZh, arr]) => {
            const bandEn = eraOf(arr[0].start).name.en
            const top = arr.sort((a, b) => b.importance - a.importance || a.start - b.start).slice(0, 2)
            return `
              <div class="civ-era-group">
                <div class="civ-era-label">${bandZh}<span class="civ-era-en">${bandEn}</span></div>
                ${top
                  .map((ev) => {
                    const t = EVENT_TYPES[ev.type]
                    const years = ev.start === ev.end ? `${ev.start}` : `${ev.start}–${ev.end}`
                    return `
                  <button class="slice-row${selectedId === ev.id ? ' is-active' : ''}" type="button"
                          data-id="${ev.id}" style="--type-color:${t.color}">
                    <span class="slice-dot" aria-hidden="true"></span>
                    <span class="slice-main">
                      <span class="slice-title">${ev.title.zh}</span>
                      <span class="slice-sub">${ev.title.en}</span>
                    </span>
                    <span class="slice-meta">${years} 年</span>
                  </button>`
                  })
                  .join('')}
              </div>`
          })
          .join('')
        return `
          <div class="sync-section">
            <div class="sync-head">
              <span class="sync-cont">${label.zh}<span class="sync-cont-en">${label.en}</span><span class="sync-cont-count">${total} 条</span></span>
            </div>
            ${bandBlocks}
          </div>`
      })
      .join('')
  }

  /** 文明筛选 chips（PHASE D 深化）：显示活跃计数 + 该文明的时代跨度（title） */
  /** 时代波段 chips：点击跳到时代起点（时间旅行） */
  const renderEraChips = (year: number): void => {
    eraChipsEl.innerHTML = ERA_BANDS.map((band) => {
      const count = EVENTS.filter((ev) => isActive(ev, year, 9999) && ev.start <= band.to && ev.end >= band.from).length
      const active = year >= band.from && year <= band.to
      return `<button class="snap-sort-btn${active ? ' is-active' : ''}" type="button" data-era-from="${band.from}" title="${band.name.en}">${band.name.zh} <span class="snap-chip-count">${count}</span></button>`
    }).join('')
  }

  const renderCivs = (active: HistoryEvent[], civFilter: string | null): void => {
    const civEl = document.getElementById('snapshot-civs') as HTMLElement | null
    if (!civEl) return
    const counts = new Map<string, number>()
    const spans = new Map<string, [number, number]>()
    for (const ev of EVENTS) {
      for (const c of ev.civilizations ?? []) {
        const span = spans.get(c)
        if (!span) spans.set(c, [ev.start, ev.end])
        else {
          span[0] = Math.min(span[0], ev.start)
          span[1] = Math.max(span[1], ev.end)
        }
      }
    }
    for (const ev of active) {
      for (const c of ev.civilizations ?? []) counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    civEl.innerHTML =
      `<span class="snap-sort-label">文明 · Civilization</span>` +
      CIVILIZATIONS.filter((c) => (counts.get(c) ?? 0) > 0)
        .map((c) => {
          const label = CIV_LABEL[c] ?? { zh: c, en: c }
          const span = spans.get(c)
          const spanTxt = span ? `${span[0] < 0 ? `${-span[0]} BCE` : span[0]}–${span[1] < 0 ? `${-span[1]} BCE` : span[1]}` : ''
          return `<button class="snap-sort-btn${civFilter === c ? ' is-active' : ''}" type="button" data-civ="${c}" title="${label.en} · 事件跨度 ${spanTxt}">${label.zh} <span class="snap-chip-count">${counts.get(c)}</span></button>`
        })
        .join('')
  }

  /** 同时代视图：按大洲并置当年代表事件（数据驱动，不虚构叙述） */
  const renderSync = (rows: HistoryEvent[], selectedId: string | null): string => {
    const byCont = new Map<ContinentKey, HistoryEvent[]>()
    for (const ev of rows) {
      if (!DATA_CONTINENTS.includes(ev.continent)) continue
      const arr = byCont.get(ev.continent) ?? []
      arr.push(ev)
      byCont.set(ev.continent, arr)
    }
    const sections = DATA_CONTINENTS.filter((c) => (byCont.get(c)?.length ?? 0) > 0)
    if (sections.length === 0) {
      return '<div class="slice-empty">该筛选下没有活跃事件，试试其他类型或大洲。<span class="slice-empty-en">No active events under this filter — try another type or continent.</span></div>'
    }
    return sections
      .map((c) => {
        const arr = (byCont.get(c) ?? []).sort((a, b) => b.importance - a.importance || a.start - b.start)
        const label = CONTINENT_LABEL[c]!
        const top = arr.slice(0, SYNC_TOP_N)
        const rest = arr.length - top.length
        return `
          <div class="sync-section">
            <div class="sync-head">
              <button class="sync-cont" type="button" data-sync-cont="${c}" title="查看全部${label.zh}事件">
                ${label.zh}<span class="sync-cont-en">${label.en}</span>
                <span class="sync-cont-count">${arr.length} 条</span>
              </button>
            </div>
            ${top
              .map((ev) => {
                const t = EVENT_TYPES[ev.type]
                const years = ev.start === ev.end ? `${ev.start}` : `${ev.start}–${ev.end}`
                return `
                  <button class="slice-row${selectedId === ev.id ? ' is-active' : ''}" type="button"
                          role="option" aria-selected="${selectedId === ev.id}" data-id="${ev.id}"
                          style="--type-color:${t.color}">
                    <span class="slice-dot" aria-hidden="true"></span>
                    <span class="slice-main">
                      <span class="slice-title">${ev.title.zh}</span>
                      <span class="slice-sub">${ev.title.en}</span>
                    </span>
                    <span class="slice-meta">${years} 年 · ${ev.place.zh}</span>
                  </button>`
              })
              .join('')}
            ${rest > 0 ? `<button class="sync-more" type="button" data-sync-cont="${c}">还有 ${rest} 条 → 查看全部</button>` : ''}
          </div>`
      })
      .join('')
  }

  const render = (force = false): void => {
    const s = appStore.getState()
    // hover 变化也触发订阅，但内容只取决于 年份/窗口/选中/筛选/排序/视图
    const next = `${s.year}|${s.windowSize}|${s.selectedId}|${s.typeFilter}|${s.continentFilter}|${s.civFilter}|${sortBy}|${viewMode}`
    if (!force && next === signature) return
    signature = next

    const era = eraOf(s.year)
    yearEl.textContent = `公元 ${s.year} 年`
    if (eraSpanMode) {
      eraEl.innerHTML = `<button class="era-span-btn" type="button" data-era-span-toggle title="点击退出时代视角">⏳ 时代视角：${era.name.zh}（${era.from}–${era.to}）· ${era.name.en} ✕</button>`
    } else {
      eraEl.innerHTML = `<button class="era-span-btn era-span-off" type="button" data-era-span-toggle title="点击锁定当前时代视角">⏳ ${era.name.zh} · ${era.name.en}</button>`
    }
    blurbEl.textContent = era.blurb.zh
    blurbEl.title = `${era.blurb.en} · 点击跳到 ${era.name.zh} 代表年份（${era.from < 0 ? `${-era.from} BCE` : era.from}）`
    blurbEl.hidden = false
    blurbEl.dataset.eraFrom = String(era.from)

    // 时代视角：窗口锁定为当前时代起止（±20 缓冲，保持时代边界事件可见）
    const activeWindow = eraSpanMode ? 20 : s.windowSize
    const active = EVENTS.filter((ev) => isActive(ev, s.year, activeWindow))

    // 类型统计（未筛选口径）；null = 全部
    const typeCounts = new Map<EventType | null, number>()
    typeCounts.set(null, active.length)
    for (const ev of active) typeCounts.set(ev.type, (typeCounts.get(ev.type) ?? 0) + 1)
    renderTypes(typeCounts, s.typeFilter)

    // 大洲统计（仅六大洲；极地/南极不入 chips）
    const contCounts = new Map<ContinentKey, number>()
    for (const ev of active) {
      if (DATA_CONTINENTS.includes(ev.continent)) {
        contCounts.set(ev.continent, (contCounts.get(ev.continent) ?? 0) + 1)
      }
    }
    renderContinents(contCounts, s.continentFilter)
    renderSort()
    renderView()
    renderCivs(active, s.civFilter)
    renderEraChips(s.year)

    const filtered = sortEvents(
      active.filter(
        (ev) => matchesFilters(ev, s) && (s.civFilter === null || (ev.civilizations ?? []).includes(s.civFilter)),
      ),
    )
    countEl.textContent = String(active.length)

    if (viewMode === 'civ') {
      // 文明视图（PHASE F）：跨文明同时代对比，与筛选叠加
      list.innerHTML = renderCiv(filtered, s.selectedId)
      return
    }

    if (viewMode === 'sync') {
      // 同时代视图：不做全局排序（各大洲内部按重要度），忽略类型筛选的列表排序
      list.innerHTML = renderSync(filtered, s.selectedId)
      return
    }

    if (filtered.length === 0) {
      list.innerHTML =
        '<div class="slice-empty">该筛选下没有活跃事件，试试其他类型或大洲。<span class="slice-empty-en">No active events under this filter — try another type or continent.</span></div>'
      return
    }
    list.innerHTML = filtered
      .map((ev) => {
        const t = EVENT_TYPES[ev.type]
        const years = ev.start === ev.end ? `${ev.start}` : `${ev.start}–${ev.end}`
        return `
          <button class="slice-row${s.selectedId === ev.id ? ' is-active' : ''}" type="button"
                  role="option" aria-selected="${s.selectedId === ev.id}" data-id="${ev.id}"
                  style="--type-color:${t.color}">
            <span class="slice-dot" aria-hidden="true"></span>
            <span class="slice-main">
              <span class="slice-title">${ev.title.zh}</span>
              <span class="slice-sub">${ev.title.en}</span>
            </span>
            <span class="slice-meta">${years} 年 · ${ev.place.zh}</span>
          </button>`
      })
      .join('')
  }

  typesEl.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-type]')
    if (!chip?.dataset.type) return
    const key = chip.dataset.type === 'all' ? null : (chip.dataset.type as EventType)
    const s = appStore.getState()
    // 写入全局 store：地球棱柱明暗与随机发现随之联动
    s.setTypeFilter(s.typeFilter === key ? null : key)
  })

  contEl.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-continent]')
    if (!chip?.dataset.continent) return
    const key = chip.dataset.continent as ContinentKey
    const s = appStore.getState()
    if (s.continentFilter === key) {
      s.setContinentFilter(null)
    } else {
      s.setContinentFilter(key)
      onFlyContinent(key) // 地球镜头飞往该大洲（复用大洲导航参数）
    }
  })

  sortEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-sort]')
    if (!btn?.dataset.sort) return
    sortBy = btn.dataset.sort as SortBy
    render(true)
  })

  viewEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-view]')
    if (!btn?.dataset.view) return
    viewMode = btn.dataset.view as ViewMode
    render(true)
  })

  // 时代视角开关（V2.1）：头部时代名按钮 → 锁定/解锁当前时代窗口
  eraEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-era-span-toggle]')
    if (!btn) return
    eraSpanMode = !eraSpanMode
    appStore.getState().setHotspotsEraBoost(eraSpanMode) // 热区权重随时代视角联动
    appStore.getState().setEraSpanOn(eraSpanMode) // 密度条时代高亮联动
    setEraSpanYear(appStore.getState().year) // 密度条高亮当前时代
    render(true)
  })

  // 时代 chips 点击 → 跳到该时代起点
  eraChipsEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-era-from]')
    if (!btn?.dataset.eraFrom) return
    appStore.getState().setYear(Number(btn.dataset.eraFrom))
  })

  // 文明筛选（PHASE D 深化）：写入 store（URL civ= 联动）
  const civEl = document.getElementById('snapshot-civs') as HTMLElement
  civEl.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-civ]')
    if (!btn?.dataset.civ) return
    const s = appStore.getState()
    const next = s.civFilter === btn.dataset.civ ? null : btn.dataset.civ
    s.setCivFilter(next)
    // 选中时飞往该文明活跃事件群重心（事件坐标均值）
    if (next) {
      const pts = EVENTS.filter(
        (ev) => isActive(ev, s.year, s.windowSize) && (ev.civilizations ?? []).includes(next),
      )
      if (pts.length > 0) {
        const lat = pts.reduce((sum, x) => sum + x.lat, 0) / pts.length
        const lon = pts.reduce((sum, x) => sum + x.lon, 0) / pts.length
        onFlyPoint(lat, lon)
      }
    }
  })

  list.addEventListener('click', (e) => {
    // 同时代视图：大洲标题/查看全部 → 设定该大洲筛选并回到列表视图
    const syncBtn = (e.target as HTMLElement).closest<HTMLElement>('[data-sync-cont]')
    if (syncBtn?.dataset.syncCont) {
      const key = syncBtn.dataset.syncCont as ContinentKey
      appStore.getState().setContinentFilter(key)
      viewMode = 'list'
      onFlyContinent(key)
      render(true)
      return
    }
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
    if (!row?.dataset.id) return
    const ev = EVENTS.find((x) => x.id === row.dataset.id)
    if (!ev) return
    onGo(ev)
  })

  // 悬停行 → 地球上对应棱柱高亮（复用全局 hover 状态）
  list.addEventListener('pointerover', (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
    if (row?.dataset.id) appStore.getState().setHover(row.dataset.id)
  })
  list.addEventListener('pointerleave', () => appStore.getState().setHover(null))

  // 地球 → 面板联动（PHASE 深化）：地球悬停事件/热区时列表自动滚动到对应行
  let lastScrollTarget: string | null = null
  appStore.subscribe((st) => {
    if (!st.hoverId || !open) return
    if (st.hoverId === lastScrollTarget) return
    lastScrollTarget = st.hoverId
    const row = list.querySelector(`[data-id="${st.hoverId}"]`)
    row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false)
  })

  appStore.subscribe(() => render())
  render()
}
