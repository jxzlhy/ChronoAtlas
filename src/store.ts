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
  /** 关系弧线跳数（1 = 直接关系，3 = 长河多跳） */
  arcsDepth: 1 | 3
  setYear: (y: number) => void
  setPlaying: (p: boolean) => void
  togglePlay: () => void
  setPlaySpeed: (v: 1 | 2 | 5) => void
  setWindowSize: (w: number) => void
  select: (id: string | null) => void
  setHover: (id: string | null) => void
  setTypeFilter: (t: EventType | null) => void
  setContinentFilter: (c: ContinentKey | null) => void
  setArcsDepth: (d: 1 | 3) => void
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
  arcsDepth: 3,
  setYear: (year) => set({ year }),
  setPlaying: (playing) => set({ playing }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setPlaySpeed: (playSpeed) => set({ playSpeed }),
  setWindowSize: (windowSize) => set({ windowSize }),
  select: (selectedId) => set({ selectedId }),
  setHover: (hoverId) => set({ hoverId }),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setContinentFilter: (continentFilter) => set({ continentFilter }),
  setArcsDepth: (arcsDepth) => set({ arcsDepth }),
}))

/** 事件是否落在当前年份窗口内（windowSize 极大时视为全部显示） */
export function isActive(ev: HistoryEvent, year: number, windowSize: number): boolean {
  if (windowSize >= 9999) return true
  return ev.start - windowSize <= year && year <= ev.end + windowSize
}

/** 事件是否通过当前快照筛选（类型 + 大洲） */
export function matchesFilters(
  ev: HistoryEvent,
  s: Pick<AppState, 'typeFilter' | 'continentFilter'>,
): boolean {
  return (
    (s.typeFilter === null || ev.type === s.typeFilter) &&
    (s.continentFilter === null || ev.continent === s.continentFilter)
  )
}
