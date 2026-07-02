import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, Upload, X, Save, FileText, Database } from 'lucide-react';
import { useDataStore, useAppStore } from '../store';
import Papa from 'papaparse';

function NewDataSetModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', environment: 'QA', description: '' });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">Create Data Set</div><div className="modal-sub">A named collection of key-value pairs</div></div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Dataset Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. LoginData_QA" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Environment</label>
              <select className="form-select" value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value }))}>
                {['Local', 'QA', 'UAT', 'Production'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this data set for?" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>Create</button>
        </div>
      </div>
    </div>
  );
}

const ENV_COLORS = { QA: 'badge-blue', UAT: 'badge-yellow', Local: 'badge-purple', Production: 'badge-red' };

export default function TestDataManager() {
  const activeAppId = useAppStore(s => s.activeAppId);
  const rawDataSets = useDataStore(s => s.dataSets);
  const { addDataSet, deleteDataSet, updateDataSet, addEntry, updateEntry, deleteEntry, importEntries } = useDataStore();

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const dataSets = rawDataSets.filter(matchesApp);

  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // idx
  const [newEntry, setNewEntry] = useState({ key: '', value: '' });
  const [addingEntry, setAddingEntry] = useState(false);
  const fileRef = useRef();

  // Sync selection
  useEffect(() => {
    if (dataSets.length > 0) {
      if (!selected || !dataSets.some(d => d.id === selected)) {
        setSelected(dataSets[0].id);
      }
    } else {
      setSelected(null);
    }
  }, [activeAppId, rawDataSets, selected]);

  const activeDS = dataSets.find(d => d.id === selected);

  const exportCSV = () => {
    if (!activeDS) return;
    const csv = Papa.unparse(activeDS.entries.map(e => ({ Key: e.key, Value: e.value })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${activeDS.name}.csv`; a.click();
  };

  const importCSV = (e) => {
    const file = e.target.files[0]; if (!file || !activeDS) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: ({ data }) => {
        const entries = data.map(row => ({ key: row.Key || row.key || '', value: row.Value || row.value || '' })).filter(e => e.key);
        importEntries(activeDS.id, entries);
      }
    });
    e.target.value = '';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Data Management</h1>
          <p className="page-sub">{dataSets.length} data sets · Manage execution variables</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Data Set
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 180px)' }}>
        {/* Sidebar List */}
        <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 2px' }}>
            Data Sets ({dataSets.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dataSets.map(ds => (
              <div key={ds.id} onClick={() => setSelected(ds.id)}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--radius-md)',
                  background: selected === ds.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
                  border: `1px solid ${selected === ds.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  cursor: 'pointer', transition: 'var(--transition)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: selected === ds.id ? 'var(--accent-blue-light)' : 'var(--text-primary)' }}>
                    <Database size={12} style={{ marginRight: 5, verticalAlign: 'middle' }} />{ds.name}
                  </div>
                  <span className={`badge ${ENV_COLORS[ds.environment] || 'badge-gray'}`} style={{ fontSize: 10 }}>{ds.environment}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{ds.entries.length} entries</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        {activeDS ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{activeDS.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{activeDS.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" onClick={exportCSV}><Download size={13} /> Export CSV</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}><Upload size={13} /> Import CSV</button>
                  <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importCSV} />
                  <button className="btn btn-danger btn-sm" onClick={() => { deleteDataSet(activeDS.id); setSelected(dataSets.find(d => d.id !== activeDS.id)?.id || null); }}>
                    <Trash2 size={13} /> Delete Set
                  </button>
                </div>
              </div>
            </div>

            <div className="table-wrapper" style={{ flex: 1, overflow: 'auto' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  <FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--accent-blue)' }} />
                  Key-Value Pairs
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => setAddingEntry(true)}><Plus size={13} /> Add Entry</button>
              </div>

              {addingEntry && (
                <div style={{ padding: '12px 16px', display: 'flex', gap: 10, background: 'var(--accent-blue-dim)', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  <input className="form-input" style={{ flex: 1, minWidth: 120 }} value={newEntry.key} onChange={e => setNewEntry(n => ({ ...n, key: e.target.value }))} placeholder="Key" />
                  <input className="form-input" style={{ flex: 2, minWidth: 180 }} value={newEntry.value} onChange={e => setNewEntry(n => ({ ...n, value: e.target.value }))} placeholder="Value" />
                  <button className="btn btn-primary btn-sm" onClick={() => { if (newEntry.key) { addEntry(activeDS.id, newEntry); setNewEntry({ key:'', value:'' }); setAddingEntry(false); } }}>
                    <Save size={13} /> Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setAddingEntry(false)}>Cancel</button>
                </div>
              )}

              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Key</th>
                    <th>Value</th>
                    <th style={{ width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDS.entries.map((entry, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{idx + 1}</td>
                      <td>
                        {editingEntry === idx ? (
                          <input className="form-input" defaultValue={entry.key} id={`key-${idx}`} style={{ padding: '4px 8px', fontSize: 12 }} />
                        ) : (
                          <code style={{ fontSize: 12, color: 'var(--accent-blue-light)', background: 'var(--accent-blue-dim)', padding: '2px 8px', borderRadius: 4 }}>{entry.key}</code>
                        )}
                      </td>
                      <td>
                        {editingEntry === idx ? (
                          <input className="form-input" defaultValue={entry.value} id={`val-${idx}`} style={{ padding: '4px 8px', fontSize: 12 }} />
                        ) : (
                          <span style={{ fontSize: 13 }}>{entry.value}</span>
                        )}
                      </td>
                      <td>
                        {editingEntry === idx ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-success btn-sm" onClick={() => {
                              updateEntry(activeDS.id, idx, {
                                key: document.getElementById(`key-${idx}`).value,
                                value: document.getElementById(`val-${idx}`).value,
                              });
                              setEditingEntry(null);
                            }}><Save size={12} /></button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingEntry(null)}><X size={12} /></button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingEntry(idx)}><Edit2 size={12} /></button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteEntry(activeDS.id, idx)}><Trash2 size={12} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {activeDS.entries.length === 0 && (
                    <tr><td colSpan={4}><div className="empty-state"><div className="empty-state-icon">🗄️</div><div className="empty-state-title">No entries yet</div><div className="empty-state-sub">Add key-value pairs or import a CSV</div></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-title">No data set selected</div>
              <div className="empty-state-sub">Select a data set from the left or create a new one</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowNew(true)}><Plus size={14} /> New Data Set</button>
            </div>
          </div>
        )}
      </div>

      {showNew && (
        <NewDataSetModal
          onSave={(data) => { 
            addDataSet({ ...data, appId: activeAppId }); 
            setShowNew(false); 
            setTimeout(() => {
              const last = useDataStore.getState().dataSets.slice(-1)[0];
              if (last) setSelected(last.id);
            }, 100); 
          }}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  );
}
