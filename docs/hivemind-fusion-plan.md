# 🧠🐝 HiveMind 第二大脑 + 蜂群 OS 融合方案 v1

> 基于现有 OpenWork 源码（a75c164干净版）+ 你的 HiveMind 8层记忆设计，目标是**不让用户懵逼的第二大脑**。

## 一、现状盘点

**前端现状（已回滚到无蜂群版）：**
- Sidebar: home / dashboard / gene-market / assistant / projects / esk / automation / library / inspiration
- Home: office / code / design 三场景，日常办公8项保留，无蜂群办公
- InputCard: + / 模型 / 语音 / 发送，极简
- TaskView: conv + RightPanel(产物/工作空间文件/变更记录)，无 DAG/蜂群视图
- App.jsx 路由简单

**后端现状：**
- `store.js`: db.json 存 tasks, workspaces, skills, experts, connectors, automations, genes, settings{models, swarm, evolution}
- `agent.js`: runTask -> shouldUseSwarm -> runSwarm else offline executors (organize/invoice/weekly/report/sales/ppt)
- `swarm.js`: 4360行旧蜂群：Pollen, PollenDB, 3策略分解(维度/流程/假设), OFFICE_PATTERNS, runWorkerBee, queenAggregate, 额度, 人机协作暂停
- `genes.js`: 简单 GDI 记忆 + marketplace
- `index.js`: 30+ API，含 swarm/decompose, genes, channels/push, docgen, sqlite等

**痛点（你提的）：**
- DAG·6节点·5边·可拖拽编辑 L0-L5 让用户懵
- 蜂群概念暴露太早，用户只想要结果
- 记忆只有 genes，没有项目/决策/失败记忆，失忆

## 二、目标形态 HiveMind OS

你定义的7大系统，映射到现有：

```
现有： skills(能力) + tasks(任务) + genes(记忆) + swarm(执行)
目标：
① 🧠 Memory OS        <- genes 扩展为 8层记忆 + memory/ 目录
② 👑 Queen Engine     <- agent.js 里的规划部分抽离
③ 🐝 Hive Engine      <- swarm.js 重构，隐藏 DAG
④ 🧩 Task Engine      <- tasks + DAG 但UI简化
⑤ 🔍 Context Engine   <- 新增，记忆检索 + 上下文打包
⑥ 🔄 Learning Engine  <- 反思 + 经验沉淀
⑦ 🛠 Tool Engine      <- tools.js 已有
```

**核心闭环（你画的）：**
用户输入 -> 意图识别 -> 记忆检索 -> 上下文构建 -> Queen -> 任务拆解 -> 蜂群执行 -> 验证 -> 反思 -> 记忆更新 -> 最终交付

## 三、融合原则：极简不懵逼

1. **默认隐藏复杂度**：TaskView 只显示3步：`🧠 理解中` → `🐝 执行中 (x只)` → `📦 交付物`。DAG图、L0-L5、边，收进「查看执行详情」折叠面板，默认不展开。
2. **日常办公保留**：Home 的 office 8项不动，蜂群是执行方式，不是新场景。用户说“写周报”，系统自动判断是否用蜂群，不让用户选策略。
3. **第二大脑驾驶舱**：Home 改为你设计的 cockpit：进行中项目、蜂群状态、最近记忆、第二大脑发现。不是增加新页面，而是升级 Home。
4. **记忆自动工作**：用户不用管“存记忆”，Memory Manager 自动判断值得记住的（决策、技术选型、偏好），像人类睡觉整理。

## 四、数据模型扩展（兼容 db.json）

在 `store.js defaults()` 增加：

```js
memories: [],        // 统一记忆表，type 区分8层
decisions: [],       // 可为 memories type=decision 的视图，独立表便于审计
experiences: [],     // 成功经验
failures: [],        // 失败记忆
projects: [],        // 项目记忆：每个工作区对应一个项目，含目标/架构/决策/TODO
knowledgeNodes: [],  // 关系记忆节点
knowledgeEdges: [],  // 关系边
```

**Memory Schema（对齐你设计的）：**
```json
{
  "id": "mem_001",
  "type": "decision | episodic | semantic | user | project | relationship | experience | failure",
  "content": "任务系统采用 DAG",
  "summary": "AI Hive 使用 DAG 支持并行",
  "importance": 0.94,
  "confidence": 0.97,
  "source": "conversation | task | manual",
  "projectId": "ws-demo",
  "tags": ["DAG", "AI Hive"],
  "status": "active | archived",
  "createdAt": "...",
  "updatedAt": "...",
  "embedding": null, // 第一版用关键词检索，第二版 pgvector
  "relations": ["mem_002"]
}
```

