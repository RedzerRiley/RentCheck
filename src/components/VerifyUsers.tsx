import { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  ArrowLeft, Search, CheckCircle, Clock, Users,
  User, ShieldCheck, ShieldOff, Crown, UserCog, Shield, X, Phone, MapPin, Mail
} from 'lucide-react';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  verified: boolean;
  role: 'user' | 'staff' | 'admin';
  createdAt?: string;
  profilePic?: string;
}

type FilterTab = 'all' | 'pending' | 'verified' | 'staff' | 'admin';

interface VerifyUsersProps {
  onBack?: () => void;
  currentUserRole?: 'admin' | 'staff' | 'user';
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', bg: '#faf5ff', color: '#7c3aed', border: '#c4b5fd', Icon: Crown },
  staff: { label: 'Staff', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', Icon: UserCog },
  user:  { label: 'User',  bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', Icon: User },
};

export function VerifyUsers({ onBack, currentUserRole }: VerifyUsersProps) {
  const isAdmin = currentUserRole === 'admin';
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selected, setSelected] = useState<UserData | null>(null);
  const [updating, setUpdating] = useState(false);
  const [promoteConfirm, setPromoteConfirm] = useState(false);
  const [demoteConfirm, setDemoteConfirm] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserData));
      setUsers(data);
      setLoading(false);
      setSelected(prev => {
        if (!prev) return null;
        if (!data.some(u => u.uid === prev.uid)) return null;
        return data.find(u => u.uid === prev.uid) ?? null;
      });
    });
    return () => unsub();
  }, []);

  const closeModal = () => {
    setSelected(null);
    setPromoteConfirm(false);
    setDemoteConfirm(false);
    setRevokeConfirm(false);
  };

  const handleVerify = async (uid: string, verified: boolean) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { verified }); }
    finally { setUpdating(false); setRevokeConfirm(false); }
  };

  const handlePromoteToStaff = async (uid: string) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { role: 'staff', verified: true }); }
    finally { setUpdating(false); setPromoteConfirm(false); }
  };

  const handleDemoteToUser = async (uid: string) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { role: 'user' }); }
    finally { setUpdating(false); setDemoteConfirm(false); }
  };

  const counts = {
    all:      users.length,
    pending:  users.filter(u => u.role === 'user' && !u.verified).length,
    verified: users.filter(u => u.role === 'user' && u.verified).length,
    staff:    users.filter(u => u.role === 'staff').length,
    admin:    users.filter(u => u.role === 'admin').length,
  };

  const filtered = users.filter(u => {
    const matchesFilter =
      filter === 'all'      ? true :
      filter === 'pending'  ? (u.role === 'user' && !u.verified) :
      filter === 'verified' ? (u.role === 'user' && u.verified) :
      filter === 'staff'    ? u.role === 'staff' :
      filter === 'admin'    ? u.role === 'admin' : true;
    const q = search.toLowerCase();
    return matchesFilter && (!q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }).sort((a, b) => ({ admin: 0, staff: 1, user: 2 }[a.role] ?? 2) - ({ admin: 0, staff: 1, user: 2 }[b.role] ?? 2));

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',      label: `All (${counts.all})` },
    { key: 'pending',  label: `Pending (${counts.pending})` },
    { key: 'verified', label: `Verified (${counts.verified})` },
    { key: 'staff',    label: `Staff (${counts.staff})` },
    { key: 'admin',    label: `Admin (${counts.admin})` },
  ];

  const statCards = [
    { label: 'Total Users',  value: counts.all,      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Users       style={{ width: 20, height: 20, color: '#2563eb' }} /> },
    { label: 'Pending',      value: counts.pending,  color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <Clock       style={{ width: 20, height: 20, color: '#d97706' }} /> },
    { label: 'Verified',     value: counts.verified, color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', icon: <CheckCircle style={{ width: 20, height: 20, color: '#059669' }} /> },
    { label: 'Staff',        value: counts.staff,    color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', icon: <UserCog     style={{ width: 20, height: 20, color: '#7c3aed' }} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
        {onBack && (
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '7px 14px', borderRadius: 8 }}>
            <ArrowLeft style={{ width: 15, height: 15 }} /> Back
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 18, height: 18, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Users Dashboard</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{counts.all} total · {counts.pending} pending</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABLE CARD ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 340 }}>
              <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  style={{ padding: '7px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: filter === t.key ? '#2563eb' : '#f1f5f9', color: filter === t.key ? '#fff' : '#64748b' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Users style={{ width: 40, height: 40, color: '#cbd5e1', margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 14, color: '#94a3b8' }}>No users found</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['User', 'Email', 'Phone', 'Role', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const roleCfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.user;
                  const RoleIcon = roleCfg.Icon;
                  return (
                    <tr key={u.uid} onClick={() => { setSelected(u); setPromoteConfirm(false); setDemoteConfirm(false); setRevokeConfirm(false); }}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {u.profilePic ? <img src={u.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User style={{ width: 16, height: 16, color: '#94a3b8' }} />}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.displayName || '—'}</div>
                            {u.createdAt && <div style={{ fontSize: 11, color: '#94a3b8' }}>Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#475569' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#64748b' }}>{u.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}>
                          <RoleIcon style={{ width: 11, height: 11 }} />{roleCfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {u.role === 'user' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: u.verified ? '#ecfdf5' : '#fffbeb', color: u.verified ? '#059669' : '#d97706', border: `1px solid ${u.verified ? '#6ee7b7' : '#fde68a'}` }}>
                            {u.verified ? <CheckCircle style={{ width: 11, height: 11 }} /> : <Clock style={{ width: 11, height: 11 }} />}
                            {u.verified ? 'Verified' : 'Pending'}
                          </span>
                        ) : <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div onClick={closeModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)', zIndex: 100 }} />

          {/* Modal panel */}
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 480, background: '#fff', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', zIndex: 101, overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '24px 24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)' }}>
                    {selected.profilePic ? <img src={selected.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User style={{ width: 26, height: 26, color: 'rgba(255,255,255,0.8)' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selected.displayName || 'No name'}</div>
                    {selected.createdAt && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        Joined {new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                    {/* Role + status badges */}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {(() => { const rc = ROLE_CONFIG[selected.role]; const RI = rc.Icon; return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                          <RI style={{ width: 11, height: 11 }} />{rc.label}
                        </span>
                      ); })()}
                      {selected.role === 'user' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: selected.verified ? 'rgba(16,185,129,0.25)' : 'rgba(251,191,36,0.25)', color: '#fff', border: `1px solid ${selected.verified ? 'rgba(16,185,129,0.5)' : 'rgba(251,191,36,0.5)'}` }}>
                          {selected.verified ? <CheckCircle style={{ width: 11, height: 11 }} /> : <Clock style={{ width: 11, height: 11 }} />}
                          {selected.verified ? 'Verified' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={closeModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 16, height: 16, color: '#fff' }} />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px' }}>

              {/* Contact info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Mail style={{ width: 14, height: 14, color: '#64748b', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Email</div>
                    <div style={{ fontSize: 12, color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>{selected.email}</div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Phone style={{ width: 14, height: 14, color: '#64748b', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Phone</div>
                    <div style={{ fontSize: 12, color: selected.phone ? '#1e293b' : '#cbd5e1', fontWeight: 500 }}>{selected.phone || 'Not provided'}</div>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, gridColumn: '1 / -1' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#64748b', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Address</div>
                    <div style={{ fontSize: 12, color: (selected.street || selected.city) ? '#1e293b' : '#cbd5e1', fontWeight: 500 }}>
                      {[selected.street, selected.city, selected.zip].filter(Boolean).join(', ') || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ACTIONS ── */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Account Actions</div>

                {/* Regular user */}
                {selected.role === 'user' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {!selected.verified ? (
                      <button onClick={() => handleVerify(selected.uid, true)} disabled={updating}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: updating ? '#6ee7b7' : '#10b981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer', width: '100%' }}>
                        <ShieldCheck style={{ width: 16, height: 16 }} />
                        {updating ? 'Verifying...' : 'Verify Account'}
                      </button>
                    ) : !revokeConfirm ? (
                      <button onClick={() => setRevokeConfirm(true)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                        <ShieldOff style={{ width: 16, height: 16 }} /> Revoke Verification
                      </button>
                    ) : (
                      <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 10 }}>Remove this user's access?</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setRevokeConfirm(false)} style={{ flex: 1, padding: '9px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancel</button>
                          <button onClick={() => handleVerify(selected.uid, false)} disabled={updating} style={{ flex: 1, padding: '9px', background: '#dc2626', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm Revoke</button>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      !promoteConfirm ? (
                        <button onClick={() => selected.verified && setPromoteConfirm(true)} disabled={!selected.verified}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: selected.verified ? '#eff6ff' : '#f1f5f9', color: selected.verified ? '#2563eb' : '#94a3b8', border: `1px solid ${selected.verified ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: selected.verified ? 'pointer' : 'not-allowed', width: '100%' }}>
                          <UserCog style={{ width: 16, height: 16 }} />
                          {selected.verified ? 'Promote to Staff' : 'Verify account first to promote'}
                        </button>
                      ) : (
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 10 }}>Grant staff privileges to {selected.displayName}?</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setPromoteConfirm(false)} style={{ flex: 1, padding: '9px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancel</button>
                            <button onClick={() => handlePromoteToStaff(selected.uid)} disabled={updating} style={{ flex: 1, padding: '9px', background: '#2563eb', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm Promote</button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Staff */}
                {selected.role === 'staff' && (
                  isAdmin ? (
                    !demoteConfirm ? (
                      <button onClick={() => setDemoteConfirm(true)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                        <X style={{ width: 16, height: 16 }} /> Demote to User
                      </button>
                    ) : (
                      <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 10 }}>Remove staff privileges from {selected.displayName}?</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => setDemoteConfirm(false)} style={{ flex: 1, padding: '9px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#374151', fontWeight: 500 }}>Cancel</button>
                          <button onClick={() => handleDemoteToUser(selected.uid)} disabled={updating} style={{ flex: 1, padding: '9px', background: '#dc2626', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm Demote</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <Shield style={{ width: 16, height: 16, color: '#94a3b8' }} />
                      <span style={{ fontSize: 13, color: '#64748b' }}>Only admins can change staff roles.</span>
                    </div>
                  )
                )}

                {/* Admin */}
                {selected.role === 'admin' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#faf5ff', borderRadius: 10, border: '1px solid #c4b5fd' }}>
                    <Crown style={{ width: 16, height: 16, color: '#7c3aed' }} />
                    <span style={{ fontSize: 13, color: '#7c3aed', fontWeight: 600 }}>Admin roles can only be changed in the Firebase Console.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}