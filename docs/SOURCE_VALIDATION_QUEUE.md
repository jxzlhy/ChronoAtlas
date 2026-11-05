# 内容扩容 III · 来源验证队列（外网恢复后逐一验证）

> ⚠️ **纪律**：本清单中所有 URL 均为**候选待验证**状态，尚未人工确认可达；
> 外网恢复后必须逐条 WebFetch 验证（404/重定向需修正 slug），**验证通过才可入库**
> sources.ts 与事件/人物挂接；验证失败的条目删除或换源，绝不虚构。
> 常规验证方法：WebFetch 问 "Does this page exist (not 404)? What is the exact article title?"（一行答复）。
> 已验证模式参考：Britannica slug 大小写敏感（`/event/Xxx-Yyy` / `/topic/Xxx` / `/biography/Xxx-Yyy` / `/science/Xxx`）。

## 目标

事件 119 → **140+**；同时为人物挂接建立重叠（激活"同事件人物"派生功能）。

## A. 新增事件候选（21 条）

### 女性叙事（5）

| 提议 id | 事件 | 年 | 地点 | 类型 | 重要度 | 候选来源（待验证） |
|---|---|---|---|---|---|---|
| nightingale-crimea | 南丁格尔与克里米亚战地护理 | 1854–1856 | 伊斯坦布尔（斯库塔里） | society | 2 | britannica.com/biography/Florence-Nightingale |
| nobel-marie-curie | 居里夫人获诺贝尔物理学奖 | 1903 | 巴黎/斯德哥尔摩 | science | 2 | britannica.com/biography/Marie-Curie |
| qiu-jin | 秋瑾就义与女权革命 | 1907 | 中国 · 绍兴 | society | 1 | en.wikipedia.org/wiki/Qiu_Jin |
| stanton-declaration | 《情感宣言》发表 | 1848 | 美国 · 塞尼卡福尔斯 | society | 1 | britannica.com/event/Declaration-of-Sentiments |
| carey-francis-williams | （备选）加勒比女总督时代起点 |  |  |  |  | （待定，可放弃） |

### 奥斯曼余波（4）

| 提议 id | 事件 | 年 | 地点 | 类型 | 重要度 | 候选来源（待验证） |
|---|---|---|---|---|---|---|
| ottoman-default | 奥斯曼债务危机与莫祖普拉委员会 | 1875–1881 | 伊斯坦布尔 | economy | 1 | britannica.com/place/Ottoman-Empire（条目内章节）或 wiki/Ottoman_Public_Debt |
| hejaz-railway | 汉志铁路开工 | 1900 | 大马士革→麦地那 | economy | 1 | en.wikipedia.org/wiki/Hejaz_Railway |
| young-turk-revolution | 青年土耳其党革命（恢复宪政） | 1908 | 奥斯曼 · 萨洛尼卡 | politics | 2 | britannica.com/event/Young-Turk-Revolution |
| bulgaria-independence | 保加利亚宣告独立 | 1908 | 索菲亚 | politics | 1 | britannica.com/place/Bulgaria |

### 拉美与南洋细节（4）

| 提议 id | 事件 | 年 | 地点 | 类型 | 重要度 | 候选来源（待验证） |
|---|---|---|---|---|---|---|
| amazon-rubber | 亚马孙橡胶热潮 | 1880–1912 | 巴西 · 马瑙斯 | economy | 1 | en.wikipedia.org/wiki/Amazon_rubber_boom |
| panama-independence | 巴拿马脱离哥伦比亚独立 | 1903 | 巴拿马城 | politics | 1 | britannica.com/event/Panama-declaration-of-independence |
| federation-malaya | 马来联邦成立 | 1895 | 吉隆坡 | politics | 1 | en.wikipedia.org/wiki/Federated_Malay_States |
| cuba-independence-war | 古巴独立战争再起 | 1895 | 古巴 · 哈瓦那 | war | 1 | britannica.com/event/Spanish-American-War（前置章节）或 wiki/Cuban_War_of_Independence |

### 东亚与印度补强（5）

| 提议 id | 事件 | 年 | 地点 | 类型 | 重要度 | 候选来源（待验证） |
|---|---|---|---|---|---|---|
| gongche-shangshu | 公车上书 | 1895 | 中国 · 北京 | politics | 1 | en.wikipedia.org/wiki/Gongche_Shangshu_Movement |
| meiji-constitution | 《大日本帝国宪法》颁布 | 1889 | 日本 · 东京 | politics | 2 | britannica.com/topic/Meiji-Constitution |
| portsmouth-treaty | 《朴茨茅斯条约》 | 1905 | 美国 · 朴茨茅斯 | politics | 1 | britannica.com/event/Treaty-of-Portsmouth |
| bengal-partition | 孟加拉分省 | 1905 | 印度 · 加尔各答 | politics | 1 | britannica.com/event/Partition-of-Bengal（校对 slug 大小写） |
| tongmenghui | 中国同盟会成立 | 1905 | 日本 · 东京 | politics | 2 | en.wikipedia.org/wiki/Tongmenghui |

### 关系链补强（3，均挂接已复核事件）

