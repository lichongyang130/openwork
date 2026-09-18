import React, { useMemo, useState } from 'react';
import { api } from '../api.js';
import { IcUsers, IcBolt, IcPlug, IcSearch, IcPlus, IcRefresh, IcUser, IcCheck, IcX } from '../icons.jsx';

/* ---------------- 数据 ---------------- */
const SCENES = [
  { t: '开学季', g: 'linear-gradient(160deg,#cfe6cf,#8fc1a9)', rows: [['🧑‍', '校园求职教练'], ['📚', '论文写作导师'], ['🎪', '校园活动策划与执行顾问']] },
  { t: '内容创作', g: 'linear-gradient(160deg,#dbe7f5,#a9c3e0)', rows: [['✍️', '内容创作专家团'], ['🖋️', '内容创作专家'], ['📕', '小红书运营专家']] },
  { t: '投资分析', g: 'linear-gradient(160deg,#e8e3d8,#c9bfa8)', rows: [['📈', '交易分析团队'], ['💹', '股票研究专家'], ['🐂', '腾讯自选股股票投研专家团']] },
  { t: '法律咨询', g: 'linear-gradient(160deg,#efe0c8,#d9bd93)', rows: [['⚖️', '法律检索专家'], ['📜', '资深合同法务专家'], ['🧾', '财税合规专家团']] },
  { t: '小微企业', g: 'linear-gradient(160deg,#e3e3e3,#c2c2c2)', rows: [['💼', '销售教练'], ['📱', '微信公众号运营专家'], ['🚀', '创业伙伴']] },
  { t: '电商运营', g: 'linear-gradient(160deg,#f5e3e0,#e0bcb6)', rows: [['🛒', '中国电商运营专家'], ['🌏', '跨境电商专家'], ['💰', '内容变现商业化专家团']] },
  { t: '数据分析', g: 'linear-gradient(160deg,#dfe9f7,#b4c9ea)', rows: [['📊', '数据分析及可视化专家'], ['🧮', '报表自动化专家']] },
];

