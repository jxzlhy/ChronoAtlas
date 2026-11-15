# AGENTS · AI 开发规范

本文件供任何 AI 编程工具在本仓库工作时的行为准则。

## 工作循环

发现机会 → 设计 → 实现 → `npx tsc --noEmit` → `npm run validate:data`（数据改动时）→ `node scripts/verify.mjs` → **亲自查看截图** → 修复 → git checkpoint → 更新 CHANGELOG/ROADMAP → 下一轮。

V1.0 阶段遵循 docs/CHRONOATLAS_V1_0_LIVING_HISTORY_MASTER_PLAN.md（永久 GOAL MODE，自主迭代）。

## 硬性规则

1. **先读后写**：结构见 docs/ARCHITECTURE.md；复用既有模式。
2. **实测为准**：UI 改动必须跑 verify.mjs 并查看 PNG；只看代码不算验证。
3. **状态中枢**：跨模块状态经 `src/store.ts`（zustand vanilla）；UI 订阅 store，不互相直接调用。
4. **坐标约定**：经纬度一律走 `src/scene/latLon.ts#latLonToVec3`。
5. **类型严格**：strict，禁 any 逃逸。
6. **文案双语**：所有用户可见内容（数据/UI/错误）中英双语。
7. **CSS 纪律**：
   - 用 `[hidden]` 的元素若 CSS 设了 `display`，必须补 `[hidden] { display: none }`（踩坑：`.webgl-error` 曾遮罩全屏）。
   - z-index：canvas 0 < legend 15 < brand/continent 20 < event-card 25 < search/random/timeline 30 < network-overlay 35 < loading 60 < webgl-error 70。
8. **数据完整性**：任何数据改动后跑 `npm run validate:data`（悬空引用/双语/来源/年代/生卒冲突）。
9. **来源纪律（V0.10 起）**：sourceIds 只挂已人工验证 URL 的条目（sources.ts）；禁止虚构链接；`review: 'reviewed'` 必须以已验证来源/复核为前提，缺省 = 待核实；关系 kind 必填，时间先后 ≠ 因果。
10. **依赖最小化**：three / gsap / zustand / puppeteer-core(dev)。
11. **不覆盖用户数据**；verify-shots/ 可重新生成。

## 踩坑记录

- **draft 工作区可能被宿主整体回收**（V0.9 前夜发生过一次）：代码+git 历史全失。恢复路径 = AI_HANDOFF + 会话上下文重建；预防 = 频繁 checkpoint + 推动 remote 备份。
- 内置浏览器（IAB）通道会堵死 → 用 `scripts/verify.mjs`（puppeteer-core + 系统 Chrome + SwiftShader）。
- 无头 Chrome 冷启动 WebGL 偶发失败 → verify 已带 `--enable-unsafe-swiftshader`。
- Vite `504 Outdated Optimize Dep` → `rm -rf node_modules/.vite` 重启。
- 贴图加载不得阻塞 window load（会卡死导航）→ Globe.ts 在 load 后加载并 12s 超时降级。
- 无头截图注意：加载层要等 `body.ready`，贴图冷缓存可达 10s+。
- **store 订阅回调内禁止重建式渲染**（V3.12 踩坑）：buildDensity 曾在订阅内整函数重跑——播放每帧叠加 4 个匿名 listener + 1 个 tooltip DOM（实测播放 3 秒积累 29 个）。拆「构建一次（守卫标记）+ 高亮 repaint（值不变零开销）」；守卫标记 `built = true` 千万别漏写，否则守卫永不拦截。
- **button 元素必须重置 UA 白底**（V3.10 踩坑）：自定义 button 类若不写 `background: transparent`，深色面板上会出现发白横条（civ-era-label）。
- **listener 重构易误删功能分支**（V3.5/V3.12 踩坑）：合并/重构 addEventListener 后要对照"功能回环"断言逐条核对；断言若依赖"year 恰好停在期望值"会假通过——断言内部应显式驱动状态再断言结果。
- **断言顺序耦合**：新断言改变 store 状态会污染后续断言前提——断言完恢复现场（setYear 回基准值）。
- **verify 挂 SyntaxError 先怀疑 TS 语法**：verify.mjs 是 .mjs（纯 JS），evaluate 回调里不能写 TS 类型标注；变量重命名防跨段重名（eraEntry/evEraEntry）。
- **dev server 旧 bundle 干扰**：源码改动后 verify 现象与代码不符时，`lsof -ti :5173 | xargs kill` + `rm -rf node_modules/.vite` 重启再验（watcher 可能失灵）。
