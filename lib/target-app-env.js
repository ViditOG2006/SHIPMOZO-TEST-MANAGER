/** Resolve target webapp credentials/URLs — generic names with legacy SHIPMOZO_* fallbacks. */

function envFirst(...keys) {
  for (const key of keys) {
    const value = String(process.env[key] || "").trim();
    if (value) return value;
  }
  return "";
}

function getTargetAppUrl() {
  return envFirst("TARGET_APP_URL", "SHIPMOZO_PANEL_URL");
}

function getTargetAppEmail() {
  return envFirst("TARGET_APP_EMAIL", "SHIPMOZO_EMAIL");
}

function getTargetAppPassword() {
  return envFirst("TARGET_APP_PASSWORD", "SHIPMOZO_PASSWORD");
}

function getTargetAppApiBaseUrl() {
  return envFirst("TARGET_APP_API_URL", "SHIPMOZO_API_BASE_URL", "API_BASE_URL");
}

function getTargetAppName(fallback = "Application") {
  return envFirst("TARGET_APP_NAME") || fallback;
}

function panelUrlOverride(url) {
  const value = String(url || "").trim();
  if (!value) return {};
  return { TARGET_APP_URL: value, SHIPMOZO_PANEL_URL: value };
}

function panelCredentialOverrides(email, password) {
  const e = String(email || "").trim();
  const p = String(password || "").trim();
  if (!e || !p) return {};
  return {
    TARGET_APP_EMAIL: e,
    TARGET_APP_PASSWORD: p,
    SHIPMOZO_EMAIL: e,
    SHIPMOZO_PASSWORD: p,
  };
}

/** Env overrides passed to Playwright child processes (legacy names kept for Python scripts). */
function buildPanelEnvOverrides(extra = {}) {
  const url = getTargetAppUrl();
  const email = getTargetAppEmail();
  const password = getTargetAppPassword();
  const out = { ...extra };
  if (url) {
    out.TARGET_APP_URL = url;
    out.SHIPMOZO_PANEL_URL = url;
  }
  if (email) {
    out.TARGET_APP_EMAIL = email;
    out.SHIPMOZO_EMAIL = email;
  }
  if (password) {
    out.TARGET_APP_PASSWORD = password;
    out.SHIPMOZO_PASSWORD = password;
  }
  return out;
}

module.exports = {
  envFirst,
  getTargetAppUrl,
  getTargetAppEmail,
  getTargetAppPassword,
  getTargetAppApiBaseUrl,
  getTargetAppName,
  panelUrlOverride,
  panelCredentialOverrides,
  buildPanelEnvOverrides,
};
