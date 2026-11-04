# ARCHITECTURE · 模块结构与数据流

```
index.html                  # 全部 UI 骨架，id 契约见下
src/
├── main.ts                 # 装配根：场景 + UI + 拾取 + 主循环 + hash 同步 + 调试钩子(__chrono)
├── store.ts                # zustand vanilla：year/playing/windowSize/selectedId/hoverId（数据类型重导出自 data/model）
├── styles.css              # 深空玻璃拟态视觉体系
├── data/
│   ├── model.ts            # 统一数据模型：HistoryEvent/EventLink(kind)/Person/Source + 精度与审核状态
│   ├── events.ts           # EVENTS(119条，含大洲/精度/来源) / EVENT_TYPES(七类+色) / CONTINENTS(定位参数)
│   ├── links.ts            # LINKS(32条因果边: from/to/kind六类/双语说明/审核状态)
│   ├── people.ts           # PEOPLE(46位双语人物: 生卒年/简介/挂接事件)
│   ├── sources.ts          # SOURCES(22条已验证参考资料: 双语名称/机构/URL/类型)
│   └── eras.ts             # ERA_BANDS(1750–1911 六时代波段: 双语名+背景句) + eraOf(year)
├── scene/
│   ├── Globe.ts            # renderer/camera/controls/贴图三源降级/大气 shader/星空/Bloom
│   ├── EventPillars.ts     # 119×(地块+棱柱)，欠阻尼弹簧缓动，raycaster 拾取，筛选联动明暗
│   ├── CameraRig.ts        # GSAP 球面 slerp 飞行（北极恒朝上）
│   ├── LinkArcs.ts         # 因果弧线：BFS(arcsDepth 1/3 跳)，按 kind 六色着色，深度衰减
│   ├── HotZones.ts         # 历史热区：15° 网格聚类光晕簇(28 池复用)，点击下钻，开关 store.hotspotsOn
│   └── latLon.ts           # 经纬度 → Vector3（equirectangular 对齐）
└── ui/
    ├── timeline.ts         # 拖动/自动播放/窗口/键盘/密度条(点击跳年)/年代提示
    ├── search.ts           # 中英模糊搜索（事件+人物）
    ├── eventCard.ts        # 双语事件卡：人物详情/前因后果 chips(含关系类型 tooltip)/参考资料外链
    ├── snapshot.ts         # "世界快照"面板：时代分期/类型筛选 chips/大洲概览 chips(飞行+过滤)/事件列表
    ├── continents.ts       # 大洲 ghost 按钮
    └── legend.ts           # 分类图例 + 热区模式开关
scripts/
├── verify.mjs              # 无头端到端验证（17 步剧本 + 服务器自愈）
├── validate-data.mjs       # 数据校验（npm run validate:data）：引用/类型/双语/来源/年代画像
└── diag-webgl.mjs          # WebGL/控制台诊断
```

## 数据流（单向）

```
用户输入 → appStore(year/windowSize/selectedId/hoverId/playing)
  ├─► ui/* 读 store 改 DOM
  ├─► EventPillars.recalcTargets（每帧弹簧缓动）
  └─► LinkArcs.showFor（BFS 重建弧线）
```

## 关键约定

- **DOM id 契约**：`#scene-container #loading #webgl-error #search-input #search-clear #search-results #random-btn #continent-nav #event-card #legend #year-range #play-btn #year-readout #era-readout #timeline-density #window-select #slice-toggle #active-count #slice-panel #slice-year #snapshot-era #snapshot-blurb #snapshot-types #snapshot-continents #slice-list`。
- **URL hash 契约**：`#y=<年>&ev=<id>`；启动恢复（main.ts）+ replaceState 写回。
- **调试钩子**：`__chrono = { pause, resume, capture, goTo, arcsCount, hotspotsCount, store, events, links }`。
- **拾取**：pointer 位移 ≤8px 判点击；空白点击取消选中。
- **数据完整性**：任何数据改动后跑 `npm run validate:data`（重复 ID/悬空引用/双语/来源/年代/生卒冲突 + 数据画像）。
- **来源纪律**：sourceIds 只指向 sources.ts 中已人工验证 URL 的条目；`review: 'reviewed'` 必须以已验证来源或复核为前提，缺省 = 待核实。
- **关系纪律**：LINKS 的 kind 必填（六类），时间先后 ≠ 因果；direct-cause 的前项起始年晚于后项会被校验器警告。

## 渲染管线

WebGLRenderer(ACES) → RenderPass → UnrealBloom(0.45/0.5/0.62) → OutputPass；pixelRatio ≤2；resize 同步 composer。
