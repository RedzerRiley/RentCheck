import { useState, useEffect, useRef } from 'react';
import {
  User, MapPin, Lock, LogOut,
  ArrowLeft, CheckCircle, Save,
  Eye, EyeOff, AlertCircle, Camera,
  Phone, Mail, Building, Hash, Globe, Flag, Home
} from 'lucide-react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth } from '../firebase/firebase';

type UserRole = 'user' | 'staff' | 'admin';

interface UserProfileProps {
  userName: string;
  userEmail: string;
  userId: string;
  role?: UserRole;
  onLogout?: () => void;
  onBack?: () => void;
}

const PH_REGIONS = [
  'NCR – National Capital Region',
  'CAR – Cordillera Administrative Region',
  'Region I – Ilocos Region',
  'Region II – Cagayan Valley',
  'Region III – Central Luzon',
  'Region IV-A – CALABARZON',
  'Region IV-B – MIMAROPA',
  'Region V – Bicol Region',
  'Region VI – Western Visayas',
  'Region VII – Central Visayas',
  'Region VIII – Eastern Visayas',
  'Region IX – Zamboanga Peninsula',
  'Region X – Northern Mindanao',
  'Region XI – Davao Region',
  'Region XII – SOCCSKSARGEN',
  'Region XIII – Caraga',
  'BARMM – Bangsamoro',
];

