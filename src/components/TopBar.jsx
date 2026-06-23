import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronDown, Check } from 'lucide-react';
import { useAppStore } from '../store';

const BREADCRUMB_MAP = {
  '/': 'Dashboard',
  '/repository': 'Test Repository',
  '/test-data': 'Test Data Management',
  '/workflows': 'Workflow Builder',
  '/execute': 'Execution Center',
  '/environments': 'Environments',
  '/monitor': 'Live Monitor',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
};

const ROLE_COLORS = {
  'QA Engineer': '#3B82F6',
  'QA Lead': '#8B5CF6',
  'Product Manager': '#F59E0B',
  'Developer': '#06B6D4',
  'Management': '#10B981',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { role, roles, setRole, notifications, markAllRead } = useAppStore();
  const [showRoles, setShowRoles] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const page = BREADCRUMB_MAP[pathname] || BREADCRUMB_MAP[Object.keys(BREADCRUMB_MAP).find(k => pathname.startsWith(k) && k !== '/') || '/'];

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span className="breadcrumb-item">AEP</span>
        <span className="breadcrumb-sep"><ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} /></span>
        <span className="breadcrumb-item active">{page}</span>
      </div>

      <div className="topbar-actions">
        {/* Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            className="role-badge"
            onClick={() => { setShowRoles(v => !v); setShowNotifs(false); }}
            style={{ color: ROLE_COLORS[role] }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: ROLE_COLORS[role], display: 'inline-block' }} />
            {role}
            <ChevronDown size={12} />
          </button>
          {showRoles && (
            <div className="dropdown-menu" style={{ minWidth: 200 }}>
              <div style={{ padding: '4px 10px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Switch Role</div>
              {roles.map(r => (
                <div key={r} className="dropdown-item" onClick={() => { setRole(r); setShowRoles(false); }}
                  style={{ color: r === role ? ROLE_COLORS[r] : undefined }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: ROLE_COLORS[r], display: 'inline-block', flexShrink: 0 }} />
                  {r}
                  {r === role && <Check size={13} style={{ marginLeft: 'auto' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => { setShowNotifs(v => !v); setShowRoles(false); markAllRead(); }}>
            <Bell size={16} />
            {unread > 0 && <span className="notif-dot" />}
          </button>
          {showNotifs && (
            <div className="dropdown-menu" style={{ minWidth: 280, right: 0 }}>
              <div style={{ padding: '4px 10px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Notifications</div>
              {notifications.map(n => (
                <div key={n.id} className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{n.msg}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="user-avatar" title={role}>
          {role.split(' ').map(w => w[0]).join('').slice(0,2)}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(showRoles || showNotifs) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setShowRoles(false); setShowNotifs(false); }} />
      )}
    </header>
  );
}
