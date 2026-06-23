import { useNavigate } from 'react-router-dom';
import {
  Play, TrendingUp, CheckCircle, XCircle, Clock, Zap,
  ArrowRight, Activity, FolderOpen, GitBranch
} from 'lucide-react';
import { useExecutionStore, useRepoStore, useAppStore } from '../store';
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
  const executions = useExecutionStore(s => s.executions);
  const { modules, testCases } = useRepoStore();
  const role = useAppStore(s => s.role);

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

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title" style={{ fontSize: 26 }}>
          Welcome back, <span style={{ color: 'var(--accent-blue-light)' }}>{role}</span> 👋
        </h1>
        <p className="page-sub">Here's your automation execution overview for today.</p>
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
