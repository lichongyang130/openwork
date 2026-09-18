import React from 'react';

export default function SwarmToggle({ enabled, onToggle, count }) {
  return (
    <button className={`swarm-toggle ${enabled ? 'on' : ''}`} onClick={onToggle} title={enabled ? '蜂群模式已开启，复杂任务自动拆解并行' : '开启蜂群模式，复杂问题变多个简单问题并行处理'}>
      <span className="icon">🐝</span>
      <span className="label">Swarm</span>
      {enabled && <span className="dot" />}
      {count > 0 && <span className="count">{count}</span>}
    </button>
  );
}
