import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/firebase';
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

type MainView = 'catalog' | 'tracker' | 'rentedItems';

export default function App() {
  const [activeView, setActiveView] = useState<MainView>('catalog');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setShowLogin(false);
        setShowRegister(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Loading spinner ──
  if (authLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <svg className="animate-spin" style={{ width: 32, height: 32, color: '#2563eb', margin: '0 auto 12px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ── Login page ──
  if (showLogin) {
    return (
      <Login
        onBack={() => setShowLogin(false)}
        onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }}
      />
    );
  }

  // ── Register page ──
  if (showRegister) {
    return (
      <Register
        onBack={() => setShowRegister(false)}
        onLoginClick={() => { setShowRegister(false); setShowLogin(true); }}
      />
    );
  }

  // ── Add Item page ──
  if (showAddItem) {
    return <AddItem onBack={() => setShowAddItem(false)} />;
  }

  // ── Landing page (not logged in) ──
  if (!currentUser) {
    return (
      <LandingPage
        onSignIn={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  // ── Main app dashboard (logged in) ──
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        activeView={activeView}
        setActiveView={setActiveView}
        onAddItem={() => setShowAddItem(true)}
        onSignOut={() => auth.signOut()}
        currentUser={currentUser}
      />
      {activeView === 'catalog' && <HeroSection />}

      <main className="container mx-auto px-4 py-8">
        {activeView === 'catalog' && <ItemCatalog />}
        {activeView === 'tracker' && <RentalTracker />}
        {activeView === 'rentedItems' && <RentedItems />}
      </main>

      <Footer />
    </div>
  );
}