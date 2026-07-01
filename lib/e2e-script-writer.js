/**
 * e2e-script-writer.js
 * AI orchestrator that generates Playwright Python E2E scripts for unknown flows.
 *
 * Workflow:
 *  1. Claude receives the test case name + existing script examples as context
 *  2. Playwright navigates the real Shipmozo panel (via Quick Search) to observe the target UI
 *  3. Claude generates a Python async function following the project's script patterns
 *  4. Script is saved to panel_e2e/generated/{flowId}.py
 *  5. run_panel_e2e.py is patched to register the new flow in FLOWS
 *  6. The execution step is reset to QUEUED for auto-retry (up to 3 attempts)
 */

const fs = require("fs");
const path = require("path");
const { callLLM } = require("./llm");
const { runPythonScript } = require("./spawn-python");
const { updateScriptGenJob } = require("./script-gen-job-store");

const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc, getDoc } = require("firebase/firestore");

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

const ROOT = path.join(__dirname, "..");
const GENERATED_DIR = path.join(ROOT, "panel_e2e", "generated");
const RUN_E2E_PY = path.join(ROOT, "run_panel_e2e.py");
const PANEL_E2E_ORDERS = path.join(ROOT, "panel_e2e", "orders.py");
const COLLECTIONS = { EXECUTIONS: "executions" };

// ─── Panel rules to include in the prompt ────────────────────────────────────

const PANEL_RULES = `
SHIPMOZO PANEL RULES (mandatory):
1. Primary navigation: Ctrl+B → "Quick Search Pages" → type module name → click result.
2. NEVER use hardcoded hrefs like /courier/manage-courier (404s on many tenants).
3. Always call dismiss_blocking_overlays(page) before interactions.
4. Use page.get_by_role() and page.get_by_text() with re.compile() for resilient locators.
5. Always return {"ok": bool, "stepsRun": list, "pageUrl": str, "uiText": str, "error": str|None}.
6. Imports must use existing helpers: panel_url.panel_origin, panel_ui_helpers.dismiss_blocking_overlays, panel_e2e.e2e_log.e2e_log.
7. The function signature must be: async def run_{flowId}_flow(page: Page, form: dict, **kwargs) -> dict
8. Keep the script short (< 100 lines). One async function only. No __main__ block.
`;

// ─── Load existing script as few-shot example ────────────────────────────────

function getExampleScript() {
  try {
    const src = fs.readFileSync(PANEL_E2E_ORDERS, "utf-8");
    return src.slice(0, 3000); // First 3000 chars as example
  } catch {
    return "# (example unavailable)";
  }
}

// ─── Write the generated script to disk ───────────────────────────────────────

function saveGeneratedScript(flowId, code) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const safeId = flowId.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const filePath = path.join(GENERATED_DIR, `${safeId}.py`);
  fs.writeFileSync(filePath, code, "utf-8");
  return { filePath, safeId };
}

// ─── Patch run_panel_e2e.py to register the new flow ─────────────────────────

function patchRunE2ePy(flowId, safeId) {
  let src = fs.readFileSync(RUN_E2E_PY, "utf-8");

  // Add import if not already present
  const importLine = `from panel_e2e.generated.${safeId} import run_${safeId}_flow`;
  if (!src.includes(importLine)) {
    // Insert after the last existing from panel_e2e import line
    src = src.replace(
      /^(from panel_e2e\.[^\n]+)\n(?!from panel_e2e)/m,
      `$1\n${importLine}\n`
    );
  }

  // Add to FLOWS dict if not already present
  const flowEntry = `    "${flowId}": run_${safeId}_flow,`;
  if (!src.includes(`"${flowId}"`)) {
    src = src.replace(
      /(FLOWS\s*=\s*\{[^}]*)(})/s,
      (match, body, closing) => `${body}${flowEntry}\n${closing}`
    );
  }

  fs.writeFileSync(RUN_E2E_PY, src, "utf-8");
}

// ─── Use Playwright to observe the target page ───────────────────────────────

