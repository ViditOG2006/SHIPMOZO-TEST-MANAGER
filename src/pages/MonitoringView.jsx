import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExecutionStore, useEnvStore } from '../store';
import { Square, ArrowLeft, RefreshCw, Activity } from 'lucide-react';

const STATUS_BADGE = {
  PASSED: 'badge-green', FAILED: 'badge-red', RUNNING: 'badge-yellow',
  QUEUED: 'badge-gray', SKIPPED: 'badge-cyan', ABORTED: 'badge-gray',
};

function LiveClock({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Date.now() - new Date(startTime).getTime()), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  const s = Math.floor(elapsed / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function MonitoringView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { executions, abortExecution, activeExecutionId } = useExecutionStore();
  const { environments } = useEnvStore();

  const [selectedId, setSelectedId] = useState(id || activeExecutionId || null);
  const [, forceRender] = useState(0);

  // Auto-refresh
  useEffect(() => {
    const iv = setInterval(() => forceRender(n => n + 1), 1500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (id) setSelectedId(id);
    else if (activeExecutionId) setSelectedId(activeExecutionId);
  }, [id, activeExecutionId]);

  const exec = executions.find(e => e.id === selectedId);
  const recentExecs = executions.slice(0, 10);

  const formatDur = (ms) => {
    if (!ms) return '—';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/60)}m ${s%60}s`;
  };

  const allLogs = exec?.steps?.flatMap(s => (s.logs || []).map(l => ({ ...l, stepName: s.name, stepStatus: s.status }))) || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Monitor</h1>
          <p className="page-sub">Real-time execution tracking</p>
        </div>
        {exec?.status === 'RUNNING' && (
          <button className="btn btn-danger" onClick={() => abortExecution(selectedId)}>
            <Square size={14} /> Stop Execution
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, minHeight: 0 }}>
        {/* Execution List */}
        <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 2px' }}>Recent Runs</div>
          {recentExecs.map(ex => (
            <div key={ex.id} onClick={() => setSelectedId(ex.id)}
              style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                background: selectedId === ex.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
                border: `1px solid ${selectedId === ex.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                transition: 'var(--transition)',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--accent-blue-light)', fontWeight: 600 }}>{ex.runId}</span>
                <span className={`badge ${STATUS_BADGE[ex.status]}`} style={{ fontSize: 10 }}>
                  <span className={`status-dot ${ex.status.toLowerCase()}`} /> {ex.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {ex.type} · {ex.totalTests} tests
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {exec ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {/* Header Card */}
            <div className={`card exec-status-${exec.status.toLowerCase()}`} style={{ background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: 'var(--accent-blue-light)' }}>{exec.runId}</span>
                    <span className={`badge ${STATUS_BADGE[exec.status]}`}>
                      <span className={`status-dot ${exec.status.toLowerCase()}`} /> {exec.status}
                    </span>
                    <span className="badge badge-blue">{exec.type}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {exec.label || exec.referenceId} · {environments.find(e => e.id === exec.environmentId)?.name} · By {exec.triggeredBy}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: exec.status === 'RUNNING' ? 'var(--warning)' : exec.status === 'PASSED' ? 'var(--success)' : 'var(--danger)' }}>
                    {exec.progress}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {exec.status === 'RUNNING' ? <LiveClock startTime={exec.startTime} /> : formatDur(exec.duration)}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="progress-bar" style={{ height: 8, marginBottom: 12 }}>
                <div className={`progress-fill ${exec.status === 'PASSED' ? 'progress-green' : exec.status === 'FAILED' ? 'progress-red' : 'progress-blue'}`}
                  style={{ width: `${exec.progress}%` }} />
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total', value: exec.totalTests, color: 'var(--text-primary)' },
                  { label: 'Passed', value: exec.passed, color: 'var(--success)' },
                  { label: 'Failed', value: exec.failed, color: 'var(--danger)' },
                  { label: 'Skipped', value: exec.skipped, color: 'var(--info)' },
                  { label: 'Started', value: new Date(exec.startTime).toLocaleTimeString(), color: 'var(--text-secondary)' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="two-col" style={{ flex: 1, minHeight: 0, alignItems: 'start' }}>
              {/* Steps Table */}
              <div className="table-wrapper">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 13 }}>
                  <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
                  Test Steps
                </div>
                <table className="data-table">
                  <thead><tr><th>#</th><th>Test Case</th><th>Status</th><th>Duration</th></tr></thead>
                  <tbody>
                    {(exec.steps || []).map((step, i) => (
                      <tr key={step.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{step.name}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[step.status]}`}>
                            <span className={`status-dot ${step.status.toLowerCase()}`} /> {step.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {step.duration ? `${(step.duration / 1000).toFixed(1)}s` : step.status === 'RUNNING' ? '…' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Log */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} color="var(--accent-blue)" className={exec.status === 'RUNNING' ? 'spin' : ''} />
                  Execution Logs
                </div>
                <div className="log-console">
                  {allLogs.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 12 }}>Waiting for logs…</div>
                  )}
                  {allLogs.map((log, i) => (
                    <div key={i} className="log-line">
                      <span className="log-time">{new Date(log.time).toLocaleTimeString()}</span>
                      <span className={`log-level ${log.level}`}>{log.level}</span>
                      <span className={`log-msg ${log.level}`}>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">📡</div>
              <div className="empty-state-title">No execution selected</div>
              <div className="empty-state-sub">Select a run from the left or trigger one from Execution Center</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/execute')}>
                <Activity size={14} /> Go to Execution Center
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
