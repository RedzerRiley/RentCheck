import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { Package, Eye, EyeOff, Lock, Mail, ArrowRight, User, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBack?: () => void;
  onLoginClick?: () => void;
}

export function Register({ onBack, onLoginClick }: RegisterProps) {
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [phoneLocal, setPhoneLocal]     = useState(''); // stores the digits after +63
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]               = useState('');

  // Philippine mobile: 10 digits starting with 9 (e.g. 9171234567)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneLocal(digits);
  };

  const phoneValid = phoneLocal.length === 10 && phoneLocal.startsWith('9');
  const fullPhone  = phoneLocal ? `+63${phoneLocal}` : '';

  const passwordStrength = (() => {
    if (!password) return 0;
    if (password.length < 8) return 1;
    const has = (r: RegExp) => r.test(password);
    if (password.length >= 12 && has(/[A-Z]/) && has(/[0-9]/) && has(/[^A-Za-z0-9]/)) return 4;
    if (password.length >= 10 && has(/[A-Z]/)) return 3;
    return 2;
  })();
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const strengthLabels = ['', 'Too short', 'Fair', 'Good', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return; }
    if (phoneLocal && !phoneValid)    { setError('Enter a valid Philippine mobile number (10 digits starting with 9).'); return; }

    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use')  setError('An account with this email already exists.');
      else if (code === 'auth/invalid-email')    setError('Please enter a valid email address.');
      else if (code === 'auth/weak-password')    setError('Password is too weak. Please choose a stronger one.');
      else                                        setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') setError('Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const focusStyle = { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' };
  const blurStyle  = { borderColor: '#e5e7eb', boxShadow: 'none' };

  const baseInput: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px 11px 40px',
    background: '#fff', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex" style={{
        width: '42%', flexDirection: 'column', justifyContent: 'space-between',
        background: '#0f172a', padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 42, height: 42, background: '#2563eb', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', letterSpacing: '0.08em' }}>RENTCHECK</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Item Rental & Tracking</div>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>Create your account</span>
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Join RENTCHECK<br />
            <span style={{ color: '#60a5fa' }}>in minutes.</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, maxWidth: 300, marginBottom: 36 }}>
            Set up your account and start managing rentals, tracking returns, and organizing inventory.
          </p>
          {[
            'Get verified to start using RentCheck',
            'Role-based team collaboration',
            'Full rental history & item tracking',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
              </div>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#1e3a5f', position: 'relative', zIndex: 1 }}>© 2026 RENTCHECK</div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', overflowY: 'auto' }}>

        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 38, height: 38, background: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '0.08em' }}>RENTCHECK</span>
        </div>

        <div style={{ width: '100%', maxWidth: 440 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 24, padding: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to site
            </button>
          )}

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.3px' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>Join RENTCHECK and start tracking today</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Name + Email side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Full name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith" required style={baseInput}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, blurStyle)}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required style={baseInput}
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, blurStyle)}
                  />
                </div>
              </div>
            </div>

            {/* Phone — +63 locked prefix */}
            <div>
              <label style={labelStyle}>
                Phone number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ display: 'flex', border: '1.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onFocusCapture={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#2563eb'; el.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
                onBlurCapture={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = phoneLocal && !phoneValid ? '#fca5a5' : '#e5e7eb'; el.style.boxShadow = 'none'; }}
              >
                {/* Locked prefix */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: '#f1f5f9', borderRight: '1px solid #e5e7eb', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>🇵🇭 +63</span>
                </div>
                {/* Local number input */}
                <input
                  type="tel"
                  value={phoneLocal}
                  onChange={handlePhoneChange}
                  placeholder="9171234567"
                  maxLength={10}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 14px', fontSize: 14, color: '#111827', background: 'transparent', minWidth: 0 }}
                />
                {/* Character counter */}
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: phoneValid ? '#10b981' : '#9ca3af', fontWeight: 600 }}>
                    {phoneLocal.length}/10
                  </span>
                </div>
              </div>
              {phoneLocal && !phoneValid && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                  Must be 10 digits starting with 9 (e.g. 9171234567)
                </p>
              )}
              {phoneValid && (
                <p style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>✓ Saved as {fullPhone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" required
                  style={{ ...baseInput, paddingRight: 44 }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= passwordStrength ? strengthColors[passwordStrength] : '#e5e7eb', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strengthColors[passwordStrength] || '#9ca3af', marginTop: 4, fontWeight: 600 }}>
                    {strengthLabels[passwordStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...baseInput, paddingRight: 44, borderColor: confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb' }}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                  {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords don't match</p>
              )}
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>

            <button type="submit" disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: isLoading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
              {isLoading
                ? <><svg className="animate-spin" style={{ width: 16, height: 16 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Creating account...</>
                : <>Create Account <ArrowRight style={{ width: 15, height: 15 }} /></>
              }
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <button type="button" onClick={handleGoogleSignUp} disabled={isGoogleLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 24px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: isGoogleLoading ? 'not-allowed' : 'pointer', opacity: isGoogleLoading ? 0.7 : 1 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
            {isGoogleLoading
              ? <svg className="animate-spin" style={{ width: 18, height: 18, color: '#6b7280' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            }
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 20 }}>
            Already have an account?{' '}
            <a href="#" onClick={e => { e.preventDefault(); onLoginClick?.(); }} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}