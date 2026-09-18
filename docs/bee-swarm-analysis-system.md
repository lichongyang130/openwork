# 蜂群智能分析系统 — Bee Swarm Analysis System (BSAS) v2 丰富版

> **灵感来源**：零度解说 EvoX Agent 测评 + 用户需求“复杂问题变多个简单问题，像蜜蜂一样蜂群处理”
> **一句话定位**：把复杂问题拆成简单问题，蜂群并行真干活，越用越聪明，最后交出可直接用的东西

---

## 0. 为什么要做蜂群？真实痛点

来自视频逐字稿高频抱怨，原封提取：

**用户原话痛点**：
- “我想让AI帮我写代码整理资料做报告，但一上来就要API Key要绑卡要自己配置环境，光配置就劝退了一大堆人”
- “每次对话都是失忆状态，你教它100遍它还是新手”
- “一个32B模型Q4量化上下文32K，我这卡到底能不能跑？每次都要翻公式或问一遍AI”
- “我手上有几份AI行业报告和几个网页加起来100多页，正常读完要一整天”
- “现在写代码工具已经非常多了，但把杂乱材料变成一份能直接交出去的东西，这个环节以前都是人力硬扛的”

**映射到蜂群设计**：
- 劝退 → 零配置蜂巢，1500免费额度白嫖跑一遍
- 失忆 → Gene基因记忆 + Pollen花粉库，越用越顺手
- 翻公式 → 搜索蜂+分析蜂自动算
- 100页硬扛 → 侦查蜂分解为逐份提取+归并+表格+图表 4个工蜂并行
- 难交付 → 蜂蜜报告必须是单文件HTML可直接发同事

**EvoX现有Swarm的不足（视频原话）**：
- “Swarm可以让多个Agent拆开任务并行干活，用法简单把开关打开，我试下来复杂任务确实快，但稳定性一般，偶尔会卡住”

**我们的机会**：做更稳的蜂群 — 增加侦查蜂、摇摆舞协议、花粉冲突检测、蜂王聚合、GDI质量评分。

---

## 1. 核心理念 v2

### 1.1 蜜蜂隐喻完整映射

| 蜜蜂世界 | 系统映射 | 职责 | 来自视频的启发 |
|---------|---------|------|---------------|
| 蜂巢 | OpenWork Workspace | 问题上下文容器 | 工作空间文件拖拽即上下文 |
| 蜜源 | 复杂问题 | 待分析原始输入 | 100页报告/32B显存计算 |
| 侦查蜂 | Decomposer 分解器 | 发现子问题维度，MECE拆3-8个 | 视频中“提炼观点+对比表格+动态图表”就是分解 |
| 工蜂 | Worker Bee 子任务Agent | 处理1个简单问题，2分钟内完成 | 右边执行面板建文档跑命令改代码，每步可见 |
| 摇摆舞 | Waggle Protocol 消息协议 | 工蜂共享发现：方向/距离/质量 | 视频中“试错好几轮”→通过摇摆舞共享避免重复试错 |
| 花粉 | Pollen DB 记忆库 | 共享知识证据，向量检索 | 花粉是证据，GDI是花粉质量分 |
| 蜂王 | Queen Aggregator 聚合器 | 整合结论解决冲突 | 蜂王做“第一口仪式感让人年年想来”的聚合 |
| 蜂蜜 | Honey Report 最终报告 | 高置信度可交付物，单HTML | 视频强调“单文件HTML发出去不用管” |
| 基因 | Gene 基因记忆 | 有效经验固化为可复用技能 | EvoX自进化Skills，跑完固化gene |
| 花园 | Marketplace 基因市场 | 全网别人分享的gene，带GDI评分 | 搜“写作”出一列带GDI评分，直接复用 |

### 1.2 为什么像蜜蜂（丰富版）

- **并行**：100只工蜂同时采蜜 = 100个子问题并行，视频案例2中逐份读逐份提取就是并行，过去几分钟跑完
- **分工**：采蜜(搜索蜂)、酿蜜(分析蜂)、守巢(验证蜂)、跳舞(通信) = 搜索、分析、验证、案例四角色
- **通信**：摇摆舞传递方向距离质量 = 结构化消息传递置信度与证据，避免“我一行代码没写”的甩锅
- **自进化**：蜜蜂越采越知道哪花好 = Gene沉淀，第一次做显存计算器试错好几轮，第二次复用经验明显更快
- **涌现**：简单个体涌现复杂智能 = 简单问答涌现深度分析，视频金句“从一句话到真正能用的东西”

