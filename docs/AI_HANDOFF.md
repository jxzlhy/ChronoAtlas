# AI HANDOFF · 交接指南

> 任何 AI 编程工具（Zcode/Cursor/Trae/…）的接手入口。最后核对：2026-11-15。

## 项目是什么

ChronoAtlas · THE LIVING HISTORY：单页 3D 历史地球（1750–1911），用户通过时间/空间/人物/事件/关系/路线探索世界历史。Vite+TS+Three.js+GSAP+zustand，无后端，数据内置打包。

## 当前状态（以实际代码为准，勿信旧文档）

- **版本 V3.13.0**；事件 137 / 关系 52 / 人物 52 / 来源 200 / 历史航线 5；reviewed 全覆盖、来源三维度 100%、imp3 双保险 23 条。
- 里程碑：M1–M6 + 内容扩容 III（见 PROGRESS_LOG V0.28 行）→ **V1.0.0 发布**（PHASE A–I：来源 100%/航线/人物/文明/UX/对比/QA/PWA）→ **V2 三支柱**（时代视角时间跨度叙事/人物卡时代分组/文明对比时代分组 + 热区时代权重 + 来源可信度徽章）→ **V3.x 自主迭代系列**（时代交互体系完整化：密度条双语 tooltip/热区悬停预览+播放头联动/文明视图时代分布条/数字键 1-6 跳时代/blurb+事件卡时代入口/时代 chips 与文明 chips 活跃人物数；关键修复：快照面板视口 P1 回归、密度条订阅内重建泄漏、eraSpanYear 高亮错位、V3.5 重构误删 blurb 监听找回）。
- 验证基建：verify.mjs **52 断言**（快照/弧线/热区+悬停预览/时代 chips+分布条/快捷键 N-H-R-P-J-1-6-←→/Esc/URL 回环 y-w-ev-p-rt/移动端/密度条无泄漏/性能 drawCalls≤150）+ validate:data。
- 性能基线：drawCalls 28 / init ~200ms（verify 每轮采样）。
- 待办：**人物库缺口**（印度文明活跃人物 0 位——等网络恢复走 Britannica 逐条验证流程）；E3 夜间灯光无头黑屏留待真机复核；沙箱隧道间歇断流时用 /tmp 守候补推模式。
- 断网纪律：网络不可用时不新增历史数据，只做纯代码增量（V3.7–V3.13 即全程断网完成）。

## 上手步骤

1. `npm install`
2. `npm run dev` → http://127.0.0.1:5173
3. `npm run validate:data` → 数据校验 + 质量画像
4. `node scripts/verify.mjs` → 查看 `verify-shots/*.png`
5. 读 ARCHITECTURE + AGENTS + ROADMAP + V0.28→V1.0 总任务书，按 PROGRESS_LOG 接续

## 验证门槛（每轮必须）

```bash
npx tsc --noEmit            # 0 错误
npm run validate:data       # 数据校验 0 错误（数据改动必跑）
node scripts/verify.mjs     # 全步通过 + 0 控制台错误（环境网络抖动单列警告）
```

UI 改动必须 Read 截图；性能门槛 drawCalls ≤150（InstancedMesh 合批回归保险）。

## 数据纪律（不可妥协）

- 模型统一在 `src/data/model.ts`；事件必有 `continent`；来源只挂**已人工验证 URL** 的条目（sources.ts，含验证日期），禁止虚构链接。
- `review: 'reviewed'` 仅限挂接已验证来源/经复核；缺省 = pending 待核实，**不伪装完成**。
- 关系 `kind` 必填（六类），时间先后 ≠ 因果；人物挂接 ≠ 亲自参与。
- 扩容新事件：先经 docs/SOURCE_VALIDATION_QUEUE.md 式的候选清单 + 逐条 WebFetch 验证。

## 环境坑

- 沙箱隧道间歇断流（fake-ip TUN）：git push/WebFetch 间歇失败 → 本地 checkpoint + 守候循环补推（history：08:46 窗口自动补推 20 checkpoint 成功）；恢复后先 `git pull` 再开工。
- 无头验证走系统 Chrome + SwiftShader；加载层要等 `body.ready`（贴图冷缓存 10s+）。
- Vite 504 → 清 node_modules/.vite；IAB 通道会堵死别依赖。

## 完成定义（DoD）

代码 + tsc + validate:data + verify + 截图复核 + 文档同步（CHANGELOG/PROGRESS_LOG）+ git checkpoint + push。
