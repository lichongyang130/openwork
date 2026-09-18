/* 案例引擎：分类元信息 + 紧凑记录构造器 + 版式/配色/背景定义 */

export const PALS = {
  gold:  { a: '#b08a3e', bg: '#f6ecd7', card: '#fffdf7', ink: '#4c3a17' },
  blue:  { a: '#3f6fae', bg: '#e8eef7', card: '#fbfdff', ink: '#22406b' },
  green: { a: '#2e7d5f', bg: '#e6f2ec', card: '#fbfffd', ink: '#1c5240' },
  red:   { a: '#b3453c', bg: '#f7e9e7', card: '#fffbfa', ink: '#6e2a24' },
  purple:{ a: '#6b53a8', bg: '#efeaf7', card: '#fdfcff', ink: '#43307a' },
  cyan:  { a: '#1f7f8c', bg: '#e4f2f4', card: '#fbffff', ink: '#14555e' },
  orange:{ a: '#c96f2a', bg: '#f9ede2', card: '#fffdf9', ink: '#7c421a' },
  ink:   { a: '#4a4a48', bg: '#efeeec', card: '#fdfdfc', ink: '#2b2b29' },
};
export const palStyle = (p) => {
  const x = PALS[p] || PALS.gold;
  return { '--pa': x.a, '--pbg': x.bg, '--pcard': x.card, '--pink': x.ink };
};

/* 12 种版式：每个案例独占一种呈现方式 */
export const LAYOUTS = ['dash', 'doc', 'chat', 'compare', 'timeline', 'gallery', 'terminal', 'sheet', 'mail', 'kanban', 'poster', 'mind'];
/* 6 种背景质感 */
export const BGS = ['grid', 'dots', 'mesh', 'paper', 'dark', 'linen'];

/* 紧凑案例记录：t标题 sub副标 d一句话 ly版式 pal配色 bg背景 facts[3] inp输入样例 out[3]输出样张 stats[3] quote点评 fb[角色,反馈] risk避坑 */
export const C = (t, sub, d, ly, pal, bg, facts, inp, out, stats, quote, fb, risk) =>
  ({ t, sub, d, ly, pal, bg, facts, inp, out, stats, quote, fb, risk });

/* 分类配图（详情页特色样张） */
export const IMAGES = {
  'office:写工作周报': '/samples/office-weekly.jpg',
  'office:会议纪要整理': '/samples/office-minutes.jpg',
  'office:邮件草拟': '/samples/office-email.jpg',
  'office:文件整理': '/samples/office-files.jpg',
  'office:发票报销整理': '/samples/office-invoice.jpg',
  'office:合同要点审查': '/samples/office-contract.jpg',
  'office:通知/公告拟稿': '/samples/office-notice.jpg',
  'office:日程安排': '/samples/office-schedule.jpg',
  'code:代码审查': '/samples/code-review.jpg',
  'code:Bug 诊断': '/samples/code-bug.jpg',
  'code:写单元测试': '/samples/code-test.jpg',
  'code:生成 README': '/samples/code-readme.jpg',
  'code:脚本自动化': '/samples/code-script.jpg',
  'code:SQL 写与优化': '/samples/code-sql.jpg',
  'code:重构建议': '/samples/code-refactor.jpg',
  'code:正则生成': '/samples/code-regex.jpg',
  'design:海报文案': '/samples/design-poster.jpg',
  'design:小红书笔记': '/samples/design-note.jpg',
  'design:PPT 大纲': '/samples/design-ppt.jpg',
  'design:短视频脚本': '/samples/design-video.jpg',
  'design:品牌 Slogan': '/samples/design-slogan.jpg',
  'design:活动策划': '/samples/design-event.jpg',
  'design:UI 文案优化': '/samples/design-uxcopy.jpg',
  'design:配色方案': '/samples/design-palette.jpg',
};

