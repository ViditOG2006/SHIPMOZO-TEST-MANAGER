# Test Manager

## Automation Execution Platform

A centralized web platform for QA teams to register any web application, orchestrate Playwright UI tests and Postman API runs, monitor executions in real time, and analyze results — without touching code repositories directly.

### Tech Stack
- **Frontend**: React + Vite
- **State**: Zustand + Firebase Firestore (real-time)
- **Charts**: Recharts
- **DnD**: @dnd-kit
- **Styling**: Vanilla CSS (dark glassmorphism theme)
- **Backend**: Express + Firebase Firestore worker

### Modules
1. **Application Registry** — Register target webapps with base URL, Postman collection, and login credentials
2. **Test Repository** — Manage modules & test cases
3. **Test Data Management** — Key-value datasets, CSV import/export
4. **Workflow Builder** — Drag-and-drop test step ordering
5. **Execution Center** — Individual / Suite / Workflow / Module execution
6. **Environment Management** — Local, QA, UAT, Production configs
7. **Live Monitor** — Real-time execution tracking with log streaming
8. **Reports** — Filterable execution history with failure details
9. **Analytics** — Trend charts, module health, top failing tests

### Setup
```bash
npm install
npm run dev
```

Configure your target app in **Applications** (stored in Firestore):
- Unique App ID (e.g. `APP-1719912345678-ABC123`)
- Target URL, panel login credentials, Postman collection IDs

Team members sign in with **App ID + email + password**.

Server `.env` only needs platform keys (`POSTMAN_API_KEY` for Newman fetch) — not per-app panel credentials.

### Firebase
Project: `shipmozo-a2d3f`
On first run, click "Seed Data to Firestore" to populate sample modules, test cases, and workflows.