async function observePanelPage(testCaseName, jobId) {
  updateScriptGenJob(jobId, { log: `🔍 Launching Playwright to observe the panel for: "${testCaseName}"` });

  // Build a quick Python snippet that logs page content
  const snippetPath = path.join(ROOT, "output", "runtime", `observe_${jobId}.py`);
  fs.mkdirSync(path.dirname(snippetPath), { recursive: true });

  const observeScript = `
import asyncio, json, sys, re
sys.path.insert(0, '${ROOT.replace(/\\/g, "/")}')
from shipmozo_login import async_login_and_save_state
from panel_ui_helpers import dismiss_blocking_overlays
from panel_quick_search import navigate_via_quick_search

async def main():
    p, browser, context, page = await async_login_and_save_state()
    try:
        await dismiss_blocking_overlays(page)
        query = ${JSON.stringify(testCaseName.split(/\s+/).slice(0, 3).join(" "))}
        await page.keyboard.press("Control+b")
        await asyncio.sleep(0.3)
        search = page.get_by_placeholder(re.compile("quick search|search pages", re.I))
        if await search.count() > 0:
            await search.first.fill(query)
            await asyncio.sleep(0.3)
        await asyncio.sleep(0.5)
        url = page.url
        try:
            body = await page.inner_text("body")
        except:
            body = ""
        try:
            buttons = [await b.inner_text() for b in await page.get_by_role("button").all()[:20]]
        except:
            buttons = []
        try:
            inputs = [await i.get_attribute("placeholder") or await i.get_attribute("aria-label") or "" for i in await page.locator("input").all()[:15]]
        except:
            inputs = []
        try:
            links = [await l.inner_text() for l in await page.get_by_role("link").all()[:20]]
        except:
            links = []
        print(json.dumps({
            "url": url,
            "bodySnippet": body[:3000],
            "buttons": [b for b in buttons if b.strip()],
            "inputs": [i for i in inputs if i.strip()],
            "links": [l for l in links if l.strip()]
        }))
    finally:
        await context.close()
        await browser.close()
        await p.stop()

asyncio.run(main())
`;

  fs.writeFileSync(snippetPath, observeScript, "utf-8");

  try {
    const result = await runPythonScript(snippetPath, [], { timeoutMs: 40000 });
    try { fs.unlinkSync(snippetPath); } catch { /* ignore */ }
    const parsed = JSON.parse(result.stdout || "{}");
    return parsed;
  } catch (err) {
    try { fs.unlinkSync(snippetPath); } catch { /* ignore */ }
    return { url: "", bodySnippet: "", buttons: [], inputs: [], links: [], error: err.message };
  }
}

// ─── Ask Claude to generate the script ───────────────────────────────────────

async function generateScriptWithClaude(testCaseName, flowId, pageObservation, jobId) {
  updateScriptGenJob(jobId, { log: "🤖 Asking Claude to generate the Playwright script..." });

  const safeId = flowId.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const example = getExampleScript();

  const systemPrompt = `You are an expert QA automation engineer who writes Python Playwright scripts for the Shipmozo merchant panel.
You output ONLY valid Python code. No markdown fences, no explanations — just the raw .py file content.
${PANEL_RULES}`;

  const userPrompt = `Generate a Python Playwright E2E script for the following test case.

TEST CASE NAME: "${testCaseName}"
FLOW ID: "${flowId}"
SAFE FUNCTION NAME: "run_${safeId}_flow"

PAGE OBSERVATION (from live Playwright session):
- URL: ${pageObservation.url || "unknown"}
- Buttons visible: ${(pageObservation.buttons || []).slice(0, 15).join(", ") || "none"}
- Inputs visible: ${(pageObservation.inputs || []).slice(0, 10).join(", ") || "none"}
- Navigation links: ${(pageObservation.links || []).slice(0, 15).join(", ") || "none"}
- Page text snippet: ${(pageObservation.bodySnippet || "").slice(0, 1200)}

EXISTING SCRIPT EXAMPLE (follow this pattern exactly):
\`\`\`python
${example}
\`\`\`

REQUIREMENTS:
1. Function signature: async def run_${safeId}_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]
2. Use Ctrl+B Quick Search to navigate to the relevant page
3. Interact with buttons/inputs found in the page observation
4. Return {"ok": bool, "stepsRun": list, "pageUrl": str, "uiText": str, "error": str|None}
5. Include all required imports at the top
6. Handle exceptions gracefully with try/except

Output ONLY the Python file content:`;

  const result = await callLLM({
    provider: "claude",
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
    maxTokens: 4096,
  });

  const code = (result.content || result.text || "").trim();
  updateScriptGenJob(jobId, { log: `✅ Claude generated ${code.split("\n").length} lines of Python code` });
  return code;
}

