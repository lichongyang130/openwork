# OpenWork —— 对标 WorkBuddy 的开源桌面 AI 智能体工作台 · 技术方案

> 目标：做一个与腾讯 WorkBuddy 功能对等的桌面客户端（"AI 同事"）：
> 一句话下达任务 → 自主拆解规划 → 在用户授权的本地文件夹里干活 → 交付可验收的文档/表格/PPT/报告，
> 支持多模型切换、MCP、Skills 技能包、定时任务、多 Agent 并行与高危指令拦截。
>
> ⚠️ 边界说明：WorkBuddy 是闭源商业产品，本项目**不复制其任何专有代码、界面素材与商标**，
> 而是做一个功能对等、架构自研的开源实现（类似 "OpenClaw 之于 Claw 生态" 的关系）。

---

## 1. 产品功能清单（WorkBuddy 能力拆解）

| 模块 | WorkBuddy 行为 | OpenWork 对应实现 |
|---|---|---|
| 任务下达 | 一句话自然语言指令，可附文件/截图 | 输入框 + 拖拽附件 + 任务模板 |
| 任务规划 | 自动拆解步骤、展示执行过程 | Planner + 可视化执行时间线（思考/工具调用/产物逐条流式展示） |
| 本地文件操作 | 仅访问授权文件夹，批量读写/整理/转换 | 工作区（Workspace）授权制 + 文件工具集 + 路径沙箱 |
| 成果交付 | Word/Excel/PPT/PDF/海报，可预览可下载 | docgen 模块 + 产物画廊（预览、打开、定位文件夹） |
| 多模型 | 混元/DeepSeek/GLM/Kimi/MiniMax 切换 | 模型适配层（OpenAI 兼容协议为主），BYO API Key |
| MCP | 内置主流 MCP Server | MCP Client（stdio + SSE），可配置第三方 MCP |
| Skills | 技能包安装/自定义/技能市场 | SKILL.md 兼容格式 + 本地目录 + 市场索引（Git/JSON） |
| 多 Agent 并行 | 子任务并行执行 | 任务编排器：DAG 子任务 + 并行 worker |
| 定时任务 | 每日/每周/一次性自动化 | 内置调度器（cron 表达式） |
| 远程遥控 | 微信/企微/飞书/钉钉下指令 | 分阶段：Telegram/Slack Bot → 企微/飞书/钉钉 → 手机小程序 |
| 安全 | 高危指令拦截、二次确认、本地执行 | 工具风险分级 + 审批队列 + 全程审计日志 |

## 2. 技术选型

| 层 | 选型 | 理由 | 备选 |
|---|---|---|---|
| 桌面壳 | **Electron 33+**（main / preload / renderer） | Node 主进程可直接跑 Agent 运行时、MCP stdio 子进程、SQLite；生态成熟，自动更新方案完整 | Tauri（包小，但 Agent 核心要换 Rust 或内嵌 Node sidecar，成本高） |
| 前端 | React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + TanStack Query | 组件化、时间线类复杂 UI 友好 | — |
| 进程间通信 | electron-trpc（类型安全）或自封装 typed-ipc | Agent 事件流、任务状态需要强类型双向通道 | — |
| Agent 运行时 | **自研 TS Agent Loop**（参考 Claude Code / OpenClaw 的"规划-执行-观察"循环），function calling + 流式 | 这是产品核心，必须自研可控；不绑死任何框架 | LangGraph.js 做编排辅助 |
| 模型接入 | OpenAI 兼容协议为基础适配层，内置 DeepSeek / GLM / Kimi(Moonshot) / MiniMax / 混元 / OpenAI / Anthropic / Ollama(本地) | 上述国产模型均提供兼容端点，用户 BYO Key，零自建推理成本 | 后期可做官方网关聚合计费 |
| MCP | `@modelcontextprotocol/sdk`（TS 官方 SDK），支持 stdio / SSE | 官方维护，直接兼容社区 MCP Server | — |
| 文档生成 | JS 优先：`docx`、`exceljs`、`pptxgenjs`、`pdfkit`；解析用 `mammoth`(docx)、`xlsx`、`pdf-parse` | 无 Python 依赖，安装包小 | 可选捆绑 Python sidecar（uv 管理 venv + python-docx/openpyxl/python-pptx）处理复杂排版 |
| 存储 | better-sqlite3（任务/事件/产物/技能/调度）+ electron-store（设置） | 本地优先，数据不出端 | — |
| 打包 | electron-builder（Win NSIS / mac DMG + 公证）+ electron-updater 自动更新 | 标配 | — |

