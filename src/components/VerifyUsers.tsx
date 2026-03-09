import { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  ArrowLeft, Search, CheckCircle, Clock, Users,
  User, ShieldCheck, ShieldOff, Crown, UserCog, Shield, X, ChevronDown
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
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserData));
      setUsers(data);
      setLoading(false);
      setSelected(prev => {
        if (!prev) return null;
        const stillExists = data.some(u => u.uid === prev.uid);
        if (!stillExists) return null;
        return data.find(u => u.uid === prev.uid) ?? null;
      });
    });
    return () => unsub();
  }, []);

  const handleVerify = async (uid: string, verified: boolean) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { verified }); }
    finally { setUpdating(false); setRevokeConfirm(false); setActionMenuOpen(null); }
  };

  const handlePromoteToStaff = async (uid: string) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { role: 'staff', verified: true }); }
    finally { setUpdating(false); setPromoteConfirm(false); setActionMenuOpen(null); }
  };

  const handleDemoteToUser = async (uid: string) => {
    setUpdating(true);
    try { await updateDoc(doc(db, 'users', uid), { role: 'user' }); }
    finally { setUpdating(false); setDemoteConfirm(false); setActionMenuOpen(null); }
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
  }).sort((a, b) => {
    const order = { admin: 0, staff: 1, user: 2 };
    return (order[a.role] ?? 2) - (order[b.role] ?? 2);
  });

  const statCards = [
    { label: 'Total Users',  value: counts.all,      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Users    style={{ width: 20, height: 20, color: '#2563eb' }} /> },
    { label: 'Pending',      value: counts.pending,  color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <Clock    style={{ width: 20, height: 20, color: '#d97706' }} /> },
    { label: 'Verified',     value: counts.verified, color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', icon: <CheckCircle style={{ width: 20, height: 20, color: '#059669' }} /> },
    { label: 'Staff',        value: counts.staff,    color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', icon: <UserCog  style={{ width: 20, height: 20, color: '#7c3aed' }} /> },
  ];

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all',      label: `All (${counts.all})` },
    { key: 'pending',  label: `Pending (${counts.pending})` },
    { key: 'verified', label: `Verified (${counts.verified})` },
    { key: 'staff',    label: `Staff (${counts.staff})` },
    { key: 'admin',    label: `Admin (${counts.admin})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>

      {/* ── TOP HEADER BAR ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{counts.all} total members · {counts.pending} awaiting approval</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── STAT CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: '#fff', border: `1px solid ${s.border}`, borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN TABLE CARD ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: 220, maxWidth: 340 }}>
              <Search style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#94a3b8' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 34px', border: '1px solid #e2e8f0', borderRadius: 9, fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {tabs.map(t => (
                <button key={t.key} onClick={() => setFilter(t.key)}
                  style={{ padding: '7px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: filter === t.key ? '#2563eb' : '#f1f5f9', color: filter === t.key ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
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
                  {['User', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const roleCfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.user;
                  const RoleIcon = roleCfg.Icon;
                  const isOpen = actionMenuOpen === u.uid;

                  return (
                    <tr key={u.uid}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none', background: selected?.uid === u.uid ? '#f0f7ff' : 'transparent', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (selected?.uid !== u.uid) (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
                      onMouseLeave={e => { if (selected?.uid !== u.uid) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {/* User */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {u.profilePic
                              ? <img src={u.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <User style={{ width: 16, height: 16, color: '#94a3b8' }} />}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{u.displayName || '—'}</div>
                            {u.createdAt && <div style={{ fontSize: 11, color: '#94a3b8' }}>Joined {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 13, color: '#475569' }}>{u.email}</span>
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>{u.phone || <span style={{ color: '#cbd5e1' }}>—</span>}</span>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}>
                          <RoleIcon style={{ width: 11, height: 11 }} />
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        {u.role === 'user' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: u.verified ? '#ecfdf5' : '#fffbeb', color: u.verified ? '#059669' : '#d97706', border: `1px solid ${u.verified ? '#6ee7b7' : '#fde68a'}` }}>
                            {u.verified ? <CheckCircle style={{ width: 11, height: 11 }} /> : <Clock style={{ width: 11, height: 11 }} />}
                            {u.verified ? 'Verified' : 'Pending'}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>
                        )}
                      </td>

                      {/* Actions dropdown */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <button
                            onClick={() => {
                              setSelected(u);
                              setActionMenuOpen(isOpen ? null : u.uid);
                              setPromoteConfirm(false);
                              setDemoteConfirm(false);
                              setRevokeConfirm(false);
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                            Actions <ChevronDown style={{ width: 12, height: 12, transition: 'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
                          </button>

                          {isOpen && (
                            <>
                              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setActionMenuOpen(null)} />
                              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)', minWidth: 230, zIndex: 50, overflow: 'hidden' }}>

                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{u.displayName || 'User'}</div>
                                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.email}</div>
                                </div>

                                {/* Regular user */}
                                {u.role === 'user' && (
                                  <>
                                    {!u.verified ? (
                                      <button onClick={() => handleVerify(u.uid, true)} disabled={updating}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#059669', fontWeight: 600 }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0fdf4'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                        <ShieldCheck style={{ width: 15, height: 15 }} />
                                        {updating ? 'Verifying...' : 'Verify Account'}
                                      </button>
                                    ) : !revokeConfirm ? (
                                      <button onClick={() => setRevokeConfirm(true)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', fontWeight: 600 }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                        <ShieldOff style={{ width: 15, height: 15 }} /> Revoke Verification
                                      </button>
                                    ) : (
                                      <div style={{ padding: '10px 16px', background: '#fff5f5' }}>
                                        <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8, fontWeight: 600 }}>Confirm revoke access?</div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                          <button onClick={() => setRevokeConfirm(false)} style={{ flex: 1, padding: '6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                                          <button onClick={() => handleVerify(u.uid, false)} disabled={updating} style={{ flex: 1, padding: '6px', background: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm</button>
                                        </div>
                                      </div>
                                    )}

                                    {isAdmin && (
                                      <>
                                        <div style={{ height: 1, background: '#f1f5f9' }} />
                                        {!promoteConfirm ? (
                                          <button onClick={() => u.verified && setPromoteConfirm(true)} disabled={!u.verified}
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: u.verified ? 'pointer' : 'not-allowed', fontSize: 13, color: u.verified ? '#2563eb' : '#94a3b8', fontWeight: 600 }}
                                            onMouseEnter={e => { if (u.verified) (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                            <UserCog style={{ width: 15, height: 15 }} />
                                            {u.verified ? 'Promote to Staff' : 'Verify first to promote'}
                                          </button>
                                        ) : (
                                          <div style={{ padding: '10px 16px', background: '#eff6ff' }}>
                                            <div style={{ fontSize: 12, color: '#1e40af', marginBottom: 8, fontWeight: 600 }}>Promote to staff?</div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                              <button onClick={() => setPromoteConfirm(false)} style={{ flex: 1, padding: '6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                                              <button onClick={() => handlePromoteToStaff(u.uid)} disabled={updating} style={{ flex: 1, padding: '6px', background: '#2563eb', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm</button>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}

                                {/* Staff */}
                                {u.role === 'staff' && (
                                  isAdmin ? (
                                    !demoteConfirm ? (
                                      <button onClick={() => setDemoteConfirm(true)}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#dc2626', fontWeight: 600 }}
                                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                                        <X style={{ width: 15, height: 15 }} /> Demote to User
                                      </button>
                                    ) : (
                                      <div style={{ padding: '10px 16px', background: '#fff5f5' }}>
                                        <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8, fontWeight: 600 }}>Remove staff privileges?</div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                          <button onClick={() => setDemoteConfirm(false)} style={{ flex: 1, padding: '6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                                          <button onClick={() => handleDemoteToUser(u.uid)} disabled={updating} style={{ flex: 1, padding: '6px', background: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: '#fff', fontWeight: 600 }}>Confirm</button>
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <Shield style={{ width: 14, height: 14, color: '#94a3b8' }} />
                                      <span style={{ fontSize: 12, color: '#94a3b8' }}>Only admins can change roles</span>
                                    </div>
                                  )
                                )}

                                {/* Admin */}
                                {u.role === 'admin' && (
                                  <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Crown style={{ width: 14, height: 14, color: '#7c3aed' }} />
                                    <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>Administrator account</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}