import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ItemCatalog } from './components/ItemCatalog';
import { RentalTracker } from './components/RentalTracker';
// import { RentedItems } from './components/RentedItems';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AddItem } from './components/AddItem';
import { UserProfile } from './components/UserProfile';

type MainView = 'catalog' | 'tracker' | 'addItem' | 'rentedItems';

export default function App() {
  const [activeView, setActiveView] = useState<MainView>('catalog');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (credentials: { email: string; password: string }) => {
    // TODO: Replace with real API call:
    // const res = await fetch('http://localhost:3000/api/login', { ... });
    setUserEmail(credentials.email);
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowUserProfile(true);
  };

  const handleRegister = (data: { name: string; email: string; password: string }) => {
    // TODO: Replace with real API call:
    // const res = await fetch('http://localhost:3000/api/register', { ... });
    setUserEmail(data.email);
    setIsAuthenticated(true);
    setShowRegister(false);
    setShowUserProfile(true);
  };

  if (showLogin) {
    return (
      <Login
        onLogin={handleLogin}
        onBack={() => setShowLogin(false)}
        onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }}
      />
    );
  }

  if (showRegister) {
    return (
      <Register
        onRegister={handleRegister}
        onBack={() => setShowRegister(false)}
        onLoginClick={() => { setShowRegister(false); setShowLogin(true); }}
      />
    );
  }

  if (showUserProfile) {
    return (
      <UserProfile
        userEmail={userEmail}
        onBack={() => setShowUserProfile(false)}
      />
    );
  }

  if (activeView === 'addItem') {
    return (
      <AddItem
        onBack={() => setActiveView('catalog')}
        onItemAdded={() => setActiveView('catalog')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onSignIn={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onAddItem={() => setActiveView('addItem')}
        onViewProfile={() => setShowUserProfile(true)}
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