## 3. 总体架构

```
┌────────────────────────────────────────────────────────────────┐
│ Renderer (React)                                               │
│  任务列表 │ 任务详情时间线 │ 产物画廊 │ 技能市场 │ 设置/模型 │ 授权管理 │
└──────────────▲─────────────────────────────────────────────────┘
               │ typed IPC / trpc（任务事件流、审批请求、产物更新）
┌──────────────┴─────────────────────────────────────────────────┐
│ Main Process (Node)                                            │
│ ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│ │ Agent Runtime            │  │ Scheduler（cron 定时任务）    │ │
│ │  Planner → Executor →    │  └──────────────────────────────┘ │
│ │  Observer 循环；并行子任务 │  ┌──────────────────────────────┐ │
│ │  审批中断 / 恢复          │  │ Remote Gateway（IM Bot，后期） │ │
│ └─────────┬────────────────┘  └──────────────────────────────┘ │
│ ┌─────────▼──────────────────────────────────────────────────┐ │
│ │ Tool Layer（工具层）                                        │ │
│ │  file:*（read/write/edit/list/move/zip）                    │ │
│ │  shell（风险分级，黑名单+审批）  web_search / web_fetch      │ │
│ │  docgen:*（docx/xlsx/pptx/pdf）  image_gen  notify          │ │
│ └─────────┬──────────────────────────────────────────────────┘ │
│ ┌─────────▼──────────┐ ┌───────────────┐ ┌───────────────────┐ │
│ │ Sandbox / 权限系统  │ │ Model Adapter │ │ MCP Client + Skills│ │
│ │ 文件夹授权白名单     │ │ 多模型路由     │ │ 技能装载/市场      │ │
│ │ 路径逃逸检查        │ │ 流式/重试/降级 │ │                   │ │
│ └────────────────────┘ └───────────────┘ └───────────────────┘ │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Storage：SQLite（tasks / events / artifacts / skills /     │ │
│ │ schedules / grants / audit_log）                            │ │
│ └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## 4. 核心模块设计

### 4.1 Agent 运行时（核心中的核心）

执行循环（ReAct 式）：

```
while (task != done):
  1. 组装上下文：系统提示 + 已装载 Skills + 工具 schema + 历史消息/观察
  2. 调模型（流式）→ 得到「思考 + tool_calls」
  3. 每个 tool_call：
       a. Sandbox 校验（路径是否在授权工作区内；命令风险分级）
       b. 高危 → 推审批事件到 UI，阻塞等待用户确认/拒绝
       c. 执行 → 结果（截断到合理长度）作为 observation 回填
  4. 无 tool_call 且声明完成 → 产出交付物清单，任务结束
```

要点：
- **计划可见**：开局先让模型输出结构化计划（steps[]），UI 渲染为时间线；执行中逐步更新状态。
- **可中断/可恢复**：每个 tool 边界都是检查点，支持用户中途插话、暂停、终止；任务状态持久化到 SQLite，崩溃可续跑。
- **多 Agent 并行**：Planner 把任务拆成子任务 DAG，独立子任务并行派发多个 Executor（各自独立会话与工具上下文），结果汇总。
- **上下文管理**：大文件只读摘要/前 N 行；工具输出超限时落盘为引用（`artifact://id`），避免撑爆上下文。

### 4.2 工具层与高危拦截（安全模型）

