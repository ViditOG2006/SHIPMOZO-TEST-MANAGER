import { useState } from 'react';
import { useAppConfigStore, useAppStore } from '../store';
import { Building, Globe, FileCode, KeyRound, X } from 'lucide-react';

const emptyCreateForm = {
  name: '',
  icon: '🚀',
  description: '',
  baseUrl: '',
  frontendTester: 'Playwright',
  backendTester: 'Postman Collection',
  postmanCollectionId: '',
  postmanEnvironmentId: '',
  defaultUsername: '',
  defaultPassword: '',
};

export function CreateAppModal({ onClose, onCreated }) {
  const { addApp } = useAppConfigStore();
  const setActiveAppId = useAppStore(s => s.setActiveAppId);
  const [form, setForm] = useState(emptyCreateForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const appId = await addApp(form);
      setActiveAppId(appId);
      onCreated?.(appId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create application.');
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Create Application" subtitle="Register a new app workspace — config is stored in Firestore." onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="app-modal-form">
        <ModalField label="Application Name *" icon={Building} value={form.name}
          onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="My Web App" />
        <ModalField label="Target App URL *" icon={Globe} type="url" value={form.baseUrl}
          onChange={v => setForm(f => ({ ...f, baseUrl: v }))} placeholder="https://app.example.com" />
        <div className="app-modal-row">
          <ModalField label="Panel Login Email" icon={Building} value={form.defaultUsername}
            onChange={v => setForm(f => ({ ...f, defaultUsername: v }))} placeholder="For Playwright UI tests" required={false} />
          <ModalField label="Panel Password" type="password" value={form.defaultPassword}
            onChange={v => setForm(f => ({ ...f, defaultPassword: v }))} placeholder="Stored in Firestore" required={false} />
        </div>
        <div className="app-modal-row">
          <ModalField label="Postman Collection ID" icon={FileCode} value={form.postmanCollectionId}
            onChange={v => setForm(f => ({ ...f, postmanCollectionId: v }))} placeholder="Optional" required={false} />
          <ModalField label="Postman Environment ID" icon={FileCode} value={form.postmanEnvironmentId}
            onChange={v => setForm(f => ({ ...f, postmanEnvironmentId: v }))} placeholder="Optional" required={false} />
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating…' : 'Create Application'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function JoinAppModal({ onClose, onJoined }) {
  const { joinApp } = useAppConfigStore();
  const [appId, setAppId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const joinedId = await joinApp(appId);
      onJoined?.(joinedId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join application.');
      setLoading(false);
    }
  };

  return (
    <ModalShell title="Join Application" subtitle="Enter the App ID shared by your team admin." onClose={onClose}>
      {error && <ErrorBanner message={error} />}
      <form onSubmit={handleSubmit} className="app-modal-form">
        <ModalField label="Application ID *" icon={KeyRound} value={appId}
          onChange={setAppId} placeholder="APP-1719912345678-ABC123" />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          You can belong to multiple apps. Joining adds this workspace to your dashboard — switch between apps anytime from the sidebar.
        </p>
        <div className="modal-footer" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Joining…' : 'Join Application'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="modal-title">{title}</div>
            <div className="modal-sub">{subtitle}</div>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ModalField({ label, icon: Icon, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div className="form-group" style={{ margin: 0, flex: 1 }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />}
        <input
          type={type}
          className="form-input"
          style={{ paddingLeft: Icon ? 34 : 12 }}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div style={{
      marginBottom: 14, fontSize: 12, padding: '10px 14px', borderRadius: 8,
      background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171',
    }}>
      {message}
    </div>
  );
}
