import { createStore } from 'zustand/vanilla'
import type { Bilingual, ContinentKey, EventType, HistoryEvent } from './data/model'

// 数据模型统一移至 src/data/model.ts；此处重导出以兼容既有引用
export type { Bilingual, ContinentKey, EventType, HistoryEvent } from './data/model'

export interface AppState {
  year: number
  playing: boolean
  /** 播放速度倍率（1×/2×/5×，作用于推进间隔） */
  playSpeed: 1 | 2 | 5
  windowSize: number
  selectedId: string | null
  hoverId: string | null
  /** 快照面板筛选：null = 不过滤；影响地球棱柱明暗与随机发现 */
  typeFilter: EventType | null
  continentFilter: ContinentKey | null
  /** 文明筛选（PHASE F 深化）：null = 不过滤 */
  civFilter: string | null
  /** 关系弧线跳数（1 = 直接关系，3 = 长河多跳） */
  arcsDepth: 1 | 3
  /** 历史热区模式开关（展示已收录事件的空间密度） */
  hotspotsOn: boolean
  /** 界面音效（Web Audio 合成，默认关；localStorage 记忆） */
  soundOn: boolean
  /** 当前人物档案（人物卡独立探索入口；null = 关闭） */
  selectedPersonId: string | null
  /** 当前历史航线（URL 分享恢复；null = 关闭） */
  selectedRouteId: string | null
  /** 时代视角下热区权重偏向时代核心段 */
  hotspotsEraBoost: boolean
  /** 时代视角开启（密度条时代高亮联动） */
  eraSpanOn: boolean
  setYear: (y: number) => void
  setPlaying: (p: boolean) => void
  togglePlay: () => void
  setPlaySpeed: (v: 1 | 2 | 5) => void
  setWindowSize: (w: number) => void
  select: (id: string | null) => void
  setHover: (id: string | null) => void
  setTypeFilter: (t: EventType | null) => void
  setContinentFilter: (c: ContinentKey | null) => void
  setCivFilter: (c: string | null) => void
  setArcsDepth: (d: 1 | 3) => void
  setHotspotsOn: (v: boolean) => void
  setSoundOn: (v: boolean) => void
  selectPerson: (id: string | null) => void
  selectRoute: (id: string | null) => void
  setHotspotsEraBoost: (v: boolean) => void
  setEraSpanOn: (v: boolean) => void
}

export const YEAR_MIN = 1750
export const YEAR_MAX = 1911

export const appStore = createStore<AppState>()((set) => ({
  year: 1850,
  playing: false,
  playSpeed: 1,
  windowSize: 10,
  selectedId: null,
  hoverId: null,
  typeFilter: null,
  continentFilter: null,
  civFilter: null,
  arcsDepth: 3,
  hotspotsOn: false,
  soundOn: false,
  selectedPersonId: null,
  selectedRouteId: null,
  hotspotsEraBoost: false,
  eraSpanOn: false,
  setYear: (year) => set({ year }),
  setPlaying: (playing) => set({ playing }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setPlaySpeed: (playSpeed) => set({ playSpeed }),
  setWindowSize: (windowSize) => set({ windowSize }),
  select: (selectedId) => set({ selectedId }),
  setHover: (hoverId) => set({ hoverId }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setContinentFilter: (continentFilter) => set({ continentFilter }),
  setCivFilter: (civFilter) => set({ civFilter }),
  setArcsDepth: (arcsDepth) => set({ arcsDepth }),
  setHotspotsOn: (hotspotsOn) => set({ hotspotsOn }),
  setSoundOn: (soundOn) => set({ soundOn }),
  selectPerson: (selectedPersonId) => set({ selectedPersonId }),
  selectRoute: (selectedRouteId) => set({ selectedRouteId }),
  setHotspotsEraBoost: (hotspotsEraBoost) => set({ hotspotsEraBoost }),
  setEraSpanOn: (eraSpanOn) => set({ eraSpanOn }),
}))

// 音效偏好记忆（首次访问默认关；无法读写时静默跳过）
try {
  const saved = localStorage.getItem('chrono-sound')
  if (saved === 'on') appStore.getState().setSoundOn(true)
} catch {
  /* storage 不可用 */
}
appStore.subscribe((s) => {
  try {
    localStorage.setItem('chrono-sound', s.soundOn ? 'on' : 'off')
  } catch {
    /* storage 不可用 */
  }
})

/** 事件是否落在当前年份窗口内（windowSize 极大时视为全部显示） */
export function isActive(ev: HistoryEvent, year: number, windowSize: number): boolean {
  if (windowSize >= 9999) return true
  return ev.start - windowSize <= year && year <= ev.end + windowSize
}

/** 事件是否通过当前快照筛选（类型 + 大洲 + 文明） */
export function matchesFilters(
  ev: HistoryEvent,
  s: Pick<AppState, 'typeFilter' | 'continentFilter' | 'civFilter'>,
): boolean {
  return (
    (s.typeFilter === null || ev.type === s.typeFilter) &&
    (s.continentFilter === null || ev.continent === s.continentFilter) &&
    (s.civFilter === null || (ev.civilizations ?? []).includes(s.civFilter))
  )
}
