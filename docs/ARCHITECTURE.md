# ARCHITECTURE · 模块结构与数据流

```
index.html                  # 全部 UI 骨架，id 契约见下
src/
├── main.ts                 # 装配根：场景 + UI + 拾取 + 主循环 + hash 同步 + 调试钩子(__chrono)
├── store.ts                # zustand vanilla：year/playing/windowSize/selectedId/hoverId
├── styles.css              # 深空玻璃拟态视觉体系
├── data/
│   ├── events.ts           # EVENTS(119条) / EVENT_TYPES(七类+色) / CONTINENTS(定位参数)
│   ├── links.ts            # LINKS(32条因果边: from/to/双语关系说明)
│   └── people.ts           # PEOPLE(46位双语人物: 生卒年/简介/挂接事件)
├── scene/
│   ├── Globe.ts            # renderer/camera/controls/贴图三源降级/大气 shader/星空/Bloom
│   ├── EventPillars.ts     # 119×(地块+棱柱)，欠阻尼弹簧缓动，raycaster 拾取
│   ├── CameraRig.ts        # GSAP 球面 slerp 飞行（北极恒朝上）
│   ├── LinkArcs.ts         # 因果弧线：BFS ≤3 跳，前因紫/后果青，深度衰减
│   └── latLon.ts           # 经纬度 → Vector3（equirectangular 对齐）
└── ui/
    ├── timeline.ts         # 拖动/自动播放/窗口/键盘
    ├── search.ts           # 中英模糊搜索（事件+人物）
    ├── eventCard.ts        # 双语事件卡：人物详情/前因后果 chips
    ├── slice.ts            # "此刻世界"切片面板 + 活跃计数
    ├── continents.ts       # 大洲 ghost 按钮
    └── legend.ts           # 分类图例
scripts/
├── verify.mjs              # 无头端到端验证（17 步剧本 + 服务器自愈）
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

- **DOM id 契约**：`#scene-container #loading #webgl-error #search-input #search-clear #search-results #random-btn #continent-nav #event-card #legend #year-range #play-btn #year-readout #window-select #slice-toggle #active-count #slice-panel #slice-year #slice-list`。
- **URL hash 契约**：`#y=<年>&ev=<id>`；启动恢复（main.ts）+ replaceState 写回。
- **调试钩子**：`__chrono = { pause, resume, capture, goTo, arcsCount, store, events }`。
- **拾取**：pointer 位移 ≤8px 判点击；空白点击取消选中。
- **数据完整性**：改 links/people 后运行悬空引用校验（node + import 三数据文件比对 id 集）。

## 渲染管线

WebGLRenderer(ACES) → RenderPass → UnrealBloom(0.45/0.5/0.62) → OutputPass；pixelRatio ≤2；resize 同步 composer。
