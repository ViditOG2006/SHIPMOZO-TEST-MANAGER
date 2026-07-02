import { useState } from 'react';
import { useAppStore } from '../store';
import {
  Mail, Lock, User, Building, Zap, CheckCircle2,
  KeyRound, Globe, FileCode, ArrowLeft,
} from 'lucide-react';

const ERROR_MAP = {
  'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Console.',
  'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many failed attempts. Try again later.',
  'auth/missing-app-id': 'Application ID is required.',
  'auth/invalid-app-id': 'Application not found. Check your App ID.',
  'auth/app-access-denied': 'You are not a member of this application workspace.',
};

export default function AuthPage() {
  const { login, signupCreate, signupJoin, loginDemo } = useAppStore();
  const [mode, setMode] = useState('login'); // login | create | join
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    appId: '',
    name: '',
    email: '',
    password: '',
    appName: '',
    baseUrl: '',
    defaultUsername: '',
    defaultPassword: '',
    postmanCollectionId: '',
    postmanEnvironmentId: '',
  });

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleError = (err) => {
    const code = err.code || '';
    setError(ERROR_MAP[code] || err.message || 'Authentication failed.');
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.email, form.password, form.appId);
    } catch (err) {
      handleError(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signupCreate({
        email: form.email,
        password: form.password,
        name: form.name,
        appName: form.appName,
        baseUrl: form.baseUrl,
        defaultUsername: form.defaultUsername,
        defaultPassword: form.defaultPassword,
        postmanCollectionId: form.postmanCollectionId,
        postmanEnvironmentId: form.postmanEnvironmentId,
      });
    } catch (err) {
      handleError(err);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signupJoin({
        email: form.email,
        password: form.password,
        name: form.name,
        appId: form.appId,
      });
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <aside className="auth-pitch-panel">
          <div className="auth-pitch-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div className="auth-logo-mark">⚡</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>Test Manager</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Multi-App Test Orchestration
                </div>
              </div>
            </div>

            <h1 className="auth-headline">
              One App ID.<br />
              <span className="auth-headline-accent">Your whole test workspace.</span>
            </h1>

            <p className="auth-lead">
              Register your webapp in the database with a unique App ID. Team members sign in with that ID — panel URL, credentials, and Postman config are loaded from Firestore, not .env.
            </p>

            <div className="auth-feature-list">
              {[
                { title: 'App ID = Tenant Key', desc: 'Every user authenticates against a specific application workspace ID.' },
                { title: 'Config in Firestore', desc: 'Target URL, panel login, and Postman collection IDs live in the database per app.' },
                { title: 'Invite by App ID', desc: 'Share your App ID so teammates can join the same workspace.' },
              ].map((item, idx) => (
                <div key={idx} className="auth-feature-item">
                  <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="auth-form-panel">
          <div className="auth-form-wrap">
            {mode !== 'login' && (
              <button
                type="button"
                className="auth-back-btn"
                onClick={() => { setMode('login'); setError(null); }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            )}

            <div className="auth-mode-tabs">
              {[
                { id: 'login', label: 'Sign In' },
                { id: 'create', label: 'Create App' },
                { id: 'join', label: 'Join App' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`btn ${mode === tab.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ flex: 1, fontSize: 12, padding: '8px 0' }}
                  onClick={() => { setMode(tab.id); setError(null); }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
              {mode === 'login' && 'Sign in to your app workspace'}
              {mode === 'create' && 'Register a new application'}
              {mode === 'join' && 'Join an existing application'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
              {mode === 'login' && 'Use your App ID, email, and password.'}
              {mode === 'create' && 'Creates a unique App ID and stores all config in Firestore.'}
              {mode === 'join' && 'Enter the App ID shared by your team admin.'}
              </p>
            </div>

            {error && (
            <div style={{
              marginBottom: 16, fontSize: 12, padding: '10px 14px', borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171', lineHeight: 1.5,
            }}>
              {error}
            </div>
            )}

            {mode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Application ID *" icon={KeyRound} value={form.appId} onChange={v => setField('appId', v)} placeholder="APP-1719912345678-ABC123" />
              <Field label="Email *" icon={Mail} type="email" value={form.email} onChange={v => setField('email', v)} placeholder="you@company.com" />
              <Field label="Password *" icon={Lock} type="password" value={form.password} onChange={v => setField('password', v)} placeholder="••••••••" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 4 }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Your Name *" icon={User} value={form.name} onChange={v => setField('name', v)} placeholder="John Doe" />
              <Field label="Your Email *" icon={Mail} type="email" value={form.email} onChange={v => setField('email', v)} placeholder="you@company.com" />
              <Field label="Password *" icon={Lock} type="password" value={form.password} onChange={v => setField('password', v)} placeholder="••••••••" />
              <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
              <Field label="Application Name *" icon={Building} value={form.appName} onChange={v => setField('appName', v)} placeholder="My Web App" />
              <Field label="Target App URL *" icon={Globe} type="url" value={form.baseUrl} onChange={v => setField('baseUrl', v)} placeholder="https://app.example.com" />
              <Field label="Panel Login Email *" icon={Mail} value={form.defaultUsername} onChange={v => setField('defaultUsername', v)} placeholder="For Playwright UI tests" />
              <Field label="Panel Login Password *" icon={Lock} type="password" value={form.defaultPassword} onChange={v => setField('defaultPassword', v)} placeholder="Stored in Firestore" />
              <Field label="Postman Collection ID" icon={FileCode} value={form.postmanCollectionId} onChange={v => setField('postmanCollectionId', v)} placeholder="Optional — for API runs" required={false} />
              <Field label="Postman Environment ID" icon={FileCode} value={form.postmanEnvironmentId} onChange={v => setField('postmanEnvironmentId', v)} placeholder="Optional" required={false} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 4 }} disabled={loading}>
                {loading ? 'Creating…' : 'Create App & Sign In'}
              </button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Application ID *" icon={KeyRound} value={form.appId} onChange={v => setField('appId', v)} placeholder="APP-1719912345678-ABC123" />
              <Field label="Your Name *" icon={User} value={form.name} onChange={v => setField('name', v)} placeholder="John Doe" />
              <Field label="Your Email *" icon={Mail} type="email" value={form.email} onChange={v => setField('email', v)} placeholder="you@company.com" />
              <Field label="Password *" icon={Lock} type="password" value={form.password} onChange={v => setField('password', v)} placeholder="••••••••" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 4 }} disabled={loading}>
                {loading ? 'Joining…' : 'Join & Sign In'}
              </button>
            </form>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0', opacity: 0.5 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} color="var(--accent-yellow)" /> Explore without setup
            </div>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', fontSize: 12 }}
              onClick={() => { setError(null); loginDemo('QA Lead'); }}
            >
              Log In as QA Lead (Demo)
            </button>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, required = true }) {
  return (
    <div className="form-group" style={{ margin: 0 }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        <input
          type={type}
          className="form-input"
          style={{ paddingLeft: 34 }}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
        />
      </div>
    </div>
  );
}
