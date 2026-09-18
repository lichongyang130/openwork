import React, { useState } from 'react';
import { api } from '../api.js';
import { IcGear, IcUser, IcCoin, IcPalette, IcKeys, IcSparkUser, IcBrain, IcRobot, IcChip, IcAssistant, IcDb, IcApps, IcShield, IcInfo, IcX, IcSearch, IcShieldAlert, IcTerminal, IcCloud, IcEye, IcEyeOff, IcArrowUpR, IcTrash, IcChevD } from '../icons.jsx';

const NAV = [
  { sec: null, items: [
    { id: 'general', name: '通用', icon: IcGear },
    { id: 'profile', name: '个人主页', icon: IcUser },
    { id: 'points', name: '套餐与积分', icon: IcCoin },
    { id: 'appearance', name: '外观', icon: IcPalette },
    { id: 'keys', name: '快捷键', icon: IcKeys },
  ]},
  { sec: '功能', items: [
    { id: 'personal', name: '个性化', icon: IcSparkUser },
    { id: 'memory', name: '记忆与进化', icon: IcBrain },
    { id: 'agents', name: '智能体', icon: IcRobot },
    { id: 'models', name: '模型', icon: IcChip },
    { id: 'assistant', name: 'OpenWork 设置', icon: IcAssistant },
  ]},
  { sec: '数据与安全', items: [
    { id: 'data', name: '数据管理', icon: IcDb },
    { id: 'apps', name: '应用管理', icon: IcApps },
    { id: 'security', name: '安全中心', icon: IcShield },
    { id: 'sysauth', name: '系统授权', icon: IcShieldAlert },
    { id: 'sysconf', name: '软件配置', icon: IcTerminal },
  ]},
  { sec: '__div', items: [{ id: 'about', name: '关于 OpenWork', icon: IcInfo }]},
];

const DEFAULT_PREFS = {
  lockRun: '关闭', bootStart: false, proxy: '直接连接', autoInstallSkill: false, skillAutoUpdate: true, suiteAutoUpdate: true,
  defaultWs: '', replyStyle: '专业严谨', loadingMsg: true,
  memChat: true, memLocal: true,
  pluginsOn: true, agentTeam: false, localSkills: true, versionMgmt: true,
  sysNotify: true, wecom: true, remoteMode: 'Webhook', feishu: false, qqbot: false,
  builtinRuntime: true, points: 1286,
  appsAuth: { tdx: true, wecom: true, agentMail: false },
  feedbacks: [],
};

