import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import {
  User, Phone, MapPin, Home, Hash, ArrowRight, Package,
  Mail, Building, Globe, Flag
} from 'lucide-react';

interface ProfileSetupProps {
  userId: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onComplete: () => void;
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

const STEPS = [
  { id: 'name',    title: 'Your full name',    subtitle: 'Enter your legal name exactly as it appears on your ID.' },
  { id: 'contact', title: 'Contact details',   subtitle: 'How can we reach you about your rentals?' },
  { id: 'address', title: 'Your address',       subtitle: 'Required before an admin can verify your account.' },
];

export function ProfileSetup({
  userId, initialName, initialEmail, initialPhone, onComplete,
}: ProfileSetupProps) {
  const [step, setStep] = useState(0);

  // Parse initial display name into parts
  const nameParts = (initialName || '').trim().split(/\s+/);
  const [firstName,  setFirstName]  = useState(nameParts[0] || '');
  const [middleName, setMiddleName] = useState('');
  const [lastName,   setLastName]   = useState(nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  // Contact
  const [email, setEmail] = useState(initialEmail || '');
  const [phone, setPhone] = useState(initialPhone || '');

  // Address
  const [bldgNo,  setBldgNo]  = useState('');
  const [unitNo,  setUnitNo]  = useState('');
  const [street,  setStreet]  = useState('');
  const [brgy,    setBrgy]    = useState('');
  const [city,    setCity]    = useState('');
  const [region,  setRegion]  = useState('');
  const [zip,     setZip]     = useState('');
  const country = 'Philippines';

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const inputBase: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14,
    outline: 'none', color: '#111827', background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
  };
  const inputStyle: React.CSSProperties = { ...inputBase, padding: '11px 14px 11px 40px' };
  const inputNoIcon: React.CSSProperties = { ...inputBase, padding: '11px 14px' };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>
      {text}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
    </label>
  );

