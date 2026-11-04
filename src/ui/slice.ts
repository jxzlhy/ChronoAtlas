import { appStore, isActive, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'

/**
 * "此刻世界"切片面板：列出当前年份窗口内的活跃事件。
 * 点击行 → 定位并选中；悬停行 → 联动地球棱柱高亮。Esc 或再次点击开关收起。
 */
export function initSlice(onGo: (ev: HistoryEvent) => void): void {
  const toggle = document.getElementById('slice-toggle') as HTMLButtonElement
  const countEl = document.getElementById('active-count') as HTMLElement
  const panel = document.getElementById('slice-panel') as HTMLElement
  const list = document.getElementById('slice-list') as HTMLElement
  const yearEl = document.getElementById('slice-year') as HTMLElement

  let open = false
  let signature = ''

  const setOpen = (v: boolean): void => {
    open = v
    panel.hidden = !v
    toggle.setAttribute('aria-expanded', String(v))
    toggle.classList.toggle('is-open', v)
  }

  toggle.addEventListener('click', () => setOpen(!open))

  const render = (): void => {
    const s = appStore.getState()
    // hover 变化也会触发订阅，但列表内容只取决于 年份/窗口/选中
    const next = `${s.year}|${s.windowSize}|${s.selectedId}`
    if (next === signature) return
    signature = next

    const active = EVENTS.filter((ev) => isActive(ev, s.year, s.windowSize)).sort(
      (a, b) => b.importance - a.importance || a.start - b.start,
    )
    countEl.textContent = String(active.length)
    yearEl.textContent = `公元 ${s.year} 年`

    if (active.length === 0) {
      list.innerHTML =
        '<div class="slice-empty">这个时期没有活跃事件，拖动下方时间轴换个年代试试。</div>'
      return
    }
    list.innerHTML = active
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

  appStore.subscribe(render)
  render()
}
