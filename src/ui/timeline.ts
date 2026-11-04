import { appStore, isActive, YEAR_MAX, YEAR_MIN } from '../store'

/** 底部时间轴：拖动选年、自动播放、时间窗口、键盘左右微调（活跃计数由 slice 面板负责） */
export function initTimeline(): void {
  const range = document.getElementById('year-range') as HTMLInputElement
  const playBtn = document.getElementById('play-btn') as HTMLButtonElement
  const yearText = document.querySelector('#year-readout b') as HTMLElement
  const windowSelect = document.getElementById('window-select') as HTMLSelectElement

  range.min = String(YEAR_MIN)
  range.max = String(YEAR_MAX)

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

  // 自动播放：约每 110ms 推进一年
  let last = 0
  const step = (now: number): void => {
    const s = appStore.getState()
    if (s.playing && now - last >= 110) {
      last = now
      s.setYear(s.year >= YEAR_MAX ? YEAR_MIN : s.year + 1)
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

  const sync = (s: { year: number; playing: boolean; windowSize: number }): void => {
    yearText.textContent = String(s.year)
    if (Number(range.value) !== s.year) range.value = String(s.year)
    playBtn.classList.toggle('is-playing', s.playing)
    playBtn.setAttribute('aria-label', s.playing ? '暂停时间演进' : '播放时间演进')
  }
  appStore.subscribe(sync)
  sync(appStore.getState()) // 初始同步（URL hash 恢复的年份）
}
