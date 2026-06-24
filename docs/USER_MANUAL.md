# Shipmozo AEP — User Manual

## Document Information

| Field | Value |
|---|---|
| Product | Shipmozo Automation Execution Platform (AEP) |
| Version | 1.0 |
| Date | June 2026 |
| URL | https://shipmozo-test-manager.onrender.com |
| Audience | All platform users |

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Test Repository](#3-test-repository)
4. [Test Data Management](#4-test-data-management)
5. [Workflow Builder](#5-workflow-builder)
6. [Execution Center](#6-execution-center)
7. [Environment Management](#7-environment-management)
8. [Live Monitor](#8-live-monitor)
9. [Reports](#9-reports)
10. [Analytics](#10-analytics)
11. [Roles & Permissions](#11-roles--permissions)
12. [FAQ & Troubleshooting](#12-faq--troubleshooting)

---

## 1. Getting Started

### 1.1 Accessing the Platform

Open your browser and navigate to:

```
https://shipmozo-test-manager.onrender.com
```

No login is required in v1.0. The platform opens directly to the Dashboard.

### 1.2 First-Time Setup

On first access (when Firestore is empty), you'll see a **"First-Run Setup"** modal. Click **"Seed Data to Firestore"** to populate the platform with sample modules, test cases, datasets, workflows, and environments. This only needs to be done once — all subsequent visits will load data from the cloud.

### 1.3 Switching Roles

Click the **role dropdown** in the top-right corner of the top bar to switch between roles:

| Role | Description |
|------|-------------|
| **QA Engineer** | Full access to all modules |
| **QA Lead** | Full access + Production environment management |
| **Product Manager** | Execution, monitoring, analytics, reports |
| **Developer** | Execution, monitoring, reports |
| **Management** | Dashboard, monitoring, analytics, reports |

The sidebar navigation automatically adjusts based on your selected role.

### 1.4 Navigation

The **left sidebar** contains all platform modules. Click any item to navigate:

| Icon | Module | Description |
|------|--------|-------------|
| 📊 | Dashboard | Overview with KPIs and recent activity |
| 🗄️ | Test Repository | Manage modules and test cases |
| 📋 | Test Data | Create and manage test datasets |
| 🔀 | Workflow Builder | Build reusable test workflows |
| ▶️ | Execution Center | Configure and launch test runs |
| 🌐 | Environments | Manage execution environments |
| 📡 | Live Monitor | Real-time execution tracking |
| 📈 | Analytics | Historical trends and charts |
| 📑 | Reports | Detailed execution reports |

---

## 2. Dashboard

The Dashboard provides a high-level overview of your testing activity.

### What you'll see:

- **KPI Cards**: Total Runs, Passed, Failed, Test Cases, Running Now
- **Pass Rate Trend Chart**: Line chart showing pass/fail rates over 30 days
- **Quick Actions**: One-click buttons for common tasks
- **Recent Executions Table**: Last 10 execution runs with status and results

### Quick Actions:

| Button | Action |
|--------|--------|
| New Test Case | Opens Test Repository to create a test |
| Run Smoke Suite | Launches Smoke suite in Execution Center |
| View Analytics | Navigates to Analytics page |
| Manage Environments | Navigates to Environments page |

---

## 3. Test Repository

### 3.1 Viewing Modules & Test Cases

1. Navigate to **Test Repository** from the sidebar
2. You'll see **module cards** listed as an accordion
3. Click any module row to **expand** it and see its test cases
4. Each test case shows: Name, Type (UI/API), Script ID, Tags, Status

### 3.2 Filtering Test Cases

- Use the **type filter tabs** at the top: `All` | `UI` | `API`
- Use the **search bar** to search by test case name or tag

### 3.3 Creating a New Module

1. Click the **"+ New Module"** button (top-right)
2. In the modal:
   - Select an **icon** (emoji)
   - Enter **Module Name** (e.g., "Payments")
   - Enter **Description** (e.g., "Payment gateway test flows")
3. Click **"Create Module"**
4. The module immediately appears in the list and is saved to the cloud

### 3.4 Editing a Module

1. Expand the module
2. Click the **pencil icon** (✏️) next to the module name
3. Edit the name, description, or icon
4. Click **"Update Module"**

### 3.5 Deleting a Module

1. Click the **trash icon** (🗑️) next to the module
2. Confirm deletion
3. ⚠️ This also deletes all test cases within the module

### 3.6 Creating a New Test Case

1. Expand the target module
2. Click **"+ Add Test Case"** inside the module section
3. Fill in the form:
   - **Name**: Descriptive name (e.g., "Verify Order Creation with COD")
   - **Description**: What the test validates
   - **Type**: `UI` (Playwright browser test) or `API` (API endpoint test)
   - **Script ID**: Path to the automation script (e.g., `orders/createOrder.spec.ts`)
   - **Tags**: Comma-separated tags (e.g., `smoke, regression, p0`)
   - **Status**: `Active`, `Draft`, or `Deprecated`
4. Click **"Create Test Case"**

### 3.7 Editing / Deleting a Test Case

- Click the **pencil icon** on a test case row to edit
- Click the **trash icon** to delete

---

## 4. Test Data Management

### 4.1 Overview

Test Data Management allows you to create **key-value datasets** that can be attached to test executions. For example, login credentials, order parameters, or environment-specific data.

### 4.2 Viewing Datasets

1. Navigate to **Test Data** from the sidebar
2. The **left panel** shows all datasets
3. Click a dataset to view its entries in the **right panel**

### 4.3 Creating a New Dataset

1. Click **"+ New Dataset"** (top-left area)
2. Enter:
   - **Name** (e.g., "PaymentData_QA")
   - **Environment** (e.g., "QA")
   - **Description** (e.g., "Payment flow test parameters")
3. Click **"Create"**

### 4.4 Adding Key-Value Entries

1. Select a dataset from the left panel
2. In the right panel, click **"+ Add Entry"**
3. Enter the **Key** (e.g., `card_number`) and **Value** (e.g., `4111111111111111`)
4. Click the **save/add** button
5. The entry is immediately saved to Firestore

### 4.5 Editing an Entry

- Click the **value field** of any entry to edit it inline
- Press Enter or click outside to save

### 4.6 Deleting an Entry

- Click the **trash icon** (🗑️) next to the entry

### 4.7 Importing from CSV

1. Click the **"Import CSV"** button
2. Select a CSV file with two columns: `key` and `value`
3. Example CSV:
   ```
   key,value
   username,testuser@shipmozo.com
   password,Test@123
   otp,000000
   ```
4. All entries are parsed and added to the selected dataset

### 4.8 Exporting to CSV

1. Click the **"Export CSV"** button
2. A CSV file downloads with all entries from the selected dataset

---

## 5. Workflow Builder

### 5.1 Overview

Workflows let you chain multiple test cases together into a sequence. You can configure the execution order, environment, data set, and stop-on-failure behavior.

### 5.2 Viewing Workflows

1. Navigate to **Workflow Builder** from the sidebar
2. The **left panel** lists all workflows
3. Click a workflow to see its steps in the **center panel**

### 5.3 Creating a New Workflow

1. Click **"+ New Workflow"**
2. Enter a name and description
3. Click **"Create"**

### 5.4 Adding Steps to a Workflow

1. Select a workflow from the left panel
2. In the **right panel**, you'll see test cases grouped by module
3. **Click a test case** to add it as a step to the workflow
4. The step appears in the center panel with a drag handle

### 5.5 Reordering Steps (Drag & Drop)

1. Grab the **drag handle** (⋮⋮) on the left side of a step
2. **Drag** it up or down to reorder
3. Release to drop it in the new position
4. The new order is saved automatically

### 5.6 Removing a Step

- Click the **✕** button on the right side of a step

### 5.7 Configuring Workflow Settings

In the workflow detail panel, you can set:

| Setting | Description |
|---------|-------------|
| **Environment** | Which environment to run against (Local, QA, UAT, Production) |
| **Data Set** | Which test data set to use (optional) |
| **Stop on Failure** | If enabled, execution stops at the first failed step; remaining steps are marked SKIPPED |

### 5.8 Cloning a Workflow

- Click the **"Clone"** button to create a copy of the workflow

### 5.9 Executing a Workflow

- Click the **"▶ Execute"** button
- You'll be redirected to the **Live Monitor** to watch the execution

---

## 6. Execution Center

### 6.1 Overview

The Execution Center is where you configure and launch test runs. There are 4 execution modes:

### 6.2 Individual Execution

Run a **single test case**:

1. Click the **"Individual"** tab
2. **Step 1**: Select a Module (click a module card)
3. **Step 2**: Select a Test Case from that module
4. **Step 3**: Configure Environment and Data Set
5. **Step 4**: Review the execution summary
6. Click **"🚀 Launch Execution"**
7. You're redirected to Live Monitor

### 6.3 Suite Execution

Run a **pre-defined test suite**:

1. Click the **"Suite"** tab
2. Select a suite (Smoke, Full Regression, or Critical Path)
3. Click **"Next"**
4. Configure Environment and Data Set
5. Click **"🚀 Launch Suite"**

### 6.4 Workflow Execution

Run a **previously built workflow**:

1. Click the **"Workflow"** tab
2. Select a workflow from the list
3. Click **"▶ Execute Workflow"**

### 6.5 Module Execution

Run **all active test cases** in a module:

1. Click the **"Module"** tab
2. Select a module card
3. Choose an Environment
4. Click **"▶ Run Module Tests"**

---

## 7. Environment Management

### 7.1 Overview

Environments define where tests execute. Each environment has its own base URL, API URL, credentials, and configuration variables.

### 7.2 Pre-configured Environments

| Environment | Base URL | Restricted |
|------------|----------|------------|
| **Local** | http://localhost:3000 | No |
| **QA** | https://qa.shipmozo.com | No |
| **UAT** | https://uat.shipmozo.com | No |
| **Production** | https://www.shipmozo.com | ✅ Yes (QA Lead only) |

### 7.3 Editing an Environment

1. Navigate to **Environments** from the sidebar
2. Click **"Edit"** on an environment card
3. In the modal, you can change:
   - **Base URL**: The web application URL
   - **API URL**: The API endpoint URL
   - **Variables**: Key-value configuration pairs (e.g., `TIMEOUT=30000`)
4. Click **"Save Changes"**

### 7.4 Managing Variables

In the edit modal:
- To **add** a variable: Enter the Key and Value in the bottom row, click **+**
- To **edit** a variable: Change the value in the text field
- To **delete** a variable: Click the **trash icon** next to it

### 7.5 Production Environment Restriction

The Production environment is **locked** for non-QA-Lead roles. If you're logged in as a Product Manager, Developer, or Management role, you'll see a **"🔒 Restricted Access"** overlay on the Production card. Switch your role to **QA Lead** to access it.

---

## 8. Live Monitor

### 8.1 Overview

The Live Monitor provides real-time visibility into running (and completed) test executions. It auto-refreshes every 1.5 seconds.

### 8.2 Layout

| Panel | Content |
|-------|---------|
| **Left sidebar** | List of recent execution runs (click to select) |
| **Header card** | Run ID, status, type, environment, progress %, elapsed time |
| **Progress bar** | Visual progress from 0-100% |
| **Stats row** | Total, Passed, Failed, Skipped counts + start time |
| **Steps table** | Per-step status (QUEUED → RUNNING → PASSED/FAILED) |
| **Log console** | Color-coded real-time log output |

### 8.3 Understanding Status Colors

| Status | Color | Meaning |
|--------|-------|---------|
| QUEUED | Gray | Waiting to execute |
| RUNNING | Yellow | Currently executing |
| PASSED | Green | Test passed all assertions |
| FAILED | Red | Test failed with error |
| SKIPPED | Cyan | Skipped (stop-on-failure triggered) |
| ABORTED | Gray | Manually stopped by user |

### 8.4 Understanding Log Levels

| Level | Color | Meaning |
|-------|-------|---------|
| INFO | Blue | General execution information |
| PASS | Green | Assertion passed |
| FAIL | Red | Assertion or step failed |
| WARN | Yellow | Non-fatal warning |
| DEBUG | Gray | Detailed debug information |

### 8.5 Stopping an Execution

During a RUNNING execution, click the **"⏹ Stop Execution"** button (top-right) to abort. The execution status changes to ABORTED.

### 8.6 Deep Linking

Each execution has a unique URL: `https://shipmozo-test-manager.onrender.com/monitor/{executionId}`

You can share this URL to let others view the same execution.

---

## 9. Reports

### 9.1 Overview

Reports provides a historical view of all test executions with filtering, drill-down, and failure analysis.

### 9.2 Summary KPIs

At the top of the page:
- **Total Runs**: Number of all executions
- **Passed**: Executions that passed 100%
- **Failed**: Executions with at least 1 failure
- **Pass Rate**: Overall pass percentage

### 9.3 Filtering

| Filter | Options |
|--------|---------|
| **Status** | All, PASSED, FAILED, RUNNING |
| **Type** | All, INDIVIDUAL, SUITE, WORKFLOW, MODULE |

Click the filter buttons to narrow results.

### 9.4 Viewing Execution Details

1. Click any execution row to **expand** it
2. You'll see:
   - **Summary stats**: Total, Passed, Failed, Skipped, Duration, Start time
   - **Test Results**: Per-step results with status badges

### 9.5 Viewing Failure Details

For **FAILED** steps:
1. Click the failed step row to expand it
2. You'll see:
   - **Error message**: The assertion or error that caused the failure
   - **Stack trace**: Code location of the failure
   - **Step logs**: Detailed log output for that specific step
   - **Screenshot**: (placeholder) Screenshot captured at point of failure

### 9.6 Navigating to Monitor

Click the **"👁 Monitor"** button on any execution row to jump to the Live Monitor view for that run.

### 9.7 Exporting

Click the **"📥 Export"** button to print/save the current view.

---

## 10. Analytics

### 10.1 Overview

Analytics provides historical trend analysis, module health metrics, and failure insights.

### 10.2 Time Range

Use the **7d / 14d / 30d** toggle buttons (top-right) to change the analysis period.

### 10.3 KPI Cards

| KPI | Description |
|-----|-------------|
| **Avg Pass Rate** | Average pass rate over the selected time period |
| **Total Executions** | Total number of runs (all time) |
| **Unique Testers** | Number of distinct users who triggered tests |
| **Top Failing** | The test case with the most failures |

### 10.4 Charts

| Chart | Type | What it shows |
|-------|------|---------------|
| **Pass Rate Trend** | Line chart | Daily pass rate and fail rate over time |
| **Module Health** | Horizontal bar | Pass rate percentage per module |
| **Pass vs Fail by Module** | Stacked bar | Absolute pass/fail counts per module |
| **Runs by Environment** | Donut/Pie | Distribution of runs across Local/QA/UAT/Production |

### 10.5 Top Failing Test Cases

A ranked table showing the most frequently failing test cases:

| Column | Description |
|--------|-------------|
| **#** | Rank (1 = worst) |
| **Test Case** | Name of the failing test |
| **Module** | Which module it belongs to |
| **Failures** | Total failure count |
| **Last Failed** | When it last failed |
| **Stability** | Visual indicator of instability |

Use this table to prioritize which tests need attention.

---

## 11. Roles & Permissions

### 11.1 How to Switch Roles

Click the **role dropdown** in the top bar → Select a role. The sidebar navigation updates immediately.

### 11.2 Permission Matrix

| Module | QA Engineer | QA Lead | Product Manager | Developer | Management |
|--------|:-----------:|:-------:|:---------------:|:---------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Test Repository | ✅ | ✅ | — | — | — |
| Test Data | ✅ | ✅ | — | — | — |
| Workflow Builder | ✅ | ✅ | — | — | — |
| Execution Center | ✅ | ✅ | ✅ | ✅ | — |
| Environments | ✅ | ✅ | — | — | — |
| Live Monitor | ✅ | ✅ | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ | — | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ |

### 11.3 Production Environment

Only the **QA Lead** role can edit the Production environment. All other roles see a locked overlay.

---

## 12. FAQ & Troubleshooting

### Q: My data disappeared after clearing browser cache. Is it gone?
**A:** No. All data is stored in Firebase Firestore (cloud). Clearing your browser cache does not affect cloud data. Just reload the page — data will sync from Firestore within 2-3 seconds.

### Q: Can I use the platform on multiple devices simultaneously?
**A:** Yes. Firebase Firestore provides real-time synchronization. If you create a test case on your laptop, it will appear on your phone's browser within seconds.

### Q: What happens if I close the browser during a running execution?
**A:** The execution will remain in "RUNNING" status in Firestore since the simulation engine runs client-side. You'll need to manually mark it as aborted or ignore it. In a future version with server-side execution, this will be handled automatically.

### Q: Can two people run executions at the same time?
**A:** Yes. Each execution creates a unique document in Firestore. Multiple users can trigger independent executions simultaneously.

### Q: I see "Connecting to Firestore…" for a long time. What's wrong?
**A:** Check your internet connection. Firestore requires an active internet connection. If the issue persists:
1. Check if `console.firebase.google.com` is accessible
2. Verify the Firestore database is in "test mode"
3. Try a different browser

### Q: How do I reset all data to the original seed data?
**A:** Currently, you would need to:
1. Go to Firebase Console → Firestore Database
2. Delete all collections
3. Refresh the AEP platform — the Seed Modal will appear again
4. Click "Seed Data to Firestore"

### Q: Can I import my real Playwright test cases?
**A:** Yes, you can manually create test cases in the Test Repository module with the script IDs matching your actual automation scripts. In v1.0, the execution engine simulates runs. In a future version, the platform will connect to real Playwright runners.

### Q: Is my data secure?
**A:** In v1.0 (test mode), Firestore rules are open. For production use, Firebase Security Rules should be configured to require authentication. The platform uses HTTPS for all data transmission.

### Q: How do I add a new environment (e.g., Staging)?
**A:** Currently, v1.0 comes with 4 pre-configured environments. Adding new environments requires modifying the seed data. This will be made configurable in a future version.

### Q: What does "Stop on Failure" mean in Workflows?
**A:** When enabled, if any step in the workflow fails, all subsequent steps are immediately marked as "SKIPPED" and the execution ends with a FAILED status. When disabled, all steps run regardless of individual failures.

---

## Support

For issues or feature requests, contact the Shipmozo Engineering team or open an issue on the GitHub repository:

**Repository**: https://github.com/ViditOG2006/SHIPMOZO-TEST-MANAGER
