import type { HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { PEOPLE } from '../data/people'

interface SearchHit {
  kind: 'event' | 'person'
  id: string
  score: number
}

function matchEvent(ev: HistoryEvent, q: string): number {
  let score = 0
  const add = (text: string, weight: number): void => {
    if (text.toLowerCase().includes(q)) score += weight
  }
  add(ev.title.zh, 4)
  add(ev.title.en, 3)
  add(ev.place.zh, 2)
  add(ev.place.en, 1)
  add(EVENT_TYPES[ev.type].zh, 1)
  add(ev.desc.zh, 1)
  return score
}

function matchPersonName(zh: string, en: string, q: string): number {
  let score = 0
  if (zh.toLowerCase().includes(q)) score += 6
  if (en.toLowerCase().includes(q)) score += 5
  return score
}

/** 顶部搜索：中英文模糊匹配事件（标题/地点/类型/描述）与人物姓名，回车或点击跳转 */
export function initSearch(onGo: (ev: HistoryEvent) => void): void {
  const input = document.getElementById('search-input') as HTMLInputElement
  const clearBtn = document.getElementById('search-clear') as HTMLButtonElement
  const panel = document.getElementById('search-results') as HTMLElement

  const render = (): void => {
    const q = input.value.trim().toLowerCase()
    clearBtn.hidden = q.length === 0
    if (q.length === 0) {
      panel.hidden = true
      panel.innerHTML = ''
      return
    }

    const hits: SearchHit[] = []
    for (const ev of EVENTS) {
      const score = matchEvent(ev, q)
      if (score > 0) hits.push({ kind: 'event', id: ev.id, score })
    }
    for (const p of PEOPLE) {
      const score = matchPersonName(p.name.zh, p.name.en, q)
      if (score > 0) hits.push({ kind: 'person', id: p.id, score })
    }
    hits.sort((a, b) => b.score - a.score)

    if (hits.length === 0) {
      panel.innerHTML =
        '<div class="search-empty">没有找到匹配的事件或人物，换个关键词试试？</div>'
    } else {
      panel.innerHTML = hits
        .slice(0, 8)
        .map((hit) => {
          if (hit.kind === 'person') {
            const p = PEOPLE.find((x) => x.id === hit.id)
            if (!p) return ''
            return `
              <button class="search-item" type="button" role="option" data-person="${p.id}">
                <span class="search-badge">人物</span>
                <span class="search-item-main">
                  <span class="search-item-title">${p.name.zh} <span class="search-item-life">${p.life}</span></span>
                  <span class="search-item-sub">${p.name.en}</span>
                </span>
                <span class="search-item-meta">${EVENTS.find((e) => e.id === p.eventIds[0])?.title.zh ?? ''}</span>
              </button>`
          }
          const ev = EVENTS.find((x) => x.id === hit.id)
          if (!ev) return ''
          const years = ev.start === ev.end ? `${ev.start}` : `${ev.start}–${ev.end}`
          const dot = EVENT_TYPES[ev.type].color
          return `
            <button class="search-item" type="button" role="option" data-id="${ev.id}">
              <span class="search-dot" style="background:${dot}"></span>
              <span class="search-item-main">
                <span class="search-item-title">${ev.title.zh}</span>
                <span class="search-item-sub">${ev.title.en}</span>
              </span>
              <span class="search-item-meta">${years} 年 · ${ev.place.zh}</span>
            </button>`
        })
        .join('')
    }
    panel.hidden = false
  }

  const go = (target: { kind: 'event' | 'person'; id: string }): void => {
    let ev: HistoryEvent | undefined
    if (target.kind === 'person') {
      const p = PEOPLE.find((x) => x.id === target.id)
      ev = p ? EVENTS.find((e) => e.id === p.eventIds[0]) : undefined
    } else {
      ev = EVENTS.find((e) => e.id === target.id)
    }
    if (!ev) return
    input.value = ''
    clearBtn.hidden = true
    panel.hidden = true
    panel.innerHTML = ''
    input.blur()
    onGo(ev)
  }

  input.addEventListener('input', render)
  input.addEventListener('focus', render)
  panel.addEventListener('click', (e) => {
    const el = e.target as HTMLElement
    const eventBtn = el.closest<HTMLElement>('[data-id]')
    if (eventBtn?.dataset.id) {
      go({ kind: 'event', id: eventBtn.dataset.id })
      return
    }
    const personBtn = el.closest<HTMLElement>('[data-person]')
    if (personBtn?.dataset.person) {
      go({ kind: 'person', id: personBtn.dataset.person })
    }
  })
  clearBtn.addEventListener('click', () => {
    input.value = ''
    render()
    input.focus()
  })

  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.search-wrap')) panel.hidden = true
  })

  // 快捷键：/ 聚焦搜索，Esc 清空并收起，Enter 跳转首个结果
  window.addEventListener('keydown', (e) => {
    const active = document.activeElement
    const typing =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement
    if (e.key === '/' && !typing) {
      e.preventDefault()
      input.focus()
    }
    if (e.key === 'Escape' && active === input) {
      input.value = ''
      render()
      input.blur()
    }
    if (e.key === 'Enter' && active === input) {
      const first = panel.querySelector<HTMLElement>('[data-id], [data-person]')
      if (first?.dataset.id) go({ kind: 'event', id: first.dataset.id })
      else if (first?.dataset.person) go({ kind: 'person', id: first.dataset.person })
    }
  })
}
