import { appStore, isActive, YEAR_MAX, YEAR_MIN } from '../store'
import { EVENTS } from '../data/events'
import { eraOf } from '../data/eras'
import { playTick } from './sound'

/** 事件密度条：每年 1 柱（全数据集重叠计数，与时间窗口无关），点击快速跳年 */
function buildDensity(): void {
  const svg = document.getElementById('timeline-density') as SVGSVGElement | null
  if (!svg) return
  const years = YEAR_MAX - YEAR_MIN + 1
  const counts = new Array<number>(years).fill(0)
  let max = 0
  for (const ev of EVENTS) {
    for (let y = Math.max(ev.start, YEAR_MIN); y <= Math.min(ev.end, YEAR_MAX); y++) {
      counts[y - YEAR_MIN]++
      max = Math.max(max, counts[y - YEAR_MIN])
    }
  }
  const H = 20
  svg.setAttribute('viewBox', `0 0 ${years} ${H}`)
  svg.innerHTML = counts
    .map((c, i) => {
      if (c === 0) return `<rect x="${i + 0.1}" y="${H - 1}" width="0.8" height="1" fill="#22d3ee" opacity="0.1" />`
      const h = 1 + (c / max) * (H - 3)
      return `<rect x="${i + 0.1}" y="${(H - h).toFixed(2)}" width="0.8" height="${h.toFixed(2)}" fill="#22d3ee" opacity="${(0.2 + 0.45 * (c / max)).toFixed(2)}" />`
    })
    .join('')
  svg.addEventListener('click', (e) => {
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const year = Math.round(YEAR_MIN + frac * (years - 1))
    appStore.getState().setYear(year)
  })
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
  buildDensity()

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
