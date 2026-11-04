import { appStore } from '../store'
import { EVENT_TYPES } from '../data/events'

/** 左下角事件类型图例 + 热区模式开关 */
export function initLegend(): void {
  const legend = document.getElementById('legend') as HTMLElement
  legend.innerHTML = `
    <div class="legend-types">
      ${Object.entries(EVENT_TYPES)
        .map(([, t]) => `<span class="legend-item"><i style="background:${t.color}"></i>${t.zh}</span>`)
        .join('')}
    </div>
    <button id="hotspot-toggle" class="hotspot-toggle" type="button" aria-pressed="false"
            title="热区：已收录事件的空间密度，非历史概率 · Hotspots (H)">
      <i aria-hidden="true"></i>热区 · Hotspots
    </button>`

  const toggle = document.getElementById('hotspot-toggle') as HTMLButtonElement
  const sync = (s: { hotspotsOn: boolean }): void => {
    toggle.classList.toggle('is-on', s.hotspotsOn)
    toggle.setAttribute('aria-pressed', String(s.hotspotsOn))
  }
  toggle.addEventListener('click', () => {
    const s = appStore.getState()
    s.setHotspotsOn(!s.hotspotsOn)
  })
  appStore.subscribe(sync)
  sync(appStore.getState())
}
