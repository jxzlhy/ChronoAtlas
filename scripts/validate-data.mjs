/**
 * ChronoAtlas 数据完整性校验（npm run validate:data）
 * 用法：node --experimental-strip-types scripts/validate-data.mjs
 *
 * 检查：重复 ID / 悬空引用 / 年代与坐标合理性 / 类型与大洲合法 /
 * 双语完整性 / 关系类型合法性 / 来源引用有效 / 人物生卒与事件年代冲突。
 * 输出数据画像（分类/大洲/来源覆盖/审核覆盖）。errors 退出码 1，warnings 仅提示。
 */
import { EVENTS, EVENT_TYPES } from '../src/data/events.ts'
import { LINKS } from '../src/data/links.ts'
import { PEOPLE } from '../src/data/people.ts'
import { SOURCES } from '../src/data/sources.ts'

const CONTINENT_KEYS = new Set([
  'asia', 'europe', 'africa', 'north-america', 'south-america', 'oceania', 'antarctica', 'polar',
])
const LINK_KINDS = new Set([
  'direct-cause', 'indirect-influence', 'background', 'related', 'reaction', 'continuation',
])
const TIME_PRECISIONS = new Set(['year', 'month', 'day', 'period', 'circa'])
const GEO_PRECISIONS = new Set(['city', 'region', 'country', 'multi', 'global'])

const errors = []
const warnings = []
const err = (msg) => errors.push(msg)
const warn = (msg) => warnings.push(msg)

const isBilingual = (v) =>
  !!v && typeof v.zh === 'string' && v.zh.trim() !== '' && typeof v.en === 'string' && v.en.trim() !== ''

// ---------- 事件 ----------
const byId = new Map()
for (const ev of EVENTS) {
  const tag = `event:${ev.id}`
  if (byId.has(ev.id)) err(`${tag} 重复 ID`)
  byId.set(ev.id, ev)

  if (!Number.isInteger(ev.start) || !Number.isInteger(ev.end)) err(`${tag} 起止年份必须为整数`)
  else {
    if (ev.start > ev.end) err(`${tag} 起始年 ${ev.start} 晚于结束年 ${ev.end}`)
    if (ev.start < 1400 || ev.end > 2000) err(`${tag} 年代超出合理范围 (${ev.start}–${ev.end})`)
    else if (ev.start < 1750 || ev.end > 1911)
      warn(`${tag} 年代 (${ev.start}–${ev.end}) 超出核心区间 1750–1911`)
  }
  if (!Number.isFinite(ev.lat) || Math.abs(ev.lat) > 90) err(`${tag} 纬度非法: ${ev.lat}`)
  if (!Number.isFinite(ev.lon) || Math.abs(ev.lon) > 180) err(`${tag} 经度非法: ${ev.lon}`)
  if (!(ev.type in EVENT_TYPES)) err(`${tag} 类型非法: ${ev.type}`)
  if (![1, 2, 3].includes(ev.importance)) err(`${tag} 重要度非法: ${ev.importance}`)
  if (!CONTINENT_KEYS.has(ev.continent)) err(`${tag} 大洲非法: ${ev.continent}`)
  if (!isBilingual(ev.title)) err(`${tag} 标题双语缺失`)
  if (!isBilingual(ev.place)) err(`${tag} 地点双语缺失`)
  if (!isBilingual(ev.desc)) err(`${tag} 描述双语缺失`)
  if (ev.timePrecision !== undefined && !TIME_PRECISIONS.has(ev.timePrecision))
    err(`${tag} 时间精度非法: ${ev.timePrecision}`)
  if (ev.geoPrecision !== undefined && !GEO_PRECISIONS.has(ev.geoPrecision))
    err(`${tag} 地理精度非法: ${ev.geoPrecision}`)
  if (ev.review !== undefined && !['reviewed', 'pending'].includes(ev.review))
    err(`${tag} 审核状态非法: ${ev.review}`)
  if ((ev.review ?? 'pending') === 'reviewed' && (ev.sourceIds?.length ?? 0) === 0)
    err(`${tag} 标记 reviewed 但没有挂接任何来源`)
}

// ---------- 关系 ----------
const pairSeen = new Set()
for (const l of LINKS) {
  const tag = `link:${l.from}>${l.to}`
  if (!byId.has(l.from)) err(`${tag} 悬空引用 from`)
  if (!byId.has(l.to)) err(`${tag} 悬空引用 to`)
  if (l.from === l.to) err(`${tag} 自环`)
  const key = `${l.from}|${l.to}`
  if (pairSeen.has(key)) err(`${tag} 重复边`)
  pairSeen.add(key)
  if (!LINK_KINDS.has(l.kind)) err(`${tag} 关系类型非法: ${l.kind}`)
  if (!isBilingual({ zh: l.zh, en: l.en })) err(`${tag} 关系说明双语缺失`)
  if (l.review !== undefined && !['reviewed', 'pending'].includes(l.review))
    err(`${tag} 审核状态非法: ${l.review}`)
  // 时序合理性：直接因果的前项应不晚于后项开始（背景/间接可放宽，仅警告）
  const f = byId.get(l.from)
  const t = byId.get(l.to)
  if (f && t && l.kind === 'direct-cause' && f.start > t.start)
    warn(`${tag} direct-cause 但前项起始 (${f.start}) 晚于后项起始 (${t.start})`)
}

