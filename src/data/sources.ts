import type { Source } from './model'

/**
 * 参考资料 registry（V1.0 起步覆盖：全部 22 条 importance=3 事件）。
 *
 * ⚠️ 纪律：每条 URL 均于 2026-11-05 逐一人工验证可达（Britannica 20 条 +
 * Wikipedia 2 条），禁止未经验证的链接入库；找不到可靠来源的事件保持
 * 无 sourceIds（待核实），不伪装成已完成史料审查。
 */
export const SOURCES: Source[] = [
  {
    id: 'brit-seven-years-war',
    name: { zh: '七年战争', en: "The Seven Years' War" },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Seven-Years-War',
    type: 'encyclopedia',
  },
  {
    id: 'brit-industrial-revolution',
    name: { zh: '工业革命', en: 'Industrial Revolution' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Industrial-Revolution',
    type: 'encyclopedia',
  },
  {
    id: 'brit-james-watt',
    name: { zh: '詹姆斯·瓦特（生平与蒸汽机）', en: 'James Watt' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/biography/James-Watt',
    type: 'encyclopedia',
  },
  {
    id: 'brit-declaration-independence',
    name: { zh: '《独立宣言》', en: 'Declaration of Independence' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/Declaration-of-Independence',
    type: 'encyclopedia',
  },
  {
    id: 'brit-wealth-of-nations',
    name: { zh: '《国富论》', en: 'The Wealth of Nations' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/The-Wealth-of-Nations',
    type: 'encyclopedia',
  },
  {
    id: 'brit-french-revolution',
    name: { zh: '法国大革命', en: 'French Revolution' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/French-Revolution',
    type: 'encyclopedia',
  },
  {
    id: 'brit-napoleonic-wars',
    name: { zh: '拿破仑战争', en: 'Napoleonic Wars' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Napoleonic-Wars',
    type: 'encyclopedia',
  },
  {
    id: 'brit-opium-wars',
    name: { zh: '鸦片战争', en: 'Opium Wars' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Opium-Wars',
    type: 'encyclopedia',
  },
  {
    id: 'brit-communist-manifesto',
    name: { zh: '《共产党宣言》', en: 'The Communist Manifesto' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/The-Communist-Manifesto',
    type: 'encyclopedia',
  },
  {
    id: 'brit-origin-of-species',
    name: { zh: '《物种起源》', en: 'Origin of Species' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/Origin-of-Species',
    type: 'encyclopedia',
  },
  {
    id: 'brit-american-civil-war',
    name: { zh: '美国内战', en: 'American Civil War' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/American-Civil-War',
    type: 'encyclopedia',
  },
  {
    id: 'brit-meiji-restoration',
    name: { zh: '明治维新', en: 'Meiji Restoration' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Meiji-Restoration',
    type: 'encyclopedia',
  },
  {
    id: 'brit-suez-canal',
    name: { zh: '苏伊士运河', en: 'Suez Canal' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/Suez-Canal',
    type: 'encyclopedia',
  },
  {
    id: 'brit-berlin-conference',
    name: { zh: '柏林会议（柏林西非会议）', en: 'Berlin Conference' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Berlin-West-Africa-Conference',
    type: 'encyclopedia',
  },
  {
    id: 'brit-first-sino-japanese-war',
    name: { zh: '第一次中日战争（甲午战争）', en: 'First Sino-Japanese War' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Sino-Japanese-War-1894-1895',
    type: 'encyclopedia',
    note: {
      zh: 'Britannica 用此条目专指 1894–1895 年甲午战争',
      en: 'Britannica uses this entry for the 1894–1895 war specifically',
    },
  },
  {
    id: 'brit-wright-brothers',
    name: { zh: '莱特兄弟', en: 'Wright brothers' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Wright-brothers',
    type: 'encyclopedia',
  },
  {
    id: 'brit-relativity',
    name: { zh: '相对论', en: 'Relativity' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/science/relativity',
    type: 'encyclopedia',
  },
  {
    id: 'wiki-1911-revolution',
    name: { zh: '辛亥革命（1911 年革命）', en: '1911 Revolution (Xinhai Revolution)' },
    publisher: { zh: '维基百科（自由百科全书）', en: 'Wikipedia, the Free Encyclopedia' },
    url: 'https://en.wikipedia.org/wiki/1911_Revolution',
    type: 'encyclopedia',
  },
  {
    id: 'brit-louisiana-purchase',
    name: { zh: '路易斯安那购地', en: 'Louisiana Purchase' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Louisiana-Purchase',
    type: 'encyclopedia',
  },
  {
    id: 'brit-taiping-rebellion',
    name: { zh: '太平天国运动', en: 'Taiping Rebellion' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/event/Taiping-Rebellion',
    type: 'encyclopedia',
  },
  {
    id: 'brit-transcontinental-railroad',
    name: { zh: '横贯大陆铁路', en: 'Transcontinental Railroad' },
    publisher: { zh: '大英百科全书', en: 'Encyclopædia Britannica' },
    url: 'https://www.britannica.com/topic/transcontinental-railroad',
    type: 'encyclopedia',
  },
  {
    id: 'wiki-emancipation-1861',
    name: { zh: '1861 年俄国农奴解放改革', en: 'Emancipation reform of 1861' },
    publisher: { zh: '维基百科（自由百科全书）', en: 'Wikipedia, the Free Encyclopedia' },
    url: 'https://en.wikipedia.org/wiki/Emancipation_reform_of_1861',
    type: 'encyclopedia',
  },
]
