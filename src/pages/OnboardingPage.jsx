import { useState } from 'react';
import { useAppStore, useAppConfigStore } from '../store';
import { fetchOne, upsertDoc, COLLECTIONS } from '../firebase/db';
import { Building, Users, ArrowRight, Zap, Globe, Plus, KeyRound } from 'lucide-react';

export default function OnboardingPage() {
  const { user, setActiveAppId } = useAppStore();
  const { addApp } = useAppConfigStore();
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [form, setForm] = useState({
    appName: '', appUrl: '', defaultUsername: '', defaultPassword: '',
    postmanCollectionId: '', postmanEnvironmentId: '',
    frontendTester: 'Playwright', backendTester: 'Postman Collection',
  });
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!form.appName.trim()) return setError('Please enter an application name.');
    setLoading(true);
    setError(null);

    try {
      const appId = await addApp({
        name: form.appName.trim(),
        baseUrl: form.appUrl.trim(),
        icon: '🚀',
        description: `Workspace for ${form.appName.trim()}`,
        frontendTester: form.frontendTester,
        backendTester: form.backendTester,
        postmanCollectionId: form.postmanCollectionId.trim(),
        postmanEnvironmentId: form.postmanEnvironmentId.trim(),
        defaultUsername: form.defaultUsername.trim(),
        defaultPassword: form.defaultPassword,
      });

      setActiveAppId(appId);
      localStorage.setItem('onboarded', 'true');
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Failed to create workspace.');
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return setError('Please enter a team invite code.');
    setLoading(true);
    setError(null);

    try {
      const joinId = joinCode.trim();
      const app = await fetchOne(COLLECTIONS.APPLICATIONS, joinId);
      if (!app) throw new Error('Application not found. Check the App ID.');

      const uid = user?.uid;
      if (!uid || uid === 'demo-uid') throw new Error('Sign in with a real account to join a workspace.');

      const workspace = await fetchOne(COLLECTIONS.WORKSPACES, uid);
      const userDoc = await fetchOne('users', uid);
      const appIds = [...new Set([...(workspace?.appIds || userDoc?.appIds || []), joinId])];
      const memberIds = [...new Set([...(app.memberIds || []), uid])];

      await upsertDoc(COLLECTIONS.WORKSPACES, uid, { appIds, activeAppId: joinId });
      await upsertDoc('users', uid, { appIds, activeAppId: joinId });
      await upsertDoc(COLLECTIONS.APPLICATIONS, joinId, { memberIds });

      setActiveAppId(joinId);
      localStorage.setItem('onboarded', 'true');
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Failed to join team.');
      setLoading(false);
    }
  };

  // ─── Landing: Choose path ─────────────────────────────────────
  if (!mode) {
    return (
      <div style={{
        width: '100%',
        flex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 20% 30%, rgba(90,80,240,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(140,50,240,0.08) 0%, transparent 45%), var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ maxWidth: 720, width: '100%', padding: '0 24px', textAlign: 'center' }}>
          {/* Welcome Header */}
          <div style={{
            width: 64, height: 64, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 0 40px rgba(59,130,246,0.3)',
          }}>⚡</div>

          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px' }}>
            Welcome, {user?.name || 'there'}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 40 }}>
            Let's set up your testing workspace. Choose how you'd like to get started.
          </p>

          {/* Two Paths */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Create New Workspace */}
            <div
              onClick={() => setMode('create')}
              style={{
                flex: '1 1 300px', maxWidth: 340,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: '32px 28px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,130,246,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(59,130,246,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Plus size={24} color="var(--accent-blue)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Create New Workspace</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Register your application, configure testing frameworks, and start building your QA automation suite from scratch.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-blue)', fontWeight: 600, fontSize: 13 }}>
                Get Started <ArrowRight size={14} />
              </div>
            </div>

            {/* Join Existing Team */}
            <div
              onClick={() => setMode('join')}
              style={{
                flex: '1 1 300px', maxWidth: 340,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: '32px 28px', cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-purple)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.15)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(139,92,246,0.12)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Users size={24} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Join Existing Team</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
                Enter a team invite code to join an existing workspace. Access shared test suites, workflows, and execution reports.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-purple)', fontWeight: 600, fontSize: 13 }}>
                Join Team <ArrowRight size={14} />
              </div>
            </div>
          </div>

          {/* Demo shortcut */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { localStorage.setItem('onboarded', 'true'); window.location.href = '/'; }}
              className="btn btn-outline"
              style={{ padding: '8px 20px', fontSize: 12, gap: 6 }}
            >
              <Zap size={13} /> Skip — Explore Demo Workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Create Workspace Form ────────────────────────────────────
  if (mode === 'create') {
    return (
      <div style={{
        width: '100%',
        flex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 20% 30%, rgba(90,80,240,0.08) 0%, transparent 45%), var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ maxWidth: 460, width: '100%', padding: '0 24px' }}>
          <button onClick={() => { setMode(null); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back
          </button>

          <div style={{
            width: 48, height: 48, marginBottom: 16,
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 0 24px rgba(59,130,246,0.25)',
          }}>🚀</div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Create Your Workspace</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
            Register the application you want to test. You can add more later.
          </p>

          {error && (
            <div style={{ marginBottom: 16, fontSize: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Application Name *</label>
              <div style={{ position: 'relative' }}>
                <Building size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: 34 }} placeholder="e.g. My E-Commerce App" value={form.appName} onChange={e => setForm(f => ({ ...f, appName: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Application URL</label>
              <div style={{ position: 'relative' }}>
                <Globe size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input type="url" className="form-input" style={{ paddingLeft: 34 }} placeholder="https://my-app.com" value={form.appUrl} onChange={e => setForm(f => ({ ...f, appUrl: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">UI Testing</label>
                <select className="form-input" value={form.frontendTester} onChange={e => setForm(f => ({ ...f, frontendTester: e.target.value }))}>
                  <option>Playwright</option>
                  <option>Selenium</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">API Testing</label>
                <select className="form-input" value={form.backendTester} onChange={e => setForm(f => ({ ...f, backendTester: e.target.value }))}>
                  <option>Postman Collection</option>
                  <option>Rest Assured</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 42, marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating…' : 'Create Workspace & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Join Team Form ───────────────────────────────────────────
  if (mode === 'join') {
    return (
      <div style={{
        width: '100%',
        flex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 80% 30%, rgba(139,92,246,0.08) 0%, transparent 45%), var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ maxWidth: 420, width: '100%', padding: '0 24px' }}>
          <button onClick={() => { setMode(null); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Back
          </button>

          <div style={{
            width: 48, height: 48, marginBottom: 16,
            background: 'linear-gradient(135deg, var(--accent-purple), #EC4899)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 0 24px rgba(139,92,246,0.25)',
          }}>👥</div>

          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Join an Existing Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
            Enter the invite code or workspace ID shared by your team administrator.
          </p>

          {error && (
            <div style={{ marginBottom: 16, fontSize: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleJoinTeam} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Invite Code or Workspace ID *</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={14} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: 34 }} placeholder="e.g. APP-1719912345678" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 42, marginTop: 8 }} disabled={loading}>
              {loading ? 'Joining…' : 'Join Workspace'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>💡 How to get an invite code:</strong><br />
            Ask your team admin to share the Workspace ID from the Application Registry page (e.g. <code style={{ color: 'var(--accent-purple)' }}>APP-1719912345678</code>).
          </div>
        </div>
      </div>
    );
  }
}