/* 24 个分类的元信息 */
export const META = {
  'office:写工作周报':   { en: 'Weekly Report',  emo: '📋', cover: 'report',   expert: '办公写作专家', prompt: '读取本周工作记录，生成「完成 / 数据 / 计划」三段式工作周报，结论先行，语气专业简洁' },
  'office:会议纪要整理': { en: 'Meeting Minutes', emo: '🗂', cover: 'doc',      expert: '会议管理专家', prompt: '整理会议纪要：先列决策，再列待办（负责人+截止时间），最后附讨论要点，结论先行' },
  'office:邮件草拟':     { en: 'Email Drafting', emo: '✉️', cover: 'mail',     expert: '商务沟通专家', prompt: '根据要点草拟一封商务邮件：主题明确、分段清晰、结尾带明确行动请求' },
  'office:文件整理':     { en: 'File Organize',  emo: '📁', cover: 'folder',   expert: '知识管理专家', prompt: '给出一套文件命名与目录归档规则，并把我这份清单按规则重命名分类' },
  'office:发票报销整理': { en: 'Invoice Sort',   emo: '🧾', cover: 'table',    expert: '财务流程专家', prompt: '整理报销票据：按类别归组、校验金额与抬头、生成可提交的报销清单' },
  'office:合同要点审查': { en: 'Contract Review',emo: '⚖️', cover: 'review',   expert: '法务风控专家', prompt: '审查这份合同的要点：标出风险条款、缺失项与谈判建议，按严重度排序' },
  'office:通知/公告拟稿':{ en: 'Notice Draft',   emo: '📢', cover: 'doc',      expert: '行政公文专家', prompt: '起草一则内部通知：事由清楚、安排具体、语气正式不冗长' },
  'office:日程安排':     { en: 'Schedule Plan',  emo: '🗓', cover: 'timeline', expert: '时间管理专家', prompt: '根据任务清单和约束条件，排出今天/本周的日程：要事优先、留缓冲' },
  'code:代码审查':       { en: 'Code Review',    emo: '🔍', cover: 'review',   expert: '代码质量专家', prompt: '审查这段代码：按严重度列出问题（缺陷/安全/可读性），给出修改示例' },
  'code:Bug 诊断':       { en: 'Bug Triage',     emo: '🐞', cover: 'code',     expert: '调试诊断专家', prompt: '根据报错信息和代码片段定位 Bug：给出根因分析、修复方案与回归验证步骤' },
  'code:写单元测试':     { en: 'Unit Test',      emo: '🧪', cover: 'code',     expert: '测试工程专家', prompt: '为这个函数写单元测试：覆盖正常/边界/异常路径，用项目现有测试框架' },
  'code:生成 README':    { en: 'README Gen',     emo: '📖', cover: 'doc',      expert: '开发者关系专家', prompt: '根据仓库结构和入口文件生成 README：简介、安装、快速上手、目录说明' },
  'code:脚本自动化':     { en: 'Script Auto',    emo: '⚙️', cover: 'code',     expert: '自动化工程专家', prompt: '把我的重复操作写成脚本：说明输入输出、加日志与失败重试' },
  'code:SQL 写与优化':   { en: 'SQL Optimize',   emo: '🗃', cover: 'table',    expert: '数据库专家', prompt: '写这条查询并优化：解释执行计划思路、给出索引建议与改写版本' },
  'code:重构建议':       { en: 'Refactor Plan',  emo: '🧩', cover: 'code',     expert: '架构重构专家', prompt: '分析这段代码的坏味道，给出分步重构方案：每步可独立验证、风险可控' },
  'code:正则生成':       { en: 'Regex Builder',  emo: '🧵', cover: 'code',     expert: '文本处理专家', prompt: '根据描述和样例生成正则表达式：解释每段含义，给出匹配/不匹配用例' },
  'design:海报文案':     { en: 'Poster Copy',    emo: '🎨', cover: 'poster',   expert: '品牌文案专家', prompt: '为这张海报写主标题、副标题与行动按钮文案：短、有画面感、突出利益点' },
  'design:小红书笔记':   { en: 'RedNote Post',   emo: '📕', cover: 'doc',      expert: '社媒内容专家', prompt: '写一篇小红书笔记：标题带关键词、正文分段+口语化、结尾带话题标签' },
  'design:PPT 大纲':     { en: 'PPT Outline',    emo: '📽', cover: 'slides',   expert: '结构化表达专家', prompt: '把材料整理成 PPT 大纲：每页一个观点、标题即结论、要点不超过 3 条' },
  'design:短视频脚本':   { en: 'Video Script',   emo: '🎬', cover: 'slides',   expert: '短视频编导', prompt: '写一个 60 秒短视频脚本：黄金 3 秒开头、分镜画面、口播与字幕' },
  'design:品牌 Slogan':  { en: 'Brand Slogan',   emo: '💎', cover: 'poster',   expert: '品牌策略专家', prompt: '为品牌写 5 条 Slogan：好记、有画面感，附使用场景与查重提示' },
  'design:活动策划':     { en: 'Event Plan',     emo: '🎪', cover: 'timeline', expert: '活动运营专家', prompt: '策划一场活动：主题、流程时间轴、物料清单、预算粗估与风险预案' },
  'design:UI 文案优化':  { en: 'UX Writing',     emo: '✍️', cover: 'review',   expert: 'UX 写作专家', prompt: '优化界面文案：按钮、空态、报错提示，语气友好、无歧义、可扫读' },
  'design:配色方案':     { en: 'Color Scheme',   emo: '🎨', cover: 'palette',  expert: '视觉设计专家', prompt: '按主题给出 3 组配色：主色/辅助色/点缀色 + 使用场景与对比度提示' },
};
