# Shipmozo AEP — Product Requirements Document (PRD)

## Document Information

| Field | Value |
|---|---|
| Product | Shipmozo Automation Execution Platform (AEP) |
| Version | 1.0 |
| Date | June 2026 |
| Author | Shipmozo Product Team |
| Status | Released |
| Stakeholders | QA Team, Engineering, Product, Management |

---

## 1. Product Overview

### 1.1 Vision Statement

Build a centralized web-based Automation Execution Platform that enables QA Engineers, Product Managers, Developers, and Management to execute, monitor, and analyze automated tests without interacting directly with automation repositories, Playwright code, API frameworks, CI pipelines, or technical tooling.

### 1.2 Goals

| # | Goal | Success Criteria |
|---|------|-----------------|
| G1 | Centralized test management | All test cases, data, and workflows in one platform |
| G2 | No-code test execution | Non-technical users can trigger tests independently |
| G3 | Real-time visibility | Live monitoring of running executions |
| G4 | Persistent cloud storage | All data survives refresh, accessible from anywhere |
| G5 | Role-based access | Different views/permissions per role |
| G6 | Data-driven insights | Analytics dashboards with trend analysis |

### 1.3 Non-Goals (Out of Scope for v1.0)

- AI-powered test generation or auto-healing
- Direct integration with Playwright/API runners (simulated in v1.0)
- User authentication with login/password (role switcher in v1.0)
- Scheduled/automated regression execution (manual trigger only)
- Multi-tenant / multi-project architecture
- Mobile native app

---

## 2. User Personas

### 2.1 QA Engineer (Primary)
- **Background**: Writes and maintains automation scripts
- **Goals**: Manage tests centrally, execute without opening repos, track results
- **Pain Points**: Context switching between tools, manual data management
- **Platform Access**: Full access to all modules

### 2.2 QA Lead
- **Background**: Oversees QA strategy and regression planning
- **Goals**: Plan regression suites, control environments, monitor team output
- **Pain Points**: No visibility into individual test health, manual planning
- **Platform Access**: Full access + Production environment management

### 2.3 Product Manager
- **Background**: Owns product quality from business perspective
- **Goals**: Verify features work, track quality trends, run smoke tests
- **Pain Points**: Cannot run tests independently, relies on QA availability
- **Platform Access**: Execution Center, Monitor, Analytics, Reports

### 2.4 Developer
- **Background**: Writes code and needs quick validation
- **Goals**: Verify feature doesn't break existing tests, debug failures
- **Pain Points**: Waiting for QA to run regression, reading raw logs
- **Platform Access**: Execution Center, Monitor, Reports

### 2.5 Management
- **Background**: Executives tracking engineering quality
- **Goals**: High-level quality dashboards, trend analysis, team performance
- **Pain Points**: No real-time quality metrics, manual report generation
- **Platform Access**: Dashboard, Monitor, Analytics, Reports

---

## 3. Feature Requirements

### Module 1: Test Repository

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| TR-001 | Display test modules as collapsible accordion groups | P0 | ✅ Done |
| TR-002 | Each module shows: name, description, icon, test count | P0 | ✅ Done |
| TR-003 | Expand module to view test cases in table format | P0 | ✅ Done |
| TR-004 | Test case fields: name, description, type (UI/API), scriptId, tags, status | P0 | ✅ Done |
| TR-005 | Create new module via modal form | P0 | ✅ Done |
| TR-006 | Edit existing module (name, description, icon) | P0 | ✅ Done |
| TR-007 | Delete module (cascades to child test cases) | P0 | ✅ Done |
| TR-008 | Create new test case within a module | P0 | ✅ Done |
| TR-009 | Edit existing test case | P0 | ✅ Done |
| TR-010 | Delete test case | P0 | ✅ Done |
| TR-011 | Filter test cases by type (All/UI/API) | P1 | ✅ Done |
| TR-012 | Search test cases by name or tag | P1 | ✅ Done |
| TR-013 | All changes persist to Firestore | P0 | ✅ Done |

### Module 2: Test Data Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| TD-001 | Display datasets in left sidebar list | P0 | ✅ Done |
| TD-002 | Select dataset to view key-value pairs in right panel | P0 | ✅ Done |
| TD-003 | Create new dataset (name, environment, description) | P0 | ✅ Done |
| TD-004 | Add key-value entry to dataset | P0 | ✅ Done |
| TD-005 | Edit key-value entry inline | P0 | ✅ Done |
| TD-006 | Delete key-value entry | P0 | ✅ Done |
| TD-007 | Delete entire dataset | P0 | ✅ Done |
| TD-008 | Import entries from CSV file (PapaParse) | P1 | ✅ Done |
| TD-009 | Export dataset entries as CSV download | P1 | ✅ Done |
| TD-010 | All changes persist to Firestore | P0 | ✅ Done |

