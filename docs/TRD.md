# Shipmozo AEP — Technical Requirements Document (TRD)

## Document Information

| Field | Value |
|---|---|
| Product | Shipmozo Automation Execution Platform (AEP) |
| Version | 1.0 |
| Date | June 2026 |
| Author | Shipmozo Engineering Team |
| Status | Released |
| Audience | Developers, DevOps, Technical Architects |

---

## 1. System Architecture

### 1.1 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│                                                                  │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────────────┐ │
│  │ React   │  │ Zustand  │  │ React   │  │ Recharts          │ │
│  │ 19.x    │  │ Stores   │  │ Router  │  │ Charts            │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └───────────────────┘ │
│       │            │             │                               │
│       ▼            ▼             ▼                               │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              Firebase Client SDK (v11.x)                     ││
│  │  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐    ││
│  │  │ getFirestore  │  │ onSnapshot  │  │ setDoc/updateDoc│    ││
│  │  └──────────────┘  └─────────────┘  └─────────────────┘    ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS (WebSocket for real-time)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       CLOUD TIER (Firebase)                      │
│                                                                  │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │  Firestore      │  │  Firebase Auth │  │  Cloud Storage   │ │
│  │  (NoSQL DB)     │  │  (future)      │  │  (future)        │ │
│  │                 │  │                │  │                  │ │
│  │  7 Collections  │  │  User mgmt    │  │  Screenshots,    │ │
│  │  Real-time sync │  │  Roles        │  │  Artifacts       │ │
│  └─────────────────┘  └────────────────┘  └──────────────────┘ │
│                                                                  │
│  Project: shipmozo-a2d3f                                        │
│  Region: asia-south1                                            │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      HOSTING TIER (Render)                       │
│                                                                  │
│  Type: Static Site                                              │
│  Build: npm install && npm run build                            │
│  Serve: ./dist (Vite production bundle)                         │
│  Routing: /* → /index.html (SPA rewrite)                        │
│  URL: https://shipmozo-test-manager.onrender.com                │
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **UI Framework** | React | 19.x | Component-based UI |
| **Build Tool** | Vite | 8.x | Dev server, HMR, production bundler |
| **State Management** | Zustand | 5.x | Lightweight global stores |
| **Routing** | React Router DOM | 7.x | Client-side SPA routing |
| **Charts** | Recharts | 2.x | Data visualization (Line, Bar, Pie) |
| **Drag & Drop** | @dnd-kit/core + sortable | 9.x | Workflow step reordering |
| **CSV Parsing** | PapaParse | 5.x | CSV import/export for test data |
| **Icons** | Lucide React | 0.5.x | Icon library |
| **Database** | Firebase Firestore | 11.x | Cloud NoSQL with real-time sync |
| **Hosting** | Render | — | Static site CDN |

### 1.3 No Backend Server

This application has **no Express/Node.js server**. The React SPA communicates directly with Firebase Firestore via the client SDK. All business logic runs in the browser.

```
❌  Browser → Express Server → Database
✅  Browser → Firebase SDK → Firestore (direct)
```

---

## 2. Data Model

### 2.1 Firestore Collections

```
Firestore Database: shipmozo-a2d3f
│
├── modules/                    # 6 documents
│   └── {moduleId}
│       ├── id: string          # "MOD-001"
│       ├── name: string        # "Orders"
│       ├── description: string
│       ├── icon: string        # emoji
│       ├── testCount: number
│       └── updatedAt: timestamp
│
├── testCases/                  # 35 documents
│   └── {testCaseId}
│       ├── id: string          # "TC-001"
│       ├── name: string        # "Create Order Flow"
│       ├── description: string
│       ├── type: string        # "UI" | "API"
│       ├── scriptId: string    # "orders/createOrder.spec.ts"
│       ├── moduleId: string    # FK → modules
│       ├── tags: string[]      # ["smoke", "regression"]
│       ├── status: string      # "Active" | "Draft" | "Deprecated"
│       └── updatedAt: timestamp
│
├── testSuites/                 # 3 documents
│   └── {suiteId}
│       ├── id: string          # "SUITE-001"
│       ├── name: string        # "Smoke"
│       ├── description: string
│       ├── tags: string[]
│       ├── testCaseIds: string[]  # FK[] → testCases
│       └── updatedAt: timestamp
│
├── testDataSets/               # 6 documents
│   └── {dataSetId}
│       ├── id: string          # "DS-001"
│       ├── name: string        # "LoginData_QA"
│       ├── environment: string # "QA"
│       ├── description: string
│       ├── entries: array
│       │   └── [{key: string, value: string}]
│       └── updatedAt: timestamp
│
├── workflows/                  # 2 documents
│   └── {workflowId}
│       ├── id: string          # "WF-001"
│       ├── name: string        # "Full Order Journey"
│       ├── description: string
│       ├── environment: string # FK → environments
│       ├── dataSetId: string   # FK → testDataSets
│       ├── stopOnFailure: boolean
│       ├── steps: array
│       │   └── [{id, testCaseId, order}]
│       └── updatedAt: timestamp
│
├── environments/               # 4 documents
│   └── {envId}
│       ├── id: string          # "ENV-001"
│       ├── name: string        # "Local"
│       ├── color: string       # "#8B5CF6"
│       ├── restricted: boolean # true for Production
│       ├── baseUrl: string
│       ├── apiUrl: string
│       ├── credentials: object
│       │   └── {username, password}
│       ├── variables: array
│       │   └── [{key: string, value: string}]
│       └── updatedAt: timestamp
│
└── executions/                 # 15+ documents (grows)
    └── {executionId}
        ├── id: string          # "EX-1782229794221"
        ├── type: string        # "INDIVIDUAL"|"SUITE"|"WORKFLOW"|"MODULE"
        ├── referenceId: string # FK → source entity
        ├── environmentId: string
        ├── dataSetId: string
        ├── status: string      # "QUEUED"|"RUNNING"|"PASSED"|"FAILED"|"ABORTED"
        ├── totalTests: number
        ├── passed: number
        ├── failed: number
        ├── skipped: number
        ├── progress: number    # 0-100
        ├── startTime: string   # ISO 8601
        ├── endTime: string
        ├── duration: number    # milliseconds
        ├── triggeredBy: string
        ├── runId: string       # "RUN-EX-1782229794221"
        ├── label: string       # human-readable name
        ├── steps: array
        │   └── [{
        │       id: string,
        │       testCaseId: string,
        │       name: string,
        │       status: string,
        │       duration: number,
        │       logs: [{time, level, msg}],
        │       errorMsg: string|null
        │   }]
        └── updatedAt: timestamp
```

### 2.2 Entity Relationships

```
modules ←──1:N──── testCases
modules ←──1:N──── (Execution Center Module mode)
testCases ←──N:M── testSuites.testCaseIds
testCases ←──N:M── workflows.steps[].testCaseId
testCases ←──N:M── executions.steps[].testCaseId
environments ←──1:N── executions.environmentId
environments ←──1:N── workflows.environment
testDataSets ←──1:N── executions.dataSetId
testDataSets ←──1:N── workflows.dataSetId
```

### 2.3 Firestore Usage Estimates

| Operation | Per Execution (10 steps) | Daily (20 runs) | Monthly |
|---|---|---|---|
| Reads (onSnapshot) | ~50 | ~1,000 | ~30,000 |
| Writes (step updates) | ~25 | ~500 | ~15,000 |
| Document size | ~5 KB | — | — |
| Storage | ~50 KB | ~1 MB | ~30 MB |
| **Free tier limit** | — | 50k reads, 20k writes | **Well within limits** |

---

## 3. Source Code Structure

```
shipmozo-test-manager/
├── index.html                    # Root HTML entry
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite build configuration
├── render.yaml                   # Render deployment blueprint
├── public/
│   ├── favicon.svg               # App favicon
│   ├── icons.svg                 # SVG sprite
│   └── _redirects                # SPA rewrite for Render
├── docs/
│   ├── BUSINESS_MODEL.md         # Business model & workflow
│   ├── PRD.md                    # Product Requirements Document
│   ├── TRD.md                    # Technical Requirements Document (this file)
│   └── USER_MANUAL.md            # User Manual
└── src/
    ├── main.jsx                  # React entry point
    ├── App.jsx                   # Router, layout shell, Firebase init
    ├── index.css                 # Global design system (variables, components)
    ├── firebase/
    │   ├── config.js             # Firebase app initialization
    │   ├── db.js                 # Firestore service layer (CRUD, listeners, batch)
    │   └── seed.js               # One-time data seeder
    ├── data/
    │   └── seedData.js           # Hardcoded seed data (35 TCs, 6 modules, etc.)
    ├── store/
    │   └── index.js              # Zustand stores (6 stores, execution engine)
    ├── components/
    │   ├── Sidebar.jsx           # Navigation sidebar (role-filtered)
    │   ├── TopBar.jsx            # Role switcher, search, notifications
    │   └── SeedModal.jsx         # First-run Firestore seed modal
    └── pages/
        ├── Dashboard.jsx         # KPI cards, trend chart, recent runs
        ├── TestRepository.jsx    # Module accordion, TC CRUD
        ├── TestDataManager.jsx   # Dataset key-value editor, CSV I/O
        ├── WorkflowBuilder.jsx   # DnD workflow builder
        ├── ExecutionCenter.jsx   # 4-mode execution wizard
        ├── EnvironmentManager.jsx # Env cards with role-based lock
        ├── MonitoringView.jsx    # Real-time execution tracking
        ├── Reports.jsx           # Execution history with failure detail
        └── Analytics.jsx         # Charts and analytics dashboard
```

---

## 4. State Management

### 4.1 Zustand Stores

| Store | Purpose | Firestore Collection | Real-time |
|-------|---------|---------------------|-----------|
| `useAppStore` | Role, loading state, notifications | — (local only) | No |
| `useRepoStore` | Modules, test cases, test suites | modules, testCases, testSuites | ✅ onSnapshot |
| `useDataStore` | Test data sets | testDataSets | ✅ onSnapshot |
| `useWorkflowStore` | Workflows | workflows | ✅ onSnapshot |
| `useEnvStore` | Environments | environments | ✅ onSnapshot |
| `useExecutionStore` | Executions, engine, active run | executions | ✅ onSnapshot |

### 4.2 Data Flow Pattern

```
User Action (button click)
    ↓
Store Method (e.g., addTestCase)
    ↓
Firestore Write (setDoc / updateDoc)
    ↓
Firestore Server processes write
    ↓
onSnapshot listener fires (all clients)
    ↓
Zustand store.set() with new data
    ↓
React component re-renders
```

**Key principle**: The Zustand store never holds "local-only" mutations for persistent data. Every write goes to Firestore first, and the `onSnapshot` listener is the single source of truth that updates the store.

### 4.3 Execution Engine

The execution simulation engine runs client-side using `setTimeout` chains:

```
triggerExecution()
    ↓
Write initial execution doc (QUEUED) → Firestore
    ↓
setTimeout(600ms) → runStep()
    ↓
Mark step RUNNING → Firestore write
    ↓
setTimeout(2200ms) → resolve step
    ↓
Random pass/fail (78% pass rate)
    ↓
Generate Playwright-style logs
    ↓
Update step status + logs → Firestore write
    ↓
If more steps: recurse → runStep()
    ↓
If done: set final status (PASSED/FAILED) → Firestore write
```

Each step update writes to Firestore, so the `onSnapshot` listener on `/executions/{id}` pushes real-time updates to the Monitor page (or any other open tab).

---

## 5. Firebase Configuration

### 5.1 Project Details

| Field | Value |
|---|---|
| Project Name | shipmozo |
| Project ID | shipmozo-a2d3f |
| Auth Domain | shipmozo-a2d3f.firebaseapp.com |
| Storage Bucket | shipmozo-a2d3f.firebasestorage.app |
| Plan | Spark (free) |
| Region | asia-south1 (Mumbai) |

### 5.2 Security Rules (Current — Test Mode)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEST MODE — open access
    }
  }
}
```

> ⚠️ **Production recommendation**: Replace with role-based rules when Firebase Auth is implemented.

### 5.3 Recommended Production Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read everything
    match /{document=**} {
      allow read: if request.auth != null;
    }
    // QA roles can write to most collections
    match /modules/{id} { allow write: if request.auth != null; }
    match /testCases/{id} { allow write: if request.auth != null; }
    match /testDataSets/{id} { allow write: if request.auth != null; }
    match /workflows/{id} { allow write: if request.auth != null; }
    match /executions/{id} { allow write: if request.auth != null; }
    // Only QA Lead can modify Production environment
    match /environments/{id} {
      allow write: if request.auth != null &&
        (resource.data.restricted != true || request.auth.token.role == 'QA Lead');
    }
  }
}
```

---

## 6. Deployment

### 6.1 Build Pipeline

```
Developer pushes to GitHub (main branch)
    ↓
Render detects push (auto-deploy enabled)
    ↓
Render runs: npm install && npm run build
    ↓
Vite builds production bundle:
  - index.html (0.64 KB)
  - index-CixnnXEv.css (20.99 KB)
  - index-sb_T8jgw.js (1,269 KB / 372 KB gzipped)
    ↓
Render serves ./dist/ via CDN
    ↓
SPA rewrite rule: /* → /index.html
    ↓
Live at: https://shipmozo-test-manager.onrender.com
```

### 6.2 Render Configuration

| Setting | Value |
|---|---|
| Type | Static Site |
| Repository | github.com/ViditOG2006/SHIPMOZO-TEST-MANAGER |
| Branch | main |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Rewrite Rule | `/* → /index.html` (Rewrite) |
| Auto-Deploy | On push to main |

### 6.3 Environment Variables

No server-side environment variables are needed. Firebase config is embedded in the client bundle (this is safe — Firebase Security Rules protect data, not the config keys).

---

## 7. Performance

### 7.1 Bundle Size

| Asset | Raw | Gzipped |
|---|---|---|
| HTML | 0.64 KB | 0.39 KB |
| CSS | 20.99 KB | 4.65 KB |
| JS | 1,269 KB | 372 KB |
| **Total** | **1,291 KB** | **377 KB** |

### 7.2 Performance Targets

| Metric | Target | Actual |
|---|---|---|
| First Contentful Paint | < 2s | ~1.2s (CDN-served) |
| Firestore data load | < 3s | ~2-3s (initial onSnapshot) |
| Step-to-step update (monitor) | < 500ms | ~200ms (Firestore push) |
| Page navigation | Instant | Instant (SPA client-side routing) |

### 7.3 Optimization Opportunities (future)

- Code-split per route with `React.lazy()` to reduce initial bundle
- Firestore query indexes for filtered execution queries
- Service worker for offline support
- Image optimization for screenshots (WebP)

---

## 8. Error Handling

### 8.1 Firestore Error Handling

| Error | Handling |
|---|---|
| Network offline | Firestore SDK caches locally, syncs when online |
| Write conflict | Last-write-wins (Firestore default) |
| Permission denied | Caught in store methods, shown as toast/alert |
| Quota exceeded | Alert user, suggest upgrading Firebase plan |

### 8.2 Execution Engine Error Handling

| Scenario | Behavior |
|---|---|
| Step fails | Mark step FAILED, log error, continue or stop based on `stopOnFailure` |
| Execution aborted | Mark execution ABORTED, stop step loop |
| Browser closed mid-execution | Execution stays in RUNNING state (no server-side cleanup in v1.0) |

---

## 9. Testing Strategy

### 9.1 Current (v1.0)

- Manual E2E testing via browser (all 9 modules verified)
- Firestore persistence verified (create → refresh → data retained)
- Direct URL navigation verified (SPA rewrite rule)
- Cross-tab real-time sync verified (execution runs, other tab updates)

### 9.2 Future Recommendations

| Type | Tool | Coverage Target |
|---|---|---|
| Unit Tests | Vitest | Store logic, data transforms |
| Component Tests | React Testing Library | Form modals, state interactions |
| E2E Tests | Playwright | Full user workflows |
| Integration Tests | Vitest + Firebase Emulator | Firestore CRUD operations |

---

## 10. Security Considerations

| Area | Current State | Recommendation |
|---|---|---|
| Authentication | Role switcher (no auth) | Firebase Auth with email/password |
| Authorization | Client-side role check | Firestore Security Rules per role |
| API Keys | Embedded in client JS | Safe — Firestore Rules protect data |
| Data Encryption | Firestore encrypts at rest | ✅ Already handled by Firebase |
| HTTPS | Render enforces HTTPS | ✅ Already enforced |
| XSS | React auto-escapes JSX | ✅ Built-in protection |
| CORS | Firebase handles CORS | ✅ Already handled |
