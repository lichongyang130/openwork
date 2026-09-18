# openwork

OpenWork —— 对标 WorkBuddy 的开源「桌面 AI 智能体工作台」（功能对等、架构自研，不复制任何专有代码/素材）。

一句话下达任务 → 自主拆解规划 → 在授权的本地文件夹里执行 → 交付可验收的文档 / 表格 / 报告。

## 快速开始

```bash
npm install
npm run build     # 构建前台 (apps/web)
npm start         # 启动后台 + 前台静态服务，http://localhost:3000
```

开发模式（热更新）：`npm run dev:server` + `npm run dev:web`（5173，/api 自动代理到 3000）。

## 已实现（M1）

- **前台**（React，复刻 WorkBuddy 三区布局）：侧边栏（新建任务 / 技能 / 专家 / 连接器 / 自动化 / 按工作区分组的任务列表）、对话区（Ask·Plan·Craft 三模式、工作空间 / 模型 / 技能选择、执行时间线、高危审批卡片、追问与中断）、结果区（产物预览下载 / 工作空间文件 / 变更记录）、设置（多模型 BYO Key、授权文件夹、安全策略）。
- **后台**（Node/Express Agent Runtime）：规划-执行-观察循环、文件工具沙箱（PathGuard 越权拦截）、高危指令二次确认、多模型适配（OpenAI 兼容：DeepSeek/Kimi/GLM/MiniMax/OpenAI）、无 Key 时内置演示引擎离线跑通全流程、SSE 事件流、SQLite 式 JSON 持久化、定时任务调度。
- 内置技能包：文件夹智能整理 / 周报生成 / 发票提取 / 调研报告 / 清理垃圾 等。

## 方案文档

总体架构、选型论证、里程碑见 [PLAN.md](./PLAN.md)。

## 目录

```
apps/web      前台 React (Vite)
apps/server   后台 Agent Runtime (Express + SSE)
workspace/    授权工作区（演示数据）
data/         运行时持久化（gitignore）
```
