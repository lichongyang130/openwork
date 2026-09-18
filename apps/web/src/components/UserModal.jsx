import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { IcGear, IcSpark, IcBolt, IcBrain, IcPalette, IcHelp, IcRefresh, IcCoin, IcChevR, IcX, IcCheck } from '../icons.jsx';

const goSettings = (page) => { window.dispatchEvent(new CustomEvent('ow-open-settings', { detail: { page } })); };

export default function UserModal({ onClose, openSettings }) {
  const [toast, setToast] = useState('');
  const [points, setPoints] = useState(null);
  const [modal, setModal] = useState(null); // null | 'station' | 'growth'
  const soon = (m = '该功能即将上线，敬请期待') => { setToast(m); setTimeout(() => setToast(''), 1800); };

  useEffect(() => {
    api.state().then((s) => setPoints(s?.settings?.prefs?.points ?? 1286)).catch(() => setPoints(1286));
  }, []);

  const addPoints = async (delta, msg) => {
    const s = await api.state().catch(() => null);
    const cur = s?.settings?.prefs?.points ?? points ?? 1286;
    await api.saveSettings({ prefs: { points: cur + delta } });
    setPoints(cur + delta);
    soon(msg);
  };

  return (
    <>
      <div className="pop-backdrop" onClick={onClose} />
      <div className="user-pop" onClick={(e) => e.stopPropagation()}>
        <div className="up-head">
          <div className="avatar" style={{ width: 34, height: 34 }}>L</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>lichongyang</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted2)' }}>AI 原生桌面智能体工作台</div>
          </div>
          <button className="iconbtn" style={{ marginLeft: 'auto' }} onClick={onClose}><IcX size={15} /></button>
        </div>

        <div className="mb" style={{ padding: '8px 10px', gap: 0, position: 'relative' }}>
          <Row icon={<IcRefresh size={15} />} label="版本" right={<span style={{ color: 'var(--muted2)', fontSize: 12.5 }}>v0.2.0</span>} chev onClick={() => { onClose(); goSettings('about'); }} />
          <Row icon={<IcCoin size={15} />} label="积分余额" right={<span style={{ color: 'var(--accent)', fontSize: 12.5, fontWeight: 600 }}>{points == null ? '…' : points.toLocaleString() + ' 积分'}</span>} chev onClick={() => { onClose(); goSettings('points'); }} />
          <Row icon={<IcBolt size={15} />} label="openwork 加油站" chev onClick={() => setModal('station')} />
          <Row icon={<IcSpark size={15} />} label="成长计划" chev onClick={() => setModal('growth')} />
          <Row icon={<IcGear size={15} />} label="设置" onClick={() => { onClose(); openSettings(); }} />
          <Row icon={<IcBrain size={15} />} label="记忆与进化" chev onClick={() => { onClose(); goSettings('memory'); }} />
          <Row icon={<IcPalette size={15} />} label="外观" right={<span className="badge ready">外观上新</span>} onClick={() => { onClose(); goSettings('appearance'); }} />
          <Row icon={<IcHelp size={15} />} label="帮助与反馈" chev onClick={() => { onClose(); goSettings('about'); }} />
          <Row icon={<IcRefresh size={15} />} label="检查更新" chev onClick={() => { onClose(); goSettings('about'); }} />

          {toast && (
            <div style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', background: 'var(--dark)', color: '#fff', fontSize: 12.5, padding: '7px 16px', borderRadius: '999px', boxShadow: '0 6px 20px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }}>
              {toast}
            </div>
          )}
        </div>
      </div>

      {modal === 'station' && <StationModal onClose={() => setModal(null)} addPoints={addPoints} onGo={() => { setModal(null); onClose(); goSettings('points'); }} goLabel="前往套餐与积分 →" />}
      {modal === 'growth' && <GrowthModal onClose={() => setModal(null)} onGo={() => { setModal(null); onClose(); goSettings('profile'); }} goLabel="前往个人主页 →" />}
    </>
  );
}

