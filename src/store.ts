import { createStore } from 'zustand/vanilla'

export type EventType =
  | 'politics'
  | 'war'
  | 'science'
  | 'economy'
  | 'ideas'
  | 'exploration'
  | 'society'

export interface Bilingual {
  zh: string
  en: string
}

export interface HistoryEvent {
  id: string
  title: Bilingual
  start: number
  end: number
  lat: number
  lon: number
  place: Bilingual
  type: EventType
  importance: 1 | 2 | 3
  desc: Bilingual
}

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
