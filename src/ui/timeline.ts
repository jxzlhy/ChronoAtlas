import { appStore, isActive, YEAR_MAX, YEAR_MIN } from '../store'
import { EVENTS } from '../data/events'
import { ERA_BANDS, eraOf } from '../data/eras'
import { playTick } from './sound'

/**
 * 事件密度条：每年 1 柱（全数据集重叠计数）。
 * V3.12 修复（V2.1 遗留）：此前 buildDensity 在 store 订阅内整函数重跑——
 * 播放时每帧重建 SVG 并叠加 4 个匿名 listener + 1 个 tooltip DOM（泄漏）。
 * 现拆为「构建一次（buildDensity，仅时代视角开关变化时重建）」+
 * 「时代高亮 repaint（repaintDensity，按 store 实时年份计算 activeBand，
 *  band 不变零开销）」——同时修复时代视角下跳时代后高亮错位（旧 eraSpanYear 快照）。
 */
const H = 20
let densityBuilt = false
let lastEraSpan = false
let lastActiveBand = -999 // 哨兵：与"非时代视角 activeBand=-1"区分，保证构建后 repaint 必跑一次
let countsArr: number[] = []
let byYear: { zh: string; en: string }[][] = []
let bandOf: number[] = []
let maxCount = 1

/** 当前应高亮的 band（时代视角下由实时年份决定；关闭视角恒 -1） */
function computeActiveBand(): number {
  if (!lastEraSpan) return -1
  const year = appStore.getState().year
  return ERA_BANDS.findIndex((b) => year >= b.from && year <= b.to)
}

/** 柱透明度（构建与 repaint 共用一份公式）：时代视角下非核心段压暗、核心段提亮 */
function densityOpacity(c: number, i: number): string {
  const inCore = lastEraSpan && bandOf[i] === lastActiveBand
  const dimmed = lastEraSpan && !inCore
  if (c === 0) return dimmed ? '0.04' : '0.1'
  const base = dimmed ? 0.08 : 0.2
  return Math.min(1, (base + 0.45 * (c / maxCount)) * (inCore ? 1.25 : 1)).toFixed(2)
}

function buildDensity(eraSpanOn: boolean): void {
  const svg = document.getElementById('timeline-density') as SVGSVGElement | null
  if (!svg) return
  if (densityBuilt && eraSpanOn === lastEraSpan) return // 已构建：listener/tooltip 只绑一次
  const years = YEAR_MAX - YEAR_MIN + 1
  countsArr = new Array<number>(years).fill(0)
  byYear = Array.from({ length: years }, () => [])
  maxCount = 1
  for (const ev of EVENTS) {
    for (let y = Math.max(ev.start, YEAR_MIN); y <= Math.min(ev.end, YEAR_MAX); y++) {
      countsArr[y - YEAR_MIN]++
      byYear[y - YEAR_MIN].push({ zh: ev.title.zh, en: ev.title.en })
      maxCount = Math.max(maxCount, countsArr[y - YEAR_MIN])
    }
  }
  // 时代波段：每年所属 band 索引
  bandOf = new Array<number>(years).fill(-1)
  ERA_BANDS.forEach((band, bi) => {
    for (let y = Math.max(band.from, YEAR_MIN); y <= Math.min(band.to, YEAR_MAX); y++) bandOf[y - YEAR_MIN] = bi
  })
  lastEraSpan = eraSpanOn
  lastActiveBand = computeActiveBand() // 构建即用真实 band（repaint 逻辑与构建共用 densityOpacity）
  svg.setAttribute('viewBox', `0 0 ${years} ${H}`)
  svg.innerHTML = countsArr
    .map((c, i) => {
      const h = c === 0 ? 1 : 1 + (c / maxCount) * (H - 3)
      return `<rect x="${i + 0.1}" y="${(H - h).toFixed(2)}" width="0.8" height="${h.toFixed(2)}" fill="#22d3ee" opacity="${densityOpacity(c, i)}" />`
    })
    .join('')
  svg.addEventListener('click', (e) => {
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const year = Math.round(YEAR_MIN + frac * (years - 1))
    appStore.getState().setYear(year)
  })
  densityBuilt = true // 守卫标记（漏写则每次 store 更新全量重建 → listener/tooltip 泄漏）

  // 悬停 tooltip：显示当年活跃事件名（双语，PHASE 交互深化 + 多语言审计补齐）
  const tooltip = document.createElement('div')
  tooltip.className = 'density-tooltip'
  tooltip.hidden = true
  svg.parentElement?.appendChild(tooltip)
  const showYearTooltip = (clientX: number, clientY: number): void => {
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const year = Math.round(YEAR_MIN + frac * (years - 1))
    const titles = byYear[year - YEAR_MIN]
    if (titles.length === 0) {
      tooltip.hidden = true
      return
    }
    const showZh = titles.slice(0, 3).map((t) => t.zh).join(' · ')
    const showEn = titles.slice(0, 3).map((t) => t.en).join(' · ')
    const moreZh = titles.length > 3 ? ` …等 ${titles.length} 个` : ''
    const moreEn = titles.length > 3 ? ` …+${titles.length - 3} more` : ''
    tooltip.textContent = `${year} 年（${titles.length}）：${showZh}${moreZh}\nYear ${year} (${titles.length}): ${showEn}${moreEn}`
    tooltip.hidden = false
    const wrap = svg.parentElement!.getBoundingClientRect()
    const x = Math.min(Math.max(clientX - wrap.left, 60), wrap.width - 60)
    tooltip.style.left = `${x}px`
    tooltip.style.top = `${rect.bottom - wrap.top + 4}px`
  }
  svg.addEventListener('pointerdown', (e) => showYearTooltip(e.clientX, e.clientY))
  svg.addEventListener('pointermove', (e) => showYearTooltip(e.clientX, e.clientY))
  svg.addEventListener('pointerleave', () => {
    tooltip.hidden = true
  })
}