const DAILY = [
  { id: 'checkin', name: '每日签到', pts: 5, desc: '每天打开 OpenWork 点一下即可领取' },
  { id: 'task', name: '完成 1 个任务', pts: 10, desc: '让 OpenWork 帮你完成任意一个任务' },
  { id: 'feedback', name: '提交 1 条反馈', pts: 5, desc: '在「关于 → 帮助与反馈」中提交建议' },
];
function StationModal({ onClose, addPoints, onGo, goLabel }) {
  const today = new Date().toDateString();
  const [claims, setClaims] = useState(() => {
    const raw = JSON.parse(localStorage.getItem('ow-station') || '{}');
    return raw.date === today ? raw.done : [];
  });
  const save = (list) => { setClaims(list); localStorage.setItem('ow-station', JSON.stringify({ date: today, done: list })); };
  const claim = async (d) => {
    if (claims.includes(d.id)) return;
    save([...claims, d.id]);
    await addPoints(d.pts, `领取成功，+${d.pts} 积分`);
  };
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>openwork 加油站</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 8px', color: 'var(--muted)', fontSize: 13 }}>每日任务，完成即可领取积分（每日刷新）</div>
        <div style={{ padding: '0 22px 22px' }}>
          {DAILY.map((d) => {
            const done = claims.includes(d.id);
            return (
              <div key={d.id} className="set-row" style={{ padding: '13px 0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tt" style={{ fontSize: 14 }}>{d.name} <span style={{ color: 'var(--accent)', fontSize: 12 }}>+{d.pts}</span></div>
                  <div className="dd">{d.desc}</div>
                </div>
                <button className={done ? 'btn-outline' : 'btn-black'} disabled={done} style={done ? { opacity: .6 } : {}} onClick={() => claim(d)}>{done ? <><IcCheck size={12} /> 已领取</> : '领取'}</button>
              </div>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button className="link-dark" onClick={onGo}>{goLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const LEVELS = [
  { lv: 'Lv.1 新手上路', need: 0 }, { lv: 'Lv.2 熟练搭档', need: 3 },
  { lv: 'Lv.3 高效伙伴', need: 10 }, { lv: 'Lv.4 资深同事', need: 30 }, { lv: 'Lv.5 全能助手', need: 100 },
];
function GrowthModal({ onClose, onGo, goLabel }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.state().then(setStats).catch(() => setStats({})); }, []);
  const done = (stats?.tasks || []).filter((t) => t.status === 'done').length;
  const artifacts = (stats?.tasks || []).reduce((n, t) => n + (t.artifacts?.length || 0), 0);
  let li = 0;
  LEVELS.forEach((l, i) => { if (done >= l.need) li = i; });
  const cur = LEVELS[li];
  const next = LEVELS[li + 1];
  return (
    <div className="am-mask" onClick={onClose}>
      <div className="am-dlg" style={{ width: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="am-head"><h3>成长计划</h3><button className="iconbtn" onClick={onClose}><IcX size={16} /></button></div>
        <div style={{ padding: '0 22px 22px' }}>
          <div className="info-banner">完成任务即可提升等级，解锁更默契的协作体验。</div>
          <div style={{ display: 'flex', gap: 24, margin: '16px 0' }}>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{cur.lv}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{next ? `再完成 ${next.need - done} 个任务升级` : '已达最高等级'}</div></div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: '#eeece8', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${next ? Math.min(100, ((done - cur.need) / (next.need - cur.need)) * 100) : 100}%`, background: 'var(--accent)', borderRadius: 4 }} />
          </div>
          <div className="set-row" style={{ padding: '14px 0' }}><div className="tt" style={{ fontSize: 14 }}>累计完成任务</div><span className="num">{done}</span></div>
          <div className="set-row" style={{ padding: '14px 0' }}><div className="tt" style={{ fontSize: 14 }}>累计产出成果</div><span className="num">{artifacts}</span></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <button className="link-dark" onClick={onGo}>{goLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, right, chev, onClick }) {
  return (
    <button className="um-row" onClick={onClick}>
      <span className="ic">{icon}</span>
      <span className="lb">{label}</span>
      {right}
      {chev && <span className="chev"><IcChevR size={13} /></span>}
    </button>
  );
}
