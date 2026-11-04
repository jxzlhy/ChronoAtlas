import { EVENT_TYPES } from '../data/events'

/** 左下角事件类型图例 */
export function initLegend(): void {
  const legend = document.getElementById('legend') as HTMLElement
  legend.innerHTML = Object.entries(EVENT_TYPES)
    .map(
      ([, t]) =>
        `<span class="legend-item"><i style="background:${t.color}"></i>${t.zh}</span>`,
    )
    .join('')
}
