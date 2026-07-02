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
import {
  useRepoStore, useDataStore, useWorkflowStore,
  useEnvStore, useExecutionStore, useAppStore,
  useAppConfigStore, useTeamStore
} from './store';
import './index.css';

// Loading Spinner
function LoadingScreen() {
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
        Connecting to Firestore…
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        shipmozo-a2d3f.firebaseapp.com
      </div>
      <div style={{ width: 200 }}>
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-fill progress-blue" style={{ width: '60%', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, setLoading } = useAppStore();
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

    // After a brief moment, check if Firestore has data
    // If modules is empty after 3s, show seed modal
    const timer = setTimeout(() => {
      setLoading(false);
      const modules = useRepoStore.getState().modules;
      if (modules.length === 0) {
        setShowSeed(true);
      }
    }, 3000);

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

  if (loading) return <LoadingScreen />;

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

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppContent />
      </div>
    </BrowserRouter>
  );
}
