import type { Bilingual, EventType, HistoryEvent } from './model'

/** 事件类型的展示名与主题色 */
export const EVENT_TYPES: Record<EventType, { zh: string; en: string; color: string }> = {
  politics: { zh: '政治', en: 'Politics', color: '#f59e0b' },
  war: { zh: '战争', en: 'War', color: '#ef4444' },
  science: { zh: '科技', en: 'Science', color: '#22d3ee' },
  economy: { zh: '经济', en: 'Economy', color: '#eab308' },
  ideas: { zh: '思想', en: 'Ideas', color: '#a78bfa' },
  exploration: { zh: '探索', en: 'Exploration', color: '#34d399' },
  society: { zh: '社会', en: 'Society', color: '#f472b6' },
}

/** 大洲快速定位的相机目标（纬度 / 经度 / 距离） */
export const CONTINENTS: Record<string, Bilingual & { lat: number; lon: number; dist: number }> = {
  north: { zh: '正北', en: 'Reset', lat: 30, lon: 0, dist: 2.9 },
  world: { zh: '全球', en: 'World', lat: 22, lon: 12, dist: 3.0 },
  asia: { zh: '亚洲', en: 'Asia', lat: 32, lon: 92, dist: 2.35 },
  europe: { zh: '欧洲', en: 'Europe', lat: 50, lon: 16, dist: 2.2 },
  africa: { zh: '非洲', en: 'Africa', lat: 6, lon: 21, dist: 2.4 },
  'north-america': { zh: '北美洲', en: 'N. America', lat: 44, lon: -99, dist: 2.4 },
  'south-america': { zh: '南美洲', en: 'S. America', lat: -14, lon: -60, dist: 2.4 },
  oceania: { zh: '大洋洲', en: 'Oceania', lat: -25, lon: 140, dist: 2.5 },
}

/**
 * 精选历史事件数据集（公元 1750–1911）。
 * 字段见 model.ts#HistoryEvent：双语标题 / 起止年份 / 坐标 / 大洲 / 双语地点 /
 * 类型 / 重要度(1-3) / 双语描述；可选精度、来源与审核状态。
 * - sourceIds 仅挂接已人工验证 URL 的资料（sources.ts）；
 * - review: 'reviewed' 表示已挂来源并复核；缺省 = 待核实，不伪装完成。
 */
