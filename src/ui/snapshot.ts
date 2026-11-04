import { appStore, isActive, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { eraOf } from '../data/eras'
import type { ContinentKey, EventType } from '../data/model'

/**
 * 世界快照面板（V1.0-M2）：年份驱动的时代切片。
 * - 头部：公元年份 + 时代名 + 一句话时代背景
 * - 年份概览：类型统计 chips（可筛选）
 * - 大洲概览：有活跃事件的各大洲 chips（点击飞往 + 筛选）
 * - 事件列表：按重要度/时间排序，点击定位，悬停联动地球
 * 筛选为面板局部 UI 状态（不进全局 store、不进 URL）。
 */

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

export function initSnapshot(onGo: (ev: HistoryEvent) => void, onFlyContinent: (key: string) => void): void {
  const toggle = document.getElementById('slice-toggle') as HTMLButtonElement
  const countEl = document.getElementById('active-count') as HTMLElement
  const panel = document.getElementById('slice-panel') as HTMLElement
  const list = document.getElementById('slice-list') as HTMLElement
  const yearEl = document.getElementById('slice-year') as HTMLElement
  const eraEl = document.getElementById('snapshot-era') as HTMLElement
  const blurbEl = document.getElementById('snapshot-blurb') as HTMLElement
  const typesEl = document.getElementById('snapshot-types') as HTMLElement
  const contEl = document.getElementById('snapshot-continents') as HTMLElement

  let open = false
  let signature = ''
  let typeFilter: EventType | null = null
  let contFilter: ContinentKey | null = null

  const setOpen = (v: boolean): void => {
    open = v
    panel.hidden = !v
    toggle.setAttribute('aria-expanded', String(v))
    toggle.classList.toggle('is-open', v)
    if (v) render(true) // 打开时强制刷新（筛选可能已变）
  }

  toggle.addEventListener('click', () => setOpen(!open))

  const typeEntry = (t: EventType | null): { zh: string; en: string; color: string } =>
    t === null
      ? { zh: '全部', en: 'All', color: 'var(--accent)' }
      : EVENT_TYPES[t]

  const renderTypes = (counts: Map<EventType | null, number>): void => {
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

  const renderContinents = (counts: Map<ContinentKey, number>): void => {
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

  const render = (force = false): void => {
    const s = appStore.getState()
    // hover 变化也触发订阅，但内容只取决于 年份/窗口/选中/筛选
    const next = `${s.year}|${s.windowSize}|${s.selectedId}|${typeFilter}|${contFilter}`
    if (!force && next === signature) return
    signature = next

    const era = eraOf(s.year)
    yearEl.textContent = `公元 ${s.year} 年`
    eraEl.textContent = `${era.name.zh} · ${era.name.en}`
    blurbEl.textContent = era.blurb.zh
    blurbEl.title = era.blurb.en
    blurbEl.hidden = false

    const active = EVENTS.filter((ev) => isActive(ev, s.year, s.windowSize))

    // 类型统计：null = 全部
    const typeCounts = new Map<EventType | null, number>()
    typeCounts.set(null, active.length)
    for (const ev of active) typeCounts.set(ev.type, (typeCounts.get(ev.type) ?? 0) + 1)
    renderTypes(typeCounts)

    // 大洲统计（仅六大洲；极地/南极不入 chips）
    const contCounts = new Map<ContinentKey, number>()
    for (const ev of active) {
      if (DATA_CONTINENTS.includes(ev.continent)) {
        contCounts.set(ev.continent, (contCounts.get(ev.continent) ?? 0) + 1)
      }
    }
    renderContinents(contCounts)

    const filtered = active
      .filter((ev) => (typeFilter === null || ev.type === typeFilter) && (contFilter === null || ev.continent === contFilter))
      .sort((a, b) => b.importance - a.importance || a.start - b.start)
    countEl.textContent = String(active.length)

    if (filtered.length === 0) {
      list.innerHTML =
        '<div class="slice-empty">该筛选下没有活跃事件，试试其他类型或大洲。</div>'
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
    typeFilter = typeFilter === key ? null : key
    render(true)
  })

  contEl.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('[data-continent]')
    if (!chip?.dataset.continent) return
    const key = chip.dataset.continent as ContinentKey
    if (contFilter === key) {
      contFilter = null
    } else {
      contFilter = key
      onFlyContinent(key) // 地球镜头飞往该大洲（复用大洲导航参数）
    }
    render(true)
  })

  list.addEventListener('click', (e) => {
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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) setOpen(false)
  })

  appStore.subscribe(() => render())
  render()
}
