import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SeedModal from './components/SeedModal';
import Dashboard from './pages/Dashboard';
import TestRepository from './pages/TestRepository';
import TestDataManager from './pages/TestDataManager';
import WorkflowBuilder from './pages/WorkflowBuilder';
import ExecutionCenter from './pages/ExecutionCenter';
import EnvironmentManager from './pages/EnvironmentManager';
import MonitoringView from './pages/MonitoringView';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import ApplicationManager from './pages/ApplicationManager';
import TeamManager from './pages/TeamManager';
import AuthPage from './pages/AuthPage';
import {
  useRepoStore, useDataStore, useWorkflowStore,
  useEnvStore, useExecutionStore, useAppStore,
  useAppConfigStore, useTeamStore
} from './store';
import './index.css';

// ─── Tiny auth-resolving spinner (shown < 1s while Firebase SDK initialises) ───
function AuthSpinner() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 14, zIndex: 9999,
    }}>
      <div style={{
        width: 48, height: 48,
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26,
        boxShadow: '0 0 28px rgba(59,130,246,0.35)',
        animation: 'spin 2s linear infinite',
      }}>⚡</div>
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-muted)' }}>
        Checking session…
      </div>
    </div>
  );
}

// ─── Data loading spinner (shown briefly while Firestore hydrates) ──────────
function DataLoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, zIndex: 9999,
    }}>
      <div style={{
        width: 52, height: 52,
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        borderRadius: 14, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 28,
        boxShadow: '0 0 32px rgba(59,130,246,0.4)',
        animation: 'spin 2s linear infinite',
      }}>⚡</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
        Loading workspace…
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Syncing test data from Firestore
      </div>
      <div style={{ width: 200 }}>
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-fill progress-blue" style={{ width: '60%', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2: Data Shell (only mounts AFTER authentication) ─────────────────
function DataShell() {
  const [dataReady, setDataReady] = useState(false);
  const [showSeed, setShowSeed] = useState(false);

  const repoStore = useRepoStore();
  const dataStore = useDataStore();
  const workflowStore = useWorkflowStore();
  const envStore = useEnvStore();
  const execStore = useExecutionStore();
  const appConfigStore = useAppConfigStore();
  const teamStore = useTeamStore();

  useEffect(() => {
    // Subscribe all collections to Firestore real-time listeners
    repoStore.subscribe();
    dataStore.subscribe();
    workflowStore.subscribe();
    envStore.subscribe();
    execStore.subscribe();
    appConfigStore.subscribe();
    teamStore.subscribe();

    // Give Firestore a moment to hydrate, then check for seed data
    const timer = setTimeout(() => {
      setDataReady(true);
      const modules = useRepoStore.getState().modules;
      if (modules.length === 0) {
        setShowSeed(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      repoStore.unsubscribe();
      dataStore.unsubscribe();
      workflowStore.unsubscribe();
      envStore.unsubscribe();
      execStore.unsubscribe();
      appConfigStore.unsubscribe();
      teamStore.unsubscribe();
    };
  }, []);

  if (!dataReady) return <DataLoadingScreen />;

  return (
    <>
      {showSeed && (
        <SeedModal onDone={() => setShowSeed(false)} />
      )}
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/repository" element={<TestRepository />} />
            <Route path="/test-data" element={<TestDataManager />} />
            <Route path="/workflows" element={<WorkflowBuilder />} />
            <Route path="/execute" element={<ExecutionCenter />} />
            <Route path="/environments" element={<EnvironmentManager />} />
            <Route path="/monitor" element={<MonitoringView />} />
            <Route path="/monitor/:id" element={<MonitoringView />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/applications" element={<ApplicationManager />} />
            <Route path="/team" element={<TeamManager />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

// ─── Phase 1: Auth Gate (resolves in < 1 second) ───────────────────────────
function AppContent() {
  const { isAuthenticated, initAuth } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // initAuth sets up onAuthStateChanged which fires almost immediately
    initAuth();
    // Safety net: if Firebase SDK is slow, stop blocking after 800ms
    const fallback = setTimeout(() => setAuthChecked(true), 800);
    const unsub = useAppStore.subscribe((state) => {
      // As soon as loading flips to false, auth state is resolved
      if (!state.loading) {
        setAuthChecked(true);
        clearTimeout(fallback);
      }
    });
    return () => { unsub(); clearTimeout(fallback); };
  }, []);

  // Phase 1a: Still resolving auth state (< 1s)
  if (!authChecked) return <AuthSpinner />;

  // Phase 1b: Not authenticated → show login page instantly
  if (!isAuthenticated) return <AuthPage />;

  // Phase 1c: Authenticated → mount the data shell
  return <DataShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}

