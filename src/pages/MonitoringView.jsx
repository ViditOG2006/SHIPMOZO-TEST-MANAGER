import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExecutionStore, useEnvStore, useAppStore } from '../store';
import { Square, ArrowLeft, RefreshCw, Activity } from 'lucide-react';

const STATUS_BADGE = {
  PASSED: 'badge-green', FAILED: 'badge-red', RUNNING: 'badge-yellow',
  QUEUED: 'badge-gray', SKIPPED: 'badge-cyan', ABORTED: 'badge-gray',
  AWAITING_SCRIPT: 'badge-purple',
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
  const activeAppId = useAppStore(s => s.activeAppId);
  const { executions: rawExecs, abortExecution, activeExecutionId } = useExecutionStore();
  const { environments } = useEnvStore();

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const executions = rawExecs.filter(matchesApp);

  const [selectedId, setSelectedId] = useState(id || activeExecutionId || null);
  const [, forceRender] = useState(0);

  // AI Script Writer state
  const [genState, setGenState] = useState({ status: 'idle', logs: [], error: null });
  const [generating, setGenerating] = useState(false);

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

  const handleGenerateScript = async () => {
    const step = exec?.steps?.find(s => s.status === 'AWAITING_SCRIPT');
    if (!step) return;

    setGenerating(true);
    setGenState({ status: 'running', logs: [{ time: new Date().toISOString(), msg: 'Requesting script generation from backend...' }], error: null });

    try {
      const res = await fetch('/api/e2e/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId: exec.id,
          stepId: step.id,
          testCaseName: step.name,
          scriptId: step.missingFlow || step.scriptId
        })
      });
      const data = await res.json();
      if (!res.ok || !data.jobId) {
        throw new Error(data.error || 'Failed to start generation job');
      }

      pollJobStatus(data.jobId);
    } catch (err) {
      setGenState({ status: 'error', logs: [], error: err.message });
      setGenerating(false);
    }
  };

  const pollJobStatus = (jobId) => {
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/e2e/generate-script/status/${jobId}`);
        if (!res.ok) throw new Error('Failed to fetch job status');
        const job = await res.json();

        setGenState({
          status: job.status,
          logs: job.logs || [],
          error: job.error || null
        });

        if (job.status === 'done' || job.status === 'error') {
          clearInterval(iv);
          setGenerating(false);
        }
      } catch (err) {
        clearInterval(iv);
        setGenState({ status: 'error', logs: [], error: err.message });
        setGenerating(false);
      }
    }, 1500);
  };

  const handleRetryStep = async () => {
    const step = exec?.steps?.find(s => s.status === 'AWAITING_SCRIPT');
    if (!step) return;

    try {
      const res = await fetch('/api/e2e/retry-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionId: exec.id,
          stepId: step.id
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to retry step');
      }
      setGenState({ status: 'idle', logs: [], error: null });
    } catch (err) {
      alert(`Retry failed: ${err.message}`);
    }
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

            {exec.status === 'AWAITING_SCRIPT' && (
              <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--warning)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: 14, marginBottom: 2 }}>AI Script Writer: Missing Script Detected</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      The E2E test case <strong>"{exec.steps.find(s => s.status === 'AWAITING_SCRIPT')?.name}"</strong> requires a script flow (<code>{exec.steps.find(s => s.status === 'AWAITING_SCRIPT')?.missingFlow || 'unknown'}</code>) which is currently not defined in the workspace. You can have Claude write this script by navigating the panel.
                    </div>
                  </div>
                </div>

                {genState.status === 'idle' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleGenerateScript} disabled={generating}>
                      🤖 Generate Script with AI
                    </button>
                  </div>
                )}

                {genState.status === 'running' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--warning)' }}>
                      <RefreshCw size={12} className="spin" />
                      <span>Claude is launching a browser to observe the panel and generate python script...</span>
                    </div>
                    <div className="log-console" style={{ maxHeight: 120, overflowY: 'auto', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', fontSize: 11, fontFamily: 'monospace', borderRadius: 'var(--radius-sm)' }}>
                      {genState.logs.map((log, i) => (
                        <div key={i} style={{ color: '#94a3b8', marginBottom: 2 }}>
                          <span style={{ opacity: 0.4, marginRight: 6 }}>[{new Date(log.time).toLocaleTimeString()}]</span>
                          <span>{log.msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {genState.status === 'done' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✓ Script generated and registered successfully!</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-success btn-sm" onClick={handleRetryStep}>
                        ▶ Run Test Case Now
                      </button>
                    </div>
                  </div>
                )}

                {genState.status === 'error' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: 12 }}>
                      ⚠️ Error: {genState.error}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary btn-sm" onClick={handleGenerateScript}>
                        Retry Generation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
