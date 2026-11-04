import type { Bilingual } from './model'

export interface EraBand {
  from: number
  to: number
  /** 时代名（双语） */
  name: Bilingual
  /** 一句话时代背景（双语，基于数据集内已收录事件的通行史实概括） */
  blurb: Bilingual
}

/**
 * 时代分期（1750–1911）。学术通行划分方式之一（任务书 §5 允许不同划分），
 * 边界取标志性事件年：1776 美国独立 / 1815 维也纳会议 / 1848 革命浪潮 /
 * 1871 巴黎公社与德意志统一 / 1898 美西战争与戊戌变法。
 * 供世界快照面板与时间轴年代提示使用；扩时间范围时在首尾增删波段即可。
 */
export const ERA_BANDS: EraBand[] = [
  {
    from: 1750,
    to: 1775,
    name: { zh: '启蒙与旧制度', en: 'Enlightenment & the Old Regime' },
    blurb: {
      zh: '百科全书派汇编知识，启蒙思想在沙龙中酝酿，旧君主制与全球商业扩张并行。',
      en: 'Encyclopédistes compiled knowledge and salons brewed critique, while old monarchies and maritime trade expanded.',
    },
  },
  {
    from: 1776,
    to: 1815,
    name: { zh: '革命年代', en: 'The Age of Revolutions' },
    blurb: {
      zh: '从美国独立到拿破仑战争，主权在民的理念席卷大西洋世界，旧秩序接连崩解。',
      en: 'From American independence to Waterloo, popular sovereignty swept the Atlantic world and old orders crumbled.',
    },
  },
  {
    from: 1816,
    to: 1848,
    name: { zh: '维也纳体系与早期工业化', en: 'Concert of Europe & Early Industry' },
    blurb: {
      zh: '大国协商维系均势，铁路与工厂改写经济地理，改革与起义在帝国边缘滋长。',
      en: 'Great-power congresses held the balance while railways and factories rewrote economic geography.',
    },
  },
  {
    from: 1849,
    to: 1871,
    name: { zh: '民族之春与统一', en: 'Springtime of Nations & Unification' },
    blurb: {
      zh: '革命浪潮席卷欧洲，意大利与德国走向统一，美国内战与俄国农奴解放重划制度疆界。',
      en: 'Italy and Germany unified while civil war in America and emancipation in Russia redrew institutions.',
    },
  },
  {
    from: 1872,
    to: 1897,
    name: { zh: '帝国主义时代', en: 'The Age of Imperialism' },
    blurb: {
      zh: '列强瓜分非洲与亚洲腹地，电气与化学工业开启第二次工业革命，抵抗运动此起彼伏。',
      en: 'Powers carved Africa and Asia; electricity and chemistry drove a second industrial revolution; resistance flared.',
    },
  },
  {
    from: 1898,
    to: 1911,
    name: { zh: '革命前夜', en: 'On the Eve of Upheaval' },
    blurb: {
      zh: '帝国战争与东亚变局交织，清廷新政接连受挫，旧秩序在革命浪潮中行将瓦解。',
      en: 'Imperial wars and East Asian upheavals intertwined; late-Qing reforms faltered and the old order neared collapse.',
    },
  },
]

/** 返回年份所属时代波段（越界则夹取到首末波段） */
export function eraOf(year: number): EraBand {
  if (year < ERA_BANDS[0].from) return ERA_BANDS[0]
  for (const band of ERA_BANDS) {
    if (year <= band.to) return band
  }
  return ERA_BANDS[ERA_BANDS.length - 1]
}
