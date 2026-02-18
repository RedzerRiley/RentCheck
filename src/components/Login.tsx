import { useState } from 'react';
import { Package, Eye, EyeOff, Lock, Mail, ArrowRight, Shield, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin?: (credentials: { email: string; password: string }) => void;
  onBack?: () => void;
}

export function Login({ onLogin, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Static credentials for local environment testing
  // TODO: Replace with a real API call when your backend is ready:
  // const res = await fetch('http://localhost:3000/api/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (res.ok) { onLogin?.({ email, password }); }
  const STATIC_CREDENTIALS = {
    email: 'admin@rentcheck.com',
    password: 'rentcheck2026',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === STATIC_CREDENTIALS.email && password === STATIC_CREDENTIALS.password) {
      onLogin?.({ email, password });
    } else {
      setError('Invalid email or password. Use admin@rentcheck.com / rentcheck2026');
    }

    setIsLoading(false);
  };

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
        {/* Decorative rings */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:500, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:720, height:720, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, right:-100, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          <div style={{ width:44, height:44, background:'rgba(255,255,255,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Package style={{ width:24, height:24, color:'#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:20, color:'#fff', letterSpacing:'0.1em' }}>RENTCHECK</div>
            <div style={{ fontSize:11, color:'rgba(191,219,254,0.9)', letterSpacing:'0.05em' }}>Item Rental &amp; Tracking</div>
          </div>
        </div>

        {/* Headline + features */}
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:38, fontWeight:300, color:'#fff', lineHeight:1.3, marginBottom:16 }}>
            Manage your rentals<br />
            <span style={{ fontWeight:700 }}>with confidence.</span>
          </h2>
          <p style={{ color:'rgba(191,219,254,0.9)', fontSize:17, lineHeight:1.7, maxWidth:340, marginBottom:32 }}>
            Track items, monitor returns, and keep your inventory perfectly organized — all in one place.
          </p>
          {[
            { icon:'📦', text:'500+ items tracked in real time' },
            { icon:'✅', text:'98% on-time return rate' },
            { icon:'🔒', text:'Secure, role-based access control' },
          ].map((f) => (
            <div key={f.text} style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 16px', marginBottom:10 }}>
              <span style={{ fontSize:18 }}>{f.icon}</span>
              <span style={{ color:'#fff', fontSize:14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ color:'rgba(191,219,254,0.7)', fontSize:13, position:'relative', zIndex:1 }}>
          &copy; 2026 RENTCHECK. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex:1, background:'#f9fafb', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem 1.5rem' }}>

        {/* Mobile logo */}
        <div className="flex md:hidden" style={{ alignItems:'center', gap:10, marginBottom:40 }}>
          <div style={{ width:40, height:40, background:'#2563eb', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Package style={{ width:22, height:22, color:'#fff' }} />
          </div>
          <span style={{ fontWeight:700, fontSize:20, color:'#111827', letterSpacing:'0.1em' }}>RENTCHECK</span>
        </div>

        <div style={{ width:'100%', maxWidth:420 }}>

          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:14, marginBottom:32, padding:0 }}
            >
              <ArrowLeft style={{ width:16, height:16 }} />
              Back to site
            </button>
          )}

          {/* Heading */}
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontSize:30, fontWeight:700, color:'#111827', marginBottom:6 }}>Welcome back</h1>
            <p style={{ color:'#6b7280', fontSize:15, margin:0 }}>Sign in to your RENTCHECK account</p>
          </div>

          {/* Dev hint */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'12px 14px', marginBottom:24 }}>
            <Shield style={{ width:16, height:16, color:'#3b82f6', marginTop:2, flexShrink:0 }} />
            <p style={{ fontSize:12, color:'#1d4ed8', lineHeight:1.6, margin:0 }}>
              <strong>Local dev mode:</strong> Use{' '}
              <code style={{ background:'#dbeafe', padding:'1px 5px', borderRadius:4 }}>admin@rentcheck.com</code>
              {' '}/ {' '}
              <code style={{ background:'#dbeafe', padding:'1px 5px', borderRadius:4 }}>rentcheck2026</code>.
              Replace <code style={{ background:'#dbeafe', padding:'1px 5px', borderRadius:4 }}>STATIC_CREDENTIALS</code> with your API call when ready.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:14, fontWeight:500, color:'#374151', marginBottom:6 }}>
                Email address
              </label>
              <div style={{ position:'relative' }}>
                <Mail style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@rentcheck.com"
                  required
                  style={{ width:'100%', boxSizing:'border-box', paddingLeft:40, paddingRight:14, paddingTop:12, paddingBottom:12, border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', color:'#111827', fontSize:14, outline:'none' }}
                  onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <label style={{ fontSize:14, fontWeight:500, color:'#374151' }}>Password</label>
                <a href="#" style={{ fontSize:12, color:'#2563eb', textDecoration:'none' }}>Forgot password?</a>
              </div>
              <div style={{ position:'relative' }}>
                <Lock style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#9ca3af' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width:'100%', boxSizing:'border-box', paddingLeft:40, paddingRight:44, paddingTop:12, paddingBottom:12, border:'1px solid #e5e7eb', borderRadius:8, background:'#fff', color:'#111827', fontSize:14, outline:'none' }}
                  onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor='#e5e7eb'; e.target.style.boxShadow='none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0, display:'flex', alignItems:'center' }}
                >
                  {showPassword ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width:16, height:16, accentColor:'#2563eb', cursor:'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize:14, color:'#4b5563', cursor:'pointer' }}>
                Keep me signed in
              </label>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                <p style={{ fontSize:13, color:'#dc2626', margin:0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px 24px', background: isLoading ? '#93c5fd' : '#2563eb', color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" style={{ width:16, height:16 }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity:0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity:0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ width:16, height:16 }} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
            <span style={{ fontSize:12, color:'#9ca3af' }}>or</span>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
          </div>

          {/* Google SSO */}
          <button
            type="button"
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px 24px', background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, fontWeight:500, color:'#374151', cursor:'pointer' }}
          >
            <svg style={{ width:18, height:18 }} viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p style={{ textAlign:'center', fontSize:14, color:'#6b7280', marginTop:24 }}>
            Don't have an account?{' '}
            <a href="#" style={{ color:'#2563eb', fontWeight:600, textDecoration:'none' }}>Request access</a>
          </p>

        </div>
      </div>
    </div>
  );
}