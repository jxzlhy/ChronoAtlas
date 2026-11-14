import { EVENTS } from '../data/events'
import type { HotZones } from '../scene/HotZones'

/**
 * 热区悬停信息预览（V3.9）：光晕 hover 时跟随鼠标显示
 * 「簇事件数 · 代表事件名」双语 tooltip（密度热区此前无任何悬停反馈）。
 * 数据全部来自 HotZones.getClusterInfo，不虚构簇内容。
 */
export function initHotzoneTip(hotspots: HotZones): {
  show: (topId: string, x: number, y: number) => void
  hide: () => void
} {
  const tip = document.createElement('div')
  tip.className = 'hotzone-tip'
  tip.id = 'hotzone-tip'
  tip.hidden = true
  document.body.appendChild(tip)

  const show = (topId: string, x: number, y: number): void => {
    const info = hotspots.getClusterInfo(topId)
    if (!info) {
      hide()
      return
    }
    const ev = EVENTS.find((e) => e.id === info.topId)
    if (!ev) {
      hide()
      return
    }
    tip.textContent = `${info.count} 个事件 · 代表：${ev.title.zh}\n${info.count} events · Representative: ${ev.title.en}`
    tip.hidden = false
    // 跟随鼠标（右下偏移），贴近右/下边缘时翻转防溢出
    const pad = 14
    const flipX = x + pad + tip.offsetWidth > window.innerWidth
    const flipY = y + pad + tip.offsetHeight > window.innerHeight
    tip.style.left = `${flipX ? x - tip.offsetWidth - 10 : x + pad}px`
    tip.style.top = `${flipY ? y - tip.offsetHeight - 10 : y + pad}px`
  }
  const hide = (): void => {
    tip.hidden = true
  }
  return { show, hide }
}
