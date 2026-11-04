/**
 * 事件因果链（边表）。from = 前因，to = 后果。
 * 事件卡展示"前因/后果"chips；选中事件时地球上绘制发光弧线。
 */
export interface EventLink {
  from: string
  to: string
  zh: string
  en: string
}

export const LINKS: EventLink[] = [
  {
    from: 'watt-steam-engine',
    to: 'stockton-darlington',
    zh: '蒸汽动力催生铁路时代',
    en: 'Steam power enabled the railway age',
  },
  {
    from: 'industrial-revolution',
    to: 'great-exhibition',
    zh: '工业成果的世纪检阅',
    en: 'Industry showcased at mid-century',
  },
  {
    from: 'industrial-revolution',
    to: 'communist-manifesto',
    zh: '工业社会矛盾催生新思潮',
    en: 'Industrial society bred new ideology',
  },
  {
    from: 'social-contract',
    to: 'french-revolution',
    zh: '主权在民思想奠基大革命',
    en: 'Popular sovereignty inspired revolution',
  },
  {
    from: 'french-revolution',
    to: 'haitian-revolution',
    zh: '革命理念传遍加勒比',
    en: 'Revolutionary ideals reached the Caribbean',
  },
  {
    from: 'french-revolution',
    to: 'napoleonic-wars',
    zh: '共和国走向帝国战争',
    en: 'From republic to imperial war',
  },
  {
    from: 'napoleonic-wars',
    to: 'congress-vienna',
    zh: '战后秩序重建',
    en: 'Postwar order rebuilt',
  },
  {
    from: 'napoleonic-wars',
    to: 'latin-american-independence',
    zh: '西班牙元气大伤，殖民地趁机独立',
    en: 'Weakened Spain lost its colonies',
  },
  {
    from: 'napoleonic-wars',
    to: 'muhammad-ali-reforms',
    zh: '埃及权力真空造就阿里崛起',
    en: 'Power vacuum elevated Muhammad Ali',
  },
  {
    from: 'first-opium-war',
    to: 'self-strengthening-movement',
    zh: '坚船利炮刺激自强运动',
    en: 'Gunboat diplomacy spurred reform',
  },
  {
    from: 'first-opium-war',
    to: 'perry-expedition',
    zh: '炮舰外交震动东亚',
    en: 'Gunboat diplomacy shook East Asia',
  },
  {
    from: 'perry-expedition',
    to: 'meiji-restoration',
    zh: '开国危机催生明治维新',
    en: 'Opening crisis led to Meiji reforms',
  },
  {
    from: 'meiji-restoration',
    to: 'sino-japanese-war',
    zh: '维新成果接受战争检验',
    en: 'Meiji reforms tested by war',
  },
  {
    from: 'self-strengthening-movement',
    to: 'sino-japanese-war',
    zh: '自强三十年，一战见分晓',
    en: 'Thirty years of reform, one verdict',
  },
  {
    from: 'sino-japanese-war',
    to: 'hundred-days-reform',
    zh: '战败刺激变法图强',
    en: 'Defeat ignited reform drive',
  },
  {
    from: 'hundred-days-reform',
    to: 'xinhai-revolution',
    zh: '改良失败让位于革命',
    en: 'Failed reform gave way to revolution',
  },
  {
    from: 'crimean-war',
    to: 'red-cross-founding',
    zh: '战地惨状催生人道救援',
    en: 'Battlefield horrors bred humanitarianism',
  },
  {
    from: 'louisiana-purchase',
    to: 'lewis-clark',
    zh: '购地催生大陆探险',
    en: 'The purchase spurred the expedition',
  },
  {
    from: 'taiping-rebellion',
    to: 'self-strengthening-movement',
    zh: '内忧外患倒逼自强',
    en: 'Crisis at home forced reform',
  },
  {
    from: 'communist-manifesto',
    to: 'paris-commune',
    zh: '思想的第一次政权实验',
    en: 'The ideas\' first test in power',
  },
  {
    from: 'meiji-restoration',
    to: 'treaty-ganghwa',
    zh: '维新日本迫使朝鲜开国',
    en: 'Meiji Japan opened Korea',
  },
  {
    from: 'berlin-conference',
    to: 'adwa',
    zh: '瓜分之下的非洲抵抗',
    en: 'African resistance to the Scramble',
  },
  {
    from: 'indian-rebellion',
    to: 'indian-national-congress',
    zh: '起义后走向体制化民族主义',
    en: 'From revolt to institutional nationalism',
  },
  {
    from: 'crimean-war',
    to: 'emancipation-serfs',
    zh: '战败暴露农奴制痼疾',
    en: 'Defeat exposed serfdom\'s rot',
  },
  {
    from: 'russo-turkish-war-1877',
    to: 'congress-of-berlin',
    zh: '战后巴尔干再安排',
    en: 'The Balkans rearranged after war',
  },
  {
    from: 'industrial-revolution',
    to: 'indian-railways',
    zh: '铁路延伸到殖民地',
    en: 'Railways reached the colonies',
  },
  {
    from: 'tanzimat',
    to: 'young-turks',
    zh: '未竟的改革催生激进一代',
    en: 'Unfinished reform bred radicals',
  },
  {
    from: 'x-rays',
    to: 'radium-discovery',
    zh: '新射线开启放射性研究',
    en: 'New rays opened radioactivity research',
  },
  {
    from: 'maxwell-equations',
    to: 'marconi-radio',
    zh: '电磁理论孕育无线电',
    en: 'Electromagnetic theory bred radio',
  },
  {
    from: 'seneca-falls',
    to: 'wspu-suffrage',
    zh: '女权诉求跨越大西洋',
    en: 'Feminist demands crossed the Atlantic',
  },
  {
    from: 'berlin-conference',
    to: 'congo-free-state',
    zh: '会议之后的刚果悲剧',
    en: 'The Congo tragedy after the Conference',
  },
  {
    from: 'russo-japanese-war',
    to: 'revolution-1905',
    zh: '远东战败引爆国内革命',
    en: 'Defeat in the East ignited revolution',
  },
]