---

## 2. 系统架构 v2（融合EvoX UI）

```
[用户] 复杂问题（自然语言 + 拖拽文件）
   │
   ▼
[蜂巢入口 Hive Gateway] — 意图识别 + 复杂度评估 + 零配置
   │  1500免费额度白嫖，Mac/Win，无需API Key
   ├─ 简单问题 → 单蜂直接回答（2分钟）
   └─ 复杂问题 → 启动蜂群（Swarm开关）
            │
            ▼
[侦查蜂 Decomposer] — 3种分解策略 + 人机协作
   │  ├─ 维度分解：PESTEL / 5W2H / 用户旅程 / 4P / 商业画布
   │  ├─ 流程分解：时间轴 / 因果链 / MECE / 逐份读→提取→归并→表格→图表
   │  └─ 假设分解：假设-验证 / 正反方辩论
   │  输出：SubTask DAG，每个可被工蜂2分钟完成
   │
   ▼
[蜂群调度器 Swarm Scheduler] — ABC人工蜂群算法 + GDI评分
   │  生成SubTask DAG，分配工蜂，动态增减
   │
   ├─→ [工蜂-1 搜索蜂 Searcher] 工具：web_search, wsFiles, 逐份读
   │      产出：fact + source + 置信度
   ├─→ [工蜂-2 分析蜂 Analyst] 工具：readFile, 数据分析, 公式计算
   │      产出：insight + 计算过程
   ├─→ [工蜂-3 验证蜂 Verifier] 工具：交叉验证、反证、找反例
   │      产出：confidence校准 + 反例
   ├─→ [工蜂-4 案例蜂 CaseBee] 工具：casedata检索, 最佳实践
   │      产出：case + 可复用模板
   └─→ [工蜂-N ...]
   │      │
   │      └─ 摇摆舞通信：发布Pollen {claim, evidence(3条), confidence, source, waggle{direction,distance,quality}}
   │           质量=置信度，方向=维度，距离=推理步数
   │
   ▼
[花粉库 Pollen DB] — 共享黑板 + 向量 + 冲突检测
   │  内存cosine + 可扩展Chroma，花粉即证据
   │  冲突检测：同claim不同confidence标冲突
   │
   ▼
[蜂王 Queen Aggregator] — 一致性+冲突解决+置信度聚合
   │  ├─ 一致性检查：子结论矛盾检测
   │  ├─ 冲突解决：置信度加权投票，GDI质量加权，保留高置信度，低进入不确定性
   │  ├─ 置信度聚合：final = Σ(conf*weight)/Σweight
   │  └─ 生成Honey Report：单HTML可交付
   │
   ▼
[蜂蜜报告 Honey Report] — 结构化可交付物（单文件HTML）
   ├─ 执行摘要（1句话定位）
   ├─ 子问题结论矩阵（对比表格）
   ├─ 证据链（每条带source）
   ├─ 动态图表（可点可筛选）
   ├─ 冲突与不确定性
   └─ 行动建议 + Gene沉淀
```

**UI三栏（抄EvoX，视频原话）**：
- 左：会话和项目 + Gene基因记忆列表 + GDI评分 + Marketplace
- 中：对话框 + Swarm开关 + 模型切换（ChatGPT/Kimi/Grok/DeepSeek）+ 额度可见
- 右：干活过程面板（核心差异）— 每只工蜂独立卡片，状态、置信度进度条、花粉证据流、报错自改过程，真的在建文档跑命令改代码，每步可见

---

## 3. 核心模块丰富版

### 3.1 侦查蜂 Decomposer（增加人机协作）

**输入**：复杂问题文本 + 拖拽文件（100页报告）
**输出**：SubTask[]，每个符合SMART，2分钟可完成

