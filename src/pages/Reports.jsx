import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExecutionStore, useEnvStore } from '../store';
import { ChevronDown, ChevronUp, Eye, Download, Filter } from 'lucide-react';

const STATUS_BADGE = {
  PASSED: 'badge-green', FAILED: 'badge-red', RUNNING: 'badge-yellow',
  QUEUED: 'badge-gray', SKIPPED: 'badge-cyan', ABORTED: 'badge-gray',
  AWAITING_SCRIPT: 'badge-purple',
};

function FailureDetail({ step }) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="alert alert-danger">
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{step.errorMsg}</span>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Stack Trace</div>
        <div className="log-console" style={{ maxHeight: 140 }}>
          <div className="log-line"><span className="log-level FAIL">FAIL</span><span className="log-msg FAIL">{step.errorMsg}</span></div>
          <div className="log-line"><span className="log-level DEBUG">INFO</span><span className="log-msg">    at Object.&lt;anonymous&gt; (tests/{step.name?.replace(/\s/g,'')}.spec.js:42:18)</span></div>
          <div className="log-line"><span className="log-level DEBUG">INFO</span><span className="log-msg">    at runner.runTest (playwright/runner.js:218:14)</span></div>
          <div className="log-line"><span className="log-level DEBUG">INFO</span><span className="log-msg">    at processTicksAndRejections (node:internal/process/task_queues:95:5)</span></div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Step Logs</div>
        <div className="log-console" style={{ maxHeight: 140 }}>
          {(step.logs || []).map((log, i) => (
            <div key={i} className="log-line">
              <span className="log-time">{new Date(log.time).toLocaleTimeString()}</span>
              <span className={`log-level ${log.level}`}>{log.level}</span>
              <span className={`log-msg ${log.level}`}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 60, height: 40, background: 'var(--bg-input)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)' }}>📸</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>Screenshot available</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Captured at point of failure</div>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={12} /> Download</button>
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();
  const { executions } = useExecutionStore();
  const { environments } = useEnvStore();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [expandedExec, setExpandedExec] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const filtered = executions.filter(e =>
    (filterStatus === 'All' || e.status === filterStatus) &&
    (filterType === 'All' || e.type === filterType)
  );

  const formatDur = (ms) => {
    if (!ms) return '—';
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;
  };

  const selExec = executions.find(e => e.id === expandedExec);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">{executions.length} total executions · Historical test results</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}><Download size={14} /> Export</button>
      </div>

      {/* Summary Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Runs', value: executions.length, color: 'var(--accent-blue)' },
          { label: 'Passed', value: executions.filter(e => e.status === 'PASSED').length, color: 'var(--success)' },
          { label: 'Failed', value: executions.filter(e => e.status === 'FAILED').length, color: 'var(--danger)' },
          { label: 'Pass Rate', value: `${executions.length ? Math.round(executions.filter(e => e.status === 'PASSED').length / executions.length * 100) : 0}%`, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="kpi-card">
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="var(--text-muted)" />
        <div className="tabs">
          {['All', 'PASSED', 'FAILED', 'RUNNING'].map(s => (
            <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
        <div className="tabs">
          {['All', 'INDIVIDUAL', 'SUITE', 'WORKFLOW', 'MODULE'].map(t => (
            <button key={t} className={`tab-btn ${filterType === t ? 'active' : ''}`} onClick={() => setFilterType(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Execution List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(ex => {
          const pr = ex.totalTests ? Math.round((ex.passed / ex.totalTests) * 100) : 0;
          const isExpanded = expandedExec === ex.id;
          const failedSteps = (ex.steps || []).filter(s => s.status === 'FAILED');

          return (
            <div key={ex.id} className="accordion-item">
              <div className="accordion-header" onClick={() => setExpandedExec(isExpanded ? null : ex.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, flexWrap: 'wrap' }}>
                  {isExpanded ? <ChevronUp size={16} color="var(--accent-blue)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-blue-light)', fontSize: 13 }}>{ex.runId}</span>
                  <span className={`badge ${STATUS_BADGE[ex.status]}`}>
                    <span className={`status-dot ${ex.status.toLowerCase()}`} /> {ex.status}
                  </span>
                  <span className="badge badge-blue">{ex.type}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {environments.find(e => e.id === ex.environmentId)?.name} · {ex.triggeredBy}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className={`progress-fill ${pr >= 80 ? 'progress-green' : pr >= 50 ? 'progress-blue' : 'progress-red'}`} style={{ width: `${pr}%` }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pr >= 80 ? 'var(--success)' : 'var(--danger)' }}>{pr}%</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60 }}>
                    {new Date(ex.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate('/monitor/' + ex.id); }}><Eye size={12} /> Monitor</button>
                </div>
              </div>

              {isExpanded && (
                <div className="accordion-body">
                  {/* Summary Row */}
                  <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Total', value: ex.totalTests, color: 'var(--text-primary)' },
                      { label: 'Passed', value: ex.passed, color: 'var(--success)' },
                      { label: 'Failed', value: ex.failed, color: 'var(--danger)' },
                      { label: 'Skipped', value: ex.skipped, color: 'var(--info)' },
                      { label: 'Duration', value: formatDur(ex.duration), color: 'var(--text-secondary)' },
                      { label: 'Started', value: new Date(ex.startTime).toLocaleTimeString(), color: 'var(--text-muted)' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Step Results */}
                  {(ex.steps || []).length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Test Results</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(ex.steps || []).map((step, i) => (
                          <div key={step.id} style={{ background: 'var(--bg-card)', border: `1px solid ${step.status === 'FAILED' ? 'rgba(239,68,68,0.3)' : 'var(--border-subtle)'}`, borderRadius: 8, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: step.status === 'FAILED' ? 'pointer' : 'default' }}
                              onClick={() => step.status === 'FAILED' && setExpandedStep(expandedStep === `${ex.id}-${i}` ? null : `${ex.id}-${i}`)}>
                              <span style={{ color: 'var(--text-muted)', fontSize: 11, width: 20 }}>{i+1}</span>
                              <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{step.name}</span>
                              <span className={`badge ${STATUS_BADGE[step.status]}`}>{step.status}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 50, textAlign: 'right' }}>{step.duration ? `${(step.duration/1000).toFixed(1)}s` : '—'}</span>
                              {step.status === 'FAILED' && (
                                expandedStep === `${ex.id}-${i}` ? <ChevronUp size={14} color="var(--danger)" /> : <ChevronDown size={14} color="var(--danger)" />
                              )}
                            </div>
                            {step.status === 'FAILED' && expandedStep === `${ex.id}-${i}` && <FailureDetail step={step} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No reports found</div></div>
        )}
      </div>
    </div>
  );
}
