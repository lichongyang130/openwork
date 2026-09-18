import React, { useState, useRef } from 'react';
import InputCard from './InputCard.jsx';
import { api } from '../api.js';
import { SUBS } from './SubData.js';
import ALL from './casedata/index.js';
import { META, palStyle } from './casedata/meta.js';
import CasePage from './CasePage.jsx';
import { IcDoc, IcCoin, IcPie, IcGrid, IcMonitor, IcSearch, IcVideo, IcEdit, IcTerminal, IcImg, IcPalette, IcWarn, IcChevR, IcChevD, IcRefresh, IcX, IcSend, IcFolder, IcScale, IcBell, IcClock, IcCheck, IcDb, IcSpark, IcGem, IcBolt, IcArrowUpR } from '../icons.jsx';

const SCENES = [
  {
    id: 'office', name: '日常办公', icon: IcEdit,
    chips: [
      { icon: IcDoc, name: '写工作周报', prompt: '读取工作记录，生成本周工作周报，结构为 完成 / 数据 / 计划，语气专业简洁' },
      { icon: IcEdit, name: '会议纪要整理', prompt: '把这份会议记录整理成纪要：结论先行，列出决策、待办、负责人与截止时间' },
      { icon: IcSend, name: '邮件草拟', prompt: '帮我草拟一封工作邮件：说明背景、事项与需要对方配合的点，语气得体' },
      { icon: IcFolder, name: '文件整理', prompt: '把工作空间里的文件按类型分入 文档 / 图片 / 表格 三个文件夹，重名自动加前缀' },
      { icon: IcCoin, name: '发票报销整理', prompt: '读取文件夹中的发票文件，提取日期、金额、税号，整理成可报销的表格' },
      { icon: IcScale, name: '合同要点审查', prompt: '审查这份合同：标出风险条款、权责不对等与缺失条款，给出修订建议' },
      { icon: IcBell, name: '通知/公告拟稿', prompt: '拟一份公司内部通知：含标题、背景、具体安排与落款，格式规范' },
      { icon: IcClock, name: '日程安排', prompt: '根据我列的事项与截止时间，排出本周日程计划并标注优先级' },
    ],
  },
  // 蜂群办公 已按需求移除（右侧输入框不再显示蜂群办公），蜂群能力通过输入框 SwarmToggle 自动启用，日常办公保留
  {
    id: 'code', name: '代码开发', icon: IcTerminal,
    chips: [
      { icon: IcEdit, name: '代码审查', prompt: '审查工作空间里的代码文件，按严重程度列出潜在问题与改进建议' },
      { icon: IcWarn, name: 'Bug 诊断', prompt: '分析工作空间中的报错日志，定位原因并给出最小修复方案' },
      { icon: IcCheck, name: '写单元测试', prompt: '为工作空间里的核心函数补单元测试，覆盖正常/边界/异常三类用例' },
      { icon: IcDoc, name: '生成 README', prompt: '根据工作空间里的代码，生成一份结构完整的 README：简介/安装/使用/FAQ' },
      { icon: IcTerminal, name: '脚本自动化', prompt: '写一个脚本，把重复操作自动化：扫描新文件并按日期归档，输出执行日志' },
      { icon: IcDb, name: 'SQL 写与优化', prompt: '按需求写 SQL 并给出优化建议：索引、执行计划与改写思路' },
      { icon: IcRefresh, name: '重构建议', prompt: '评估这段代码的可维护性，给出重构方案：拆解、命名、去重与补注释' },
      { icon: IcSearch, name: '正则生成', prompt: '生成匹配需求的正则表达式，附逐段解释与 3 组测试用例' },
    ],
  },
  {
    id: 'design', name: '设计创意', icon: IcImg,
    chips: [
      { icon: IcImg, name: '海报文案', prompt: '为中秋活动写 3 版海报文案：主标题+副标题+行动号召，风格各异' },
      { icon: IcSpark, name: '小红书笔记', prompt: '写一篇小红书笔记：钩子标题、口语化正文、话题标签，突出真实体验' },
      { icon: IcMonitor, name: 'PPT 大纲', prompt: '把产品规划草稿整理成 10 页 PPT 大纲：每页标题+3 个要点' },
      { icon: IcVideo, name: '短视频脚本', prompt: '写一个 60 秒产品宣传短视频脚本：分镜、画面描述与口播文案' },
      { icon: IcGem, name: '品牌 Slogan', prompt: '为咖啡品牌写 5 条 Slogan：好记、有画面感、可注册性提示' },
      { icon: IcBolt, name: '活动策划', prompt: '策划一场线下用户见面会：主题、流程、物料清单与预算粗估' },
      { icon: IcEdit, name: 'UI 文案优化', prompt: '优化产品界面文案：按钮、空态、报错提示，语气友好且无歧义' },
      { icon: IcPalette, name: '配色方案', prompt: '以「秋日暖阳」为主题给出 3 组配色：主色/辅助色/点缀色+使用场景' },
    ],
  },
];

