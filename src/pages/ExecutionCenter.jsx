import { useState } from 'react';
import { Play, ChevronRight, Check, Zap } from 'lucide-react';
import { useRepoStore, useDataStore, useWorkflowStore, useEnvStore, useExecutionStore, useAppStore } from '../store';
import { useNavigate } from 'react-router-dom';

const TABS = ['Individual', 'Suite', 'Workflow', 'Module'];

function WizardSteps({ steps, current }) {
  return (
    <div className="wizard-steps">
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div className={`wizard-step ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            <div className="wizard-step-circle">
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <div className="wizard-step-label">{s}</div>
          </div>
          {i < steps.length - 1 && (
            <div className={`wizard-connector ${i < current ? 'done' : i === current - 1 ? 'active' : ''}`} style={{ flex: 1 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function IndividualExec() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const rawModules = useRepoStore(s => s.modules);
  const rawTestCases = useRepoStore(s => s.testCases);
  const { environments } = useEnvStore();
  const { dataSets } = useDataStore();
  const { triggerExecution } = useExecutionStore();
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ moduleId: '', testCaseId: '', envId: environments[1]?.id, dsId: dataSets[0]?.id });

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const modules = rawModules.filter(matchesApp);
  const testCases = rawTestCases.filter(matchesApp);

  const modTCs = testCases.filter(tc => tc.moduleId === sel.moduleId);
  const selTC = testCases.find(tc => tc.id === sel.testCaseId);

  const launch = async () => {
    if (!sel.testCaseId) return;
    const id = await triggerExecution({ type: 'INDIVIDUAL', referenceId: sel.testCaseId, environmentId: sel.envId, dataSetId: sel.dsId, testCaseIds: [sel.testCaseId], label: selTC?.name, appId: activeAppId });
    navigate('/monitor/' + id);
  };

  return (
    <div>
      <WizardSteps steps={['Select Module', 'Select Test Case', 'Configure', 'Launch']} current={step} />
      {step === 0 && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Choose a module to browse its test cases:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {modules.map(m => (
              <div key={m.id} className={`module-card ${sel.moduleId === m.id ? 'selected' : ''}`}
                onClick={() => { setSel(s => ({ ...s, moduleId: m.id, testCaseId: '' })); }}>
                <div className="module-card-icon">{m.icon}</div>
                <div className="module-card-name">{m.name}</div>
                <div className="module-card-desc">{m.testCount} tests</div>
                <div className="module-card-count">{m.testCount}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={!sel.moduleId} onClick={() => setStep(1)}>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Select a test case from <strong>{modules.find(m => m.id === sel.moduleId)?.name}</strong>:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {modTCs.map(tc => (
              <div key={tc.id} onClick={() => setSel(s => ({ ...s, testCaseId: tc.id }))}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: sel.testCaseId === tc.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
                  border: `1px solid ${sel.testCaseId === tc.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  transition: 'var(--transition)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {sel.testCaseId === tc.id ? <Check size={16} color="var(--accent-blue)" /> : <div style={{ width: 16 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{tc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{tc.description}</div>
                  </div>
                  <span className={tc.type === 'UI' ? 'badge badge-purple' : 'badge badge-cyan'}>{tc.type}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary" disabled={!sel.testCaseId} onClick={() => setStep(2)}>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Configure execution parameters:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Environment</label>
              <select className="form-select" value={sel.envId} onChange={e => setSel(s => ({ ...s, envId: e.target.value }))}>
                {environments.map(e => <option key={e.id} value={e.id}>{e.name}{e.restricted ? ' 🔒' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Test Data Set</label>
              <select className="form-select" value={sel.dsId} onChange={e => setSel(s => ({ ...s, dsId: e.target.value }))}>
                <option value="">— None —</option>
                {dataSets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Review <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="card" style={{ maxWidth: 480 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color="var(--accent-blue)" /> Execution Summary
            </div>
            {[
              { label: 'Test Case', value: selTC?.name },
              { label: 'Module', value: modules.find(m => m.id === sel.moduleId)?.name },
              { label: 'Type', value: selTC?.type },
              { label: 'Environment', value: environments.find(e => e.id === sel.envId)?.name },
              { label: 'Data Set', value: dataSets.find(d => d.id === sel.dsId)?.name || 'None' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
                <span style={{ fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={launch}><Play size={16} /> Launch Execution</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SuiteExec() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const rawSuites = useRepoStore(s => s.testSuites);
  const { environments } = useEnvStore();
  const { dataSets } = useDataStore();
  const { triggerExecution } = useExecutionStore();
  const [sel, setSel] = useState({ suiteId: '', envId: environments[1]?.id, dsId: '' });
  const [step, setStep] = useState(0);

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const testSuites = rawSuites.filter(matchesApp);

  const selSuite = testSuites.find(s => s.id === sel.suiteId);

  const launch = async () => {
    if (!selSuite) return;
    const id = await triggerExecution({ type: 'SUITE', referenceId: selSuite.id, environmentId: sel.envId, dataSetId: sel.dsId, testCaseIds: selSuite.testCaseIds, label: selSuite.name, appId: activeAppId });
    navigate('/monitor/' + id);
  };

  return (
    <div>
      <WizardSteps steps={['Select Suite', 'Configure', 'Launch']} current={step} />
      {step === 0 && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {testSuites.map(suite => (
              <div key={suite.id} onClick={() => setSel(s => ({ ...s, suiteId: suite.id }))}
                style={{
                  padding: '16px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  background: sel.suiteId === suite.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
                  border: `1px solid ${sel.suiteId === suite.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                  transition: 'var(--transition)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {sel.suiteId === suite.id ? <Check size={18} color="var(--accent-blue)" /> : <div style={{ width: 18 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{suite.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{suite.description}</div>
                  </div>
                  <span className="badge badge-blue">{suite.testCaseIds.length} tests</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" disabled={!sel.suiteId} onClick={() => setStep(1)}>Next <ChevronRight size={14} /></button>
          </div>
        </div>
      )}
      {step === 1 && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Environment</label>
              <select className="form-select" value={sel.envId} onChange={e => setSel(s => ({ ...s, envId: e.target.value }))}>
                {environments.map(e => <option key={e.id} value={e.id}>{e.name}{e.restricted ? ' 🔒' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Test Data Set (Optional)</label>
              <select className="form-select" value={sel.dsId} onChange={e => setSel(s => ({ ...s, dsId: e.target.value }))}>
                <option value="">— None —</option>
                {dataSets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {selSuite && (
              <div className="alert alert-info">
                <Zap size={14} /> <strong>{selSuite.name}</strong> contains {selSuite.testCaseIds.length} test cases.
              </div>
            )}
          </div>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-primary btn-lg" onClick={launch}><Play size={16} /> Launch Suite</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowExec() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const { workflows: rawWorkflows } = useWorkflowStore();
  const { environments } = useEnvStore();
  const { triggerExecution } = useExecutionStore();
  const [selId, setSelId] = useState('');

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const workflows = rawWorkflows.filter(matchesApp);

  const selWF = workflows.find(w => w.id === selId);

  const launch = async () => {
    if (!selWF) return;
    const id = await triggerExecution({ type: 'WORKFLOW', referenceId: selWF.id, environmentId: selWF.environment, dataSetId: selWF.dataSetId, testCaseIds: selWF.steps.map(s => s.testCaseId), label: selWF.name, stopOnFailure: selWF.stopOnFailure, appId: activeAppId });
    navigate('/monitor/' + id);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {workflows.map(wf => (
          <div key={wf.id} onClick={() => setSelId(wf.id)}
            style={{
              padding: '16px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: selId === wf.id ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
              border: `1px solid ${selId === wf.id ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {selId === wf.id ? <Check size={18} color="var(--accent-blue)" /> : <div style={{ width: 18 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{wf.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{wf.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-blue">{wf.steps.length} steps</span>
                <span className="badge badge-green">{environments.find(e => e.id === wf.environment)?.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary btn-lg" disabled={!selId} onClick={launch}><Play size={16} /> Execute Workflow</button>
    </div>
  );
}

function ModuleExec() {
  const navigate = useNavigate();
  const activeAppId = useAppStore(s => s.activeAppId);
  const rawModules = useRepoStore(s => s.modules);
  const rawTestCases = useRepoStore(s => s.testCases);
  const { environments } = useEnvStore();
  const { triggerExecution } = useExecutionStore();
  const [sel, setSel] = useState({ modId: '', envId: environments[1]?.id });

  const matchesApp = (item) => !item.appId || item.appId === activeAppId || (activeAppId === 'APP-001' && item.appId === undefined);
  const modules = rawModules.filter(matchesApp);
  const testCases = rawTestCases.filter(matchesApp);

  const launch = async () => {
    if (!sel.modId) return;
    const tcs = testCases.filter(tc => tc.moduleId === sel.modId && tc.status === 'Active').map(tc => tc.id);
    const mod = modules.find(m => m.id === sel.modId);
    const id = await triggerExecution({ type: 'MODULE', referenceId: sel.modId, environmentId: sel.envId, testCaseIds: tcs, label: mod?.name, appId: activeAppId });
    navigate('/monitor/' + id);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        {modules.map(m => {
          const count = testCases.filter(tc => tc.moduleId === m.id && tc.status === 'Active').length;
          return (
            <div key={m.id} className={`module-card ${sel.modId === m.id ? 'selected' : ''}`} onClick={() => setSel(s => ({ ...s, modId: m.id }))}>
              <div className="module-card-icon">{m.icon}</div>
              <div className="module-card-name">{m.name}</div>
              <div className="module-card-desc">{count} active tests</div>
              <div className="module-card-count">{count}</div>
            </div>
          );
        })}
      </div>
      <div className="form-group" style={{ maxWidth: 280, marginBottom: 20 }}>
        <label className="form-label">Environment</label>
        <select className="form-select" value={sel.envId} onChange={e => setSel(s => ({ ...s, envId: e.target.value }))}>
          {environments.map(e => <option key={e.id} value={e.id}>{e.name}{e.restricted ? ' 🔒' : ''}</option>)}
        </select>
      </div>
      <button className="btn btn-primary btn-lg" disabled={!sel.modId} onClick={launch}><Play size={16} /> Run Module Tests</button>
    </div>
  );
}

export default function ExecutionCenter() {
  const [activeTab, setActiveTab] = useState('Individual');
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Execution Center</h1>
          <p className="page-sub">Select tests, configure data, and launch automation</p>
        </div>
      </div>
      <div className="tabs" style={{ marginBottom: 28 }}>
        {TABS.map(t => <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>)}
      </div>
      <div className="card">
        {activeTab === 'Individual' && <IndividualExec />}
        {activeTab === 'Suite' && <SuiteExec />}
        {activeTab === 'Workflow' && <WorkflowExec />}
        {activeTab === 'Module' && <ModuleExec />}
      </div>
    </div>
  );
}
