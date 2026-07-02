import { useState } from 'react';
import { useAppConfigStore, useAppStore } from '../store';
import { Plus, Trash2, Settings, Check, Globe, FileCode, Copy, KeyRound } from 'lucide-react';

export default function ApplicationManager() {
  const { applications, addApp, updateApp, deleteApp } = useAppConfigStore();
  const activeAppId = useAppStore(s => s.activeAppId);
  const setActiveAppId = useAppStore(s => s.setActiveAppId);

  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    icon: '🚀',
    description: '',
    baseUrl: '',
    frontendTester: 'Playwright', // Playwright | Selenium
    backendTester: 'Postman Collection', // Postman Collection | Rest Assured
    postmanCollectionId: '',
    postmanEnvironmentId: '',
    restAssuredConfig: '',
    defaultUsername: '',
    defaultPassword: ''
  });

  const allApps = applications;

  const copyAppId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newId = await addApp(form);
    setActiveAppId(newId);
    setShowAddModal(false);
    setForm({
      name: '',
      icon: '🚀',
      description: '',
      baseUrl: '',
      frontendTester: 'Playwright',
      backendTester: 'Postman Collection',
      postmanCollectionId: '',
      postmanEnvironmentId: '',
      restAssuredConfig: '',
      defaultUsername: '',
      defaultPassword: ''
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Application Registry</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Each app gets a unique ID in Firestore. Share it so teammates can sign in. Panel URL, credentials, and Postman config are stored here — not in .env.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register App
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {allApps.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            padding: 48,
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-color)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <h3 style={{ margin: '0 0 8px 0' }}>No applications registered yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Register any web application you want to test — set its URL, Postman collection, and login credentials.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Register Your First App
            </button>
          </div>
        )}
        {allApps.map(app => {
          const isActive = app.id === activeAppId;
          return (
            <div key={app.id} 
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                padding: 24,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isActive ? '0 0 20px rgba(59, 130, 246, 0.15)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ 
                      fontSize: 24, 
                      width: 48, 
                      height: 48, 
                      background: 'var(--bg-primary)', 
                      borderRadius: 12, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid var(--border-color)'
                    }}>
                      {app.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {app.name}
                        {isActive && <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', fontSize: 10, fontWeight: 600 }}>Active</span>}
                      </h3>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <KeyRound size={11} />
                        <code style={{ color: 'var(--accent-purple)', fontSize: 11 }}>{app.id}</code>
                        <button
                          type="button"
                          className="btn btn-icon"
                          style={{ padding: 2, opacity: 0.8 }}
                          title="Copy App ID for team login"
                          onClick={() => copyAppId(app.id)}
                        >
                          {copiedId === app.id ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                      className="btn btn-icon" 
                      onClick={() => deleteApp(app.id)}
                      style={{ color: 'var(--accent-red)', padding: 6, opacity: 0.7 }}
                    >
                      <Trash2 size={15} />
                    </button>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', minHeight: 40, lineHeight: 1.4, margin: '0 0 16px 0' }}>
                  {app.description || 'No description provided.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={12} /> Target URL</span>
                    <span style={{ fontWeight: 500, wordBreak: 'break-all', textAlign: 'right' }}>
                      <a href={app.baseUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
                        {app.baseUrl || 'Not configured'}
                      </a>
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Settings size={12} /> UI Tester</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.frontendTester}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><FileCode size={12} /> API Tester</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.backendTester}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button 
                  className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setActiveAppId(app.id)}
                  style={{ flex: 1, height: 36, fontSize: 12 }}
                  disabled={isActive}
                >
                  {isActive ? <><Check size={14} style={{ marginRight: 6 }} /> Active App</> : 'Select Application'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <div className="modal-title">Register New Application</div>
              <div className="modal-sub">Onboard a software product to start configuring test cases.</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 80 }}>
                    <label className="form-label">Icon</label>
                    <select 
                      value={form.icon}
                      onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                      className="form-input"
                      style={{ fontSize: 20, textAlign: 'center' }}
                    >
                      {['🚀', '📦', '🛒', '💳', '🛡️', '⚡', '📊', '🌐', '🛠️', '🧬', '🤖'].map(emoji => (
                        <option key={emoji} value={emoji}>{emoji}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Application Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. My SaaS Portal"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Provide a brief summary of what this application does..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="form-label">Base/Target URL</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://app.yourdomain.com"
                    value={form.baseUrl}
                    onChange={(e) => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Frontend UI Tester</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {['Playwright', 'Selenium'].map(tech => (
                        <button
                          key={tech}
                          type="button"
                          className={`btn ${form.frontendTester === tech ? 'btn-primary' : 'btn-outline'}`}
                          style={{ flex: 1, padding: '8px 0', fontSize: 12 }}
                          onClick={() => setForm(f => ({ ...f, frontendTester: tech }))}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Backend API Tester</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      {['Postman Collection', 'Rest Assured'].map(tech => (
                        <button
                          key={tech}
                          type="button"
                          className={`btn ${form.backendTester === tech ? 'btn-primary' : 'btn-outline'}`}
                          style={{ flex: 1, padding: '8px 0', fontSize: 11 }}
                          onClick={() => setForm(f => ({ ...f, backendTester: tech }))}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {form.backendTester === 'Postman Collection' ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Postman Collection ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. 12345-abc-de"
                        value={form.postmanCollectionId}
                        onChange={(e) => setForm(f => ({ ...f, postmanCollectionId: e.target.value }))}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Postman Environment ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. 12345-env-xyz"
                        value={form.postmanEnvironmentId}
                        onChange={(e) => setForm(f => ({ ...f, postmanEnvironmentId: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Rest Assured Config / Command Prefix</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. mvn test -Dsuite=BackendTestSuite"
                      value={form.restAssuredConfig}
                      onChange={(e) => setForm(f => ({ ...f, restAssuredConfig: e.target.value }))}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Default Panel Username</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Username/Email"
                      value={form.defaultUsername}
                      onChange={(e) => setForm(f => ({ ...f, defaultUsername: e.target.value }))}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="form-label">Default Panel Password</label>
                    <input 
                      type="password" 
                      className="form-input" 
                      placeholder="Password"
                      value={form.defaultPassword}
                      onChange={(e) => setForm(f => ({ ...f, defaultPassword: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
