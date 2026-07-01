/**
 * In-memory store for AI E2E script generation jobs.
 * Each job tracks status, logs, and the generated script path.
 */
const jobs = new Map();
const MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

function pruneJobs() {
  const cutoff = Date.now() - MAX_AGE_MS;
  for (const [id, job] of jobs) {
    if ((job.finishedAt || job.startedAt) < cutoff) jobs.delete(id);
  }
}

function createScriptGenJob({ executionId, stepId, testCaseName, scriptId }) {
  pruneJobs();
  const id = `scriptgen_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  jobs.set(id, {
    id,
    status: "running",
    executionId,
    stepId,
    testCaseName,
    scriptId,
    startedAt: Date.now(),
    finishedAt: null,
    scriptPath: null,
    logs: [],
    error: null,
  });
  return id;
}

function updateScriptGenJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return null;
  if (patch.log) {
    job.logs.push({ time: new Date().toISOString(), msg: patch.log });
    delete patch.log;
  }
  Object.assign(job, patch);
  if (patch.status === "done" || patch.status === "error") {
    job.finishedAt = Date.now();
  }
  return job;
}

function getScriptGenJob(id) {
  return jobs.get(id) || null;
}

module.exports = { createScriptGenJob, updateScriptGenJob, getScriptGenJob };
