import type { HistoricalRoute, RouteKind } from './model'

export type { HistoricalRoute, RouteKind, RoutePoint } from './model'

/** 路线类型展示名与主题色（PHASE B） */
export const ROUTE_KINDS: Record<RouteKind, { zh: string; en: string; color: string }> = {
  voyage: { zh: '航海探险', en: 'Voyage', color: '#22d3ee' },
  expedition: { zh: '陆上探险', en: 'Expedition', color: '#f59e0b' },
  trade: { zh: '商贸路线', en: 'Trade', color: '#eab308' },
  migration: { zh: '人口迁徙', en: 'Migration', color: '#34d399' },
  military: { zh: '军事行动', en: 'Military', color: '#ef4444' },
  scientific: { zh: '科学考察', en: 'Scientific', color: '#a78bfa' },
  cultural: { zh: '文化传播', en: 'Cultural', color: '#f472b6' },
  discovery: { zh: '地理发现', en: 'Discovery', color: '#60a5fa' },
}

/**
 * 首批历史路线（V0.29.0，PHASE B2）。全部有 Britannica 条目支撑（已验证）；
 * 坐标取通行史地常识的代表性节点，历史航线的海上段为示意走向（连接港口的
 * 大圆弧线），争议或细节缺失处在 uncertainty 说明。来源必填。
 */