**Prompt模板 v2（融合视频案例）**：
```
你是侦查蜂，任务是把复杂问题分解为3-8个简单问题，每个可被工蜂2分钟完成。

复杂问题：{complexQuestion}
工作区文件：{workspaceFiles}（已逐份读）
上下文：{context}

分解原则：
1. MECE：相互独立完全穷尽
2. 每个子问题单一工蜂2分钟内完成，工具明确
3. 类型：fact(事实搜索)/analysis(分析计算)/judgment(判断)/idea(创意)/visual(可视化)
4. 依赖：DAG，标注dependsOn
5. 产出必须是可交付物：fact带source，analysis带公式，visual带图表

参考EvoX两个案例分解：
案例1显存计算器分解：公式研究/前端实现/边界测试/配色优化
案例2报告分解：逐份提取/观点归并/表格对比/图表可视化

输出JSON：
[
  {id:"sub-1", question:"安福路人流与竞品咖啡馆数量？", type:"fact", dependsOn:[], tools:["web_search"], weight:0.8, deliverable:"fact+source+地图"},
  {id:"sub-2", question:"50w预算分配模型？", type:"analysis", dependsOn:[], tools:["readFile"], weight:0.9, deliverable:"预算表40/20/30/10"},
  ...
]
```

**3种分解器**：
- `DimensionDecomposer`：PESTEL、4P、用户旅程、商业画布，适合商业分析
- `ProcessDecomposer`：时间轴、因果链、逐份读→提取→归并→表格→图表，适合报告整理
- `HypothesisDecomposer`：假设树、正反方，适合决策

**人机协作**：分解后展示给用户，用户可增删改子问题，再启动蜂群（解决视频中“复杂任务偶尔卡住需返工”）

### 3.2 工蜂 Worker Bee（真干活版）

每个工蜂独立Agent，继承`agent.js`的`runTask`，上下文隔离，右边面板独立卡片。

**4角色**：
- **搜索蜂 Searcher**：只做搜索，产出fact+source，工具web_search, wsFiles，例：安福路人流5000
- **分析蜂 Analyst**：基于fact分析，产出insight+公式，工具readFile, 数据分析，例：显存公式计算32B Q4 32K
- **验证蜂 Verifier**：反向验证找反例，产出confidence校准，例：验证显存计算是否卡边缘
- **案例蜂 CaseBee**：检索casedata最佳实践，产出case+模板，例：Slogan“把早晨交给我们”

**工蜂Prompt v2（真干活）**：
```
你是工蜂 {role}，只处理一个简单问题，真干活非吐文字。

简单问题：{subQuestion}
花粉库已有：{pollenContext}
工具可用：{tools}
要求：
- 只回答这个简单问题，别扩展，2分钟内完成
- 真干活：建文档、跑命令、改代码，每步可见，报错自改
- 输出结构：claim + evidence(3条带source) + confidence(0-1) + deliverable(单文件或表格)
- 完成后跳摇摆舞：发布到Pollen DB，waggle{direction,distance,quality}
- 质量：quality=confidence，方向=维度，距离=推理步数
```

**隔离**：独立history，避免污染，支持一键迁移Claude Code/Codex记忆

**可观测**：每工蜂独立event流，SSE推送，右边面板实时看

### 3.3 摇摆舞协议 Waggle Protocol（丰富版）

蜜蜂用摇摆舞传递蜜源方向、距离、质量。我们用结构化消息，解决视频中“试错好几轮”重复劳动。

```js
// Pollen — 花粉即证据
{
  subTaskId: "sub-1",
  workerId: "bee-3",
  role: "searcher",
  claim: "安福路日人流5000，咖啡馆8家",
  evidence: [
    {text:"大众点评安福路人流5000", source:"https://dianping.com/...", type:"report", quality:0.8},
    {text:"高德地图咖啡馆8家", source:"https://amap.com/...", type:"map", quality:0.9},
    {text:"20访谈验证", source:"workspace/demo/interview.md", type:"interview", quality:0.85}
  ],
  confidence: 0.85,
  waggle: {
    direction: "market", // 维度：market/budget/user/slogan
    distance: 1, // 推理步数：1=直接事实，2=一次推理，3=多次推理
    quality: 0.85 // 花蜜质量=置信度=GDI评分基础
  },
  gdi: 85, // GDI质量评分，0-100，参考视频Marketplace
  geneId: "gene-market-research", // 可沉淀为Gene
  timestamp: 1715600000,
  deliverable: {type:"map", url:"/artifacts/map.html"}
}
```

**通信**：工蜂完成即发布，其他工蜂订阅相关direction的pollen，交叉引用，避免重复试错

