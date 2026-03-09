import { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  ArrowLeft, Search, CheckCircle, Clock, Users,
  User, Phone, MapPin, ShieldCheck, ShieldOff,
  ChevronRight, Crown, UserCog, Shield, X
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
  admin: { label: 'Admin',  bg: '#faf5ff', color: '#7c3aed', border: '#c4b5fd', Icon: Crown },
  staff: { label: 'Staff',  bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', Icon: UserCog },
  user:  { label: 'User',   bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb', Icon: User },
};

export function VerifyUsers({ onBack, currentUserRole }: VerifyUsersProps) {
  const isAdmin = currentUserRole === 'admin';
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('pending');
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
      // Clear selected panel if that user's doc was deleted from Firestore
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
    return matchesFilter && (
      !q ||
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const order = { admin: 0, staff: 1, user: 2 };
    return (order[a.role] ?? 2) - (order[b.role] ?? 2);
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'pending',  label: `Pending (${counts.pending})` },
    { key: 'verified', label: `Verified (${counts.verified})` },
    { key: 'staff',    label: `Staff (${counts.staff})` },
    { key: 'admin',    label: `Admin (${counts.admin})` },
    { key: 'all',      label: `All (${counts.all})` },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 32px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none',
    background: '#fff', color: '#111827',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>

      {/* ── LEFT PANEL ── */}
      <div style={{ width: 380, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>

        <div style={{ padding: '20px 16px 0' }}>
          {onBack && (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: 16, padding: 0 }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> Back to Dashboard
            </button>
          )}

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              style={inputStyle} />
          </div>

          {/* Filter tabs — scrollable */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)}
                style={{ flexShrink: 0, padding: '6px 10px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', background: filter === t.key ? '#2563eb' : '#f3f4f6', color: filter === t.key ? '#fff' : '#6b7280' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* User list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 40 }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 40 }}>No users found.</p>
          ) : filtered.map(u => {
            const roleCfg = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.user;
            const isSelected = selected?.uid === u.uid;
            const isPending = u.role === 'user' && !u.verified;

            return (
              <button key={u.uid} onClick={() => setSelected(u)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px', border: 'none', borderRadius: 10, cursor: 'pointer', marginBottom: 3, textAlign: 'left', background: isSelected ? '#eff6ff' : 'transparent', outline: isSelected ? '2px solid #bfdbfe' : 'none' }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>

                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {u.profilePic
                    ? <img src={u.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User style={{ width: 17, height: 17, color: '#94a3b8' }} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                      {u.displayName || 'No name'}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}`, flexShrink: 0 }}>
                      {roleCfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                  {u.role === 'user' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 10, fontWeight: 600, color: u.verified ? '#059669' : '#d97706', background: u.verified ? '#ecfdf5' : '#fffbeb', padding: '2px 7px', borderRadius: 8 }}>
                      {u.verified ? <CheckCircle style={{ width: 10, height: 10 }} /> : <Clock style={{ width: 10, height: 10 }} />}
                      {u.verified ? 'Verified' : 'Pending'}
                    </div>
                  )}
                </div>
                <ChevronRight style={{ width: 13, height: 13, color: '#cbd5e1', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
            <Users style={{ width: 52, height: 52, marginBottom: 14, opacity: 0.25 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Select a user to manage</p>
            <p style={{ fontSize: 13, margin: 0 }}>View details, verify accounts, or promote to staff.</p>
          </div>
        ) : (() => {
          const roleCfg = ROLE_CONFIG[selected.role] ?? ROLE_CONFIG.user;
          const RoleIcon = roleCfg.Icon;

          return (
            <div style={{ maxWidth: 620 }}>

              {/* User header card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected.profilePic
                      ? <img src={selected.profilePic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User style={{ width: 30, height: 30, color: '#94a3b8' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                        {selected.displayName || 'No name set'}
                      </h2>
                      {/* Role badge */}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.border}` }}>
                        <RoleIcon style={{ width: 12, height: 12 }} />
                        {roleCfg.label}
                      </span>
                      {/* Verification badge — only for regular users */}
                      {selected.role === 'user' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: selected.verified ? '#ecfdf5' : '#fff7ed', color: selected.verified ? '#065f46' : '#9a3412', border: `1px solid ${selected.verified ? '#6ee7b7' : '#fdba74'}` }}>
                          {selected.verified ? <CheckCircle style={{ width: 12, height: 12 }} /> : <Clock style={{ width: 12, height: 12 }} />}
                          {selected.verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}>{selected.email}</p>
                    {selected.createdAt && (
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                        Joined {new Date(selected.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <Phone style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</span>
                  </div>
                  <InfoRow label="Email" value={selected.email} />
                  <InfoRow label="Phone" value={selected.phone || '—'} />
                </div>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <MapPin style={{ width: 14, height: 14, color: '#2563eb' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</span>
                  </div>
                  <InfoRow label="Street" value={selected.street || '—'} />
                  <InfoRow label="City" value={selected.city || '—'} />
                  <InfoRow label="ZIP" value={selected.zip || '—'} />
                </div>
              </div>

              {/* ── ACTION SECTION ── */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Shield style={{ width: 15, height: 15, color: '#2563eb' }} /> Account Management
                </h3>

                {/* REGULAR USER — show verify / revoke / promote */}
                {selected.role === 'user' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Verify or Revoke — available to both admin and staff */}
                    {!selected.verified ? (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', margin: '0 0 2px' }}>Pending Verification</p>
                          <p style={{ fontSize: 12, color: '#b45309', margin: 0 }}>This user cannot access the catalog until verified.</p>
                        </div>
                        <button onClick={() => handleVerify(selected.uid, true)} disabled={updating}
                          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: updating ? '#6ee7b7' : '#10b981', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: updating ? 'not-allowed' : 'pointer' }}>
                          <ShieldCheck style={{ width: 15, height: 15 }} />
                          {updating ? 'Verifying...' : 'Verify Now'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CheckCircle style={{ width: 20, height: 20, color: '#10b981', flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#065f46', margin: '0 0 2px' }}>Account Verified</p>
                            <p style={{ fontSize: 12, color: '#059669', margin: 0 }}>This user has full access to the catalog.</p>
                          </div>
                        </div>
                        {!revokeConfirm ? (
                          <button onClick={() => setRevokeConfirm(true)}
                            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            <ShieldOff style={{ width: 13, height: 13 }} /> Revoke
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => setRevokeConfirm(false)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                            <button onClick={() => handleVerify(selected.uid, false)} disabled={updating}
                              style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Confirm Revoke
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Promote to Staff — admin only */}
                    {isAdmin && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <UserCog style={{ width: 14, height: 14, color: '#2563eb' }} /> Promote to Staff
                            </p>
                            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                              {selected.verified ? 'Grant this user staff privileges and catalog management access.' : 'User must be verified before promoting.'}
                            </p>
                          </div>
                          {!promoteConfirm ? (
                            <button onClick={() => selected.verified && setPromoteConfirm(true)} disabled={!selected.verified}
                              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: selected.verified ? '#2563eb' : '#e5e7eb', color: selected.verified ? '#fff' : '#9ca3af', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: selected.verified ? 'pointer' : 'not-allowed' }}>
                              <UserCog style={{ width: 14, height: 14 }} /> Promote
                            </button>
                          ) : (
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button onClick={() => setPromoteConfirm(false)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                              <button onClick={() => handlePromoteToStaff(selected.uid)} disabled={updating}
                                style={{ padding: '8px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                                Confirm Promote
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STAFF — admin can demote, staff sees read-only status */}
                {selected.role === 'staff' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <UserCog style={{ width: 20, height: 20, color: '#2563eb', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', margin: '0 0 2px' }}>Staff Member</p>
                        <p style={{ fontSize: 12, color: '#3b82f6', margin: 0 }}>This user has catalog management and approval privileges.</p>
                      </div>
                    </div>
                    {isAdmin ? (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', margin: '0 0 2px' }}>Demote to User</p>
                          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Remove staff privileges. Account will remain verified.</p>
                        </div>
                        {!demoteConfirm ? (
                          <button onClick={() => setDemoteConfirm(true)}
                            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#fff', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <X style={{ width: 13, height: 13 }} /> Demote
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button onClick={() => setDemoteConfirm(false)} style={{ padding: '8px 12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                            <button onClick={() => handleDemoteToUser(selected.uid)} disabled={updating}
                              style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Confirm Demote
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Shield style={{ width: 16, height: 16, color: '#94a3b8', flexShrink: 0 }} />
                        <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Role changes can only be made by an Admin.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ADMIN — read only */}
                {selected.role === 'admin' && (
                  <div style={{ background: '#faf5ff', border: '1px solid #c4b5fd', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Crown style={{ width: 22, height: 22, color: '#7c3aed', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#6d28d9', margin: '0 0 3px' }}>Administrator</p>
                      <p style={{ fontSize: 12, color: '#8b5cf6', margin: 0 }}>Admin roles can only be changed directly in the Firebase Console.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}