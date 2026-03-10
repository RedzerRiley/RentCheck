import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/firebase';
import { auth } from './firebase/firebase';
import { useUserRole } from './hooks/useUserRole';
import { LandingPage } from './components/LandingPage';
import { AppHeader } from './components/AppHeader';
import { HeroSection } from './components/HeroSection';
import { ItemCatalog } from './components/ItemCatalog';
import { RentalTracker } from './components/RentalTracker';
import { RentedItems } from './components/RentedItems';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AddItem } from './components/AddItem';
import { UserProfile } from './components/UserProfile';
import { VerifyUsers } from './components/VerifyUsers';
import { ProfileSetup } from './components/ProfileSetup';

type MainView = 'catalog' | 'tracker' | 'rentedItems';

// Inner component — receives a guaranteed non-null user so the hook always has a user
function AuthenticatedApp({ currentUser }: { currentUser: User }) {
  const { role, userData, roleLoading } = useUserRole(currentUser);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [firestoreDisplayName, setFirestoreDisplayName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MainView>('catalog');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showVerifyUsers, setShowVerifyUsers] = useState(false);

  const isPrivileged = role === 'admin' || role === 'staff';

  const handleSetActiveView = (view: MainView) => {
    setActiveView(view);
  };

  // Keep header avatar in sync with Firestore profilePic
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) {
        setProfilePic(snap.data().profilePic ?? null);
        setFirestoreDisplayName(snap.data().displayName ?? null);
      }
    });
    return () => unsub();
  }, [currentUser.uid]);

  if (roleLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>RENTCHECK</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 40 }}>Item Rental & Tracking</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                animation: 'bounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
        </div>
      </div>
    );
  }

  if (showAddItem && isPrivileged) {
    return <AddItem onBack={() => setShowAddItem(false)} />;
  }

  if (showUserProfile) {
    return (
      <UserProfile
        userName={currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
        userEmail={currentUser.email || ''}
        userId={currentUser.uid}
        role={role}
        onLogout={() => auth.signOut()}
        onBack={() => setShowUserProfile(false)}
      />
    );
  }

  if (showVerifyUsers && isPrivileged) {
    return <VerifyUsers onBack={() => setShowVerifyUsers(false)} currentUserRole={role} />;
  }

  // Regular users must complete their profile before pending/verified checks
  const profileComplete = role !== 'user' || (
    !!(userData?.firstName?.trim()) &&
    !!(userData?.lastName?.trim()) &&
    !!(userData?.phone?.trim()) &&
    !!(userData?.street?.trim()) &&
    !!(userData?.brgy?.trim()) &&
    !!(userData?.city?.trim()) &&
    !!(userData?.region?.trim()) &&
    !!(userData?.zip?.trim())
  );

  // if (!profileComplete) {
  //   return (
  //     <CompleteProfile
  //       uid={currentUser.uid}
  //       existingName={userData?.displayName || currentUser.displayName || ''}
  //       onComplete={() => {}} // useUserRole's onSnapshot re-renders automatically
  //     />
  //   );
  // }

  // Unverified regular users — check profile completeness first
  const isVerified = role !== 'user' || (userData?.verified === true);

  if (!isVerified) {
    const profileComplete = !!(
      userData?.firstName?.trim() &&
      userData?.lastName?.trim() &&
      userData?.phone?.trim() &&
      userData?.street?.trim() &&
      userData?.brgy?.trim() &&
      userData?.city?.trim() &&
      userData?.region?.trim() &&
      userData?.zip?.trim()
    );

    if (!profileComplete) {
      return (
        <ProfileSetup
          userId={currentUser.uid}
          initialName={userData?.displayName || currentUser.displayName || ''}
          initialEmail={currentUser.email || ''}
          initialPhone={userData?.phone || ''}
          onComplete={() => {/* userData will update via onSnapshot automatically */}}
        />
      );
    }

    // Profile is complete but not yet verified — show pending screen
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '3rem 2.5rem', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.18)' }}>
          <div style={{ width: 72, height: 72, background: '#fffbeb', border: '2px solid #fde68a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Account Pending Verification</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
            Your profile has been submitted and is awaiting approval from an admin. You'll be notified once verified.
          </p>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Signed in as</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{userData?.displayName || currentUser.displayName || 'User'}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{currentUser.email}</div>
          </div>
          <button onClick={() => auth.signOut()}
            style={{ width: '100%', padding: '12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        activeView={activeView}
        setActiveView={setActiveView}
        onAddItem={() => isPrivileged && setShowAddItem(true)}
        onSignOut={() => auth.signOut()}
        onViewProfile={() => setShowUserProfile(true)}
        onVerifyUsers={() => isPrivileged && setShowVerifyUsers(true)}
        currentUser={currentUser}
        role={role}
        profilePic={profilePic}
        firestoreDisplayName={firestoreDisplayName}
      />
      {activeView === 'catalog' && <HeroSection />}

      <main className="container mx-auto px-4" style={{ paddingTop: activeView === 'tracker' ? 16 : 32, paddingBottom: activeView === 'tracker' ? 0 : 32 }}>
        {activeView === 'catalog' && <div id="catalog-section"><ItemCatalog isPrivileged={isPrivileged} /></div>}
        {/* Rental Tracker — privileged only */}
        {activeView === 'tracker' && isPrivileged && <RentalTracker />}
        {activeView === 'rentedItems' && <RentedItems />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) { setShowLogin(false); setShowRegister(false); }
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          {/* Logo */}
          <div style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.25)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>RENTCHECK</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 40 }}>Item Rental & Tracking</div>
          {/* Animated dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                animation: 'bounce 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (showLogin) return <Login onBack={() => setShowLogin(false)} onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }} />;
  if (showRegister) return <Register onBack={() => setShowRegister(false)} onLoginClick={() => { setShowRegister(false); setShowLogin(true); }} />;
  if (!currentUser) return <LandingPage onSignIn={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />;

  return <AuthenticatedApp currentUser={currentUser} />;
}