**评分公式（你设计的）：**
```
Score = Importance * Relevance * Confidence * Recency * Frequency
Recency = exp(-days/30)
Frequency = log(usage+1)
```

**复用现有：**
- genes 保留，作为 experience 记忆的子集，GDI = confidence*100
- PollenDB 的 keyword index 复用到 Memory Retrieval

## 五、后端 10 MVP 模块拆解（你建议的第一版）

### 01 Memory Manager `apps/server/src/memory/manager.js`
- `shouldRemember(text)` 判断：含“记住/以后都用/决定/偏好/技术选型”则保存，含“今天天气不错”丢弃
- `saveMemory({type, content, projectId})` 自动打分 importance/confidence
- `forgetMemory(id)` / `archiveOld()` 7天未用降权 30天归档
- 晚上 consolidation job 调用

### 02 Memory Retrieval `memory/retrieval.js`
- 复用 `indexer.js` BM25 + PollenDB token 索引
- `searchMemories(query, {projectId, types, topK=5})` 返回按 Score 排序
- 第一版无向量，第二版接入 better-sqlite3 + pgvector

### 03 Context Engine `context/engine.js`
- 输入：用户prompt + 当前project
- 输出：Context Package
```
{
  project: {name, goal, progress, todos},
  relevantMemories: [top5],
  decisions: [相关决策],
  experiences: [相似任务成功经验],
  failures: [避免踩坑]
}
```
- 注入到 LLM system prompt，不塞全部历史

### 04 Queen Agent `queen/index.js`
- 从 agent.js 抽离：意图识别 + 记忆检索 + 任务规划
- `queenPlan(prompt, contextPackage)` 返回 {intent, projectId, tasks: 分解后子任务, strategy}
- 复用 swarm.js 的 decomposeOffline / decomposeWithLLM，但策略自动选，不暴露给用户

### 05 Agent Registry `hive/agents.js`
- 蜂种注册表：research, coder, analyst, search, reviewer, memory, reflection
- 每个 agent 有 system prompt + tools
- 对应 OFFICE_PATTERNS 但更通用

### 06 Task DAG `hive/dag.js`
- 内部仍是 DAG，但对外简化为线性进度
- `buildDAG(subtasks)` 自动算依赖：维度分解并行无边，流程分解串行，假设分解前2并行到第3
- 提供 `getSimpleProgress(dag)` -> {total, done, current}

### 07 Hive Scheduler `hive/scheduler.js`
- 从 swarm.js runSwarm 提炼：并发3，失败自修复重试2次，额度按模型计费
- `runHive(tasks, context)` 并行执行 worker bee，写入 PollenDB -> Memory

### 08 Reviewer `hive/reviewer.js`
- 验证蜂真反证：交叉检查花粉证据链，标红低置信
- 输出 confidence + issues

### 09 Reflection `hive/reflection.js`
- Reflection Bee：任务完成后提问：完成了吗？遗漏？不确定？经验？
- 输出 reflection 写入 memories type=experience / failure

### 10 Project Memory `memory/project.js`
- 项目长期记忆：目标、架构、技术决策、已完成/TODO
- `getProjectMemory(wsId)` 聚合 memories where projectId=wsId
- `updateProjectProgress(wsId, task)` 自动更新进度 78%

**文件映射：**
```
apps/server/src/
  memory/
    index.js (manager)
    retrieval.js
    consolidation.js (晚上整理)
    project.js
  context/
    engine.js
  queen/
    index.js
  hive/
    scheduler.js
    agents.js
    dag.js
    reviewer.js
    reflection.js
  swarm.js -> 保留兼容，内部调用 hive/*
  genes.js -> 保留，改为 experience 存储适配层
```

## 六、前端重构（不让用户懵）

### Sidebar.jsx
- 新增：`🧠 第二大脑` (id: brain) 置顶在 home 之后
- 保留：dashboard, gene-market, projects 等
- 移除：swarm-lab 已去掉，不加回
- NAV 最终：home / brain / dashboard / gene-market / assistant / projects / esk / automation / library / inspiration

### Home.jsx -> 第二大脑驾驶舱
- 保留 office/code/design chips，但顶部加 cockpit：
```
Good Morning, HiveMind
进行中项目: AI Hive 78% / AI Coding 43%
🐝 蜂群: 12只工作中 36任务 8完成
🧠 最近记忆: AI Hive使用DAG / PostgreSQL核心 / 新增Reviewer
💡 发现: 你最近12个任务9个需测试，是否设自动测试蜂为默认？
```
- 数据来自 /api/brain/cockpit (新接口聚合 memories + tasks)