/** 时代高亮 repaint：activeBand 由 store 实时年份决定（跳时代自动跟随）；band 未变零开销 */
function repaintDensity(): void {
  const svg = document.getElementById('timeline-density') as SVGSVGElement | null
  if (!svg || !densityBuilt) return
  const activeBand = computeActiveBand()
  if (activeBand === lastActiveBand) return
  lastActiveBand = activeBand
  for (let i = 0; i < countsArr.length; i++) {
    const rect = svg.children[i] as SVGRectElement | undefined
    if (rect) rect.setAttribute('opacity', densityOpacity(countsArr[i], i))
  }
}

/** 底部时间轴：拖动选年、自动播放、时间窗口、键盘左右微调（活跃计数由快照面板负责） */
export function initTimeline(): void {
  const range = document.getElementById('year-range') as HTMLInputElement
  const playBtn = document.getElementById('play-btn') as HTMLButtonElement
  const yearText = document.querySelector('#year-readout b') as HTMLElement
  const eraText = document.getElementById('era-readout') as HTMLElement
  const windowSelect = document.getElementById('window-select') as HTMLSelectElement
  const speedSelect = document.getElementById('speed-select') as HTMLSelectElement

  range.min = String(YEAR_MIN)
  range.max = String(YEAR_MAX)
  buildDensity(false)
  repaintDensity()

  speedSelect.addEventListener('change', () => {
    appStore.getState().setPlaySpeed(Number(speedSelect.value) as 1 | 2 | 5)
  })

  range.addEventListener('input', () => {
    appStore.getState().setYear(Number(range.value))
  })

  playBtn.addEventListener('click', () => {
    const s = appStore.getState()
    // 播放到末尾后重新按下 = 从头开始
    if (!s.playing && s.year >= YEAR_MAX) s.setYear(YEAR_MIN)
    s.togglePlay()
  })

  windowSelect.addEventListener('change', () => {
    appStore.getState().setWindowSize(Number(windowSelect.value))
  })

  // 自动播放：1× 约 110ms 推进一年，2×/5× 按倍率加速；每逢十年一声极轻 tick
  let last = 0
  const step = (now: number): void => {
    const s = appStore.getState()
    if (s.playing && now - last >= 110 / s.playSpeed) {
      last = now
      const next = s.year >= YEAR_MAX ? YEAR_MIN : s.year + 1
      s.setYear(next)
      if (s.soundOn && next % 10 === 0) playTick()
    } else if (!s.playing) {
      last = now
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)

  // 时代视角联动：开关变化才重建（listener 只绑一次）；年份变化走高亮 repaint（V3.12）
  // 时代视角锁定 ±20 窗口 → 窗口选择器禁用（V3.16，避免"选了没效果"的困惑）
  appStore.subscribe((s) => {
    const on = (s as { eraSpanOn?: boolean }).eraSpanOn ?? false
    buildDensity(on)
    repaintDensity()
    windowSelect.disabled = on
    windowSelect.setAttribute('aria-disabled', String(on))
  })

  // 键盘 ←/→ 微调一年，Shift 加速十年（输入框内除外）
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement)
    ) {
      return
    }
    e.preventDefault()
    const delta = (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 10 : 1)
    const next = Math.min(YEAR_MAX, Math.max(YEAR_MIN, appStore.getState().year + delta))
    appStore.getState().setYear(next)
  })

  const sync = (s: { year: number; playing: boolean; windowSize: number; playSpeed: number }): void => {
    yearText.textContent = String(s.year)
    const era = eraOf(s.year)
    eraText.textContent = `· ${era.name.zh}`
    eraText.title = era.name.en
    if (Number(range.value) !== s.year) range.value = String(s.year)
    if (Number(speedSelect.value) !== s.playSpeed) speedSelect.value = String(s.playSpeed)
    playBtn.classList.toggle('is-playing', s.playing)
    playBtn.setAttribute('aria-label', s.playing ? '暂停时间演进' : '播放时间演进')
  }
  appStore.subscribe(sync)
  sync(appStore.getState()) // 初始同步（URL hash 恢复的年份）
}
