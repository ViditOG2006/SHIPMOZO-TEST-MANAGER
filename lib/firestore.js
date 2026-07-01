/**
 * Server-side Firestore helpers (CommonJS).
 * Shared by retry-step, abort, and firestore-worker.
 */
const { initializeApp, getApps, getApp } = require("firebase/app");
const { getFirestore, doc, getDoc: firestoreGetDoc, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDiM8yNkIBASqyJICWy9i9hHdgwcTnq8I0",
  authDomain: "shipmozo-a2d3f.firebaseapp.com",
  projectId: "shipmozo-a2d3f",
  storageBucket: "shipmozo-a2d3f.firebasestorage.app",
  messagingSenderId: "795497767596",
  appId: "1:795497767596:web:471e778476dd499d56b509",
  measurementId: "G-EXZRDGC9YB",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getDoc(collectionName, id) {
  const snap = await firestoreGetDoc(doc(db, collectionName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

async function updateFireDoc(collectionName, id, patch) {
  await updateDoc(doc(db, collectionName, id), patch);
}

module.exports = {
  db,
  getDoc,
  updateFireDoc,
};
