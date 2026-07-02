/** Build daily pass/fail trend from execution records. */
export function buildPassRateTrend(executions, days = 30) {
  const buckets = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { date: key.slice(5), passRate: 0, failRate: 0, total: 0, passed: 0 });
  }

  for (const ex of executions || []) {
    const started = ex.startTime || ex.startedAt || ex.createdAt;
    if (!started) continue;
    const key = new Date(started).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.total++;
    if (ex.status === 'PASSED') bucket.passed++;
  }

  return Array.from(buckets.values()).map(b => ({
    date: b.date,
    passRate: b.total ? Math.round((b.passed / b.total) * 100) : 0,
    failRate: b.total ? Math.round(((b.total - b.passed) / b.total) * 100) : 0,
  }));
}

/** Aggregate pass/fail counts per module from executions + test cases. */
export function buildModuleStats(executions, testCases, modules) {
  const moduleNames = Object.fromEntries((modules || []).map(m => [m.id, m.name]));
  const tcModule = Object.fromEntries((testCases || []).map(tc => [tc.id, tc.moduleId]));
  const stats = {};

  for (const ex of executions || []) {
    let moduleId = ex.moduleId;
    if (!moduleId && ex.type === 'INDIVIDUAL' && ex.referenceId) {
      moduleId = tcModule[ex.referenceId];
    }
    if (!moduleId && ex.type === 'MODULE') moduleId = ex.referenceId;
    if (!moduleId) continue;

    if (!stats[moduleId]) {
      stats[moduleId] = { name: moduleNames[moduleId] || moduleId, passed: 0, failed: 0 };
    }
    if (ex.status === 'PASSED') stats[moduleId].passed += ex.passed ?? 1;
    else if (ex.status === 'FAILED') stats[moduleId].failed += ex.failed ?? 1;
  }

  return Object.values(stats);
}

/** Top failing test cases derived from execution history. */
export function buildFailingTests(executions, testCases, limit = 5) {
  const tcNames = Object.fromEntries((testCases || []).map(tc => [tc.id, tc.name]));
  const tcModules = Object.fromEntries((testCases || []).map(tc => [tc.id, tc.moduleId]));
  const failures = {};

  for (const ex of executions || []) {
    if (ex.type !== 'INDIVIDUAL' || ex.status !== 'FAILED') continue;
    const id = ex.referenceId;
    if (!id) continue;
    if (!failures[id]) {
      failures[id] = {
        name: tcNames[id] || id,
        module: tcModules[id] || '—',
        failCount: 0,
        lastFailed: ex.endTime || ex.startTime,
      };
    }
    failures[id].failCount++;
    const ts = ex.endTime || ex.startTime;
    if (ts && ts > failures[id].lastFailed) failures[id].lastFailed = ts;
  }

  return Object.values(failures)
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, limit)
    .map(t => ({
      ...t,
      lastFailed: t.lastFailed ? new Date(t.lastFailed).toLocaleDateString() : '—',
    }));
}
