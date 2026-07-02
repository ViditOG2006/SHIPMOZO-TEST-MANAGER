import { useState } from 'react';
import { TrendingUp, AlertTriangle, Activity, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ANALYTICS_TREND, MODULE_STATS, FAILING_TESTS } from '../data/seedData';
import { useExecutionStore, useAppStore } from '../store';

const COLORS = { passed: '#10B981', failed: '#EF4444', running: '#F59E0B' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 11, color: p.color, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{p.name}</span><span style={{ fontWeight: 700 }}>{p.value}{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const activeAppId = useAppStore(s => s.activeAppId);
  const { executions: rawExecs } = useExecutionStore();

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const executions = rawExecs.filter(matchesApp);
  const [range, setRange] = useState('30d');

  const slicedTrend = range === '7d' ? ANALYTICS_TREND.slice(-7) : range === '14d' ? ANALYTICS_TREND.slice(-14) : ANALYTICS_TREND;
  const avgPass = Math.round(slicedTrend.reduce((acc, d) => acc + d.passRate, 0) / slicedTrend.length);

  const totalByEnv = { QA: 0, UAT: 0, Local: 0, Production: 0 };
  executions.forEach(e => {
    const env = ['ENV-001','ENV-002','ENV-003','ENV-004'];
    const names = ['Local','QA','UAT','Production'];
    const idx = env.indexOf(e.environmentId);
    if (idx >= 0) totalByEnv[names[idx]]++;
  });
  const envData = Object.entries(totalByEnv).map(([name, value]) => ({ name, value }));
  const envColors = ['#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444'];

  const moduleChartData = MODULE_STATS.map(m => ({ ...m, passRate: Math.round(m.passed / (m.passed + m.failed) * 100) }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Historical Analytics</h1>
          <p className="page-sub">Execution trends, module health, and failure insights</p>
        </div>
        <div className="tabs">
          {['7d', '14d', '30d'].map(r => (
            <button key={r} className={`tab-btn ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Avg Pass Rate', value: `${avgPass}%`, sub: `over ${slicedTrend.length} days`, color: avgPass >= 80 ? 'var(--success)' : 'var(--danger)', icon: '📈' },
          { label: 'Total Executions', value: executions.length, sub: 'all time', color: 'var(--accent-blue-light)', icon: '🚀' },
          { label: 'Unique Testers', value: 5, sub: 'contributors', color: 'var(--accent-purple)', icon: '👥' },
          { label: 'Top Failing', value: FAILING_TESTS[0]?.name?.split(' ').slice(0,2).join(' '), sub: `${FAILING_TESTS[0]?.failCount} failures`, color: 'var(--danger)', icon: '⚠️' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-icon" style={{ background: 'var(--bg-input)', fontSize: 18 }}>{kpi.icon}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value" style={{ color: kpi.color, fontSize: 22 }}>{kpi.value}</div>
            <div className="kpi-sub">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="section-header">
            <div className="section-title"><TrendingUp size={16} color="var(--accent-blue)" /> Pass Rate Trend</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={slicedTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} interval={range === '7d' ? 0 : range === '14d' ? 1 : 4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2} dot={false} name="Pass Rate" unit="%" />
              <Line type="monotone" dataKey="failRate" stroke="#EF4444" strokeWidth={2} dot={false} name="Fail Rate" unit="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header">
            <div className="section-title"><BarChart2 size={16} color="var(--accent-purple)" /> Module Health</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moduleChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="passRate" name="Pass Rate" fill="#3B82F6" radius={[0, 4, 4, 0]} unit="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="two-col" style={{ marginBottom: 20 }}>
        {/* Pass/Fail by Module stacked bar */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><Activity size={16} color="var(--success)" /> Pass vs Fail by Module</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MODULE_STATS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="passed" stackId="a" fill="#10B981" name="Passed" radius={[0,0,0,0]} />
              <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Runs by Env Donut */}
        <div className="card">
          <div className="section-header">
            <div className="section-title"><Activity size={16} color="var(--warning)" /> Runs by Environment</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={envData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {envData.map((_, i) => <Cell key={i} fill={envColors[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {envData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: envColors[i], flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{d.name}</span>
                  <span style={{ fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Failing Tests */}
      <div className="card">
        <div className="section-header">
          <div className="section-title"><AlertTriangle size={16} color="var(--danger)" /> Top Failing Test Cases</div>
        </div>
        <table className="data-table">
          <thead><tr><th>#</th><th>Test Case</th><th>Module</th><th>Failures</th><th>Last Failed</th><th>Stability</th></tr></thead>
          <tbody>
            {FAILING_TESTS.map((t, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 14 }}>#{i+1}</td>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td><span className="badge badge-blue">{t.module}</span></td>
                <td><span className="badge badge-red">{t.failCount} failures</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.lastFailed}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill progress-red" style={{ width: `${Math.min(t.failCount * 10, 100)}%` }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Unstable</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
