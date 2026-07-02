import { useState } from 'react';
import { useTeamStore, useAppStore } from '../store';
import { Plus, Trash2, Mail, Shield, User, Calendar, Check } from 'lucide-react';

export default function TeamManager() {
  const { members, addMember, updateMember, deleteMember } = useTeamStore();
  const currentRole = useAppStore(s => s.role);
  const setRole = useAppStore(s => s.setRole);
  const rolesList = useAppStore(s => s.roles);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'QA Engineer',
  });

  const allMembers = [
    {
      id: 'MEM-001',
      name: 'Vidit OG',
      email: 'lead@example.com',
      role: 'QA Lead',
      joinedAt: '2026-06-15T08:30:00Z',
    },
    ...members.filter(m => m.id !== 'MEM-001')
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    await addMember(form);
    setShowAddModal(false);
    setForm({
      name: '',
      email: '',
      role: 'QA Engineer',
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      {/* Role Swapper Widget at the top right to simulate testing different roles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Team & Collaborators</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Manage test platform permissions, roles, and collaborative QA access.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Simulate Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '4px 8px', fontSize: 12, border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--accent-blue)' }}
            >
              {rolesList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Member
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {allMembers.map(member => (
          <div key={member.id}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 15
                  }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{member.name}</h3>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{member.id}</div>
                  </div>
                </div>
                {member.id !== 'MEM-001' && (
                  <button
                    className="btn btn-icon"
                    onClick={() => deleteMember(member.id)}
                    style={{ color: 'var(--accent-red)', padding: 6, opacity: 0.7 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <Mail size={13} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{member.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <Shield size={13} color="var(--text-muted)" />
                  <span style={{ fontWeight: 600, color: member.role === 'QA Lead' || member.role === 'Admin' ? 'var(--accent-purple)' : 'var(--text-primary)' }}>
                    {member.role}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-muted)' }}>
                    Joined: {new Date(member.joinedAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title">Add Team Member</div>
              <div className="modal-sub">Grant collaborative access to test logs and configurations.</div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@yourdomain.com"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Access Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                    className="form-input"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
