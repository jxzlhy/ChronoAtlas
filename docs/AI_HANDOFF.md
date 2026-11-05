# AI HANDOFF · 交接指南

> 任何 AI 编程工具（Zcode/Cursor/Trae/…）的接手入口。最后核对：2026-11-06。

## 项目是什么

ChronoAtlas · THE LIVING HISTORY：单页 3D 历史地球（1750–1911），用户通过时间/空间/人物/事件/关系/路线探索世界历史。Vite+TS+Three.js+GSAP+zustand，无后端，数据内置打包。

## 当前状态（以实际代码为准，勿信旧文档）

- **版本 V0.27.0+**（package.json 为准）；事件 137 / 关系 52 / 人物 50 / 来源 41。
- 已完成：M1 数据基建（model.ts 统一模型/来源体系/kind 六类）→ M2 世界快照（时代分期/类型与洲筛选/排序/同时代对比）→ M3 动态地球（弧线 kind 六色/热区/InstancedMesh drawCalls 195→28）→ M4 因果网络（二维视图/连线详情/历史路径叙事）→ M5 人物系统（档案卡/时间线/同事件人物三对激活）→ M6 UX（快捷键 N-H-R-P/罗盘/音效/渲染暂停/构建审计 vendor 拆分）→ 内容扩容 III（+18 事件来源全部人工验证）。
- 验证基建：verify.mjs 20+ 步交互断言（快照 8/弧线 2/热区/音效/快捷键五键/Esc 三路径/无效 hash/移动端罗盘/性能门槛 drawCalls≤150）+ validate:data 数据校验。
- 进行中：V0.28→V1.0 总任务书（docs/development/CHRONOATLAS_V028_TO_V10_AUTONOMOUS_MASTER_PLAN.md），进度见 docs/development/PROGRESS_LOG.md；当前阶段 PHASE A 数据完整性 → PHASE B 历史路线系统。

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
