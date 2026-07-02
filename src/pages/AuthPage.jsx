import { useState } from 'react';
import { useAppStore } from '../store';
import { Mail, Lock, User, Zap, CheckCircle2 } from 'lucide-react';

const ERROR_MAP = {
  'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in Firebase Console.',
  'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/too-many-requests': 'Too many failed attempts. Try again later.',
};

export default function AuthPage() {
  const { login, signup, loginDemo } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      const code = err.code || '';
      setError(ERROR_MAP[code] || err.message || 'Authentication failed.');
      setLoading(false);
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
              Test any webapp.<br />
              <span className="auth-headline-accent">One account, many apps.</span>
            </h1>

            <p className="auth-lead">
              Sign in once, then create or join application workspaces from your dashboard. Each app gets a unique ID — switch between them anytime.
            </p>

            <div className="auth-feature-list">
              {[
                { title: 'Multi-app workspaces', desc: 'Work on several applications from a single account.' },
                { title: 'Config in Firestore', desc: 'URL, credentials, and Postman IDs stored per app in the database.' },
                { title: 'Create & join on dashboard', desc: 'Add new apps or join teammates after you sign in.' },
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
                {isRegister
                  ? 'Register free — set up apps from the dashboard after sign-in.'
                  : 'Sign in with your email and password.'}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isRegister && (
                <Field label="Full Name *" icon={User} value={form.name}
                  onChange={v => setField('name', v)} placeholder="John Doe" />
              )}
              <Field label="Email *" icon={Mail} type="email" value={form.email}
                onChange={v => setField('email', v)} placeholder="you@company.com" />
              <Field label="Password *" icon={Lock} type="password" value={form.password}
                onChange={v => setField('password', v)} placeholder="••••••••" />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 4 }} disabled={loading}>
                {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: 13, marginTop: 20 }}>
              <span style={{ color: 'var(--text-muted)' }}>
                {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                onClick={() => { setIsRegister(!isRegister); setError(null); }}
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0', opacity: 0.5 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo</div>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
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

function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder }) {
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
          required
        />
      </div>
    </div>
  );
}