| 风险级 | 示例 | 处理 |
|---|---|---|
| 低 | 读文件、列目录、搜索、生成文档 | 直接执行，写审计日志 |
| 中 | 写/改/移动授权区内文件、跑白名单命令（python/node 脚本） | 执行 + 时间线明示 |
| 高 | 删除大量文件、覆盖已有重要文件、任意 shell 命令 | **弹窗二次确认**，展示将要执行的完整命令与影响范围 |
| 禁止 | `rm -rf /`、`sudo`、修改系统目录、访问授权区外路径、`curl \| sh` | **直接拦截**，向模型返回拒绝原因 |

实现：
- 所有文件工具经过 `PathGuard`：`path.resolve` 后必须落在已授权工作区根内，杜绝 `..` / 符号链接逃逸（realpath 校验）。
- shell 工具默认关闭，任务显式开启；命令经规则引擎（黑名单正则 + 启发式）分级。
- 全部动作写 `audit_log`，UI 时间线可回放。

### 4.3 工作区与授权

- 用户"新建任务"时选择/新建 **工作区文件夹**（等价于 WorkBuddy 的授权文件夹）。
- 每个任务产物默认写入 `<工作区>/openwork-output/<任务名>/`，产物面板一键"在资源管理器中打开"。
- 授权列表可随时撤销；撤销后运行中任务的越界访问立即失败。

### 4.4 模型适配层

- 统一 `ChatProvider` 接口：`chat(messages, tools, {onDelta, onToolCall})`。
- 内置 Provider：DeepSeek、GLM、Kimi、MiniMax、混元、OpenAI、Anthropic、Ollama（本地）。前六者走 OpenAI 兼容端点，Anthropic 单独适配。
- 设置页：每模型配置 baseUrl / apiKey / 默认温度；"按任务类型路由"（写作用 A、数据用 B）。
- Key 存 Electron safeStorage（系统钥匙串加密），不落明文。

### 4.5 MCP 与 Skills

- **MCP**：设置页添加本地 `command/args` 型或 SSE 型 MCP Server；启动时探活，把其 tools 合并进工具清单（带命名空间 `mcp__server__tool`）。
- **Skills**：兼容主流 SKILL.md 目录格式（frontmatter 描述 + 指令正文 + 附带脚本/资源）：
  - 装载：任务下达时由模型按需选择，或用户手动勾选；SKILL.md 正文注入系统提示，脚本作为受限工具执行。
  - 市场：一个 Git 仓库 + `index.json` 描述技能元数据，客户端列表/搜索/一键安装到 `~/openwork/skills/`。
  - 自定义：支持"自然语言生成技能"（让模型产出 SKILL.md 草稿）与 YAML 工作流导入。

### 4.6 成果交付（docgen）

- `docgen.docx / xlsx / pptx / pdf` 作为高阶工具，输入结构化内容（大纲、表格数据、样式），输出文件到产物目录。
- 内置若干"交付技能包"：周报、调研报告、数据看板（xlsx+图表）、会议纪要、发票整理成表 —— 直接对标 WorkBuddy 的模板玩法。
- UI 产物卡片：图标 + 预览（md/图片/PDF 内嵌预览，Office 文件调系统应用打开）。

### 4.7 定时任务 & 远程遥控（后期）

- 调度器：`node-cron`，配置 = 名称 + 工作区 + 提示词 + 模型 + 技能 + cron 规则；需 App 在线（后续可文档说明如何注册系统级计划任务）。
- 远程：统一 `RemoteCommand` 入口（文本 + 附件 → 新建任务）。先做 Telegram/Slack Bot（标准开放平台，合规简单），再做企业微信/飞书/钉钉机器人回调；云端中转小程序属于可选商业增强，不在开源 MVP 内。

## 5. 数据模型（SQLite）

```
tasks        (id, title, status, model, workspace_id, parent_id?, created_at, finished_at)
task_events  (id, task_id, seq, kind[plan|think|tool_call|tool_result|message|approval|error], payload_json)
artifacts    (id, task_id, path, mime, title, size)
workspaces   (id, name, root_path, created_at)
skills       (id, name, version, source[builtin|market|local], manifest_json, enabled)
mcp_servers  (id, name, transport, config_json, enabled)
schedules    (id, name, cron, prompt, model, workspace_id, skill_ids, enabled)
models_cfg   (id, provider, base_url, key_ref, default_params_json)
audit_log    (id, ts, task_id, action, risk_level, decision, detail_json)
```