const EXP_CATS = ['全部', 'OPC·一人公司', '开学季', '高校新生攻略', '腾讯专家', '产品设计', '技术工程', '金融投资', '全球发展', '教育学习', '游戏空间', '数据智能', '营销增长', '内容创作', '销售商务', '运营人力', '项目质量', '法务安全', '行业顾问'];
const EXPERTS = [
  { n: '教学设计总顾问-企鹅教师助手', o: '企鹅教师助手', d: '由腾讯SSW与北京大学联合打造的教学设计与备课的智能统筹。智能匹配最懂专家团与教法专家，规划协作顺序，统一交付口径。', tags: ['教学设计', '课件与动画', '教案与提问'], c: '教育学习', av: '🐧', bg: '#e3ecf7' },
  { n: '高级开发工程师', o: '吴八哥', d: '10年以上全栈经验，精通多种语言和框架，以严谨的工程纪律交付可运行的高质量代码', tags: ['全栈开发', '架构设计', '代码质量'], c: '技术工程', av: '👨‍💻', bg: '#f3e3d8' },
  { n: '美团生活助手', o: '40-20外卖券', d: '帮您一键领取美团优惠券（前3天必得40-20，每日必得38-16外卖券），搜索附近团购美食下单', tags: ['美团优惠', '团购下单', '生活服务'], c: 'OPC·一人公司', av: '🛵', bg: '#fdf3d8' },
  { n: '微信小程序开发者', o: '小程序达', d: '精通微信小程序开发框架和生态，打造流畅微信原生体验应用', tags: ['小程序开发', '微信生态', 'WXML开发'], c: '技术工程', av: '🧑💻', bg: '#e2f2e2' },
  { n: '自适应成果交付专家', o: '超级合伙人', d: '作为一个靠谱的AI合伙人，我的责任是把你的想法和素材，变成看得见、用得上的高价值产出。', tags: ['成果交付', '经营决策', '研究创作'], c: 'OPC·一人公司', av: '🌌', bg: '#e6e2f5' },
  { n: '资讯速递专家', o: '数字生命卡兹克', badge: '特邀专家', d: '一句话查到每天精选的 AI 模型/产品/行业/论文动态，自动整理成中文简报，免配置免登录。', tags: ['AI 资讯', '每日播报', 'AI 行业动态'], c: '数据智能', av: '🌐', bg: '#e0e6f2' },
  { n: 'Godot游戏脚本工程师', o: '节点通', d: '精通GDScript 2.0和Godot 4 节点架构', tags: ['脚本工程', '游戏逻辑', 'GDScript'], c: '游戏空间', av: '🎮', bg: '#e2e8f2' },
  { n: '嵌入式固件工程师', o: '固件通', d: '精通微控制器编程，在资源受限的硬件上编写高效可靠的固件代码', tags: ['嵌入式固件', 'RTOS开发', '物联网硬件'], c: '技术工程', av: '', bg: '#f0e6da' },
  { n: '创业伙伴', o: '林正刚', d: '林老师分身+读书伙伴。送《创业可以学》，陪创业者读书，从读书中听痛点，痛点匹配时自然引出课程咨询。', tags: ['创业判断', 'GTM落地', '客户心法'], c: 'OPC·一人公司', av: '🧭', bg: '#fdf0e0' },
  { n: '工作台搭建师', o: '小白', d: '为不同人群定制专属数字工作台，覆盖学习备考、职场效率、自媒体创作、宝妈育儿、生活管理五大场景。', tags: ['工作台搭建', '响应式网页', '个人效率工具'], c: '产品设计', av: '🧑🔧', bg: '#e3e9f5' },
  { n: '长文档写作与改稿专家', o: '福帮手', d: '把混杂文档、扫描件、图片、表格与旧稿整理为可续接、可追溯、可审阅、可交付的长文档成果。', tags: ['长文档工程', '多场景创作', '证据与审校'], c: '内容创作', av: '🖋️', bg: '#dff0ea' },
  { n: '战略咨询合伙人', o: '战略咨询顾问', d: '假设驱动的战略顾问，按需破题、取证、测算与撰写，产出证据扎实的决策报告与专业级PPT', tags: ['战略分析', '决策备忘录', 'PPT/测算交付'], c: '销售商务', av: '🤵', bg: '#e8e4f2' },
  { n: '全栈开发专家', o: '鹅厂信息AI专家', d: '全栈开发专家，精通前后端架构与接口集成，覆盖需求澄清、代码实现、测试验证到生产加固，一站式交付。', tags: ['全栈开发', '后端架构', '接口集成'], c: '腾讯专家', av: '👨‍', bg: '#e0ecf7' },
  { n: '项目来了，先把路理清', o: 'MAI Lab拍卖Agent', d: '材料可以很乱，交易不能乱：先看清阶段、缺口和下一步，再画结构、核数字、整理报告。', tags: ['项目拆解', '交易结构图', '买方与资金对接'], c: '项目质量', av: '🧑‍💼', bg: '#efe6dc' },
  { n: '实习任务与成长协作专家', o: '实习易', d: '帮助学生、社会导师、单位和教师完成实习任务，提炼可复用方法，核验个人贡献与成长证据并做好交接。', tags: ['实习任务', '成果验收', '能力成长'], c: '高校新生攻略', av: '🎒', bg: '#e2f0df' },
  { n: '合同审查专家', o: '法务通', d: '逐条审查合同风险，标注权责不对等与缺失条款，输出修订建议与谈判要点。', tags: ['合同审查', '风险提示', '修订建议'], c: '法务安全', av: '⚖️', bg: '#f2e6e0' },
];

