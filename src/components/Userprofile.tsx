import { useState, useRef } from 'react';
import {
  User, MapPin, Hash, Upload, X, Shield, CheckCircle,
  Clock, ChevronRight, Phone, Mail, FileText, AlertCircle
} from 'lucide-react';

interface UserProfileProps {
  onBack?: () => void;
  userEmail?: string;
}

export function UserProfile({ onBack, userEmail = 'user@rentcheck.com' }: UserProfileProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const ID_TYPES = ["Driver's License", "Passport", "National ID", "SSS ID", "PhilHealth ID", "Voter's ID"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFile(file);
    const reader = new FileReader();
    reader.onload = () => setIdPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!phone.trim()) { setError('Phone number is required.'); return; }
    if (!address.trim()) { setError('Address is required.'); return; }
    if (!city.trim()) { setError('City is required.'); return; }
    if (!zipCode.trim()) { setError('Zip code is required.'); return; }
    if (!idType) { setError('Please select an ID type.'); return; }
    if (!idNumber.trim()) { setError('ID number is required.'); return; }
    if (!idFile) { setError('Please upload a photo of your valid ID.'); return; }

    setIsSubmitting(true);

    // TODO: Replace with real API call:
    // const formData = new FormData();
    // formData.append('fullName', fullName);
    // formData.append('phone', phone);
    // formData.append('address', address);
    // formData.append('city', city);
    // formData.append('zipCode', zipCode);
    // formData.append('idType', idType);
    // formData.append('idNumber', idNumber);
    // formData.append('idFile', idFile);
    // const res = await fetch('http://localhost:3000/api/users/verify', {
    //   method: 'POST',
    //   body: formData,
    // });
    // if (!res.ok) { setError('Submission failed. Please try again.'); setIsSubmitting(false); return; }

    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setShowConfirmation(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 14px',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#374151',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: 6,
  };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: 20,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 14,
    borderBottom: '1px solid #f3f4f6',
  };

  // ── Confirmation popup ──────────────────────────────────────────────────────
  if (showConfirmation) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse-ring { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        `}</style>
        <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>

          {/* Pending icon */}
          <div style={{ width: 80, height: 80, background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', position: 'relative' }}>
            <Clock style={{ width: 36, height: 36, color: '#2563eb' }} />
            <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#2563eb', animation: 'spin 1.5s linear infinite' }} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Verification Submitted!
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 24 }}>
            Your information and ID have been submitted. Please wait while an admin reviews and approves your verification request.
          </p>

          {/* Summary */}
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse-ring 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Pending Admin Review</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Name', value: fullName },
                { label: 'ID Type', value: idType },
                { label: 'ID Number', value: `••••${idNumber.slice(-4)}` },
                { label: 'Address', value: `${city}, ${zipCode}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#9ca3af' }}>{label}</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', marginBottom: 28, textAlign: 'left' }}>
            <AlertCircle style={{ width: 14, height: 14, color: '#d97706', marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
              Verification typically takes <strong>1–3 business days</strong>. You'll be notified once your account is approved and you can start renting items.
            </p>
          </div>

          <button
            onClick={onBack}
            style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.05em' }}>RC</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '0.08em' }}>RENTCHECK</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 20, padding: '4px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Unverified</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 24 }}>
            <AlertCircle style={{ width: 18, height: 18, color: '#d97706', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#92400e' }}>Account verification required</div>
              <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>
                You must verify your identity before you can rent items. Please fill out all required fields below.
              </div>
            </div>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Complete Your Profile</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            Logged in as <span style={{ color: '#2563eb', fontWeight: 500 }}>{userEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── Personal Information ── */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User style={{ width: 16, height: 16, color: '#2563eb' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Personal Information</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Your basic contact details</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    required
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 912 345 6789"
                    required
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={userEmail}
                    readOnly
                    style={{ ...inputStyle, paddingLeft: 36, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Address ── */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin style={{ width: 16, height: 16, color: '#2563eb' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Address</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Your current residential address</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Street Address <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <MapPin style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Rizal Street, Barangay San Juan"
                    required
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>City / Municipality <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Quezon City"
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Zip Code <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Hash style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="1100"
                    required
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Valid ID ── */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: 32, height: 32, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield style={{ width: 16, height: 16, color: '#2563eb' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Valid Government ID</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Required for identity verification</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>ID Type <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select ID type...</option>
                  {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>ID Number <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <FileText style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="Enter ID number"
                    required
                    style={{ ...inputStyle, paddingLeft: 36 }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            {/* Upload */}
            <div>
              <label style={labelStyle}>Upload ID Photo <span style={{ color: '#ef4444' }}>*</span></label>
              {idPreview ? (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <img src={idPreview} alt="ID preview" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontSize: 12, fontWeight: 500 }}>{idFile?.name}</div>
                  <button type="button" onClick={() => { setIdFile(null); setIdPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <X style={{ width: 14, height: 14 }} />
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ position: 'absolute', bottom: 10, right: 10, padding: '5px 10px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
                    Change
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', height: 140, background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9ca3af', boxSizing: 'border-box' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#93c5fd')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}
                >
                  <Upload style={{ width: 22, height: 22 }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Click to upload your ID</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>PNG, JPG up to 10MB · Front side only</div>
                  </div>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            {/* Privacy note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 12px', marginTop: 14 }}>
              <CheckCircle style={{ width: 14, height: 14, color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#166534', margin: 0, lineHeight: 1.6 }}>
                Your ID is encrypted and securely stored. It is only used for identity verification and will never be shared with third parties.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#dc2626', flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Submit footer */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Ready to verify?</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                Fields marked <span style={{ color: '#ef4444' }}>*</span> are required
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 28px',
                background: isSubmitting ? '#93c5fd' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {isSubmitting ? (
                <>
                  <svg style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Shield style={{ width: 15, height: 15 }} />
                  Verify
                  <ChevronRight style={{ width: 15, height: 15 }} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}