**GDI评分**：基于evidence数量、source权威性、confidence、是否可复用，自动算GDI，展示在Marketplace

### 3.4 花粉库 Pollen DB（共享黑板+向量）

共享黑板，内存+向量检索，解决失忆问题。

```js
class PollenDB {
  pollens = []
  vectorIndex = new Map()
  
  add(pollen) {
    // 冲突检测：同direction同claim不同confidence
    const conflict = this.findConflict(pollen)
    if(conflict) {
      this.markConflict(conflict, pollen)
      // 触发验证蜂
      this.requestVerifier(pollen.direction)
    }
    this.pollens.push(pollen)
    this.vectorIndex.set(pollen.subTaskId, embed(pollen.claim))
    // 发布事件：bee_waggle
    appendEvent(taskId, 'bee_waggle', pollen)
  }
  
  query(direction, k=5) {
    // 向量检索相关花粉
    return this.pollens
      .filter(p=>p.waggle.direction===direction)
      .sort((a,b)=>b.confidence-a.confidence)
      .slice(0,k)
  }
  
  getConflicts() { return this.pollens.filter(p=>p.conflict) }
  
  // 沉淀为Gene
  toGene(direction) {
    const best = this.query(direction, 1)[0]
    if(best.confidence>0.8) {
      return {id:uid('gene-'), name:best.claim.slice(0,20), pollen:best, gdi:best.gdi, createdAt:now()}
    }
  }
}
```

**沉淀**：高置信度pollen自动沉淀为Gene，存本机，下次复用，越用越顺手

### 3.5 蜂王 Queen Aggregator（丰富版）

**聚合算法**：
1. **置信度加权**：`finalConfidence = Σ(confidence_i * weight_i * gdi_i/100) / Σ weight`
2. **冲突解决**：同问题多claim，投票+GDI加权，保留高，低进入不确定性章节，视频原话“有的好用有的不一定，实话实说”
3. **一致性检查**：LLM检查子结论矛盾，例：预算50w但房租就要40w矛盾
4. **可交付物**：必须是单文件HTML，包含动态图表可点可筛选，发出去不用管

**Queen Prompt v2**：
```
你是蜂王，整合所有工蜂花粉，产出蜂蜜报告单HTML。

复杂问题：{complex}
子任务结果：{subResults}（每个含claim+evidence+confidence+gdi+deliverable）
花粉库：{pollens}
冲突：{conflicts}
Gene库：{genes}

任务：
1. 一致性检查：子结论矛盾？例：人流5000但竞品8家是否饱和？
2. 冲突解决：同问题多claim，选高置信度高GDI，给理由，低置信度入不确定性
3. 聚合为Honey Report单HTML：
   - 执行摘要：1句话定位，把杂乱变随取随用（参考视频）
   - 结论矩阵：对比表格，横向对比
   - 证据链：每条带source，可点击
   - 动态图表：可点可筛选，Chart.js
   - 冲突与不确定性：实话实说
   - 行动建议：3条可执行
   - Gene沉淀：本次可复用经验
4. 整体置信度 + GDI评分

输出：Markdown + 单HTML，单HTML包含所有
```

**报告模板（抄视频成果页）**：
- 上：核心结论（3条）
- 中：横向对比表格
- 下：动态图表可筛选
- 底部：证据链+冲突+行动建议

### 3.6 自进化 Skills / Gene（视频核心）

**机制**：
- 开关：右上角自主进化，默认开，定期把问题修复、新优化自动存本机，关了不沉淀
- 触发：任务完成且confidence>0.8自动固化Gene
- 内容：有效经验+Prompt模板+工具链+避坑
- 质量：GDI评分0-100，基于复用次数、成功率、用户点赞

**验证对比（视频原话）**：
- 第一次显存计算器：试错好几轮
- 第二次同类型单页工具：复用Gene，按跑通路子走，明显更快试错少
- 前后对比=自进化有效最直观证据

**Marketplace**：
- 搜索全网别人分享gene，例：搜“写作”出一列带GDI评分，直接复用，站在别人跑通经验上开工
- 复用：点击安装，一键迁移Claude Code/Codex记忆

**解决失忆**：视频金句“大部分AI工具每次对话失忆，你教100遍还是新手”，Gene解决

---

## 4. 调度算法 — 蜂群觅食 + GDI

借鉴ABC人工蜂群算法，增加GDI质量：

