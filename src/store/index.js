import { create } from 'zustand';
import {
  subscribeCollection, createDoc, updateFireDoc,
  deleteFireDoc, upsertDoc, COLLECTIONS
} from '../firebase/db';

// ─── App / Loading Store ───────────────────────────────────────
export const useAppStore = create((set) => ({
  role: 'QA Engineer',
  roles: ['QA Engineer', 'QA Lead', 'Product Manager', 'Developer', 'Management'],
  setRole: (role) => set({ role }),
  loading: true,
  setLoading: (v) => set({ loading: v }),
  seeded: false,
  setSeeded: (v) => set({ seeded: v }),
  activeAppId: localStorage.getItem('activeAppId') || 'APP-001',
  setActiveAppId: (activeAppId) => {
    localStorage.setItem('activeAppId', activeAppId);
    set({ activeAppId });
  },
  notifications: [
    { id: 1, msg: 'Welcome to AEP — connected to Firestore', time: 'now', read: false },
  ],
  markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
}));

// ─── Test Repository Store ─────────────────────────────────────
export const useRepoStore = create((set, get) => ({
  modules: [],
  testCases: [],
  testSuites: [],
  _unsub: [],

  // Called from App on mount — sets up real-time listeners
  subscribe: () => {
    const unsub1 = subscribeCollection(COLLECTIONS.MODULES, (data) =>
      set({ modules: data.sort((a, b) => a.id.localeCompare(b.id)) })
    );
    const unsub2 = subscribeCollection(COLLECTIONS.TEST_CASES, (data) =>
      set({ testCases: data.sort((a, b) => a.id.localeCompare(b.id)) })
    );
    const unsub3 = subscribeCollection(COLLECTIONS.TEST_SUITES, (data) =>
      set({ testSuites: data })
    );
    set({ _unsub: [unsub1, unsub2, unsub3] });
  },

  unsubscribe: () => get()._unsub.forEach(fn => fn()),

  addModule: async (mod) => {
    const modules = get().modules;
    const id = `MOD-${String(modules.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.MODULES, id, { ...mod, id, testCount: 0 });
  },

  updateModule: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.MODULES, id, patch);
  },

  deleteModule: async (id) => {
    await deleteFireDoc(COLLECTIONS.MODULES, id);
    // Also delete all test cases in this module
    const tcs = get().testCases.filter(tc => tc.moduleId === id);
    await Promise.all(tcs.map(tc => deleteFireDoc(COLLECTIONS.TEST_CASES, tc.id)));
  },

  addTestCase: async (tc) => {
    const testCases = get().testCases;
    const id = `TC-${String(testCases.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.TEST_CASES, id, { ...tc, id });
    // Increment module test count
    const mod = get().modules.find(m => m.id === tc.moduleId);
    if (mod) await updateFireDoc(COLLECTIONS.MODULES, tc.moduleId, { testCount: (mod.testCount || 0) + 1 });
  },

  updateTestCase: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.TEST_CASES, id, patch);
  },

  deleteTestCase: async (id) => {
    const tc = get().testCases.find(t => t.id === id);
    await deleteFireDoc(COLLECTIONS.TEST_CASES, id);
    if (tc) {
      const mod = get().modules.find(m => m.id === tc.moduleId);
      if (mod) await updateFireDoc(COLLECTIONS.MODULES, tc.moduleId, { testCount: Math.max(0, (mod.testCount || 1) - 1) });
    }
  },

  getTestCasesByModule: (moduleId) => get().testCases.filter(tc => tc.moduleId === moduleId),
}));