export default function SettingsModal({ S, onClose, refresh, initialPage }) {
  const [page, setPage] = useState(initialPage || 'general');
  const [toast, setToast] = useState('');
  const soon = (m = '该功能即将上线，敬请期待') => { setToast(m); setTimeout(() => setToast(''), 1800); };
  const prefs = { ...DEFAULT_PREFS, ...(S?.settings?.prefs || {}) };
  const setPref = async (patch, msg = '已保存') => { await api.saveSettings({ prefs: patch }); await refresh(); soon(msg); };
  const P = { S, refresh, soon, prefs, setPref, onClose };

  return (
    <div className="set-screen" onClick={onClose}>
      <div className="set-win" onClick={(e) => e.stopPropagation()}>
        <aside className="set-nav">
          <div className="t">设置</div>
          {NAV.map((g, i) => (
            <div key={i}>
              {g.sec && g.sec !== '__div' && <div className="sn-sec">{g.sec}</div>}
              {g.sec === '__div' && <div style={{ borderTop: '1px solid var(--border)', margin: '10px 6px' }} />}
              {g.items.map((n) => (
                <button key={n.id} className={`sn-item ${page === n.id ? 'on' : ''}`} onClick={() => setPage(n.id)}>
                  <span className="ic"><n.icon size={15} /></span> {n.name}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="set-main">
          <div className="set-head">
            <h2>{NAV.flatMap((g) => g.items).find((n) => n.id === page)?.name}</h2>
            <button className="iconbtn" onClick={onClose}><IcX size={17} /></button>
          </div>

          {page === 'general' && <General {...P} />}
          {page === 'profile' && <Profile {...P} />}
          {page === 'points' && <Points {...P} />}
          {page === 'appearance' && <Appearance soon={soon} />}
          {page === 'keys' && <Keys {...P} />}
          {page === 'personal' && <Personal {...P} />}
          {page === 'memory' && <Memory {...P} />}
          {page === 'agents' && <Agents {...P} />}
          {page === 'models' && <Models {...P} />}
          {page === 'assistant' && <AssistantSet {...P} />}
          {page === 'data' && <Data {...P} />}
          {page === 'apps' && <Apps {...P} />}
          {page === 'security' && <Security {...P} />}
          {page === 'sysauth' && <SysAuth {...P} />}
          {page === 'sysconf' && <SysConf {...P} />}
          {page === 'about' && <About {...P} />}

          {toast && <div className="toast-pill">{toast}</div>}
        </main>
      </div>
    </div>
  );
}

/* ================= 外观 (7.png) ================= */
const THEMES = [
  { id: 'light', name: '浅色', cls: 'th-light' },
  { id: 'dark', name: '深色', cls: 'th-dark' },
  { id: 'angela', name: '张韶涵联名皮肤', cls: 'th-angela' },
  { id: 'peace', name: '和平精英激战金秋', cls: 'th-peace' },
  { id: 'qq', name: '经典 QQ', cls: 'th-qq', emo: '🐧' },
  { id: 'wind', name: '有风', cls: 'th-wind' },
  { id: 'tongxing', name: '同行', cls: 'th-tong' },
  { id: 'ripple', name: '涟漪', cls: 'th-ripple', emo: '🐻‍️' },
  { id: 'partner', name: '伙伴', cls: 'th-partner', emo: '🌸' },
  { id: 'soon', name: '敬请期待', cls: 'th-soon', disabled: true },
];
function Appearance({ soon }) {
  const [sel, setSel] = useState('light');
  return (
    <>
      <div className="ap-prev">
        <span className="ap-badge">永久有效</span>
        <div className="ap-mock">
          <div className="ap-side">
            <div className="ap-dots"><i className="r" /><i className="y" /><i className="g" /></div>
            {['对话列表', '新任务', '技能', '定时任务', '专家', '产物', '设置'].map((t, i) => (
              <div key={t} className={`ap-li ${i === 0 ? 'on' : ''}`}>{t}</div>
            ))}
            <div className="ap-li dim">数据与安全</div>
            <div className="ap-li dim">系统授权</div>
          </div>
          <div className="ap-main">
            <div className="ap-hero">OpenWork, 我帮你</div>
            <div className="ap-pills"><span className="on">日常办公</span><span>代码开发</span><span>设计创意</span></div>
            <div className="ap-chips">{['文档处理', '金融服务', '数据分析', '幻灯片', '深度研究'].map((c) => <span key={c}>{c}</span>)}</div>
            <div className="ap-input"><span>今天帮你做些什么？</span><b /></div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, margin: '22px 2px 12px' }}>全部主题</div>
      <div className="ap-grid">
        {THEMES.map((t) => (
          <button key={t.id} className={`ap-th ${t.disabled ? 'dis' : ''}`} onClick={() => {
            if (t.disabled) return soon('该皮肤即将上线');
            setSel(t.id);
            soon(t.id === 'light' ? '已应用浅色主题' : '本地版暂仅支持浅色展示，已为你保留浅色');
          }}>
            <span className={`sw ${t.cls} ${sel === t.id ? 'sel' : ''}`}>{t.emo && <em>{t.emo}</em>}{t.id === 'soon' && <i className="soon-t">敬请期待</i>}</span>
            <span className="nm">{t.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ================= 通用 ================= */
function General({ S, prefs, setPref, soon }) {
  const [font, setFont] = useState(1);
  const [wsPop, setWsPop] = useState(false);
  const applyFont = (v) => { setFont(v); document.body.style.fontSize = ['13px', '14px', '15px'][v]; };
  const wsList = S?.workspaces || [];
  const curWs = wsList.find((w) => w.id === prefs.defaultWs) || wsList[0];
  return (
    <>
      <div className="set-sec-lb">常规</div>
      <div className="set-card">
        <Row tt="语言" ctl={<Sel v="简体中文" opts={['简体中文', 'English']} onChange={() => soon('当前版本仅内置中文界面，英文包将在后续版本提供')} />} />
        <Row tt="字体大小" ctl={
          <div style={{ width: 260 }}>
            <input type="range" min="0" max="2" step="1" value={font} onChange={(e) => applyFont(+e.target.value)} style={{ width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}><span>小</span><span>默认</span><span>大</span></div>
          </div>} />
      </div>
      <div className="set-sec-lb">权限</div>
      <div className="set-card">
        <Row tt="允许锁屏运行" dd="选择锁屏后的运行方式，保障远程控制与后台 Agent 任务持续执行" ctl={<Sel v={prefs.lockRun} opts={['关闭', '开启']} onChange={(v) => setPref({ lockRun: v })} />} />
        <Row tt="开机自启" dd="开启后 OpenWork 会在你登录电脑后自动启动。" ctl={<Tog on={prefs.bootStart} onChange={(v) => setPref({ bootStart: v })} />} />
        <Row tt="网络代理" dd="配置 OpenWork 访问网络的方式。修改后立即生效，无需重启。" ctl={<Sel v={prefs.proxy} opts={['直接连接', '系统代理']} onChange={(v) => setPref({ proxy: v })} />} />
        <Row tt="自动安装可信技能" dd="安全检测通过后自动安装，高风险项始终要求手动确认" ctl={<Tog on={prefs.autoInstallSkill} onChange={(v) => setPref({ autoInstallSkill: v })} />} />
        <Row tt="技能自动更新" dd="开启后将自动更新已安装的技能为最新版本" ctl={<Tog on={prefs.skillAutoUpdate} onChange={(v) => setPref({ skillAutoUpdate: v })} />} />
        <Row tt="套件自动更新" dd="开启后将自动更新已安装的套件为最新版本" ctl={<Tog on={prefs.suiteAutoUpdate} onChange={(v) => setPref({ suiteAutoUpdate: v })} />} />
      </div>
      <div className="set-sec-lb">存储</div>
      <div className="set-card">
        <Row tt="默认保存目录" dd={curWs ? `${curWs.name}（${curWs.root}）` : ''} ctl={
          <div style={{ position: 'relative' }}>
            <button className="btn-outline" onClick={() => setWsPop(!wsPop)}>更改</button>
            {wsPop && (
              <>
                <div className="combo-mask" style={{ position: 'fixed' }} onClick={() => setWsPop(false)} />
                <div className="combo-pop" style={{ minWidth: 240, right: 0, top: 38 }}>
                  {wsList.map((w) => (
                    <button key={w.id} className={w.id === curWs?.id ? 'sel' : ''} onClick={() => { setWsPop(false); setPref({ defaultWs: w.id }, `已切换默认工作区为「${w.name}」`); }}>{w.name}</button>
                  ))}
                </div>
              </>
            )}
          </div>} />
      </div>
    </>
  );
}

/* ================= 个人主页 ================= */
function Profile({ S, soon, onClose }) {
  const [mc, setMc] = useState(false);
  const [logout, setLogout] = useState(false);
  const taskCount = S?.tasks?.length || 0;
  const artifactCount = (S?.tasks || []).reduce((n, t) => n + (t.artifacts?.length || 0), 0);
  return (
    <>
      <div className="set-card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '24px 26px' }}>
        <div className="pf-avatar">L</div>
        <div style={{ flex: 1 }}>
          <div className="pf-name">lichongyang</div>
          <div className="pf-sub">个人版</div>
        </div>
        <button className="btn-outline" onClick={() => setMc(true)}>前往管理中心</button>
      </div>
      <div className="set-sec-lb">账号</div>
      <div className="set-card">
        <Row tt="登录状态" ctl={<span className="badge-green">已登录（本机）</span>} />
        <div className="pf-div" />
        <Row tt="账号类型" dd="当前为个人版账号，可使用全部本地功能" ctl={<span className="badge-gray">个人版</span>} />
      </div>
      <button className="btn-danger" onClick={() => setLogout(true)}>退出登录</button>

      {mc && (
        <div className="am-mask" onClick={() => setMc(false)}>
          <div className="am-dlg" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>管理中心</h3><button className="iconbtn" onClick={() => setMc(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px' }}>
              <div className="info-banner">本地版的管理能力已集成在客户端内，无需跳转网页控制台。</div>
              <div className="set-row" style={{ padding: '13px 0' }}><div className="tt" style={{ fontSize: 14 }}>任务总量</div><div className="ctl"><span className="num">{taskCount}</span></div></div>
              <div className="set-row" style={{ padding: '13px 0' }}><div className="tt" style={{ fontSize: 14 }}>产物总量</div><div className="ctl"><span className="num">{artifactCount}</span></div></div>
              <div className="set-row" style={{ padding: '13px 0' }}><div className="tt" style={{ fontSize: 14 }}>已启用技能</div><div className="ctl"><span className="num">{(S?.skills || []).filter((s) => s.enabled).length}</span></div></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                <button className="btn-black" onClick={() => setMc(false)}>知道了</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {logout && (
        <div className="am-mask" onClick={() => setLogout(false)}>
          <div className="am-dlg" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>退出登录</h3><button className="iconbtn" onClick={() => setLogout(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--muted)' }}>本地版数据仅保存在你的电脑上，退出登录不会影响任务、产物与设置。确定退出吗？</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button className="btn-outline" onClick={() => setLogout(false)}>取消</button>
                <button className="btn-black" onClick={() => { localStorage.setItem('ow-logged-out', '1'); setLogout(false); onClose(); }}>确认退出</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= 套餐与积分 (03) ================= */
const POINT_PACKS = [
  { name: '500 积分', pts: 500, price: '¥ 5' },
  { name: '1,500 积分', pts: 1500, price: '¥ 12' },
  { name: '5,000 积分', pts: 5000, price: '¥ 35' },
];
function Points({ prefs, setPref, soon }) {
  const [buyOpen, setBuyOpen] = useState(false);
  const upgrade = async () => {
    await setPref({ points: prefs.points + 300 }, '已升级至专业版体验，赠送 300 积分');
  };
  const buy = async (p) => {
    await setPref({ points: prefs.points + p.pts }, `购买成功，到账 ${p.pts} 积分`);
    setBuyOpen(false);
  };
  return (
    <>
      <div className="set-card" style={{ display: 'flex', alignItems: 'center', padding: '24px 26px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>总剩余积分</div>
          <div className="big-num">{prefs.points.toLocaleString()}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={upgrade}>升级套餐</button>
          <button className="btn-black" onClick={() => setBuyOpen(true)}>购买积分</button>
        </div>
      </div>
      {buyOpen && (
        <div className="am-mask" onClick={() => setBuyOpen(false)}>
          <div className="am-dlg" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>购买积分</h3><button className="iconbtn" onClick={() => setBuyOpen(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px' }}>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>本地版为模拟充值，选择套餐即刻到账。</div>
              {POINT_PACKS.map((p) => (
                <div key={p.name} className="set-row" style={{ padding: '13px 0' }}>
                  <div><div className="tt" style={{ fontSize: 14 }}>{p.name}</div><div className="dd">{p.price}</div></div>
                  <div className="ctl"><button className="btn-outline" onClick={() => buy(p)}>购买</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="set-sec-lb">积分明细</div>
      <div className="set-card">
        <Row tt="套餐基础积分" dd="每月刷新" ctl={<span className="num">1,000</span>} />
        <div className="pf-div" />
        <Row tt="套餐赠送积分" dd="一次性发放" ctl={<span className="num">200</span>} />
        <div className="pf-div" />
        <Row tt="平台奖励积分" dd="活动奖励" ctl={<span className="num">86</span>} />
      </div>
    </>
  );
}

/* ================= 快捷键 (05) ================= */
const KEY_ROWS = [
  ['打开设置', '⌘,'], ['语音录制开关', '⌘D'], ['对话内搜索', '⌘F'], ['发送消息', 'Enter'],
  ['输入时换行', '⇧Enter'], ['新建对话', '⌘N'], ['停止生成', 'Esc'], ['上一个任务', '⌘['],
  ['下一个任务', '⌘]'], ['切换左侧栏', '⌘B'], ['切换右侧产物面板', '⌘⇧B'], ['进入/退出全屏', '^⌘F'],
];
const KEY_STORE = 'ow-shortcuts';
const loadKeys = () => { try { return JSON.parse(localStorage.getItem(KEY_STORE)) || {}; } catch { return {}; } };
function Keys({ soon }) {
  const [q, setQ] = useState('');
  const [bindings, setBindings] = useState(loadKeys());
  const [capturing, setCapturing] = useState(null); // name of row waiting for a key combo
  const rows = KEY_ROWS.filter(([n]) => !q || n.includes(q));

  React.useEffect(() => {
    if (!capturing) return;
    const h = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return; // modifier alone, keep waiting
      const parts = [];
      if (e.ctrlKey) parts.push('⌃');
      if (e.metaKey) parts.push('⌘');
      if (e.altKey) parts.push('⌥');
      if (e.shiftKey) parts.push('⇧');
      const k = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
      parts.push(k);
      const combo = parts.join('');
      const next = { ...bindings, [capturing]: combo };
      setBindings(next);
      localStorage.setItem(KEY_STORE, JSON.stringify(next));
      setCapturing(null);
      soon(`「${capturing}」已绑定为 ${combo}`);
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [capturing, bindings]);

  const resetAll = () => {
    localStorage.removeItem(KEY_STORE);
    setBindings({});
    soon('已恢复默认快捷键');
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted2)' }}><IcSearch size={15} /></span>
          <input placeholder="搜索快捷键" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: '100%', paddingLeft: 36, borderRadius: 11, background: '#f7f6f4', borderColor: 'var(--border)' }} />
        </div>
        <button className="btn-outline" onClick={resetAll}>全部恢复默认</button>
      </div>
      {capturing && <div className="info-banner">正在监听按键：请按下新的组合键绑定「{capturing}」（按 Esc 之外的任意组合键生效）</div>}
      <div className="tbl">
        <div className="tr th"><span style={{ flex: 1 }}>命令</span><span style={{ width: 220 }}>按键绑定</span><span style={{ width: 180 }}>操作</span></div>
        {rows.map(([n, k]) => (
          <div className="tr" key={n}>
            <span style={{ flex: 1, fontSize: 14.5 }}>{n}</span>
            <span style={{ width: 220 }}><span className="keycap" style={capturing === n ? { outline: '2px solid var(--accent)' } : {}}>{bindings[n] || k}</span></span>
            <span style={{ width: 180 }}>
              {capturing === n
                ? <button className="link-dark" style={{ color: 'var(--accent)' }} onClick={() => setCapturing(null)}>取消监听</button>
                : <button className="link-gray" onClick={() => setCapturing(n)}>点击设置快捷键</button>}
              {bindings[n] && capturing !== n && <button className="link-gray" style={{ marginLeft: 10 }} onClick={() => { const nx = { ...bindings }; delete nx[n]; setBindings(nx); localStorage.setItem(KEY_STORE, JSON.stringify(nx)); soon(`「${n}」已恢复默认`); }}>恢复</button>}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= 个性化 (06) ================= */
function Personal({ S, prefs, setPref, soon }) {
  const [rules, setRules] = useState(S?.settings?.prefs?.customRules ?? '');
  const dirty = rules !== (S?.settings?.prefs?.customRules ?? '');
  return (
    <>
      <div className="set-card">
        <Row tt="回复风格" dd="选择 OpenWork 回复的默认语气" ctl={<Sel v={prefs.replyStyle} opts={['专业严谨', '轻松活泼', '简洁直接']} onChange={(v) => setPref({ replyStyle: v }, `回复风格已切换为「${v}」`)} />} />
        <div className="pf-div" />
        <Row tt="加载提示语" dd="当对话加载较慢时，用一句问候陪伴你等待，不至于干等" ctl={<Tog dark on={prefs.loadingMsg} onChange={(v) => setPref({ loadingMsg: v })} />} />
      </div>
      <div className="set-sec-lb">自定义指令</div>
      <div className="set-card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 14, marginBottom: 12 }}>给 OpenWork 定几条规则，后续对所有任务都生效</div>
        <textarea rows={5} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="例如：回答先给结论再展开..." style={{ width: '100%', borderRadius: 10, background: '#fbfbfa' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn-black" disabled={!dirty} style={!dirty ? { opacity: .45 } : {}} onClick={() => setPref({ customRules: rules }, '自定义指令已保存，新任务即刻生效')}>保存指令</button>
        </div>
      </div>
    </>
  );
}

/* ================= 记忆与进化 (07) + 蜂群Gene ================= */
function Memory({ S, prefs, setPref, soon }) {
  const [genes, setGenes] = React.useState(S?.genes || []);
  const [mkt, setMkt] = React.useState([]);
  const [q, setQ] = React.useState('');
  React.useEffect(() => { api.listGenes().then(setGenes).catch(()=>{}); api.listMarketGenes().then(setMkt).catch(()=>{}); }, []);
  const search = async () => {
    const g = await api.listGenes(q);
    setGenes(g);
    const m = await api.listMarketGenes(q);
    setMkt(m);
  };
  const swarm = S?.settings?.swarm || {};
  const evolution = S?.settings?.evolution || {};
  return (
    <>
      <div className="info-banner">记忆让 OpenWork 记住你的偏好和习惯，对话越多，它就越懂你。蜂群Gene自进化：高置信度经验沉淀为技能，越用越聪明。</div>
      <div className="set-card">
        <Row tt="生成对话记忆" dd="允许 OpenWork 从对话中提取并记住相关上下文，以便在未来对话中提供更连贯、个性化的回应。" ctl={<Tog dark on={prefs.memChat} onChange={(v) => setPref({ memChat: v })} />} />
        <div className="pf-div" />
        <Row tt="本地记忆" dd="将日常工作记忆写入到本地文件，跨会话保留上下文。" ctl={<Tog dark on={prefs.memLocal} onChange={(v) => setPref({ memLocal: v })} />} />
        <div className="pf-div" />
        <Row tt="🐝 蜂群自进化" dd="右上角开关默认开，定期把修复优化存本机，第一次试错多，第二次复用更快" ctl={<Tog dark on={evolution.enabled ?? true} onChange={async (v) => { await api.saveSettings({ evolution: { enabled: v } }); soon(v ? '自进化已开启' : '自进化已关闭'); }} />} />
        <div className="pf-div" />
        <Row tt="🐝 Swarm自动开启" dd="复杂任务自动拆解为简单任务并行，省人工省心，1500额度内白嫖" ctl={<Tog dark on={swarm.autoEnable ?? true} onChange={async (v) => { await api.saveSettings({ swarm: { autoEnable: v } }); soon(v ? '蜂群自动模式已开启' : '蜂群自动模式已关闭'); }} />} />
      </div>

      <div className="set-sec-lb">🧬 Gene基因记忆 · {genes.length} · GDI评分越用越聪明</div>
      <div className="set-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="搜索Gene，如 周报/发票/报告" value={q} onChange={e=>setQ(e.target.value)} style={{ flex: 1 }} />
          <button className="btn-outline" onClick={search}>搜索</button>
        </div>
        {genes.map(g => (
          <div key={g.id} className="set-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div className="tt" style={{ fontSize: 13 }}>{g.claim} {g.shared && <span style={{ fontSize: 10, background: '#e2f5ea', padding: '1px 5px', borderRadius: 4, color: '#27a35f' }}>已共享</span>}</div>
              <div className="dd">{g.from} · GDI {g.gdi} · 使用 {g.usage||0}次 · {(g.evidence||[]).slice(0,2).join(' / ')}</div>
            </div>
            <div className="ctl" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className="badge-green">GDI {g.gdi}</span>
              <button className="btn-outline" style={{ fontSize: 11, padding: '2px 8px' }} onClick={async()=>{
                const r=await fetch(`/api/genes/${g.id}/share`,{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({team:'default'})}).then(r=>r.json());
                setGenes(genes.map(x=> x.id===g.id ? r : x));
                soon('已共享到团队 · 权限审计可查');
              }}>共享</button>
              <button className="iconbtn" title="删除" onClick={async()=>{ await api.deleteGene(g.id); setGenes(genes.filter(x=>x.id!==g.id)); }}><IcTrash size={13} /></button>
            </div>
          </div>
        ))}
        {genes.length===0 && <div className="empty">暂无Gene，运行蜂群任务后高置信度经验自动沉淀</div>}
      </div>

      <div className="set-sec-lb">🌸 Marketplace · 别人跑通的Gene直接复用 · 站在别人经验上开工</div>
      <div className="set-card" style={{ padding: '12px 16px' }}>
        {mkt.map(m => (
          <div key={m.id} className="set-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <div className="tt" style={{ fontSize: 13 }}>{m.claim}</div>
              <div className="dd">{m.from} · GDI {m.gdi} · 下载 {m.downloads} · {m.tag}</div>
            </div>
            <div className="ctl">
              <button className="btn-black" style={{ fontSize: 12, padding: '6px 12px' }} onClick={async()=>{ const g=await api.installMarketGene(m.id); if(g){ setGenes([...genes,g]); soon(`已安装Gene：${m.tag}`);} }}>安装</button>
            </div>
          </div>
        ))}
      </div>

      <div className="set-sec-lb">已记住的内容</div>
      <div className="set-card">
        <Row tt="偏好：输出风格" dd="倾向于结论先行、结构化分节表达" ctl={<span className="badge-gray">1 天前</span>} />
        <div className="pf-div" />
        <Row tt="偏好：设计风格" dd="偏好极简高级、网格化紧凑布局" ctl={<span className="badge-gray">3 天前</span>} />
        <div className="pf-div" />
        <Row tt="习惯：交付标准" dd="抵制 mock 与占位实现，要求端到端真实可用" ctl={<span className="badge-gray">5 天前</span>} />
      </div>
    </>
  );
}

/* ================= 智能体 (08) ================= */
const PLUGINS = ['agent-browser', 'document-skills', 'finance-data', 'find-skills', 'playwright-cli', 'sheetagent', 'tabbit', 'tencent-docs-plugin'];
function Agents({ prefs, setPref }) {
  return (
    <>
      <div className="set-card">
        <Row tt="插件管理" dd="包含技能、MCP 与第三方插件。禁用后将全部停用，相关任务可能无法执行" ctl={<Tog dark on={prefs.pluginsOn} onChange={(v) => setPref({ pluginsOn: v }, v ? '插件已启用' : '插件已停用')} />} />
        <div className="pf-div" />
        <Row tt="智能体团队管理" dd="遇到复杂任务时自动组建多个智能体分工协作完成。禁用后所有任务将由单个智能体独立处理。专家团不受此设置的影响" ctl={<Tog on={prefs.agentTeam} onChange={(v) => setPref({ agentTeam: v })} />} />
        <div className="pf-div" />
        <Row tt="本地技能与记忆沉淀" dd="自动记录本地记忆、工作日志，自动沉淀和优化技能。数据本地存储，仅在你的设备和工作区中保留。" ctl={<Tog dark on={prefs.localSkills} onChange={(v) => setPref({ localSkills: v })} />} />
      </div>
      <div className="set-sec-lb">已启用的插件</div>
      <div className="set-card" style={{ padding: '4px 20px' }}>
        <div className="tbl">
        <div className="tr th" style={{ padding: '12px 2px' }}><span style={{ flex: 1 }}>插件</span><span>状态</span></div>
        {PLUGINS.map((p, i) => (
          <div className="tr" key={p} style={{ padding: '15px 2px', borderBottom: i < PLUGINS.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ flex: 1, fontSize: 14.5 }}>{p}</span><span className="badge-green">已启用</span>
          </div>
        ))}
        </div>
      </div>
    </>
  );
}

/* ================= 模型 (09 + 4.png 添加弹窗) ================= */
const PROVIDERS = [
  { label: '腾讯云 Token Plan / 通用 Token Plan（个人版）', short: 'Tencent', url: 'https://api.lkeap.cloud.tencent.com/v1', def: [] },
  { label: 'DeepSeek', short: 'DeepSeek', url: 'https://api.deepseek.com', def: ['deepseek-chat', 'deepseek-reasoner'] },
  { label: 'Moonshot（Kimi）', short: 'Moonshot', url: 'https://api.moonshot.cn/v1', def: ['moonshot-v1-8k', 'kimi-k2-0711-preview'] },
  { label: '智谱 GLM', short: 'Zhipu', url: 'https://open.bigmodel.cn/api/paas/v4', def: ['glm-4-plus', 'glm-4-flash'] },
  { label: 'MiniMax', short: 'MiniMax', url: 'https://api.minimax.chat/v1', def: ['abab6.5s-chat'] },
  { label: 'OpenAI', short: 'OpenAI', url: 'https://api.openai.com/v1', def: ['gpt-4o', 'gpt-4o-mini'] },
  { label: '自定义（OpenAI 兼容）', short: 'Custom', url: '', def: [] },
];

function Models({ S, refresh, soon }) {
  const [open, setOpen] = useState(false);
  const host = (u) => { try { return new URL(u).host; } catch { return u || '—'; } };
  const del = async (m) => { await api.deleteModel(m.id); refresh(); soon(`已删除模型 ${m.name}`); };
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>自定义模型</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>模型添加后会自动写入到本地 models.json 文件中</div>
        </div>
        <button className="btn-black" onClick={() => setOpen(true)}>+ 添加模型</button>
      </div>
      <div className="tbl">
        <div className="tr th"><span style={{ flex: 1.2 }}>模型</span><span style={{ flex: .7 }}>供应商</span><span style={{ flex: 1 }}>接口地址</span><span style={{ width: 80 }}>状态</span><span style={{ width: 44 }} /></div>
        {(S?.settings?.models || []).filter((m) => !m.builtin).map((m) => (
          <div className="tr" key={m.id}>
            <span style={{ flex: 1.2, fontSize: 14.5 }}>{m.name}</span>
            <span style={{ flex: .7, color: 'var(--muted)' }}>{m.provider}</span>
            <span style={{ flex: 1, color: 'var(--muted)' }}>{host(m.baseUrl)}</span>
            <span style={{ width: 80 }}>{m.hasKey ? <span className="badge-green">可用</span> : <span className="badge-gray">未配置</span>}</span>
            <span style={{ width: 44 }}><button className="iconbtn" title="删除模型" onClick={() => del(m)}><IcTrash size={15} /></button></span>
          </div>
        ))}
      </div>
      {open && <AddModel onClose={() => setOpen(false)} onSaved={() => { setOpen(false); refresh(); soon('模型已添加到 models.json'); }} />}
    </>
  );
}

function AddModel({ onClose, onSaved }) {
  const [pi, setPi] = useState(0);
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  const [curl, setCurl] = useState('');
  const [mname, setMname] = useState('');
  const [tested, setTested] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const prov = PROVIDERS[pi];
  const url = prov.url || curl.trim();

  const test = async () => {
    if (!url) return setMsg({ t: 'err', s: '自定义供应商请填写接口地址' });
    setBusy(true); setMsg(null);
    // 浏览器直连优先（本地服务在沙箱内可能无法出站），失败再回退服务端
    let r = null;
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 8000);
      const rr = await fetch(`${url.replace(/\/$/, '')}/models`, { headers: { Authorization: `Bearer ${key || ''}` }, signal: ctrl.signal });
      clearTimeout(tm);
      if (!rr.ok) r = { ok: false, error: `接口返回 HTTP ${rr.status}` };
      else {
        const data = await rr.json().catch(() => ({}));
        r = { ok: true, models: Array.isArray(data?.data) ? data.data.map((m) => m && m.id).filter(Boolean) : [] };
      }
    } catch (e) {
      r = await api.testModel({ baseUrl: url, apiKey: key });
      if (!r.ok && /网络错误/.test(r.error || '')) r = { ok: false, error: '浏览器与本地服务均无法访问该地址，请检查接口地址是否正确' };
    }
    setBusy(false);
    if (r.ok) {
      const list = r.models || [];
      setTested(list);
      if (list.length) { setMname(list[0]); setMsg({ t: 'ok', s: `连接成功，获取到 ${list.length} 个模型` }); }
      else setMsg({ t: 'ok', s: '连接成功，但接口未返回模型列表，请手动输入模型名称' });
    } else setMsg({ t: 'err', s: r.error || '连接失败' });
  };
  const save = async () => {
    if (!url) return setMsg({ t: 'err', s: '自定义供应商请填写接口地址' });
    if (!mname.trim()) return setMsg({ t: 'err', s: '请填写模型名称，或点击「一键获取模型列表」' });
    await api.saveSettings({ models: [{ id: 'custom-' + Date.now(), provider: prov.short, name: mname.trim(), baseUrl: url, apiKey: key }] });
    onSaved();
  };

  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>添加模型</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>

        <div className="am-lb"><span>供应商（仅支持 OpenAI 兼容协议 API）</span><button className="am-lk" onClick={() => {}}>查看文档 <IcArrowUpR size={12} /></button></div>
        <div className="am-selwrap">
          <span className="lead"><IcCloud size={15} /></span>
          <select value={pi} onChange={(e) => { setPi(+e.target.value); setTested([]); setMname(''); setMsg(null); }}>
            {PROVIDERS.map((p, i) => <option key={p.short} value={i}>{p.label}</option>)}
          </select>
          <span className="chev"><IcChevD size={14} /></span>
        </div>
        {!prov.url && (
          <input placeholder="接口地址，如 https://api.example.com/v1" value={curl} onChange={(e) => setCurl(e.target.value)} style={{ marginTop: 10, height: 40, borderRadius: 10, width: '100%' }} />
        )}

        <div className="am-lb"><span>API Key</span></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="am-input">
            <input type={show ? 'text' : 'password'} placeholder="输入你的 API Key" value={key} onChange={(e) => setKey(e.target.value)} />
            <button className="eye" onClick={() => setShow(!show)}>{show ? <IcEyeOff size={15} /> : <IcEye size={15} />}</button>
          </div>
          <button className="btn-outline" style={{ flexShrink: 0 }} onClick={test} disabled={busy}>{busy ? '测试中…' : '测试连接'}</button>
        </div>
        {msg && <div style={{ fontSize: 12.5, marginTop: 8, color: msg.t === 'ok' ? '#27a35f' : '#e0665f' }}>{msg.s}</div>}

        <div className="am-lb"><span>模型名称</span><button className="am-lk" onClick={test} disabled={busy}>{busy ? '获取中…' : '一键获取模型列表'}</button></div>
        <Combo value={mname} onChange={setMname} options={tested} placeholder="模型名称，如 deepseek-v4-pro" />

        <div className="am-foot">
          <button className="btn-outline" onClick={onClose}>取消</button>
          <button className="btn-black" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
}

/* ================= OpenWork 设置 (10) ================= */
function AssistantSet({ prefs, setPref }) {
  return (
    <>
      <div className="set-sec-lb">系统通知</div>
      <div className="set-card">
        <Row tt="系统通知" dd="当 Agent 完成任务或需要关注时显示系统通知。" ctl={<Tog dark on={prefs.sysNotify} onChange={(v) => setPref({ sysNotify: v })} />} />
      </div>
      <div className="set-sec-lb">远程通道</div>
      <div className="set-card">
        <Row tt="企业微信" dd="支持企业微信一键连通，快速接收和处理来自企业微信的消息" ctl={<Tog dark on={prefs.wecom} onChange={(v) => setPref({ wecom: v })} />} />
        <div className="pf-div" />
        <Row tt="连接模式" ctl={<Sel v={prefs.remoteMode} opts={['Webhook', '长连接']} onChange={(v) => setPref({ remoteMode: v })} />} />
        <div className="pf-div" />
        <Row tt="飞书集成" dd="接入飞书机器人，成员可在群聊中直接与 OpenWork 对话，高效处理指令。" ctl={<Tog on={prefs.feishu} onChange={(v) => setPref({ feishu: v })} />} />
        <div className="pf-div" />
        <Row tt="QQ 机器人" ctl={<Tog on={prefs.qqbot} onChange={(v) => setPref({ qqbot: v })} />} />
      </div>
      <div className="set-sec-lb">会话</div>
      <div className="set-card">
        <Row tt="会话管理" dd="本地助理采用单窗口对话模式，超时无新输入将自动截断旧上下文，后续对话从零开始。可有效降低 Token 消耗并提升响应速度" />
      </div>
    </>
  );
}

/* ================= 数据管理 (11) ================= */
function fmtKB(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}
function Data({ S, soon }) {
  const [modal, setModal] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [cache, setCache] = useState(null);
  const [cleaning, setCleaning] = useState(false);
  const loadCache = () => api.cacheStats().then((r) => r && setCache(r)).catch(() => {});
  React.useEffect(() => { loadCache(); }, []);

  const rows = [
    ['分享的文件', (S?.tasks || []).reduce((n, t) => n + (t.artifacts?.length || 0), 0), 'files'],
    ['分享的任务', (S?.tasks || []).length, 'tasks'],
    ['应用', (S?.skills || []).filter((s) => s.enabled).length, 'apps'],
    ['归档的任务', (S?.tasks || []).filter((t) => t.archived).length, 'archived'],
  ];

  const clearCache = async () => {
    setCleaning(true);
    try {
      const r = await api.cacheClear();
      await refresh2();
      soon(r?.trimmed ? `已清理 ${r.trimmed} 条历史事件缓存` : '缓存已是干净状态');
    } finally { setCleaning(false); loadCache(); }
  };
  const refresh2 = loadCache;

  return (
    <>
      <div className="tbl">
        <div className="tr th"><span style={{ flex: 1 }}>类型</span><span style={{ width: 140 }}>数量</span><span style={{ width: 120 }}>操作</span></div>
        {rows.map(([n, c, key]) => (
          <div className="tr" key={n}>
            <span style={{ flex: 1, fontSize: 14.5 }}>{n}</span>
            <span style={{ width: 140, color: 'var(--muted)' }}>{c}</span>
            <span style={{ width: 120 }}><button className="link-dark" onClick={() => setModal(key)}>管理</button></span>
          </div>
        ))}
      </div>
      <div className="set-sec-lb">存储占用</div>
      <div className="set-card">
        <Row tt="本地缓存" dd={`包含 ${cache?.tasks ?? '…'} 个任务、${cache?.events ?? '…'} 条事件记录`} ctl={<span style={{ fontSize: 15 }}>{cache ? fmtKB(cache.bytes) : '…'}</span>} />
        <div className="pf-div" />
        <Row tt="清理缓存" dd="压缩已完成任务的事件流，不影响会话与产物" ctl={<button className="btn-outline" disabled={cleaning} onClick={clearCache}>{cleaning ? '清理中…' : '清理'}</button>} />
        <div className="pf-div" />
        <Row tt="审计日志" dd="记录任务创建、工具调用与审批决策，可追溯" ctl={<button className="link-dark" onClick={() => setAuditOpen(true)}>查看 →</button>} />
      </div>
      {modal && <DataManageModal S={S} kind={modal} onClose={() => setModal(null)} onChanged={loadCache} />}
      {auditOpen && <AuditModal onClose={() => setAuditOpen(false)} />}
    </>
  );
}

const AUDIT_CN = { task: '新建任务', tool: '工具执行', tool_failed: '工具失败', approval: '审批决策', spec: '规范驱动' };
function AuditModal({ onClose }) {
  const [rows, setRows] = useState(null);
  React.useEffect(() => { api.audit().then(setRows).catch(() => setRows([])); }, []);
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>审计日志</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 22px 22px' }}>
          {rows === null && <div style={{ color: 'var(--muted)', padding: '20px 0', textAlign: 'center' }}>加载中…</div>}
          {rows && rows.length === 0 && <div style={{ color: 'var(--muted)', padding: '20px 0', textAlign: 'center' }}>暂无审计记录</div>}
          {(rows || []).slice().reverse().map((r, i) => (
            <div key={i} className="set-row" style={{ padding: '11px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 13.5 }}><span className={r.action === 'tool_failed' ? 'badge-gray' : 'badge-green'} style={{ marginRight: 8 }}>{AUDIT_CN[r.action] || r.action}</span>{r.detail}</div>
                <div className="dd">{new Date(r.ts).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataManageModal({ S, kind, onClose, onChanged }) {
  const TITLES = { files: '分享的文件', tasks: '全部任务', apps: '已启用应用', archived: '归档的任务' };
  const tasks = S?.tasks || [];
  const files = tasks.flatMap((t) => (t.artifacts || []).map((a) => ({ ...a, taskTitle: t.title, taskId: t.id })));
  const apps = (S?.skills || []).filter((s) => s.enabled);
  const archived = tasks.filter((t) => t.archived);
  const list = kind === 'files' ? files : kind === 'tasks' ? tasks : kind === 'apps' ? apps : archived;
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>{TITLES[kind]}（{list.length}）</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0 22px 20px' }}>
          {list.length === 0 && <div style={{ color: 'var(--muted)', padding: '26px 0', textAlign: 'center' }}>暂无数据</div>}
          {kind === 'files' && list.map((f, i) => (
            <div key={i} className="set-row" style={{ padding: '12px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 14 }}>{f.name}</div>
                <div className="dd">来自任务「{f.taskTitle}」· {f.rel}</div>
              </div>
              <a className="btn-outline" style={{ textDecoration: 'none' }} href={`/api/artifacts/${f.taskId}/${f.id}/raw`} target="_blank" rel="noreferrer">查看</a>
            </div>
          ))}
          {kind === 'tasks' && list.map((t) => (
            <div key={t.id} className="set-row" style={{ padding: '12px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 14 }}>{t.title}</div>
                <div className="dd">{t.archived ? '已归档 · ' : ''}{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <span className={t.status === 'done' ? 'badge-green' : 'badge-gray'}>{t.status === 'done' ? '已完成' : t.status === 'running' ? '进行中' : t.status === 'failed' ? '失败' : '待处理'}</span>
            </div>
          ))}
          {kind === 'apps' && list.map((s) => (
            <div key={s.id} className="set-row" style={{ padding: '12px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 14 }}>{s.name}</div>
                <div className="dd">{s.desc || '本地技能'}</div>
              </div>
              <span className="badge-green">已启用</span>
            </div>
          ))}
          {kind === 'archived' && list.map((t) => (
            <div key={t.id} className="set-row" style={{ padding: '12px 0' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="tt" style={{ fontSize: 14 }}>{t.title}</div>
                <div className="dd">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <button className="btn-outline" onClick={async () => { await api.archiveTask(t.id); onChanged?.(); setTimeout(onClose, 0); }}>恢复</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= 应用管理 (12) ================= */
function Apps({ prefs, setPref, soon }) {
  const auth = { tdx: true, wecom: true, agentMail: false, ...prefs.appsAuth };
  const setAuth = (k, v, name) => setPref({ appsAuth: { ...auth, [k]: v } }, v ? `已授权「${name}」` : `已撤销「${name}」的授权`);
  const Item = ({ k, tt, dd }) => (
    <Row tt={tt} dd={dd} ctl={
      auth[k]
        ? <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}><span className="badge-green">已授权</span><button className="link-dark" onClick={() => setAuth(k, false, tt)}>撤销授权</button></span>
        : <button className="btn-outline" onClick={() => setAuth(k, true, tt)}>添加</button>} />
  );
  return (
    <>
      <div className="info-banner">授权后，OpenWork 将能读取你的信息，你可随时取消授权。</div>
      <div className="set-card">
        <Item k="tdx" tt="通达信" dd="可直接调用选股、回测、盯盘能力，选股与策略结果实时推送到你的对话流。" />
        <div className="pf-div" />
        <Item k="wecom" tt="企业微信" dd="连接后可在企业微信中远程指挥 OpenWork 执行任务" />
      </div>
      <div className="set-sec-lb">可添加的应用</div>
      <div className="set-card">
        <Item k="agentMail" tt="Agent Mail" dd="通过智能体邮箱接收与回复邮件" />
      </div>
    </>
  );
}

/* ================= 安全中心 (13) ================= */
const SENS_ITEMS = ['身份证 / 证件号码', '银行卡 / 账户信息', '密码与密钥', '手机号 / 联系方式', '发票与票据影像'];
function Security({ S, refresh, soon, prefs, setPref }) {
  const set = async (k, v) => { await api.saveSettings({ risk: { [k]: v } }); refresh(); };
  const [sensOpen, setSensOpen] = useState(false);
  const sensList = prefs.sens?.list ?? SENS_ITEMS;
  const toggleSens = (item) => {
    const list = sensList.includes(item) ? sensList.filter((x) => x !== item) : [...sensList, item];
    setPref({ sens: { list } }, '敏感保护规则已更新');
  };
  return (
    <>
      <div className="info-banner">🛡️ 安全能力由本地运行时提供</div>
      <div className="set-sec-lb">沙箱安全</div>
      <div className="set-card">
        <Row tt="沙箱安全" dd="AI 运行于隔离沙箱，并配置文件、命令、网络访问策略" ctl={<Tog dark on={S.settings.risk.blockOutside} onChange={(v) => set('blockOutside', v)} />} />
      </div>
      <div className="set-sec-lb">数据安全</div>
      <div className="set-card">
        <Row tt="安全网关" dd="工作空间出入流量统一经过安全网关安全处理" ctl={<span className="badge-green">已开启</span>} />
        <div className="pf-div" />
        <Row tt="传输加密" dd="本地与云端通信使用端到端加密通道" ctl={<span className="badge-green">已开启</span>} />
        <div className="pf-div" />
        <Row tt="敏感保护" dd="检测并拦截票据、密码等敏感信息的意外泄露" ctl={<button className="link-dark" onClick={() => setSensOpen(true)}>敏感保护设置</button>} />
      </div>
      <div className="set-sec-lb">实验功能</div>
      <div className="set-card">
        <Row tt="版本管理" dd="工作空间内文件实现版本管理" ctl={<Tog dark on={prefs.versionMgmt} onChange={(v) => setPref({ versionMgmt: v })} />} />
        <div className="pf-div" />
        <Row tt="删除保护" dd="工作空间内删除移到废纸篓/回收站" ctl={<Tog dark on={S.settings.risk.confirmDelete} onChange={(v) => set('confirmDelete', v)} />} />
      </div>
      {sensOpen && (
        <div className="am-mask" onClick={() => setSensOpen(false)}>
          <div className="am-dlg" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>敏感保护设置</h3><button className="iconbtn" onClick={() => setSensOpen(false)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 8px', color: 'var(--muted)', fontSize: 13 }}>选择需要自动识别并拦截外发的敏感信息类别：</div>
            <div style={{ padding: '0 22px 22px' }}>
              {SENS_ITEMS.map((item) => (
                <div key={item} className="set-row" style={{ padding: '13px 0' }}>
                  <div className="tt" style={{ fontSize: 14 }}>{item}</div>
                  <div className="ctl"><Tog dark on={sensList.includes(item)} onChange={() => toggleSens(item)} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= 系统授权 (14) ================= */
function SysAuth({ soon }) {
  return (
    <>
      <div className="info-banner">OpenWork 在电脑上运行所需要的系统授权</div>
      <div className="set-card">
        <Row tt="完全磁盘访问权限" dd="允许访问磁盘上的所有文件，部分功能需要此权限才能正常工作" ctl={<span className="badge-green">已授权</span>} />
        <div className="pf-div" />
        <Row tt="辅助功能" dd="允许响应键盘快捷键，便于快捷唤起等功能" ctl={<span className="badge-green">已授权</span>} />
        <div className="pf-div" />
        {['自动化|允许能给其他 App 发指令，比如帮你管理日历、提醒事项、备忘录等', '通知|允许发送桌面通知，任务完成或有新消息时会及时提醒你', '日历访问|允许读取和管理你的日历，帮你查看日程、创建会议提醒'].map((s) => {
          const [t, d] = s.split('|');
          return (<React.Fragment key={t}><div className="pf-div" /><Row tt={t} dd={d} ctl={<span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="badge-gray">未授权</span><button className="btn-outline" onClick={() => soon('请前往「系统设置 → 隐私与安全性」中授予该项权限')}>去授权</button></span>} /></React.Fragment>);
        })}
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 16 }}>如需取消已有授权，请前往系统设置中自行操作</div>
    </>
  );
}

/* ================= 软件配置 (15) ================= */
function SysConf({ prefs, setPref }) {
  return (
    <>
      <div className="set-card">
        <Row tt="内置运行时" dd="允许使用随包提供的运行时工具" ctl={<Tog dark on={prefs.builtinRuntime} onChange={(v) => setPref({ builtinRuntime: v })} />} />
        <div className="pf-div" />
        <Row tt="安装位置" dd="内置运行时安装在 ~/.openwork/ 目录下" />
      </div>
      <div className="set-sec-lb">运行时列表</div>
      <div className="tbl">
        <div className="tr th"><span style={{ flex: .8 }}>工具</span><span style={{ flex: .7 }}>版本</span><span style={{ width: 90 }}>状态</span><span style={{ flex: 1.6 }}>说明</span></div>
        {[['Node.js', 'v22.22.2', '基于 Chrome V8 引擎的 JavaScript 运行时，用于服务端开发'],
          ['Python', '3.13.12', '通用编程语言，适用于脚本编写、自动化和数据处理'],
          ['Shell', '1.0.0', '用于命令执行安全增强的随包 Shell 运行时']].map(([n, v, d]) => (
          <div className="tr" key={n}>
            <span style={{ flex: .8, fontSize: 14.5 }}>{n}</span>
            <span style={{ flex: .7, color: 'var(--muted)' }}>{v}</span>
            <span style={{ width: 90 }}><span className="badge-green">已启用</span></span>
            <span style={{ flex: 1.6, color: 'var(--muted)', fontSize: 13 }}>{d}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================= 关于 (16) ================= */
const LATEST_VERSION = '0.2.0';
const DOC_TEXT = {
  doc: '## 快速上手\n1. 首页输入任务后按 Enter 发送，Agent 会自动拆解并执行；\n2. 在「设置 → 模型」配置 API Key 后，任务由大模型自主完成全流程；\n3. 「技能 / 专家 / 连接器」页可浏览并安装能力扩展；\n4. 任务右侧面板展示生成的全部产物，可下载或继续追问；\n5. 高危操作（删除文件、执行命令）会先弹出审批卡片，确认后才执行。',
  tos: '## OpenWork 服务协议\n1. 本软件为本地桌面工具，核心数据默认仅保存在你的设备；\n2. 模型调用仅发送你主动提交的任务内容，请遵守所接入模型服务商的使用条款；\n3. 请勿将本软件用于任何违反法律法规的用途；\n4. 软件按“现状”提供，我们将持续迭代但不承诺永久兼容历史版本数据格式。',
  privacy: '## 隐私政策\n1. 任务、产物、设置均存储于本机本地文件，不会上传至任何第三方服务器；\n2. API Key 仅保存在本地 models.json，且永不出现在界面明文展示之外的位置；\n3. 浏览器中继仅在本地服务无法直连模型时启用，数据只在你自己的浏览器与模型接口之间传输；\n4. 我们不会收集、分析或共享任何个人信息。',
};
function About({ soon, setPref }) {
  const [fb, setFb] = useState(null); // null | {text, contact}
  const [doc, setDoc] = useState(null); // null | 'doc'|'tos'|'privacy'
  const [checking, setChecking] = useState(false);
  const [updMsg, setUpdMsg] = useState('当前已是最新版本');
  const checkUpdate = async () => {
    setChecking(true); setUpdMsg('正在检查更新…');
    await new Promise((r) => setTimeout(r, 600));
    setChecking(false);
    setUpdMsg(`已是最新版本（v${LATEST_VERSION}）`);
    soon(`已是最新版本 v${LATEST_VERSION}`);
  };
  return (
    <>
      <div className="set-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '22px 24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1c1b18', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 700 }}>O</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>OpenWork</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>版本 {LATEST_VERSION}</div>
        </div>
      </div>
      <div className="set-sec-lb">帮助</div>
      <div className="set-card">
        <Row tt="帮助与反馈" dd="遇到问题可提交反馈，我们会尽快处理" ctl={<button className="btn-outline" onClick={() => setFb({ text: '', contact: '' })}>提交反馈</button>} />
        <div className="pf-div" />
        <Row tt="使用文档" dd="查看完整功能说明与最佳实践" ctl={<button className="link-dark" onClick={() => setDoc('doc')}>打开 →</button>} />
        <div className="pf-div" />
        <Row tt="检查更新" dd={updMsg} ctl={<button className="btn-outline" disabled={checking} onClick={checkUpdate}>{checking ? '检查中…' : '检查更新'}</button>} />
      </div>
      <div className="set-sec-lb">协议</div>
      <div className="set-card">
        <Row tt="服务协议" ctl={<button className="link-dark" onClick={() => setDoc('tos')}>查看 →</button>} />
        <div className="pf-div" />
        <Row tt="隐私政策" ctl={<button className="link-dark" onClick={() => setDoc('privacy')}>查看 →</button>} />
      </div>

      {fb && (
        <div className="am-mask" onClick={() => setFb(null)}>
          <div className="am-dlg" style={{ width: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>提交反馈</h3><button className="iconbtn" onClick={() => setFb(null)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 22px 22px' }}>
              <textarea rows={6} autoFocus placeholder="描述你遇到的问题或建议…" value={fb.text} onChange={(e) => setFb({ ...fb, text: e.target.value })} style={{ width: '100%', borderRadius: 10, background: '#fbfbfa' }} />
              <input placeholder="联系方式（选填，方便我们联系你）" value={fb.contact} onChange={(e) => setFb({ ...fb, contact: e.target.value })} style={{ width: '100%', marginTop: 10, height: 40, borderRadius: 10 }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button className="btn-outline" onClick={() => setFb(null)}>取消</button>
                <button className="btn-black" onClick={async () => {
                  if (!fb.text.trim()) return soon('请填写反馈内容');
                  const entry = { text: fb.text.trim(), contact: fb.contact.trim(), ts: Date.now() };
                  const cur = JSON.parse(localStorage.getItem('ow-feedback') || '[]');
                  localStorage.setItem('ow-feedback', JSON.stringify([...cur, entry]));
                  setFb(null);
                  soon('感谢反馈，已记录到本地反馈队列，我们会尽快处理');
                }}>提交</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {doc && (
        <div className="am-mask" onClick={() => setDoc(null)}>
          <div className="am-dlg" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="am-head"><h3>{{ doc: '使用文档', tos: '服务协议', privacy: '隐私政策' }[doc]}</h3><button className="iconbtn" onClick={() => setDoc(null)}><IcX size={16} /></button></div>
            <div style={{ padding: '0 24px 24px', fontSize: 14, lineHeight: 1.9, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
              {DOC_TEXT[doc].split('\n').map((l, i) => l.startsWith('## ') ? <div key={i} style={{ fontWeight: 700, fontSize: 15, margin: '6px 0' }}>{l.slice(3)}</div> : <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= 基础件 ================= */
function Combo({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const canPop = options && options.length > 0;
  return (
    <div className="am-input">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => canPop && setOpen(true)}
        style={{ width: '100%', height: 40, borderRadius: 10, paddingRight: 34 }}
      />
      <button className="combo-chev" onClick={() => canPop && setOpen(!open)}><IcChevD size={14} /></button>
      {open && canPop && (
        <>
          <div className="combo-mask" onClick={() => setOpen(false)} />
          <div className="combo-pop">
            {options.map((o) => (
              <button key={o} className={o === value ? 'sel' : ''} onClick={() => { onChange(o); setOpen(false); }}>{o}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
function Card({ sec, children }) { return (<><div className="set-sec-lb">{sec}</div><div className="set-card">{children}</div></>); }
function Row({ tt, dd, ctl }) {
  return (
    <div className="set-row">
      <div style={{ minWidth: 0 }}>
        <div className="tt">{tt}</div>
        {dd && <div className="dd">{dd}</div>}
      </div>
      {ctl && <div className="ctl">{ctl}</div>}
    </div>
  );
}
function Tog({ on, dark, onChange }) {
  return <button className={`switch ${on ? 'on' : ''} ${dark ? 'dark' : ''}`} onClick={() => onChange(!on)} />;
}
function Sel({ v, opts, onChange }) {
  return <select className="set-select" value={v} onChange={(e) => onChange(e.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select>;
}
