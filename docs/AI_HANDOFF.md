# AI HANDOFF · 交接指南

## 30 秒了解

ChronoAtlas：单页 3D 历史地球（1750–1911，119 条双语事件 + 32 条因果链 + 46 位人物），Vite+TS+Three.js+GSAP+zustand，无后端。20+ 步无头验证 + 0 控制台错误（沙箱 CDN 抖动归为环境警告）+ 性能门槛（drawCalls ≤150）。当前 **V0.17.0**：V1.0「THE LIVING HISTORY」GOAL MODE（总任务书 docs/CHRONOATLAS_V1_0_LIVING_HISTORY_MASTER_PLAN.md）；M1 数据基建 ✅，M2 世界快照 ✅，M3 动态地球（弧线/热区/InstancedMesh 195→20）✅，M4 因果网络 I 二维视图 ✅，下一站 M4 II 关系详情/叙事路径 或 M5 人物系统（见 ROADMAP）。

## ⚠️ 工作区警示（远端备份已配置：github.com/jxzlhy/ChronoAtlas）

draft 工作区曾被宿主整体回收（V0.9 时发生）。若再次发现目录消失：全部源码可从 AI_HANDOFF + 会话上下文重建（已演练一次成功）。预防：推动 remote 备份。

## 上手步骤

1. `npm install`
2. `npm run dev` → http://127.0.0.1:5173
3. `node scripts/verify.mjs` → 查看 `verify-shots/*.png`
4. 读 ARCHITECTURE + AGENTS + ROADMAP + V1.0 总任务书，选任务开工

## 验证门槛（每轮必须）

```bash
npx tsc --noEmit            # 0 错误
npm run validate:data       # 数据校验 0 错误（数据改动必跑）
node scripts/verify.mjs     # 17 步 + 0 控制台错误
```

UI 改动必须 Read 截图。

## 数据纪律（V0.10 起）

- 数据模型统一在 `src/data/model.ts`；事件必有 `continent`；来源只挂已人工验证 URL 的条目（sources.ts），禁止虚构链接。
- `review: 'reviewed'` 仅限挂接已验证来源/经复核的条目；缺省 = 待核实，不伪装完成。
- 关系 `kind` 必填，严格区分时间先后与因果（六类见 model.ts）。

## 环境坑

- 沙箱 curl 无外网但 npm 可用；无头验证走系统 Chrome + SwiftShader。
- Vite 504 Outdated Optimize Dep → 清 node_modules/.vite。
- 加载层截图要等 `body.ready`（贴图冷缓存 10s+）。
- 内置浏览器（IAB）通道会堵死，别依赖。

## 完成定义（DoD）

代码 + tsc + verify + 截图复核 + CHANGELOG/ROADMAP 同步 + git checkpoint。