```
1. 初始化：侦查蜂生成N个子任务=N个蜜源，评估复杂度
2. 雇佣蜂：每子任务分配1工蜂，计算适应度=confidence * gdi/100
3. 观察蜂：高适应度蜜源分配更多验证蜂（视频中“高亮变化点”）
4. 侦查蜂：低适应度蜜源放弃，侦查新子问题（解决卡住）
5. 收敛：所有子任务confidence>0.7且无冲突，或迭代3轮
6. 沉淀：高GDI pollen沉淀为Gene
```

实现：`SwarmScheduler`维护队列，动态增减工蜂，支持用户介入分解（人机协作）

---

## 5. 与OpenWork现有系统集成 v2

### 5.1 数据结构扩展

```js
// Task扩展
task = {
  ...,
  swarm: {
    isSwarm: true,
    complexQuestion: "开社区咖啡馆50w可行性",
    subTasks: [
      {id:"sub-1", question:"安福路人流与竞品？", type:"fact", status:"done", workerId:"bee-1", confidence:0.85, gdi:85, dependsOn:[], deliverable:"map.html"},
      ...
    ],
    pollenDB: {pollens:[], conflicts:[]},
    genes: [{id:"gene-1", name:"市场调研", gdi:85, reuseCount:3}],
    queenReport: {markdown:"...", htmlUrl:"/artifacts/honey.html", confidence:0.85, gdi:88},
    iterations: 2,
    creditsUsed: 320 // 参考1500额度
  }
}

// Event扩展
eventKind: 'swarm_decompose' | 'bee_start' | 'bee_waggle' | 'bee_error_self_fix' | 'pollen_conflict' | 'gene_born' | 'queen_aggregate' | 'honey_report'
```

### 5.2 后端新增 `apps/server/src/swarm.js`

```js
import { getTask, updateTask, addTask, appendEvent } from './store.js'
import { runTask } from './agent.js'
import { chatCompletion } from './llm.js'

export class Decomposer {
  async decompose(complexQuestion, workspaceFiles) {
    // 3策略 + 人机协作
  }
}

export class PollenDB { ... }

export class SwarmScheduler {
  async schedule(subTasks) {
    // ABC算法 + GDI
  }
}

export async function runSwarm(taskId) {
  const task = getTask(taskId)
  appendEvent(taskId, 'swarm_decompose', {question:task.prompt})
  
  // 1. Decompose
  const decomposer = new Decomposer()
  const subTasks = await decomposer.decompose(task.prompt, task.refFiles)
  updateTask(taskId, {swarm:{subTasks, status:'decomposed'}})
  
  // 2. Schedule + Run Bees
  const scheduler = new SwarmScheduler()
  const beeTasks = await scheduler.schedule(subTasks)
  for(const bee of beeTasks) {
    const beeTask = createBeeTask(task, bee.subTask)
    appendEvent(taskId, 'bee_start', {beeId:beeTask.id, question:bee.subTask.question})
    runTask(beeTask.id)
  }
  
  // 3. Listen bees → Queen (event driven)
  // 当所有bee done → runQueen
}

async function runQueen(taskId) {
  const task = getTask(taskId)
  const pollens = task.swarm.pollenDB.pollens
  // Queen聚合
  const report = await chatCompletion(queenPrompt(pollens))
  updateTask(taskId, {swarm:{...task.swarm, queenReport:report, status:'done'}})
  appendEvent(taskId, 'honey_report', report)
  
  // Gene沉淀
  const genes = pollenDB.toGenes()
  appendEvent(taskId, 'gene_born', genes)
}
```

### 5.3 前端新增 `SwarmView.jsx`（抄EvoX三栏）

**布局**：
- 左：会话和项目 + Gene列表（带GDI评分）+ Marketplace搜索 + 1500额度进度条
- 中：对话框 + Swarm开关 + 模型切换（ChatGPT/Kimi/Grok/DeepSeek）+ 复杂问题输入 + 拖拽文件区
- 右：蜂巢可视化执行面板
  - 中心蜂王 + 周围工蜂动画（跳摇摆舞）
  - 每工蜂卡片：问题、角色、状态、置信度进度条、GDI、deliverable预览、报错自改过程
  - 花粉库：证据流时间轴，每条带source可点
  - 冲突区：标红冲突，验证蜂介入
  - 蜂蜜报告：单HTML预览，可直接下载发同事

