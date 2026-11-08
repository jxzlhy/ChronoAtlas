import type { Person, PersonLink } from './model'

/**
 * 历史人物层：与事件挂接，供搜索与事件卡"相关人物"展示。
 * eventIds 第一个为主事件（搜索跳转目标）。
 */
export type { Person }

export const PEOPLE: Person[] = [
  {
    id: 'diderot',
    name: { zh: '狄德罗', en: 'Denis Diderot' },
    life: '1713 – 1784',
    bio: {
      zh: '法国启蒙思想家，主编《百科全书》，系统汇编人类知识。',
      en: 'French Enlightenment philosopher, chief editor of the Encyclopédie.',
    },
    eventIds: ['encyclopedie'],

    sourceIds: ['brit-denis-diderot'],
    review: 'reviewed',
    places: [
      { name: { zh: '朗格勒', en: 'Langres' }, lat: 47.86, lon: 5.33, year: 1713, role: 'birth' },
      { name: { zh: '巴黎', en: 'Paris' }, lat: 48.86, lon: 2.35, year: 1742, role: 'active' },
    ],
  },
  {
    id: 'rousseau',
    name: { zh: '卢梭', en: 'Jean-Jacques Rousseau' },
    life: '1712 – 1778',
    bio: {
      zh: '"人生而自由，却无往不在枷锁之中"，主权在民思想的奠基人。',
      en: 'Philosopher of popular sovereignty: "Man is born free, and everywhere he is in chains."',
    },
    eventIds: ['social-contract'],

    sourceIds: ['brit-rousseau'],
    review: 'reviewed',  },
  {
    id: 'cook',
    name: { zh: '库克船长', en: 'Captain James Cook' },
    life: '1728 – 1779',
    bio: {
      zh: '三次远航绘制太平洋精确海图，抵达澳洲东岸与夏威夷。',
      en: 'Charted the Pacific on three voyages, reaching Australia and Hawaii.',
    },
    eventIds: ['cooks-voyages'],

    sourceIds: ['brit-james-cook'],
    review: 'reviewed',  },
  {
    id: 'watt',
    name: { zh: '瓦特', en: 'James Watt' },
    life: '1736 – 1819',
    bio: {
      zh: '为蒸汽机加装分离冷凝器，人类第一次拥有可随处部署的强大动力源。',
      en: 'His separate condenser made steam power universally deployable.',
    },
    eventIds: ['watt-steam-engine', 'industrial-revolution'],

    sourceIds: ['brit-james-watt'],
    review: 'reviewed',
    places: [
      { name: { zh: '格里诺克', en: 'Greenock' }, lat: 55.95, lon: -4.76, year: 1736, role: 'birth' },
      { name: { zh: '格拉斯哥', en: 'Glasgow' }, lat: 55.86, lon: -4.25, year: 1754, role: 'active' },
      { name: { zh: '伯明翰', en: 'Birmingham' }, lat: 52.48, lon: -1.9, year: 1774, role: 'active' },
    ],
  },
  {
    id: 'adam-smith',
    name: { zh: '亚当·斯密', en: 'Adam Smith' },
    life: '1723 – 1790',
    bio: {
      zh: '《国富论》作者，以"看不见的手"奠定现代经济学。',
      en: 'Author of The Wealth of Nations, founder of modern economics.',
    },
    eventIds: ['wealth-of-nations'],

    sourceIds: ['brit-adam-smith'],
    review: 'reviewed',  },
  {
    id: 'washington',
    name: { zh: '华盛顿', en: 'George Washington' },
    life: '1732 – 1799',
    bio: {
      zh: '率大陆军赢得独立，两任总统后主动交权，确立共和传统。',
      en: 'Led the Continental Army to independence and set the republican precedent.',
    },
    eventIds: ['us-independence'],

    sourceIds: ['brit-george-washington'],
    review: 'reviewed',  },
  {
    id: 'napoleon',
    name: { zh: '拿破仑', en: 'Napoléon Bonaparte' },
    life: '1769 – 1821',
    bio: {
      zh: '从科西嘉炮兵到法兰西皇帝，《拿破仑法典》影响至今。',
      en: 'From Corsican artillery officer to Emperor; his civil code endures.',
    },
    eventIds: ['napoleonic-wars', 'french-revolution'],

    sourceIds: ['brit-napoleon-i'],
    review: 'reviewed',  },
  {
    id: 'stephenson',
    name: { zh: '史蒂芬孙', en: 'George Stephenson' },
    life: '1781 – 1848',
    bio: {
      zh: '"铁路之父"，"动力号"机车开启铁路时代。',
      en: '"Father of railways"; his Locomotion No. 1 opened the railway age.',
    },
    eventIds: ['stockton-darlington'],

    sourceIds: ['brit-george-stephenson'],
    review: 'reviewed',  },
  {
    id: 'bolivar',
    name: { zh: '玻利瓦尔', en: 'Simón Bolívar' },
    life: '1783 – 1830',
    bio: {
      zh: '"解放者"，率军解放南美北部诸国，玻利维亚以其命名。',
      en: '"The Liberator" of northern South America; Bolivia bears his name.',
    },
    eventIds: ['latin-american-independence'],

    sourceIds: ['brit-simon-bolivar'],
    review: 'reviewed',  },
  {
    id: 'muhammad-ali',
    name: { zh: '穆罕默德·阿里', en: 'Muhammad Ali' },
    life: '1769 – 1849',
    bio: {
      zh: '奥斯曼治下埃及的实权帕夏，以军政经改革开启埃及近代化。',
      en: 'De facto ruler of Egypt whose reforms modernized the state.',
    },
    eventIds: ['muhammad-ali-reforms'],

    sourceIds: ['wiki-muhammad-ali-egypt'],
    review: 'reviewed',  },
  {
    id: 'lin-zexu',
    name: { zh: '林则徐', en: 'Lin Zexu' },
    life: '1785 – 1850',
    bio: {
      zh: '虎门销烟的钦差大臣，"开眼看世界第一人"。',
      en: 'Commissioner who destroyed opium at Humen; China\'s first open-eyed reformer.',
    },
    eventIds: ['first-opium-war'],

    sourceIds: ['brit-lin-zexu'],
    review: 'reviewed',  },
  {
    id: 'darwin',
    name: { zh: '达尔文', en: 'Charles Darwin' },
    life: '1809 – 1882',
    bio: {
      zh: '以自然选择解释生命演化，重塑生物学与整个时代的世界观。',
      en: 'Explained evolution by natural selection, reshaping biology and worldview.',
    },
    eventIds: ['origin-of-species'],

    sourceIds: ['brit-charles-darwin'],
    review: 'reviewed',
    places: [
      { name: { zh: '什鲁斯伯里', en: 'Shrewsbury' }, lat: 52.71, lon: -2.75, year: 1809, role: 'birth' },
      { name: { zh: '剑桥', en: 'Cambridge' }, lat: 52.2, lon: 0.12, year: 1828, role: 'active' },
      { name: { zh: '唐恩村（唐恩小筑）', en: 'Downe (Down House)' }, lat: 51.33, lon: 0.18, year: 1842, role: 'active' },
    ],
  },
  {
    id: 'marx',
    name: { zh: '马克思', en: 'Karl Marx' },
    life: '1818 – 1883',
    bio: {
      zh: '与恩格斯合著《共产党宣言》，深刻影响此后一个多世纪的世界政治。',
      en: 'Co-author of the Communist Manifesto, shaping a century of politics.',
    },
    eventIds: ['communist-manifesto'],

    sourceIds: ['brit-karl-marx'],
    review: 'reviewed',
    places: [
      { name: { zh: '特里尔', en: 'Trier' }, lat: 49.75, lon: 6.63, year: 1818, role: 'birth' },
      { name: { zh: '柏林', en: 'Berlin' }, lat: 52.52, lon: 13.4, year: 1836, role: 'active' },
      { name: { zh: '伦敦', en: 'London' }, lat: 51.5, lon: -0.12, year: 1849, role: 'active' },
    ],
  },
  {
    id: 'engels',
    name: { zh: '恩格斯', en: 'Friedrich Engels' },
    life: '1820 – 1895',
    bio: {
      zh: '马克思终身的合作者与支持者，《共产党宣言》合著者，《资本论》后续卷册的整理者。',
      en: 'Marx\'s lifelong collaborator and supporter — co-author of the Manifesto and editor of Capital\'s later volumes.',
    },
    eventIds: ['communist-manifesto', 'paris-commune'],

    sourceIds: ['brit-friedrich-engels'],
    review: 'reviewed',
    places: [
      { name: { zh: '巴门（伍珀塔尔）', en: 'Barmen (Wuppertal)' }, lat: 51.26, lon: 7.18, year: 1820, role: 'birth' },
      { name: { zh: '曼彻斯特', en: 'Manchester' }, lat: 53.48, lon: -2.24, year: 1842, role: 'active' },
      { name: { zh: '伦敦', en: 'London' }, lat: 51.5, lon: -0.12, year: 1870, role: 'active' },
    ],
  },
  {
    id: 'perry',
    name: { zh: '佩里', en: 'Matthew C. Perry' },
    life: '1794 – 1858',
    bio: {
      zh: '率"黑船"叩关日本，终结德川幕府两百余年的锁国。',
      en: 'His "Black Ships" ended Japan\'s two centuries of seclusion.',
    },
    eventIds: ['perry-expedition'],

    sourceIds: ['brit-matthew-perry'],
    review: 'reviewed',  },
  {
    id: 'nightingale',
    name: { zh: '南丁格尔', en: 'Florence Nightingale' },
    life: '1820 – 1910',
    bio: {
      zh: '克里米亚战地护理的改革者，现代护理学与卫生统计的奠基人。',
      en: 'Founder of modern nursing and health statistics, forged in Crimea.',
    },
    eventIds: ['nightingale-crimea', 'crimean-war'],

    sourceIds: ['brit-florence-nightingale'],
    review: 'reviewed',
    places: [
      { name: { zh: '佛罗伦萨', en: 'Florence' }, lat: 43.77, lon: 11.26, year: 1820, role: 'birth' },
      { name: { zh: '伦敦', en: 'London' }, lat: 51.5, lon: -0.12, year: 1837, role: 'active' },
      { name: { zh: '斯库塔里（伊斯坦布尔）', en: 'Scutari, Istanbul' }, lat: 41.03, lon: 28.98, year: 1854, role: 'travel' },
    ],
  },
  {
    id: 'li-hongzhang',
    name: { zh: '李鸿章', en: 'Li Hongzhang' },
    life: '1823 – 1901',
    bio: {
      zh: '洋务运动主将，创办江南制造局与轮船招商局，晚清外交的核心人物。',
      en: 'Led the Self-Strengthening Movement and late-Qing diplomacy.',
    },
    eventIds: ['self-strengthening-movement', 'sino-japanese-war'],

    sourceIds: ['brit-li-hongzhang'],
    review: 'reviewed',  },
  {
    id: 'dunant',
    name: { zh: '亨利·杜南', en: 'Henry Dunant' },
    life: '1828 – 1910',
    bio: {
      zh: '目睹索尔费里诺惨状后创立红十字，首届诺贝尔和平奖得主。',
      en: 'Founded the Red Cross after Solferino; first Nobel Peace laureate.',
    },
    eventIds: ['red-cross-founding'],

    sourceIds: ['wiki-henry-dunant'],
    review: 'reviewed',  },
  {
    id: 'bismarck',
    name: { zh: '俾斯麦', en: 'Otto von Bismarck' },
    life: '1815 – 1898',
    bio: {
      zh: '"铁血宰相"，以三场战争统一德意志，主导柏林会议瓜分非洲。',
      en: 'Iron Chancellor who unified Germany and chaired the Berlin Conference.',
    },
    eventIds: ['franco-prussian-war', 'berlin-conference'],

    sourceIds: ['brit-otto-von-bismarck'],
    review: 'reviewed',
    places: [
      { name: { zh: '舍恩豪森', en: 'Schönhausen' }, lat: 52.47, lon: 11.4, year: 1815, role: 'birth' },
      { name: { zh: '柏林', en: 'Berlin' }, lat: 52.52, lon: 13.4, year: 1849, role: 'active' },
      { name: { zh: '腓特烈斯鲁', en: 'Friedrichsruh' }, lat: 52.5, lon: 13.55, year: 1898, role: 'death' },
    ],
  },
  {
    id: 'wilhelm-i',
    name: { zh: '威廉一世', en: 'Wilhelm I' },
    life: '1797 – 1888',
    bio: {
      zh: '普鲁士国王、德意志皇帝，任命俾斯麦为首相并支持其统一政策。',
      en: 'King of Prussia and German Emperor who appointed Bismarck and backed unification.',
    },
    eventIds: ['franco-prussian-war'],

    sourceIds: ['wiki-wilhelm-i'],
    review: 'reviewed',
    places: [
      { name: { zh: '柏林', en: 'Berlin' }, lat: 52.52, lon: 13.4, year: 1861, role: 'active' },
    ],
  },
  {
    id: 'meiji-emperor',
    name: { zh: '明治天皇', en: 'Emperor Meiji' },
    life: '1852 – 1912',
    bio: {
      zh: '明治维新的象征性领袖，日本在其治下完成近代化转身。',
      en: 'Symbolic leader of Japan\'s transformation in the Meiji era.',
    },
    eventIds: ['meiji-restoration'],

    sourceIds: ['wiki-emperor-meiji'],
    review: 'reviewed',  },
  {
    id: 'mendeleyev',
    name: { zh: '门捷列夫', en: 'Dmitri Mendeleev' },
    life: '1834 – 1907',
    bio: {
      zh: '按原子量排列元素并预言未知元素，化学从此有了"地图"。',
      en: 'Arranged the elements and predicted the undiscovered ones.',
    },
    eventIds: ['periodic-table'],

    sourceIds: ['wiki-dmitri-mendeleev'],
    review: 'reviewed',  },
  {
    id: 'kang-youwei',
    name: { zh: '康有为', en: 'Kang Youwei' },
    life: '1858 – 1927',
    bio: {
      zh: '戊戌变法的推动者，以公车上书开启清末改革议程。',
      en: 'Architect of the Hundred Days\' Reform movement.',
    },
    eventIds: ['gongche-shangshu', 'hundred-days-reform'],

    sourceIds: ['brit-kang-youwei'],
    review: 'reviewed',  },
  {
    id: 'bell',
    name: { zh: '贝尔', en: 'Alexander Graham Bell' },
    life: '1847 – 1922',
    bio: {
      zh: '电话专利的获得者，让声音第一次实时跨越大陆。',
      en: 'Patented the telephone; the voice crossed continents in real time.',
    },
    eventIds: ['telephone'],

    sourceIds: ['brit-alexander-graham-bell'],
    review: 'reviewed',
    places: [
      { name: { zh: '爱丁堡', en: 'Edinburgh', }, lat: 55.95, lon: -3.19, year: 1847, role: 'birth' },
      { name: { zh: '波士顿（语音教学）', en: 'Boston (teaching speech)' }, lat: 42.36, lon: -71.06, year: 1871, role: 'active' },
    ],
  },
  {
    id: 'edison',
    name: { zh: '爱迪生', en: 'Thomas Edison' },
    life: '1847 – 1931',
    bio: {
      zh: '门洛帕克"发明工厂"的主人，白炽灯与供电系统走进千家万户。',
      en: 'His Menlo Park lab delivered the lamp and the systems that powered it.',
    },
    eventIds: ['light-bulb'],

    sourceIds: ['brit-thomas-edison'],
    review: 'reviewed',
    places: [
      { name: { zh: '米兰（俄亥俄州）', en: 'Milan, Ohio' }, lat: 41.1, lon: -82.6, year: 1847, role: 'birth' },
      { name: { zh: '门洛帕克（新泽西）', en: 'Menlo Park, NJ' }, lat: 40.52, lon: -74.31, year: 1876, role: 'active' },
      { name: { zh: '西奥兰治', en: 'West Orange, NJ' }, lat: 40.79, lon: -74.24, year: 1887, role: 'active' },
    ],
  },
  {
    id: 'curie',
    name: { zh: '居里夫人', en: 'Marie Curie' },
    life: '1867 – 1934',
    bio: {
      zh: '两度问鼎诺贝尔奖，放射性研究的开创者。',
      en: 'Two Nobel Prizes; pioneer of radioactivity research.',
    },
    eventIds: ['nobel-marie-curie', 'radium-discovery'],

    sourceIds: ['brit-marie-curie'],
    review: 'reviewed',
    places: [
      { name: { zh: '华沙', en: 'Warsaw' }, lat: 52.23, lon: 21.01, year: 1867, role: 'birth' },
      { name: { zh: '巴黎（索邦）', en: 'Paris (Sorbonne)' }, lat: 48.85, lon: 2.35, year: 1891, role: 'active' },
    ],
  },
  {
    id: 'planck',
    name: { zh: '普朗克', en: 'Max Planck' },
    life: '1858 – 1947',
    bio: {
      zh: '量子假说提出者，敲响经典物理的第一声钟。',
      en: 'His quantum hypothesis cracked open classical physics.',
    },
    eventIds: ['quantum-hypothesis'],

    sourceIds: ['brit-max-planck'],
    review: 'reviewed',  },
  {
    id: 'einstein',
    name: { zh: '爱因斯坦', en: 'Albert Einstein' },
    life: '1879 – 1955',
    bio: {
      zh: '1905"奇迹年"以相对论与光量子重新定义时间、空间与能量。',
      en: 'In his miracle year he redefined space, time and energy.',
    },
    eventIds: ['special-relativity'],

    sourceIds: ['brit-albert-einstein'],
    review: 'reviewed',  },
  {
    id: 'wright-brothers',
    name: { zh: '莱特兄弟', en: 'The Wright Brothers' },
    life: '1867 – 1912 / 1871 – 1948',
    bio: {
      zh: '完成人类首次持续可控的动力飞行，12 秒改变世界。',
      en: 'Their twelve-second flight changed the world.',
    },
    eventIds: ['wright-flight'],

    sourceIds: ['brit-wright-brothers'],
    review: 'reviewed',  },
  {
    id: 'sun-yat-sen',
    name: { zh: '孙中山', en: 'Sun Yat-sen' },
    life: '1866 – 1925',
    bio: {
      zh: '辛亥革命的精神领袖，亚洲第一个共和国的缔造者。',
      en: 'Spiritual leader of the Xinhai Revolution and the first Asian republic.',
    },
    eventIds: ['tongmenghui', 'xinhai-revolution'],

    sourceIds: ['brit-sun-yat-sen'],
    review: 'reviewed',
    places: [
      { name: { zh: '香山翠亨', en: 'Cuiheng, Xiangshan' }, lat: 22.44, lon: 113.53, year: 1866, role: 'birth' },
      { name: { zh: '檀香山', en: 'Honolulu' }, lat: 21.31, lon: -157.86, year: 1879, role: 'travel' },
      { name: { zh: '东京', en: 'Tokyo' }, lat: 35.68, lon: 139.7, year: 1905, role: 'active' },
      { name: { zh: '北京', en: 'Beijing' }, lat: 39.9, lon: 116.4, year: 1925, role: 'death' },
    ],
  },
  {
    id: 'ford',
    name: { zh: '福特', en: 'Henry Ford' },
    life: '1863 – 1947',
    bio: {
      zh: '流水线让汽车驶入寻常百姓家，"美国世纪"的车轮开始转动。',
      en: 'His assembly line put the twentieth century on wheels.',
    },
    eventIds: ['model-t'],

    sourceIds: ['brit-henry-ford'],
    review: 'reviewed',  },
  {
    id: 'amundsen',
    name: { zh: '阿蒙森', en: 'Roald Amundsen' },
    life: '1872 – 1928',
    bio: {
      zh: '首个抵达南极点，也最早打通西北航道，极地探险的传奇。',
      en: 'First to the South Pole and through the Northwest Passage.',
    },
    eventIds: ['amundsen-south-pole'],

    sourceIds: ['brit-roald-amundsen'],
    review: 'reviewed',  },
  {
    id: 'shaka',
    name: { zh: '沙卡', en: 'Shaka Zulu' },
    life: '约 1787 – 1828',
    bio: {
      zh: '祖鲁王国缔造者，军事天才，其征服浪潮重塑了整个南部非洲。',
      en: 'Founder of the Zulu Kingdom; his conquests reshaped Southern Africa.',
    },
    eventIds: ['zulu-kingdom'],

    sourceIds: ['wiki-shaka'],
    review: 'reviewed',  },
  {
    id: 'hong-xiuquan',
    name: { zh: '洪秀全', en: 'Hong Xiuquan' },
    life: '1814 – 1864',
    bio: {
      zh: '拜上帝会创立者、太平天国天王，掀起中国历史上最大规模的农民战争。',
      en: 'Heavenly King of the Taiping; led history\'s largest peasant war.',
    },
    eventIds: ['taiping-rebellion'],

    sourceIds: ['wiki-hong-xiuquan'],
    review: 'reviewed',  },
  {
    id: 'menelik-ii',
    name: { zh: '孟尼利克二世', en: 'Menelik II' },
    life: '1844 – 1913',
    bio: {
      zh: '埃塞俄比亚皇帝，阿杜瓦大捷保住国家独立，并推动国家近代化。',
      en: 'Emperor of Ethiopia; Adwa preserved independence while he modernized.',
    },
    eventIds: ['adwa'],

    sourceIds: ['wiki-menelik-ii'],
    review: 'reviewed',  },
  {
    id: 'pasteur',
    name: { zh: '巴斯德', en: 'Louis Pasteur' },
    life: '1822 – 1895',
    bio: {
      zh: '细菌理论奠基人、疫苗之父，"机遇偏爱有准备的头脑"。',
      en: 'Founder of germ theory and vaccination: "Chance favours the prepared mind."',
    },
    eventIds: ['pasteur-vaccine'],

    sourceIds: ['brit-louis-pasteur'],
    review: 'reviewed',  },
  {
    id: 'mendel',
    name: { zh: '孟德尔', en: 'Gregor Mendel' },
    life: '1822 – 1884',
    bio: {
      zh: '修道院花园里发现遗传定律的"现代遗传学之父"。',
      en: 'The father of genetics, discovered in a monastery garden.',
    },
    eventIds: ['mendel-genetics'],

    sourceIds: ['brit-gregor-mendel'],
    review: 'reviewed',  },
  {
    id: 'alexander-ii',
    name: { zh: '亚历山大二世', en: 'Alexander II' },
    life: '1818 – 1881',
    bio: {
      zh: '解放农奴的"改革者沙皇"，晚年却死于革命者的炸弹。',
      en: 'The Tsar-Liberator who freed the serfs, later assassinated by revolutionaries.',
    },
    eventIds: ['emancipation-serfs'],

    sourceIds: ['wiki-alexander-ii-russia'],
    review: 'reviewed',  },
  {
    id: 'elizabeth-cady-stanton',
    name: { zh: '伊丽莎白·卡迪·斯坦顿', en: 'Elizabeth Cady Stanton' },
    life: '1815 – 1902',
    bio: {
      zh: '塞尼卡福尔斯大会的灵魂人物，《情感宣言》的主要起草者。',
      en: 'Soul of Seneca Falls and principal author of the Declaration of Sentiments.',
    },
    eventIds: ['seneca-falls'],

    sourceIds: ['brit-elizabeth-cady-stanton'],
    review: 'reviewed',  },
  {
    id: 'emmeline-pankhurst',
    name: { zh: '埃米琳·潘克赫斯特', en: 'Emmeline Pankhurst' },
    life: '1858 – 1928',
    bio: {
      zh: '英国激进参政运动领袖，"行动，不要空话"的化身。',
      en: 'Leader of Britain\'s militant suffragettes: "Deeds, not words."',
    },
    eventIds: ['wspu-suffrage'],

    sourceIds: ['brit-emmeline-pankhurst'],
    review: 'reviewed',  },
  {
    id: 'livingstone',
    name: { zh: '利文斯通', en: 'David Livingstone' },
    life: '1813 – 1873',
    bio: {
      zh: '传教士探险家，横穿非洲并反对奴隶贸易，最终长眠非洲大地。',
      en: 'Missionary-explorer who crossed Africa and fought the slave trade.',
    },
    eventIds: ['stanley-livingstone'],

    sourceIds: ['brit-david-livingstone'],
    review: 'reviewed',  },
  {
    id: 'zuo-zongtang',
    name: { zh: '左宗棠', en: 'Zuo Zongtang' },
    life: '1812 – 1885',
    bio: {
      zh: '晚清中兴名臣，抬棺西征收复新疆，兴办福州船政。',
      en: 'Qing statesman-general who recovered Xinjiang and built the Fuzhou shipyard.',
    },
    eventIds: ['zuozongtang-xinjiang'],

    sourceIds: ['wiki-zuo-zongtang'],
    review: 'reviewed',  },
  {
    id: 'zhan-tianyou',
    name: { zh: '詹天佑', en: 'Zhan Tianyou' },
    life: '1861 – 1919',
    bio: {
      zh: '"中国铁路之父"，以人字形线路攻克京张铁路天险。',
      en: '"Father of China\'s railways"; his switchback conquered the Jingzhang line.',
    },
    eventIds: ['jingzhang-railway'],

    sourceIds: ['wiki-zhan-tianyou'],
    review: 'reviewed',  },
  {
    id: 'lumiere-brothers',
    name: { zh: '卢米埃尔兄弟', en: 'The Lumière Brothers' },
    life: '1862 – 1954 / 1864 – 1954',
    bio: {
      zh: '电影放映机的发明者与首次售票放映的主办者，第七艺术的开启者。',
      en: 'Inventors of the Cinématographe and hosts of cinema\'s first paid screening.',
    },
    eventIds: ['cinema-lumiere'],

    sourceIds: ['wiki-lumiere-brothers'],
    review: 'reviewed',  },
  {
    id: 'roentgen',
    name: { zh: '伦琴', en: 'Wilhelm Röntgen' },
    life: '1845 – 1923',
    bio: {
      zh: 'X 射线的发现者，首届诺贝尔物理学奖得主。',
      en: 'Discoverer of X-rays and the first Nobel laureate in Physics.',
    },
    eventIds: ['x-rays'],

    sourceIds: ['wiki-wilhelm-roentgen'],
    review: 'reviewed',  },
  {
    id: 'nobel',
    name: { zh: '诺贝尔', en: 'Alfred Nobel' },
    life: '1833 – 1896',
    bio: {
      zh: '炸药发明人，以遗嘱设立诺贝尔奖，重塑科学与和平的荣誉体系。',
      en: 'Inventor of dynamite whose will founded the Nobel Prizes.',
    },
    eventIds: ['nobel-prizes'],

    sourceIds: ['brit-alfred-nobel'],
    review: 'reviewed',  },
  {
    id: 'cixi',
    name: { zh: '慈禧太后', en: 'Empress Dowager Cixi' },
    life: '1835 – 1908',
    bio: {
      zh: '晚清实际统治者近半个世纪，戊戌变法的终结者与庚子国变的亲历者。',
      en: 'De facto ruler of late Qing China for nearly half a century.',
    },
    eventIds: ['hundred-days-reform', 'eight-nation-alliance'],

    sourceIds: ['wiki-empress-dowager-cixi'],
    review: 'reviewed',  },
  {
    id: 'theodore-roosevelt',
    name: { zh: '西奥多·罗斯福', en: 'Theodore Roosevelt' },
    life: '1858 – 1919',
    bio: {
      zh: '推动巴拿马运河开凿与美国"大棒外交"的总统。',
      en: 'The president behind the Panama Canal and Big Stick diplomacy.',
    },
    eventIds: ['panama-canal'],

    sourceIds: ['brit-theodore-roosevelt'],
    review: 'reviewed',  },
  // ---- V0.26.0 人物扩容（仅补实际缺口 4 位；生卒为百科级常识，review: 'pending' 待来源验证升级）----
  {
    id: 'dalembert',
    name: { zh: '达朗贝尔', en: 'Jean le Rond d\'Alembert' },
    life: '1717 – 1783',
    bio: {
      zh: '法国数学家与启蒙哲人，狄德罗主编《百科全书》的合作者与科学条目主笔。',
      en: 'French mathematician and philosophe, Diderot\'s co-editor and science contributor of the Encyclopédie.',
    },
    eventIds: ['encyclopedie'],

    sourceIds: ['brit-jean-le-rond-dalembert'],
    review: 'reviewed',
  },
  {
    id: 'liang-qichao',
    name: { zh: '梁启超', en: 'Liang Qichao' },
    life: '1873 – 1929',
    bio: {
      zh: '戊戌变法主将与中国近代新闻舆论的开创者，一代知识分子的引路人。',
      en: 'Reform leader and pioneer of modern Chinese journalism, guiding a generation of intellectuals.',
    },
    eventIds: ['hundred-days-reform'],

    sourceIds: ['brit-liang-qichao'],
    review: 'reviewed',
  },
  {
    id: 'ito-hirobumi',
    name: { zh: '伊藤博文', en: 'Itō Hirobumi' },
    life: '1841 – 1909',
    bio: {
      zh: '明治宪法的主要起草人与首位内阁总理大臣，明治体制的总设计师之一。',
      en: 'Principal drafter of the Meiji Constitution and first prime minister of Japan.',
    },
    eventIds: ['meiji-restoration'],

    sourceIds: ['brit-ito-hirobumi'],
    review: 'reviewed',
  },
  {
    id: 'garibaldi',
    name: { zh: '加里波第', en: 'Giuseppe Garibaldi' },
    life: '1807 – 1882',
    bio: {
      zh: '率"千人远征"解放意大利南部的传奇将领，意大利统一运动的军事灵魂。',
      en: 'Legendary general of the Expedition of the Thousand; military soul of Italian unification.',
    },
    eventIds: ['italian-unification'],

    sourceIds: ['brit-giuseppe-garibaldi'],
    review: 'reviewed',
  },
]

