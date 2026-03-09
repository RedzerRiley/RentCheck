import { useState, useEffect } from 'react';
import { Package, ArrowRight, CheckCircle, BarChart3, Shield, Clock, Star, ChevronDown } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onRegister: () => void;
}

export function LandingPage({ onSignIn, onRegister }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-Time Tracking',
      desc: "Monitor every item in your inventory live — who has it, when it's due back, and what's available.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Access Control',
      desc: 'Role-based permissions keep your data safe. Admins, staff, and renters each see exactly what they need.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Automated Reminders',
      desc: 'Never chase a late return again. Automated alerts notify renters before and after due dates.',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'One-Click Checkout',
      desc: 'Streamlined rental flow gets items out the door fast — scan, assign, confirm in seconds.',
    },
  ];

  const testimonials = [
    { name: 'Maria S.', role: 'Equipment Manager', text: 'RENTCHECK cut our missing item rate by 80%. We finally have full visibility.', stars: 5 },
    { name: 'James R.', role: 'Event Coordinator', text: 'Managing 300+ items used to be chaos. Now it takes minutes each morning.', stars: 5 },
    { name: 'Lena P.', role: 'Library Admin', text: 'The return reminders alone saved us hundreds of hours of follow-up calls.', stars: 5 },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f9fc', minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 2rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: scrolled ? '#1a56db' : 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
              <Package style={{ width: 20, height: 20, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: scrolled ? '#0f172a' : '#fff', letterSpacing: '0.06em', transition: 'color 0.3s ease' }}>RENTCHECK</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={onSignIn}
              style={{
                padding: '9px 20px', background: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease',
                border: scrolled ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255,255,255,0.45)',
                color: scrolled ? '#334155' : '#fff',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = scrolled ? '#1a56db' : 'rgba(255,255,255,0.9)';
                (e.currentTarget as HTMLElement).style.color = scrolled ? '#1a56db' : '#fff';
                (e.currentTarget as HTMLElement).style.background = scrolled ? 'transparent' : 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = scrolled ? '#cbd5e1' : 'rgba(255,255,255,0.45)';
                (e.currentTarget as HTMLElement).style.color = scrolled ? '#334155' : '#fff';
                (e.currentTarget as HTMLElement).style.background = 'none';
              }}>
              Sign In
            </button>
            <button
              onClick={onRegister}
              style={{
                padding: '9px 22px', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', border: 'none',
                background: scrolled ? '#1a56db' : 'rgba(255,255,255,0.18)',
                backdropFilter: scrolled ? 'none' : 'blur(8px)',
                boxShadow: scrolled ? '0 2px 8px rgba(26,86,219,0.35)' : 'inset 0 0 0 1.5px rgba(255,255,255,0.35)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = scrolled ? '#1648c0' : 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = scrolled ? '#1a56db' : 'rgba(255,255,255,0.18)'}>
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 55%, #1a56db 100%)',
        paddingTop: 140, paddingBottom: 100,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'rgba(99,179,237,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        {/* Grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', padding: '0 2rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Now with real-time sync across all devices</span>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.6rem, 6vw, 4.2rem)', fontWeight: 400, color: '#fff', lineHeight: 1.18, marginBottom: 24, letterSpacing: '-0.01em' }}>
            Rental management,<br />
            <em style={{ fontStyle: 'italic', color: '#93c5fd' }}>finally effortless.</em>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(191,219,254,0.9)', lineHeight: 1.75, maxWidth: 580, margin: '0 auto 40px', fontWeight: 400 }}>
            Track every item, manage returns, and eliminate lost rentals — all from one clean, modern dashboard built for speed.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onRegister} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 30px', background: '#fff', border: 'none', borderRadius: 10, color: '#1a56db', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
              Start for free <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={onSignIn} style={{ padding: '14px 30px', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}>
              Sign in to your account
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 64, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 40, flexWrap: 'wrap' }}>
            {[['500+', 'Items tracked'], ['1,200+', 'Active rentals'], ['98%', 'On-time returns'], ['< 2min', 'Avg. checkout time']].map(([val, label], i) => (
              <div key={i} style={{ padding: '0 36px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: "'DM Serif Display', serif" }}>{val}</div>
                <div style={{ fontSize: 13, color: 'rgba(147,197,253,0.8)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* scroll cue */}
        <div style={{ textAlign: 'center', marginTop: 48, position: 'relative', zIndex: 1 }}>
          <ChevronDown style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.35)', margin: '0 auto', animation: 'bounce 2s infinite' }} />
        </div>
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }`}</style>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: '#fff', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#1a56db', textTransform: 'uppercase' }}>Why RENTCHECK</span>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#0f172a', marginTop: 10, fontWeight: 400 }}>
              Everything you need to run rentals right
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: '#f8faff', border: '1px solid #e8edf7', borderRadius: 14, padding: '28px 24px', transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(26,86,219,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = '#bfd0f7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#e8edf7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div style={{ width: 44, height: 44, background: '#dbeafe', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a56db', marginBottom: 18 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#f1f5fd', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#1a56db', textTransform: 'uppercase' }}>Trusted by teams</span>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#0f172a', marginTop: 10, fontWeight: 400 }}>
              Real results, real teams
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '28px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} style={{ width: 14, height: 14, fill: '#f59e0b', color: '#f59e0b' }} />)}
                </div>
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: 'linear-gradient(135deg, #1a56db 0%, #0f172a 100%)', padding: '80px 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', fontWeight: 400, marginBottom: 16 }}>
            Ready to take control of your rentals?
          </h2>
          <p style={{ color: 'rgba(191,219,254,0.85)', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
            Join hundreds of teams already using RENTCHECK to save time, reduce losses, and keep customers happy.
          </p>
          <button onClick={onRegister} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', background: '#fff', border: 'none', borderRadius: 10, color: '#1a56db', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
            Create your free account <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0f172a', padding: '40px 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: '#1a56db', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#fff', letterSpacing: '0.06em' }}>RENTCHECK</span>
        </div>
        <p style={{ color: '#475569', fontSize: 13 }}>&copy; 2026 RENTCHECK. All rights reserved.</p>
      </footer>
    </div>
  );
}