**交互**：
- 侦查蜂分解后，用户可编辑子任务（人机协作，解决卡住）
- 工蜂卡片可点进详情，看claim+evidence+confidence
- Gene可一键安装复用
- 额度实时可见，心里有数

**可视化**：SVG蜂巢，工蜂飞行动画，摇摆舞路径

---

## 6. 场景化案例库 v2（用视频真实案例）

### 案例1：本地大模型显存计算器（视频原案例，蜂群版）

**复杂问题**：
> 玩本地部署，32B模型Q4量化上下文32K，我这张卡到底能不能跑？要一个单文件页面打开就能算，不用联网，4输入实时结果暗黑界面

**侦查蜂分解**：
1. sub-1 [fact] 显存计算公式：参数量*量化精度+上下文*KV缓存 公式研究 → 搜索蜂
2. sub-2 [analysis] 前端实现：单HTML、4输入、滑动条实时计算 → 分析蜂
3. sub-3 [judgment] 边界测试：32B Q4 32K算出卡在边缘，测试 → 验证蜂
4. sub-4 [idea] 配色优化：暗黑界面配色不算好看，改一版 → 案例蜂（配色方案）

**工蜂并行**（2分钟）：
- bee-1 搜索：公式 参数量*2字节 + 上下文*KV，evidence 3条，confidence 0.9，GDI 90
- bee-2 分析：单HTML实现，input+slider+实时计算，deliverable calculator.html，confidence 0.85
- bee-3 验证：输入32B Q4 32K算出22GB，卡在24GB边缘，confidence 0.88
- bee-4 案例：暗黑配色 #0A0A0A + 荧光绿，参考健身App配色，confidence 0.8

**花粉库**：4条pollen，无冲突

**蜂王聚合**：Honey Report = calculator.html + 公式说明 + 边界说明 + 配色二版，置信度0.86，GDI 88，Gene沉淀“单页工具生成”

**前后对比**：第一次试错好几轮，第二次复用Gene更快，验证自进化

### 案例2：100页AI报告变可视化报告（视频原案例，蜂群版）

**复杂问题**：
> 几份AI行业报告+几个网页100多页，正常读一天，提炼核心观点做对比表格输出带动态图表网页而非干巴文字，单HTML可发同事

**侦查蜂分解**：
1. sub-1 [fact] 逐份读：100页逐份提取核心观点 → 搜索蜂（5个并行，每个20页）
2. sub-2 [analysis] 观点归并：归并核心观点去重 → 分析蜂
3. sub-3 [analysis] 对比表格：不同家横向对比表格 → 分析蜂
4. sub-4 [visual] 动态图表：可点可筛选图表，Chart.js → 分析蜂
5. sub-5 [visual] 单HTML打包：单文件可发 → 案例蜂

**工蜂并行**（几分钟）：
- bee-1-5 搜索：各读20页，提取观点，evidence带页码，confidence 0.8
- bee-6 分析：归并10个核心观点，confidence 0.85
- bee-7 分析：对比表格5家*6维度，confidence 0.88
- bee-8 分析：动态图表可筛选，deliverable chart.html，confidence 0.9
- bee-9 案例：单HTML打包，含图表，confidence 0.92

**花粉库**：9条pollen，1冲突（两份报告数据不一致），触发验证蜂

**蜂王聚合**：Honey Report三段式：上核心结论3条/中对比表格/下动态图表可筛选，证据链带source，冲突说明，置信度0.87，GDI 90

**价值**：把杂乱变可直接交出去的东西，以前人力硬扛现在丢给它

### 案例3：社区咖啡馆50w可行性（新增，展示蜂群）

**复杂问题**：安福路社区咖啡馆50w预算可行性

**分解**：人流竞品/预算分配/客单基准/人群画像/Slogan定位 5工蜂

**聚合**：月营收15w，6个月回本，风险竞品多需差异化“把早晨交给我们”

---

## 7. 零门槛与商业化（抄EvoX）

**零配置**：
- Mac/Win客户端，装完即用，无需API Key
- 默认1500免费额度，白嫖跑一遍，觉得顺手再订阅或上自己Key
- 一键迁移Claude Code/Codex记忆，不用从头来

**额度设计**：
- 界面可见额度消耗，心里有数
- 复杂任务蜂群并行消耗快，需提示
- 重活消耗不算慢，长期需订阅

