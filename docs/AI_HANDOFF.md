# AI HANDOFF · 交接指南

## 30 秒了解

ChronoAtlas：单页 3D 历史地球（1750–1911，119 条双语事件 + 32 条因果链 + 46 位人物），Vite+TS+Three.js+GSAP+zustand，无后端。17 步无头验证 + 0 控制台错误。当前 V0.9.0；下一步见 ROADMAP（内容扩容 III / InstancedMesh / 面板过滤）。

## ⚠️ 工作区警示（远端备份已配置：github.com/jxzlhy/ChronoAtlas）

draft 工作区曾被宿主整体回收（V0.9 时发生）。若再次发现目录消失：全部源码可从 AI_HANDOFF + 会话上下文重建（已演练一次成功）。预防：推动 remote 备份。

## 上手步骤

1. `npm install`
2. `npm run dev` → http://127.0.0.1:5173
3. `node scripts/verify.mjs` → 查看 `verify-shots/*.png`
4. 读 ARCHITECTURE + AGENTS + ROADMAP，选任务开工

## 验证门槛（每轮必须）

```bash
npx tsc --noEmit          # 0 错误
node scripts/verify.mjs   # 17 步 + 0 控制台错误
```

数据改动加跑悬空引用校验（node --experimental-strip-types import 三数据文件比对 id）。UI 改动必须 Read 截图。

## 环境坑

- 沙箱 curl 无外网但 npm 可用；无头验证走系统 Chrome + SwiftShader。
- Vite 504 Outdated Optimize Dep → 清 node_modules/.vite。
- 加载层截图要等 `body.ready`（贴图冷缓存 10s+）。
- 内置浏览器（IAB）通道会堵死，别依赖。

## 完成定义（DoD）

代码 + tsc + verify + 截图复核 + CHANGELOG/ROADMAP 同步 + git checkpoint。
