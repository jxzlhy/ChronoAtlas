import gsap from 'gsap'

/**
 * 统一动效助手（PHASE E4）：全部面板入场/退场走同一 tween，
 * 新动画前 kill 旧动画（可中断），reduced-motion 用户直通零动画。
 * 面板关闭仍由调用方管理 hidden 时序（本助手只负责过渡）。
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 面板入场：淡入 + 轻微上移 */
export function panelIn(el: HTMLElement): void {
  gsap.killTweensOf(el)
  if (reduced) {
    gsap.set(el, { opacity: 1, y: 0 })
    return
  }
  gsap.fromTo(
    el,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', overwrite: true },
  )
}

/** 面板退场：淡出，完成后回调（调用方随后设置 hidden） */
export function panelOut(el: HTMLElement, done: () => void): void {
  gsap.killTweensOf(el)
  if (reduced) {
    done()
    return
  }
  gsap.to(el, {
    opacity: 0,
    y: 10,
    duration: 0.18,
    ease: 'power1.in',
    overwrite: true,
    onComplete: () => {
      gsap.set(el, { opacity: 1, y: 0 })
      done()
    },
  })
}
