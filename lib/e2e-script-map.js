/** Map test-case scriptId values to runnable panel e2eFlow names. */

const SCRIPT_ID_TO_E2E_FLOW = {
  "auth/loginvalid": "panel_login_smoke",
  "auth/login": "panel_login_smoke",
  "panel/login": "panel_login_smoke",
};

/**
 * Resolve a test-case scriptId to the e2eFlow passed to Playwright session runner.
 * @param {string} scriptId
 * @returns {string}
 */
function resolveE2eFlow(scriptId) {
  const id = String(scriptId || "").trim();
  if (!id) return "";
  const mapped = SCRIPT_ID_TO_E2E_FLOW[id.toLowerCase()];
  return mapped || id;
}

function isPlaceholderCredential(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v.startsWith("(")) return true;
  if (v === "••••••••" || v === "********" || v === "**********") return true;
  return false;
}

const { panelCredentialOverrides } = require("./target-app-env");

/**
 * Build target-app credential overrides when a full credential pair is available.
 * Avoids partial overrides (e.g. QA username + Render password) that break panel login.
 * @param {{ credentials?: { username?: string, password?: string } } | null} envDoc
 * @param {Record<string, string>} dataEntries
 * @returns {Record<string, string>}
 */
function resolvePanelCredentialOverrides(envDoc, dataEntries = {}) {
  const creds = envDoc?.credentials || {};
  const candidates = [
    {
      email: String(creds.username || "").trim(),
      password: String(creds.password || "").trim(),
    },
    {
      email: String(
        dataEntries.username || dataEntries.TARGET_APP_EMAIL || dataEntries.SHIPMOZO_EMAIL || ""
      ).trim(),
      password: String(
        dataEntries.password || dataEntries.TARGET_APP_PASSWORD || dataEntries.SHIPMOZO_PASSWORD || ""
      ).trim(),
    },
  ];

  for (const { email, password } of candidates) {
    const userOk = !isPlaceholderCredential(email);
    const passOk = !isPlaceholderCredential(password);
    if (userOk && passOk) {
      return panelCredentialOverrides(email, password);
    }
  }
  return {};
}

module.exports = {
  SCRIPT_ID_TO_E2E_FLOW,
  resolveE2eFlow,
  isPlaceholderCredential,
  resolvePanelCredentialOverrides,
};
