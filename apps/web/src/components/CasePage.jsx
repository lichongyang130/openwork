/* 案例详情页：12 种版式 × 8 配色 × 6 背景，每案独立呈现 */
import { IcX } from '../icons.jsx';
import { palStyle, IMAGES } from './casedata/meta';

const fx = (i) => ({ className: 'fx', style: { '--i': i } });

/* ① 数据仪表盘 */
function LDash({ c }) {
  return (
    <div className="ly-dash">
      <div {...fx(0)}>
        <div className="ly-kicker">DATA BOARD · 数据仪表盘</div>
        <h1>{c.t}</h1>
        <p className="ly-lead">{c.sub} ｜ {c.d}</p>
      </div>
      <div className="d-kpis" {...fx(1)}>
        {c.stats.map(([l, v]) => <div className="kpi" key={l}><b>{v}</b><span>{l}</span></div>)}
      </div>
      <div className="d-board" {...fx(2)}>
        <h4>输出样张</h4>
        {c.out.map((o, i) => <div className="d-row" key={i}><i style={{ width: (92 - i * 16) + '%' }} />{o}</div>)}
      </div>
      <div className="d-quote" {...fx(3)}>“{c.quote}”</div>
      <div className="d-facts" {...fx(4)}>{c.facts.map((f) => <span key={f}>{f}</span>)}</div>
    </div>
  );
}

/* ② 文档纸张 */
function LDoc({ c, meta }) {
  return (
    <div className="ly-doc">
      <div className="pg" {...fx(0)}>
        <div className="pg-hd">
          <h1>{c.t}</h1>
          <div className="pg-meta">文档编号 OW-{meta.en.replace(/\s/g, '').slice(0, 6).toUpperCase()} ｜ {c.sub} ｜ 状态：已交付</div>
        </div>
        <p className="pg-lead">{c.d}</p>
        <h5>一、输入材料</h5>
        <p className="pg-in">{c.inp}</p>
        <h5>二、成果产出</h5>
        <ul>{c.out.map((o, i) => <li key={i}>{o}</li>)}</ul>
        <h5>三、数据佐证</h5>
        <table><tbody>{c.stats.map(([l, v]) => <tr key={l}><td>{l}</td><td><b>{v}</b></td></tr>)}</tbody></table>
        <div className="pg-foot">
          <span className="stamp">已核验</span>
          <span className="pg-note">专家意见：{c.quote}</span>
        </div>
      </div>
      <div className="pg-aside" {...fx(1)}>
        {c.facts.map((f) => <span key={f}>{f}</span>)}
      </div>
    </div>
  );
}

/* ③ 对话回放 */
function LChat({ c }) {
  return (
    <div className="ly-chat">
      <div className="ch-day" {...fx(0)}>今天 09:00 · 任务回放</div>
      <div className="b u" {...fx(0)}><i>我</i><p>{c.inp}</p></div>
      <div className="b a" {...fx(1)}><i>AI</i><p>{c.d}</p></div>
      {c.out.map((o, n) => <div className="b a" key={n} {...fx(2 + n)}><i>AI</i><p>✓ {o}</p></div>)}
      <div className="b a" {...fx(5)}><i>AI</i><p>📌 {c.quote}</p></div>
      <div className="ch-chips" {...fx(6)}>{c.facts.map((f) => <span key={f}>{f}</span>)}</div>
      <div className="b u" {...fx(7)}><i>我</i><p>太省心了！——{c.fb[0]}：{c.fb[1]}</p></div>
    </div>
  );
}

