import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, X, Tag } from 'lucide-react';
import { useRepoStore, useAppStore } from '../store';

const AUTOMATION_TYPES = ['UI', 'API'];
const STATUS_OPTIONS = ['Active', 'Draft', 'Deprecated'];
const MODULES_ICONS = ['📦','💰','📍','🚚','✈️','🔐','📋','🔧','📊','🌐'];

function ModuleModal({ mod, onSave, onClose }) {
  const [form, setForm] = useState(mod || { name: '', description: '', icon: '📦' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{mod ? 'Edit Module' : 'Create Module'}</div>
            <div className="modal-sub">Define a logical test module</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Module Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {MODULES_ICONS.map(ic => (
                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{ fontSize: 22, padding: 6, background: form.icon === ic ? 'var(--accent-blue-dim)' : 'var(--bg-input)', border: `1px solid ${form.icon === ic ? 'var(--accent-blue)' : 'var(--border-soft)'}`, borderRadius: 8, cursor: 'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Module Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Orders, Wallet" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what this module covers..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>
            {mod ? 'Save Changes' : 'Create Module'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestCaseModal({ tc, modules, onSave, onClose }) {
  const [form, setForm] = useState(tc || { name: '', description: '', type: 'UI', scriptId: '', moduleId: modules[0]?.id || '', tags: [], status: 'Active' });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{tc ? 'Edit Test Case' : 'Add Test Case'}</div>
            <div className="modal-sub">Define a test case reference in the repository</div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Test Case Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Add Single Order" />
            </div>
            <div className="form-group">
              <label className="form-label">Module *</label>
              <select className="form-select" value={form.moduleId} onChange={e => setForm(f => ({ ...f, moduleId: e.target.value }))}>
                {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this test case verify?" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Automation Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {AUTOMATION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Script Identifier</label>
              <input className="form-input" value={form.scriptId} onChange={e => setForm(f => ({ ...f, scriptId: e.target.value }))} placeholder="e.g. orders/addSingleOrder" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTag()} placeholder="Add tag + Enter" />
                <button className="btn btn-secondary btn-sm" onClick={addTag}><Plus size={14} /></button>
              </div>
              {form.tags.length > 0 && (
                <div className="tags-wrap" style={{ marginTop: 6 }}>
                  {form.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <span className="tag-remove" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}>×</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>
            {tc ? 'Save Changes' : 'Add Test Case'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestRepository() {
  const activeAppId = useAppStore(s => s.activeAppId);
  const rawModules = useRepoStore(s => s.modules);
  const rawTestCases = useRepoStore(s => s.testCases);
  const { addModule, updateModule, deleteModule, addTestCase, updateTestCase, deleteTestCase } = useRepoStore();

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);

  const modules = rawModules.filter(matchesApp);
  const testCases = rawTestCases.filter(matchesApp);

  const [expandedModule, setExpandedModule] = useState(null);
  const [search, setSearch] = useState('');
  const [modModal, setModModal] = useState(null); // null | 'create' | moduleObj
  const [tcModal, setTcModal] = useState(null);   // null | 'create' | tcObj
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredTCs = (moduleId) => testCases.filter(tc =>
    tc.moduleId === moduleId &&
    (typeFilter === 'All' || tc.type === typeFilter) &&
    (tc.name.toLowerCase().includes(search.toLowerCase()) || tc.tags.some(t => t.includes(search.toLowerCase())))
  );

  const typeBadge = { UI: 'badge-purple', API: 'badge-cyan' };
  const statusBadge = { Active: 'badge-green', Draft: 'badge-yellow', Deprecated: 'badge-red' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Repository</h1>
          <p className="page-sub">{modules.length} modules · {testCases.length} test cases</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setModModal('create')}>
            <Plus size={14} /> New Module
          </button>
          <button className="btn btn-primary" onClick={() => setTcModal('create')}>
            <Plus size={14} /> Add Test Case
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={14} className="search-icon" />
          <input className="form-input search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search test cases, tags..." />
        </div>
        <div className="tabs">
          {['All', 'UI', 'API'].map(t => (
            <button key={t} className={`tab-btn ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Module Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modules.map(mod => {
          const tcs = filteredTCs(mod.id);
          const isOpen = expandedModule === mod.id;
          return (
            <div key={mod.id} className="accordion-item">
              <div className="accordion-header" onClick={() => setExpandedModule(isOpen ? null : mod.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  {isOpen ? <ChevronDown size={16} color="var(--accent-blue)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                  <span style={{ fontSize: 20 }}>{mod.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{mod.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{mod.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-blue">{mod.testCount} tests</span>
                  <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setModModal(mod); }}><Edit2 size={13} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={e => { e.stopPropagation(); deleteModule(mod.id); }}><Trash2 size={13} /></button>
                </div>
              </div>
              {isOpen && (
                <div className="accordion-body" style={{ padding: 0 }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setTcModal({ moduleId: mod.id })}>
                      <Plus size={12} /> Add Test Case
                    </button>
                  </div>
                  {tcs.length === 0 ? (
                    <div className="empty-state" style={{ padding: 30 }}>
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No test cases found</div>
                      <div className="empty-state-sub">Add a test case to this module</div>
                    </div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Script Identifier</th>
                          <th>Tags</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tcs.map(tc => (
                          <tr key={tc.id}>
                            <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{tc.id}</span></td>
                            <td style={{ fontWeight: 600 }}>{tc.name}</td>
                            <td><span className={`badge ${typeBadge[tc.type]}`}>{tc.type}</span></td>
                            <td><code style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: 4 }}>{tc.scriptId}</code></td>
                            <td>
                              <div className="tags-wrap">
                                {tc.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                              </div>
                            </td>
                            <td><span className={`badge ${statusBadge[tc.status]}`}>{tc.status}</span></td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setTcModal(tc)}><Edit2 size={13} /></button>
                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteTestCase(tc.id)}><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Module Modal */}
      {modModal && (
        <ModuleModal
          mod={modModal !== 'create' ? modModal : null}
          onSave={(data) => {
            if (modModal !== 'create') updateModule(modModal.id, data);
            else addModule({ ...data, appId: activeAppId });
            setModModal(null);
          }}
          onClose={() => setModModal(null)}
        />
      )}

      {/* Test Case Modal */}
      {tcModal !== null && (
        <TestCaseModal
          tc={tcModal?.id ? tcModal : (tcModal?.moduleId ? { ...tcModal, name:'', description:'', type:'UI', scriptId:'', tags:[], status:'Active' } : null)}
          modules={modules}
          onSave={(data) => {
            if (tcModal?.id) updateTestCase(tcModal.id, data);
            else addTestCase({ ...data, appId: activeAppId });
            setTcModal(null);
          }}
          onClose={() => setTcModal(null)}
        />
      )}
    </div>
  );
}
