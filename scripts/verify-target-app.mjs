/**
 * Register target webapp from .env and run a representative workflow.
 * Usage: node scripts/verify-target-app.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function envFirst(...keys) {
  for (const key of keys) {
    const value = String(process.env[key] || '').trim();
    if (value) return value;
  }
  return '';
}

const firebaseConfig = {
  apiKey: 'AIzaSyDiM8yNkIBASqyJICWy9i9hHdgwcTnq8I0',
  authDomain: 'shipmozo-a2d3f.firebaseapp.com',
  projectId: 'shipmozo-a2d3f',
  storageBucket: 'shipmozo-a2d3f.firebasestorage.app',
  messagingSenderId: '795497767596',
  appId: '1:795497767596:web:471e778476dd499d56b509',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const APP_ID = 'APP-001';
const TS = Date.now();
const EXEC_ID = `EX-VERIFY-${TS}`;

const TARGET_APP = {
  id: APP_ID,
  name: envFirst('TARGET_APP_NAME') || 'My Web App',
  icon: '🌐',
  description: 'Target application registered from .env for smoke verification',
  baseUrl: envFirst('TARGET_APP_URL', 'SHIPMOZO_PANEL_URL'),
  frontendTester: 'Playwright',
  backendTester: 'Postman Collection',
  postmanCollectionId: process.env.POSTMAN_COLLECTION_ID || '',
  postmanEnvironmentId: process.env.POSTMAN_ENVIRONMENT_ID || '',
  defaultUsername: envFirst('TARGET_APP_EMAIL', 'SHIPMOZO_EMAIL'),
  defaultPassword: envFirst('TARGET_APP_PASSWORD', 'SHIPMOZO_PASSWORD'),
  updatedAt: new Date().toISOString(),
};

const WORKFLOW_STEPS = [
  { testCaseId: 'TC-031', name: 'Login with Valid Credentials', type: 'UI', scriptId: 'auth/loginValid' },
  { testCaseId: 'TC-001', name: 'Add Single Order', type: 'API', scriptId: 'orders/addSingleOrder' },
  { testCaseId: 'TC-022', name: 'Serviceability Check API', type: 'API', scriptId: 'courier/serviceability' },
];

async function writeDoc(col, id, data) {
  await setDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

async function ensureTestCasesExist() {
  for (const step of WORKFLOW_STEPS) {
    const snap = await getDoc(doc(db, 'testCases', step.testCaseId));
    if (!snap.exists()) {
      console.warn(`WARN: test case ${step.testCaseId} missing in Firestore — seed data first`);
    }
  }
}

async function provisionApp() {
  console.log('\n=== Target app (from .env) ===');
  console.log(`  name: ${TARGET_APP.name}`);
  console.log(`  baseUrl: ${TARGET_APP.baseUrl || 'MISSING'}`);
  console.log(`  postmanCollectionId: ${TARGET_APP.postmanCollectionId ? TARGET_APP.postmanCollectionId.slice(0, 8) + '...' : 'MISSING'}`);
  console.log(`  postmanEnvironmentId: ${TARGET_APP.postmanEnvironmentId ? TARGET_APP.postmanEnvironmentId.slice(0, 8) + '...' : 'MISSING'}`);
  console.log(`  login: ${TARGET_APP.defaultUsername ? 'configured' : 'MISSING'}`);

  if (!TARGET_APP.postmanCollectionId) {
    throw new Error('POSTMAN_COLLECTION_ID missing in .env');
  }

  await writeDoc('applications', APP_ID, TARGET_APP);
  await ensureTestCasesExist();
}

async function triggerWorkflow() {
  const steps = WORKFLOW_STEPS.map((s, i) => ({
    id: `STEP-${EXEC_ID}-${i}`,
    testCaseId: s.testCaseId,
    name: s.name,
    status: 'QUEUED',
    duration: 0,
    logs: [],
  }));

  const execution = {
    id: EXEC_ID,
    type: 'WORKFLOW',
    referenceId: 'WF-SMOKE',
    environmentId: 'ENV-002',
    dataSetId: 'DS-002',
    appId: APP_ID,
    stopOnFailure: true,
    status: 'QUEUED',
    totalTests: steps.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    progress: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    triggeredBy: 'verify-target-app',
    runId: `RUN-${EXEC_ID}`,
    label: 'Target App Smoke Workflow',
    steps,
  };

  await writeDoc('executions', EXEC_ID, execution);
  console.log(`\n=== Triggered: ${EXEC_ID} (${steps.length} steps) ===`);
  return EXEC_ID;
}

function waitForExecution(execId, timeoutMs = 600000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsub();
      reject(new Error(`Timeout after ${timeoutMs / 1000}s`));
    }, timeoutMs);

    const unsub = onSnapshot(doc(db, 'executions', execId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      process.stdout.write(
        `\r  status=${data.status} progress=${data.progress || 0}% passed=${data.passed || 0} failed=${data.failed || 0} skipped=${data.skipped || 0}   `
      );
      if (['PASSED', 'FAILED', 'ABORTED', 'AWAITING_SCRIPT'].includes(data.status)) {
        clearTimeout(timer);
        unsub();
        resolve({ id: execId, ...data });
      }
    });
  });
}

async function main() {
  await provisionApp();
  const execId = await triggerWorkflow();

  console.log('\nWaiting for firestore-worker (npm run dev must be running)...');
  const result = await waitForExecution(execId);

  console.log('\n\n=== Workflow result ===');
  console.log(`Status: ${result.status}`);
  for (const step of result.steps || []) {
    console.log(`  [${step.status}] ${step.name} (${Math.round((step.duration || 0) / 1000)}s)`);
    if (step.errorMsg) console.log(`         ${step.errorMsg}`);
    const lastFail = (step.logs || []).filter((l) => l.level === 'FAIL').pop();
    if (lastFail) console.log(`         log: ${lastFail.msg}`);
  }

  console.log('\n=== UI ===');
  console.log(`  App: ${TARGET_APP.name} (${APP_ID})`);
  console.log(`  Monitor: http://127.0.0.1:3000/monitor/${execId}`);

  const workflowOk =
    result.status === 'PASSED' ||
    (result.steps?.[0]?.status === 'PASSED' && result.steps?.length > 0);
  process.exit(workflowOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