### Module 3: Workflow Builder

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| WF-001 | Display workflows in left sidebar list | P0 | ✅ Done |
| WF-002 | Select workflow to view/edit steps in main panel | P0 | ✅ Done |
| WF-003 | Drag-and-drop step reordering (@dnd-kit) | P0 | ✅ Done |
| WF-004 | Right panel: test case picker grouped by module | P0 | ✅ Done |
| WF-005 | Add test case as workflow step via click | P0 | ✅ Done |
| WF-006 | Remove step from workflow | P0 | ✅ Done |
| WF-007 | Configure: environment, data set, stop-on-failure toggle | P0 | ✅ Done |
| WF-008 | Create new workflow | P0 | ✅ Done |
| WF-009 | Clone existing workflow | P1 | ✅ Done |
| WF-010 | Delete workflow | P0 | ✅ Done |
| WF-011 | Execute workflow (triggers execution engine) | P0 | ✅ Done |
| WF-012 | All changes persist to Firestore | P0 | ✅ Done |

### Module 4: Execution Center

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| EC-001 | Four execution modes: Individual, Suite, Workflow, Module | P0 | ✅ Done |
| EC-002 | Individual mode: wizard (Select Module → TC → Config → Review → Launch) | P0 | ✅ Done |
| EC-003 | Suite mode: select pre-built suite → configure → launch | P0 | ✅ Done |
| EC-004 | Workflow mode: select workflow → launch | P0 | ✅ Done |
| EC-005 | Module mode: select module → run all active TCs | P0 | ✅ Done |
| EC-006 | Environment selector in all modes | P0 | ✅ Done |
| EC-007 | Data set selector (optional) in Individual and Suite modes | P1 | ✅ Done |
| EC-008 | Execution summary/review step before launch | P1 | ✅ Done |
| EC-009 | Auto-redirect to Live Monitor after launch | P0 | ✅ Done |

### Module 5: Environment Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| EM-001 | Display 4 environments as cards (Local, QA, UAT, Production) | P0 | ✅ Done |
| EM-002 | Each card shows: name, base URL, API URL, variables | P0 | ✅ Done |
| EM-003 | Edit environment via modal (URLs, credentials, variables) | P0 | ✅ Done |
| EM-004 | Add/edit/delete configuration variables per environment | P0 | ✅ Done |
| EM-005 | Production environment restricted to QA Lead role | P0 | ✅ Done |
| EM-006 | Visual lock overlay for restricted environments | P1 | ✅ Done |
| EM-007 | Color-coded cards per environment | P2 | ✅ Done |
| EM-008 | All changes persist to Firestore | P0 | ✅ Done |

### Module 6: Execution Engine

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| EE-001 | Simulated execution: QUEUED → RUNNING → step-by-step → PASSED/FAILED | P0 | ✅ Done |
| EE-002 | ~78% pass rate with realistic error messages | P1 | ✅ Done |
| EE-003 | Step-by-step processing with 2.2s delay per step | P0 | ✅ Done |
| EE-004 | Generate realistic Playwright-style log entries per step | P0 | ✅ Done |
| EE-005 | Stop-on-failure logic: skip remaining steps if configured | P0 | ✅ Done |
| EE-006 | Track: passed, failed, skipped counts in real-time | P0 | ✅ Done |
| EE-007 | Calculate progress percentage during execution | P0 | ✅ Done |
| EE-008 | Record start time, end time, duration | P0 | ✅ Done |
| EE-009 | Support abort/stop execution mid-run | P0 | ✅ Done |
| EE-010 | All execution state persisted to Firestore in real-time | P0 | ✅ Done |

### Module 7: Real-Time Monitoring

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| MO-001 | Left sidebar: list of recent execution runs | P0 | ✅ Done |
| MO-002 | Select run to view detail panel | P0 | ✅ Done |
| MO-003 | Header card: run ID, status badge, type, environment, triggeredBy | P0 | ✅ Done |
| MO-004 | Live progress bar with percentage | P0 | ✅ Done |
| MO-005 | Stats row: total, passed, failed, skipped, start time | P0 | ✅ Done |
| MO-006 | Test steps table: step #, name, status, duration | P0 | ✅ Done |
| MO-007 | Live log console with color-coded levels (INFO/PASS/FAIL/WARN) | P0 | ✅ Done |
| MO-008 | Live elapsed timer during RUNNING state | P1 | ✅ Done |
| MO-009 | Stop Execution button (abort) | P0 | ✅ Done |
| MO-010 | Auto-refresh every 1.5 seconds | P0 | ✅ Done |
| MO-011 | Deep-link: /monitor/:id routes to specific execution | P1 | ✅ Done |

