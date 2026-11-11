import { appStore, type AppState, type HistoryEvent } from '../store'
import { EVENTS, EVENT_TYPES } from '../data/events'
import { PEOPLE, PERSON_LINKS } from '../data/people'
import { SOURCES } from '../data/sources'
import { eraOf } from '../data/eras'
import type { PersonPlace } from '../data/model'

/** 人物卡罗盘元素引用（render 时更新；main.ts 主循环每帧读用） */
let compassRef: HTMLElement | null = null
export function getPersonCompassEl(): HTMLElement | null {
  return compassRef
}

const ROLE_ZH: Record<PersonPlace['role'], string> = {
  birth: '出生',
  death: '逝世',
  active: '活动',
  travel: '旅居',
}

const RELATION_ZH: Record<string, string> = {
  cooperation: '合作',
  mentorship: '师承',
  opposition: '对立',
  family: '家族',
  influence: '影响',
}

/** 当前人物的活动地点（点击飞往用） */
let currentPersonPlaces: PersonPlace[] | null = null

/**
 * 人物档案卡（V1.0-M5/C1）：人物作为独立探索入口。
 * 中英姓名 / 生卒 / 双语简介 / 活动地图（有据地点，点击飞往，地球显示紫点）/
 * 人物时间线（挂接事件按年代排序，点击跳转）/ 同事件人物。
 * 与事件卡互斥显示（右侧同位）。
 */
export function initPersonCard(
  onGo: (ev: HistoryEvent) => void,
  onFlyPlace: (lat: number, lon: number) => void,
  onPlacesChange: (places: PersonPlace[] | null) => void,
): void {
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

    // 人物关系（PHASE C2）：PERSON_LINKS 中与当前人物相关的有据对
    const relations = PERSON_LINKS.filter((l) => l.from === p.id || l.to === p.id)

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
      ${
        (p.eventIds.flatMap((id) => EVENTS.find((e) => e.id === id)?.civilizations ?? []).filter((c, i, a) => a.indexOf(c) === i).length > 0)
          ? `<div class="ec-civs">${[...new Set(p.eventIds.flatMap((id) => EVENTS.find((e) => e.id === id)?.civilizations ?? []))]
              .map((c) => {
                const zh = { chinese: '中华', ottoman: '奥斯曼', european: '欧洲', russian: '俄罗斯', indian: '印度', japanese: '日本', african: '非洲', 'latin-american': '拉美', 'north-american': '北美', 'islamic-world': '伊斯兰' }[c] ?? c
                return `<span class="ec-civ-tag">${zh}</span>`
              })
              .join('')}</div>`
          : ''
      }
      <button class="pc-era" type="button" data-era="${eraOf(p.places?.[0]?.year ?? timeline[0]?.start ?? 1850).name.zh}"
              title="跳转到该时代 · Jump to era">
        <span class="pc-era-label">时代 · Era</span>
        <span class="pc-era-name">${eraOf(p.places?.[0]?.year ?? timeline[0]?.start ?? 1850).name.zh}<span class="pc-era-en">${eraOf(p.places?.[0]?.year ?? timeline[0]?.start ?? 1850).name.en}</span></span>
      </button>
      ${
        p.places && p.places.length > 0
          ? `<div class="pc-links-label">活动地图 · Atlas<span class="pc-atlas-hint">点击定位 · click to fly</span></div>
       <div class="pc-atlas">
         ${p.places
           .map(
             (pl, i) =>
               `<button class="pc-place" type="button" data-place="${i}" title="${pl.precision === 'approx' ? '位置存在争议 / disputed' : ''}">
                  <span class="pc-place-role" data-role="${pl.role}">${ROLE_ZH[pl.role]}</span>
                  <span class="pc-place-name">${pl.name.zh}<span class="pc-place-en">${pl.name.en}</span></span>
                  ${pl.year !== undefined ? `<span class="pc-place-year">${pl.year < 0 ? `${-pl.year} BCE` : pl.year}</span>` : ''}
                </button>`,
           )
           .join('')}
       </div>`
          : places.length > 0
            ? `<div class="pc-places">活动地区 · Regions：${places.join(' / ')}</div>`
            : ''
      }
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
        (p.sourceIds ?? []).length > 0
          ? `<div class="pc-links-label">参考资料 · Sources</div>
       <ul class="ec-sources">
         ${((p.sourceIds ?? [])
           .map((sid) => SOURCES.find((s) => s.id === sid))
           .filter((s) => s !== undefined))
           .map(
             (s) =>
               `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer" title="${s.name.en} — ${s.publisher.en}">${s.name.zh}<span class="ec-source-pub">${s.publisher.zh}</span></a></li>`,
           )
           .join('')}
       </ul>`
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
      }
      ${
        relations.length > 0
          ? `<div class="pc-links-label">人物关系 · Relations</div>
       <div class="pc-relations">
         ${relations
           .map((l) => {
             const otherId = l.from === p.id ? l.to : l.from
             const other = PEOPLE.find((x) => x.id === otherId)
             if (!other) return ''
             const dir = l.relation === 'influence' ? (l.from === p.id ? '→' : '←') : '↔'
             return `
               <button class="pc-rel" type="button" data-rel="${otherId}"
                       title="${l.zh} — ${l.en}">
                 <span class="pc-rel-type">${RELATION_ZH[l.relation] ?? l.relation}${dir}</span>
                 <span class="pc-rel-name">${other.name.zh}<span class="pc-rel-en">${other.name.en}</span></span>
                 <span class="pc-rel-desc">${l.zh}</span>
               </button>`
           })
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
      onPlacesChange(null)
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
    currentPersonPlaces = p.places ?? null
    onPlacesChange(p.places ?? null)
    card.hidden = false
    eventCard.hidden = true // 人物卡与事件卡同位互斥
    requestAnimationFrame(() => {
      card.classList.add('show')
      // 键盘可达性（E5）：焦点移入人物卡
      card.querySelector<HTMLButtonElement>('.pc-close')?.focus({ preventScroll: true })
    })
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
    const placeBtn = target.closest<HTMLElement>('[data-place]')
    if (placeBtn?.dataset.place !== undefined && currentPersonPlaces) {
      const pl = currentPersonPlaces[Number(placeBtn.dataset.place)]
      if (pl) onFlyPlace(pl.lat, pl.lon)
      return
    }
    const eraBtn = target.closest<HTMLElement>('[data-era]')
    if (eraBtn?.dataset.era) {
      // 时代入口：跳到人物主事件年份（时代探索路径：人物→时期）
      const pid = appStore.getState().selectedPersonId
      const person = PEOPLE.find((x) => x.id === pid)
      const mainEv = person ? EVENTS.find((x) => x.id === person.eventIds[0]) : undefined
      if (mainEv) {
        appStore.getState().setYear(mainEv.start)
        onGo(mainEv)
      }
      return
    }
    const peerBtn = target.closest<HTMLElement>('[data-peer]')
    if (peerBtn?.dataset.peer) {
      // 卡内切换到同事件人物
      appStore.getState().selectPerson(peerBtn.dataset.peer)
      return
    }
    const relBtn = target.closest<HTMLElement>('[data-rel]')
    if (relBtn?.dataset.rel) {
      // 关系行点击 → 切换到对方人物
      appStore.getState().selectPerson(relBtn.dataset.rel)
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