// ---- V0.31.0 人物关系（PHASE C2）：只收有明确史实依据的对 ----
export const PERSON_LINKS: PersonLink[] = [
  {
    from: 'marx',
    to: 'engels',
    relation: 'cooperation',
    zh: '四十年革命同道：《宣言》合著、《资本论》共同事业',
    en: 'Four decades of revolutionary partnership — co-authors and comrades',
    year: 1844,
    review: 'pending',
  },
  {
    from: 'diderot',
    to: 'dalembert',
    relation: 'cooperation',
    zh: '《百科全书》联合主编：科学与人文条目的分工',
    en: 'Co-editors of the Encyclopédie, splitting sciences and humanities',
    year: 1750,
    review: 'pending',
  },
  {
    from: 'kang-youwei',
    to: 'liang-qichao',
    relation: 'mentorship',
    zh: '康门弟子：从万木草堂到公车上书与戊戌变法',
    en: 'Master and disciple — from Wanmu Cottage to the 1898 Reform',
    year: 1890,
    review: 'pending',
  },
  {
    from: 'cixi',
    to: 'kang-youwei',
    relation: 'opposition',
    zh: '戊戌政变：镇压百日维新，康梁流亡',
    en: 'The 1898 coup crushed the Reform; Kang fled into exile',
    year: 1898,
    review: 'pending',
  },
  {
    from: 'sun-yat-sen',
    to: 'kang-youwei',
    relation: 'opposition',
    zh: '革命与保皇之争：改造中国路线的根本对立',
    en: 'Revolution vs. constitutional monarchy — rival roads to save China',
    year: 1900,
    review: 'pending',
  },
  {
    from: 'bismarck',
    to: 'wilhelm-i',
    relation: 'cooperation',
    zh: '君相一体：铁血政策背后的国王授权',
    en: 'King and chancellor — royal backing behind Realpolitik',
    year: 1862,
    review: 'pending',
  },
]
