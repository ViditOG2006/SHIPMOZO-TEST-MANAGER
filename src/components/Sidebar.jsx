import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import {
  LayoutDashboard, FolderOpen, Database, GitBranch,
  Play, Globe, Activity, BarChart3, FileText, ChevronRight
} from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
  { section: 'Test Assets' },
  { to: '/repository', label: 'Test Repository', icon: FolderOpen, roles: ['QA Engineer','QA Lead'] },
  { to: '/test-data', label: 'Test Data', icon: Database, roles: ['QA Engineer','QA Lead'] },
  { to: '/workflows', label: 'Workflow Builder', icon: GitBranch, roles: ['QA Engineer','QA Lead'] },
  { section: 'Execution' },
  { to: '/execute', label: 'Execution Center', icon: Play, roles: ['QA Engineer','QA Lead','Product Manager','Developer'] },
  { to: '/environments', label: 'Environments', icon: Globe, roles: ['QA Engineer','QA Lead'] },
  { section: 'Insights' },
  { to: '/monitor', label: 'Live Monitor', icon: Activity, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['QA Engineer','QA Lead','Product Manager','Management'] },
  { to: '/reports', label: 'Reports', icon: FileText, roles: ['QA Engineer','QA Lead','Product Manager','Developer','Management'] },
];

export default function Sidebar() {
  const role = useAppStore(s => s.role);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <div>
          <div className="sidebar-logo-text">Shipmozo AEP</div>
          <div className="sidebar-logo-sub">Test Platform</div>
        </div>
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
          AEP v1.0 · Shipmozo QA
        </div>
      </div>
    </aside>
  );
}
