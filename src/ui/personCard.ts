import { appStore, type AppState, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { PEOPLE } from '../data/people'

/** 人物卡罗盘元素引用（render 时更新；main.ts 主循环每帧读用） */
let compassRef: HTMLElement | null = null
export function getPersonCompassEl(): HTMLElement | null {
  return compassRef
}

/**
 * 人物档案卡（V1.0-M5，总任务书 §8.1/8.2）：人物作为独立探索入口。
 * 中英姓名 / 生卒 / 双语简介 / 人物时间线（挂接事件按年代排序，点击跳转）/
 * 活动地区（由挂接事件的地点归纳，不虚构轨迹）。与事件卡互斥显示（右侧同位）。
 */
export function initPersonCard(onGo: (ev: HistoryEvent) => void): void {
  const card = document.getElementById('person-card') as HTMLElement
  const eventCard = document.getElementById('event-card') as HTMLElement
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-label', '人物档案 · Person profile')

  const render = (pid: string): string => {
    const p = PEOPLE.find((x) => x.id === pid)
    if (!p) return ''
    const timeline = p.eventIds
      .map((id) => EVENTS.find((e) => e.id === id))
      .filter((e): e is HistoryEvent => e !== undefined)
      .sort((a, b) => a.start - b.start)

    // 活动地区：由挂接事件地点归纳（去重），不虚构
    const places = [...new Set(timeline.map((e) => e.place.zh))]

    // 同事件人物：从共享挂接事件派生（只陈述"同于某事件"，不虚构关系性质）
    const peers = new Map<string, string>() // pid → 经由事件标题
    for (const eId of p.eventIds) {
      const via = EVENTS.find((e) => e.id === eId)
      for (const other of PEOPLE) {
        if (other.id === p.id || !other.eventIds.includes(eId)) continue
        if (!peers.has(other.id) && via) peers.set(other.id, via.title.zh)
      }
    }

    return `
      <button class="pc-close" type="button" data-close aria-label="关闭人物档案">×</button>
      <div class="ec-compass" hidden title="指向主要事件棱柱 · Points to the pillar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v16" /><path d="m6 9 6-6 6 6" />
        </svg>
      </div>
      <div class="pc-badge">人物 · Figure</div>
      <h3 class="pc-name">${p.name.zh}</h3>
      <div class="pc-name-en">${p.name.en}</div>
      <div class="pc-life">${p.life}</div>
      <p class="pc-bio">${p.bio.zh}</p>
      <p class="pc-bio-en">${p.bio.en}</p>
      ${places.length > 0 ? `<div class="pc-places">活动地区 · Regions：${places.join(' / ')}</div>` : ''}
      ${
        timeline.length > 0
          ? `<div class="pc-links-label">人物时间线 · Timeline</div>
       <div class="pc-timeline">
         ${timeline
           .map((e) => {
             const t = EVENT_TYPES[e.type]
             const years = e.start === e.end ? `${e.start}` : `${e.start}–${e.end}`
             return `
               <button class="pc-tl-row" type="button" data-goto="${e.id}" style="--type-color:${t.color}"
                       title="${t.zh} · ${t.en}">
                 <span class="pc-tl-dot" aria-hidden="true"></span>
                 <span class="pc-tl-year">${years}</span>
                 <span class="pc-tl-main">
                   <span class="pc-tl-title">${e.title.zh}</span>
                   <span class="pc-tl-sub">${e.title.en}</span>
                 </span>
               </button>`
           })
           .join('')}
       </div>`
          : ''
      }
      ${
        peers.size > 0
          ? `<div class="pc-links-label">同事件人物 · Contemporaries</div>
       <div class="pc-peers">
         ${[...peers.entries()]
           .map(
             ([peerId, via]) =>
               `<button class="pc-chip" type="button" data-peer="${peerId}" title="同于：${via}">${PEOPLE.find((x) => x.id === peerId)?.name.zh ?? peerId}</button>`,
           )
           .join('')}
       </div>`
          : ''
      }`
  }

  const apply = (s: AppState): void => {
    const pid = s.selectedPersonId
    const p = pid ? PEOPLE.find((x) => x.id === pid) : undefined
    if (!p) {
      // 关闭：恢复事件卡的可见性（若仍有选中事件）
      compassRef = null
      card.classList.remove('show')
      window.setTimeout(() => {
        if (!appStore.getState().selectedPersonId) {
          card.hidden = true
          eventCard.hidden = !appStore.getState().selectedId
        }
      }, 340)
      return
    }
    card.innerHTML = render(p.id)
    compassRef = card.querySelector('.ec-compass')
    card.hidden = false
    eventCard.hidden = true // 人物卡与事件卡同位互斥
    requestAnimationFrame(() => card.classList.add('show'))
  }

  appStore.subscribe(apply)
  apply(appStore.getState()) // 初始同步（URL hash p= 恢复）

  // Esc 关闭（与快照面板/因果网络一致）
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appStore.getState().selectedPersonId) {
      appStore.getState().selectPerson(null)
    }
  })

  card.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-close]')) {
      appStore.getState().selectPerson(null)
      return
    }
    const peerBtn = target.closest<HTMLElement>('[data-peer]')
    if (peerBtn?.dataset.peer) {
      // 卡内切换到同事件人物
      appStore.getState().selectPerson(peerBtn.dataset.peer)
      return
    }
    const row = target.closest<HTMLElement>('[data-goto]')
    if (row?.dataset.goto) {
      const ev = EVENTS.find((x) => x.id === row.dataset.goto)
      if (!ev) return
      appStore.getState().selectPerson(null) // 跳转前收起人物卡，让位事件卡
      onGo(ev)
    }
  })
}
