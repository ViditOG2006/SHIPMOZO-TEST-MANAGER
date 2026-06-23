import { useState } from 'react';
import { Edit2, Lock, Plus, Trash2, X, Save, Globe, Key } from 'lucide-react';
import { useEnvStore, useAppStore } from '../store';

const LOCKED_ROLES = ['Product Manager', 'Developer'];

function EnvModal({ env, onSave, onClose }) {
  const [form, setForm] = useState({ ...env });
  const [newVar, setNewVar] = useState({ key: '', value: '' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: env.color, display: 'inline-block' }} />
              {env.name} Environment
            </div>
            <div className="modal-sub">Configure URLs, credentials, and variables</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Base URL</label>
              <input className="form-input" value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">API URL</label>
              <input className="form-input" value={form.apiUrl} onChange={e => setForm(f => ({ ...f, apiUrl: e.target.value }))} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <div className="form-label" style={{ marginBottom: 10 }}>Configuration Variables</div>
            <table className="data-table">
              <thead><tr><th>Key</th><th>Value</th><th style={{ width: 60 }}>Action</th></tr></thead>
              <tbody>
                {form.variables.map((v, i) => (
                  <tr key={i}>
                    <td><code style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{v.key}</code></td>
                    <td>
                      <input className="form-input" value={v.value} style={{ padding: '4px 8px', fontSize: 12 }}
                        onChange={e => setForm(f => ({ ...f, variables: f.variables.map((vv, ii) => ii === i ? { ...vv, value: e.target.value } : vv) }))} />
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                        onClick={() => setForm(f => ({ ...f, variables: f.variables.filter((_, ii) => ii !== i) }))}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><input className="form-input" value={newVar.key} onChange={e => setNewVar(n => ({ ...n, key: e.target.value }))} placeholder="KEY" style={{ padding: '4px 8px', fontSize: 12 }} /></td>
                  <td><input className="form-input" value={newVar.value} onChange={e => setNewVar(n => ({ ...n, value: e.target.value }))} placeholder="value" style={{ padding: '4px 8px', fontSize: 12 }} /></td>
                  <td>
                    <button className="btn btn-success btn-sm" onClick={() => {
                      if (newVar.key) { setForm(f => ({ ...f, variables: [...f.variables, newVar] })); setNewVar({ key: '', value: '' }); }
                    }}><Plus size={12} /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}><Save size={14} /> Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function EnvironmentManager() {
  const { environments, updateEnvironment } = useEnvStore();
  const role = useAppStore(s => s.role);
  const [editEnv, setEditEnv] = useState(null);

  const isLocked = (env) => env.restricted && LOCKED_ROLES.includes(role);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Environment Management</h1>
          <p className="page-sub">Configure execution environments and variables</p>
        </div>
      </div>

      <div className="two-col">
        {environments.map(env => (
          <div key={env.id} className="card" style={{ borderLeft: `4px solid ${env.color}`, position: 'relative', overflow: 'hidden' }}>
            {isLocked(env) && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(2px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 'inherit',
              }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Lock size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Restricted Access</div>
                  <div style={{ fontSize: 11 }}>QA Lead access required</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${env.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color={env.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{env.name}</div>
                  {env.restricted && <span className="badge badge-red" style={{ fontSize: 10 }}>⚠ Restricted</span>}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditEnv(env)}>
                <Edit2 size={13} /> Edit
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 56, flexShrink: 0, marginTop: 2 }}>Base URL</span>
                <code style={{ fontSize: 11, color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>{env.baseUrl}</code>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 56, flexShrink: 0, marginTop: 2 }}>API URL</span>
                <code style={{ fontSize: 11, color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>{env.apiUrl}</code>
              </div>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Key size={11} /> VARIABLES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {env.variables.map((v, i) => (
                    <div key={i} style={{ background: 'var(--bg-input)', borderRadius: 6, padding: '4px 10px', fontSize: 11 }}>
                      <code style={{ color: 'var(--text-muted)' }}>{v.key}=</code>
                      <code style={{ color: 'var(--text-primary)' }}>{v.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editEnv && (
        <EnvModal
          env={editEnv}
          onSave={(data) => { updateEnvironment(editEnv.id, data); setEditEnv(null); }}
          onClose={() => setEditEnv(null)}
        />
      )}
    </div>
  );
}