const SK_CATS = ['全部', 'OPC·一人公司', '办公协同', '开发工具', '投资理财', '效率工具', '内容创作', '信息资讯', '教育学习', '数据分析', '网站部署', '生活服务', '商业运营', '知识与学习'];
const FEATURED_SKILLS = [
  { n: '腾讯微云', d: '管理腾讯微云网盘文件（列表、上传、下载、删除、分享）', ic: '☁️', bg: '#3b82f6' },
  { n: '腾讯问卷', d: '腾讯问卷操作（创建、修改、逻辑设置、统计）', ic: '✅', bg: '#22c55e' },
  { n: '鹅厂辟谣助手', d: '面向腾讯相关谣言的辟谣辅助 Skill，结合内部参考与实时联网核查，给出结论、事实依据和防诈提醒。', ic: '🐧', bg: '#1c1b18' },
  { n: '腾讯会议', d: '腾讯会议管理助手，支持预约/创建/修改/取消会议、查询录制与转写、获取AI智能纪要', ic: '🎥', bg: '#2563eb' },
  { n: '腾讯电子签合同助手', d: '腾讯电子签AI助手，支持合同起草、审查、对比、签署、查看、法条检索、审查列表等', ic: '📝', bg: '#14b8a6' },
];
const SKILLS = [
  { n: 'AI交付前全自动自检技能', d: 'AI交付前全自动自检技能，任何一次向用户交付结果（present_files、最终总结、结论、状态汇报）前自动体检。', ic: '🛡️', bg: '#1e3a5f', c: '效率工具' },
  { n: 'NeoData金融搜索服务', d: '自然语言查询股票、基金、宏观、外汇、大宗商品等金融数据', ic: '🌀', bg: '#3b5bdb', c: '投资理财' },
  { n: 'Excel 表格处理', d: '创建、编辑、分析 Excel 表格：公式、图表、透视表与格式设置。', ic: '📗', bg: '#16a34a', c: '办公协同' },
  { n: 'Web Access（浏览器自动化）', d: 'CDP 直连本地 Chrome，智能调度联网工具，支持登录态、并行批量操作', ic: '🌐', bg: '#4f46e5', c: '开发工具' },
  { n: 'PPT 演示文稿', d: '创建、读取、编辑 .pptx/.potx 演示文稿：幻灯片、版式、备注与模板。', ic: '📽️', bg: '#dc2626', c: '办公协同' },
  { n: 'QQ音乐助手', d: 'QQ音乐官方智能助手，支持歌曲搜索、每日推荐、AI歌单、排行榜、听歌报告与AI音乐解读。', ic: '🎵', bg: '#facc15', c: '生活服务' },
  { n: 'PDF 文档处理', d: 'PDF 文档处理工具，支持文本与表格提取、PDF 创建、合并拆分、表单填写及批量分析。', ic: '📄', bg: '#84cc16', c: '办公协同' },
  { n: 'MarkItDown', d: '文档转 Markdown(PDF/Word/PPT/图片OCR/音频转写/网页)', ic: 'Ⓜ️', bg: '#f59e0b', c: '开发工具' },
  { n: '技能创建指南', d: '创建和维护自定义技能的指南', ic: '技', bg: '#fde8e8', c: '开发工具' },
  { n: '润泽小馆·日报撰写', d: '撰写简洁清晰的工作日报。', ic: '润', bg: '#fce7f3', c: '内容创作' },
  { n: 'fbs-bookwriter', d: '福帮手出品 | 高质量长文档手册工具链：书籍、手册、白皮书、行业指南、长篇报道、深度专题', ic: '📘', bg: '#38bdf8', c: '内容创作' },
  { n: '公众号排版引擎', d: '微信公众号文章排版引擎，将 Markdown / Word / PDF / 纯文本一键转换为可直接复制粘贴到公众号编辑器的图文。', ic: '公', bg: '#ede9fe', c: '内容创作' },
  { n: 'MiniMax H3 提示词编写', d: '为 T2VA、I2VA、FL2VA、L2VA 和 Ref2VA 编写 MiniMax H3 视频生成提示词，用于将多模态请求重构。', ic: '🎬', bg: '#fecaca', c: '内容创作' },
  { n: 'Excel 文件处理', d: 'Excel 文件创建与分析', ic: '📊', bg: '#15803d', c: '数据分析' },
  { n: '创业可以学', d: '服务创业者和管理者，解答创业/商业/管理问题，引发深度思考', ic: '🚀', bg: '#fff7ed', c: 'OPC·一人公司' },
  { n: 'Word 文档生成', d: 'Word 文档生成与编辑', ic: '', bg: '#2563eb', c: '办公协同' },
  { n: '钉钉套件', d: '钉钉 CLI 套件，覆盖消息、日历、待办、审批、考勤、日志、文档、AI 表格、钉盘、AI 听记、邮箱等', ic: '📌', bg: '#3b82f6', c: '办公协同' },
  { n: 'grill-me', d: '深度追问式方案审查：逐层拆解设计决策，直到达成共识', ic: '🔥', bg: '#f3f4f6', c: '效率工具' },
  { n: 'A股全栈数据', d: 'A 股行情、研报、资金流、公告与财报查询工具包。', ic: '', bg: '#fee2e2', c: '投资理财' },
  { n: 'IMAP/SMTP邮件', d: '通过 IMAP/SMTP 收发邮件，支持多账户和附件', ic: '✉️', bg: '#ef4444', c: '办公协同' },
  { n: 'Karpathy行为准则', d: '减少LLM编码常见错误的行为准则。写代码、审查或重构时使用，避免过度复杂、做手术式修改。', ic: '🧠', bg: '#e0e7ff', c: '开发工具' },
  { n: '马尾辫·懒资深开发模式', d: '让 AI 按「屋里最懒的资深开发」的方式写代码：动手前先走七级阶梯——这件事需要存在吗（YAGNI）', ic: '', bg: '#dcfce7', c: '开发工具' },
  { n: '腾讯ima', d: 'ima笔记与知识库管理（读取、写入、检索）', ic: '📒', bg: '#fef9c3', c: '知识与学习' },
  { n: 'Tushare', d: 'Tushare 金融数据服务，支持 A股、指数、ETF/基金、财务、估值、资金流、公告新闻、板块概念与宏观数据等研究', ic: '💰', bg: '#fffbeb', c: '投资理财' },
  { n: 'GitHub', d: '在 GitHub 上克隆、推送代码，查看和管理仓库与 Pull Request，用自然语言完成代码协作。', ic: '🐙', bg: '#111827', c: '开发工具' },
  { n: 'Notion', d: '创建、搜索和管理 Notion 工作区。用自然语言读取页面、查询数据库、更新内容、整理知识库。', ic: '🗂️', bg: '#f9fafb', c: '知识与学习' },
  { n: '网站部署', d: '将静态站点一键部署到 EdgeOne Pages，返回可分享的线上访问地址。', ic: '🚀', bg: '#0ea5e9', c: '网站部署' },
  { n: '教育学习规划', d: '为学生定制学期/假期学习规划，拆解目标、排期与复盘模板。', ic: '🎓', bg: '#e0f2fe', c: '教育学习' },
];

