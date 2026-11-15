# PROGRESS LOG · ChronoAtlas V0.28 → V1.0

> 每轮开发记录：日期 / 版本 / 内容 / 关键文件 / 测试 / 性能 / commit / 后续。
> 历史版本（V0.1–V0.27）见 CHANGELOG.md；本日志自 V0.28.0 起维护。

| 日期 | 版本 | 内容 | 关键文件 | 测试 | 性能 | commit | 后续 |
|---|---|---|---|---|---|---|---|
| 2026-11-06 | V0.28.0 | 任务书存档 + AI_HANDOFF 漂移修复 + validate:data 升级（关系/人物来源引用 + 质量报告） | docs/development/*, scripts/validate-data.mjs, docs/AI_HANDOFF.md | validate:data 0 错误 + tsc + verify | validate 0 错误 / tsc 0 / verify 全过 | — | PHASE B 历史路线 |
| 2026-11-10 | V1.0.0 | **V1.0 发布**：PHASE A–I 全部落地（来源体系 100% 双保险/历史航线 5 条/人物系统 52 位/文明时代/沉浸 UX/对比模式/QA 断言/离线 PWA） | routes.ts, people.ts, sw.js, manifest | verify 40+ 断言 | drawCalls 29 | — | V2 规划 |
| 2026-11-13 | V2.0–V2.5 | **V2 三支柱收官**：时代视角（时间跨度叙事）/人物卡时代分组/文明对比时代分组 + 热区时代权重 + 来源可信度徽章 | snapshot.ts, personCard.ts, store.ts | verify 43 断言 | 不变 | — | V1.1 增量 |
| 2026-11-14 | V3.1–V3.6 | 密度条 hover tooltip 双语/触摸 + 热区下钻加权 + 文明 chips 计数/跳转 + 时代标签点击 + 播放头联动增亮 | timeline.ts, HotZones.ts, snapshot.ts | verify 44 断言 | 28 | 6c3a532 | 自主发现 |
| 2026-11-15 | V3.7–V3.13 | **快照面板视口 P1 回归修复**（V2.1 relative 覆盖 absolute 致面板飞出屏幕 5 轮）+ 时代 chips/文明 chips 活跃人物数 + 热区悬停预览 + 文明视图时代分布条 + 数字键 1-6 跳时代 + 密度条泄漏/高亮错位/blurb 丢失三修 + 事件卡时代入口 | styles.css, HotZones.ts, hotzoneTip.ts, timeline.ts, snapshot.ts, eventCard.ts | verify 52 断言 | 28 | b27245b..0419a93 | 人物库缺口待网 |
