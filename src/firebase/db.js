// ─── Firestore Service Layer ──────────────────────────────────
// All CRUD operations for every collection
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy,
  serverTimestamp, writeBatch
} from 'firebase/firestore';
import { db } from './config';

// ─── Generic Helpers ──────────────────────────────────────────
const col = (name) => collection(db, name);
const docRef = (name, id) => doc(db, name, id);

export async function fetchAll(collectionName) {
  const snap = await getDocs(col(collectionName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchOne(collectionName, id) {
  const snap = await getDoc(docRef(collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createDoc(collectionName, id, data) {
  await setDoc(docRef(collectionName, id), { ...data, updatedAt: serverTimestamp() });
}

export async function upsertDoc(collectionName, id, data) {
  await setDoc(docRef(collectionName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateFireDoc(collectionName, id, patch) {
  await updateDoc(docRef(collectionName, id), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteFireDoc(collectionName, id) {
  await deleteDoc(docRef(collectionName, id));
}

// ─── Real-time listener ───────────────────────────────────────
export function subscribeCollection(collectionName, callback) {
  return onSnapshot(col(collectionName), (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export function subscribeDoc(collectionName, id, callback) {
  return onSnapshot(docRef(collectionName, id), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}

// ─── Batch write (for seeding) ────────────────────────────────
export async function batchWrite(collectionName, items) {
  const CHUNK = 490; // Firestore batch limit is 500
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = writeBatch(db);
    items.slice(i, i + CHUNK).forEach(item => {
      const ref = docRef(collectionName, item.id);
      batch.set(ref, { ...item, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  }
}

// ─── Collection names ─────────────────────────────────────────
export const COLLECTIONS = {
  MODULES: 'modules',
  TEST_CASES: 'testCases',
  TEST_SUITES: 'testSuites',
  TEST_DATA_SETS: 'testDataSets',
  WORKFLOWS: 'workflows',
  ENVIRONMENTS: 'environments',
  EXECUTIONS: 'executions',
};
