// ─── Seed Data for Automation Execution Platform ───────────────────────────

export const MODULES = [
  { id: 'MOD-001', name: 'Orders', description: 'Order creation, modification and cancellation flows', testCount: 8, icon: '📦' },
  { id: 'MOD-002', name: 'Wallet', description: 'Wallet top-up, deduction, and balance inquiry', testCount: 6, icon: '💰' },
  { id: 'MOD-003', name: 'Tracking', description: 'Shipment tracking across statuses', testCount: 5, icon: '📍' },
  { id: 'MOD-004', name: 'Courier Allocation', description: 'Auto and manual courier assignment logic', testCount: 7, icon: '🚚' },
  { id: 'MOD-005', name: 'International Shipment', description: 'Cross-border shipment creation and customs', testCount: 4, icon: '✈️' },
  { id: 'MOD-006', name: 'Authentication', description: 'Login, logout, SSO and session management', testCount: 5, icon: '🔐' },
];

export const TEST_CASES = [
  // Orders
  { id: 'TC-001', name: 'Add Single Order', description: 'Create a single B2C order with valid payload', type: 'API', scriptId: 'orders/addSingleOrder', moduleId: 'MOD-001', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-002', name: 'Bulk Order Upload', description: 'Upload 50 orders via CSV', type: 'UI', scriptId: 'orders/bulkUpload', moduleId: 'MOD-001', tags: ['regression'], status: 'Active' },
  { id: 'TC-003', name: 'Cancel Order', description: 'Cancel an order in CREATED state', type: 'API', scriptId: 'orders/cancelOrder', moduleId: 'MOD-001', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-004', name: 'Edit Order Details', description: 'Edit weight and dimensions before pickup', type: 'UI', scriptId: 'orders/editOrder', moduleId: 'MOD-001', tags: ['regression'], status: 'Active' },
  { id: 'TC-005', name: 'Generate Label', description: 'Generate shipping label for an order', type: 'UI', scriptId: 'orders/generateLabel', moduleId: 'MOD-001', tags: ['smoke', 'sanity'], status: 'Active' },
  { id: 'TC-006', name: 'Clone Order', description: 'Clone an existing order with new address', type: 'UI', scriptId: 'orders/cloneOrder', moduleId: 'MOD-001', tags: ['regression'], status: 'Active' },
  { id: 'TC-007', name: 'Order with COD', description: 'Create COD order and verify payment flag', type: 'API', scriptId: 'orders/codOrder', moduleId: 'MOD-001', tags: ['smoke'], status: 'Active' },
  { id: 'TC-008', name: 'Return Order', description: 'Initiate return flow for delivered order', type: 'API', scriptId: 'orders/returnOrder', moduleId: 'MOD-001', tags: ['regression'], status: 'Draft' },
  // Wallet
  { id: 'TC-009', name: 'Wallet Top-Up', description: 'Add credits to wallet via payment gateway', type: 'UI', scriptId: 'wallet/topUp', moduleId: 'MOD-002', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-010', name: 'Wallet Balance Inquiry', description: 'Check wallet balance via API', type: 'API', scriptId: 'wallet/balance', moduleId: 'MOD-002', tags: ['smoke', 'sanity'], status: 'Active' },
  { id: 'TC-011', name: 'Wallet Deduction on Shipment', description: 'Verify amount deducted on order creation', type: 'API', scriptId: 'wallet/deduction', moduleId: 'MOD-002', tags: ['regression'], status: 'Active' },
  { id: 'TC-012', name: 'Low Balance Alert', description: 'Trigger low balance notification', type: 'API', scriptId: 'wallet/lowBalanceAlert', moduleId: 'MOD-002', tags: ['regression'], status: 'Active' },
  { id: 'TC-013', name: 'Transaction History', description: 'Paginated transaction history', type: 'UI', scriptId: 'wallet/txHistory', moduleId: 'MOD-002', tags: ['regression'], status: 'Active' },
  { id: 'TC-014', name: 'Refund Processing', description: 'Refund to wallet after cancellation', type: 'API', scriptId: 'wallet/refund', moduleId: 'MOD-002', tags: ['regression'], status: 'Draft' },
  // Tracking
  { id: 'TC-015', name: 'Track by AWB', description: 'Track shipment using AWB number', type: 'API', scriptId: 'tracking/trackAWB', moduleId: 'MOD-003', tags: ['smoke', 'sanity'], status: 'Active' },
  { id: 'TC-016', name: 'Tracking Page Load', description: 'Public tracking page renders correctly', type: 'UI', scriptId: 'tracking/pageLoad', moduleId: 'MOD-003', tags: ['smoke'], status: 'Active' },
  { id: 'TC-017', name: 'Status Transition Verification', description: 'Verify all status transitions in order', type: 'API', scriptId: 'tracking/statusTransitions', moduleId: 'MOD-003', tags: ['regression'], status: 'Active' },
  { id: 'TC-018', name: 'NDR Flow Tracking', description: 'Track NDR and reattempt status', type: 'API', scriptId: 'tracking/ndrFlow', moduleId: 'MOD-003', tags: ['regression'], status: 'Active' },
  { id: 'TC-019', name: 'Webhook Tracking Events', description: 'Verify webhook fires on status change', type: 'API', scriptId: 'tracking/webhooks', moduleId: 'MOD-003', tags: ['regression'], status: 'Active' },
  // Courier Allocation
  { id: 'TC-020', name: 'Auto Allocation QA', description: 'Auto-assign courier based on serviceability', type: 'API', scriptId: 'courier/autoAllocation', moduleId: 'MOD-004', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-021', name: 'Manual Courier Assignment', description: 'Manually assign courier from available list', type: 'UI', scriptId: 'courier/manualAssign', moduleId: 'MOD-004', tags: ['regression'], status: 'Active' },
  { id: 'TC-022', name: 'Serviceability Check API', description: 'Pin code serviceability check', type: 'API', scriptId: 'courier/serviceability', moduleId: 'MOD-004', tags: ['smoke', 'sanity'], status: 'Active' },
  { id: 'TC-023', name: 'Rate Calculator', description: 'Get rates for different courier partners', type: 'API', scriptId: 'courier/rateCalc', moduleId: 'MOD-004', tags: ['regression'], status: 'Active' },
  { id: 'TC-024', name: 'SLA Breach Alert', description: 'Alert when SLA is about to breach', type: 'API', scriptId: 'courier/slaAlert', moduleId: 'MOD-004', tags: ['regression'], status: 'Active' },
  { id: 'TC-025', name: 'Re-allocation Flow', description: 'Re-allocate courier after pickup failure', type: 'UI', scriptId: 'courier/reAllocation', moduleId: 'MOD-004', tags: ['regression'], status: 'Draft' },
  { id: 'TC-026', name: 'Priority Courier Logic', description: 'Verify high-value order gets priority courier', type: 'API', scriptId: 'courier/priorityLogic', moduleId: 'MOD-004', tags: ['regression'], status: 'Active' },
  // International
  { id: 'TC-027', name: 'International Order Creation', description: 'Create cross-border shipment', type: 'API', scriptId: 'intl/createOrder', moduleId: 'MOD-005', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-028', name: 'Customs Declaration', description: 'Submit customs declaration form', type: 'UI', scriptId: 'intl/customs', moduleId: 'MOD-005', tags: ['regression'], status: 'Active' },
  { id: 'TC-029', name: 'HS Code Validation', description: 'Validate HS code for restricted items', type: 'API', scriptId: 'intl/hsCode', moduleId: 'MOD-005', tags: ['regression'], status: 'Active' },
  { id: 'TC-030', name: 'Duty Calculation', description: 'Calculate import duties for destination country', type: 'API', scriptId: 'intl/dutyCalc', moduleId: 'MOD-005', tags: ['regression'], status: 'Draft' },
  // Authentication
  { id: 'TC-031', name: 'Login with Valid Credentials', description: 'Login flow with correct email/password', type: 'UI', scriptId: 'auth/loginValid', moduleId: 'MOD-006', tags: ['smoke', 'sanity', 'regression'], status: 'Active' },
  { id: 'TC-032', name: 'Login with Invalid Credentials', description: 'Verify error on wrong credentials', type: 'UI', scriptId: 'auth/loginInvalid', moduleId: 'MOD-006', tags: ['regression'], status: 'Active' },
  { id: 'TC-033', name: 'Logout Flow', description: 'Logout and verify session cleared', type: 'UI', scriptId: 'auth/logout', moduleId: 'MOD-006', tags: ['smoke', 'regression'], status: 'Active' },
  { id: 'TC-034', name: 'Password Reset', description: 'Reset password via email OTP', type: 'UI', scriptId: 'auth/passwordReset', moduleId: 'MOD-006', tags: ['regression'], status: 'Active' },
  { id: 'TC-035', name: 'Session Expiry', description: 'Verify redirect on session timeout', type: 'API', scriptId: 'auth/sessionExpiry', moduleId: 'MOD-006', tags: ['regression'], status: 'Active' },
];

export const ENVIRONMENTS = [
  {
    id: 'ENV-001', name: 'Local', color: '#8B5CF6', restricted: false,
    baseUrl: 'http://localhost:3000', apiUrl: 'http://localhost:8080/api/v1',
    credentials: { username: 'local_admin@shipmozo.com', password: '••••••••' },
    variables: [{ key: 'TIMEOUT', value: '30000' }, { key: 'HEADLESS', value: 'false' }, { key: 'RETRY_COUNT', value: '1' }]
  },
  {
    id: 'ENV-002', name: 'QA', color: '#3B82F6', restricted: false,
    baseUrl: 'https://qa.shipmozo.com', apiUrl: 'https://qa-api.shipmozo.com/api/v1',
    credentials: { username: 'qa_test@shipmozo.com', password: '••••••••' },
    variables: [{ key: 'TIMEOUT', value: '60000' }, { key: 'HEADLESS', value: 'true' }, { key: 'RETRY_COUNT', value: '2' }]
  },
  {
    id: 'ENV-003', name: 'UAT', color: '#F59E0B', restricted: false,
    baseUrl: 'https://uat.shipmozo.com', apiUrl: 'https://uat-api.shipmozo.com/api/v1',
    credentials: { username: 'uat_test@shipmozo.com', password: '••••••••' },
    variables: [{ key: 'TIMEOUT', value: '90000' }, { key: 'HEADLESS', value: 'true' }, { key: 'RETRY_COUNT', value: '3' }]
  },
  {
    id: 'ENV-004', name: 'Production', color: '#EF4444', restricted: true,
    baseUrl: 'https://app.shipmozo.com', apiUrl: 'https://api.shipmozo.com/api/v1',
    credentials: { username: '(restricted)', password: '••••••••' },
    variables: [{ key: 'TIMEOUT', value: '120000' }, { key: 'HEADLESS', value: 'true' }, { key: 'RETRY_COUNT', value: '0' }]
  },
];

export const TEST_DATA_SETS = [
  {
    id: 'DS-001', name: 'LoginData_QA', environment: 'QA', description: 'Login credentials for QA environment',
    entries: [
      { key: 'username', value: 'qa_test@shipmozo.com' },
      { key: 'password', value: 'Test@1234' },
      { key: 'otp', value: '123456' },
    ]
  },
  {
    id: 'DS-002', name: 'OrderData_Standard', environment: 'QA', description: 'Standard B2C order payload',
    entries: [
      { key: 'pickup_pincode', value: '110001' },
      { key: 'delivery_pincode', value: '400001' },
      { key: 'weight', value: '0.5' },
      { key: 'length', value: '10' },
      { key: 'breadth', value: '10' },
      { key: 'height', value: '5' },
      { key: 'cod_amount', value: '0' },
      { key: 'declared_value', value: '500' },
    ]
  },
  {
    id: 'DS-003', name: 'WalletData_QA', environment: 'QA', description: 'Wallet test amounts',
    entries: [
      { key: 'topup_amount', value: '5000' },
      { key: 'low_balance_threshold', value: '500' },
      { key: 'test_account_id', value: 'ACC-QA-1001' },
    ]
  },
  {
    id: 'DS-004', name: 'CourierData_QA', environment: 'QA', description: 'Courier allocation test data',
    entries: [
      { key: 'origin_pincode', value: '110001' },
      { key: 'destination_pincode', value: '560001' },
      { key: 'courier_partner', value: 'DTDC' },
      { key: 'weight_kg', value: '1.0' },
    ]
  },
  {
    id: 'DS-005', name: 'IntlShipment_UAE', environment: 'UAT', description: 'International shipment to UAE',
    entries: [
      { key: 'origin_country', value: 'IN' },
      { key: 'destination_country', value: 'AE' },
      { key: 'hs_code', value: '62034200' },
      { key: 'declared_value_usd', value: '150' },
      { key: 'currency', value: 'USD' },
    ]
  },
  {
    id: 'DS-006', name: 'LoginData_UAT', environment: 'UAT', description: 'Login credentials for UAT environment',
    entries: [
      { key: 'username', value: 'uat_test@shipmozo.com' },
      { key: 'password', value: 'UAT@Test456' },
    ]
  },
];

export const TEST_SUITES = [
  { id: 'SUITE-001', name: 'Smoke', description: 'Critical path tests for every deploy', tags: ['smoke'], testCaseIds: ['TC-001', 'TC-005', 'TC-009', 'TC-010', 'TC-015', 'TC-020', 'TC-022', 'TC-027', 'TC-031', 'TC-033'] },
  { id: 'SUITE-002', name: 'Sanity', description: 'Core functionality verification', tags: ['sanity'], testCaseIds: ['TC-001', 'TC-005', 'TC-010', 'TC-015', 'TC-022', 'TC-031'] },
  { id: 'SUITE-003', name: 'Regression', description: 'Full regression suite', tags: ['regression'], testCaseIds: TEST_CASES.filter(tc => tc.tags.includes('regression')).map(tc => tc.id) },
  { id: 'SUITE-004', name: 'Orders Full', description: 'All order module tests', tags: ['orders'], testCaseIds: ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'TC-006', 'TC-007', 'TC-008'] },
];

export const WORKFLOWS = [
  {
    id: 'WF-001', name: 'Full Order Journey', description: 'End-to-end order creation to delivery tracking',
    environment: 'ENV-002', dataSetId: 'DS-002', stopOnFailure: true,
    steps: [
      { id: 'WFS-001', testCaseId: 'TC-031', order: 1 },
      { id: 'WFS-002', testCaseId: 'TC-001', order: 2 },
      { id: 'WFS-003', testCaseId: 'TC-020', order: 3 },
      { id: 'WFS-004', testCaseId: 'TC-005', order: 4 },
      { id: 'WFS-005', testCaseId: 'TC-015', order: 5 },
    ]
  },
  {
    id: 'WF-002', name: 'Wallet Recharge & Order', description: 'Top up wallet then place order',
    environment: 'ENV-002', dataSetId: 'DS-003', stopOnFailure: false,
    steps: [
      { id: 'WFS-006', testCaseId: 'TC-031', order: 1 },
      { id: 'WFS-007', testCaseId: 'TC-009', order: 2 },
      { id: 'WFS-008', testCaseId: 'TC-010', order: 3 },
      { id: 'WFS-009', testCaseId: 'TC-001', order: 4 },
      { id: 'WFS-010', testCaseId: 'TC-011', order: 5 },
    ]
  },
];

// Generate realistic past executions
function randomExecution(id, type, refId, status, daysAgo, envId, totalTests) {
  const passed = status === 'PASSED' ? totalTests : Math.floor(totalTests * 0.7);
  const failed = status === 'FAILED' ? totalTests - passed : (status === 'PASSED' ? 0 : totalTests - passed);
  const startDate = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 3600000);
  const duration = Math.floor(60000 + Math.random() * 300000);
  return {
    id,
    type, // 'INDIVIDUAL' | 'SUITE' | 'WORKFLOW' | 'MODULE'
    referenceId: refId,
    environmentId: envId,
    status,
    totalTests,
    passed,
    failed,
    skipped: totalTests - passed - failed,
    startTime: startDate.toISOString(),
    endTime: new Date(startDate.getTime() + duration).toISOString(),
    duration,
    triggeredBy: ['Rahul S.', 'Priya K.', 'Amit D.', 'Neha M.', 'Vidit J.'][Math.floor(Math.random() * 5)],
    runId: `RUN-${id}`,
  };
}

export const EXECUTIONS = [
  randomExecution('EX-001', 'SUITE', 'SUITE-001', 'PASSED', 1, 'ENV-002', 10),
  randomExecution('EX-002', 'WORKFLOW', 'WF-001', 'FAILED', 1, 'ENV-002', 5),
  randomExecution('EX-003', 'SUITE', 'SUITE-003', 'PASSED', 2, 'ENV-002', 28),
  randomExecution('EX-004', 'INDIVIDUAL', 'TC-031', 'PASSED', 2, 'ENV-003', 1),
  randomExecution('EX-005', 'MODULE', 'MOD-001', 'FAILED', 3, 'ENV-002', 8),
  randomExecution('EX-006', 'SUITE', 'SUITE-002', 'PASSED', 4, 'ENV-002', 6),
  randomExecution('EX-007', 'WORKFLOW', 'WF-002', 'PASSED', 5, 'ENV-002', 5),
  randomExecution('EX-008', 'SUITE', 'SUITE-001', 'PASSED', 6, 'ENV-003', 10),
  randomExecution('EX-009', 'SUITE', 'SUITE-003', 'FAILED', 7, 'ENV-002', 28),
  randomExecution('EX-010', 'MODULE', 'MOD-002', 'PASSED', 8, 'ENV-002', 6),
  randomExecution('EX-011', 'SUITE', 'SUITE-001', 'PASSED', 9, 'ENV-002', 10),
  randomExecution('EX-012', 'WORKFLOW', 'WF-001', 'PASSED', 10, 'ENV-003', 5),
  randomExecution('EX-013', 'SUITE', 'SUITE-003', 'PASSED', 11, 'ENV-002', 28),
  randomExecution('EX-014', 'SUITE', 'SUITE-002', 'FAILED', 12, 'ENV-002', 6),
  randomExecution('EX-015', 'INDIVIDUAL', 'TC-011', 'PASSED', 13, 'ENV-002', 1),
];

export const ANALYTICS_TREND = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(Date.now() - (29 - i) * 86400000);
  const pass = Math.floor(70 + Math.random() * 25);
  return {
    date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    passRate: pass,
    failRate: 100 - pass,
    executions: Math.floor(2 + Math.random() * 8),
  };
});

export const MODULE_STATS = [
  { name: 'Orders', passed: 42, failed: 8 },
  { name: 'Wallet', passed: 31, failed: 5 },
  { name: 'Tracking', passed: 28, failed: 2 },
  { name: 'Courier', passed: 35, failed: 12 },
  { name: 'Intl', passed: 18, failed: 6 },
  { name: 'Auth', passed: 44, failed: 1 },
];

export const FAILING_TESTS = [
  { name: 'Bulk Order Upload', module: 'Orders', failCount: 8, lastFailed: '2h ago' },
  { name: 'SLA Breach Alert', module: 'Courier Allocation', failCount: 7, lastFailed: '1d ago' },
  { name: 'Duty Calculation', module: 'International', failCount: 6, lastFailed: '3h ago' },
  { name: 'Re-allocation Flow', module: 'Courier Allocation', failCount: 5, lastFailed: '5h ago' },
  { name: 'Refund Processing', module: 'Wallet', failCount: 4, lastFailed: '2d ago' },
];
