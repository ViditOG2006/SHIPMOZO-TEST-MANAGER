import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Copy, GripVertical, X, Play, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWorkflowStore, useRepoStore, useDataStore, useEnvStore, useExecutionStore, useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';

function SortableStep({ step, tc, onRemove, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const typeBadge = { UI: 'badge-purple', API: 'badge-cyan' };
  return (
    <div ref={setNodeRef} style={style} className={`step-card ${isDragging ? 'dragging' : ''}`}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)', flexShrink: 0 }}>
        <GripVertical size={16} />
      </div>
      <div className="step-num">{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{tc?.name || step.testCaseId}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tc?.scriptId || ''}</div>
      </div>
      {tc && <span className={`badge ${typeBadge[tc.type]}`}>{tc.type}</span>}
      <button style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4, borderRadius: 4 }} onClick={() => onRemove(step.id)}>
        <X size={14} />
      </button>
    </div>
  );
}

function WorkflowModal({ wf, onSave, onClose }) {
  const { environments } = useEnvStore();
  const { dataSets } = useDataStore();
  const [form, setForm] = useState(wf || { name: '', description: '', environment: environments[1]?.id || '', dataSetId: dataSets[0]?.id || '', stopOnFailure: true });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><div className="modal-title">{wf ? 'Edit Workflow' : 'New Workflow'}</div></div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Workflow Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Full Order Journey" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this workflow test end-to-end?" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Environment</label>
              <select className="form-select" value={form.environment} onChange={e => setForm(f => ({ ...f, environment: e.target.value }))}>
                {environments.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data Set</label>
              <select className="form-select" value={form.dataSetId} onChange={e => setForm(f => ({ ...f, dataSetId: e.target.value }))}>
                {dataSets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="toggle-wrap">
            <div className={`toggle ${form.stopOnFailure ? 'on' : ''}`} onClick={() => setForm(f => ({ ...f, stopOnFailure: !f.stopOnFailure }))} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Stop on Failure</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => form.name && onSave(form)}>{wf ? 'Save' : 'Create'}</button>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const { workflows: rawWorkflows, addWorkflow, updateWorkflow, deleteWorkflow, cloneWorkflow, updateSteps } = useWorkflowStore();
  const { testCases: rawTestCases, modules } = useRepoStore();
  const { environments } = useEnvStore();
  const { dataSets } = useDataStore();
  const { triggerExecution } = useExecutionStore();

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);

  const workflows = rawWorkflows.filter(matchesApp);
  const testCases = rawTestCases.filter(matchesApp);

  const [selected, setSelected] = useState(null);
  const [wfModal, setWfModal] = useState(null);
  const [tcSearch, setTcSearch] = useState('');

  // Sync selection
  useEffect(() => {
    if (workflows.length > 0) {
      if (!selected || !workflows.some(w => w.id === selected)) {
        setSelected(workflows[0].id);
      }
    } else {
      setSelected(null);
    }
  }, [activeAppId, rawWorkflows, selected]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const active = workflows.find(w => w.id === selected);
  const steps = active?.steps || [];

  const getTC = (id) => testCases.find(tc => tc.id === id);
  const getEnv = (id) => environments.find(e => e.id === id);
  const getDS = (id) => dataSets.find(d => d.id === id);

  const filteredTCs = testCases.filter(tc =>
    tc.name.toLowerCase().includes(tcSearch.toLowerCase()) &&
    !steps.find(s => s.testCaseId === tc.id)
  );

  const addStep = (tcId) => {
    if (!active) return;
    const newStep = { id: `WFS-${Date.now()}`, testCaseId: tcId, order: steps.length + 1 };
    updateSteps(active.id, [...steps, newStep]);
  };

  const removeStep = (stepId) => {
    updateSteps(active.id, steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const handleDragEnd = ({ active: a, over }) => {
    if (!over || a.id === over.id) return;
    const oldIdx = steps.findIndex(s => s.id === a.id);
    const newIdx = steps.findIndex(s => s.id === over.id);
    updateSteps(active.id, arrayMove(steps, oldIdx, newIdx).map((s, i) => ({ ...s, order: i + 1 })));
  };

  const runWorkflow = async () => {
    if (!active || steps.length === 0) return;
    const id = await triggerExecution({
      type: 'WORKFLOW', referenceId: active.id,
      environmentId: active.environment, dataSetId: active.dataSetId,
      testCaseIds: steps.map(s => s.testCaseId),
      label: active.name,
      stopOnFailure: active.stopOnFailure,
    });
    navigate('/monitor/' + id);
  };

  const typeBadge = { UI: 'badge-purple', API: 'badge-cyan' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workflow Builder</h1>
          <p className="page-sub">Chain test cases into end-to-end business flows</p>
        </div>
        <button className="btn btn-primary" onClick={() => setWfModal('create')}><Plus size={14} /> New Workflow</button>
      </div>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 180px)' }}>
        {/* Workflow List */}
        <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, padding: '4px 2px' }}>
            Workflows ({workflows.length})
          </div>
          {workflows.map(wf => (
            <div key={wf.id} onClick={() => setSelected(wf.id)}
              style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'var(--transition)',
                background: selected === wf.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
                border: `1px solid ${selected === wf.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
              }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: selected === wf.id ? 'var(--accent-blue-light)' : 'var(--text-primary)' }}>{wf.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {wf.steps.length} steps · {getEnv(wf.environment)?.name || 'QA'}
              </div>
            </div>
          ))}
        </div>

        {active ? (
          <>
            {/* Canvas */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Workflow Header */}
              <div className="card" style={{ marginBottom: 14, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{active.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{active.description}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-blue">🌐 {getEnv(active.environment)?.name || 'QA'}</span>
                      <span className="badge badge-purple">🗄️ {getDS(active.dataSetId)?.name || 'None'}</span>
                      <span className={`badge ${active.stopOnFailure ? 'badge-red' : 'badge-green'}`}>
                        {active.stopOnFailure ? '⛔ Stop on Failure' : '▶ Continue on Failure'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setWfModal(active)}><Edit2 size={13} /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => cloneWorkflow(active.id)}><Copy size={13} /> Clone</button>
                    <button className="btn btn-danger btn-sm" onClick={() => { deleteWorkflow(active.id); setSelected(workflows.find(w => w.id !== active.id)?.id || null); }}>
                      <Trash2 size={13} />
                    </button>
                    <button className="btn btn-primary" onClick={runWorkflow} disabled={steps.length === 0}>
                      <Play size={14} /> Execute Workflow
                    </button>
                  </div>
                </div>
              </div>

              {/* Steps Canvas */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {steps.length === 0 ? (
                  <div className="empty-state" style={{ height: '100%' }}>
                    <div className="empty-state-icon">⛓️</div>
                    <div className="empty-state-title">No steps added</div>
                    <div className="empty-state-sub">Add test cases from the right panel to build your workflow</div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 2px' }}>
                        {steps.map((step, idx) => (
                          <div key={step.id}>
                            <SortableStep step={step} tc={getTC(step.testCaseId)} onRemove={removeStep} index={idx} />
                            {idx < steps.length - 1 && (
                              <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0' }}>
                                <ChevronRight size={16} color="var(--text-muted)" style={{ transform: 'rotate(90deg)' }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {/* TC Picker */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Available Test Cases</div>
                <input className="form-input" value={tcSearch} onChange={e => setTcSearch(e.target.value)} placeholder="Search..." style={{ fontSize: 12, padding: '7px 10px' }} />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
                {modules.map(mod => {
                  const modTCs = filteredTCs.filter(tc => tc.moduleId === mod.id);
                  if (modTCs.length === 0) return null;
                  return (
                    <div key={mod.id} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, padding: '0 4px' }}>
                        {mod.icon} {mod.name}
                      </div>
                      {modTCs.map(tc => (
                        <div key={tc.id} onClick={() => addStep(tc.id)}
                          style={{
                            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8,
                            transition: 'var(--transition)', marginBottom: 3,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <Plus size={13} color="var(--accent-blue)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tc.name}</div>
                          </div>
                          <span className={`badge ${typeBadge[tc.type]}`} style={{ fontSize: 9 }}>{tc.type}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">⚙️</div>
              <div className="empty-state-title">No workflow selected</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setWfModal('create')}><Plus size={14} /> Create Workflow</button>
            </div>
          </div>
        )}
      </div>

      {wfModal && (
        <WorkflowModal
          wf={wfModal !== 'create' ? wfModal : null}
          onSave={(data) => {
            if (wfModal !== 'create') updateWorkflow(wfModal.id, data);
            else { 
              addWorkflow({ ...data, appId: activeAppId }); 
              setTimeout(() => {
                const last = useWorkflowStore.getState().workflows.slice(-1)[0];
                if (last) setSelected(last.id);
              }, 100); 
            }
            setWfModal(null);
          }}
          onClose={() => setWfModal(null)}
        />
      )}
    </div>
  );
}