// ─── Verify the generated script is valid Python ─────────────────────────────

async function validatePythonScript(filePath, jobId) {
  updateScriptGenJob(jobId, { log: "🔎 Validating Python syntax..." });
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    const pythonBin = process.env.PYTHON_BIN || "python";
    exec(`"${pythonBin}" -m py_compile "${filePath}"`, (err, stdout, stderr) => {
      if (err) {
        const errorMsg = (stderr || "").trim() || err.message;
        updateScriptGenJob(jobId, { log: `⚠️ Syntax error: ${errorMsg}` });
        resolve({ ok: false, error: errorMsg });
      } else {
        updateScriptGenJob(jobId, { log: "✅ Python syntax valid" });
        resolve({ ok: true });
      }
    });
  });
}

// ─── Reset execution step to QUEUED for retry ────────────────────────────────

async function resetStepForRetry(executionId, stepId) {
  try {
    const docRef = doc(db, COLLECTIONS.EXECUTIONS, executionId);
    const execSnap = await getDoc(docRef);
    if (!execSnap.exists()) return;
    const execDoc = execSnap.data();

    const steps = (execDoc.steps || []).map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          status: "QUEUED",
          scriptMissing: false,
          scriptGenerated: true,
          logs: [
            ...s.logs,
            { time: new Date().toISOString(), level: "INFO", msg: "Script generated — retrying execution..." },
          ],
        };
      }
      return s;
    });

    await updateDoc(docRef, {
      status: "QUEUED",
      steps,
      scriptRetry: true,
    });
  } catch (err) {
    console.error("[script-writer] Failed to reset step:", err.message);
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

async function generateE2eScript({ executionId, stepId, testCaseName, scriptId, jobId }) {
  const log = (msg) => {
    console.log(`[script-writer] ${msg}`);
    updateScriptGenJob(jobId, { log: msg });
  };

  try {
    log(`Starting script generation for: "${testCaseName}" (flow: ${scriptId})`);

    // Step 1: Observe the panel
    const pageObservation = await observePanelPage(testCaseName, jobId);
    log(`Panel observation complete. URL: ${pageObservation.url || "unknown"}`);

    // Step 2: Generate script with Claude
    const code = await generateScriptWithClaude(testCaseName, scriptId, pageObservation, jobId);

    if (!code || code.length < 100) {
      throw new Error("Claude returned an empty or too-short script");
    }

    // Step 3: Save script to disk
    const { filePath, safeId } = saveGeneratedScript(scriptId, code);
    log(`Script saved to: ${filePath}`);

    // Step 4: Validate Python syntax
    const validation = await validatePythonScript(filePath, jobId);
    if (!validation.ok) {
      // Attempt a one-shot fix
      log("Attempting Claude self-heal of syntax error...");
      const fixedCode = await generateScriptWithClaude(
        testCaseName,
        scriptId,
        { ...pageObservation, syntaxError: validation.error },
        jobId
      );
      saveGeneratedScript(scriptId, fixedCode);
      const validation2 = await validatePythonScript(filePath, jobId);
      if (!validation2.ok) {
        throw new Error(`Python syntax error after self-heal: ${validation2.error}`);
      }
    }

    // Step 5: Dynamic registry will pick it up automatically from panel_e2e/generated/
    log(`Flow "${scriptId}" is now discoverable via dynamic importer`);

    // Step 6: Reset execution step to QUEUED for auto-retry
    if (executionId && stepId) {
      await resetStepForRetry(executionId, stepId);
      log("Execution step reset to QUEUED — auto-retry will begin shortly");
    }

    updateScriptGenJob(jobId, {
      status: "done",
      scriptPath: filePath,
      log: `🎉 Script generation complete! Flow "${scriptId}" is ready to run.`,
    });

    return { ok: true, scriptPath: filePath };
  } catch (err) {
    log(`❌ Script generation failed: ${err.message}`);
    updateScriptGenJob(jobId, {
      status: "error",
      error: err.message,
    });
    return { ok: false, error: err.message };
  }
}

module.exports = { generateE2eScript };
