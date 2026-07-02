import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore, useAppConfigStore } from '../store';
import {
  LayoutDashboard, FolderOpen, Database, GitBranch,
  Play, Globe, Activity, FileText, ChevronRight,
  Layers, Users
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
  { section: 'Test Assets' },
  { to: '/repository', label: 'Test Repository', icon: FolderOpen, roles: ['QA Engineer','QA Lead'] },
  { to: '/test-data', label: 'Test Data', icon: Database, roles: ['QA Engineer','QA Lead'] },
  { to: '/workflows', label: 'Workflow Builder', icon: GitBranch, roles: ['QA Engineer','QA Lead'] },
  { section: 'Configuration' },
  { to: '/applications', label: 'Applications', icon: Layers, roles: ['QA Engineer','QA Lead'] },
  { to: '/team', label: 'Team Members', icon: Users, roles: ['QA Engineer','QA Lead'] },
  { to: '/environments', label: 'Environments', icon: Globe, roles: ['QA Engineer','QA Lead'] },
  { section: 'Execution' },
  { to: '/execute', label: 'Execution Center', icon: Play, roles: ['QA Engineer','QA Lead','Product Manager','Developer'] },
  { section: 'Insights' },
  { to: '/monitor', label: 'Live Monitor', icon: Activity, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
  { to: '/reports', label: 'Reports', icon: FileText, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
];

export default function Sidebar() {
  const role = useAppStore(s => s.role);
  const activeAppId = useAppStore(s => s.activeAppId);
  const setActiveAppId = useAppStore(s => s.setActiveAppId);
  const { applications } = useAppConfigStore();

  const activeApp = applications.find(a => a.id === activeAppId) || applications[0];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 12 }}>
        <div className="sidebar-logo-icon">{activeApp?.icon || '⚡'}</div>
        <div style={{ flex: 1 }}>
          <div className="sidebar-logo-text" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {activeApp?.name || 'Test Manager'}
          </div>
          <div className="sidebar-logo-sub">Automation Platform</div>
        </div>
      </div>

      <div style={{ padding: '0 12px 12px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Active App</label>
        <select 
          value={activeAppId || activeApp?.id || ''}
          onChange={(e) => setActiveAppId(e.target.value)}
          className="form-input"
          style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          disabled={applications.length === 0}
        >
          {applications.length === 0 ? (
            <option value="">Register an app first</option>
          ) : (
            applications.map(app => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.id})
              </option>
            ))
          )}
        </select>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item, idx) => {
          if (item.section) {
            return <div key={idx} className="sidebar-section-label">{item.section}</div>;
          }
          if (!item.roles.includes(role)) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-item-icon" size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          Test Manager v1.0{activeApp?.name ? ` · ${activeApp.name}` : ''}
        </div>
      </div>
    </aside>
  );
}
