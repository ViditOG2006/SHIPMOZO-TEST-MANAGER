const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDiM8yNkIBASqyJICWy9i9hHdgwcTnq8I0",
  authDomain: "shipmozo-a2d3f.firebaseapp.com",
  projectId: "shipmozo-a2d3f",
  storageBucket: "shipmozo-a2d3f.firebasestorage.app",
  messagingSenderId: "795497767596",
  appId: "1:795497767596:web:471e778476dd499d56b509",
  measurementId: "G-EXZRDGC9YB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  const executionId = process.argv[2] || "EX-1782903477071";
  console.log(`Reading execution: ${executionId}`);
  const snap = await getDoc(doc(db, "executions", executionId));
  if (!snap.exists()) {
    console.log("Not found");
    return;
  }
  const data = snap.data();
  console.log("Status:", data.status);
  console.log("Passed:", data.passed, "Failed:", data.failed);
  console.log("Steps:");
  for (const step of data.steps || []) {
    console.log(`- Step: ${step.name} | Status: ${step.status} | Error: ${step.errorMsg}`);
    if (step.logs && step.logs.length) {
      console.log("  Logs:");
      for (const log of step.logs) {
        console.log(`    [${log.level}] ${log.msg}`);
      }
    }
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
