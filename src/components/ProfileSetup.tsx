import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { User, Phone, MapPin, Home, Hash, ArrowRight, Package } from 'lucide-react';

interface ProfileSetupProps {
  userId: string;
  initialName?: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 'name',    title: 'Your full name',    subtitle: 'How should we address you?' },
  { id: 'contact', title: 'Contact details',   subtitle: 'So we can reach you about your rentals.' },
  { id: 'address', title: 'Your address',       subtitle: 'Required before admin verification.' },
];

export function ProfileSetup({ userId, initialName, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [name, setName]     = useState(initialName || '');
  const [phone, setPhone]   = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity]     = useState('');
  const [zip, setZip]       = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px 13px 42px',
    border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 15,
    outline: 'none', color: '#111827', background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  const focus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
  };
  const blur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  const validateStep = () => {
    setError('');
    if (step === 0 && !name.trim()) { setError('Please enter your full name.'); return false; }
    if (step === 1 && !phone.trim()) { setError('Please enter your phone number.'); return false; }
    if (step === 2) {
      if (!street.trim()) { setError('Please enter your street address.'); return false; }
      if (!city.trim())   { setError('Please enter your city.'); return false; }
      if (!zip.trim())    { setError('Please enter your ZIP code.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) { setStep(s => s + 1); }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      // Update Firebase Auth display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      // Update Firestore user doc
      await updateDoc(doc(db, 'users', userId), {
        displayName: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
      });
      onComplete();
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '28px 32px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '0.08em' }}>RENTCHECK</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Complete your profile</h2>
          <p style={{ fontSize: 14, color: 'rgba(191,219,254,0.85)', margin: '0 0 20px' }}>
            Required before an admin can verify your account.
          </p>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 10, transition: 'width 0.35s ease' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', flexShrink: 0 }}>
              Step {step + 1} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Form body */}
        <div style={{ padding: '28px 32px 32px' }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{STEPS[step].title}</h3>
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{STEPS[step].subtitle}</p>
          </div>

          {/* Step 0 — Full Name */}
          {step === 0 && (
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="e.g. Juan dela Cruz"
                style={inputStyle}
                onFocus={focus} onBlur={blur}
                autoFocus
              />
            </div>
          )}

          {/* Step 1 — Contact */}
          {step === 1 && (
            <div style={{ position: 'relative' }}>
              <Phone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="e.g. 09171234567"
                style={inputStyle}
                onFocus={focus} onBlur={blur}
                autoFocus
              />
            </div>
          )}

          {/* Step 2 — Address */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <Home style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="Street address"
                  style={inputStyle}
                  onFocus={focus} onBlur={blur}
                  autoFocus
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    style={inputStyle}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Hash style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    placeholder="ZIP code"
                    style={inputStyle}
                    onFocus={focus} onBlur={blur}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError(''); }}
                style={{ flex: 1, padding: '13px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={handleNext}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Continue <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
                {saving ? 'Saving...' : <><ArrowRight style={{ width: 16, height: 16 }} /> Submit Profile</>}
              </button>
            )}
          </div>

          {/* Step dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, background: i <= step ? '#2563eb' : '#e5e7eb', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}