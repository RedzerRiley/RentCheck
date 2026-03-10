import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Package, Clock, CheckCircle, Mail, LogOut, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface PendingVerificationProps {
  userEmail?: string;
  userId?: string;
  onVerified?: () => void; // called if user refreshes and is now verified
}

export function PendingVerification({ userEmail, userId, onVerified }: PendingVerificationProps) {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [justChecked, setJustChecked]       = useState(false);
  const [signingOut, setSigningOut]         = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try { await signOut(auth); }
    finally { setSigningOut(false); }
  };

  // Let the user manually re-check their verification status
  const handleCheckStatus = async () => {
    if (!userId) return;
    setCheckingStatus(true);
    setJustChecked(false);
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists() && snap.data()?.verified === true) {
        onVerified?.();
        return;
      }
      setJustChecked(true);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'sans-serif',
    }}>

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 480,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '28px 36px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '0.08em' }}>RENTCHECK</span>
          </div>

          {/* Animated clock icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock style={{ width: 38, height: 38, color: '#fbbf24' }} />
            </div>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', margin: 0, letterSpacing: '-0.3px' }}>
            Account Pending Verification
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(191,219,254,0.85)', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.6 }}>
            You're in! Your profile has been submitted successfully.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 36px 32px' }}>

          {/* Steps */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              What happens next
            </p>

            {[
              {
                icon: <CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} />,
                bg: '#ecfdf5', border: '#6ee7b7',
                title: 'Profile submitted',
                desc: 'Your information has been received.',
                done: true,
              },
              {
                icon: <Clock style={{ width: 16, height: 16, color: '#f59e0b' }} />,
                bg: '#fffbeb', border: '#fde68a',
                title: 'Admin review',
                desc: 'Our team is reviewing your account details.',
                done: false,
              },
              {
                icon: <Mail style={{ width: 16, height: 16, color: '#2563eb' }} />,
                bg: '#eff6ff', border: '#bfdbfe',
                title: 'Email notification',
                desc: 'You\'ll get an email once your account is approved.',
                done: false,
              },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: s.bg, border: `1.5px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {s.icon}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: s.done ? '#059669' : '#1e293b', marginBottom: 2 }}>
                    {s.title} {s.done && <span style={{ fontSize: 11, color: '#10b981' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Email reminder */}
          {userEmail && (
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: '14px 16px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <Mail style={{ width: 15, height: 15, color: '#64748b', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Notification will be sent to</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{userEmail}</div>
              </div>
            </div>
          )}

          {/* Already verified? check button */}
          {justChecked && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, padding: '10px 14px', marginBottom: 14,
              fontSize: 13, color: '#92400e', fontWeight: 500, textAlign: 'center',
            }}>
              Still pending — check back later or contact the store admin.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Check status button */}
            {userId && (
              <button
                onClick={handleCheckStatus}
                disabled={checkingStatus}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', background: checkingStatus ? '#eff6ff' : '#2563eb',
                  color: checkingStatus ? '#2563eb' : '#fff',
                  border: `1.5px solid ${checkingStatus ? '#bfdbfe' : '#2563eb'}`,
                  borderRadius: 10, fontSize: 14, fontWeight: 700,
                  cursor: checkingStatus ? 'not-allowed' : 'pointer', width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw style={{ width: 15, height: 15 }} className={checkingStatus ? 'animate-spin' : ''} />
                {checkingStatus ? 'Checking...' : 'Check Verification Status'}
              </button>
            )}

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', background: '#fff', color: '#64748b',
                border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14,
                fontWeight: 600, cursor: signingOut ? 'not-allowed' : 'pointer', width: '100%',
              }}
            >
              <LogOut style={{ width: 15, height: 15 }} />
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)', marginTop: 24, textAlign: 'center' }}>
        © 2026 RENTCHECK · Item Rental & Tracking
      </p>
    </div>
  );
}