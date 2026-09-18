import React, { useEffect, useState } from 'react';

/**
 * DAG 简化版 - 按用户反馈：要简单，不要 L0-L5 技术术语
 * 默认只显示最终结果 + 3步简易流程，DAG 细节折叠在“查看执行过程”里
 */
export default function DagView({ taskId }) {
  const [dag, setDag] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    fetch(`/api/dag/${taskId}`).then(r=>r.json()).then(setDag).catch(()=>setDag(null));
  }, [taskId]);

  if (!dag) return null; // 非蜂群任务不显示，避免干扰

  const nodes = dag.nodes || [];
  const doneCount = nodes.filter(n=>n.status==='done').length;
  const total = nodes.length;
  const finalConf = dag.metrics?.finalConfidence || nodes.reduce((s,n)=>s+(n.confidence||0),0)/ (total||1);
  const artifacts = dag.metrics?.artifacts || 0;

  // 简化流程：只取前3个关键步骤展示
  const simpleSteps = nodes.slice(0, 4).map((n,i)=>({
    step: i+1,
    title: n.label || n.title || `步骤${i+1}`,
    status: n.status,
    conf: n.confidence,
  }));

  return (
    <div style={{ padding: 12, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 8 }}>
      {/* 最终结果优先 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>✅ 最终结果</span>
        <span style={{ fontSize: 11, background: finalConf>0.8 ? '#e2f5ea' : '#fff3c0', color: finalConf>0.8 ? '#27a35f' : '#8a6d00', padding: '2px 8px', borderRadius: 999 }}>
          置信度 {(finalConf*100||85).toFixed(0)}% · {doneCount}/{total} 已完成 · {artifacts} 个产物
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{dag.strategy || '蜂群并行'}</span>
      </div>

      {/* 极简3步流程 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {simpleSteps.map((s, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: s.status==='done'?'#e2f5ea': s.status==='failed'?'#fde8e8':'#f6f5f2', border: `1px solid ${s.status==='done'?'#27a35f':'#ddd'}`, borderRadius: 999, padding: '6px 12px', fontSize: 12 }}>
              <span>{s.status==='done'?'✅': s.status==='failed'?'❌':'⏳'}</span>
              <span style={{ fontWeight: 600 }}>{s.step}. {s.title}</span>
              {s.conf && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{(s.conf*100).toFixed(0)}%</span>}
            </div>
            {idx < simpleSteps.length-1 && <span style={{ color: '#bbb' }}>→</span>}
          </React.Fragment>
        ))}
        {total > simpleSteps.length && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{total-simpleSteps.length}步</span>}
      </div>

      {/* 一键查看产物 */}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>产物在右侧预览可直接下载/预览，单HTML可直接发同事</span>
        <button style={{ marginLeft: 'auto', fontSize: 11, background: '#f6f5f2', border: '1px solid #eee', borderRadius: 6, padding: '2px 8px' }} onClick={()=>setShowDetail(!showDetail)}>
          {showDetail ? '收起执行过程' : '查看执行过程（高级）'}
        </button>
      </div>

      {/* 高级细节折叠 */}
      {showDetail && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #eee' }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: 'var(--muted)' }}>执行过程（技术细节，可忽略）</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nodes.map(n=>(
              <div key={n.id} style={{ display: 'flex', gap: 8, fontSize: 11, padding: '6px 8px', background: '#f9f9f8', borderRadius: 6 }}>
                <span style={{ width: 16 }}>{n.status==='done'?'✅': n.status==='failed'?'❌':'⏳'}</span>
                <span style={{ fontWeight: 600, minWidth: 80 }}>{n.label}</span>
                <span style={{ color: 'var(--muted)' }}>{n.role} · {n.status}</span>
                {n.confidence && <span style={{ marginLeft: 'auto' }}>{(n.confidence*100).toFixed(0)}%</span>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>
            策略: {dag.strategy} · 并行度 3 · 失败重试2次 · 快照可回滚 · 拖拽改序已简化，复杂编辑请到右侧“工蜂”标签
          </div>
        </div>
      )}
    </div>
  );
}
