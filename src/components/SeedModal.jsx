import { useState } from 'react';
import { seedFirestore } from '../firebase/seed';
import { useAppStore } from '../store';
import { Database, Zap, CheckCircle, Loader } from 'lucide-react';

export default function SeedModal({ onDone }) {
  const activeAppId = useAppStore(s => s.activeAppId);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSeed = async () => {
    setStatus('seeding');
    try {
      await seedFirestore((msg, pct) => {
        setMessage(msg);
        setProgress(pct);
      }, activeAppId);
      setStatus('done');
      setTimeout(onDone, 1500);
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Database size={20} color="var(--accent-blue)" />
              First-Run Setup
            </div>
            <div className="modal-sub">Load sample test data for your active application only</div>
          </div>
        </div>

        <div className="modal-body">
          {status === 'idle' && (
            <>
              <div className="alert alert-info">
                <Zap size={14} />
                <span>This application has no test data yet. Sample modules, cases, and workflows will be saved under your active App ID only — other users and apps will not see them.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '📦', label: '6 Modules', sub: 'Orders, Wallet, Tracking, Courier, International, Auth' },
                  { icon: '🧪', label: '35 Test Cases', sub: 'Across all modules' },
                  { icon: '🗄️', label: '6 Data Sets', sub: 'LoginData, OrderData, WalletData, etc.' },
                  { icon: '⛓️', label: '2 Workflows', sub: 'Full Order Journey, Wallet Recharge & Order' },
                  { icon: '🌐', label: '4 Environments', sub: 'Local, QA, UAT, Production' },
                  { icon: '📊', label: '15 Past Executions', sub: 'Historical run data for reports' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 8 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {status === 'seeding' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Loader size={40} color="var(--accent-blue)" className="spin" style={{ marginBottom: 16 }} />
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{message}</div>
              <div className="progress-bar" style={{ height: 8, marginBottom: 8 }}>
                <div className="progress-fill progress-blue" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{progress}% complete</div>
            </div>
          )}

          {status === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--success)', marginBottom: 6 }}>
                All data seeded to Firestore!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Launching platform…</div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                <span>Seed failed: {error}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Make sure Firestore is enabled in test mode in your Firebase Console.
              </div>
            </div>
          )}
        </div>

        {status === 'idle' && (
          <div className="modal-footer">
            <button className="btn btn-primary btn-lg" onClick={handleSeed} style={{ width: '100%' }}>
              <Database size={16} /> Seed Data to Firestore
            </button>
          </div>
        )}
        {status === 'error' && (
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handleSeed}>Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}