| 提议 id | 事件 | 年 | 地点 | 类型 | 重要度 | 候选来源（待验证） |
|---|---|---|---|---|---|---|
| second-industrial-revolution | 第二次工业革命（电气/化工） | 1870–1914 | 德国 · 柏林/美国 | economy | 3 | britannica.com/event/Second-Industrial-Revolution（校对 slug） |
| redemption-us | 美国重建时期结束（妥协案） | 1877 | 美国 · 华盛顿 | politics | 1 | britannica.com/event/Compromise-of-1877（优先）或 Reconstruction 美国史条目 |
| （备选池） | 第二次工业革命若 slug 缺失，改挂 second-industrial-revolution 到 wiki 条目 |  |  |  |  | en.wikipedia.org/wiki/Second_Industrial_Revolution |

### 新增关系候选（验证后随事件入库）

- watt-steam-engine → second-industrial-revolution（indirect-influence，蒸汽技术积累）
- second-industrial-revolution → automobile / light-bulb / telephone（direct-cause 或 background，逐条裁定）
- meiji-constitution → sino-japanese-war（background，宪政国力）
- gongche-shangshu → hundred-days-reform（direct-cause，改良舆论先声）
- tongmenghui → xinhai-revolution（direct-cause，组织基础）
- young-turk-revolution ← tanzimat（continuation）
- ottoman-default → young-turk-revolution（background，财政失能）

## B. 新增人物候选（挂接既有事件，制造"同事件人物"重叠；生卒年须验证后录入）

| 人物 | 生卒（待核） | 挂接事件 | 候选来源（待验证） |
|---|---|---|---|
| 马克思 Karl Marx | 1818–1883 | communist-manifesto（+paris-commune） | britannica.com/biography/Karl-Marx |
| 达尔文 Charles Darwin | 1809–1882 | origin-of-species | britannica.com/biography/Charles-Darwin |
| 爱迪生 Thomas Edison | 1847–1931 | light-bulb（+cinema-lumiere? 否， phonograph） | britannica.com/biography/Thomas-Edison |
| 贝尔 Alexander Graham Bell | 1847–1922 | telephone | britannica.com/biography/Alexander-Graham-Bell |
| 亨利·福特 Henry Ford | 1863–1947 | model-t | britannica.com/biography/Henry-Ford |
| 南丁格尔 Florence Nightingale | 1820–1910 | crimean-war（+red-cross-founding） | britannica.com/biography/Florence-Nightingale |
| 居里夫人 Marie Curie | 1867–1934 | radium-discovery（+x-rays 关联） | britannica.com/biography/Marie-Curie |
| 孙中山 Sun Yat-sen | 1866–1925 | xinhai-revolution（+tongmenghui 新增） | britannica.com/biography/Sun-Yat-sen |
| 康有为 Kang Youwei | 1858–1927 | gongche-shangshu（新增）+hundred-days-reform | britannica.com/biography/Kang-Youwei |
| 梁启超 Liang Qichao | 1873–1929 | gongche-shangshu + hundred-days-reform | britannica.com/biography/Liang-Qichao |
| 伊藤博文 Itō Hirobumi | 1841–1909 | meiji-restoration（+meiji-constitution 新增） | britannica.com/biography/Ito-Hirobumi |
| 俾斯麦 Otto von Bismarck | 1815–1898 | franco-prussian-war + congress-of-berlin | britannica.com/biography/Otto-von-Bismarck |
| 加里波第 Giuseppe Garibaldi | 1807–1882 | italian-unification | britannica.com/biography/Giuseppe-Garibaldi |
| 阿亚图拉?（不引入，避免宗教敏感性超出数据范围） |  |  |  |
| 达朗贝尔 Jean d'Alembert | 1717–1783 | encyclopedie（狄德罗同事件） | britannica.com/biography/Jean-le-Rond-dAlembert |

> 人物新增后"同事件人物"功能自动激活（如 马克思↔恩格斯若补恩格斯；狄德罗↔达朗贝尔；
> 康有为↔梁启超；俾斯麦↔亚历山大二世（emancipation? 否——俾斯麦不挂））。

## C. 执行顺序（外网恢复后）

1. 逐条验证 A/B 候选 URL（WebFetch 一行确认法），修正 404 slug。
2. 先加 **B 人物**（挂接既有事件，零新事件风险，立刻激活同事件人物）→ `npm run validate:data`。
3. 再加 **A 事件**（新增事件 + 对应 sources + 关系链逐条裁定 kind）→ `npm run validate:data`。
4. `npx tsc --noEmit` + `node scripts/verify.mjs` + 截图复核（新事件密度条变化/同事件人物 chips 出现）。
5. checkpoint + push（隧道恢复后统一推）。
6. ROADMAP"内容扩容 III"勾选；CHANGELOG V0.22+ 记录。

## D. 密度热区标注（随扩容检查）

扩容后重看 1870–1910 段密度条；欧洲段过密时考虑：重要性 1 事件的窗口贡献（isActive ±windowSize）是否需要按重要度衰减（例如 importance=1 ±5 年）——**先测量再定**，不做无依据改默认。