### Module 8: Reports

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| RP-001 | Summary KPI cards: Total Runs, Passed, Failed, Pass Rate | P0 | ✅ Done |
| RP-002 | Filter by status (All/PASSED/FAILED/RUNNING) | P0 | ✅ Done |
| RP-003 | Filter by type (All/INDIVIDUAL/SUITE/WORKFLOW/MODULE) | P0 | ✅ Done |
| RP-004 | Accordion list of executions with: runId, status, type, env, pass rate bar | P0 | ✅ Done |
| RP-005 | Expand execution to see per-step results | P0 | ✅ Done |
| RP-006 | Failed step detail: error message, stack trace, step logs | P0 | ✅ Done |
| RP-007 | Screenshot placeholder for failed tests | P2 | ✅ Done |
| RP-008 | Navigate to Monitor from any execution row | P1 | ✅ Done |
| RP-009 | Print/Export button | P2 | ✅ Done |

### Module 9: Historical Analytics

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| AN-001 | KPI row: Avg Pass Rate, Total Executions, Unique Testers, Top Failing | P0 | ✅ Done |
| AN-002 | Pass Rate Trend line chart (7d/14d/30d toggle) | P0 | ✅ Done |
| AN-003 | Module Health horizontal bar chart | P0 | ✅ Done |
| AN-004 | Pass vs Fail stacked bar chart by module | P0 | ✅ Done |
| AN-005 | Runs by Environment donut/pie chart | P1 | ✅ Done |
| AN-006 | Top Failing Test Cases ranked table | P0 | ✅ Done |
| AN-007 | Time range filter (7d/14d/30d) | P1 | ✅ Done |

---

## 4. Role-Based Access Matrix

| Module | QA Engineer | QA Lead | Product Manager | Developer | Management |
|--------|:-----------:|:-------:|:---------------:|:---------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Test Repository | ✅ | ✅ | ❌ | ❌ | ❌ |
| Test Data | ✅ | ✅ | ❌ | ❌ | ❌ |
| Workflow Builder | ✅ | ✅ | ❌ | ❌ | ❌ |
| Execution Center | ✅ | ✅ | ✅ | ✅ | ❌ |
| Environments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Live Monitor | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Production Env Edit | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 5. User Interface Requirements

### 5.1 Design System

| Property | Specification |
|---|---|
| Theme | Dark mode (primary background: #0F1629) |
| Style | Glassmorphism with translucent card overlays |
| Font | Inter (Google Fonts) |
| Accent Colors | Blue (#3B82F6), Purple (#8B5CF6), Cyan (#06B6D4) |
| Status Colors | Success (#10B981), Warning (#F59E0B), Danger (#EF4444) |
| Border Radius | 12px (cards), 8px (inputs), 6px (badges) |
| Animations | Smooth transitions (0.2s ease), shimmer loading, spin for loaders |

### 5.2 Layout

- Fixed left sidebar (240px width) with navigation
- Top bar with role switcher, search, notifications
- Main content area with page-specific layouts
- Responsive: minimum viewport 1024px

### 5.3 Navigation

| Nav Item | Icon | Route | Roles |
|---|---|---|---|
| Dashboard | LayoutDashboard | `/` | All |
| Test Repository | Database | `/repository` | QA |
| Test Data | FileSpreadsheet | `/test-data` | QA |
| Workflow Builder | GitBranch | `/workflows` | QA |
| Execution Center | PlayCircle | `/execute` | QA, PM, Dev |
| Environments | Globe | `/environments` | QA |
| Live Monitor | Activity | `/monitor` | All |
| Analytics | TrendingUp | `/analytics` | QA, PM, Mgmt |
| Reports | ClipboardList | `/reports` | All |

---

## 6. Data Requirements

### 6.1 Seed Data (Pre-loaded)

| Entity | Count | Examples |
|---|---|---|
| Modules | 6 | Orders, Wallet, Tracking, Courier Allocation, International, Authentication |
| Test Cases | 35 | Create Order Flow, Verify Wallet Balance, Track Shipment Status |
| Test Suites | 3 | Smoke, Full Regression, Critical Path |
| Data Sets | 6 | LoginData_QA, OrderData_Standard, WalletData_QA |
| Workflows | 2 | Full Order Journey, Wallet Recharge & Order |
| Environments | 4 | Local, QA, UAT, Production |
| Past Executions | 15 | Historical runs for analytics |

### 6.2 Data Persistence

All data persisted to Firebase Firestore in real-time. Changes are immediately reflected across all open browser tabs/devices via `onSnapshot` listeners.

---

## 7. Acceptance Criteria

| # | Criteria | Verified |
|---|---------|----------|
| AC-1 | All 9 modules load without errors | ✅ |
| AC-2 | CRUD operations persist to Firestore | ✅ |
| AC-3 | Execution engine simulates realistic test runs | ✅ |
| AC-4 | Live monitor updates every 1.5 seconds | ✅ |
| AC-5 | Role switcher changes visible navigation | ✅ |
| AC-6 | Analytics charts render with data | ✅ |
| AC-7 | Reports show per-step failure details | ✅ |
| AC-8 | Direct URL navigation works (SPA rewrite) | ✅ |
| AC-9 | Data survives browser refresh | ✅ |
| AC-10 | Deployed and accessible at public URL | ✅ |