// ---------- 人物 ----------
const personSeen = new Set()
for (const p of PEOPLE) {
  const tag = `person:${p.id}`
  if (personSeen.has(p.id)) err(`${tag} 重复 ID`)
  personSeen.add(p.id)
  if (!isBilingual(p.name)) err(`${tag} 姓名双语缺失`)
  if (!isBilingual(p.bio)) err(`${tag} 简介双语缺失`)
  if (p.life.trim() === '') err(`${tag} 生卒年缺失`)
  if (p.eventIds.length === 0) err(`${tag} 未挂接任何事件`)
  for (const id of p.eventIds) if (!byId.has(id)) err(`${tag} 悬空事件引用: ${id}`)

  const m = p.life.match(/(\d{3,4})\s*[–—-]\s*(\d{3,4})?/)
  if (m) {
    const birth = Number(m[1])
    const death = m[2] ? Number(m[2]) : null
    for (const id of p.eventIds) {
      const ev = byId.get(id)
      if (!ev) continue
      if (death !== null && ev.start > death + 10)
        warn(`${tag} 挂接事件 ${id} (${ev.start}) 晚于卒年 ${death} +10 年`)
      if (ev.end < birth - 15) warn(`${tag} 挂接事件 ${id} (${ev.end}) 早于生年 ${birth} -15 年`)
    }
  }
}

// ---------- 来源 ----------
const srcIds = new Set()
for (const s of SOURCES) {
  const tag = `source:${s.id}`
  if (srcIds.has(s.id)) err(`${tag} 重复 ID`)
  srcIds.add(s.id)
  if (!isBilingual(s.name)) err(`${tag} 名称双语缺失`)
  if (!isBilingual(s.publisher)) err(`${tag} 机构双语缺失`)
  if (!/^https:\/\/(www\.)?([a-z0-9-]+\.)+[a-z]{2,}\//.test(s.url))
    err(`${tag} URL 格式非法: ${s.url}`)
}

const checkSourceRef = (owner, sid) => {
  if (!srcIds.has(sid)) err(`${owner} 悬空来源引用: ${sid}`)
}
for (const ev of EVENTS) for (const sid of ev.sourceIds ?? []) checkSourceRef(`event:${ev.id}`, sid)
for (const pr of PEOPLE) for (const sid of pr.sourceIds ?? []) checkSourceRef(`person:${pr.id}`, sid)
for (const l of LINKS) for (const sid of l.sourceIds ?? []) checkSourceRef(`link:${l.from}>${l.to}`, sid)

// ---------- 数据画像 ----------
const countBy = (list, fn) => {
  const m = new Map()
  for (const item of list) {
    const k = fn(item)
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return m
}
const typeStat = countBy(EVENTS, (e) => e.type)
const contStat = countBy(EVENTS, (e) => e.continent)
const kindStat = countBy(LINKS, (l) => l.kind)
const sourced = EVENTS.filter((e) => (e.sourceIds?.length ?? 0) > 0)
const reviewed = EVENTS.filter((e) => e.review === 'reviewed')
const imp3 = EVENTS.filter((e) => e.importance === 3)
const imp3Sourced = imp3.filter((e) => (e.sourceIds?.length ?? 0) > 0)

console.log('=== ChronoAtlas 数据画像 ===')
console.log(
  `事件 ${EVENTS.length} · 关系 ${LINKS.length} · 人物 ${PEOPLE.length} · 来源 ${SOURCES.length}`,
)
console.log('类型:', [...typeStat].map(([k, v]) => `${k}=${v}`).join(' '))
console.log('大洲:', [...contStat].map(([k, v]) => `${k}=${v}`).join(' '))
console.log('关系类型:', [...kindStat].map(([k, v]) => `${k}=${v}`).join(' '))

// ---- 数据质量报告（PHASE A4）----
const pct = (n, d) => (d === 0 ? 'n/a' : `${Math.round((n / d) * 100)}%`)
const personSourced = PEOPLE.filter((x) => (x.sourceIds?.length ?? 0) > 0)
const linkSourced = LINKS.filter((x) => (x.sourceIds?.length ?? 0) > 0)
const reviewedLinks = LINKS.filter((x) => x.review === 'reviewed')
const pendingPeople = PEOPLE.filter((x) => x.review !== 'reviewed')
const bilingualEvents = EVENTS.filter(
  (e) => isBilingual(e.title) && isBilingual(e.desc) && isBilingual(e.place),
).length
console.log('--- 数据质量报告 ---')
console.log(
  `来源覆盖: 事件 ${sourced.length}/${EVENTS.length} (${pct(sourced.length, EVENTS.length)}) · importance=3 ${imp3Sourced.length}/${imp3.length} · 人物 ${personSourced.length}/${PEOPLE.length} (${pct(personSourced.length, PEOPLE.length)}) · 关系 ${linkSourced.length}/${LINKS.length} (${pct(linkSourced.length, LINKS.length)})`,
)
console.log(
  `审核状态: 事件 reviewed ${reviewed.length}/${EVENTS.length} (${pct(reviewed.length, EVENTS.length)}) · 关系 reviewed ${reviewedLinks.length}/${LINKS.length} · 人物 pending ${pendingPeople.length}/${PEOPLE.length}`,
)
console.log(
  `双语完整率: 事件 ${bilingualEvents}/${EVENTS.length} (${pct(bilingualEvents, EVENTS.length)})`,
)
console.log(
  `无来源事件: ${EVENTS.length - sourced.length} · 无来源人物: ${PEOPLE.length - personSourced.length} · 无来源关系: ${LINKS.length - linkSourced.length}`,
)
const isolated = PEOPLE.filter((x) => x.eventIds.length === 0).length
console.log(`孤立人物(零事件挂接): ${isolated}`)

console.log('\n=== 校验结果 ===')
console.log(`errors: ${errors.length} · warnings: ${warnings.length}`)
for (const e of errors) console.log('  ✗', e)
for (const w of warnings) console.log('  ⚠', w)

if (errors.length > 0) process.exit(1)
console.log('数据校验通过 ✓')
