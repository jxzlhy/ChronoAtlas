/**
 * 界面音效（V1.0-M6，ROADMAP P2）：Web Audio 实时合成，零依赖零资源文件。
 * 全部函数在 soundOn 关闭、AudioContext 创建失败或受限时静默返回——
 * 音效永远只是增强，不阻塞任何交互。
 */
let ctx: AudioContext | null = null

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx
  try {
    ctx = new AudioContext()
  } catch {
    ctx = null
  }
  return ctx
}

function tone(
  freqStart: number,
  freqEnd: number,
  duration: number,
  gain: number,
  type: OscillatorType = 'sine',
): void {
  const ac = ensureCtx()
  if (!ac || ac.state === 'suspended') return
  try {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = type
    const t0 = ac.currentTime
    osc.frequency.setValueAtTime(freqStart, t0)
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), t0 + duration)
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.connect(g).connect(ac.destination)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  } catch {
    /* 合成失败静默 */
  }
}

/** 选中事件/人物：短促清脆的双音 blip */
export function playSelect(): void {
  tone(660, 880, 0.09, 0.12)
}

/** 镜头飞行启动：柔和低→高 sweep */
export function playFly(): void {
  tone(220, 520, 0.22, 0.07, 'triangle')
}

/** 时间轴自动播放 tick：极短极轻（每年一次） */
export function playTick(): void {
  tone(1320, 1240, 0.03, 0.035, 'square')
}
