# SHIPMOZO-TEST-MANAGER

## Automation Execution Platform (AEP)

A centralized web-based platform for QA Engineers, Product Managers, Developers, and Management to execute, monitor, and analyze automated tests — without touching code repositories or automation frameworks.

### Tech Stack
- **Frontend**: React + Vite
- **State**: Zustand + Firebase Firestore (real-time)
- **Charts**: Recharts
- **DnD**: @dnd-kit
- **Styling**: Vanilla CSS (dark glassmorphism theme)
- **Backend**: Firebase Firestore (NoSQL cloud database)

### Modules
1. **Test Repository** — Manage modules & test cases
2. **Test Data Management** — Key-value datasets, CSV import/export
3. **Workflow Builder** — Drag-and-drop test step ordering
4. **Execution Center** — Individual / Suite / Workflow / Module execution
5. **Environment Management** — Local, QA, UAT, Production configs
6. **Execution Engine** — Simulated test runner with real-time status
7. **Live Monitor** — Real-time execution tracking with log streaming
8. **Reports** — Filterable execution history with failure details
9. **Analytics** — Trend charts, module health, top failing tests

### Setup
```bash
npm install
npm run dev
```

### Firebase
Project: `shipmozo-a2d3f`
On first run, click "Seed Data to Firestore" to populate initial data.
