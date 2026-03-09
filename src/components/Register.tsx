import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { Package, Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onBack?: () => void;
  onLoginClick?: () => void;
}

export function Register({ onBack, onLoginClick }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Save the display name to Firebase profile
      await updateProfile(userCredential.user, { displayName: name });
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger one.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged in App.tsx will handle the redirect
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%',
    boxSizing: 'border-box',
    paddingLeft: 40,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 12,
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#fff',
    color: '#111827',
    fontSize: 14,
    outline: 'none',
    ...extra,
  });

  const panelStyle: React.CSSProperties = {
    width: '50%',
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* Left Panel */}
      <div style={panelStyle} className="hidden md:flex">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 720, height: 720, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -100, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 24, height: 24, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: '0.1em' }}>RENTCHECK</div>
            <div style={{ fontSize: 11, color: 'rgba(191,219,254,0.9)', letterSpacing: '0.05em' }}>Item Rental &amp; Tracking</div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 38, fontWeight: 300, color: '#fff', lineHeight: 1.3, marginBottom: 16 }}>
            Join RENTCHECK<br />
            <span style={{ fontWeight: 700 }}>in minutes.</span>
          </h2>
          <p style={{ color: 'rgba(191,219,254,0.9)', fontSize: 17, lineHeight: 1.7, maxWidth: 340, marginBottom: 32 }}>
            Set up your account and start managing rentals, tracking returns, and organizing inventory today.
          </p>
          {[
            { icon: '🚀', text: 'Get started immediately after sign up' },
            { icon: '👥', text: 'Role-based team collaboration' },
            { icon: '📊', text: 'Full rental history & analytics' },
          ].map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ color: '#fff', fontSize: 14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ color: 'rgba(191,219,254,0.7)', fontSize: 13, position: 'relative', zIndex: 1 }}>
          &copy; 2026 RENTCHECK. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', overflowY: 'auto' }}>

        <div className="flex md:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: '#111827', letterSpacing: '0.1em' }}>RENTCHECK</span>
        </div>

        <div style={{ width: '100%', maxWidth: 420 }}>

          {onBack && (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, marginBottom: 32, padding: 0 }}>
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Back to site
            </button>
          )}

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Create your account</h1>
            <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>Join RENTCHECK and start tracking today</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  style={inputStyle()}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rentcheck.com"
                  required
                  style={inputStyle()}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Phone number <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={inputStyle()}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  style={inputStyle({ paddingRight: 44 })}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map((i) => {
                      const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
                        : password.length >= 10 && /[A-Z]/.test(password) ? 3
                        : password.length >= 8 ? 2 : 1;
                      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                      return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength - 1] : '#e5e7eb', transition: 'background 0.3s' }} />;
                    })}
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    {password.length < 8 ? 'Too short' : password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong password' : 'Add uppercase & numbers to strengthen'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9ca3af' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={inputStyle({ paddingRight: 44, borderColor: confirmPassword && confirmPassword !== password ? '#fca5a5' : undefined })}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#fca5a5' : '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showConfirm ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords don't match</p>
              )}
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a> and{' '}
              <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 24px', background: isLoading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" style={{ width: 16, height: 16 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 24px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#374151', cursor: isGoogleLoading ? 'not-allowed' : 'pointer', opacity: isGoogleLoading ? 0.7 : 1 }}>
            {isGoogleLoading ? (
              <svg className="animate-spin" style={{ width: 18, height: 18, color: '#6b7280' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', marginTop: 24 }}>
            Already have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onLoginClick?.(); }} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
          </p>

        </div>
      </div>
    </div>
  );
}