## 6. UI 页面清单

1. **任务首页**：大输入框（一句话 + 附件 + 模板快捷入口）+ 历史任务列表（状态/产物数）。
2. **任务详情**：左侧执行时间线（计划步骤、思考流、工具调用卡片、审批弹窗），右侧产物画廊。
3. **技能中心**：已装技能 / 市场浏览安装 / 我的技能（编辑器 + 自然语言生成）。
4. **自动化**：定时任务列表与表单（名称/工作区/提示词/模型/技能/cron）。
5. **设置**：模型配置、MCP 管理、授权文件夹管理、审批策略、外观。

## 7. 仓库结构（pnpm monorepo）

```
openwork/
├─ package.json              # pnpm workspace
├─ apps/desktop/             # Electron 应用
│  ├─ src/main/              # 窗口、服务装配、托盘、自动更新
│  ├─ src/preload/           # 暴露类型化 API
│  └─ src/renderer/          # React 界面
├─ packages/
│  ├─ agent-core/            # Agent 循环、Planner、事件协议、检查点
│  ├─ model-adapters/        # 多模型 Provider
│  ├─ tools/                 # file/shell/web/docgen 工具实现
│  ├─ sandbox/               # PathGuard、命令风险引擎、审批
│  ├─ mcp-client/            # MCP 接入
│  ├─ skills/                # 技能装载与市场
│  ├─ storage/               # SQLite schema 与仓储层
│  └─ shared/                # 类型、IPC 契约、事件定义
├─ skills/                   # 随包内置技能包（周报/报表/整理…）
└─ docs/                     # 设计文档
```

## 8. 里程碑（建议节奏）

| 阶段 | 内容 | 预估 |
|---|---|---|
| **M0 骨架** | monorepo 脚手架、Electron+React+trpc、打包与自动更新流水线 | ~1 周 |
| **M1 MVP** | 单模型（OpenAI 兼容）Agent 循环、文件工具+授权沙箱+高危确认、执行时间线、产物目录；能跑通"整理这个文件夹/写一份 md 报告" | 2–3 周 |
| **M2 交付力** | docgen（docx/xlsx/pptx/pdf）、多模型切换、MCP Client、Skills 装载与 3–5 个内置技能包 | 3–4 周 |
| **M3 工作台** | 多 Agent 并行、定时任务、技能市场、审计与设置完善、Windows/macOS 签名发布 | 3–4 周 |
| **M4 远程** | Telegram/Slack Bot → 企微/飞书/钉钉；（可选）云端中转 | 持续 |

## 9. 风险与对策

| 风险 | 对策 |
|---|---|
| 模型 function calling 不稳定、跑偏 | 系统提示强约束 + 计划先行 + 单步超时/步数上限 + 失败重试与降级模型 |
| 误删/越权操作（最大红线） | 默认最小权限（只读授权区）、写操作白名单化、删除类强制审批、拦截黑名单硬编码 |
| 大文件/大目录拖垮上下文 | 摘要化读取、输出落盘引用、分页工具 |
| Office 复杂排版质量 | 模板库 + 可选 Python sidecar；产物可二次编辑定位 |
| Windows/macOS 分发 | 尽早上签名与公证，避免 SmartScreen/Gatekeeper 拦截 |
| 与 WorkBuddy 的 IP 边界 | 仅对标功能形态，UI/文案/图标全部原创，名称不碰 "WorkBuddy" 商标 |

---

### 下一步

确认本方案后，我将按 M0→M1 顺序在本仓库初始化工程：
1. `pnpm` monorepo + Electron/Vite 脚手架；
2. `agent-core` 最小 Agent 循环 + 文件工具 + 审批拦截；
3. 可运行的任务时间线 UI，跑通第一个"帮我整理文件夹"任务。
