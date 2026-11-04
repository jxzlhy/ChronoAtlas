import { appStore, type AppState, type HistoryEvent } from '../store'
import type { LinkKind } from '../data/model'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { LINKS } from '../data/links'
import { PEOPLE } from '../data/people'
import { SOURCES } from '../data/sources'
import { KIND_COLOR } from '../scene/LinkArcs'

/** 关系类型的双语短标签（tooltip 前缀，区分因果与关联） */
const KIND_LABEL: Record<LinkKind, { zh: string; en: string }> = {
  'direct-cause': { zh: '直接因果', en: 'Direct cause' },
  'indirect-influence': { zh: '间接影响', en: 'Indirect influence' },
  background: { zh: '背景条件', en: 'Background' },
  related: { zh: '历史关联', en: 'Related' },
  reaction: { zh: '回应反应', en: 'Reaction' },
  continuation: { zh: '延续发展', en: 'Continuation' },
}

/** 右侧双语事件卡片，由选中状态驱动；前因/后果 chips + 相关人物（可展开详情） */
export function initEventCard(
  onLocate: (ev: HistoryEvent) => void,
  onGo: (ev: HistoryEvent) => void,
): void {
  const card = document.getElementById('event-card') as HTMLElement
  let current: HistoryEvent | null = null
  let expandedPerson: string | null = null

  const render = (ev: HistoryEvent): void => {
    const type = EVENT_TYPES[ev.type]
    const years = ev.start === ev.end ? `${ev.start}` : `${ev.start} – ${ev.end}`
    card.style.setProperty('--type-color', type.color)

    const chip = (
      other: HistoryEvent,
      cls: string,
      tip: { zh: string; en: string; kind?: LinkKind },
    ): string =>
      `<button class="ec-chip ${cls}" type="button" data-goto="${other.id}" data-tooltip="${tip.kind ? `${KIND_LABEL[tip.kind].zh}：${tip.zh} — ${tip.en}` : `${tip.zh} — ${tip.en}`}">${other.title.zh}</button>`

    const section = (
      labelZh: string,
      labelEn: string,
      cls: string,
      links: typeof LINKS,
    ): string => {
      if (links.length === 0) return ''
      const chips = links
        .map((l) => {
          const otherId = cls === 'ec-chip--cause' ? l.from : l.to
          const other = EVENTS.find((e) => e.id === otherId)
          return other ? chip(other, cls, l) : ''
        })
        .join('')
      return `
        <div class="ec-links">
          <div class="ec-links-label">${labelZh} · ${labelEn}</div>
          <div class="ec-chips">${chips}</div>
        </div>`
    }

    // 相关人物：chip 点击展开/收起详情，详情内可跳转该人物的其他事件
    const figures = PEOPLE.filter((p) => p.eventIds.includes(ev.id))
    const figuresSection = (): string => {
      if (figures.length === 0) return ''
      const chips = figures
        .map(
          (p) =>
            `<button class="ec-chip ec-chip--person${expandedPerson === p.id ? ' is-open' : ''}" type="button" data-person="${p.id}">${p.name.zh}</button>`,
        )
        .join('')
      const expanded = figures.find((p) => p.id === expandedPerson)
      const detail = expanded
        ? `<div class="ec-person">
             <div class="ec-person-name">${expanded.name.zh} <span class="ec-person-en">${expanded.name.en}</span></div>
             <div class="ec-person-life">${expanded.life}</div>
             <p class="ec-person-bio">${expanded.bio.zh}</p>
             <p class="ec-person-bio-en">${expanded.bio.en}</p>
             ${
               expanded.eventIds.length > 1
                 ? `<div class="ec-person-events">${expanded.eventIds
                     .filter((id) => id !== ev.id)
                     .map((id) => {
                       const other = EVENTS.find((e) => e.id === id)
                       return other
                         ? `<button class="ec-chip ec-chip--effect" type="button" data-goto="${other.id}">${other.title.zh}</button>`
                         : ''
                     })
                     .join('')}</div>`
                 : ''
             }
           </div>`
        : ''
      return `
        <div class="ec-links">
          <div class="ec-links-label">相关人物 · Figures</div>
          <div class="ec-chips">${chips}</div>
          ${detail}
        </div>`
    }

    // 参考资料：只显示已挂接且在 registry 中可解析的来源
    const sources = (ev.sourceIds ?? [])
      .map((sid) => SOURCES.find((s) => s.id === sid))
      .filter((s) => s !== undefined)
    const sourcesSection = (): string => {
      if (sources.length === 0) return ''
      return `
        <div class="ec-links">
          <div class="ec-links-label">参考资料 · Sources</div>
          <ul class="ec-sources">
            ${sources
              .map(
                (s) =>
                  `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer" title="${s.name.en} — ${s.publisher.en}">${s.name.zh}<span class="ec-source-pub">${s.publisher.zh}</span></a></li>`,
              )
              .join('')}
          </ul>
        </div>`
    }

    const causes = LINKS.filter((l) => l.to === ev.id)
    const effects = LINKS.filter((l) => l.from === ev.id)

    // 弧线图例 + 跳数切换（有直接关系时才显示）
    const kinds = [...new Set([...causes, ...effects].map((l) => l.kind))]
    const depth = appStore.getState().arcsDepth
    const arcsSection = (): string => {
      if (kinds.length === 0) return ''
      return `
        <div class="ec-arcs">
          <div class="ec-arcs-legend">
            ${kinds
              .map(
                (k) =>
                  `<span class="ec-arc-item" title="${KIND_LABEL[k].en}"><i style="--k:${KIND_COLOR[k]}" aria-hidden="true"></i>${KIND_LABEL[k].zh}</span>`,
              )
              .join('')}
          </div>
          <div class="ec-arcs-depth" role="group" aria-label="关系弧线跳数">
            <button class="ec-depth-btn${depth === 1 ? ' is-active' : ''}" type="button" data-depth="1" title="1 hop">1 跳</button>
            <button class="ec-depth-btn${depth === 3 ? ' is-active' : ''}" type="button" data-depth="3" title="3 hops">3 跳</button>
          </div>
        </div>`
    }

    card.innerHTML = `
      <button class="ec-close" type="button" data-close aria-label="关闭事件卡片">×</button>
      <div class="ec-type">${type.zh} · ${type.en}</div>
      <div class="ec-meta">公元 ${years} 年 · ${ev.place.zh}</div>
      <h3 class="ec-title">${ev.title.zh}</h3>
      <div class="ec-title-en">${ev.title.en}</div>
      <p class="ec-desc">${ev.desc.zh}</p>
      <hr />
      <p class="ec-desc-en">${ev.desc.en}</p>
      <div class="ec-meta-en">${ev.place.en} · ${years} A.D. · Importance ${'★'.repeat(ev.importance)}</div>
      ${figuresSection()}
      ${section('前因', 'Origins', 'ec-chip--cause', causes)}
      ${section('后果', 'Legacies', 'ec-chip--effect', effects)}
      ${arcsSection()}
      ${sourcesSection()}
      <button class="ec-locate" type="button" data-locate>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          <circle cx="12" cy="12" r="8" />
        </svg>
        定位到事件地点
      </button>`
  }

  const apply = (s: AppState): void => {
    const ev = s.selectedId ? (EVENTS.find((e) => e.id === s.selectedId) ?? null) : null
    if (ev === current) return
    current = ev
    expandedPerson = null
    if (!ev) {
      card.classList.remove('show')
      window.setTimeout(() => {
        if (!appStore.getState().selectedId) card.hidden = true
      }, 340)
      return
    }
    render(ev)
    card.hidden = false
    requestAnimationFrame(() => card.classList.add('show'))
  }

  appStore.subscribe(apply)
  apply(appStore.getState()) // 初始同步（URL hash 恢复的选中也要显示）

  card.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-close]')) {
      appStore.getState().select(null)
      return
    }
    const depthBtn = target.closest<HTMLElement>('[data-depth]')
    if (depthBtn?.dataset.depth) {
      // 跳数切换 → store（LinkArcs 订阅重建弧线），并重绘按钮激活态
      appStore.getState().setArcsDepth(depthBtn.dataset.depth === '1' ? 1 : 3)
      if (current) render(current)
      return
    }
    const personBtn = target.closest<HTMLElement>('[data-person]')
    if (personBtn?.dataset.person) {
      // 展开/收起人物详情（仅重绘，不改变选中状态）
      expandedPerson = expandedPerson === personBtn.dataset.person ? null : personBtn.dataset.person
      if (current) render(current)
      return
    }
    const gotoBtn = target.closest<HTMLElement>('[data-goto]')
    if (gotoBtn?.dataset.goto) {
      const ev = EVENTS.find((x) => x.id === gotoBtn.dataset.goto)
      if (ev) onGo(ev)
      return
    }
    if (target.closest('[data-locate]') && current) {
      onLocate(current)
    }
  })
}