export default function Home({ S, setView, refresh }) {
  const [scene, setScene] = useState('office');
  const [sel, setSel] = useState(null);
  const [batch, setBatch] = useState(0);
  const [hideCases, setHideCases] = useState(false);
  const [caseOpen, setCaseOpen] = useState(null);
  const [fav, setFav] = useState(false);
  const rowRef = useRef(null);
  const cur = SCENES.find((s) => s.id === scene);
  const subs = sel ? SUBS[`${scene}:${sel}`] || [] : [];
  const catKey = sel ? `${scene}:${sel}` : '';
  const catCases = sel ? (ALL[catKey] || []) : [];
  const batchSize = sel ? Math.max(1, Math.ceil(catCases.length / 4)) : Math.max(1, Math.ceil(cur.chips.length / 4));
  const caseList = sel
    ? Array.from({ length: Math.min(4, catCases.length) }, (_, i) => { const idx = (batch * 4 + i) % catCases.length; return { c: catCases[idx], idx, key: catKey }; })
    : cur.chips.slice((batch % batchSize) * 4, (batch % batchSize) * 4 + 4).map((ch) => { const arr = ALL[`${scene}:${ch.name}`] || []; return arr.length ? { c: arr[0], idx: 0, key: `${scene}:${ch.name}` } : null; }).filter(Boolean);

  const pickSkill = (name) => {
    setSel(name);
    setBatch(0);
    window.dispatchEvent(new CustomEvent('ow-skill-pick', { detail: { name } }));
  };

  const submit = async ({ prompt, mode, workspaceId, skillIds, modelId, refFiles, skillName }) => {
    const finalPrompt = skillName ? `【技能：${skillName}】${prompt}` : prompt;
    const t = await api.createTask({ prompt: finalPrompt, mode, workspaceId, skillIds, modelId, refFiles });
    refresh();
    setView({ type: 'task', id: t.id });
  };

  return (
    <div className="home" style={{ display: 'flex', gap: 0 }}>
      <div className="home-inner" style={{ flex: 1, minWidth: 0 }}>

        <div className="hero">OpenWork, 我帮你</div>

        <div className="scene-tabs">
          {SCENES.map((s) => (
            <button key={s.id} className={`scene-tab ${scene === s.id ? 'on' : ''}`} onClick={() => { setScene(s.id); setSel(null); setBatch(0); }}>
              <s.icon size={14} /> {s.name}
            </button>
          ))}
        </div>

        <div className="chips-wrap" style={{ justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {cur.chips.slice(0,4).map((c) => (
              <button key={c.name} className={`chip-card ${sel === c.name ? 'on' : ''}`} title="点击试试" onClick={() => pickSkill(c.name)} style={{ padding: '8px 14px', fontSize: 13 }}>
                <c.icon size={15} /> {c.name}
              </button>
            ))}
            <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', marginLeft: 8 }}>👉 不用选，直接在下面输入框说人话就行</span>
          </div>
        </div>

        <div className="input-wrap">
          <InputCard S={S} onSubmit={submit} autoFocus />
        </div>

        {!hideCases && (
          <div className="cases" style={{ opacity: 0.9 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 8 }}>💡 案例仅供参考，不用看懂，直接输任务就行</div>

            <div className="cases-head">
              <span>{sel ? `「${sel}」最佳实践案例 · 共 ${catCases.length} 个${catCases.length ? ` · 第 ${(batch % batchSize) + 1} / ${batchSize} 批` : ''}` : '不知道做什么，试试最佳实践案例'}</span>
              <span className="cases-ops">
                {batchSize > 1 && (<><button onClick={() => setBatch((b) => (b + 1) % batchSize)}><IcRefresh size={13} /> 换一批</button><i /></>)}
                <button onClick={() => setHideCases(true)}><IcX size={13} /></button>
              </span>
            </div>
            {sel && (
              <div className="subs-row">
                {subs.map((x) => (
                  <button key={x.n} className="sub-item" title={x.p} onClick={() => window.dispatchEvent(new CustomEvent('ow-fill-prompt', { detail: { text: x.p } }))}>
                    {x.n} <span className="arr"><IcArrowUpR size={12} style={{ transform: 'rotate(90deg)' }} /></span>
                  </button>
                ))}
              </div>
            )}
            {sel && <div className="subs-tip">点击下级栏目，提示词自动填入输入框；点击案例卡片查看完整最佳实践</div>}
            <div className="cases-grid">
              {caseList.map(({ c, key, idx }) => {
                const meta = META[key];
                return (
                  <button key={key + idx} className="case" onClick={() => { setCaseOpen({ key, idx }); setFav(false); }}>
                    <div className="cov2" style={palStyle(c.pal)}>
                      <MiniCover type={meta.cover} />
                      <div className="cov2-bar"><span className="t">{c.t.split(' · ')[0]}</span><span className="s">{c.sub}</span><span className="e">{meta.emo}</span></div>
                    </div>
                    <div className="case-t">{c.t}</div>
                  </button>
                );
              })}
              {caseList.length === 0 && <div className="cases-empty">该分类的案例正在上新中，敬请期待…</div>}
            </div>
          </div>
        )}
      </div>

      {/* 右侧预览常驻 - 按需求开启 */}
      <div className="home-right-preview" style={{ width: 320, borderLeft: '1px solid var(--border)', background: '#fff', padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>👁️ 右侧预览</div>
        <div style={{ fontSize: 12, background: '#f6f5f2', borderRadius: 8, padding: 10 }}>
          <div style={{ fontWeight: 600 }}>工作区</div>
          <div style={{ marginTop: 4, color: 'var(--muted)' }}>{S?.workspaces?.[0]?.name || '演示工作区'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, wordBreak: 'break-all' }}>{S?.workspaces?.[0]?.root}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(S?.workspaces?.[0]?.files || []).slice(0, 8).map((f,i)=><span key={i} style={{ fontSize: 10, background: '#fff', border: '1px solid #eee', padding: '2px 6px', borderRadius: 999 }}>{f.name || f.path?.split('/').pop()}</span>)}
          </div>
        </div>
        <div style={{ fontSize: 12, background: '#fffbe6', borderRadius: 8, padding: 10, border: '1px solid #f0e6b8' }}>
          <div style={{ fontWeight: 600 }}>🐝 蜂群能力已集成到输入框</div>
          <div style={{ marginTop: 4, color: 'var(--muted)', fontSize: 11 }}>日常办公已保留，蜂群办公分类已移除（按最新需求），输入框下方 SwarmToggle 自动启用蜂群，策略可选 auto/流程/维度/假设</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, background: '#fff', padding: '2px 6px', borderRadius: 999 }}>拖拽即上下文</span>
            <span style={{ fontSize: 10, background: '#fff', padding: '2px 6px', borderRadius: 999 }}>单文件交付</span>
            <span style={{ fontSize: 10, background: '#fff', padding: '2px 6px', borderRadius: 999 }}>快照回滚</span>
            <span style={{ fontSize: 10, background: '#fff', padding: '2px 6px', borderRadius: 999 }}>额度可见</span>
          </div>
        </div>
        <div style={{ fontSize: 12, background: '#f6f5f2', borderRadius: 8, padding: 10 }}>
          <div style={{ fontWeight: 600 }}>最近任务</div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(S?.tasks||[]).slice(0,6).map(t=><div key={t.id} style={{ padding: '6px 8px', background: '#fff', borderRadius: 8, border: '1px solid #eee', fontSize: 11 }}><div style={{ fontWeight: 600 }}>{t.title}</div><div style={{ color: 'var(--muted)', fontSize: 10 }}>{t.status} · {t.mode} {t.swarm ? `· ${t.swarm.subtasks?.length||0}工蜂` : ''}</div></div>)}
            {(S?.tasks||[]).length===0 && <div style={{ color: 'var(--muted)', fontSize: 11 }}>暂无任务，输入框直接提问即可</div>}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>右侧预览已按需求常驻开启 · 产物/文件/蜂群状态实时可见</div>
      </div>

      {caseOpen && (() => {
          const meta = META[caseOpen.key];
          const arr = ALL[caseOpen.key] || [];
          const c = arr[caseOpen.idx];
          if (!c) return null;
          const chipName = caseOpen.key.split(':')[1];
          return (
            <CasePage
              key={caseOpen.key + ':' + caseOpen.idx}
              catKey={caseOpen.key}
              catName={chipName}
              c={c}
              meta={meta}
              idx={caseOpen.idx}
              total={arr.length}
              fav={fav}
              setFav={setFav}
              onClose={() => setCaseOpen(null)}
              catCases={arr}
              onJump={(i) => { setCaseOpen({ key: caseOpen.key, idx: i }); setFav(false); }}
              onMake={() => { setCaseOpen(null); submit({ prompt: meta.prompt, mode: 'craft', workspaceId: S.workspaces[0]?.id, skillIds: [], skillName: chipName }); }}
            />
          );
        })()}
    </div>
  );
}