/* ④ 前后对比 */
function LCompare({ c }) {
  return (
    <div className="ly-cmp">
      <div className="cmp-grid" {...fx(0)}>
        <div className="cmp before">
          <h4>BEFORE · 优化前</h4>
          <p>{c.inp}</p>
          <div className="cmp-tag">耗时 · 易漏 · 格式乱</div>
        </div>
        <div className="cmp-vs">→</div>
        <div className="cmp after">
          <h4>AFTER · 优化后</h4>
          <ul>{c.out.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <div className="cmp-tag ok">{c.sub}</div>
        </div>
      </div>
      <div className="cmp-stats" {...fx(1)}>{c.stats.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <div className="cmp-note" {...fx(2)}>⚠ 避坑：{c.risk}</div>
    </div>
  );
}

/* ⑤ 时间线 */
function LTimeline({ c }) {
  const tm = ['09:00', '09:02', '09:04', '09:05', '09:06'];
  const steps = [[`收到需求：${c.inp}`], ...c.out.map((o) => [o]), [`完成交付 · ${c.quote}`]];
  return (
    <div className="ly-tl">
      <h1 {...fx(0)}>{c.t}</h1>
      <p className="ly-lead" {...fx(0)}>{c.sub} ｜ {c.d}</p>
      <div className="tl-rail">
        {steps.map((s, i) => (
          <div className="tl-it" key={i} {...fx(i + 1)}>
            <span className="tm">{tm[i]}</span>
            <div><b>{i === 0 ? '接单' : i === steps.length - 1 ? '交付' : `步骤 ${i}`}</b><p>{s[0]}</p></div>
          </div>
        ))}
      </div>
      <div className="tl-facts" {...fx(6)}>{c.facts.map((f) => <span key={f}>{f}</span>)}</div>
    </div>
  );
}

/* ⑥ 样张画廊 */
function LGallery({ c }) {
  return (
    <div className="ly-gal">
      <div {...fx(0)}>
        <div className="ly-kicker">GALLERY · 成品样张</div>
        <h1>{c.t}</h1>
        <p className="ly-lead">{c.d}</p>
      </div>
      <div className="gal-wall">
        {c.out.map((o, i) => (
          <figure className={`gal-card g${i}`} key={i} {...fx(i + 1)}>
            <span className="gal-no">SAMPLE 0{i + 1}</span>
            <p>{o}</p>
            <figcaption>{c.facts[i]}</figcaption>
          </figure>
        ))}
      </div>
      <div className="gal-quote" {...fx(4)}>“{c.quote}”</div>
    </div>
  );
}

/* ⑦ 代码工作台 */
function LTerminal({ c, meta }) {
  return (
    <div className="ly-term">
      <div className="term-win" {...fx(0)}>
        <div className="term-bar"><i /><i /><i /><span>{meta.en.toLowerCase()}-session</span></div>
        <div className="term-body">
          <div className="t-cmd">$ input</div>
          <div className="t-out">{c.inp}</div>
          <div className="t-cmd">$ run --quality high</div>
          {c.out.map((o, i) => <div className="t-ok" key={i}>✓ {o}</div>)}
          <div className="t-cmd">$ stats</div>
          {c.stats.map(([l, v]) => <div className="t-out" key={l}>  {l} ......... {v}</div>)}
          <div className="t-warn">! 避坑：{c.risk}</div>
        </div>
      </div>
      <div className="term-quote" {...fx(1)}>// {c.quote}</div>
      <div className="term-chips" {...fx(2)}>{c.facts.map((f) => <span key={f}>{f}</span>)}</div>
    </div>
  );
}

/* ⑧ 表格工作表 */
function LSheet({ c }) {
  return (
    <div className="ly-sheet">
      <h1 {...fx(0)}>{c.t}<em>{c.sub}</em></h1>
      <div className="sh-grid" {...fx(1)}>
        <div className="sh-row hd"><i>项目</i><i>数值</i><i>状态</i></div>
        {c.stats.map(([l, v]) => <div className="sh-row" key={l}><i>{l}</i><i><b>{v}</b></i><i className="ok">✓ 达标</i></div>)}
        {c.out.map((o, i) => <div className="sh-row alt" key={i}><i className="span2">{o}</i><i className="ok">✓ 已产出</i></div>)}
        <div className="sh-row ft"><i>结论</i><i className="span2">{c.quote}</i></div>
      </div>
      <div className="sh-facts" {...fx(2)}>{c.facts.map((f) => <span key={f}>{f}</span>)}</div>
    </div>
  );
}

/* ⑨ 邮件往来 */
function LMail({ c, meta }) {
  return (
    <div className="ly-mail">
      <div className="mail-win" {...fx(0)}>
        <div className="mail-bar">收件箱 · 1 封未读</div>
        <div className="mail-hd">
          <div className="mail-subj">{c.t}</div>
          <div className="mail-from">发件人：{meta.expert} &lt;openwork@ai&gt; ｜ {c.sub}</div>
        </div>
        <div className="mail-body">
          <p>你好，任务已完成，摘要如下：</p>
          <p className="mb-ctx">需求背景：{c.inp}</p>
          <ul>{c.out.map((o, i) => <li key={i}>{o}</li>)}</ul>
          <p className="mb-quote">专家意见：{c.quote}</p>
          <p className="mb-sign">—— OpenWork · {meta.en}</p>
        </div>
      </div>
      <div className="mail-chips" {...fx(1)}>{c.facts.map((f) => <span key={f}>{f}</span>)}<span className="warn">⚠ {c.risk}</span></div>
    </div>
  );
}

/* ⑩ 看板流程 */
function LKanban({ c }) {
  return (
    <div className="ly-kanban">
      <h1 {...fx(0)}>{c.t}<em>{c.sub}</em></h1>
      <div className="kb-cols">
        <div className="kb-col" {...fx(1)}>
          <h4>📥 输入<i>1</i></h4>
          <div className="kb-card"><p>{c.inp}</p></div>
          {c.facts.map((f) => <div className="kb-card tag" key={f}>{f}</div>)}
        </div>
        <div className="kb-col" {...fx(2)}>
          <h4>⚙️ 生成中<i>1</i></h4>
          <div className="kb-card"><p>{c.d}</p></div>
        </div>
        <div className="kb-col" {...fx(3)}>
          <h4>✅ 已完成<i>{c.out.length + 1}</i></h4>
          {c.out.map((o, i) => <div className="kb-card done" key={i}><p>✓ {o}</p></div>)}
          <div className="kb-card quote"><p>“{c.quote}”</p></div>
        </div>
      </div>
    </div>
  );
}

/* ⑪ 海报大字 */
function LPoster({ c }) {
  return (
    <div className="ly-poster">
      <div className="po-hero" {...fx(0)}>
        <div className="po-big">{c.sub.split(' ｜ ')[0]}</div>
        <h1>{c.t}</h1>
        <p>{c.d}</p>
      </div>
      <div className="po-ribbon" {...fx(1)}>{c.stats.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <div className="po-quote" {...fx(2)}>“{c.quote}”<span>—— 专家点评</span></div>
      <div className="po-foot" {...fx(3)}>{c.out.map((o, i) => <span key={i}>0{i + 1} {o}</span>)}</div>
    </div>
  );
}

/* ⑫ 结构导图 */
function LMind({ c }) {
  return (
    <div className="ly-mind">
      <div className="mind-core" {...fx(0)}><b>{c.t}</b><span>{c.sub}</span></div>
      <div className="mind-wings">
        <div className="mind-l">
          <h4 {...fx(1)}>输入与事实</h4>
          <div className="mind-node" {...fx(1)}>{c.inp}</div>
          {c.facts.map((f, i) => <div className="mind-leaf" key={f} {...fx(2 + i)}>{f}</div>)}
        </div>
        <div className="mind-r">
          <h4 {...fx(1)}>产出样张</h4>
          {c.out.map((o, i) => <div className="mind-node alt" key={i} {...fx(2 + i)}>{o}</div>)}
          <div className="mind-leaf quote" {...fx(5)}>“{c.quote}”</div>
        </div>
      </div>
    </div>
  );
}


/* 深度内容区：背景 / 输入全文 / 执行回放 / 输出全文 / 数据全览 / 专家问答 / 用户反馈 / 避坑 / 推荐 */
function Deep({ c, meta, recs, onJump }) {
  if (!c.raw && !c.ctx) return null;
  const statsAll = [...(c.stats || []), ...(c.stats2 || [])];
  return (
    <div className={`deep deep-${c.ly}`}>
      {c.ctx && <section className="dp-sec" {...fx(8)}><h4>📖 背景故事</h4><p className="dp-ctx">{c.ctx}</p></section>}
      {c.raw && <section className="dp-sec" {...fx(9)}><h4>📥 原始输入 · 全文</h4><pre className="dp-pre">{c.raw}</pre></section>}
      {c.steps && (
        <section className="dp-sec" {...fx(10)}>
          <h4>⚙️ 执行回放 · {c.steps.length} 步</h4>
          <div className="dp-steps">
            {c.steps.map((s, i) => (
              <div className="dp-step" key={i}>
                <i>{i + 1}</i>
                <div><b>{s[0]}</b><p>{s[1]}</p></div>
                <em>{s[2]}</em>
              </div>
            ))}
          </div>
        </section>
      )}
      {c.full && <section className="dp-sec" {...fx(11)}><h4>📄 输出成品 · 完整样张</h4><pre className="dp-pre dp-out">{c.full}</pre></section>}
      {c.stats2 && (
        <section className="dp-sec" {...fx(12)}>
          <h4>📊 数据全览 · {statsAll.length} 项</h4>
          <div className="dp-stats">{statsAll.map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
        </section>
      )}
      {c.qa && (
        <section className="dp-sec" {...fx(13)}>
          <h4>💬 专家问答 · {c.qa.length} 组</h4>
          {c.qa.map(([q, a], i) => (
            <div className="dp-qa" key={i}>
              <div className="q">Q{i + 1} · {q}</div>
              <div className="a">{meta.expert}：{a}</div>
            </div>
          ))}
        </section>
      )}
      {c.fbs && (
        <section className="dp-sec" {...fx(14)}>
          <h4>⭐ 用户反馈 · {c.fbs.length} 条</h4>
          <div className="dp-fbs">{c.fbs.map(([r, t], i) => <div className="dp-fb" key={i}><b>{r}</b><p>“{t}”</p></div>)}</div>
        </section>
      )}
      {c.risks && (
        <section className="dp-sec" {...fx(15)}>
          <h4>⚠️ 避坑清单 · {c.risks.length} 条</h4>
          <ul className="dp-risks">{c.risks.map((r) => <li key={r}>{r}</li>)}</ul>
        </section>
      )}
      {recs && recs.length > 0 && (
        <section className="dp-sec" {...fx(16)}>
          <h4>🔗 同类案例 · 继续看</h4>
          <div className="dp-recs">
            {recs.map((r) => (
              <button key={r.idx} onClick={() => onJump(r.idx)}>
                <b>{r.c.t}</b><span>{r.c.sub} ｜ {r.c.d}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const LY = { dash: LDash, doc: LDoc, chat: LChat, compare: LCompare, timeline: LTimeline, gallery: LGallery, terminal: LTerminal, sheet: LSheet, mail: LMail, kanban: LKanban, poster: LPoster, mind: LMind };

export default function CasePage({ catKey, catName, c, meta, idx, total, fav, setFav, onClose, onMake, catCases, onJump }) {
  const Layout = LY[c.ly] || LDash;
  const recs = (catCases && catCases.length > 1)
    ? [1, 2, 3].map((o) => (idx + o) % catCases.length).filter((i) => i !== idx).slice(0, 3).map((i) => ({ idx: i, c: catCases[i] }))
    : [];
  const fb = c.fbs ? c.fbs[0] : c.fb;
  const risk = c.risks ? c.risks[0] : c.risk;
  return (
    <div className="cp-mask" onClick={onClose}>
      <div className={`cp-wrap bg-${c.bg}`} style={palStyle(c.pal)} onClick={(e) => e.stopPropagation()}>
        <div className="cp-main">
          <div className="cp-topline fx" style={{ '--i': 0 }}>
            <span className="cp-no">案例 No.{String(idx + 1).padStart(3, '0')} / {total}</span>
            <span className="cp-cat">{catName} · {meta.en} {meta.emo}</span>
          </div>
          {IMAGES[catKey] && (
            <div className="cp-fig fx" style={{ '--i': 0 }}>
              <img src={IMAGES[catKey]} alt={catName} />
              <span>特色样张 · {meta.en}</span>
            </div>
          )}
          <Layout c={c} meta={meta} />
          <Deep c={c} meta={meta} recs={recs} onJump={onJump} />
        </div>
        <aside className="cp-side">
          <div className="cp-shead">
            <span className="ava">O</span> OpenWork 官方案例
            <span className="cp-sops">
              <button className="iconbtn" title="收藏" style={fav ? { color: 'var(--pa)' } : {}} onClick={() => setFav(!fav)}>★</button>
              <button className="iconbtn" title="关闭" onClick={onClose}><IcX size={15} /></button>
            </span>
          </div>
          <h2>{c.t}</h2>
          <p className="cp-d">{c.d}</p>
          <div className="cp-lb">专家</div>
          <div className="cp-expert">{meta.expert}</div>
          <div className="cp-lb">提示词</div>
          <div className="cp-prompt">{meta.prompt}</div>
          <div className="cp-lb">用户反馈</div>
          <div className="cp-fb"><b>{fb[0]}</b>：{fb[1]}</div>
          <div className="cp-lb">避坑提示</div>
          <div className="cp-risk">⚠ {risk}</div>
          <button className="cp-do" onClick={onMake}>◔ 做同款</button>
        </aside>
      </div>
    </div>
  );
}
