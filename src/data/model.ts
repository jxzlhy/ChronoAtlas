/**
 * ChronoAtlas 数据模型（V1.0）— 事件 / 关系 / 人物 / 参考资料的统一接口。
 *
 * 设计原则（docs/CHRONOATLAS_V1_0_LIVING_HISTORY_MASTER_PLAN.md §4）：
 * - 兼容旧数据：新字段全部可选，只有 continent 为必填（可由坐标客观判定）。
 * - 不编造精度：时间/地理精度仅在偏离缺省推导时才写；缺省按字段推导
 *   （时间：同年 = year、跨年 = period；地理：city）。
 * - 不伪装审查：review 缺省视为 pending（待核实），只有挂接已验证来源、
 *   经人工复核的事件/关系才标 reviewed。
 */

export interface Bilingual {
  zh: string
  en: string
}

export type EventType =
  | 'politics'
  | 'war'
  | 'science'
  | 'economy'
  | 'ideas'
  | 'exploration'
  | 'society'

/** 时间精度：year=确切到年，period=时间段，circa=约略年代，month/day=有月/日记录 */
export type TimePrecision = 'year' | 'month' | 'day' | 'period' | 'circa'

/** 地理精度：city=城市级，region=次国家区域，country=国家级，multi=多地点，global=全球性 */
export type GeoPrecision = 'city' | 'region' | 'country' | 'multi' | 'global'

/**
 * 所属大洲。polar 仅用于北极等不属于任何大洲的极地事件；
 * antarctica 仅用于南极。两者不参与大洲导航与快照大洲分组。
 */
export type ContinentKey =
  | 'asia'
  | 'europe'
  | 'africa'
  | 'north-america'
  | 'south-america'
  | 'oceania'
  | 'antarctica'
  | 'polar'

/** 数据审核状态；缺省 = pending（待核实） */
export type ReviewStatus = 'reviewed' | 'pending'

export interface HistoryEvent {
  id: string
  title: Bilingual
  start: number
  end: number
  /** 缺省推导：start === end ? 'year' : 'period'；仅偏离时显式书写 */
  timePrecision?: TimePrecision
  lat: number
  lon: number
  /** 缺省 'city'；仅偏离时显式书写 */
  geoPrecision?: GeoPrecision
  place: Bilingual
  continent: ContinentKey
  type: EventType
  importance: 1 | 2 | 3
  desc: Bilingual
  tags?: string[]
  /** 参考资料引用（sources.ts 中的 id），须经人工验证 URL 后才可挂接 */
  sourceIds?: string[]
  review?: ReviewStatus
}

/**
 * 关系类型：严格区分"时间先后"与"因果"。
 * - direct-cause：直接因果（战败 → 割地）
 * - indirect-influence：间接影响（思想传播、示范效应）
 * - background：背景条件（社会土壤、时代环境）
 * - related：历史关联（同题并置，无因果主张）
 * - reaction：回应或反应（针对前者的对策）
 * - continuation：延续或发展（前一进程的延长）
 */
export type LinkKind =
  | 'direct-cause'
  | 'indirect-influence'
  | 'background'
  | 'related'
  | 'reaction'
  | 'continuation'

/** 事件关系边表。from = 前项，to = 后项；kind 必填，禁止缺省当因果。 */
export interface EventLink {
  from: string
  to: string
  kind: LinkKind
  zh: string
  en: string
  /** 支持该关系的来源（sources.ts）；逐条补录中，缺省 = 待补 */
  sourceIds?: string[]
  review?: ReviewStatus
}

export interface Person {
  id: string
  name: Bilingual
  /** 生卒年或活动期，如 '1713 – 1784' / 'fl. 1860s' */
  life: string
  bio: Bilingual
  /** 挂接事件；第一个为主事件（搜索跳转目标） */
  eventIds: string[]
  sourceIds?: string[]
  review?: ReviewStatus
}

/** 参考资料类型 */
export type SourceType = 'encyclopedia' | 'archive' | 'museum' | 'database' | 'publication'

export interface Source {
  id: string
  /** 资料名称（文章/条目题名） */
  name: Bilingual
  /** 发布机构 */
  publisher: Bilingual
  /** 必须于入库前人工验证可达；禁止虚构 */
  url: string
  type: SourceType
  /** 备注（口径、版本、覆盖范围等） */
  note?: Bilingual
}
