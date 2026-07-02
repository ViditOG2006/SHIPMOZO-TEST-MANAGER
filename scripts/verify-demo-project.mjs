/**
 * Provision a demo webapp project in Firestore and run its workflow end-to-end.
 * Usage: node scripts/verify-demo-project.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';

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

const TS = Date.now();
const APP_ID = `APP-DEMO-${TS}`;
const MOD_ID = `MOD-DEMO-${TS}`;
const WF_ID = `WF-DEMO-${TS}`;
const DS_ID = `DS-DEMO-${TS}`;

const DEMO_APP = {
  id: APP_ID,
  name: 'BookStore Demo',
  icon: '📚',
  description: 'Sample e-commerce webapp — checkout & shipping API smoke',
  baseUrl: 'https://panel.appiify.com',
  frontendTester: 'Playwright',
  backendTester: 'Postman Collection',
  postmanCollectionId: process.env.POSTMAN_COLLECTION_ID || '',
  postmanEnvironmentId: process.env.POSTMAN_ENVIRONMENT_ID || '',
  createdAt: new Date().toISOString(),
};

const DEMO_MODULE = {
  id: MOD_ID,
  name: 'Checkout',
  description: 'Book order checkout and shipping quotes',
  icon: '🛒',
  testCount: 3,
  appId: APP_ID,
};

const DEMO_CASES = [
  {
    id: `TC-DEMO-${TS}-1`,
    name: 'Panel Login Smoke',
    description: 'Verify merchant can sign in to the panel',
    type: 'UI',
    scriptId: 'auth/loginValid',
    moduleId: MOD_ID,
    tags: ['smoke'],
    status: 'Active',
    appId: APP_ID,
  },
  {
    id: `TC-DEMO-${TS}-2`,
    name: 'Pincode Serviceability API',
    description: 'Check delivery pincode is serviceable',
    type: 'API',
    scriptId: 'courier/serviceability',
    moduleId: MOD_ID,
    tags: ['smoke', 'api'],
    status: 'Active',
    appId: APP_ID,
  },
  {
    id: `TC-DEMO-${TS}-3`,
    name: 'Rate Calculator API',
    description: 'Get shipping rate quote for a parcel',
    type: 'API',
    scriptId: 'courier/rateCalc',
    moduleId: MOD_ID,
    tags: ['regression', 'api'],
    status: 'Active',
    appId: APP_ID,
  },
];

const DEMO_DATASET = {
  id: DS_ID,
  name: 'BookStore_QA_Data',
  environment: 'QA',
  description: 'Sample order payload for BookStore demo',
  appId: APP_ID,
  entries: [
    { key: 'pickup_pincode', value: '110001' },
    { key: 'delivery_pincode', value: '400001' },
    { key: 'weight', value: '0.5' },
  ],
};

const DEMO_WORKFLOW = {
  id: WF_ID,
  name: 'BookStore Checkout Smoke',
  description: 'Login → serviceability → rate quote (demo webapp workflow)',
  environment: 'ENV-002',
  dataSetId: DS_ID,
  stopOnFailure: true,
  appId: APP_ID,
  steps: [
    { id: `WFS-${TS}-1`, testCaseId: `TC-DEMO-${TS}-1`, order: 1 },
    { id: `WFS-${TS}-2`, testCaseId: `TC-DEMO-${TS}-2`, order: 2 },
    { id: `WFS-${TS}-3`, testCaseId: `TC-DEMO-${TS}-3`, order: 3 },
  ],
};

async function writeDoc(col, id, data) {
  await setDoc(doc(db, col, id), { ...data, updatedAt: serverTimestamp() });
}

async function provision() {
  console.log('\n=== Provisioning demo project ===');
  console.log(`App: ${DEMO_APP.name} (${APP_ID})`);

  if (!DEMO_APP.postmanCollectionId) {
    console.warn('WARN: POSTMAN_COLLECTION_ID not set — API steps may fail');
  }

  await writeDoc('applications', APP_ID, DEMO_APP);
  await writeDoc('modules', MOD_ID, DEMO_MODULE);
  for (const tc of DEMO_CASES) {
    await writeDoc('testCases', tc.id, tc);
  }
  await writeDoc('testDataSets', DS_ID, DEMO_DATASET);
  await writeDoc('workflows', WF_ID, DEMO_WORKFLOW);

  console.log('Created module, 3 test cases, dataset, workflow');
  return { APP_ID, WF_ID };
}

async function triggerWorkflow() {
  const execId = `EX-DEMO-${TS}`;
  const steps = DEMO_WORKFLOW.steps.map((s, i) => {
    const tc = DEMO_CASES.find((t) => t.id === s.testCaseId);
    return {
      id: `STEP-${execId}-${i}`,
      testCaseId: s.testCaseId,
      name: tc?.name || s.testCaseId,
      status: 'QUEUED',
      duration: 0,
      logs: [],
    };
  });

  const execution = {
    id: execId,
    type: 'WORKFLOW',
    referenceId: WF_ID,
    environmentId: DEMO_WORKFLOW.environment,
    dataSetId: DEMO_WORKFLOW.dataSetId,
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
    triggeredBy: 'verify-demo-project',
    runId: `RUN-${execId}`,
    label: DEMO_WORKFLOW.name,
    steps,
  };

  await writeDoc('executions', execId, execution);
  console.log(`\n=== Triggered workflow execution: ${execId} ===`);
  return execId;
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
      const status = data.status;
      process.stdout.write(`\r  status=${status} progress=${data.progress || 0}% passed=${data.passed || 0} failed=${data.failed || 0} skipped=${data.skipped || 0}   `);

      if (['PASSED', 'FAILED', 'ABORTED', 'AWAITING_SCRIPT'].includes(status)) {
        clearTimeout(timer);
        unsub();
        resolve({ id: execId, ...data });
      }
    });
  });
}

async function main() {
  await provision();
  const execId = await triggerWorkflow();

  console.log('\nWaiting for firestore-worker (ensure npm run dev is running)...');
  const result = await waitForExecution(execId);

  console.log('\n\n=== Execution result ===');
  console.log(`Status: ${result.status}`);
  for (const step of result.steps || []) {
    console.log(`  [${step.status}] ${step.name} (${Math.round((step.duration || 0) / 1000)}s)`);
    if (step.errorMsg) console.log(`         ${step.errorMsg}`);
  }

  console.log('\n=== Demo project IDs (use in UI Active App dropdown after refresh) ===');
  console.log(`  Application: ${APP_ID}`);
  console.log(`  Workflow:    ${WF_ID}`);
  console.log(`  Execution:   ${execId}`);
  console.log(`  Monitor URL: http://127.0.0.1:3000/monitor/${execId}`);

  process.exit(result.status === 'PASSED' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
