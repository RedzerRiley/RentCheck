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
import { PendingVerification } from './components/PendingVerification';

type MainView = 'catalog' | 'tracker' | 'rentedItems';

function AuthenticatedApp({ currentUser }: { currentUser: User }) {
  const { role, userData, roleLoading } = useUserRole(currentUser);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [firestoreDisplayName, setFirestoreDisplayName] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MainView>('catalog');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showVerifyUsers, setShowVerifyUsers] = useState(false);

  const isPrivileged = role === 'admin' || role === 'staff';

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

  // ── Loading ──────────────────────────────────────────────────────────────
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

  // ── Sub-pages ────────────────────────────────────────────────────────────
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

  // ── Profile setup (regular users only) ──────────────────────────────────
  const profileComplete = role !== 'user' || !!(
    userData?.firstName?.trim() &&
    userData?.lastName?.trim() &&
    userData?.phone?.trim() &&
    userData?.street?.trim() &&
    userData?.brgy?.trim() &&
    userData?.city?.trim() &&
    userData?.region?.trim() &&
    userData?.zip?.trim()
  );

  if (role === 'user' && !profileComplete) {
    return (
      <ProfileSetup
        userId={currentUser.uid}
        initialName={userData?.displayName || currentUser.displayName || ''}
        initialEmail={currentUser.email || ''}
        initialPhone={userData?.phone || ''}
        onComplete={() => {/* userData updates automatically via onSnapshot */}}
      />
    );
  }

  // ── Pending verification ─────────────────────────────────────────────────
  // Profile is complete but admin hasn't verified yet.
  // No onVerified logic needed — useUserRole's onSnapshot automatically
  // re-renders this tree the moment verified:true is written to Firestore,
  // which drops out of this branch and into the main app below.
  const isVerified = role !== 'user' || userData?.verified === true;

  if (role === 'user' && !isVerified) {
    return (
      <PendingVerification
        userEmail={currentUser.email ?? undefined}
        userId={currentUser.uid}
        onVerified={() => {/* handled automatically by useUserRole onSnapshot */}}
      />
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f9fafb' }}>
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

      <main
        className="container mx-auto px-4"
        style={{
          paddingTop: activeView === 'tracker' ? 16 : 32,
          paddingBottom: activeView === 'tracker' ? 16 : 32,
        }}
      >
        {activeView === 'catalog'     && <div id="catalog-section"><ItemCatalog isPrivileged={isPrivileged} /></div>}
        {activeView === 'tracker'     && isPrivileged && <RentalTracker />}
        {activeView === 'rentedItems' && <RentedItems />}
      </main>

      <Footer />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [showLogin, setShowLogin]       = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser]   = useState<User | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);

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

  if (showLogin)    return <Login    onBack={() => setShowLogin(false)}    onRegisterClick={() => { setShowLogin(false);    setShowRegister(true); }} />;
  if (showRegister) return <Register onBack={() => setShowRegister(false)} onLoginClick={()    => { setShowRegister(false); setShowLogin(true);    }} />;
  if (!currentUser) return <LandingPage onSignIn={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />;

  return <AuthenticatedApp currentUser={currentUser} />;
}