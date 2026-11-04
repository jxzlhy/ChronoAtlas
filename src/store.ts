import { createStore } from 'zustand/vanilla'
import type { Bilingual, ContinentKey, EventType, HistoryEvent } from './data/model'

// 数据模型统一移至 src/data/model.ts；此处重导出以兼容既有引用
export type { Bilingual, ContinentKey, EventType, HistoryEvent } from './data/model'

export interface AppState {
  year: number
  playing: boolean
  windowSize: number
  selectedId: string | null
  hoverId: string | null
  setYear: (y: number) => void
  setPlaying: (p: boolean) => void
  togglePlay: () => void
  setWindowSize: (w: number) => void
  select: (id: string | null) => void
  setHover: (id: string | null) => void
}

export const YEAR_MIN = 1750
export const YEAR_MAX = 1911

export const appStore = createStore<AppState>()((set) => ({
  year: 1850,
  playing: false,
  windowSize: 10,
  selectedId: null,
  hoverId: null,
  setYear: (year) => set({ year }),
  setPlaying: (playing) => set({ playing }),
  togglePlay: () => set((s) => ({ playing: !s.playing })),
  setWindowSize: (windowSize) => set({ windowSize }),
  select: (selectedId) => set({ selectedId }),
  setHover: (hoverId) => set({ hoverId }),
}))

/** 事件是否落在当前年份窗口内（windowSize 极大时视为全部显示） */
export function isActive(ev: HistoryEvent, year: number, windowSize: number): boolean {
  if (windowSize >= 9999) return true
  return ev.start - windowSize <= year && year <= ev.end + windowSize
}