export const EVENTS: HistoryEvent[] = [
  {
    id: 'encyclopedie',
    title: { zh: '《百科全书》编纂出版', en: 'The Encyclopédie' },
    start: 1751, end: 1772, lat: 48.86, lon: 2.35,
    continent: 'europe',

    sourceIds: ['brit-encyclopedie'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'ideas', importance: 2,
    desc: {
      zh: '狄德罗与达朗贝尔主编的《百科全书》陆续出版，系统汇编人类知识，成为启蒙运动最重要的思想工程之一。',
      en: 'Edited by Diderot and d\'Alembert, the Encyclopédie systematically compiled human knowledge and became one of the defining intellectual projects of the Enlightenment.',
    },
  },
  {
    id: 'seven-years-war',
    title: { zh: '七年战争', en: 'The Seven Years\' War' },
    start: 1756, end: 1763, lat: 50.8, lon: 8.6,
    continent: 'europe',

    civilizations: ['european'],    geoPrecision: 'multi',
    place: { zh: '欧洲 · 中欧', en: 'Central Europe' },
    type: 'war', importance: 3,
    sourceIds: ['brit-seven-years-war'],
    review: 'reviewed',
    desc: {
      zh: '英普对阵法奥俄的全球性战争，战火波及欧洲、北美与印度，战后英国一跃成为海上殖民霸主。',
      en: 'A truly global conflict between Britain–Prussia and France–Austria–Russia, fought across Europe, North America and India. Britain emerged as the dominant colonial sea power.',
    },
  },
  {
    id: 'industrial-revolution',
    title: { zh: '工业革命', en: 'The Industrial Revolution' },
    start: 1760, end: 1840, lat: 52.9, lon: -1.9,
    continent: 'europe',

    civilizations: ['european'],    geoPrecision: 'region',
    timePrecision: 'circa',
    place: { zh: '英国 · 伯明翰一带', en: 'Birmingham, Britain' },
    type: 'economy', importance: 3,
    sourceIds: ['brit-industrial-revolution'],
    review: 'reviewed',
    desc: {
      zh: '从棉纺织业开始的机器生产变革由英国蔓延至欧陆与北美，工厂、铁路与城市化彻底重塑了人类的生产与生活方式。',
      en: 'Beginning in British cotton manufacturing, mechanized production spread across Europe and North America. Factories, railways and urbanization permanently reshaped human life.',
    },
  },
  {
    id: 'social-contract',
    title: { zh: '《社会契约论》发表', en: 'The Social Contract' },
    start: 1762, end: 1762, lat: 46.2, lon: 6.14,
    continent: 'europe',

    sourceIds: ['brit-social-contract'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '日内瓦 / 阿姆斯特丹', en: 'Geneva / Amsterdam' },
    type: 'ideas', importance: 2,
    desc: {
      zh: '卢梭提出"人生而自由，却无往不在枷锁之中"，主权在民的思想为日后的法国大革命奠定理论基石。',
      en: 'Rousseau argued that humans are born free yet everywhere in chains, laying the theoretical groundwork of popular sovereignty for the French Revolution.',
    },
  },
  {
    id: 'watt-steam-engine',
    title: { zh: '瓦特改良蒸汽机', en: 'Watt\'s Improved Steam Engine' },
    start: 1769, end: 1785, lat: 55.86, lon: -4.25,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 格拉斯哥', en: 'Glasgow, Scotland' },
    type: 'science', importance: 3,
    sourceIds: ['brit-james-watt'],
    review: 'reviewed',
    desc: {
      zh: '瓦特为蒸汽机加装分离冷凝器，热效率大幅提升，人类第一次拥有了可随处部署的强大动力源。',
      en: 'By adding a separate condenser, James Watt dramatically improved steam efficiency, giving humanity its first universally deployable power source.',
    },
  },
  {
    id: 'cooks-voyages',
    title: { zh: '库克船长太平洋远航', en: 'Cook\'s Pacific Voyages' },
    start: 1768, end: 1779, lat: -33.87, lon: 151.2,
    continent: 'oceania',

    civilizations: ['european'],    geoPrecision: 'multi',
    sourceIds: ['brit-james-cook'],
    review: 'reviewed',
    place: { zh: '太平洋 · 悉尼至夏威夷', en: 'Pacific Ocean' },
    type: 'exploration', importance: 2,
    desc: {
      zh: '库克三次远航绘制了太平洋精确海图，抵达澳洲东岸与夏威夷，欧洲人的世界地图从此补上了最后的大片空白。',
      en: 'Across three voyages Captain James Cook charted the Pacific, reaching Australia\'s east coast and Hawaii, filling the last great blanks on European maps.',
    },
  },
  {
    id: 'poland-partitions',
    title: { zh: '瓜分波兰', en: 'The Partitions of Poland' },
    start: 1772, end: 1795, lat: 52.23, lon: 21.01,
    continent: 'europe',

    sourceIds: ['wiki-partition-sejm'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '波兰 · 华沙', en: 'Warsaw, Poland' },
    type: 'politics', importance: 2,
    desc: {
      zh: '俄、普、奥三次瓜分使波兰立陶宛联邦从地图上消失超过一个世纪，成为欧洲强权政治最赤裸的注脚。',
      en: 'Russia, Prussia and Austria carved up the Polish–Lithuanian Commonwealth in three partitions, erasing it from the map for over a century.',
    },
  },
  {
    id: 'pugachev-rebellion',
    title: { zh: '普加乔夫起义', en: 'Pugachev\'s Rebellion' },
    start: 1773, end: 1775, lat: 51.53, lon: 46.03,
    continent: 'europe',

    sourceIds: ['brit-pugachev-rebellion'],
    review: 'reviewed',
    civilizations: ['russian'],    place: { zh: '俄罗斯 · 伏尔加河流域', en: 'Volga Region, Russia' },
    type: 'war', importance: 1,
    desc: {
      zh: '哥萨克普加乔夫自称彼得三世，率农奴与游牧部族掀起俄帝国史上最大规模的内陆起义，最终被叶卡捷琳娜二世镇压。',
      en: 'The Cossack Yemelyan Pugachev, claiming to be Peter III, led the largest peasant revolt in Russian history before being crushed by Catherine the Great.',
    },
  },
  {
    id: 'us-independence',
    title: { zh: '美国独立战争', en: 'American Revolutionary War' },
    start: 1775, end: 1783, lat: 39.95, lon: -75.16,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '北美 · 费城', en: 'Philadelphia, North America' },
    type: 'politics', importance: 3,
    sourceIds: ['brit-declaration-independence'],
    review: 'reviewed',
    desc: {
      zh: '十三殖民地发表《独立宣言》并击败英国军队，建立美利坚合众国，成为近代第一个大型共和制国家。',
      en: 'Thirteen colonies declared independence, defeated Britain and founded the United States — the first large modern republic.',
    },
  },
  {
    id: 'wealth-of-nations',
    title: { zh: '《国富论》出版', en: 'The Wealth of Nations' },
    start: 1776, end: 1776, lat: 56.07, lon: -3.3,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '苏格兰 · 柯科迪', en: 'Kirkcaldy, Scotland' },
    type: 'ideas', importance: 3,
    sourceIds: ['brit-wealth-of-nations'],
    review: 'reviewed',
    desc: {
      zh: '亚当·斯密阐述分工、市场与"看不见的手"，现代经济学由此诞生。',
      en: 'Adam Smith described division of labour, markets and the "invisible hand", founding modern economics.',
    },
  },
  {
    id: 'first-fleet',
    title: { zh: '第一舰队抵达澳大利亚', en: 'The First Fleet reaches Australia' },
    start: 1788, end: 1788, lat: -33.87, lon: 151.21,
    continent: 'oceania',

    sourceIds: ['brit-first-fleet'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '澳大利亚 · 悉尼', en: 'Sydney, Australia' },
    type: 'exploration', importance: 2,
    desc: {
      zh: '11 艘船载着千余名移民与流放犯在杰克逊港建立殖民点，欧洲人在南大陆的定居史由此开始，也对原住民带来深远冲击。',
      en: 'Eleven ships landed just over a thousand settlers and convicts at Sydney Cove, beginning European settlement of the Australian continent.',
    },
  },
  {
    id: 'french-revolution',
    title: { zh: '法国大革命', en: 'The French Revolution' },
    start: 1789, end: 1799, lat: 48.86, lon: 2.35,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'politics', importance: 3,
    sourceIds: ['brit-french-revolution'],
    review: 'reviewed',
    desc: {
      zh: '攻占巴士底狱、《人权宣言》与共和国的建立震撼整个欧洲，"自由、平等、博爱"从此成为现代政治的通用语。',
      en: 'The storming of the Bastille, the Declaration of the Rights of Man and the fall of the monarchy shook Europe and made "liberty, equality, fraternity" the language of modern politics.',
    },
  },
  {
    id: 'haitian-revolution',
    title: { zh: '海地革命', en: 'The Haitian Revolution' },
    start: 1791, end: 1804, lat: 18.54, lon: -72.34,
    continent: 'north-america',

    sourceIds: ['brit-haitian-revolution'],
    review: 'reviewed',
    civilizations: ['latin-american'],    place: { zh: '海地 · 太子港', en: 'Port-au-Prince, Haiti' },
    type: 'politics', importance: 2,
    desc: {
      zh: '杜桑·卢维杜尔领导的奴隶大起义成功建国，这是历史上唯一一次奴隶起义建立起独立国家的革命。',
      en: 'Led by Toussaint Louverture, enslaved people rose up and founded Haiti — the only revolution in history to create an independent state born from a successful slave revolt.',
    },
  },
  {
    id: 'napoleonic-wars',
    title: { zh: '拿破仑战争', en: 'The Napoleonic Wars' },
    start: 1803, end: 1815, lat: 48.85, lon: 2.3,
    continent: 'europe',

    civilizations: ['european'],    geoPrecision: 'multi',
    place: { zh: '欧洲 · 巴黎', en: 'Paris, Europe' },
    type: 'war', importance: 3,
    sourceIds: ['brit-napoleonic-wars'],
    review: 'reviewed',
    desc: {
      zh: '拿破仑率法军横扫欧陆，从特拉法加到滑铁卢，十年战火既输出革命法典，也埋下民族主义的种子。',
      en: 'From Trafalgar to Waterloo, Napoleon\'s campaigns redrew Europe, spreading revolutionary law while sowing the seeds of nationalism.',
    },
  },
  {
    id: 'lewis-clark',
    title: { zh: '刘易斯与克拉克远征', en: 'Lewis and Clark Expedition' },
    start: 1804, end: 1806, lat: 38.63, lon: -90.2,
    continent: 'north-america',

    sourceIds: ['brit-louisiana-purchase'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '北美 · 圣路易斯', en: 'St. Louis, USA' },
    type: 'exploration', importance: 1,
    desc: {
      zh: '探险队横穿北美大陆直达太平洋，为美国的西进运动绘制了第一份路线图。',
      en: 'The Corps of Discovery crossed North America to the Pacific, mapping the route that would define America\'s westward expansion.',
    },
  },
  {
    id: 'muhammad-ali-reforms',
    title: { zh: '穆罕默德·阿里统治下的埃及改革', en: 'Egypt Reforms under Muhammad Ali' },
    start: 1805, end: 1848, lat: 30.04, lon: 31.24,
    continent: 'africa',

    civilizations: ['islamic-world', 'african'],    place: { zh: '埃及 · 开罗', en: 'Cairo, Egypt' },
    type: 'politics', importance: 2,
    desc: {
      zh: '穆罕默德·阿里夺取埃及政权，剿旧军事集团、建新军与国营体，兴办技术学校并垄断经济作物，力推近代化改革，成为奥斯曼帝国名义下辖的实权世袭帕夏。',
      en: 'After taking power in 1805, Muhammad Ali weakened old military households, created a conscript army and arms industries, founded state schools and monopolized key crops, securing hereditary rule of Egypt within the Ottoman Empire.',
    },
  },
  {
    id: 'latin-american-independence',
    title: { zh: '拉丁美洲独立战争', en: 'Spanish American Wars of Independence' },
    start: 1810, end: 1825, lat: 10.49, lon: -66.88,
    continent: 'south-america',

    civilizations: ['latin-american'],    geoPrecision: 'multi',
    place: { zh: '委内瑞拉 · 加拉加斯', en: 'Caracas, Venezuela' },
    type: 'politics', importance: 2,
    desc: {
      zh: '玻利瓦尔与圣马丁率军横扫南美，西班牙帝国在美洲的殖民地纷纷独立，诞生了十几个新生共和国。',
      en: 'Bolívar and San Martín led armies across South America; Spain\'s American colonies broke away, giving birth to a dozen new republics.',
    },
  },
  {
    id: 'congress-vienna',
    title: { zh: '维也纳会议', en: 'The Congress of Vienna' },
    start: 1814, end: 1815, lat: 48.2, lon: 16.37,
    continent: 'europe',

    sourceIds: ['brit-congress-of-vienna'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '奥地利 · 维也纳', en: 'Vienna, Austria' },
    type: 'politics', importance: 2,
    desc: {
      zh: '欧洲列强在舞会与谈判之间重建拿破仑战争后的秩序，"势力均衡"体系维持了欧洲近百年未爆全球大战。',
      en: 'The great powers redrew Europe after Napoleon at balls and negotiating tables; their balance-of-power system kept Europe from a general war for a century.',
    },
  },
  {
    id: 'stockton-darlington',
    title: { zh: '世界首条公共蒸汽铁路', en: 'First Public Steam Railway' },
    start: 1825, end: 1825, lat: 54.57, lon: -1.31,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 斯托克顿', en: 'Stockton, England' },
    type: 'science', importance: 2,
    desc: {
      zh: '史蒂芬孙的"动力号"机车在斯托克顿—达灵顿线开跑，铁路时代正式开启，陆地运输的成本一夜之间被改写。',
      en: 'George Stephenson\'s Locomotion No. 1 ran the Stockton & Darlington line, opening the railway age and rewriting the economics of land transport.',
    },
  },
  {
    id: 'monroe-doctrine',
    title: { zh: '门罗主义', en: 'The Monroe Doctrine' },
    start: 1823, end: 1823, lat: 38.9, lon: -77.04,
    continent: 'north-america',

    sourceIds: ['brit-monroe-doctrine'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 华盛顿', en: 'Washington, USA' },
    type: 'politics', importance: 1,
    desc: {
      zh: '美国宣告美洲不再容忍欧洲殖民，"美洲是美洲人的美洲"成为此后两个世纪西半球外交的主旋律。',
      en: 'The United States declared the Western Hemisphere closed to new European colonization — "America for the Americans" shaped two centuries of hemispheric diplomacy.',
    },
  },
  {
    id: 'slavery-abolition-act',
    title: { zh: '英国《废奴法案》', en: 'Slavery Abolition Act 1833' },
    start: 1833, end: 1838, lat: 51.5, lon: -0.12,
    continent: 'europe',

    sourceIds: ['wiki-slavery-abolition-act-1833'],
    review: 'reviewed',
    civilizations: ['european', 'african'],    place: { zh: '英国 · 伦敦', en: 'London, Britain' },
    type: 'society', importance: 2,
    desc: {
      zh: '议会在废奴运动多年请愿与抵制后通过法案，大英帝国全境逐步解放约 80 万奴隶。',
      en: 'After years of abolitionist campaigning, Parliament outlawed slavery across most of the British Empire, freeing some 800,000 enslaved people.',
    },
  },
  {
    id: 'first-opium-war',
    title: { zh: '第一次鸦片战争', en: 'The First Opium War' },
    start: 1839, end: 1842, lat: 23.13, lon: 113.26,
    continent: 'asia',

    civilizations: ['chinese', 'european'],    place: { zh: '中国 · 广州', en: 'Guangzhou, China' },
    type: 'war', importance: 3,
    sourceIds: ['brit-opium-wars'],
    review: 'reviewed',
    desc: {
      zh: '虎门销烟引来的英国远征军以坚船利炮敲开清朝国门，《南京条约》割让香港，中国近代史自此揭开屈辱与变革交织的一页。',
      en: 'Lin Zexu\'s destruction of opium at Humen triggered a British expedition; the Treaty of Nanjing ceded Hong Kong and opened China\'s "century of humiliation".',
    },
  },
  {
    id: 'first-telegraph',
    title: { zh: '首条实用电磁电报线', en: 'First Practical Telegraph Line' },
    start: 1844, end: 1844, lat: 39.29, lon: -76.62,
    continent: 'north-america',

    sourceIds: ['brit-telegraph'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 巴尔的摩', en: 'Baltimore, USA' },
    type: 'science', importance: 2,
    desc: {
      zh: '莫尔斯从华盛顿向巴尔的摩发出"上帝创造了何等的奇迹"，信息第一次跑赢了马车与火车。',
      en: 'Samuel Morse tapped "What hath God wrought" from Washington to Baltimore — for the first time, information outran the mail coach.',
    },
  },
  {
    id: 'irish-famine',
    title: { zh: '爱尔兰大饥荒', en: 'The Great Irish Famine' },
    start: 1845, end: 1852, lat: 53.35, lon: -6.26,
    continent: 'europe',

    sourceIds: ['brit-great-famine'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '爱尔兰 · 都柏林', en: 'Dublin, Ireland' },
    type: 'society', importance: 2,
    desc: {
      zh: '马铃薯晚疫病令主粮连年绝收，百万余人饿死，两百万人背井离乡，永远改变了爱尔兰与北美的人口版图。',
      en: 'Potato blight destroyed harvests for years; a million people died and two million emigrated, transforming Ireland and North America forever.',
    },
  },
  {
    id: 'great-exhibition',
    title: { zh: '首届万国工业博览会', en: 'The Great Exhibition' },
    start: 1851, end: 1851, lat: 51.51, lon: -0.13,
    continent: 'europe',

    sourceIds: ['brit-great-exhibition'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '英国 · 伦敦', en: 'London, Britain' },
    type: 'economy', importance: 2,
    desc: {
      zh: '水晶宫内陈列着各国最先进的机器与工艺品，630 万人次参观，世博会从此成为工业时代的世界橱窗。',
      en: 'Housed in the Crystal Palace, the first world\'s fair displayed the machines of the industrial age to six million visitors.',
    },
  },
  {
    id: 'communist-manifesto',
    title: { zh: '《共产党宣言》发表', en: 'The Communist Manifesto' },
    start: 1848, end: 1848, lat: 51.5, lon: -0.12,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 伦敦', en: 'London, Britain' },
    type: 'ideas', importance: 3,
    sourceIds: ['brit-communist-manifesto'],
    review: 'reviewed',
    desc: {
      zh: '马克思与恩格斯写下"一个幽灵，共产主义的幽灵，在欧洲游荡"，这份纲领深刻影响了此后一个多世纪的世界政治。',
      en: '"A spectre is haunting Europe" — Marx and Engels\' pamphlet became one of the most influential political texts of the following century.',
    },
  },
  {
    id: 'spring-of-nations',
    title: { zh: '1848 年欧洲革命', en: 'The Revolutions of 1848' },
    start: 1848, end: 1849, lat: 48.21, lon: 16.37,
    continent: 'europe',

    civilizations: ['european'],    geoPrecision: 'multi',
    sourceIds: ['wiki-revolutions-1848'],
    review: 'reviewed',
    place: { zh: '欧洲 · 维也纳', en: 'Vienna, Europe' },
    type: 'politics', importance: 2,
    desc: {
      zh: '从巴黎到维也纳、柏林到米兰，民众起义席卷五十余个欧洲政体，君主纷纷让步，民族主义与立宪浪潮此起彼伏。',
      en: 'From Paris to Vienna, Berlin to Milan, uprisings swept more than fifty European states, forcing concessions and igniting nationalism and constitutionalism.',
    },
  },
  {
    id: 'crimean-war',
    title: { zh: '克里米亚战争', en: 'The Crimean War' },
    start: 1853, end: 1856, lat: 44.62, lon: 33.53,
    continent: 'europe',

    sourceIds: ['brit-crimean-war'],
    review: 'reviewed',
    civilizations: ['european', 'russian', 'ottoman'],    place: { zh: '克里米亚 · 塞瓦斯托波尔', en: 'Sevastopol, Crimea' },
    type: 'war', importance: 2,
    desc: {
      zh: '英法土联手阻击俄国南侵，塞瓦斯托波尔围城战以惨烈伤亡催生了南丁格尔的现代护理体系。',
      en: 'Britain, France and the Ottoman Empire checked Russia\'s southward push; the siege of Sevastopol\'s horrors gave birth to Florence Nightingale\'s modern nursing.',
    },
  },
  {
    id: 'perry-expedition',
    title: { zh: '黑船来航', en: 'Perry\'s Expedition to Japan' },
    start: 1853, end: 1854, lat: 35.45, lon: 139.75,
    continent: 'asia',

    sourceIds: ['brit-matthew-perry'],
    review: 'reviewed',
    civilizations: ['north-american', 'japanese'],    place: { zh: '日本 · 江户湾', en: 'Edo Bay, Japan' },
    type: 'politics', importance: 2,
    desc: {
      zh: '佩里率美国蒸汽军舰叩关，德川幕府两百余年的锁国政策被迫终结，日本由此踏上近代化之路。',
      en: 'Commodore Perry\'s steam "Black Ships" forced the Tokugawa shogunate to end two centuries of seclusion, setting Japan on the road to modernization.',
    },
  },
  {
    id: 'indian-rebellion',
    title: { zh: '印度民族大起义', en: 'The Indian Rebellion of 1857' },
    start: 1857, end: 1858, lat: 28.61, lon: 77.21,
    continent: 'asia',

    sourceIds: ['brit-indian-rebellion-1857'],
    review: 'reviewed',
    civilizations: ['indian', 'european'],    place: { zh: '印度 · 德里', en: 'Delhi, India' },
    type: 'war', importance: 2,
    desc: {
      zh: '涂油子弹点燃了遍及北印的大起义，东印度公司统治终结，英国王室直接接管印度，殖民统治形态就此改变。',
      en: 'Sparked by greased cartridges, the uprising across northern India ended Company rule; the British Crown assumed direct control of the Raj.',
    },
  },
  {
    id: 'origin-of-species',
    title: { zh: '《物种起源》出版', en: 'On the Origin of Species' },
    start: 1859, end: 1859, lat: 51.5, lon: -0.12,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 伦敦', en: 'London, Britain' },
    type: 'science', importance: 3,
    sourceIds: ['brit-origin-of-species'],
    review: 'reviewed',
    desc: {
      zh: '达尔文以自然选择解释生命演化，"物竞天择"的思想重塑了生物学，也震荡了整个时代的世界观。',
      en: 'Darwin\'s theory of evolution by natural selection revolutionized biology and shook the worldview of an entire era.',
    },
  },
  {
    id: 'italian-unification',
    title: { zh: '意大利统一', en: 'The Italian Unification' },
    start: 1861, end: 1871, lat: 41.9, lon: 12.5,
    continent: 'europe',

    sourceIds: ['brit-risorgimento'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '意大利 · 罗马', en: 'Rome, Italy' },
    type: 'politics', importance: 2,
    desc: {
      zh: '加富尔的外交与加里波第的红衫军将亚平宁半岛诸邦归于一统，意大利王国宣告成立。',
      en: 'Cavour\'s diplomacy and Garibaldi\'s Redshirts united the peninsula; the Kingdom of Italy was proclaimed in 1861 and completed with Rome in 1870.',
    },
  },
  {
    id: 'us-civil-war',
    title: { zh: '美国内战', en: 'The American Civil War' },
    start: 1861, end: 1865, lat: 38.9, lon: -77.04,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '美国 · 华盛顿', en: 'Washington, USA' },
    type: 'war', importance: 3,
    sourceIds: ['brit-american-civil-war'],
    review: 'reviewed',
    desc: {
      zh: '南北战争以六十余万人的伤亡维系了联邦完整，《解放宣言》废除了奴隶制，美国由此走上工业化快车道。',
      en: 'The costliest war in American history preserved the Union and abolished slavery through the Emancipation Proclamation, clearing the way for the Gilded Age.',
    },
  },
  {
    id: 'self-strengthening-movement',
    title: { zh: '洋务运动', en: 'The Self-Strengthening Movement' },
    start: 1861, end: 1895, lat: 31.23, lon: 121.47,
    continent: 'asia',

    sourceIds: ['wiki-self-strengthening'],
    review: 'reviewed',
    civilizations: ['chinese'],    place: { zh: '中国 · 上海', en: 'Shanghai, China' },
    type: 'politics', importance: 2,
    desc: {
      zh: '曾国藩、李鸿章等兴办江南制造局与轮船招商局，"师夷长技以自强"，晚清的自强尝试在甲午一役中接受残酷检验。',
      en: 'Qing officials built arsenals, shipyards and steam companies to adopt Western technology — a reform drive tested brutally by the 1894 war with Japan.',
    },
  },
  {
    id: 'red-cross-founding',
    title: { zh: '红十字国际委员会创立', en: 'Founding of the Red Cross' },
    start: 1863, end: 1863, lat: 46.2, lon: 6.14,
    continent: 'europe',

    sourceIds: ['wiki-henry-dunant'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '瑞士 · 日内瓦', en: 'Geneva, Switzerland' },
    type: 'society', importance: 2,
    desc: {
      zh: '亨利·杜南在索尔费里诺战役的伤兵惨状后发起创立红十字，日内瓦公约随之诞生，战地人道救援有了国际准则。',
      en: 'Shocked by the wounded at Solferino, Henry Dunant founded the Red Cross; the first Geneva Convention followed, codifying battlefield humanitarianism.',
    },
  },
  {
    id: 'transatlantic-cable',
    title: { zh: '跨大西洋电报电缆', en: 'The Transatlantic Telegraph Cable' },
    start: 1866, end: 1866, lat: 47.93, lon: -53.96,
    continent: 'north-america',

    sourceIds: ['wiki-transatlantic-telegraph'],
    review: 'reviewed',
    civilizations: ['north-american', 'european'],    place: { zh: '纽芬兰 · 心安港', en: 'Heart\'s Content, Newfoundland' },
    type: 'science', importance: 2,
    desc: {
      zh: '"大东方号"成功铺设永久性跨洋电缆，欧美之间的通信从十天的轮船航程缩短到数小时。',
      en: 'The Great Eastern laid the first durable transatlantic cable, cutting Europe–America communication from a ten-day voyage to hours.',
    },
  },
  {
    id: 'canadian-confederation',
    title: { zh: '加拿大联邦成立', en: 'The Canadian Confederation' },
    start: 1867, end: 1867, lat: 45.42, lon: -75.7,
    continent: 'north-america',

    sourceIds: ['wiki-constitution-act-1867'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '加拿大 · 渥太华', en: 'Ottawa, Canada' },
    type: 'politics', importance: 1,
    desc: {
      zh: '安大略、魁北克与新斯科舍等省联合成加拿大自治领，英属北美开启了和平建国的联邦道路。',
      en: 'Ontario, Quebec and the Maritime provinces united as the Dominion of Canada, beginning a peaceful federal path within the British Empire.',
    },
  },
  {
    id: 'meiji-restoration',
    title: { zh: '明治维新', en: 'The Meiji Restoration' },
    start: 1868, end: 1889, lat: 35.68, lon: 139.69,
    continent: 'asia',

    civilizations: ['japanese'],    place: { zh: '日本 · 东京', en: 'Tokyo, Japan' },
    type: 'politics', importance: 3,
    sourceIds: ['brit-meiji-restoration'],
    review: 'reviewed',
    desc: {
      zh: '明治政府"富国强兵、殖产兴业、文明开化"，短短一代人时间里完成了从封建幕藩体制到工业强国的转身。',
      en: 'Under the slogans "rich country, strong army", Japan industrialized with astonishing speed, transforming from feudal shogunate to modern power within a generation.',
    },
  },
  {
    id: 'periodic-table',
    title: { zh: '门捷列夫元素周期表', en: 'The Periodic Table' },
    start: 1869, end: 1869, lat: 59.93, lon: 30.34,
    continent: 'europe',

    sourceIds: ['wiki-dmitri-mendeleev'],
    review: 'reviewed',
    civilizations: ['russian'],    place: { zh: '俄罗斯 · 圣彼得堡', en: 'St. Petersburg, Russia' },
    type: 'science', importance: 2,
    desc: {
      zh: '门捷列夫按原子量排列元素并大胆留下空位预言未知元素，化学从此拥有了自己的"地图"。',
      en: 'Mendeleev arranged the elements by atomic weight and left gaps predicting undiscovered ones — chemistry finally had its map.',
    },
  },
  {
    id: 'suez-canal',
    title: { zh: '苏伊士运河通航', en: 'The Suez Canal Opens' },
    start: 1869, end: 1869, lat: 30.7, lon: 32.34,
    continent: 'africa',

    civilizations: ['european', 'islamic-world'],    place: { zh: '埃及 · 苏伊士', en: 'Suez, Egypt' },
    type: 'economy', importance: 3,
    sourceIds: ['brit-suez-canal'],
    review: 'reviewed',
    desc: {
      zh: '历经十年开凿的运河沟通地中海与红海，欧亚航程缩短近万公里，全球贸易的血管被重新接驳。',
      en: 'Ten years of excavation joined the Mediterranean to the Red Sea, shortening the Europe–Asia voyage by thousands of kilometres and rewiring global trade.',
    },
  },
  {
    id: 'franco-prussian-war',
    title: { zh: '普法战争', en: 'The Franco-Prussian War' },
    start: 1870, end: 1871, lat: 49.7, lon: 4.94,
    continent: 'europe',

    sourceIds: ['brit-franco-german-war'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '法国 · 色当', en: 'Sedan, France' },
    type: 'war', importance: 2,
    desc: {
      zh: '普鲁士在色当俘获拿破仑三世，德意志帝国在凡尔赛镜厅宣告成立，阿尔萨斯-洛林之争埋下两次大战的火种。',
      en: 'Prussia captured Napoleon III at Sedan and proclaimed the German Empire at Versailles; the lost provinces of Alsace-Lorraine poisoned Franco-German relations for decades.',
    },
  },
  {
    id: 'telephone',
    title: { zh: '电话的发明', en: 'The Invention of the Telephone' },
    start: 1876, end: 1876, lat: 42.36, lon: -71.06,
    continent: 'north-america',

    sourceIds: ['brit-alexander-graham-bell'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 波士顿', en: 'Boston, USA' },
    type: 'science', importance: 2,
    desc: {
      zh: '贝尔的电话专利获准，"沃森先生，快来"成为人类第一句电话留言，声音从此可以跨越大陆实时传递。',
      en: 'Alexander Graham Bell\'s patent was granted and "Mr. Watson, come here" became the first telephone call — the human voice could now cross continents instantly.',
    },
  },
  {
    id: 'light-bulb',
    title: { zh: '爱迪生白炽灯', en: 'Edison\'s Incandescent Lamp' },
    start: 1879, end: 1882, lat: 40.52, lon: -74.31,
    continent: 'north-america',

    sourceIds: ['brit-thomas-edison'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 门洛帕克', en: 'Menlo Park, USA' },
    type: 'science', importance: 2,
    desc: {
      zh: '爱迪生团队测试数千种灯丝后造出持久白炽灯，并配套建成发电与配电系统，电灯由此走进千家万户。',
      en: 'After testing thousands of filaments, Edison\'s lab produced a durable lamp and the systems to power it, bringing electric light into ordinary homes.',
    },
  },
  {
    id: 'berlin-conference',
    title: { zh: '柏林会议', en: 'The Berlin Conference' },
    start: 1884, end: 1885, lat: 50.85, lon: 4.35,
    continent: 'europe',

    civilizations: ['european', 'african'],    place: { zh: '比利时 · 布鲁塞尔', en: 'Brussels, Belgium' },
    type: 'politics', importance: 3,
    sourceIds: ['brit-berlin-conference'],
    review: 'reviewed',
    desc: {
      zh: '列强围桌瓜分非洲，划定势力范围与"有效占领"规则，非洲大陆的边界由此被遥远的欧洲谈判桌改写。',
      en: 'The European powers drew up rules for the Scramble for Africa; the continent\'s borders were rewritten around distant negotiating tables.',
    },
  },
  {
    id: 'automobile',
    title: { zh: '奔驰发明汽车', en: 'The Benz Automobile' },
    start: 1885, end: 1888, lat: 49.49, lon: 8.47,
    continent: 'europe',

    sourceIds: ['brit-karl-benz'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '德国 · 曼海姆', en: 'Mannheim, Germany' },
    type: 'science', importance: 2,
    desc: {
      zh: '卡尔·本茨的单缸三轮车获得专利，贝尔塔·奔驰的长途试驾证明了它的实用，公路交通的革命自此启幕。',
      en: 'Karl Benz patented his Patent-Motorwagen; Bertha Benz\'s long-distance drive proved its practicality and opened the age of the automobile.',
    },
  },
  {
    id: 'eiffel-tower',
    title: { zh: '埃菲尔铁塔落成', en: 'The Eiffel Tower Completed' },
    start: 1889, end: 1889, lat: 48.86, lon: 2.29,
    continent: 'europe',

    sourceIds: ['wiki-eiffel-tower'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'society', importance: 1,
    desc: {
      zh: '为世界博览会而建的 300 米钢铁之塔在争议中成为巴黎乃至现代工程精神的地标。',
      en: 'Built for the 1889 World\'s Fair and initially reviled, the 300-metre iron tower became the emblem of Paris and of modern engineering.',
    },
  },
  {
    id: 'nz-suffrage',
    title: { zh: '新西兰女性获得选举权', en: 'New Zealand Women\'s Suffrage' },
    start: 1893, end: 1893, lat: -41.29, lon: 174.78,
    continent: 'oceania',

    sourceIds: ['wiki-nz-suffrage'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '新西兰 · 惠灵顿', en: 'Wellington, New Zealand' },
    type: 'society', importance: 2,
    desc: {
      zh: '在三万人签名请愿后，新西兰成为世界上首个赋予全体女性国会选举投票权的国家。',
      en: 'After a 32,000-signature petition, New Zealand became the first country to grant all women the vote in parliamentary elections.',
    },
  },
  {
    id: 'sino-japanese-war',
    title: { zh: '甲午战争', en: 'The First Sino-Japanese War' },
    start: 1894, end: 1895, lat: 37.5, lon: 122.2,
    continent: 'asia',

    civilizations: ['chinese', 'japanese'],    geoPrecision: 'region',
    place: { zh: '中国 · 黄海 / 威海卫', en: 'Yellow Sea / Weihaiwei' },
    type: 'war', importance: 3,
    sourceIds: ['brit-first-sino-japanese-war'],
    review: 'reviewed',
    desc: {
      zh: '北洋水师全军覆没，《马关条约》割让台湾，东亚百年格局由此逆转，也直接刺激了戊戌变法与日本扩张主义。',
      en: 'The destruction of the Beiyang Fleet and the Treaty of Shimonoseki reversed East Asia\'s balance of power, spurting Chinese reform and Japanese expansionism.',
    },
  },
  {
    id: 'marconi-radio',
    title: { zh: '无线电报实验成功', en: 'Marconi\'s Wireless Telegraphy' },
    start: 1895, end: 1901, lat: 44.49, lon: 11.34,
    continent: 'europe',

    sourceIds: ['brit-guglielmo-marconi'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '意大利 · 博洛尼亚', en: 'Bologna, Italy' },
    type: 'science', importance: 2,
    desc: {
      zh: '马可尼的无线电波跨越越来越宽的水域，直到完成跨大西洋通信，航海与新闻业被彻底改变。',
      en: 'Guglielmo Marconi stretched radio across ever-wider waters until the first transatlantic transmission, transforming shipping and the press.',
    },
  },
  {
    id: 'first-olympics',
    title: { zh: '首届现代奥运会', en: 'The First Modern Olympics' },
    start: 1896, end: 1896, lat: 37.98, lon: 23.73,
    continent: 'europe',

    sourceIds: ['wiki-1896-olympics'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '希腊 · 雅典', en: 'Athens, Greece' },
    type: 'society', importance: 2,
    desc: {
      zh: '顾拜旦复兴古代奥林匹克传统，14 国运动员齐聚雅典，现代国际体育赛会自此四年一届延续至今。',
      en: 'Revived by Pierre de Coubertin, athletes from fourteen nations gathered in Athens, beginning the four-yearly tradition of the modern Games.',
    },
  },
  {
    id: 'hundred-days-reform',
    title: { zh: '戊戌变法', en: 'The Hundred Days\' Reform' },
    start: 1898, end: 1898, lat: 39.9, lon: 116.4,
    continent: 'asia',

    sourceIds: ['brit-kang-youwei'],
    review: 'reviewed',
    civilizations: ['chinese'],    place: { zh: '中国 · 北京', en: 'Beijing, China' },
    type: 'politics', importance: 2,
    desc: {
      zh: '光绪帝在康梁推动下推行新政，103 天后以"戊戌六君子"喋血菜市口告终，却为清末新政与革命思想埋下伏笔。',
      en: 'The Guangxu Emperor\'s reform edicts were crushed after 103 days; the executed "Six Gentlemen" became martyrs who inspired a generation of revolutionaries.',
    },
  },
  {
    id: 'radium-discovery',
    title: { zh: '居里夫妇发现镭', en: 'The Discovery of Radium' },
    start: 1898, end: 1903, lat: 48.85, lon: 2.35,
    continent: 'europe',

    sourceIds: ['brit-marie-curie'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'science', importance: 2,
    desc: {
      zh: '居里夫妇在简陋棚屋中从数吨沥青铀矿里提炼出镭，开启放射性研究大门，并两度问鼎诺贝尔奖。',
      en: 'Marie and Pierre Curie processed tonnes of pitchblende to isolate radium, opening the door to radioactivity research and two Nobel Prizes.',
    },
  },
  {
    id: 'eight-nation-alliance',
    title: { zh: '八国联军侵华', en: 'The Eight-Nation Alliance' },
    start: 1900, end: 1901, lat: 39.9, lon: 116.4,
    continent: 'asia',

    sourceIds: ['wiki-eight-nation-alliance'],
    review: 'reviewed',
    civilizations: ['chinese', 'european', 'japanese', 'russian'],    place: { zh: '中国 · 北京', en: 'Beijing, China' },
    type: 'war', importance: 2,
    desc: {
      zh: '义和团运动引来八国联军攻占北京，《辛丑条约》赔款白银四亿五千万两，清王朝的统治信用彻底破产。',
      en: 'The Boxer Uprising was crushed by an eight-power expedition that occupied Beijing; the crushing Boxer Indemnity fatally weakened the Qing dynasty.',
    },
  },
  {
    id: 'quantum-hypothesis',
    title: { zh: '普朗克量子假说', en: 'Planck\'s Quantum Hypothesis' },
    start: 1900, end: 1900, lat: 52.52, lon: 13.4,
    continent: 'europe',

    sourceIds: ['brit-max-planck'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '德国 · 柏林', en: 'Berlin, Germany' },
    type: 'science', importance: 2,
    desc: {
      zh: '为解释黑体辐射，普朗克提出能量以不连续的"量子"发射，经典物理大厦的第一道裂缝就此出现。',
      en: 'To explain blackbody radiation, Max Planck proposed that energy is emitted in discrete quanta — the first crack in classical physics.',
    },
  },
  {
    id: 'freud-dreams',
    title: { zh: '《梦的解析》出版', en: 'The Interpretation of Dreams' },
    start: 1900, end: 1900, lat: 48.21, lon: 16.37,
    continent: 'europe',

    sourceIds: ['wiki-sigmund-freud', 'wiki-interpretation-of-dreams'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '奥地利 · 维也纳', en: 'Vienna, Austria' },
    type: 'ideas', importance: 1,
    desc: {
      zh: '弗洛伊德以梦为"通往潜意识的康庄大道"，精神分析学派自此发端，深刻影响了二十世纪的人文与自我认知。',
      en: 'Freud called dreams "the royal road to the unconscious", founding psychoanalysis and reshaping the twentieth century\'s understanding of the self.',
    },
  },
  {
    id: 'australian-federation',
    title: { zh: '澳大利亚联邦成立', en: 'The Australian Federation' },
    start: 1901, end: 1901, lat: -37.81, lon: 144.96,
    continent: 'oceania',

    civilizations: ['european'],    place: { zh: '澳大利亚 · 墨尔本', en: 'Melbourne, Australia' },
    type: 'politics', importance: 1,
    desc: {
      zh: '六个英属殖民地在公投后联合成立澳大利亚联邦，南太平洋上诞生了新的国家。',
      en: 'Six British colonies voted to unite as the Commonwealth of Australia, a new nation in the South Pacific.',
    },
  },
  {
    id: 'wright-flight',
    title: { zh: '莱特兄弟首次动力飞行', en: 'The Wright Brothers\' First Flight' },
    start: 1903, end: 1903, lat: 36.02, lon: -75.67,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '美国 · 基蒂霍克', en: 'Kitty Hawk, USA' },
    type: 'science', importance: 3,
    sourceIds: ['brit-wright-brothers'],
    review: 'reviewed',
    desc: {
      zh: '"飞行者一号"在沙丘上摇晃飞行了 12 秒 36 米，人类千年的飞天梦想自此有了第一台真正可操控的动力飞行器。',
      en: 'The Wright Flyer lurched into the air for twelve seconds and 36 metres — the first sustained, controlled powered flight in human history.',
    },
  },
  {
    id: 'russo-japanese-war',
    title: { zh: '日俄战争', en: 'The Russo-Japanese War' },
    start: 1904, end: 1905, lat: 38.8, lon: 121.24,
    continent: 'asia',

    sourceIds: ['brit-russo-japanese-war'],
    review: 'reviewed',
    civilizations: ['russian', 'japanese'],    place: { zh: '中国 · 旅顺', en: 'Lüshun (Port Arthur), China' },
    type: 'war', importance: 2,
    desc: {
      zh: '日本击败欧洲列强俄国，这是近代以来亚洲国家首次在全面战争中战胜欧洲大国，震动整个世界。',
      en: 'Japan\'s defeat of Tsarist Russia was the first modern victory of an Asian power over a European great power, shocking the world order.',
    },
  },
  {
    id: 'panama-canal',
    title: { zh: '巴拿马运河开工', en: 'The Panama Canal Begins' },
    start: 1904, end: 1914, lat: 9.08, lon: -79.68,
    continent: 'north-america',

    sourceIds: ['brit-panama-canal'],
    review: 'reviewed',
    civilizations: ['north-american', 'latin-american'],    place: { zh: '巴拿马 · 巴拿马城', en: 'Panama City, Panama' },
    type: 'economy', importance: 2,
    desc: {
      zh: '美国接手法属公司失败的工程，在瘟疫与山崩之间开凿运河，大西洋与太平洋终于握手。',
      en: 'The United States took over the failed French effort; through yellow fever and landslides the canal finally joined the Atlantic and Pacific.',
    },
  },
  {
    id: 'special-relativity',
    title: { zh: '狭义相对论发表', en: 'Special Relativity' },
    start: 1905, end: 1905, lat: 46.95, lon: 7.45,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '瑞士 · 伯尔尼', en: 'Bern, Switzerland' },
    type: 'science', importance: 3,
    sourceIds: ['brit-relativity'],
    review: 'reviewed',
    desc: {
      zh: '专利局职员爱因斯坦一年内连发数篇论文，用相对论与光量子重新定义了时间、空间与能量。',
      en: 'In his "miracle year", patent clerk Albert Einstein redefined space, time and energy with special relativity and the light quantum.',
    },
  },
  {
    id: 'model-t',
    title: { zh: '福特 T 型车下线', en: 'The Ford Model T' },
    start: 1908, end: 1911, lat: 42.32, lon: -83.04,
    continent: 'north-america',

    sourceIds: ['brit-mexican-revolution'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 底特律', en: 'Detroit, USA' },
    type: 'economy', importance: 2,
    desc: {
      zh: '福特以流水线把汽车价格砍到工薪阶层可负担的水平，汽车从奢侈品变成大众消费品，美国世纪的车轮开始转动。',
      en: 'Ford\'s assembly line made the automobile affordable for ordinary families, putting the twentieth century on wheels.',
    },
  },
  {
    id: 'mexican-revolution',
    title: { zh: '墨西哥革命爆发', en: 'The Mexican Revolution' },
    start: 1910, end: 1920, lat: 19.43, lon: -99.13,
    continent: 'north-america',

    sourceIds: ['brit-roald-amundsen'],
    review: 'reviewed',
    civilizations: ['latin-american'],    place: { zh: '墨西哥 · 墨西哥城', en: 'Mexico City, Mexico' },
    type: 'politics', importance: 2,
    desc: {
      zh: '马德罗号召推翻迪亚斯三十五年独裁，农民军与各派系鏖战十年，1917 年宪法成为此后拉美宪政的范本。',
      en: 'Opposition to Díaz\'s 35-year dictatorship ignited a decade of conflict; the 1917 Constitution became a model for Latin American charters.',
    },
  },
  {
    id: 'amundsen-south-pole',
    title: { zh: '阿蒙森抵达南极点', en: 'Amundsen Reaches the South Pole' },
    start: 1911, end: 1911, lat: -89.9, lon: 0,
    continent: 'antarctica',

    civilizations: ['european'],    place: { zh: '南极点', en: 'South Pole' },
    type: 'exploration', importance: 2,
    desc: {
      zh: '罗尔德·阿蒙森率队于 12 月 14 日首次踏上南极点，人类地图上最后一块大陆的征服宣告完成。',
      en: 'Roald Amundsen\'s team reached the geographic South Pole on 14 December, completing the conquest of the last blank continent.',
    },
  },
  {
    id: 'xinhai-revolution',
    title: { zh: '辛亥革命', en: 'The Xinhai Revolution' },
    start: 1911, end: 1912, lat: 30.55, lon: 114.31,
    continent: 'asia',

    civilizations: ['chinese'],    place: { zh: '中国 · 武昌', en: 'Wuchang, China' },
    type: 'politics', importance: 3,
    sourceIds: ['wiki-1911-revolution'],
    review: 'reviewed',
    desc: {
      zh: '武昌城头一声枪响，各省纷纷响应，延续两千余年的帝制在次年落幕，亚洲第一个共和国——中华民国宣告成立。',
      en: 'The Wuchang Uprising toppled two millennia of imperial rule; in 1912 the Republic of China, Asia\'s first republic, was proclaimed.',
    },
  },
  {
    id: 'louisiana-purchase',
    title: { zh: '路易斯安那购地', en: 'The Louisiana Purchase' },
    start: 1803, end: 1803, lat: 38.63, lon: -90.2,
    continent: 'north-america',

    sourceIds: ['brit-louisiana-purchase'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 圣路易斯', en: 'St. Louis, USA' },
    type: 'politics', importance: 3,
    desc: {
      zh: '美国以 1500 万美元从拿破仑手中购得密西西比河以西 214 万平方公里土地，国土一夜之间翻倍。',
      en: 'The United States bought 2.1 million square kilometres west of the Mississippi from Napoleon for $15 million, doubling its territory overnight.',
    },
  },
  {
    id: 'taiping-rebellion',
    title: { zh: '太平天国运动', en: 'The Taiping Rebellion' },
    start: 1850, end: 1864, lat: 32.06, lon: 118.79,
    continent: 'asia',

    civilizations: ['chinese'],    place: { zh: '中国 · 南京', en: 'Nanjing, China' },
    type: 'war', importance: 3,
    sourceIds: ['brit-taiping-rebellion'],
    review: 'reviewed',
    desc: {
      zh: '洪秀全以拜上帝会起事，定都天京，纵横十八省，是人类历史上伤亡最惨重的内战之一，也彻底动摇了清王朝的根基。',
      en: 'Hong Xiuquan\'s God-Worshipping Society took Nanjing and swept eighteen provinces — one of the bloodiest civil wars in human history, fatally weakening the Qing.',
    },
  },
  {
    id: 'greek-independence',
    title: { zh: '希腊独立战争', en: 'The Greek War of Independence' },
    start: 1821, end: 1830, lat: 37.98, lon: 23.73,
    continent: 'europe',

    sourceIds: ['brit-battle-of-navarino'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '希腊 · 伯罗奔尼撒', en: 'Peloponnese, Greece' },
    type: 'war', importance: 2,
    desc: {
      zh: '在拜伦式的欧洲 Philhellenes 声援下，希腊反抗奥斯曼统治九年后建国，成为奥斯曼欧洲疆域解体的第一块多米诺。',
      en: 'Backed by Europe\'s philhellenes, Greece fought the Ottomans for nine years and won statehood — the first domino in the empire\'s European retreat.',
    },
  },
  {
    id: 'brazil-independence',
    title: { zh: '巴西独立', en: 'The Independence of Brazil' },
    start: 1822, end: 1822, lat: -22.9, lon: -43.2,
    continent: 'south-america',

    sourceIds: ['wiki-independence-of-brazil'],
    review: 'reviewed',
    civilizations: ['latin-american'],    place: { zh: '巴西 · 里约热内卢', en: 'Rio de Janeiro, Brazil' },
    type: 'politics', importance: 2,
    desc: {
      zh: '葡萄牙王储佩德罗在伊皮兰加河畔宣告"不独立，毋宁死"，巴西以近乎不流血的方式脱离葡萄牙，建立帝国。',
      en: 'Prince Pedro declared "independence or death" on the banks of the Ipiranga; Brazil left Portugal nearly bloodless as an empire.',
    },
  },
  {
    id: 'tanzimat',
    title: { zh: '奥斯曼坦志麦特改革', en: 'The Ottoman Tanzimat Reforms' },
    start: 1839, end: 1876, lat: 41.0, lon: 28.98,
    continent: 'europe',

    sourceIds: ['brit-tanzimat'],
    review: 'reviewed',
    civilizations: ['ottoman'],    place: { zh: '奥斯曼 · 伊斯坦布尔', en: 'Istanbul, Ottoman Empire' },
    type: 'politics', importance: 2,
    desc: {
      zh: '以"仁政法令"开始的坦志麦特改革推行法律平等、近代行政与教育，是奥斯曼帝国自救近代化的最重要尝试。',
      en: 'Launching with the Rose Edict, the Tanzimat introduced legal equality, modern administration and schooling — the empire\'s boldest self-modernization.',
    },
  },
  {
    id: 'treaty-ganghwa',
    title: { zh: '江华条约', en: 'The Treaty of Ganghwa' },
    start: 1876, end: 1876, lat: 37.45, lon: 126.7,
    continent: 'asia',

    sourceIds: ['wiki-japan-korea-treaty-1876'],
    review: 'reviewed',
    civilizations: ['japanese'],    place: { zh: '朝鲜 · 江华岛', en: 'Ganghwa, Korea' },
    type: 'politics', importance: 1,
    desc: {
      zh: '明治日本以云扬号事件为由迫使朝鲜开港，朝鲜被卷入近代条约体系，东亚宗藩秩序开始瓦解。',
      en: 'Using the Unyō incident as pretext, Meiji Japan forced Korea\'s ports open, drawing it into the modern treaty system.',
    },
  },
  {
    id: 'congress-of-berlin',
    title: { zh: '柏林会议（1878）', en: 'The Congress of Berlin' },
    start: 1878, end: 1878, lat: 52.52, lon: 13.4,
    continent: 'europe',

    sourceIds: ['brit-berlin-conference-1884'],
    review: 'reviewed',
    civilizations: ['european', 'african'],    place: { zh: '德国 · 柏林', en: 'Berlin, Germany' },
    type: 'politics', importance: 2,
    desc: {
      zh: '俾斯麦主持重画巴尔干地图，罗马尼亚、塞尔维亚、黑山获承认独立，"欧洲病夫"的疆域进一步收缩。',
      en: 'Bismarck chaired the redrawing of the Balkans; Romania, Serbia and Montenegro won recognition as the Ottoman map shrank further.',
    },
  },
  {
    id: 'paris-commune',
    title: { zh: '巴黎公社', en: 'The Paris Commune' },
    start: 1871, end: 1871, lat: 48.86, lon: 2.35,
    continent: 'europe',

    sourceIds: ['wiki-paris-commune'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'politics', importance: 2,
    desc: {
      zh: '普法战败后的巴黎民众建立人类历史上第一个工人自治政权，七十二天后在"流血周"中被镇压，却成为此后革命运动的旗帜。',
      en: 'After France\'s defeat, Parisians ran the first workers\' self-rule in history; crushed after 72 days, the Commune became a banner for later movements.',
    },
  },
  {
    id: 'adwa',
    title: { zh: '阿杜瓦战役', en: 'The Battle of Adwa' },
    start: 1896, end: 1896, lat: 14.16, lon: 38.9,
    continent: 'africa',

    sourceIds: ['brit-battle-of-adwa'],
    review: 'reviewed',
    civilizations: ['african'],    place: { zh: '埃塞俄比亚 · 阿杜瓦', en: 'Adwa, Ethiopia' },
    type: 'war', importance: 2,
    desc: {
      zh: '孟尼利克二世率埃塞俄比亚军队大败意大利殖民军，保住国家独立，成为非洲反抗瓜分的最著名胜利。',
      en: 'Menelik II\'s army crushed an Italian colonial force, preserving Ethiopian independence — Africa\'s most famous victory against the Scramble.',
    },
  },
  {
    id: 'zulu-kingdom',
    title: { zh: '祖鲁王国崛起', en: 'The Rise of the Zulu Kingdom' },
    start: 1816, end: 1828, lat: -28.5, lon: 31.4,
    continent: 'africa',

    civilizations: ['african'],    place: { zh: '南部非洲 · 夸祖鲁', en: 'KwaZulu, Southern Africa' },
    type: 'war', importance: 1,
    desc: {
      zh: '沙卡改革"步兵军团"与"水牛阵"战术，十年间统一上百部族建立祖鲁王国，其征服浪潮（姆菲卡尼）重塑了整个南部非洲格局。',
      en: 'Shaka\'s age-regiment "bull-horn" tactics united hundreds of clans within a decade; the resulting Mfecane reshaped all of Southern Africa.',
    },
  },
  {
    id: 'sokoto-caliphate',
    title: { zh: '索科托哈里发国建立', en: 'The Sokoto Caliphate' },
    start: 1804, end: 1804, lat: 13.06, lon: 5.24,
    continent: 'africa',

    sourceIds: ['wiki-sokoto-caliphate'],
    review: 'reviewed',
    civilizations: ['african', 'islamic-world'],    place: { zh: '西非 · 索科托', en: 'Sokoto, West Africa' },
    type: 'politics', importance: 1,
    desc: {
      zh: '富拉尼学者 Usman dan Fodio 发动圣战建立索科托哈里发国，成为西非当时最大国家之一，深刻影响了尼日利亚北部的宗教与社会版图。',
      en: 'Usman dan Fodio\'s jihad founded one of West Africa\'s largest states, shaping the religion and society of northern Nigeria to this day.',
    },
  },
  {
    id: 'fall-of-khartoum',
    title: { zh: '喀土穆陷落', en: 'The Fall of Khartoum' },
    start: 1884, end: 1885, lat: 15.5, lon: 32.56,
    continent: 'africa',

    sourceIds: ['brit-siege-of-khartoum'],
    review: 'reviewed',
    civilizations: ['african', 'european'],    place: { zh: '苏丹 · 喀土穆', en: 'Khartoum, Sudan' },
    type: 'war', importance: 2,
    desc: {
      zh: '马赫迪起义军围城十月攻陷喀土穆，"中国通"戈登战死，英国远征军迟来一步，震动整个英帝国。',
      en: 'Mahdist forces took Khartoum after a ten-month siege, killing General Gordon; the relief column arrived two days late, stunning Britain.',
    },
  },
  {
    id: 'boer-war',
    title: { zh: '第二次布尔战争', en: 'The Second Boer War' },
    start: 1899, end: 1902, lat: -26.2, lon: 28.04,
    continent: 'africa',

    civilizations: ['african', 'european'],    geoPrecision: 'region',
    sourceIds: ['wiki-second-boer-war'],
    review: 'reviewed',
    place: { zh: '南部非洲 · 德兰士瓦', en: 'Transvaal, Southern Africa' },
    type: 'war', importance: 2,
    desc: {
      zh: '英帝国与布尔共和国为金矿与霸权鏖战三年，集中营的首次大规模使用与其惨烈后果，预示了二十世纪总体战的形态。',
      en: 'Britain and the Boer republics fought three years over gold and hegemony; the first wide use of concentration camps foreshadowed total war.',
    },
  },
  {
    id: 'triple-alliance-war',
    title: { zh: '三国同盟战争', en: 'The Paraguayan War' },
    start: 1864, end: 1870, lat: -25.28, lon: -57.63,
    continent: 'south-america',

    civilizations: ['latin-american'],    geoPrecision: 'region',
    sourceIds: ['wiki-paraguayan-war'],
    review: 'reviewed',
    place: { zh: '南美 · 巴拉圭', en: 'Paraguay, South America' },
    type: 'war', importance: 1,
    desc: {
      zh: '巴拉圭同时对抗巴西、阿根廷与乌拉圭，五年战争使巴拉圭损失过半人口，是美洲历史上最惨烈的冲突。',
      en: 'Paraguay fought Brazil, Argentina and Uruguay at once, losing over half its population — Latin America\'s deadliest war.',
    },
  },
  {
    id: 'pacific-war',
    title: { zh: '南美太平洋战争', en: 'The War of the Pacific' },
    start: 1879, end: 1883, lat: -20.2, lon: -70.15,
    continent: 'south-america',

    civilizations: ['latin-american'],    geoPrecision: 'region',
    sourceIds: ['wiki-war-of-the-pacific'],
    review: 'reviewed',
    place: { zh: '南美 · 阿塔卡马', en: 'Atacama, South America' },
    type: 'war', importance: 1,
    desc: {
      zh: '智利与秘鲁、玻利维亚为硝石矿床开战，智利获胜后玻利维亚失去出海口，两国至今为此龃龉不断。',
      en: 'Chile defeated Peru and Bolivia over nitrate fields; Bolivia lost its coastline, a grievance that endures today.',
    },
  },
  {
    id: 'singapore-founding',
    title: { zh: '莱佛士建立新加坡', en: 'Raffles Founds Singapore' },
    start: 1819, end: 1819, lat: 1.29, lon: 103.85,
    continent: 'asia',

    civilizations: ['european', 'indian'],    place: { zh: '东南亚 · 新加坡', en: 'Singapore, Southeast Asia' },
    type: 'economy', importance: 1,
    desc: {
      zh: '莱佛士在马六甲海峡南口设立自由港，新加坡从渔村成长为东西方贸易的枢纽。',
      en: 'Raffles opened a free port at the Strait of Malacca; a fishing village became the hinge of East–West trade.',
    },
  },
  {
    id: 'java-war',
    title: { zh: '爪哇战争', en: 'The Java War' },
    start: 1825, end: 1830, lat: -7.8, lon: 110.36,
    continent: 'asia',

    sourceIds: ['wiki-java-war'],
    review: 'reviewed',
    civilizations: ['islamic-world', 'european'],    place: { zh: '东南亚 · 爪哇', en: 'Java, Southeast Asia' },
    type: 'war', importance: 1,
    desc: {
      zh: '日惹王储蒂博尼哥罗率众反抗荷兰殖民税制与干涉，五年游击战虽败，却成为印尼民族记忆的源头之一。',
      en: 'Prince Diponegoro resisted Dutch taxation and interference in a five-year guerrilla war; the defeat seeded Indonesian national memory.',
    },
  },
  {
    id: 'philippines-1898',
    title: { zh: '美西战争与马尼拉湾', en: 'The Spanish–American War' },
    start: 1898, end: 1898, lat: 14.6, lon: 120.98,
    continent: 'asia',

    sourceIds: ['brit-spanish-american-war'],
    review: 'reviewed',
    civilizations: ['north-american', 'latin-american'],    place: { zh: '东南亚 · 马尼拉湾', en: 'Manila Bay, Philippines' },
    type: 'war', importance: 2,
    desc: {
      zh: '杜威舰队在马尼拉湾一天全歼西班牙分舰队，"夕阳帝国"崩塌，菲律宾、关岛、波多黎各易主，美国走上海外扩张之路。',
      en: 'Dewey\'s squadron destroyed the Spanish fleet in a morning; Spain\'s empire collapsed and the United States stepped onto the world stage.',
    },
  },
  {
    id: 'indian-national-congress',
    title: { zh: '印度国民大会党成立', en: 'The Indian National Congress Founded' },
    start: 1885, end: 1885, lat: 19.08, lon: 72.88,
    continent: 'asia',

    civilizations: ['indian'],    place: { zh: '印度 · 孟买', en: 'Bombay, India' },
    type: 'politics', importance: 1,
    desc: {
      zh: '72 位代表在孟买集会成立国大党，印度民族主义从起义失败后的废墟中走出体制化道路，最终通向 1947。',
      en: 'Seventy-two delegates met in Bombay; institutionalized nationalism rose from the rebellion\'s ruins, on the road to 1947.',
    },
  },
  {
    id: 'bessemer-process',
    title: { zh: '贝塞麦炼钢法', en: 'The Bessemer Process' },
    start: 1856, end: 1856, lat: 53.38, lon: -1.47,
    continent: 'europe',

    sourceIds: ['wiki-bessemer-process'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '英国 · 谢菲尔德', en: 'Sheffield, England' },
    type: 'economy', importance: 2,
    desc: {
      zh: '十分钟把生铁吹成钢，钢价腰斩再腰斩，铁路、钢船、摩天大楼与大桥自此有了廉价的骨架。',
      en: 'Blasting pig iron into steel in minutes crashed prices, giving railways, ships and skyscrapers their cheap skeleton.',
    },
  },
  {
    id: 'mendel-genetics',
    title: { zh: '孟德尔豌豆实验', en: 'Mendel\'s Pea Experiments' },
    start: 1866, end: 1866, lat: 49.2, lon: 16.6,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '奥地利 · 布尔诺', en: 'Brno, Austria' },
    type: 'science', importance: 1,
    desc: {
      zh: '修道院花园里八年的豌豆杂交发现了遗传的数学规律，被埋没三十四年后成为遗传学的起点。',
      en: 'Eight years of peas in a monastery garden revealed the mathematics of heredity — unnoticed for 34 years, then the start of genetics.',
    },
  },
  {
    id: 'pasteur-vaccine',
    title: { zh: '巴斯德狂犬疫苗', en: 'Pasteur\'s Rabies Vaccine' },
    start: 1885, end: 1885, lat: 48.85, lon: 2.3,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'science', importance: 2,
    desc: {
      zh: '被疯狗咬伤的九岁男孩接种成功，疫苗与细菌理论自此拯救的生命以十亿计，医学从经验走向科学。',
      en: 'A nine-year-old boy bitten by a rabid dog became the first success; vaccines and germ theory have saved lives by the billion.',
    },
  },
  {
    id: 'dreyfus-affair',
    title: { zh: '德雷福斯案件', en: 'The Dreyfus Affair' },
    start: 1894, end: 1906, lat: 48.86, lon: 2.35,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'society', importance: 1,
    desc: {
      zh: '犹太军官蒙冤构陷，左拉"我控诉"撕裂法国十二年，现代知识分子公开介入政治与"人权优先"的传统自此确立。',
      en: 'A Jewish officer\'s frame-up and Zola\'s "J\'accuse" split France for twelve years, inventing the engaged modern intellectual.',
    },
  },
  {
    id: 'social-insurance',
    title: { zh: '俾斯麦社会保险立法', en: 'Bismarck\'s Social Insurance' },
    start: 1883, end: 1889, lat: 52.52, lon: 13.4,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '德国 · 柏林', en: 'Berlin, Germany' },
    type: 'society', importance: 1,
    desc: {
      zh: '为驯服工人运动，德国率先建立疾病、工伤与养老金保险——世界上第一套现代福利国家制度。',
      en: 'To blunt the workers\' movement, Germany created health, accident and pension insurance — the first modern welfare state.',
    },
  },
  {
    id: 'new-zealand-wars',
    title: { zh: '新西兰土地战争', en: 'The New Zealand Wars' },
    start: 1845, end: 1872, lat: -39.0, lon: 174.2,
    continent: 'oceania',

    civilizations: ['european'],    place: { zh: '新西兰 · 塔拉纳基', en: 'Taranaki, New Zealand' },
    type: 'war', importance: 1,
    desc: {
      zh: '毛利部落以"保乌帕"筑垒战术对抗英国殖民军三十年，虽失去大片土地，其抗争成为新西兰双文化认同的历史原点。',
      en: 'Māori iwi resisted colonization for three decades behind fortified pā; the struggle anchors New Zealand\'s bicultural memory.',
    },
  },
  {
    id: 'transcontinental-railroad',
    title: { zh: '美国跨大陆铁路通车', en: 'The Transcontinental Railroad' },
    start: 1869, end: 1869, lat: 41.69, lon: -112.45,
    continent: 'north-america',

    civilizations: ['north-american'],    geoPrecision: 'region',
    place: { zh: '美国 · 普罗蒙特里峰会', en: 'Promontory, USA' },
    type: 'economy', importance: 3,
    sourceIds: ['brit-transcontinental-railroad'],
    review: 'reviewed',
    desc: {
      zh: '联合太平洋与中央太平洋两线在犹他州金钉合龙，华工与爱尔兰工人的汗水把大洋到大海的车程从六个月压缩到一周。',
      en: 'Union Pacific and Central Pacific met at the Golden Spike; Chinese and Irish labor cut the coast-to-coast journey from six months to a week.',
    },
  },
  {
    id: 'emancipation-serfs',
    title: { zh: '俄国农奴制废除', en: 'The Emancipation of the Serfs' },
    start: 1861, end: 1861, lat: 55.75, lon: 37.62,
    continent: 'europe',

    civilizations: ['russian'],    place: { zh: '俄罗斯 · 莫斯科', en: 'Moscow, Russia' },
    type: 'politics', importance: 3,
    sourceIds: ['wiki-emancipation-1861'],
    review: 'reviewed',
    desc: {
      zh: '亚历山大二世签署解放宣言，2300 万农奴获得自由，俄国踏上迟到的近代化之路，也为日后的革命埋下伏笔。',
      en: 'Alexander II freed 23 million serfs, setting Russia on a belated path to modernity — and toward future revolution.',
    },
  },
  {
    id: 'decembrist-revolt',
    title: { zh: '十二月党人起义', en: 'The Decembrist Revolt' },
    start: 1825, end: 1825, lat: 59.93, lon: 30.34,
    continent: 'europe',

    sourceIds: ['wiki-decembrist-revolt'],
    review: 'reviewed',
    civilizations: ['russian'],    place: { zh: '俄罗斯 · 圣彼得堡', en: 'St. Petersburg, Russia' },
    type: 'politics', importance: 2,
    desc: {
      zh: '一批受启蒙浸染的军官在元老院广场举事，要求宪政与废农奴，一日即败，却点亮了俄国革命思想的星火。',
      en: 'Enlightened officers rose in Senate Square demanding a constitution; crushed in a day, they lit Russia\'s revolutionary spark.',
    },
  },
  {
    id: 'trans-siberian',
    title: { zh: '西伯利亚大铁路开工', en: 'The Trans-Siberian Railway' },
    start: 1891, end: 1904, lat: 43.12, lon: 131.89,
    continent: 'asia',

    civilizations: ['russian'],    geoPrecision: 'region',
    sourceIds: ['brit-trans-siberian-railroad'],
    review: 'reviewed',
    place: { zh: '俄罗斯 · 海参崴', en: 'Vladivostok, Russia' },
    type: 'economy', importance: 2,
    desc: {
      zh: '九千余公里的钢轨横贯欧亚，莫斯科到太平洋只需两周，俄国向东投射力量的脊梁就此铸成。',
      en: 'Nine thousand kilometres of steel crossed Eurasia; Moscow reached the Pacific in two weeks, spining Russia\'s eastern reach.',
    },
  },
  {
    id: 'revolution-1905',
    title: { zh: '1905 年俄国革命', en: 'The Revolution of 1905' },
    start: 1905, end: 1905, lat: 59.93, lon: 30.34,
    continent: 'europe',

    sourceIds: ['brit-russian-revolution-1905'],
    review: 'reviewed',
    civilizations: ['russian'],    place: { zh: '俄罗斯 · 圣彼得堡', en: 'St. Petersburg, Russia' },
    type: 'politics', importance: 2,
    desc: {
      zh: '"流血星期日"的枪声引爆全国罢工与兵变，沙皇被迫设立杜马——1917 年大剧的第一次彩排。',
      en: '"Bloody Sunday" ignited strikes and mutinies; the Tsar conceded a Duma — a dress rehearsal for 1917.',
    },
  },
  {
    id: 'satsuma-rebellion',
    title: { zh: '西南战争', en: 'The Satsuma Rebellion' },
    start: 1877, end: 1877, lat: 31.6, lon: 130.56,
    continent: 'asia',

    sourceIds: ['wiki-satsuma-rebellion'],
    review: 'reviewed',
    civilizations: ['japanese'],    place: { zh: '日本 · 鹿儿岛', en: 'Kagoshima, Japan' },
    type: 'war', importance: 1,
    desc: {
      zh: '西乡隆盛率旧武士对抗征兵令与秩禄改革，最终败于自己曾参与缔造的近代国家军队，武士时代就此落幕。',
      en: 'Saigō Takamori\'s samurai rose against conscription and stipend reform — and fell to the modern army they had helped build.',
    },
  },
  {
    id: 'zuozongtang-xinjiang',
    title: { zh: '左宗棠收复新疆', en: 'Zuo Zongtang Recovers Xinjiang' },
    start: 1876, end: 1878, lat: 43.83, lon: 87.62,
    continent: 'asia',

    civilizations: ['chinese'],    geoPrecision: 'region',
    sourceIds: ['wiki-russian-conquest-central-asia'],
    review: 'reviewed',
    place: { zh: '中国 · 新疆', en: 'Xinjiang, China' },
    type: 'war', importance: 1,
    desc: {
      zh: '左宗棠抬棺出关，"缓进急战"两年扫平阿古柏政权，海防塞防之争以塞防胜利告终，新疆建省自此起步。',
      en: 'Carrying his coffin to the frontier, Zuo Zongtang crushed Yaqub Beg\'s regime in two years; Xinjiang became a province soon after.',
    },
  },
  {
    id: 'jingzhang-railway',
    title: { zh: '京张铁路建成', en: 'The Jingzhang Railway' },
    start: 1905, end: 1909, lat: 40.77, lon: 114.88,
    continent: 'asia',

    civilizations: ['chinese'],    place: { zh: '中国 · 张家口', en: 'Zhangjiakou, China' },
    type: 'science', importance: 1,
    desc: {
      zh: '詹天佑以"人"字形线路穿越燕山天险，建成中国人自主设计施工的第一条干线铁路。',
      en: 'Zhan Tianyou\'s switchback line through the Yanshan mountains — the first mainline railway designed and built by Chinese engineers.',
    },
  },
  {
    id: 'indian-railways',
    title: { zh: '印度首条铁路通车', en: 'India\'s First Railway' },
    start: 1853, end: 1853, lat: 19.08, lon: 72.88,
    continent: 'asia',

    civilizations: ['indian', 'european'],    place: { zh: '印度 · 孟买', en: 'Bombay, India' },
    type: 'economy', importance: 1,
    desc: {
      zh: '孟买到塔那 34 公里通车，殖民者的贸易动脉日后成为统一民族市场与独立运动的生命线。',
      en: 'Thirty-four kilometres from Bombay to Thane; a colonial trade artery became the circulatory system of a future nation.',
    },
  },
  {
    id: 'kimberley-diamonds',
    title: { zh: '金伯利钻石矿发现', en: 'Diamonds at Kimberley' },
    start: 1867, end: 1867, lat: -28.73, lon: 24.77,
    continent: 'africa',

    civilizations: ['african', 'european'],    place: { zh: '南部非洲 · 金伯利', en: 'Kimberley, Southern Africa' },
    type: 'economy', importance: 1,
    desc: {
      zh: '"大洞"矿坑引来全球淘钻潮，罗德斯在此起家，矿业资本与帝国扩张从此咬合在一起。',
      en: 'The "Big Hole" drew the world\'s diggers; Cecil Rhodes rose here, fusing mining capital with imperial expansion.',
    },
  },
  {
    id: 'persian-oil',
    title: { zh: '中东第一口油井', en: 'The Middle East\'s First Oil Well' },
    start: 1908, end: 1908, lat: 31.94, lon: 49.3,
    continent: 'asia',

    civilizations: ['islamic-world', 'european'],    place: { zh: '波斯 · 马斯吉德苏莱曼', en: 'Masjed Soleyman, Persia' },
    type: 'economy', importance: 2,
    desc: {
      zh: '英波石油公司在波斯西南打出商业油流，二十世纪的"石油政治"自此发端。',
      en: 'The Anglo-Persian Oil Company struck commercial oil in 1908 — the beginning of a century of oil politics.',
    },
  },
  {
    id: 'seneca-falls',
    title: { zh: '塞尼卡福尔斯女权大会', en: 'The Seneca Falls Convention' },
    start: 1848, end: 1848, lat: 42.91, lon: -76.8,
    continent: 'north-america',

    sourceIds: ['brit-seneca-falls-convention'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 塞尼卡福尔斯', en: 'Seneca Falls, USA' },
    type: 'society', importance: 2,
    desc: {
      zh: '三百人签署《情感宣言》宣告"人人生而平等"不分性别，有组织女权运动的第一份纲领自此诞生。',
      en: 'Three hundred people signed the Declaration of Sentiments — the founding manifesto of organized feminism.',
    },
  },
  {
    id: 'wspu-suffrage',
    title: { zh: '英国妇女社会政治联盟成立', en: 'The WSPU Founded' },
    start: 1903, end: 1911, lat: 53.48, lon: -2.24,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 曼彻斯特', en: 'Manchester, Britain' },
    type: 'society', importance: 2,
    desc: {
      zh: '潘克赫斯特母女喊出"行动，不要空话"，激进参政运动把女性选举权推上英国政治的头条。',
      en: 'The Pankhursts demanded "deeds, not words", pushing women\'s suffrage to the top of British politics.',
    },
  },
  {
    id: 'impressionism-exhibition',
    title: { zh: '首届印象派画展', en: 'The First Impressionist Exhibition' },
    start: 1874, end: 1874, lat: 48.86, lon: 2.34,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'ideas', importance: 1,
    desc: {
      zh: '莫奈《日出·印象》被评论家讥为"印象派"，嘲讽之名反而成为艺术史上最著名革命的旗帜。',
      en: 'Monet\'s "Impression" earned a sneer that became the banner of art history\'s most famous revolution.',
    },
  },
  {
    id: 'cinema-lumiere',
    title: { zh: '电影诞生', en: 'The Birth of Cinema' },
    start: 1895, end: 1895, lat: 48.87, lon: 2.33,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'science', importance: 2,
    desc: {
      zh: '卢米埃尔兄弟在巴黎大咖啡馆首次售票放映，观众看到火车进站时夺门而逃——第七艺术自此开始。',
      en: 'The Lumières charged admission at the Grand Café; audiences fled from an arriving train, and the seventh art began.',
    },
  },
  {
    id: 'x-rays',
    title: { zh: '伦琴发现X射线', en: 'Röntgen Discovers X-Rays' },
    start: 1895, end: 1895, lat: 49.79, lon: 9.95,
    continent: 'europe',

    sourceIds: ['brit-x-ray'],
    review: 'reviewed',
    civilizations: ['european'],    place: { zh: '德国 · 维尔茨堡', en: 'Würzburg, Germany' },
    type: 'science', importance: 2,
    desc: {
      zh: '穿透皮肉看见骨骼的"新射线"三个月内进入战地医院，首届诺贝尔物理学奖实至名归。',
      en: 'A ray that saw through flesh reached battlefield hospitals within months; the first Nobel Prize in Physics followed.',
    },
  },
  {
    id: 'nobel-prizes',
    title: { zh: '首届诺贝尔奖颁发', en: 'The First Nobel Prizes' },
    start: 1901, end: 1901, lat: 59.33, lon: 18.07,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '瑞典 · 斯德哥尔摩', en: 'Stockholm, Sweden' },
    type: 'society', importance: 1,
    desc: {
      zh: '炸药大王留下遗嘱以利息奖励"为人类带来最大益处者"，科学和平与文学的最高荣誉自此年年颁发。',
      en: 'The dynamite magnate\'s will funded prizes "to those who conferred the greatest benefit to humankind" — awarded ever since.',
    },
  },
  {
    id: 'lister-antiseptic',
    title: { zh: '李斯特抗菌外科', en: 'Lister\'s Antiseptic Surgery' },
    start: 1867, end: 1867, lat: 55.86, lon: -4.25,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 格拉斯哥', en: 'Glasgow, Britain' },
    type: 'science', importance: 2,
    desc: {
      zh: '石炭酸喷雾让术后死亡率从近半降到一成，"外科无菌时代"自此开启，手术不再是赌博。',
      en: 'Carbolic spray cut post-surgical death from nearly half to a tenth — surgery stopped being a gamble.',
    },
  },
  {
    id: 'maxwell-equations',
    title: { zh: '麦克斯韦电磁方程组', en: 'Maxwell\'s Equations' },
    start: 1865, end: 1865, lat: 52.21, lon: 0.12,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '英国 · 剑桥', en: 'Cambridge, Britain' },
    type: 'science', importance: 2,
    desc: {
      zh: '四个方程统一电与磁，并预言电磁波以光速传播——无线电、雷达与整个无线时代的理论源头。',
      en: 'Four equations united electricity and magnetism and predicted waves travelling at light speed — the seed of the wireless age.',
    },
  },
  {
    id: 'stanley-livingstone',
    title: { zh: '斯坦利找到利文斯通', en: 'Stanley Finds Livingstone' },
    start: 1871, end: 1871, lat: -4.91, lon: 29.67,
    continent: 'africa',

    sourceIds: ['brit-david-livingstone', 'brit-henry-morton-stanley'],
    review: 'reviewed',
    civilizations: ['african', 'european'],    place: { zh: '东非 · 乌吉吉', en: 'Ujiji, East Africa' },
    type: 'exploration', importance: 1,
    desc: {
      zh: '"利文斯通博士，我 presume？"《纽约先驱报》的一次炒作让世界重新注视非洲腹地。',
      en: '"Dr. Livingstone, I presume?" A newspaper stunt turned the world\'s eyes to Africa\'s interior.',
    },
  },
  {
    id: 'peary-north-pole',
    title: { zh: '皮尔里远征北极点', en: 'Peary\'s North Pole Expedition' },
    start: 1909, end: 1909, lat: 89.9, lon: -45,
    continent: 'polar',

    civilizations: ['north-american'],    timePrecision: 'circa',
    place: { zh: '北极点', en: 'The North Pole' },
    type: 'exploration', importance: 1,
    desc: {
      zh: '皮尔里宣布抵达北极点（其真实性至今有争议），人类两极探险的最后一章进入尾声。',
      en: 'Peary claimed the Pole (contested to this day); the last chapter of polar exploration drew to a close.',
    },
  },
  {
    id: 'brazil-abolition',
    title: { zh: '巴西《黄金法案》废除奴隶制', en: 'Brazil\'s Golden Law' },
    start: 1888, end: 1888, lat: -22.91, lon: -43.17,
    continent: 'south-america',

    sourceIds: ['wiki-overthrow-of-hawaii'],
    review: 'reviewed',
    civilizations: ['latin-american'],    place: { zh: '巴西 · 里约热内卢', en: 'Rio de Janeiro, Brazil' },
    type: 'society', importance: 2,
    desc: {
      zh: '伊莎贝尔公主签署《黄金法案》，美洲最后一个奴隶制国家和平废除奴隶制，约 70 万人获得自由。',
      en: 'Princess Isabel signed the Golden Law; the Americas\' last slave state abolished slavery peacefully, freeing some 700,000 people.',
    },
  },
  {
    id: 'hawaii-overthrow',
    title: { zh: '夏威夷王国覆灭', en: 'The Overthrow of Hawaii' },
    start: 1893, end: 1893, lat: 21.31, lon: -157.86,
    continent: 'oceania',

    civilizations: ['north-american'],    place: { zh: '太平洋 · 檀香山', en: 'Honolulu, Hawaii' },
    type: 'politics', importance: 1,
    desc: {
      zh: '种植园主与美军推翻利留卡拉尼女王，五年后夏威夷被并入美国，太平洋原住民王国的终章。',
      en: 'Planters and marines toppled Queen Liliʻuokalani; annexation followed five years later — the end of a Pacific kingdom.',
    },
  },
  {
    id: 'congo-free-state',
    title: { zh: '刚果自由邦暴政', en: 'The Congo Free State Atrocities' },
    start: 1885, end: 1908, lat: -4.32, lon: 15.31,
    continent: 'africa',

    civilizations: ['african', 'european'],    geoPrecision: 'country',
    place: { zh: '中非 · 刚果', en: 'Congo, Central Africa' },
    type: 'society', importance: 2,
    desc: {
      zh: '利奥波德二世把刚果当作私产榨取橡胶，暴行与人口锐减引发国际人权抗议运动，1908 年被迫移交比利时。',
      en: 'Leopold II ran the Congo as private property; the rubber terror sparked the first international human-rights protest movement.',
    },
  },
  {
    id: 'bosnian-annexation',
    title: { zh: '波斯尼亚危机', en: 'The Bosnian Annexation Crisis' },
    start: 1908, end: 1908, lat: 43.86, lon: 18.41,
    continent: 'europe',

    civilizations: ['european', 'ottoman'],    place: { zh: '巴尔干 · 萨拉热窝', en: 'Sarajevo, Balkans' },
    type: 'politics', importance: 1,
    desc: {
      zh: '奥匈吞并波斯尼亚激怒塞尔维亚民族主义者，六年后的萨拉热窝枪声就此埋下引线。',
      en: 'Austria-Hungary\'s annexation enraged Serbian nationalists — six years later the fuse was lit in Sarajevo.',
    },
  },
  {
    id: 'young-turks',
    title: { zh: '青年土耳其党革命', en: 'The Young Turk Revolution' },
    start: 1908, end: 1908, lat: 41.01, lon: 28.98,
    continent: 'europe',

    sourceIds: ['wiki-standard-oil'],
    review: 'reviewed',
    civilizations: ['ottoman'],    place: { zh: '奥斯曼 · 伊斯坦布尔', en: 'Istanbul, Ottoman Empire' },
    type: 'politics', importance: 2,
    desc: {
      zh: '青年军官迫使苏丹恢复1876年宪法，奥斯曼帝国最后一代改革者登上舞台，帝国走入其命运的末段。',
      en: 'Young officers forced the Sultan to restore the 1876 constitution — the empire\'s last reformers took the stage.',
    },
  },
  {
    id: 'standard-oil',
    title: { zh: '标准石油公司成立', en: 'The Standard Oil Era' },
    start: 1870, end: 1870, lat: 41.5, lon: -81.69,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '美国 · 克利夫兰', en: 'Cleveland, USA' },
    type: 'economy', importance: 1,
    desc: {
      zh: '洛克菲勒的标准石油垄断九成炼油业，托拉斯与"强盗大亨"时代开启，反垄断法因此而生。',
      en: 'Rockefeller\'s Standard Oil refined nine of every ten barrels — the age of trusts and robber barons, and of antitrust law.',
    },
  },
  {
    id: 'haymarket-affair',
    title: { zh: '干草市场事件', en: 'The Haymarket Affair' },
    start: 1886, end: 1886, lat: 41.88, lon: -87.63,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '美国 · 芝加哥', en: 'Chicago, USA' },
    type: 'society', importance: 1,
    desc: {
      zh: '八小时工作制大罢工中的炸弹与错判令四名无政府主义者殒命，五一国际劳动节自此而来。',
      en: 'A bomb and a miscarriage of justice during the eight-hour strikes — the origin of May Day.',
    },
  },
  {
    id: 'ellis-island',
    title: { zh: '埃利斯岛移民站启用', en: 'Ellis Island Opens' },
    start: 1892, end: 1892, lat: 40.7, lon: -74.05,
    continent: 'north-america',

    sourceIds: ['wiki-ellis-island'],
    review: 'reviewed',
    civilizations: ['north-american'],    place: { zh: '美国 · 纽约', en: 'New York, USA' },
    type: 'society', importance: 1,
    desc: {
      zh: '六十二年间一亿美国人从这里的第一代先祖踏足新大陆，"移民国家"的肌理由此生长。',
      en: 'Over 62 years, twelve million immigrants first touched America here — the making of a nation of nations.',
    },
  },
  {
    id: 'russo-turkish-war-1877',
    title: { zh: '俄土战争（1877–1878）', en: 'The Russo-Turkish War' },
    start: 1877, end: 1878, lat: 43.42, lon: 24.61,
    continent: 'europe',

    civilizations: ['russian', 'ottoman'],    place: { zh: '巴尔干 · 普列文', en: 'Pleven, Balkans' },
    type: 'war', importance: 1,
    desc: {
      zh: '俄军苦取普列文兵临君士坦丁堡，罗马尼亚塞尔维亚保加利亚相继摆脱奥斯曼，巴尔干火药桶完成了装填。',
      en: 'Pleven fell and Russia reached Constantinople\'s gates; the Balkans slipped from Ottoman rule — the powder keg was loaded.',
    },
  },
  // ---- V0.27.0 内容扩容 III（18 条，来源均已验证）----
  {
    id: 'nightingale-crimea',
    title: { zh: '南丁格尔与战地护理改革', en: 'Nightingale\'s Battlefield Nursing Reform' },
    start: 1854, end: 1856, lat: 41.03, lon: 28.98,
    continent: 'europe',

    civilizations: ['european', 'ottoman'],    place: { zh: '奥斯曼 · 伊斯坦布尔（斯库塔里）', en: 'Scutari, Istanbul' },
    type: 'society', importance: 2,
    desc: {
      zh: '南丁格尔率护士奔赴克里米亚前线，以卫生改革与数据统计把伤兵死亡率大幅压低，现代护理学由此奠基。',
      en: 'Nightingale led nurses to the Crimean front, slashing mortality through sanitation and statistics — founding modern nursing.',
    },
    sourceIds: ['brit-florence-nightingale', 'brit-opium-wars'],
    review: 'reviewed',
  },
  {
    id: 'nobel-marie-curie',
    title: { zh: '居里夫人获诺贝尔物理学奖', en: 'Marie Curie Wins the Nobel Prize in Physics' },
    start: 1903, end: 1903, lat: 48.85, lon: 2.35,
    continent: 'europe',

    civilizations: ['european'],    place: { zh: '法国 · 巴黎', en: 'Paris, France' },
    type: 'science', importance: 2,
    desc: {
      zh: '因放射性研究，居里夫人成为首位获诺贝尔奖的女性，此后再获化学奖，科学界的女性之门由此推开。',
      en: 'For radioactivity research, Curie became the first woman Nobel laureate — later winning again in chemistry.',
    },
    sourceIds: ['brit-marie-curie', 'wiki-ottoman-public-debt'],
    review: 'reviewed',
  },
  {
    id: 'qiu-jin',
    title: { zh: '秋瑾就义', en: 'The Execution of Qiu Jin' },
    start: 1907, end: 1907, lat: 30.0, lon: 120.58,
    continent: 'asia',

    civilizations: ['chinese'],    place: { zh: '中国 · 绍兴', en: 'Shaoxing, China' },
    type: 'society', importance: 1,
    desc: {
      zh: '女革命家秋瑾因起义事泄被捕就义，"秋风秋雨愁煞人"令其成为激励后来者的女性革命象征。',
      en: 'Revolutionary Qiu Jin was executed after an uprising leaked; her death became a rallying symbol for the republicans.',
    },
    sourceIds: ['wiki-qiu-jin'],
    review: 'reviewed',
  },
  {
    id: 'ottoman-default',
    title: { zh: '奥斯曼债务危机', en: 'The Ottoman Debt Crisis' },
    start: 1875, end: 1881, lat: 41.01, lon: 28.98,
    continent: 'europe',

    civilizations: ['ottoman'],    place: { zh: '奥斯曼 · 伊斯坦布尔', en: 'Istanbul, Ottoman Empire' },
    type: 'economy', importance: 1,
    desc: {
      zh: '奥斯曼帝国宣布债务违约，欧洲债权国设立公债管理局接管财政，帝国经济主权开始旁落。',
      en: 'The empire defaulted; European creditors set up the Ottoman Public Debt Administration, seizing fiscal control.',
    },
    sourceIds: ['wiki-ottoman-public-debt'],
    review: 'reviewed',
  },
  {
    id: 'hejaz-railway',
    title: { zh: '汉志铁路开工', en: 'The Hejaz Railway Begins' },
    start: 1900, end: 1908, lat: 33.51, lon: 36.29,
    continent: 'asia',

    civilizations: ['ottoman', 'islamic-world'],    geoPrecision: 'region',
    place: { zh: '奥斯曼 · 大马士革至麦地那', en: 'Damascus to Medina' },
    type: 'economy', importance: 1,
    desc: {
      zh: '奥斯曼以宗教与战略名义修筑贯通阿拉伯的铁路，既强化帝国边陲控制，也在日后战事中成为袭击目标。',
      en: 'The Ottomans built a railway deep into Arabia — tightening imperial control and later becoming a wartime target.',
    },
    sourceIds: ['wiki-hejaz-railway'],
    review: 'reviewed',
  },
  {
    id: 'young-turk-revolution',
    title: { zh: '青年土耳其党革命', en: 'The Young Turk Revolution' },
    start: 1908, end: 1908, lat: 40.64, lon: 22.94,
    continent: 'europe',

    civilizations: ['ottoman'],    place: { zh: '奥斯曼 · 萨洛尼卡', en: 'Salonika, Ottoman Empire' },
    type: 'politics', importance: 2,
    desc: {
      zh: '统一与进步委员会以兵谏迫使苏丹恢复 1876 年宪法，奥斯曼进入第二次立宪时期，专制时代落幕。',
      en: 'The CUP forced the sultan to restore the 1876 constitution, opening the Second Constitutional Era.',
    },
    sourceIds: ['brit-young-turk-revolution'],
    review: 'reviewed',
  },
  {
    id: 'bulgaria-independence',
    title: { zh: '保加利亚宣告独立', en: 'Bulgaria Declares Independence' },
    start: 1908, end: 1908, lat: 42.7, lon: 23.32,
    continent: 'europe',

    civilizations: ['european', 'ottoman'],    place: { zh: '保加利亚 · 索菲亚', en: 'Sofia, Bulgaria' },
    type: 'politics', importance: 1,
    desc: {
      zh: '趁列强忙于波斯尼亚危机，费迪南德大公宣布保加利亚脱离奥斯曼宗主权升格王国。',
      en: 'Seizing the Bosnian crisis, Prince Ferdinand proclaimed Bulgaria a kingdom free of Ottoman suzerainty.',
    },
    sourceIds: ['wiki-bulgarian-declaration'],
    review: 'reviewed',
  },
  {
    id: 'amazon-rubber',
    title: { zh: '亚马孙橡胶热潮', en: 'The Amazon Rubber Boom' },
    start: 1880, end: 1912, lat: -3.12, lon: -60.02,
    continent: 'south-america',

    civilizations: ['latin-american'],    geoPrecision: 'region',
    place: { zh: '巴西 · 马瑙斯', en: 'Manaus, Brazil' },
    type: 'economy', importance: 1,
    desc: {
      zh: '汽车与电气时代令橡胶价格暴涨，马瑙斯一夜暴富成"森林歌剧院"之城；亚洲种植园兴起后繁荣瞬间崩塌。',
      en: 'Automobile demand sent rubber prices soaring — Manaus bloomed into an opera-house city, then collapsed.',
    },
    sourceIds: ['wiki-amazon-rubber-cycle'],
    review: 'reviewed',
  },
  {
    id: 'panama-independence',
    title: { zh: '巴拿马脱离哥伦比亚', en: 'Panama Secedes from Colombia' },
    start: 1903, end: 1903, lat: 8.98, lon: -79.52,
    continent: 'north-america',

    civilizations: ['latin-american', 'north-american'],    place: { zh: '巴拿马 · 巴拿马城', en: 'Panama City, Panama' },
    type: 'politics', importance: 1,
    desc: {
      zh: '在美国海军支持下巴拿马宣布脱离哥伦比亚，三周后签署运河条约，地峡命运与运河工程自此绑定。',
      en: 'Backed by U.S. warships, Panama seceded; within weeks the canal treaty bound the isthmus to the project.',
    },
    sourceIds: ['wiki-secession-of-panama'],
    review: 'reviewed',
  },
  {
    id: 'federation-malaya',
    title: { zh: '马来联邦成立', en: 'The Federated Malay States' },
    start: 1895, end: 1895, lat: 3.14, lon: 101.69,
    continent: 'asia',

    sourceIds: ['wiki-federated-malay-states'],
    review: 'reviewed',
    civilizations: ['european', 'indian'],    place: { zh: '马来亚 · 吉隆坡', en: 'Kuala Lumpur, Malaya' },
    type: 'politics', importance: 1,
    desc: {
      zh: '霹雳雪兰莪森美兰彭亨四邦组成联邦，英国驻扎官制度定型，锡矿与胶园经济加速殖民地化。',
      en: 'Four sultanates formed a federation under the Resident system, accelerating tin-and-rubber colonialization.',
    },
  },
  {
    id: 'cuba-independence-war',
    title: { zh: '古巴独立战争再起', en: 'The Cuban War of Independence' },
    start: 1895, end: 1898, lat: 23.11, lon: -82.37,
    continent: 'north-america',

    sourceIds: ['wiki-cuban-war-of-independence', 'brit-spanish-american-war'],
    review: 'reviewed',
    civilizations: ['latin-american', 'north-american'],    place: { zh: '古巴 · 哈瓦那', en: 'Havana, Cuba' },
    type: 'war', importance: 1,
    desc: {
      zh: '马蒂与戈麦斯再举义旗，战事与美国利益纠缠，最终引出美西战争与古巴名义独立。',
      en: 'Martí and Gómez rose again; the entanglement with U.S. interests led to the Spanish-American War.',
    },
  },
  {
    id: 'gongche-shangshu',
    title: { zh: '公车上书', en: 'The Petition of the Examination Candidates' },
    start: 1895, end: 1895, lat: 39.9, lon: 116.4,
    continent: 'asia',

    civilizations: ['chinese'],    place: { zh: '中国 · 北京', en: 'Beijing, China' },
    type: 'politics', importance: 1,
    desc: {
      zh: '《马关条约》传闻传至京城，康有为率一千余名举人上书拒和迁都变法，士人干政自此成为晚清政治变量。',
      en: 'After the Shimonoseki news broke, Kang Youwei led over 1,200 candidates in petitioning for reform.',
    },
    sourceIds: ['brit-kang-youwei'],
    review: 'reviewed',
  },
  {
    id: 'meiji-constitution',
    title: { zh: '《大日本帝国宪法》颁布', en: 'The Meiji Constitution Promulgated' },
    start: 1889, end: 1889, lat: 35.7, lon: 139.7,
    continent: 'asia',

    civilizations: ['japanese'],    place: { zh: '日本 · 东京', en: 'Tokyo, Japan' },
    type: 'politics', importance: 2,
    desc: {
      zh: '伊藤博文主持起草的钦定宪法颁布，设帝国议会而主权仍在天皇，日本以普鲁士式体制完成立宪外壳。',
      en: 'Drafted under Itō Hirobumi, the constitution created a diet while keeping sovereignty with the emperor.',
    },
    sourceIds: ['brit-meiji-constitution'],
    review: 'reviewed',
  },
  {
    id: 'portsmouth-treaty',
    title: { zh: '《朴茨茅斯条约》签订', en: 'The Treaty of Portsmouth' },
    start: 1905, end: 1905, lat: 43.07, lon: -70.76,
    continent: 'north-america',

    civilizations: ['russian', 'japanese', 'north-american'],    place: { zh: '美国 · 朴茨茅斯', en: 'Portsmouth, USA' },
    type: 'politics', importance: 1,
    desc: {
      zh: '西奥多·罗斯福斡旋日俄停战，日本取得南满权益却未获赔款，愤怒的东京民众酿成日比谷烧打事件。',
      en: 'Roosevelt mediated the Russo-Japanese peace; Japan gained South Manchuria but no indemnity, sparking riots in Tokyo.',
    },
    sourceIds: ['brit-treaty-of-portsmouth'],
    review: 'reviewed',
  },
  {
    id: 'bengal-partition',
    title: { zh: '孟加拉分省', en: 'The Partition of Bengal' },
    start: 1905, end: 1911, lat: 22.57, lon: 88.36,
    continent: 'asia',

    civilizations: ['indian', 'european'],    place: { zh: '印度 · 加尔各答', en: 'Calcutta, India' },
    type: 'politics', importance: 1,
    desc: {
      zh: '寇松以行政理由分割孟加拉，激起 swadeshi 抵制运动，民族主义从精英请愿转向群众动员。',
      en: 'Curzon partitioned Bengal "for administration," igniting the Swadeshi movement and mass nationalism.',
    },
    sourceIds: ['brit-partition-of-bengal'],
    review: 'reviewed',
  },
  {
    id: 'tongmenghui',
    title: { zh: '中国同盟会成立', en: 'The Tongmenghui Founded' },
    start: 1905, end: 1905, lat: 35.68, lon: 139.7,
    continent: 'asia',

    civilizations: ['chinese', 'japanese'],    place: { zh: '日本 · 东京', en: 'Tokyo, Japan' },
    type: 'politics', importance: 2,
    desc: {
      zh: '孙中山合并兴中会华兴会光复会于东京成立同盟会，"驱除鞑虏恢复中华"从此有了全国性革命组织。',
      en: 'Sun Yat-sen merged the revolutionary societies in Tokyo, giving Chinese republicanism a national organization.',
    },
    sourceIds: ['wiki-tongmenghui'],
    review: 'reviewed',
  },
  {
    id: 'second-industrial-revolution',
    title: { zh: '第二次工业革命', en: 'The Second Industrial Revolution' },
    start: 1870, end: 1914, lat: 52.52, lon: 13.4,
    continent: 'europe',

    civilizations: ['european', 'north-american'],    geoPrecision: 'multi',
    place: { zh: '德国 · 柏林与美国东部', en: 'Berlin & the Eastern U.S.' },
    type: 'economy', importance: 3,
    desc: {
      zh: '电气、化学与内燃机取代蒸汽成为增长引擎，研究实验室与公司制把发明变成产业，美德由此赶超英国。',
      en: 'Electricity, chemistry and the combustion engine replaced steam; R&D labs and corporations let the U.S. and Germany overtake Britain.',
    },
    sourceIds: ['wiki-second-industrial-revolution'],
    review: 'reviewed',
  },
  {
    id: 'redemption-us',
    title: { zh: '美国重建时期终结', en: 'The End of Reconstruction' },
    start: 1877, end: 1877, lat: 38.9, lon: -77.04,
    continent: 'north-america',

    civilizations: ['north-american'],    place: { zh: '美国 · 华盛顿', en: 'Washington, USA' },
    type: 'politics', importance: 1,
    desc: {
      zh: '1877 年妥协案撤出南方联邦驻军，重建时代落幕，南方种族隔离制度在此后数十年间固化。',
      en: 'The Compromise of 1877 withdrew federal troops from the South; Reconstruction ended and Jim Crow hardened.',
    },
    sourceIds: ['wiki-compromise-of-1877'],
    review: 'reviewed',
  },
]