### TaskView.jsx 简化
- 顶部：3步进度条，不是DAG图
```
🧠 Queen 理解中 -> 记忆检索3条 -> 拆解为4任务
🐝 Hive 执行中: 搜索蜂 ✅ 分析蜂 ⏳ 验证蜂 ⏳ 案例蜂 ⏳
📦 交付物: 2个文件，置信度 87%
```
- 默认隐藏 DAG，按钮「查看执行详情」才展开 DagView（简化版，只显示卡片，不显示L0-L5边）
- 产物区置顶，永远可见，最终结果一眼看到

### InputCard.jsx
- 保留极简，但增加记忆提示：当输入含“记住”时，显示“🧠 将保存为长期记忆”
- 增加项目上下文：显示当前项目名 + 记忆数

### RightPanel.jsx
- Tab 增加：`🧠 记忆` 显示本次任务用到的记忆 + 置信度
- 产物 tab 置顶，默认展开
- 移除 bees tab 的复杂展示，改为简单列表

### 新增 BrainPage.jsx `components/BrainPage.jsx`
- 记忆可视化：节点图（项目/技术/偏好），点击看详情
- 8层记忆过滤：全部 / 决策 / 项目 / 经验 / 失败
- 经验库：编程经验/产品经验/失败案例
- 可视化用简单卡片 + 关系线，不用复杂图库

## 七、关键闭环流程（代码级）

```js
// 新 runTask 融合版
async function runHiveMindTask(taskId) {
  const task = getTask(taskId)
  // 1. 意图识别
  const intent = await queen.identifyIntent(task.prompt)
  // 2. 记忆检索
  const mems = await retrieval.searchMemories(task.prompt, {projectId: task.workspaceId})
  // 3. 上下文构建
  const ctxPack = await contextEngine.build(task.prompt, mems, task.workspaceId)
  // 4. Queen 规划
  const plan = await queen.plan(task.prompt, ctxPack)
  // 5. Hive 执行
  const pollenDB = await scheduler.runHive(plan.subtasks, ctxPack)
  // 6. Reviewer 验证
  const review = await reviewer.verify(pollenDB)
  // 7. Reflection 反思
  const reflection = await reflection.reflect(task, pollenDB, review)
  // 8. Memory Writer
  await memoryManager.saveFromReflection(reflection, task.workspaceId)
  // 9. Project Memory 更新
  await projectMemory.updateProgress(task.workspaceId, task)
}
```

## 八、分阶段实施

### Phase 1: Memory OS 基础（1-2天）
- [ ] store.js 增加 memories, projects, experiences, failures, knowledgeNodes/Edges
- [ ] memory/manager.js + retrieval.js + project.js
- [ ] context/engine.js
- [ ] API: /api/memories, /api/memories/search, /api/brain/cockpit, /api/projects/:id/memory
- [ ] 前端 BrainPage.jsx + API 对接
- [ ] 迁移 genes -> memories type=experience

### Phase 2: HiveMind 闭环（2-3天）
- [ ] queen/index.js + hive/* 重构 swarm.js
- [ ] agent.js 改为调用 runHiveMindTask
- [ ] TaskView 简化为3步进度，DAG折叠
- [ ] Home 改为 cockpit
- [ ] Reflection + consolidation 定时任务

### Phase 3: 学习与可视化（1-2天）
- [ ] Cross-Project Learning：经验跨项目复用
- [ ] Behavior Pattern 发现：用户工作方式
- [ ] Memory Decay + 可视化图谱
- [ ] 自动发现规律并提示

## 九、第一阶段具体改动清单（可直接开干）

**后端：**
1. `store.js` defaults 增加 memories等 + migration
2. 新建 `apps/server/src/memory/` 3文件
3. 新建 `apps/server/src/context/engine.js`
4. `index.js` 增加 /api/memories/*, /api/brain/cockpit
5. `genes.js` 增加 toMemory 适配

**前端：**
1. `api.js` 增加 brain, memories API
2. `Sidebar.jsx` 增加 brain NAV
3. `BrainPage.jsx` 新建
4. `Home.jsx` 增加 cockpit 组件（复用 DashboardPage 逻辑）
5. `TaskView.jsx` 简化进度，DAG折叠
6. `RightPanel.jsx` 增加记忆 tab

**不改动：**
- office 场景保留
- InputCard 极简保留
- 现有 tasks 流程兼容

## 十、为什么这样不懵逼

- 用户之前懵：DAG图、L0-L5、6节点5边、策略pills暴露实现
- 现在：用户只看到「理解-执行-交付」3步，产物置顶，记忆自动工作，蜂群是后台
- 高级用户想看：点「查看执行详情」才看到 DAG 和 bee 日志
- 第二大脑价值：用户第二天说“继续昨天的项目”，系统自动恢复上下文，不用重新解释

---

**下一步：** 确认此方案后，我按 Phase1 开始实现，预估改动 12文件，新增 6文件，兼容现有 db.json。