export const ROUTES: HistoricalRoute[] = [
  {
    id: 'silk-road',
    name: { zh: '丝绸之路', en: 'The Silk Road' },
    kind: 'trade',
    era: { zh: '汉唐至蒙元时期', en: 'Han–Tang to Mongol era' },
    start: -130,
    end: 1450,
    points: [
      { name: { zh: '长安（西安）', en: 'Chang\'an (Xi\'an)' }, lat: 34.27, lon: 108.9, year: -130 },
      { name: { zh: '敦煌', en: 'Dunhuang' }, lat: 40.14, lon: 94.66 },
      { name: { zh: '疏勒（喀什）', en: 'Kashgar' }, lat: 39.47, lon: 75.99 },
      { name: { zh: '撒马尔罕', en: 'Samarkand' }, lat: 39.65, lon: 66.96 },
      { name: { zh: '木鹿（梅尔夫）', en: 'Merv' }, lat: 37.66, lon: 61.83 },
      { name: { zh: '巴格达', en: 'Baghdad' }, lat: 33.31, lon: 44.36 },
      { name: { zh: '安条克', en: 'Antioch' }, lat: 36.2, lon: 36.16 },
      { name: { zh: '君士坦丁堡', en: 'Constantinople' }, lat: 41.01, lon: 28.98 },
    ],
    desc: {
      zh: '联结长安与地中海的陆上商路网络：丝绸、香料、宗教与技艺沿此东西流动，"丝路"为 19 世纪学者命名，实为多条支线的统称。',
      en: 'The overland network linking Chang\'an to the Mediterranean — silk, spices, faiths and crafts flowed both ways; "Silk Road" is a 19th-century name for many branching routes.',
    },
    uncertainty: {
      zh: '示意为盛期主干走向；具体城址与支线随时代变迁很大。',
      en: 'Main-stem alignment at its heyday; exact sites and branches varied greatly over time.',
    },
    sourceIds: ['brit-silk-road'],
    review: 'reviewed',
  },
  {
    id: 'zheng-he-voyage-1',
    name: { zh: '郑和首下西洋', en: 'Zheng He\'s First Voyage' },
    kind: 'voyage',
    era: { zh: '明永乐年间', en: 'Ming, Yongle era' },
    start: 1405,
    end: 1407,
    personIds: [],
    points: [
      { name: { zh: '刘家港（太仓）', en: 'Liujiagang (Taicang)' }, lat: 31.45, lon: 121.1, year: 1405 },
      { name: { zh: '占城新州港', en: 'Qui Nhon, Champa' }, lat: 13.77, lon: 109.22, year: 1405 },
      { name: { zh: '满剌加（马六甲）', en: 'Malacca' }, lat: 2.19, lon: 102.25, year: 1405 },
      { name: { zh: '苏门答腊巨港', en: 'Palembang, Sumatra' }, lat: -2.99, lon: 104.75 },
      { name: { zh: '锡兰山（科伦坡）', en: 'Ceylon (Colombo)' }, lat: 6.93, lon: 79.85, year: 1406 },
      { name: { zh: '古里（卡利卡特）', en: 'Calicut, India' }, lat: 11.25, lon: 75.78, year: 1407 },
    ],
    desc: {
      zh: '郑和率宝船船队首下西洋：经占城、满剌加至印度古里，携明廷诏敕开展朝贡贸易，此后二十余年六下西洋。',
      en: 'Zheng He\'s treasure fleet sailed from Taicang via Champa and Malacca to Calicut on a tributary trade mission — the first of seven voyages.',
    },
    uncertainty: {
      zh: '宝船尺度与具体泊地存在学术争议；示意为通行停靠序列。',
      en: 'Ship dimensions and some anchorage details are debated; the stop sequence shown is the conventional one.',
    },
    sourceIds: ['brit-zheng-he'],
    review: 'reviewed',
  },
  {
    id: 'columbus-first-voyage',
    name: { zh: '哥伦布首航', en: 'Columbus\'s First Voyage' },
    kind: 'voyage',
    era: { zh: '大航海时代', en: 'Age of Discovery' },
    start: 1492,
    end: 1493,
    points: [
      { name: { zh: '帕洛斯（西班牙）', en: 'Palos, Spain' }, lat: 37.19, lon: -6.9, year: 1492 },
      { name: { zh: '戈梅拉（加那利）', en: 'La Gomera, Canaries' }, lat: 28.03, lon: -17.22, year: 1492 },
      { name: { zh: '圣萨尔瓦多', en: 'San Salvador' }, lat: 24.06, lon: -74.45, year: 1492 },
      { name: { zh: '古巴东北岸', en: 'NE Cuba' }, lat: 23.15, lon: -81.2 },
      { name: { zh: '海地角（伊斯帕尼奥拉）', en: 'Cap-Haïtien, Hispaniola' }, lat: 19.85, lon: -72.7 },
      { name: { zh: '里斯本（返航）', en: 'Lisbon (return)' }, lat: 38.7, lon: -9.14, year: 1493 },
    ],
    desc: {
      zh: '哥伦布携三船西航，经加那利借信风横渡大西洋，抵达巴哈马群岛——开启欧洲与美洲的持续接触（他本人始终认为是东亚）。',
      en: 'Columbus sailed west via the Canaries trade winds to the Bahamas — opening sustained European–American contact (he believed it was Asia).',
    },
    uncertainty: {
      zh: '首登陆点（圣萨尔瓦多岛）存在多种考证说法。',
      en: 'The first landfall island is disputed among candidate sites.',
    },
    sourceIds: ['brit-columbus'],
    review: 'reviewed',
  },
  {
    id: 'magellan-circumnavigation',
    name: { zh: '麦哲伦—埃尔卡诺环球航行', en: 'Magellan–Elcano Circumnavigation' },
    kind: 'voyage',
    era: { zh: '大航海时代', en: 'Age of Discovery' },
    start: 1519,
    end: 1522,
    points: [
      { name: { zh: '桑卢卡尔（西班牙）', en: 'Sanlúcar, Spain' }, lat: 36.77, lon: -6.35, year: 1519 },
      { name: { zh: '里约热内卢', en: 'Rio de Janeiro' }, lat: -22.9, lon: -43.2, year: 1519 },
      { name: { zh: '圣胡利安港', en: 'Puerto San Julián' }, lat: -49.3, lon: -67.7, year: 1520 },
      { name: { zh: '麦哲伦海峡', en: 'Strait of Magellan' }, lat: -53.5, lon: -70.9, year: 1520 },
      { name: { zh: '关岛', en: 'Guam' }, lat: 13.44, lon: 144.79, year: 1521 },
      { name: { zh: '宿务（麦哲伦殒命）', en: 'Cebu (Magellan killed)' }, lat: 10.32, lon: 123.9, year: 1521 },
      { name: { zh: '蒂多雷（香料群岛）', en: 'Tidore, Moluccas' }, lat: 0.68, lon: 127.4, year: 1521 },
      { name: { zh: '好望角', en: 'Cape of Good Hope' }, lat: -34.36, lon: 18.47, year: 1522 },
      { name: { zh: '塞维利亚（环球完成）', en: 'Seville (circumnavigation done)' }, lat: 37.39, lon: -5.98, year: 1522 },
    ],
    desc: {
      zh: '人类首次环球航行：麦哲伦穿海峡入太平洋并于宿务殒命，埃尔卡诺率残部经印度洋与好望角返抵西班牙，历时三年。',
      en: 'The first circumnavigation: Magellan crossed into the Pacific and died at Cebu; Elcano brought the last ship home via the Indian Ocean in three years.',
    },
    uncertainty: {
      zh: '航程依船队幸存日志重构；太平洋横渡的具体走向为学者推定，原始记录并不完整。',
      en: 'Reconstructed from surviving logs; the Pacific crossing\'s exact track is a scholarly reconstruction — original records are incomplete.',
    },
    sourceIds: ['brit-magellan'],
    review: 'reviewed',
  },
  {
    id: 'cook-first-voyage',
    name: { zh: '库克首航（奋进号）', en: 'Cook\'s First Voyage (Endeavour)' },
    kind: 'scientific',
    era: { zh: '启蒙时代科学考察', en: 'Enlightenment scientific survey' },
    start: 1768,
    end: 1771,
    personIds: [],
    points: [
      { name: { zh: '普利茅斯（英国）', en: 'Plymouth, England' }, lat: 50.37, lon: -4.14, year: 1768 },
      { name: { zh: '马德拉', en: 'Madeira' }, lat: 32.65, lon: -16.9, year: 1768 },
      { name: { zh: '里约热内卢', en: 'Rio de Janeiro' }, lat: -22.9, lon: -43.2, year: 1768 },
      { name: { zh: '火地岛', en: 'Tierra del Fuego' }, lat: -55.9, lon: -67.3, year: 1769 },
      { name: { zh: '塔希提（观测金星凌日）', en: 'Tahiti (Venus transit)' }, lat: -17.65, lon: -149.43, year: 1769 },
      { name: { zh: '新西兰（环岛测绘）', en: 'New Zealand (circumnavigated)' }, lat: -41.6, lon: 174.2, year: 1769 },
      { name: { zh: '植物学湾（澳大利亚）', en: 'Botany Bay, Australia' }, lat: -33.99, lon: 151.23, year: 1770 },
      { name: { zh: '巴达维亚（雅加达）', en: 'Batavia (Jakarta)' }, lat: -6.1, lon: 106.9, year: 1770 },
      { name: { zh: '好望角', en: 'Cape of Good Hope' }, lat: -33.9, lon: 18.42, year: 1771 },
    ],
    desc: {
      zh: '皇家学会与海军联合科考：观测金星凌日、测绘新西兰并抵达澳大利亚东岸，随船班克斯采集的标本重塑欧洲自然史。',
      en: 'A Royal Society–navy survey: Venus transit, New Zealand charted, Australia\'s east coast reached — Banks\' specimens reshaped European natural history.',
    },
    sourceIds: ['brit-james-cook'],
    review: 'reviewed',
  },
]

export const ROUTE_KIND_LABEL = (k: RouteKind): { zh: string; en: string; color: string } =>
  ROUTE_KINDS[k]
