import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, TrendingUp, CheckCircle, XCircle, Clock, Zap,
  ArrowRight, Activity, FolderOpen, GitBranch, Plus, Users, Layers, Copy, Check,
} from 'lucide-react';
import { useExecutionStore, useRepoStore, useAppStore, useAppConfigStore } from '../store';
import { CreateAppModal, JoinAppModal } from '../components/AppWorkspaceModals';
import { ANALYTICS_TREND } from '../data/seedData';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

function MiniTrend({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="passRate" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 8, fontSize: 11 }}
          formatter={(v) => [`${v}%`, 'Pass Rate']}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const setActiveAppId = useAppStore(s => s.setActiveAppId);
  const user = useAppStore(s => s.user);
  const { applications } = useAppConfigStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const rawExecutions = useExecutionStore(s => s.executions);
  const rawModules = useRepoStore(s => s.modules);
  const rawTestCases = useRepoStore(s => s.testCases);
  const role = useAppStore(s => s.role);

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);

  const executions = rawExecutions.filter(matchesApp);
  const modules = rawModules.filter(matchesApp);
  const testCases = rawTestCases.filter(matchesApp);

  const recent = executions.slice(0, 6);
  const totalRuns = executions.length;
  const passed = executions.filter(e => e.status === 'PASSED').length;
  const failed = executions.filter(e => e.status === 'FAILED').length;
  const running = executions.filter(e => e.status === 'RUNNING').length;
  const passRate = totalRuns ? Math.round((passed / totalRuns) * 100) : 0;

  const statusColor = { PASSED: 'var(--success)', FAILED: 'var(--danger)', RUNNING: 'var(--warning)', QUEUED: 'var(--text-muted)', ABORTED: 'var(--text-muted)' };
  const statusBadge = { PASSED: 'badge-green', FAILED: 'badge-red', RUNNING: 'badge-yellow', QUEUED: 'badge-gray', ABORTED: 'badge-gray' };

  const formatDuration = (ms) => {
    if (!ms) return '—';
    const s = Math.floor(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;
  };

  const copyAppId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeApp = applications.find(a => a.id === activeAppId);

  return (
    <div>
      {showCreate && <CreateAppModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinAppModal onClose={() => setShowJoin(false)} />}

      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          Welcome back, <span style={{ color: 'var(--accent-blue-light)' }}>{user?.name || role}</span> 👋
        </h1>
        <p className="page-sub">
          {activeApp
            ? <>Working on <strong style={{ color: 'var(--accent-blue-light)' }}>{activeApp.name}</strong> — switch apps below or from the sidebar.</>
            : 'Create or join an application workspace to get started.'}
        </p>
      </div>

      {/* My Applications */}
      <div className="card" style={{ marginBottom: 28, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>
            <Layers size={16} color="var(--accent-blue)" /> My Applications
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Create App
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowJoin(true)}>
              <Users size={14} /> Join App
            </button>
          </div>
        </div>

        {applications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            border: '1px dashed var(--border-subtle)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              No applications yet. Create your first app or join a team with an App ID.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> Create App
              </button>
              <button className="btn btn-outline" onClick={() => setShowJoin(true)}>
                <Users size={14} /> Join App
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {applications.map(app => {
              const isActive = app.id === activeAppId;
              return (
                <div
                  key={app.id}
                  onClick={() => setActiveAppId(app.id)}
                  style={{
                    padding: 16, borderRadius: 12, cursor: 'pointer',
                    border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'var(--bg-primary)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{app.icon || '🚀'}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {app.name}
                        {isActive && (
                          <span className="badge badge-blue" style={{ fontSize: 9 }}>Active</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <code style={{ fontSize: 10, color: 'var(--accent-purple)' }}>{app.id}</code>
                        <button
                          type="button"
                          className="btn btn-icon"
                          style={{ padding: 2 }}
                          onClick={(e) => { e.stopPropagation(); copyAppId(app.id); }}
                          title="Copy App ID"
                        >
                          {copiedId === app.id ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.baseUrl || 'No URL configured'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 28 }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-dim)' }}>
            <Zap size={18} color="var(--accent-blue-light)" />
          </div>
          <div className="kpi-label">Total Runs</div>
          <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>{totalRuns}</div>
          <div className="kpi-sub"><TrendingUp size={12} color="var(--success)" /> Last 30 days</div>
          <div className="kpi-card-glow" style={{ background: 'var(--accent-blue)' }} />
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--success-dim)' }}>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div className="kpi-label">Passed</div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>{passed}</div>
          <div className="kpi-sub"><TrendingUp size={12} color="var(--success)" /> {passRate}% pass rate</div>
          <div className="kpi-card-glow" style={{ background: 'var(--success)' }} />
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--danger-dim)' }}>
            <XCircle size={18} color="var(--danger)" />
          </div>
          <div className="kpi-label">Failed</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{failed}</div>
          <div className="kpi-sub"><Activity size={12} color="var(--danger)" /> Needs attention</div>
          <div className="kpi-card-glow" style={{ background: 'var(--danger)' }} />
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-dim)' }}>
            <FolderOpen size={18} color="var(--accent-blue-light)" />
          </div>
          <div className="kpi-label">Test Cases</div>
          <div className="kpi-value" style={{ color: 'var(--text-primary)' }}>{testCases.length}</div>
          <div className="kpi-sub">across {modules.length} modules</div>
          <div className="kpi-card-glow" style={{ background: 'var(--accent-blue)' }} />
        </div>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--warning-dim)' }}>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div className="kpi-label">Running Now</div>
          <div className="kpi-value" style={{ color: running > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>{running}</div>
          <div className="kpi-sub">{running > 0 ? '● Active executions' : 'No active runs'}</div>
          <div className="kpi-card-glow" style={{ background: 'var(--warning)' }} />
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Trend */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><TrendingUp size={16} color="var(--accent-blue)" /> Pass Rate Trend (30d)</div>
          </div>
          <MiniTrend data={ANALYTICS_TREND} color="var(--accent-blue)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            <span>30 days ago</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{ANALYTICS_TREND[ANALYTICS_TREND.length-1].passRate}% today</span>
            <span>Today</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><Zap size={16} color="var(--accent-blue)" /> Quick Actions</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Run Smoke Suite', desc: '10 tests · ~2 min', icon: '🚀', to: '/execute', color: 'var(--accent-blue)' },
              { label: 'Build Workflow', desc: 'Chain test steps', icon: '⚙️', to: '/workflows', color: 'var(--accent-purple)' },
              { label: 'View Analytics', desc: 'Trends & insights', icon: '📊', to: '/analytics', color: 'var(--success)' },
              { label: 'Manage Test Data', desc: 'Edit datasets', icon: '🗄️', to: '/test-data', color: 'var(--warning)' },
            ].map(a => (
              <button key={a.label} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 12, padding: '10px 14px' }}
                onClick={() => navigate(a.to)}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Executions */}
      <div className="table-wrapper">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="section-title"><Activity size={16} color="var(--accent-blue)" /> Recent Executions</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>
            View All <ArrowRight size={12} />
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Tests</th>
              <th>Pass Rate</th>
              <th>Duration</th>
              <th>Triggered By</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(ex => {
              const pr = ex.totalTests ? Math.round((ex.passed / ex.totalTests) * 100) : 0;
              return (
                <tr key={ex.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/monitor/' + ex.id)}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent-blue-light)' }}>{ex.runId}</span></td>
                  <td><span className="badge badge-blue">{ex.type}</span></td>
                  <td>
                    <span className={`badge ${statusBadge[ex.status]}`}>
                      <span className={`status-dot ${ex.status.toLowerCase()}`} />
                      {ex.status}
                    </span>
                  </td>
                  <td>
                    <span className="stat-row">
                      <span className="stat-passed">✓{ex.passed}</span>
                      <span className="stat-sep">/</span>
                      <span className="stat-failed">✗{ex.failed}</span>
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ width: 60 }}>
                        <div className={`progress-fill ${pr >= 80 ? 'progress-green' : pr >= 50 ? 'progress-blue' : 'progress-red'}`} style={{ width: `${pr}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{pr}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDuration(ex.duration)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ex.triggeredBy}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(ex.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
