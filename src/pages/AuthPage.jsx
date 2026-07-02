import { useState } from 'react';
import { useAppStore } from '../store';
import { Mail, Lock, User, Shield, Building, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const { login, signup, loginDemo } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', orgName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await signup(form.email, form.password, form.name, form.orgName);
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      // Clean up Firebase error message formats
      const cleanMsg = err.message.replace('Firebase:', '').replace(/\(auth\/.*\)\.?/, '').trim();
      setError(cleanMsg || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setError(null);
    loginDemo(role);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'radial-gradient(circle at 10% 20%, rgba(90, 80, 240, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(140, 50, 240, 0.08) 0%, transparent 45%), var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left side: Pitch Panel (Hidden on small screens) */}
      <div className="auth-pitch-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        borderRight: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.3)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 44,
            height: 44,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 0 20px rgba(59,130,246,0.3)'
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>AEP CLOUD</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Enterprise Automation SaaS</div>
          </div>
        </div>

        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
          Cloud Scale Testing <br/>
          <span style={{ background: 'linear-gradient(135deg, #60A5FA, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Built for Modern Teams.
          </span>
        </h1>
        
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 480, marginBottom: 40 }}>
          Deploy, manage, and scale Playwright E2E UI testing and Postman API runs inside a unified workspace. Get AI self-healing diagnostics and instant screenshot walkthroughs.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
          {[
            { title: 'Multi-Tenant Isolation', desc: 'Secure data boundaries for multiple applications and project components.' },
            { title: 'Hybrid Runner Orchestration', desc: 'Run Newman collections alongside Selenium/Playwright scripts in the cloud.' },
            { title: 'Team-Wide Collaboration', desc: 'Invite engineers, leads, and product owners to unified live run monitors.' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 14 }}>
              <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side: Auth Form Panel */}
      <div style={{
        width: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '40px 60px',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              {isRegister ? 'Create SaaS Account' : 'Welcome back'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
              {isRegister ? 'Start building your workspace for free.' : 'Sign in to access your testing environments.'}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 18, fontSize: 12 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: 34 }} 
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <div style={{ position: 'relative' }}>
                    <Building size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: 34 }} 
                      placeholder="e.g. Acme Corp"
                      value={form.orgName}
                      onChange={(e) => setForm(f => ({ ...f, orgName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: 34 }} 
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                {!isRegister && (
                  <span style={{ fontSize: 11, color: 'var(--accent-blue)', cursor: 'pointer' }}>Forgot?</span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: 34 }} 
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 40, marginTop: 8 }} disabled={loading}>
              {loading ? 'Authenticating...' : isRegister ? 'Create Workspace' : 'Sign In'}
            </button>
          </form>

          {/* Toggle Screen Mode */}
          <div style={{ textAlign: 'center', fontSize: 13, marginTop: 20 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <span 
              style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setError(null); setIsRegister(!isRegister); }}
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0', opacity: 0.5 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Or Evaluate Instance</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          {/* Demo Bypass Panel */}
          <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} color="var(--accent-yellow)" /> Fast-Track Demo
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '8px 0', fontSize: 12, justifyContent: 'center' }}
                onClick={() => handleDemoLogin('QA Lead')}
              >
                Log In as QA Lead (Full Access)
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '8px 0', fontSize: 12, justifyContent: 'center' }}
                onClick={() => handleDemoLogin('Developer')}
              >
                Log In as Developer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
