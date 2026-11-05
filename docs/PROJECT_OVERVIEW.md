# PROJECT OVERVIEW · ChronoAtlas

> 项目总览（V1.0.0 · 2026-11-06）。任何工具接手前先读本文与 docs/AI_HANDOFF.md。

## THE LIVING HISTORY

ChronoAtlas 是一个**单页 3D 历史地球**：在可交互的 NASA 贴图地球上，以时间（1750–1911）、空间、人物、事件、因果关系与历史航线六个维度探索近代世界史。全部数据内置打包、双语（中英）、无后端、可静态部署。

## 技术栈

- **构建**：Vite 5 + TypeScript（strict）
- **3D**：Three.js r169（InstancedMesh 合批棱柱 / Tube 大圆路线 / Bloom 后期 / 菲涅尔大气）
- **动画**：GSAP（相机飞行 + motion.ts 面板动效）；**状态**：zustand vanilla（store.ts 单一状态中枢）
- **测试**：Puppeteer-core 无头端到端（verify.mjs，~35 断言）+ validate:data 数据校验（质量报告）

## 数据规模（全部经人工来源验证）

| 维度 | 规模 | 说明 |
|---|---|---|
| 历史事件 | 137 | 双语、大洲标注、importance 1–3、来源引用 40 条 reviewed |
| 事件关系 | 52 | kind 六类（直接因果/间接影响/背景/关联/回应/延续），时间先后≠因果 |
| 历史人物 | 52 | 双语档案、时间线、11 位有活动地图（31 地点）、人物关系 6 条（五类） |
| 参考资料 | 46 | Britannica 为主 + Wikipedia 补充，URL 逐一人工验证并记日期 |
| 历史航线 | 5 | 丝绸之路/郑和/哥伦布/麦哲伦/库克，逐段大圆绘制 + 叙事播放 |

## 核心模块（src/）

- `scene/`：Globe（贴图三源降级+大气+Bloom）、EventPillars（InstancedMesh×2）、LinkArcs（因果弧线）、HotZones（热区）、RouteArcs（航线）、PersonMarkers（活动地图）、CameraRig
- `ui/`：timeline（密度条+年代提示+速度）、search（双语+人物）、eventCard（chips/Journey/罗盘/来源）、personCard（Atlas/Relations）、snapshot（世界快照）、network（二维因果网络）、routesPanel（航线叙事）、legend、motion（GSAP 助手）、sound（Web Audio 合成音效）
- `data/`：model.ts（统一模型）+ events/links/people/sources/routes/eras
- `scripts/`：verify.mjs（无头回归 ~38 断言）、validate-data.mjs、diag-webgl.mjs

## 交互速览

拖动旋转/滚轮缩放 · 点击棱柱读事件卡 · `/` 搜索 · `←→` 年份 · `P` 世界快照 · `J` 历史航线 · `N` 因果网络 · `H` 热区 · `R` 随机发现 · `Esc` 关闭 · URL `#y=&ev=&p=` 分享还原。

## 质量门槛（DoD）

`npx tsc --noEmit` 0 错误 + `npm run validate:data` 0 错误 + `node scripts/verify.mjs` 全断言 + 0 控制台错误 + drawCalls ≤150 + 截图人工复核 + 文档同步 + git checkpoint/push。

## 约束与已知限制

- SwiftShader 无头环境不支持 Phong+emissive/bump 视觉验证（E3 夜间灯光留待真机）
- 主贴图/增强贴图走 CDN，断网降级线框球（功能不受影响）
- 人物来源覆盖 0%（51 位 pending 待升级）、关系来源 0%（逐条补录中）——已由质量报告量化