export function UserProfile({ userName, userEmail, userId, role = 'user', onLogout, onBack }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    firstName:  '',
    middleName: '',
    lastName:   '',
    email:      userEmail || '',
    phone:      '',
    bldgNo:     '',
    unitNo:     '',
    street:     '',
    brgy:       '',
    city:       '',
    region:     '',
    zip:        '',
  });

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setIsVerified(d.verified ?? false);
        if (d.profilePic) setProfilePic(d.profilePic);

        // Support old schema (displayName only) and new schema (firstName/lastName)
        const oldName = d.displayName || userName || '';
        const parts   = oldName.trim().split(/\s+/);

        setFormData({
          firstName:  d.firstName  || parts[0] || '',
          middleName: d.middleName || '',
          lastName:   d.lastName   || (parts.length > 1 ? parts.slice(1).join(' ') : ''),
          email:      d.email      || userEmail || '',
          phone:      d.phone      || '',
          bldgNo:     d.bldgNo     || '',
          unitNo:     d.unitNo     || '',
          street:     d.street     || '',
          brgy:       d.brgy       || '',
          city:       d.city       || '',
          region:     d.region     || '',
          zip:        d.zip        || '',
        });
      }
    });
    return () => unsub();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) { alert('Please choose an image under 800KB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfilePic(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    const fullDisplayName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');
    const fullStreet = [formData.bldgNo, formData.unitNo, formData.street].filter(Boolean).join(', ');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullDisplayName });
      }
      await updateDoc(doc(db, 'users', userId), {
        displayName: fullDisplayName,
        firstName:   formData.firstName,
        middleName:  formData.middleName,
        lastName:    formData.lastName,
        phone:       formData.phone,
        bldgNo:      formData.bldgNo,
        unitNo:      formData.unitNo,
        street:      fullStreet,
        brgy:        formData.brgy,
        city:        formData.city,
        region:      formData.region,
        zip:         formData.zip,
        country:     'Philippines',
        ...(profilePic ? { profilePic } : {}),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPwError(''); setPwSuccess(false);
    if (!passwords.new || !passwords.current) { setPwError('Please fill in all fields.'); return; }
    if (passwords.new !== passwords.confirm)   { setPwError('New passwords do not match.'); return; }
    if (passwords.new.length < 8)              { setPwError('Password must be at least 8 characters.'); return; }
    setPwSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('No user');
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, passwords.current));
      await updatePassword(user, passwords.new);
      setPwSuccess(true);
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') setPwError('Current password is incorrect.');
      else if (code === 'auth/too-many-requests') setPwError('Too many attempts. Try again later.');
      else setPwError('Failed to update password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
    color: '#111827', background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.15s',
  };
  const inp  = (extra?: React.CSSProperties): React.CSSProperties => ({ ...inputBase, padding: '11px 14px',           marginTop: 6, ...extra });
  const inpI = (extra?: React.CSSProperties): React.CSSProperties => ({ ...inputBase, padding: '11px 14px 11px 36px', marginTop: 6, ...extra });

  const fo = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.12)';
  };
  const bl = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow   = 'none';
  };

  const Lbl = ({ text, required }: { text: string; required?: boolean }) => (
    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.04em', display: 'block' }}>
      {text}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </label>
  );

  const Ico = ({ Icon }: { Icon: any }) => (
    <Icon style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
  );

  const roleBadge: Record<UserRole, { label: string; bg: string; color: string; border: string }> = {
    admin: { label: 'Admin', bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
    staff: { label: 'Staff', bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
    user:  { label: 'User',  bg: '#f0fdf4', color: '#166534', border: '#4ade80' },
  };
  const badge = roleBadge[role];
  const displayName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ') || userName;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'sans-serif' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 280, background: '#fff', borderRight: '1px solid #e5e7eb', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: 32, padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>RC</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>RENTCHECK</span>
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {profilePic
                    ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User style={{ width: 22, height: 22, color: '#94a3b8' }} />}
                </div>
                <button onClick={() => profilePicRef.current?.click()}
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                  <Camera style={{ width: 10, height: 10 }} />
                </button>
                <input type="file" ref={profilePicRef} onChange={handleProfilePicChange} style={{ display: 'none' }} accept="image/*" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formData.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {badge.label}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isVerified ? '#ecfdf5' : '#fff7ed', border: `1px solid ${isVerified ? '#10b981' : '#f97316'}`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: isVerified ? '#065f46' : '#9a3412' }}>
                {isVerified ? '✓ Verified' : '⏳ Unverified'}
              </span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: 'none', background: 'transparent', color: '#6b7280', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px', fontWeight: 500, fontSize: 14 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f9fafb'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <ArrowLeft style={{ width: 18, height: 18 }} /> Back to Dashboard
            </button>
          )}
          <div style={{ height: 1, background: '#f3f4f6', marginBottom: 12 }} />
          {[
            { id: 'details',  label: 'Account Details', icon: User },
            { id: 'password', label: 'Change Password',  icon: Lock },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: 'none', background: activeTab === item.id ? '#eff6ff' : 'transparent', color: activeTab === item.id ? '#2563eb' : '#4b5563', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', fontWeight: activeTab === item.id ? 600 : 500, fontSize: 14 }}>
              <item.icon style={{ width: 18, height: 18 }} />
              {item.label}
            </button>
          ))}
          <button onClick={onLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: 'none', background: 'transparent', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px', fontWeight: 500, fontSize: 14 }}>
            <LogOut style={{ width: 18, height: 18 }} /> Logout
          </button>
        </nav>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: '3rem', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
            {activeTab === 'details' ? 'My Profile' : 'Security Settings'}
          </h1>
          <p style={{ color: '#6b7280', marginTop: 8 }}>
            {activeTab === 'details' ? `Welcome back, ${displayName}` : 'Update your password below.'}
          </p>
        </div>

        {activeTab === 'details' ? (
          <div style={{ display: 'grid', gap: 24 }}>

            {/* ── Personal Information ── */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <User style={{ color: '#2563eb', width: 20, flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Personal Information</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>

                {/* Name row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <Lbl text="First Name" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={User} />
                      <input name="firstName" value={formData.firstName} onChange={handleChange}
                        style={inpI()} placeholder="e.g. Juan" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                  <div>
                    <Lbl text="Middle Name" />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={User} />
                      <input name="middleName" value={formData.middleName} onChange={handleChange}
                        style={inpI()} placeholder="Optional" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                  <div>
                    <Lbl text="Last Name" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={User} />
                      <input name="lastName" value={formData.lastName} onChange={handleChange}
                        style={inpI()} placeholder="e.g. dela Cruz" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                </div>

                {/* Display name preview */}
                {(formData.firstName || formData.lastName) && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                    <span style={{ color: '#93c5fd', fontWeight: 500 }}>Display name: </span>
                    <strong style={{ color: '#1d4ed8' }}>
                      {[formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ')}
                    </strong>
                  </div>
                )}

                {/* Email + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Lbl text="Email Address" />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={Mail} />
                      <input value={formData.email} readOnly
                        style={inpI({ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' })} />
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0 2px' }}>Cannot be changed here.</p>
                  </div>
                  <div>
                    <Lbl text="Phone Number" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={Phone} />
                      <input name="phone" value={formData.phone} onChange={handleChange}
                        style={inpI()} placeholder="+63 000 000 0000" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Address ── */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <MapPin style={{ color: '#2563eb', width: 20, flexShrink: 0 }} />
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Current Address</h2>
              </div>
              <div style={{ display: 'grid', gap: 16 }}>

                {/* Bldg + Unit */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Lbl text="Bldg No." />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={Building} />
                      <input name="bldgNo" value={formData.bldgNo} onChange={handleChange}
                        style={inpI()} placeholder="e.g. 123" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                  <div>
                    <Lbl text="Unit / Floor / Lot No." />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={Building} />
                      <input name="unitNo" value={formData.unitNo} onChange={handleChange}
                        style={inpI()} placeholder="e.g. Unit 4B" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                </div>

                {/* Street */}
                <div>
                  <Lbl text="Street / Subdivision" required />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={Home} />
                    <input name="street" value={formData.street} onChange={handleChange}
                      style={inpI()} placeholder="e.g. 456 Rizal St., Green Village" onFocus={fo} onBlur={bl} />
                  </div>
                </div>

                {/* Brgy + City */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <Lbl text="Barangay" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={MapPin} />
                      <input name="brgy" value={formData.brgy} onChange={handleChange}
                        style={inpI()} placeholder="e.g. Brgy. San Jose" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                  <div>
                    <Lbl text="City / Municipality" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={MapPin} />
                      <input name="city" value={formData.city} onChange={handleChange}
                        style={inpI()} placeholder="e.g. Quezon City" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                </div>

                {/* Region + ZIP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 16 }}>
                  <div>
                    <Lbl text="Region" required />
                    <div style={{ position: 'relative' }}>
                      <Flag style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }} />
                      <select name="region" value={formData.region} onChange={handleChange}
                        style={{ ...inp({ paddingLeft: 34, appearance: 'none' as any, cursor: 'pointer', width: '100%' }) }}
                        onFocus={fo} onBlur={bl}>
                        <option value="">Select region...</option>
                        {PH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Lbl text="Postal / ZIP Code" required />
                    <div style={{ position: 'relative' }}>
                      <Ico Icon={Hash} />
                      <input name="zip" value={formData.zip} onChange={handleChange}
                        style={inpI()} placeholder="1100" onFocus={fo} onBlur={bl} />
                    </div>
                  </div>
                </div>

                {/* Country (locked) */}
                <div>
                  <Lbl text="Country" />
                  <div style={{ position: 'relative' }}>
                    <Globe style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
                    <input value="Philippines" readOnly
                      style={inpI({ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {saveError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#dc2626' }}>{saveError}</span>
              </div>
            )}
            {saveSuccess && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Profile saved successfully!</span>
              </div>
            )}

            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '14px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}>
              {saving ? 'Saving...' : <><Save style={{ width: 16, height: 16 }} /> Save Profile</>}
            </button>
          </div>

        ) : (
          /* ── Password tab ── */
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Lock style={{ color: '#2563eb', width: 20 }} />
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Change Password</h2>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Only works for email/password accounts, not Google sign-in.</p>
            <div style={{ display: 'grid', gap: 20 }}>
              {(['current', 'new', 'confirm'] as const).map((field) => {
                const labels = { current: 'Current Password', new: 'New Password', confirm: 'Confirm New Password' };
                return (
                  <div key={field}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{labels[field]}</label>
                    <div style={{ position: 'relative', marginTop: 6 }}>
                      <input
                        type={showPw[field] ? 'text' : 'password'}
                        value={passwords[field]}
                        onChange={e => setPasswords(prev => ({ ...prev, [field]: e.target.value }))}
                        style={{ ...inp({ paddingRight: 44 }) }}
                        placeholder="••••••••"
                        onFocus={fo} onBlur={bl}
                      />
                      <button type="button" onClick={() => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))}
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                        {showPw[field] ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                      </button>
                    </div>
                  </div>
                );
              })}
              {pwError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <AlertCircle style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#dc2626' }}>{pwError}</span>
                </div>
              )}
              {pwSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 8 }}>
                  <CheckCircle style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Password updated successfully!</span>
                </div>
              )}
              <button onClick={handlePasswordUpdate} disabled={pwSaving}
                style={{ background: pwSaving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '13px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: pwSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {pwSaving ? 'Updating...' : <><Lock style={{ width: 16, height: 16 }} /> Update Password</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}