/* 缩略图：产物拟真迷你预览 */
function MiniCover({ type }) {
  return (
    <div className={`mini mini-${type}`}>
      {(type === 'report') && <><div className="m-bars"><i style={{ height: '42%' }} /><i style={{ height: '72%' }} /><i style={{ height: '56%' }} /><i style={{ height: '88%' }} /></div><div className="m-lines"><i /><i /><i /></div></>}
      {(type === 'doc' || type === 'mail') && <><div className="m-h" /><div className="m-lines"><i /><i /><i /><i /></div>{type === 'mail' && <div className="m-env" />}<div className="m-sign" /></>}
      {type === 'folder' && <div className="m-grid4"><i /><i /><i /><i /></div>}
      {type === 'table' && <div className="m-table"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>}
      {type === 'review' && <div className="m-lines dots"><i /><i /><i /><i /></div>}
      {type === 'timeline' && <div className="m-tl"><i /><i /><i /><i /></div>}
      {type === 'code' && <div className="m-code"><i style={{ width: '70%' }} /><i style={{ width: '50%', marginLeft: 12 }} /><i style={{ width: '62%', marginLeft: 12 }} /><i style={{ width: '34%' }} /></div>}
      {type === 'poster' && <><div className="m-big" /><div className="m-sub" /><div className="m-cta" /></>}
      {type === 'slides' && <div className="m-slides"><i /><i /><i /><i /></div>}
      {type === 'palette' && <div className="m-pal"><i /><i /><i /><i /></div>}
    </div>
  );
}