const CONNS = [
  ['通达信', '通过通达信 MCP 查询全球股票行情数据、条件选股、研究报告、公告资讯和宏观信息。', '#e11d48'],
  ['腾讯自选股', '直连腾讯自选股，实时掌握毫秒级行情与资金动态，用自然语言分析自选数据、设置股价提醒。', '#ef4444'],
  ['QQ邮箱', '收发、搜索和整理 QQ 邮件。用自然语言读取邮件内容、汇总邮件线程、管理文件夹。', '#f59e0b'],
  ['ima', '腾讯AI知识管家，连接后支持搜索、读取和写入知识库资料，并可搜索和订阅教育、法律、财经、科技等20+行业专业知识', '#84cc16'],
  ['乐享知识库', '搜索、创建和管理乐享知识库中的文档。支持导入 Markdown、按标签整理内容、追踪团队文档的更新动态。', '#3b82f6'],
  ['腾讯文档', '创建、编辑和协作腾讯文档。用自然语言管理在线表格、文档和幻灯片，轻松完成内容查询、数据整理和团队协同。', '#2563eb'],
  ['腾讯会议', '通过命令行创建、查询和管理腾讯会议。支持快速发起会议、查看日程安排、管理参会人员。', '#1d4ed8'],
  ['企业微信', '企业微信官方 CLI 套件，覆盖消息、邮件、文档、待办、日程、会议、微盘、通讯录等业务功能。', '#0ea5e9'],
  ['飞书', '通过命令行管理飞书/Lark 全产品能力：即时通讯、邮箱、日历、云文档、电子表格、多维表格（Base）、幻灯片等。', '#38bdf8'],
  ['钉钉', '通过命令行管理钉钉全产品能力：AI 表格、考勤、日历、群聊与机器人、通讯录、开放平台文档、DING 消息等。', '#4f46e5'],
  ['腾讯问卷', '创建、管理和分析腾讯问卷。用自然语言快速生成问卷、查看回收数据、设置题目逻辑。', '#22c55e'],
  ['TAPD', '管理需求、缺陷、任务和迭代。查询项目进度、拆分需求、流转状态、填写工时，覆盖研发全生命周期。', '#6366f1'],
  ['CNB', '通过自然语言管理 CNB 平台：仓库、Issue、PR、流水线、制品库等操作。', '#f97316'],
  ['微云', '查看、下载、删除微云文件，并且提供上传文件到微云、生成分享链接能力，帮你管理微云文件', '#3b82f6'],
  ['福帮手', '福帮手人机协同连接器：识别当前身份与专家入口、匹配可执行场景方案、记录首值与后续使用进展。', '#60a5fa'],
  ['金山文档', '创建、搜索和管理金山文档（WPS 云文档），支持新建多种文档类型（Word/Excel/PDF/PPT/智能表格等）。', '#2563eb'],
  ['北大法宝·法律智能检索', '检索+核验一体：语义（自然语言描述）与关键词双模式检索法规、法条与司法案例，并可把文本中的法条引用与案号核验。', '#b91c1c'],
  ['企查查', '查询和核实企业工商登记信息，支持股权穿透、实际控制人、受益所有人、高管团队、对外投资、财务数据、年报等。', '#f97316'],
  ['天眼查', '通过天眼查 MCP 查询多维度企业数据，支持工商登记、股东结构、司法风险、知识产权、覆盖高、经营数据等 160+ 项。', '#0284c7'],
  ['百度网盘', '连接百度网盘，支持文件与分类浏览、关键词及语义检索、文件和文件夹管理、创建分享链接、查询容量等。', '#2563eb'],
  ['Tushare', 'Tushare 金融数据服务，支持 A股、指数、ETF/基金、财务、估值、资金流、公告新闻、板块概念与宏观数据等研究', '#f59e0b'],
  ['邓白氏查全球', '通过自然语言查询邓白氏全球企业档案、财务数据、风险洞察、企业关联及最终受益人（UBO）等商业洞察。', '#0f766e'],
  ['新华财经资讯MCP', '公告、新闻、政策数据，包含股票资讯、板块资讯、热点新闻、资讯搜索、大宗快讯、外汇快讯、股票快讯、公告关键信息。', '#1d4ed8'],
  ['GitHub', '在 GitHub 上克隆、推送代码，查看和管理仓库与 Pull Request，用自然语言完成代码协作。', '#111827'],
  ['Notion', '创建、搜索和管理 Notion 工作区。用自然语言读取页面、查询数据库、更新内容、整理知识库。', '#171717'],
  ['腾讯企点客服', '腾讯企点客服连接器：用自然语言处理工单（查询/创建/更新/状态变更）、查询坐席在线与实时接待、检索/拉取客户资料。', '#3b82f6'],
  ['EdgeOne Makers', '将项目部署到 EdgeOne Makers 并返回线上访问地址。支持全栈、云函数、AI Agent 等开发场景。', '#0ea5e9'],
  ['腾讯云 CloudBase', '腾讯云开发 CloudBase 全栈开发、部署、调试与排障连接器，覆盖 Web 应用、微信小程序、uni-app、原生 App。', '#06b6d4'],
  ['Bugly 质量概览', '查看产品的质量概览，包括崩溃率、anr率、room（oom）率、启动耗时', '#2563eb'],
  ['销售易CRM', '用自然语言查客户、搜商机、盘线索、领公海、写跟进，一句话打通销售工作闭环。', '#1d4ed8'],
  ['小鹅通', '用自然语言管理小鹅通店铺：查询课程与学员、创建和编辑课程、查看订单、并查找或上传图片、音频、电子书和文档。', '#2563eb'],
  ['华宇元典法律数据', '华宇元典法律数据为智能体提供法律法规、案例文书、企业信息 MCP 工具能力。', '#0e7490'],
  ['微盛企微管家SCRM', '查询或管理企业微信中的客户信息、客户标签、客户群、营销素材、活动、群发、跟进记录、联系人、商机、汇报等。', '#4f46e5'],
  ['中兴新云AI智报', '财务云 AI 智报助手：用自然语言搞定报销申请、发票查询识别、报销单查询与费用审批处理等。', '#1e40af'],
  ['腾讯营销投放', '腾讯营销投放 Skill，为大模型赋予广告投放管理能力：支持广告账户授权、广告/创投项目的创建与更新、创意管理。', '#3b82f6'],
];