// ─── Test Data Store ───────────────────────────────────────────
export const useDataStore = create((set, get) => ({
  dataSets: [],
  _unsub: [],

  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.TEST_DATA_SETS, (data) =>
      set({ dataSets: data.sort((a, b) => a.id.localeCompare(b.id)) })
    );
    set({ _unsub: [unsub] });
  },

  unsubscribe: () => get()._unsub.forEach(fn => fn()),

  addDataSet: async (ds) => {
    const dataSets = get().dataSets;
    const id = `DS-${String(dataSets.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.TEST_DATA_SETS, id, { ...ds, id, entries: [] });
  },

  updateDataSet: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.TEST_DATA_SETS, id, patch);
  },

  deleteDataSet: async (id) => {
    await deleteFireDoc(COLLECTIONS.TEST_DATA_SETS, id);
  },

  addEntry: async (dataSetId, entry) => {
    const ds = get().dataSets.find(d => d.id === dataSetId);
    if (!ds) return;
    await updateFireDoc(COLLECTIONS.TEST_DATA_SETS, dataSetId, {
      entries: [...(ds.entries || []), entry]
    });
  },

  updateEntry: async (dataSetId, idx, patch) => {
    const ds = get().dataSets.find(d => d.id === dataSetId);
    if (!ds) return;
    const entries = (ds.entries || []).map((e, i) => i === idx ? { ...e, ...patch } : e);
    await updateFireDoc(COLLECTIONS.TEST_DATA_SETS, dataSetId, { entries });
  },

  deleteEntry: async (dataSetId, idx) => {
    const ds = get().dataSets.find(d => d.id === dataSetId);
    if (!ds) return;
    const entries = (ds.entries || []).filter((_, i) => i !== idx);
    await updateFireDoc(COLLECTIONS.TEST_DATA_SETS, dataSetId, { entries });
  },

  importEntries: async (dataSetId, entries) => {
    await updateFireDoc(COLLECTIONS.TEST_DATA_SETS, dataSetId, { entries });
  },
}));

// ─── Workflow Store ────────────────────────────────────────────
export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  _unsub: [],

  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.WORKFLOWS, (data) =>
      set({ workflows: data.sort((a, b) => a.id.localeCompare(b.id)) })
    );
    set({ _unsub: [unsub] });
  },

  unsubscribe: () => get()._unsub.forEach(fn => fn()),

  addWorkflow: async (wf) => {
    const workflows = get().workflows;
    const id = `WF-${String(workflows.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.WORKFLOWS, id, { ...wf, id, steps: [] });
  },

  updateWorkflow: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.WORKFLOWS, id, patch);
  },

  deleteWorkflow: async (id) => {
    await deleteFireDoc(COLLECTIONS.WORKFLOWS, id);
  },

  cloneWorkflow: async (id) => {
    const orig = get().workflows.find(w => w.id === id);
    if (!orig) return;
    const workflows = get().workflows;
    const newId = `WF-${String(workflows.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.WORKFLOWS, newId, { ...orig, id: newId, name: `${orig.name} (Copy)` });
  },

  updateSteps: async (id, steps) => {
    await updateFireDoc(COLLECTIONS.WORKFLOWS, id, { steps });
  },
}));

// ─── Environment Store ─────────────────────────────────────────
export const useEnvStore = create((set, get) => ({
  environments: [],
  _unsub: [],

  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.ENVIRONMENTS, (data) =>
      set({ environments: data.sort((a, b) => a.id.localeCompare(b.id)) })
    );
    set({ _unsub: [unsub] });
  },

  unsubscribe: () => get()._unsub.forEach(fn => fn()),

  updateEnvironment: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.ENVIRONMENTS, id, patch);
  },

  addVariable: async (envId, v) => {
    const env = get().environments.find(e => e.id === envId);
    if (!env) return;
    await updateFireDoc(COLLECTIONS.ENVIRONMENTS, envId, { variables: [...(env.variables || []), v] });
  },

  updateVariable: async (envId, idx, patch) => {
    const env = get().environments.find(e => e.id === envId);
    if (!env) return;
    const variables = (env.variables || []).map((v, i) => i === idx ? { ...v, ...patch } : v);
    await updateFireDoc(COLLECTIONS.ENVIRONMENTS, envId, { variables });
  },

  deleteVariable: async (envId, idx) => {
    const env = get().environments.find(e => e.id === envId);
    if (!env) return;
    await updateFireDoc(COLLECTIONS.ENVIRONMENTS, envId, { variables: env.variables.filter((_, i) => i !== idx) });
  },
}));

// ─── Execution Store ───────────────────────────────────────────
const FAKE_ERRORS = [
  'Element not found: #submit-btn (timeout 30s)',
  'Expected status 200 but received 500',
  'Assertion failed: text "Order Created" not visible',
  'Network request failed: POST /api/v1/orders → 502 Bad Gateway',
  'Timeout waiting for element: .tracking-number',
];

function buildStepLogs(tcName, passed) {
  const t = Date.now();
  const logs = [
    { time: new Date(t).toISOString(), level: 'INFO', msg: `Initializing test: ${tcName}` },
    { time: new Date(t + 200).toISOString(), level: 'INFO', msg: 'Launching browser: Chromium' },
    { time: new Date(t + 800).toISOString(), level: 'INFO', msg: 'Navigating to target URL' },
    { time: new Date(t + 1500).toISOString(), level: 'INFO', msg: 'Page loaded successfully' },
    { time: new Date(t + 2000).toISOString(), level: 'INFO', msg: `Executing: ${tcName}` },
  ];
  if (passed) {
    logs.push({ time: new Date(t + 3000).toISOString(), level: 'INFO', msg: 'All assertions passed' });
    logs.push({ time: new Date(t + 3200).toISOString(), level: 'PASS', msg: `✓ Test passed: ${tcName}` });
  } else {
    const err = FAKE_ERRORS[Math.floor(Math.random() * FAKE_ERRORS.length)];
    logs.push({ time: new Date(t + 2800).toISOString(), level: 'FAIL', msg: `✗ Test failed: ${tcName} — ${err}` });
    logs.push({ time: new Date(t + 2900).toISOString(), level: 'FAIL', msg: `Stack: at ${tcName}.spec.js:42:18` });
  }
  return logs;
}

export const useExecutionStore = create((set, get) => ({
  executions: [],
  activeExecutionId: null,
  _unsub: [],

  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.EXECUTIONS, (data) => {
      set({
        executions: data.sort((a, b) =>
          new Date(b.startTime) - new Date(a.startTime)
        )
      });
    });
    set({ _unsub: [unsub] });
  },

  unsubscribe: () => get()._unsub.forEach(fn => fn()),

  triggerExecution: async ({ type, referenceId, environmentId, dataSetId, testCaseIds, label, stopOnFailure }) => {
    const { testCases } = useRepoStore.getState();
    const id = `EX-${Date.now()}`;
    const steps = testCaseIds.map((tcId, i) => {
      const tc = testCases.find(t => t.id === tcId);
      return { id: `STEP-${id}-${i}`, testCaseId: tcId, name: tc?.name || tcId, status: 'QUEUED', duration: 0, logs: [] };
    });

    const execution = {
      id, type, referenceId, environmentId: environmentId || '',
      dataSetId: dataSetId || '', status: 'QUEUED',
      stopOnFailure: stopOnFailure !== false,
      totalTests: steps.length, passed: 0, failed: 0, skipped: 0,
      startTime: new Date().toISOString(), endTime: null,
      duration: 0, triggeredBy: 'You', runId: `RUN-${id}`,
      steps, progress: 0, label: label || '',
    };

    // Write initial execution to Firestore
    await createDoc(COLLECTIONS.EXECUTIONS, id, execution);
    set({ activeExecutionId: id });

    return id;
  },

  abortExecution: async (id) => {
    try {
      await fetch('/api/executions/abort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId: id }),
      });
    } catch {
      await updateFireDoc(COLLECTIONS.EXECUTIONS, id, {
        status: 'ABORTED',
        endTime: new Date().toISOString(),
      });
    }
  },

  setActiveExecution: (id) => set({ activeExecutionId: id }),
}));

// ─── Applications Store ────────────────────────────────────────
export const useAppConfigStore = create((set, get) => ({
  applications: [],
  _unsub: [],
  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.APPLICATIONS, (data) => {
      set({ applications: data.sort((a, b) => a.id.localeCompare(b.id)) });
    });
    set({ _unsub: [unsub] });
  },
  unsubscribe: () => get()._unsub.forEach(fn => fn()),
  addApp: async (app) => {
    const apps = get().applications;
    const id = `APP-${String(apps.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.APPLICATIONS, id, { ...app, id, createdAt: new Date().toISOString() });
  },
  updateApp: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.APPLICATIONS, id, patch);
  },
  deleteApp: async (id) => {
    await deleteFireDoc(COLLECTIONS.APPLICATIONS, id);
  }
}));

// ─── Team Members Store ────────────────────────────────────────
export const useTeamStore = create((set, get) => ({
  members: [],
  _unsub: [],
  subscribe: () => {
    const unsub = subscribeCollection(COLLECTIONS.TEAM, (data) => {
      set({ members: data.sort((a, b) => a.id.localeCompare(b.id)) });
    });
    set({ _unsub: [unsub] });
  },
  unsubscribe: () => get()._unsub.forEach(fn => fn()),
  addMember: async (member) => {
    const members = get().members;
    const id = `MEM-${String(members.length + 1).padStart(3, '0')}`;
    await createDoc(COLLECTIONS.TEAM, id, { ...member, id, joinedAt: new Date().toISOString() });
  },
  updateMember: async (id, patch) => {
    await updateFireDoc(COLLECTIONS.TEAM, id, patch);
  },
  deleteMember: async (id) => {
    await deleteFireDoc(COLLECTIONS.TEAM, id);
  }
}));