  const Ico = ({ Icon }: { Icon: any }) => (
    <Icon style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
  );

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!firstName.trim()) { setError('First name is required.'); return false; }
      if (!lastName.trim())  { setError('Last name is required.'); return false; }
    }
    if (step === 1) {
      if (!email.trim()) { setError('Email address is required.'); return false; }
      if (!phone.trim()) { setError('Phone number is required.'); return false; }
    }
    if (step === 2) {
      if (!street.trim()) { setError('Street / Subdivision is required.'); return false; }
      if (!brgy.trim())   { setError('Barangay is required.'); return false; }
      if (!city.trim())   { setError('City / Municipality is required.'); return false; }
      if (!region)        { setError('Region is required.'); return false; }
      if (!zip.trim())    { setError('Postal / ZIP code is required.'); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    const fullDisplayName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ');
    const fullStreet = [bldgNo.trim(), unitNo.trim(), street.trim()].filter(Boolean).join(', ');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullDisplayName });
      }
      await updateDoc(doc(db, 'users', userId), {
        displayName: fullDisplayName,
        firstName:   firstName.trim(),
        middleName:  middleName.trim(),
        lastName:    lastName.trim(),
        email:       email.trim(),
        phone:       phone.trim(),
        bldgNo:      bldgNo.trim(),
        unitNo:      unitNo.trim(),
        street:      fullStreet,
        brgy:        brgy.trim(),
        city:        city.trim(),
        region:      region.trim(),
        zip:         zip.trim(),
        country,
      });
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const displayPreview = [firstName, middleName, lastName].filter(Boolean).join(' ');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '26px 32px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '0.08em' }}>RENTCHECK</span>
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: '#fff', margin: '0 0 3px' }}>Complete your profile</h2>
          <p style={{ fontSize: 13, color: 'rgba(191,219,254,0.85)', margin: '0 0 18px' }}>Required before an admin can verify your account.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 10, transition: 'width 0.35s ease' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '26px 32px 30px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{STEPS[step].title}</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{STEPS[step].subtitle}</p>
          </div>

          {/* ── STEP 0: NAME ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label text="First Name" required />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={User} />
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                      placeholder="e.g. Juan" style={inputStyle} onFocus={focus} onBlur={blur} autoFocus />
                  </div>
                </div>
                <div>
                  <Label text="Middle Name" />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={User} />
                    <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleNext()}
                      placeholder="Optional" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>
              <div>
                <Label text="Last Name" required />
                <div style={{ position: 'relative' }}>
                  <Ico Icon={User} />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. dela Cruz" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>
              {displayPreview && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 9, padding: '9px 14px', fontSize: 13 }}>
                  <span style={{ color: '#93c5fd', fontWeight: 500 }}>Display name: </span>
                  <strong style={{ color: '#1d4ed8' }}>{displayPreview}</strong>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: CONTACT ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label text="Email Address" required />
                <div style={{ position: 'relative' }}>
                  <Ico Icon={Mail} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="you@email.com" style={{
                      ...inputStyle,
                      background: initialEmail ? '#f9fafb' : '#fff',
                      color: initialEmail ? '#6b7280' : '#111827',
                      cursor: initialEmail ? 'not-allowed' : 'text',
                    }}
                    readOnly={!!initialEmail}
                    onFocus={initialEmail ? undefined : focus}
                    onBlur={initialEmail ? undefined : blur}
                    autoFocus={!initialEmail}
                  />
                </div>
                {initialEmail && (
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0 2px' }}>Auto-filled from your sign-up email.</p>
                )}
              </div>
              <div>
                <Label text="Phone Number" required />
                <div style={{ position: 'relative' }}>
                  <Ico Icon={Phone} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="e.g. 09171234567" style={inputStyle}
                    onFocus={focus} onBlur={blur} autoFocus={!!initialEmail && !initialPhone} />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: ADDRESS ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Bldg + Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label text="Bldg No." />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={Building} />
                    <input type="text" value={bldgNo} onChange={e => setBldgNo(e.target.value)}
                      placeholder="e.g. 123" style={inputStyle} onFocus={focus} onBlur={blur} autoFocus />
                  </div>
                </div>
                <div>
                  <Label text="Unit / Floor / Lot No." />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={Building} />
                    <input type="text" value={unitNo} onChange={e => setUnitNo(e.target.value)}
                      placeholder="e.g. Unit 4B" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>

              {/* Street */}
              <div>
                <Label text="Street / Subdivision" required />
                <div style={{ position: 'relative' }}>
                  <Ico Icon={Home} />
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)}
                    placeholder="e.g. 456 Rizal St., Green Village" style={inputStyle} onFocus={focus} onBlur={blur} />
                </div>
              </div>

              {/* Brgy + City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <Label text="Barangay" required />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={MapPin} />
                    <input type="text" value={brgy} onChange={e => setBrgy(e.target.value)}
                      placeholder="e.g. Brgy. San Jose" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                <div>
                  <Label text="City / Municipality" required />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={MapPin} />
                    <input type="text" value={city} onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Quezon City" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>

              {/* Region + ZIP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                <div>
                  <Label text="Region" required />
                  <div style={{ position: 'relative' }}>
                    <Flag style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none', zIndex: 1 }} />
                    <select value={region} onChange={e => setRegion(e.target.value)}
                      style={{ ...inputNoIcon, paddingLeft: 38, appearance: 'none', cursor: 'pointer' }}
                      onFocus={focus} onBlur={blur}>
                      <option value="">Select region...</option>
                      {PH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label text="Postal / ZIP" required />
                  <div style={{ position: 'relative' }}>
                    <Ico Icon={Hash} />
                    <input type="text" value={zip} onChange={e => setZip(e.target.value)}
                      placeholder="1100" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
              </div>

              {/* Country (locked) */}
              <div>
                <Label text="Country" />
                <div style={{ position: 'relative' }}>
                  <Globe style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input value={country} readOnly
                    style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280', cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError(''); }}
                style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Continue <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : <><ArrowRight style={{ width: 15, height: 15 }} /> Submit Profile</>}
              </button>
            )}
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i <= step ? '#2563eb' : '#e5e7eb', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}