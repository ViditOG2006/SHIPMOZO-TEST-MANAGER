const { initializeApp } = require("firebase/app");
const { getFirestore, collection, onSnapshot, doc, updateDoc, getDoc } = require("firebase/firestore");
const { runPostmanCollectionViaNewman } = require("./postman-newman-runner");
const { runE2eBatch } = require("./test-e2e-batch");
const fs = require("fs");
const path = require("path");

// Environment loaded via server.js loadDotEnv()

// Firebase config
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

console.log("[firestore-worker] Starting Firestore execution worker...");

async function runExecution(executionId, docData) {
  const executionRef = doc(db, "executions", executionId);

  // 1. Mark status as RUNNING
  await updateDoc(executionRef, {
    status: "RUNNING",
    progress: 5,
  });

  const steps = docData.steps || [];
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  // Group steps by E2E and API
  const resolvedSteps = [];
  for (const step of steps) {
    const tcDoc = await getDoc(doc(db, "testCases", step.testCaseId));
    const tcData = tcDoc.exists() ? tcDoc.data() : null;
    resolvedSteps.push({
      ...step,
      type: tcData?.type || "UI", // fallback to UI
      scriptId: tcData?.scriptId || "",
    });
  }

  // 2. Loop through resolved steps and execute them
  for (let i = 0; i < resolvedSteps.length; i++) {
    const step = resolvedSteps[i];
    const stepIdx = i;

    // Check if we should skip due to previous failure and stopOnFailure configuration
    if (failedCount > 0 && docData.stopOnFailure) {
      resolvedSteps[stepIdx].status = "SKIPPED";
      skippedCount++;
      await updateDoc(executionRef, {
        steps: resolvedSteps,
        skipped: skippedCount,
        progress: Math.round(((stepIdx + 1) / resolvedSteps.length) * 100),
      });
      continue;
    }

    // Mark step as RUNNING
    resolvedSteps[stepIdx].status = "RUNNING";
    await updateDoc(executionRef, {
      steps: resolvedSteps,
      progress: Math.round((stepIdx / resolvedSteps.length) * 100),
    });

    const startTime = Date.now();
    let stepStatus = "PASSED";
    let stepLogs = [];
    let errorMsg = null;

    try {
      stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: `Starting test: ${step.name}` });

      if (step.type === "API") {
        stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: "Running Postman collection via Newman..." });
        
        const collectionId = process.env.POSTMAN_COLLECTION_ID || docData.dataSetId; // fallback to dataset info or environment variable
        const environmentId = process.env.POSTMAN_ENVIRONMENT_ID;
        
        if (!collectionId) {
          throw new Error("POSTMAN_COLLECTION_ID is not configured in environment variables.");
        }

        // Newman execution
        const outcome = await runPostmanCollectionViaNewman({
          collectionId,
          environmentId,
          folders: [step.scriptId],
        });

        stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: `Newman Stats: passed=${outcome.passed}, failed=${outcome.failed}` });
        
        const reqKey = step.scriptId.toLowerCase().trim();
        const requestOutcome = outcome.byName[reqKey] || Object.values(outcome.byName)[0];
        
        if (requestOutcome) {
          stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: `Response Code: ${requestOutcome.status || "N/A"}` });
          if (!requestOutcome.ok) {
            stepStatus = "FAILED";
            errorMsg = requestOutcome.requestError || `Assertions failed: ${requestOutcome.failedAsserts} failed assertions.`;
            stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: errorMsg });
          } else {
            stepLogs.push({ time: new Date().toISOString(), level: "PASS", msg: `✓ Test passed: ${step.name}` });
          }
        } else {
          stepLogs.push({ time: new Date().toISOString(), level: "WARN", msg: `Request "${step.scriptId}" not found in Postman response. Defaulting to execution status.` });
          if (outcome.failed > 0) {
            stepStatus = "FAILED";
            errorMsg = "Newman assertion failure detected in the run.";
            stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: errorMsg });
          } else {
            stepLogs.push({ time: new Date().toISOString(), level: "PASS", msg: `✓ Test passed: ${step.name}` });
          }
        }

      } else {
        const { SUPPORTED_E2E_FLOWS } = require("./ai-e2e-heal");
        const safeFlowId = (step.scriptId || "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
        const generatedScriptPath = path.join(__dirname, "../panel_e2e/generated", `${safeFlowId}.py`);
        const isSupported = SUPPORTED_E2E_FLOWS.includes(step.scriptId) || fs.existsSync(generatedScriptPath);

        if (!step.scriptId || !isSupported) {
          stepLogs.push({ time: new Date().toISOString(), level: "WARN", msg: `E2E flow "${step.scriptId || "(empty)"}" is not supported.` });
          stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: `Pausing execution. Awaiting AI Script Generation for: ${step.name}` });
          
          resolvedSteps[stepIdx].status = "AWAITING_SCRIPT";
          resolvedSteps[stepIdx].scriptMissing = true;
          resolvedSteps[stepIdx].missingFlow = step.scriptId || `flow_${Date.now()}`;
          resolvedSteps[stepIdx].logs = stepLogs;

          await updateDoc(executionRef, {
            status: "AWAITING_SCRIPT",
            steps: resolvedSteps,
            progress: Math.round(((stepIdx) / resolvedSteps.length) * 100),
          });
          console.log(`[firestore-worker] Execution ${executionId} paused: Awaiting script for step ${step.id}`);
          return; // Stop execution loop and wait for script generation / user action
        }

        stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: "Spawning Python Playwright batch runner..." });
        
        const scenarioObj = {
          id: step.testCaseId,
          title: step.name,
          category: "e2e",
          inputs: {
            e2eFlow: step.scriptId,
          }
        };

        const batchOutcome = await runE2eBatch(
          [scenarioObj],
          { runId: executionId, runTarget: "frontend", recordVideo: false, skipAiHeal: !process.env.ANTHROPIC_API_KEY }
        );

        if (batchOutcome && batchOutcome.ok === false) {
          stepStatus = "FAILED";
          errorMsg = batchOutcome.error || "UI E2E test execution failed.";
          stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: errorMsg });
        } else {
          const scResult = batchOutcome?.results?.[0] || {};
          const resultDetail = scResult.error || scResult.status || "Success";
          stepLogs.push({ time: new Date().toISOString(), level: "INFO", msg: `Playwright output: ${resultDetail}` });
          // Check both ok===false and status==='failed' since test-e2e-batch uses status strings
          if (scResult.ok === false || scResult.status === 'failed') {
            stepStatus = "FAILED";
            errorMsg = scResult.error || "E2E scenario verification failed.";
            stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: errorMsg });
          } else if (!batchOutcome?.results?.length) {
            stepStatus = "FAILED";
            errorMsg = `E2E flow '${step.scriptId}' did not produce any results. Check that scriptId maps to a supported e2eFlow.`;
            stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: errorMsg });
          } else {
            stepLogs.push({ time: new Date().toISOString(), level: "PASS", msg: `✓ Test passed: ${step.name}` });
          }
        }
      }

    } catch (err) {
      stepStatus = "FAILED";
      errorMsg = err.message || String(err);
      stepLogs.push({ time: new Date().toISOString(), level: "FAIL", msg: `Error during test run: ${errorMsg}` });
    }

    const duration = Date.now() - startTime;
    resolvedSteps[stepIdx].status = stepStatus;
    resolvedSteps[stepIdx].duration = duration;
    resolvedSteps[stepIdx].logs = stepLogs;
    resolvedSteps[stepIdx].errorMsg = errorMsg;

    if (stepStatus === "PASSED") passedCount++;
    else failedCount++;

    await updateDoc(executionRef, {
      steps: resolvedSteps,
      passed: passedCount,
      failed: failedCount,
      progress: Math.round(((stepIdx + 1) / resolvedSteps.length) * 100),
    });
  }

  const finalStatus = failedCount > 0 ? "FAILED" : "PASSED";
  await updateDoc(executionRef, {
    status: finalStatus,
    endTime: new Date().toISOString(),
    duration: Date.now() - new Date(docData.startTime).getTime(),
    progress: 100,
  });

  console.log(`[firestore-worker] Execution ${executionId} completed with status: ${finalStatus}`);
}

function startListener() {
  onSnapshot(collection(db, "executions"), async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === "added" || change.type === "modified") {
        const docData = change.doc.data();
        if (docData.status === "QUEUED") {
          const executionId = change.doc.id;
          console.log(`[firestore-worker] Found queued execution: ${executionId}`);
          runExecution(executionId, docData).catch((err) => {
            console.error(`[firestore-worker] Error running execution ${executionId}:`, err);
          });
        }
      }
    }
  });
}

module.exports = {
  startListener
};
