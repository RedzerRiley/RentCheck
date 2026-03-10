import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { Package, Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBack?: () => void;
  onRegisterClick?: () => void;
}

export function Login({ onBack, onRegisterClick }: LoginProps) {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const field = (focused: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px 11px 40px',
    background: '#fff',
    border: `1.5px solid ${focused ? '#2563eb' : '#e5e7eb'}`,
    borderRadius: 10, fontSize: 14, color: '#111827', outline: 'none',
    boxShadow: focused ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden md:flex" style={{
        width: '46%', flexDirection: 'column', justifyContent: 'space-between',
        background: '#0f172a', padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 42, height: 42, background: '#2563eb', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#f8fafc', letterSpacing: '0.08em' }}>RENTCHECK</div>
            <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.04em' }}>Item Rental & Tracking</div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#93c5fd', fontWeight: 600 }}>Welcome back</span>
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Manage your rentals<br />
            <span style={{ color: '#60a5fa' }}>with confidence.</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, maxWidth: 320, marginBottom: 36 }}>
            Track items, monitor returns, and keep your inventory perfectly organized.
          </p>
          {[
            { label: 'Real-time item tracking' },
            { label: 'Role-based access control' },
            { label: '98% on-time return rate' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
              </div>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#1e3a5f', position: 'relative', zIndex: 1 }}>© 2026 RENTCHECK</div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>

        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ alignItems: 'center', gap: 10, marginBottom: 36 }}>
          <div style={{ width: 38, height: 38, background: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#111827', letterSpacing: '0.08em' }}>RENTCHECK</span>
        </div>

        <div style={{ width: '100%', maxWidth: 400 }}>
          {onBack && (
            <button onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, marginBottom: 28, padding: 0 }}>
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to site
            </button>
          )}

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.3px' }}>Sign in</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px' }}>Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={field(false)}
                  onFocus={e => { Object.assign(e.target.style, { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' }); }}
                  onBlur={e => { Object.assign(e.target.style, { borderColor: '#e5e7eb', boxShadow: 'none' }); }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...field(false), paddingRight: 44 }}
                  onFocus={e => { Object.assign(e.target.style, { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.12)' }); }}
                  onBlur={e => { Object.assign(e.target.style, { borderColor: '#e5e7eb', boxShadow: 'none' }); }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: isLoading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.01em' }}>
              {isLoading ? (
                <><svg className="animate-spin" style={{ width: 16, height: 16 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Signing in...</>
              ) : (
                <>Sign In <ArrowRight style={{ width: 15, height: 15 }} /></>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          <button type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '11px 24px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: isGoogleLoading ? 'not-allowed' : 'pointer', opacity: isGoogleLoading ? 0.7 : 1 }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f9fafb'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}>
            {isGoogleLoading
              ? <svg className="animate-spin" style={{ width: 18, height: 18, color: '#6b7280' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
              : <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            }
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', marginTop: 24 }}>
            Don't have an account?{' '}
            <a href="#" onClick={e => { e.preventDefault(); onRegisterClick?.(); }} style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}