/* ---------------- 页面 ---------------- */
export default function EskPage({ S, refresh, setView }) {
  const [tab, setTab] = useState('experts');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('全部');
  const [onlyInstalled, setOnlyInstalled] = useState(false);
  const [added, setAdded] = useState({});
  const [toast, setToast] = useState('');
  const soon = (m) => { setToast(m); setTimeout(() => setToast(''), 1800); };
  const [sort, setSort] = useState('综合');
  const [myOpen, setMyOpen] = useState(false);
  const [addSk, setAddSk] = useState(false);
  const [addConn, setAddConn] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [hubOpen, setHubOpen] = useState(false);
  const [kitOpen, setKitOpen] = useState(false);
  const [featOff, setFeatOff] = useState(0);
  const [myExperts, setMyExperts] = useState(() => JSON.parse(localStorage.getItem('ow-my-experts') || '[]'));
  const summon = (e) => {
    const list = myExperts.includes(e.n) ? myExperts : [...myExperts, e.n];
    setMyExperts(list);
    localStorage.setItem('ow-my-experts', JSON.stringify(list));
    soon(myExperts.includes(e.n) ? `「${e.n}」已在你的专家列表中` : `已召唤「${e.n}」，可在「我的专家」中查看`);
  };
  const installedCount = (S?.skills || []).filter((s) => s.enabled).length;

  const expertsBase = useMemo(() => EXPERTS.filter((e) => (cat === '全部' || e.c === cat) && (!q || e.n.includes(q) || e.d.includes(q))), [cat, q]);
  const experts = useMemo(() => {
    if (sort === '最热') return [...expertsBase].sort((a, b) => b.tags.length - a.tags.length);
    if (sort === '最新') return [...expertsBase].reverse();
    return expertsBase;
  }, [expertsBase, sort]);
  const featured = useMemo(() => [...FEATURED_SKILLS.slice(featOff), ...FEATURED_SKILLS.slice(0, featOff)], [featOff]);
  const skills = useMemo(() => SKILLS.filter((s) => (cat === '全部' || s.c === cat) && (!q || s.n.includes(q) || s.d.includes(q))), [cat, q]);
  const conns = useMemo(() => CONNS.filter(([n, d]) => !q || n.includes(q) || d.includes(q)), [q]);

  return (
    <div className="esc-wrap">
      <div className="esc-top">
        {[{ id: 'experts', n: '专家', icon: IcUsers }, { id: 'skills', n: '技能', icon: IcBolt }, { id: 'conn', n: '连接器', icon: IcPlug }].map((t) => (
          <button key={t.id} className={`esc-tab ${tab === t.id ? 'on' : ''}`} onClick={() => { setTab(t.id); setCat('全部'); setQ(''); }}>
            <t.icon size={14} /> {t.n}
          </button>
        ))}
        <div className="esc-search">
          <span style={{ position: 'absolute', left: 10, top: 8, color: 'var(--muted2)' }}><IcSearch size={14} /></span>
          <input placeholder={tab === 'experts' ? '搜索专家昵称或描述' : tab === 'skills' ? '搜索技能' : '搜索连接器'} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {tab === 'experts' && <button className="btn-outline" onClick={() => setMyOpen(true)}><IcUser size={14} /> 我的专家 <span className="cnt">{myExperts.length}</span></button>}
        {tab === 'skills' && (
          <>
            <button className={`btn-outline ${onlyInstalled ? 'hl' : ''}`} onClick={() => setOnlyInstalled(!onlyInstalled)}><IcCheck size={14} /> 我安装的 <span className="cnt">{installedCount}</span></button>
            <button className="btn-outline" onClick={() => setAddSk(true)}><IcPlus size={14} /> 添加技能</button>
          </>
        )}
        {tab === 'conn' && <button className="btn-outline" onClick={() => setAddConn(true)}><IcPlus size={14} /> 自定义连接器</button>}
      </div>

      {tab === 'experts' && (
        <>
          <div className="esc-h2">精选场景</div>
          <div className="hscroll">
            {SCENES.map((s) => (
              <div className="scen-card" key={s.t}>
                <div className="scen-cov" style={{ background: s.g }}><b>{s.t}</b></div>
                <div className="scen-body">
                  {s.rows.map(([av, n]) => (
                    <div className="scen-row" key={n}><span className="av" style={{ background: '#e8e6e1' }}>{av}</span>{n}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 12px' }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>专家</span>
            <button className="link-gray" style={{ marginLeft: 18, fontSize: 15 }} onClick={() => setTeamOpen(true)}>专家团</button>
            <div className="seg" style={{ marginLeft: 'auto' }}>
              {['综合', '最热', '最新'].map((x) => <button key={x} className={sort === x ? 'on' : ''} onClick={() => setSort(x)}>{x}</button>)}
            </div>
          </div>
          <div className="chips-row" style={{ margin: '0 0 14px' }}>
            {EXP_CATS.map((c) => (
              <button key={c} className={`chip-card ${cat === c ? 'on' : ''}`} style={{ padding: '6px 13px', borderRadius: 8, background: cat === c ? '#e3e1dd' : 'transparent', border: cat === c ? 'none' : '1px solid transparent' }} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="ex-grid">
            {experts.map((e) => (
              <div className="ex-card" key={e.n}>
                <button className="call-btn" onClick={() => summon(e)}>召唤</button>
                <div className="ex-head">
                  <span className="ex-av" style={{ background: e.bg }}>{e.av}</span>
                  <span style={{ minWidth: 0 }}>
                    <div className="ex-name">{e.n} {e.badge && <span className="badge-gray" style={{ padding: '2px 7px', fontSize: 10.5 }}>🛡 {e.badge}</span>}</div>
                    <div className="ex-org">{e.o}</div>
                  </span>
                </div>
                <div className="ex-desc">{e.d}</div>
                <div className="ex-tags">{e.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'skills' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="esc-h2" style={{ margin: '22px 0 12px' }}>精选技能</div>
            <button className="link-gray" style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center', fontSize: 12.5 }} onClick={() => setFeatOff((v) => (v + 2) % FEATURED_SKILLS.length)}><IcRefresh size={12} /> 换一换</button>
          </div>
          <div className="hscroll">
            {featured.map((s) => (
              <div className="sk-card" key={s.n} style={{ minWidth: 260, maxWidth: 300 }}>
                <div className="sk-head"><span className="sk-ic" style={{ background: s.bg }}>{s.ic}</span><span className="sk-name">{s.n}</span>
                  <button className="plus-sq" onClick={() => soon(`「${s.n}」安装请求已提交`)}><IcPlus size={13} /></button></div>
                <div className="ex-desc" style={{ minHeight: 0 }}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0 12px', gap: 18 }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>推荐</span>
            <button className="link-gray" style={{ fontSize: 15 }} onClick={() => setHubOpen(true)}>SkillHub</button>
            <button className="link-gray" style={{ fontSize: 15 }} onClick={() => setKitOpen(true)}>套件</button>
          </div>
          <div className="chips-row" style={{ margin: '0 0 14px' }}>
            {SK_CATS.map((c) => (
              <button key={c} className="chip-card" style={{ padding: '6px 13px', borderRadius: 8, background: cat === c ? '#e3e1dd' : 'transparent', border: '1px solid transparent' }} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          {onlyInstalled ? (
            <div className="ex-grid">
              {(S?.skills || []).filter((s) => s.enabled).map((s) => (
                <div className="sk-card" key={s.id}>
                  <div className="sk-head"><span className="sk-ic" style={{ background: '#0eb583' }}>⚡</span><span className="sk-name">{s.name}</span>
                    <button className={`switch on`} style={{ transform: 'scale(.8)' }} onClick={async () => { await api.toggleSkill(s.id); refresh(); }} /></div>
                  <div className="ex-desc" style={{ minHeight: 0 }}>{s.desc || s.tag}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ex-grid">
              {skills.map((s) => (
                <div className="sk-card" key={s.n}>
                  <div className="sk-head"><span className="sk-ic" style={{ background: s.bg }}>{s.ic}</span><span className="sk-name">{s.n}</span>
                    <button className="plus-sq" onClick={() => { setAdded((v) => ({ ...v, [s.n]: true })); soon(`「${s.n}」安装请求已提交`); }}>{added[s.n] ? <IcCheck size={13} /> : <IcPlus size={13} />}</button></div>
                  <div className="ex-desc" style={{ minHeight: 0 }}>{s.d}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'conn' && (
        <div className="ex-grid" style={{ marginTop: 18 }}>
          {conns.map(([n, d, color]) => (
            <div className="sk-card" key={n}>
              <div className="sk-head"><span className="sk-ic" style={{ background: color }}>{n[0]}</span><span className="sk-name">{n}</span>
                <button className="plus-sq" onClick={() => soon(`「${n}」连接请求已提交，按引导完成授权`)}><IcPlus size={13} /></button></div>
              <div className="ex-desc" style={{ minHeight: 0 }}>{d}</div>
            </div>
          ))}
        </div>
      )}

      {/* 我的专家 */}
      {myOpen && (
        <div className="am-mask" onClick={() => setMyOpen(false)}>
          <div className="am-dlg" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>我的专家（{myExperts.length}）</h3><button className="iconbtn" onClick={() => setMyOpen(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px' }}>
              {myExperts.length === 0 && <div style={{ color: 'var(--muted)', padding: '22px 0', textAlign: 'center' }}>还没有召唤过专家，去专家列表点「召唤」即可加入</div>}
              {myExperts.map((n) => (
                <div key={n} className="set-row" style={{ padding: '12px 0' }}>
                  <div className="tt" style={{ fontSize: 14 }}>{n}</div>
                  <button className="link-gray" onClick={() => { const nx = myExperts.filter((x) => x !== n); setMyExperts(nx); localStorage.setItem('ow-my-experts', JSON.stringify(nx)); }}>移除</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加技能 */}
      {addSk && <AddSkillModal onClose={() => setAddSk(false)} onSaved={(name) => { setAddSk(false); refresh(); soon(`技能「${name}」已创建并启用`); }} />}

      {/* 自定义连接器 */}
      {addConn && <AddConnModal onClose={() => setAddConn(false)} onSaved={(name) => { setAddConn(false); soon(`连接器「${name}」已保存，可在任务中调用`); }} />}

      {/* 专家团 */}
      {teamOpen && <TeamModal onClose={() => setTeamOpen(false)} soon={soon} />}

      {/* SkillHub 市场 */}
      {hubOpen && (
        <div className="am-mask" onClick={() => setHubOpen(false)}>
          <div className="am-dlg" style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>SkillHub · 社区技能市场（{SKILLS.length}）</h3><button className="iconbtn" onClick={() => setHubOpen(false)}><IcX size={16} /></button></div>
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0 22px 22px' }}>
              {SKILLS.map((s) => (
                <div key={s.n} className="set-row" style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <span className="sk-ic" style={{ background: s.bg, width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 14, flexShrink: 0 }}>{s.ic}</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="tt" style={{ fontSize: 14 }}>{s.n}</div>
                      <div className="dd" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.d}</div>
                    </div>
                  </div>
                  <button className="plus-sq" onClick={() => { setAdded((v) => ({ ...v, [s.n]: true })); soon(`「${s.n}」安装请求已提交`); }}>{added[s.n] ? <IcCheck size={13} /> : <IcPlus size={13} />}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 套件 */}
      {kitOpen && <KitModal onClose={() => setKitOpen(false)} refresh={refresh} soon={soon} />}

      {toast && <div className="toast-pill">{toast}</div>}
    </div>
  );
}

/* ---------------- 弹窗组件 ---------------- */
function AddSkillModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [mcp, setMcp] = useState('');
  const save = async () => {
    if (!name.trim()) return;
    const r = await api.createSkill({ name, desc, mcp });
    if (r?.id) onSaved(name);
  };
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>添加技能</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 22px' }}>
          <input autoFocus placeholder="技能名称，如：日报撰写" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 10 }} />
          <textarea rows={3} placeholder="技能描述：它做什么、什么时候用（选填）" value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: '100%', borderRadius: 10, marginTop: 10, background: '#fbfbfa' }} />
          <input placeholder="MCP 地址，如 https://mcp.example.com（选填）" value={mcp} onChange={(e) => setMcp(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 10, marginTop: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button className="btn-outline" onClick={onClose}>取消</button>
            <button className="btn-black" disabled={!name.trim()} style={!name.trim() ? { opacity: .45 } : {}} onClick={save}>创建并启用</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddConnModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const save = () => {
    if (!name.trim()) return;
    const cur = JSON.parse(localStorage.getItem('ow-conns') || '[]');
    localStorage.setItem('ow-conns', JSON.stringify([...cur, { name: name.trim(), url: url.trim(), ts: Date.now() }]));
    onSaved(name);
  };
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>自定义连接器</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 22px' }}>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>填写 MCP 服务地址即可接入自定义连接器。</div>
          <input autoFocus placeholder="连接器名称，如：内部知识库" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 10 }} />
          <input placeholder="MCP 地址，如 https://mcp.example.com/sse" value={url} onChange={(e) => setUrl(e.target.value)} style={{ width: '100%', height: 40, borderRadius: 10, marginTop: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button className="btn-outline" onClick={onClose}>取消</button>
            <button className="btn-black" disabled={!name.trim()} style={!name.trim() ? { opacity: .45 } : {}} onClick={save}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamModal({ onClose, soon }) {
  const [picks, setPicks] = useState([]);
  const [teams, setTeams] = useState(() => JSON.parse(localStorage.getItem('ow-teams') || '[]'));
  const toggle = (n) => setPicks((v) => (v.includes(n) ? v.filter((x) => x !== n) : v.length >= 4 ? v : [...v, n]));
  const create = () => {
    if (!picks.length) return;
    const nx = [...teams, { name: picks.join(' + '), members: picks, ts: Date.now() }];
    setTeams(nx);
    localStorage.setItem('ow-teams', JSON.stringify(nx));
    soon(`专家团已创建（${picks.length} 位成员）`);
    setPicks([]);
  };
  const del = (i) => { const nx = teams.filter((_, j) => j !== i); setTeams(nx); localStorage.setItem('ow-teams', JSON.stringify(nx)); };
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>专家团</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 22px' }}>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 12 }}>勾选最多 4 位专家组成协作团队，复杂任务由团队分工完成。</div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {EXPERTS.slice(0, 12).map((e) => (
              <div key={e.n} className="set-row" style={{ padding: '10px 0' }}>
                <div className="tt" style={{ fontSize: 14 }}>{e.av} {e.n}</div>
                <input type="checkbox" checked={picks.includes(e.n)} onChange={() => toggle(e.n)} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
            <button className="btn-black" disabled={!picks.length} style={!picks.length ? { opacity: .45 } : {}} onClick={create}>创建专家团（{picks.length}）</button>
          </div>
          {teams.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, margin: '18px 0 6px' }}>已创建的专家团</div>
              {teams.map((t, i) => (
                <div key={i} className="set-row" style={{ padding: '10px 0' }}>
                  <div className="tt" style={{ fontSize: 13.5 }}>{t.name}</div>
                  <button className="link-gray" onClick={() => del(i)}>删除</button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const KITS = [
  { name: '办公文档套件', desc: 'Word / Excel / PPT / PDF 一站式文档处理', items: ['Word 文档生成', 'Excel 表格处理', 'PPT 演示文稿', 'PDF 文档处理'] },
  { name: '内容创作套件', desc: '从长文写作到公众号排版的全流程', items: ['fbs-bookwriter', '公众号排版引擎', '润泽小馆·日报撰写'] },
  { name: '开发者套件', desc: '代码协作、浏览器自动化与部署', items: ['GitHub', 'Web Access（浏览器自动化）', '网站部署'] },
];
function KitModal({ onClose, refresh, soon }) {
  const [busyKit, setBusyKit] = useState(null);
  const install = async (k) => {
    setBusyKit(k.name);
    for (const it of k.items) await api.createSkill({ name: it, desc: `来自「${k.name}」` });
    setBusyKit(null);
    refresh();
    soon(`「${k.name}」已安装（${k.items.length} 个技能）`);
  };
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>套件 · 技能组合一键安装</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 22px' }}>
          {KITS.map((k) => (
            <div key={k.name} className="set-row" style={{ padding: '14px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 14.5 }}>{k.name}</div>
                <div className="dd">{k.desc}</div>
                <div className="dd" style={{ marginTop: 2 }}>{k.items.join(' · ')}</div>
              </div>
              <button className="btn-outline" disabled={busyKit === k.name} onClick={() => install(k)}>{busyKit === k.name ? '安装中…' : '一键安装'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
