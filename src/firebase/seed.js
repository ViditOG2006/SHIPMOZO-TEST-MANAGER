// ─── One-time Firestore Seeder ────────────────────────────────
// Writes sample data scoped to the active application workspace.
import { batchWrite, COLLECTIONS } from './db';
import {
  MODULES, TEST_CASES, TEST_SUITES, TEST_DATA_SETS,
  WORKFLOWS, ENVIRONMENTS, EXECUTIONS
} from '../data/seedData';

function withAppId(items, appId) {
  if (!appId) throw new Error('Select or create an application before seeding sample data.');
  return items.map(item => ({ ...item, appId }));
}

export async function seedFirestore(onProgress, appId) {
  const steps = [
    { label: 'Modules', col: COLLECTIONS.MODULES, data: MODULES },
    { label: 'Test Cases', col: COLLECTIONS.TEST_CASES, data: TEST_CASES },
    { label: 'Test Suites', col: COLLECTIONS.TEST_SUITES, data: TEST_SUITES },
    { label: 'Test Data Sets', col: COLLECTIONS.TEST_DATA_SETS, data: TEST_DATA_SETS },
    { label: 'Workflows', col: COLLECTIONS.WORKFLOWS, data: WORKFLOWS },
    { label: 'Environments', col: COLLECTIONS.ENVIRONMENTS, data: ENVIRONMENTS },
    { label: 'Executions', col: COLLECTIONS.EXECUTIONS, data: EXECUTIONS },
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onProgress?.(`Seeding ${step.label}…`, Math.round(((i) / steps.length) * 100));
    await batchWrite(step.col, withAppId(step.data, appId));
  }

  onProgress?.('✅ Seed complete!', 100);
}
