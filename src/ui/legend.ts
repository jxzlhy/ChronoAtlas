import { appStore } from '../store'
import { EVENT_TYPES } from '../data/events'

/** 左下角事件类型图例 + 热区开关 + 音效开关 */
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
    </button>
    <button id="sound-toggle" class="hotspot-toggle" type="button" aria-pressed="false"
            title="界面音效（默认关） · Interface sounds">
      <i aria-hidden="true"></i>音效 · Sound
    </button>`

  const hotspotBtn = document.getElementById('hotspot-toggle') as HTMLButtonElement
  const hotspotSync = (s: { hotspotsOn: boolean }): void => {
    hotspotBtn.classList.toggle('is-on', s.hotspotsOn)
    hotspotBtn.setAttribute('aria-pressed', String(s.hotspotsOn))
  }
  hotspotBtn.addEventListener('click', () => {
    const s = appStore.getState()
    s.setHotspotsOn(!s.hotspotsOn)
  })
  appStore.subscribe(hotspotSync)
  hotspotSync(appStore.getState())

  const soundBtn = document.getElementById('sound-toggle') as HTMLButtonElement
  const soundSync = (s: { soundOn: boolean }): void => {
    soundBtn.classList.toggle('is-on', s.soundOn)
    soundBtn.setAttribute('aria-pressed', String(s.soundOn))
  }
  soundBtn.addEventListener('click', () => {
    const s = appStore.getState()
    s.setSoundOn(!s.soundOn)
  })
  appStore.subscribe(soundSync)
  soundSync(appStore.getState())
}
