import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { IcSpark, IcSearch, IcBolt } from '../icons.jsx';

/**
 * Gene基因记忆 + GDI + Marketplace 完整页
 * 融合办公省心：越用越聪明，站在别人经验上开工
 */
export default function GeneMarket({ S, refresh }) {
  const [genes, setGenes] = useState(S?.genes || []);
  const [mkt, setMkt] = useState([]);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('mine'); // mine | market

  useEffect(() => {
    api.listGenes().then(setGenes).catch(()=>{});
    api.listMarketGenes().then(setMkt).catch(()=>{});
  }, []);

  const search = async () => {
    const g = await api.listGenes(q);
    setGenes(g);
    const m = await api.listMarketGenes(q);
    setMkt(m);
  };

  const install = async (id) => {
    const g = await api.installMarketGene(id);
    if (g) {
      setGenes([g, ...genes]);
      refresh();
    }
  };

  return (
    <div className="page">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>🧬 Gene基因记忆 <span style={{ fontSize: 12, background: '#f6f0ff', padding: '2px 8px', borderRadius: 999, color: '#6b4bd0' }}>自进化·越用越聪明</span></h2>
      <div className="sub">有效经验固化为技能，第一次试错多，第二次复用更快，GDI质量评分，前后对比是最直观证据。解决“教100遍还是新手”失忆痛点。</div>

      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--muted2)' }}><IcSearch size={14} /></span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜索Gene，如 周报/发票/报告/显存..." style={{ width: '100%', paddingLeft: 32 }} onKeyDown={e=>e.key==='Enter'&&search()} />
        </div>
        <button className="btn-outline" onClick={search}>搜索</button>
        <button className={`btn ${tab==='mine'?'primary':'ghost'}`} onClick={()=>setTab('mine')}>我的Gene {genes.length}</button>
        <button className={`btn ${tab==='market'?'primary':'ghost'}`} onClick={()=>setTab('market')}>Marketplace {mkt.length}</button>
      </div>

      {tab === 'mine' ? (
        <div className="card-grid">
          {genes.map(g => (
            <div key={g.id} className="skill-card" style={{ borderLeft: `3px solid ${g.gdi>90?'#27a35f':g.gdi>80?'#6aa7ff':'#f0b45c'}` }}>
              <div className="h"><IcSpark size={14} /> {g.claim.slice(0, 24)} <span className="tag" style={{ background: g.gdi>90?'#e2f5ea':g.gdi>80?'#e8f2fe':'#fff4dc', color: g.gdi>90?'#27a35f':g.gdi>80?'#3d8fe0':'#d99a2b' }}>GDI {g.gdi}</span></div>
              <div className="d">{g.from} · 使用{g.usage||0}次 · {(g.evidence||[]).join(' / ').slice(0, 60)}</div>
              <div className="f" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(g.createdAt).toLocaleDateString()}</span>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="btn ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={async()=>{ await api.updateGeneGDI(g.id, 1); const ng=await api.listGenes(); setGenes(ng); }}>👍 +1</button>
                  <button className="btn ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={async()=>{ await api.deleteGene(g.id); setGenes(genes.filter(x=>x.id!==g.id)); }}>删除</button>
                </span>
              </div>
            </div>
          ))}
          {genes.length===0 && <div className="empty">暂无Gene，运行蜂群任务后自动沉淀。第一次试错好几轮，第二次复用更快，前后对比最直观。</div>}
        </div>
      ) : (
        <div className="card-grid">
          {mkt.map(m => (
            <div key={m.id} className="skill-card" style={{ background: '#fffef5' }}>
              <div className="h"><span style={{ background: '#fff3c0', borderRadius: 6, padding: '2px 6px' }}>🌸</span> {m.claim.slice(0, 28)} <span className="tag">GDI {m.gdi}</span></div>
              <div className="d">{m.from} · 下载{m.downloads} · {m.tag} · {(m.evidence||[]).join(' / ')}</div>
              <div className="f" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>社区验证·可直接复用</span>
                <button className="btn primary" style={{ marginLeft: 'auto', fontSize: 12, padding: '5px 12px' }} onClick={()=>install(m.id)}><IcBolt size={12} /> 安装</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: '#fffbe6', borderRadius: 12, border: '1px solid #f0e6b8' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>💡 自进化机制（来自EvoX视频验证）</div>
        <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text2)' }}>
          <div>• 开关在右上角，默认开，定期把修复优化存本机，关了不沉淀</div>
          <div>• 第一次执行试错好几轮，第二次复用Gene更快，前后对比是最直观证据</div>
          <div>• GDI 0-100分，基于复用次数成功率点赞，过滤低质量技能</div>
          <div>• Marketplace搜“写作”“周报”出一列带GDI评分，直接复用，站在别人跑通经验上开工</div>
          <div>• 越用越顺手：教1遍记住，教100遍成专家，解决“失忆”痛点</div>
        </div>
      </div>
    </div>
  );
}