**自进化商业化**：
- Gene Marketplace：全网分享，GDI评分，优质Gene可付费
- 越用越顺手，站在别人跑通经验上开工

---

## 8. 技术选型 v2

- **LLM**：复用`llm.js` chatCompletion，支持ChatGPT/Kimi/Grok/DeepSeek切换，同任务效果有差别
- **向量库**：内存cosine + Chroma，pollen检索
- **调度**：Node.js async queue，DAG拓扑排序，ABC算法+GDI
- **存储**：`store.js` db.json，swarm字段持久化，Gene本机存储
- **前端**：React + SVG蜂巢动画 + Chart.js动态图表，复用现有组件，三栏布局
- **可观测**：每工蜂独立event流，SSE推送，右边面板真干活过程可见，报错自改
- **交付物**：单文件HTML，离线可用，发出去不用管

---

## 9. 里程碑 v2

**MVP 1周（解决视频Swarm不稳）**：
- Day1-2：Decomposer 3策略 + PollenDB冲突检测 + GDI评分
- Day3-4：Worker Bee 4角色 + 真干活（建文档跑命令改代码）+ 摇摆舞协议 + 报错自改
- Day5：Queen聚合 + 冲突解决 + Honey Report单HTML模板（上结论中表格下图表）
- Day6：前端SwarmView三栏 + 蜂巢可视化 + Gene列表 + Marketplace + 额度进度
- Day7：集成测试 + 两个视频案例PoC + 前后对比验证自进化

**V2 2周**：
- 人机协作：分解后用户可编辑子任务，解决卡住需返工
- 渠道接入：Slack/Telegram/Discord/WhatsApp + 定时任务早报推送
- 基因市场：全网Gene分享，GDI评分，复用
- 零配置：1500额度 + 一键迁移

---

## 10. 优势与风险 v2（实话实说版）

**优势（好的地方）**：
- 零配置1500额度0门槛，新手直接跑，白嫖
- 真动手干活非吐文字，建文档跑命令改代码每步可见，报错自改
- 复杂变简单并行加速3-5倍，100页报告几分钟变可交付网页
- 置信度可解释证据链完整，单HTML可直接发同事
- 自进化Skills + Gene + GDI + Marketplace，越用越顺手，站在别人经验上开工，解决失忆痛点
- 蜂群学习：pollen沉淀为技能，下次更快试错少，前后对比直观证据
- 多渠道+定时推送，实时热门新闻省事

**风险与不足（坏的地方实话实说）**：
- Beta版本，复杂任务偶尔卡住需返工 → 解决：人机协作编辑子任务 + 验证蜂 + 冲突检测
- 免费额度跑重活消耗不算慢 → 解决：额度可见 + 限流 + 缓存pollen
- 沉淀技能质量参差 → 解决：GDI评分 + 人工审核 + 复用次数加权
- 界面配色不算好看 → 解决：复用配色方案casedata
- 工蜂幻觉 → 解决：验证蜂反证 + 置信度过滤 + 证据必须带source
- 分解质量决定上限 → 解决：3策略 + 人工复核 + 逐份读

**金句**：
- “它不是聊天机器人给你吐一段文字就完了，它是真的在你的电脑上建立文档跑命令改代码”
- “出错了它会自己回头改，而不是把一大堆代码甩给你自己去调”
- “从一句话到一个真正能用的东西，中间我一行代码都没写”
- “把杂乱材料变成一份能直接交出去的东西，这个环节以前都是人力硬扛的”
- “每次对话都是失忆状态，你教它100遍它还是新手” → Gene解决
- “它至少在往越用越顺手的方向做”
- “蜂群不是更聪明的蜜蜂，而是更好的协作。一只蜜蜂找不到最优蜜源，一群蜜蜂可以。”

---

## 11. 下一步行动

1. **确认MVP**：是否在`apps/server/src/swarm.js` + `SwarmView.jsx`落地？ 
2. **PoC选**：先用视频两个案例做PoC，显存计算器和100页报告
3. **原型**：设计三栏UI + 蜂巢动画 + Gene市场
4. **文档**：本方案 + 提取文档已备好，可直接给团队

---

> 装完能干活，不用折腾配置，丢给它就能搞定，越用越顺手 — 这就是蜂群。
