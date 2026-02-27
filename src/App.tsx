import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ItemCatalog } from './components/ItemCatalog';
import { RentalTracker } from './components/RentalTracker';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { AddItem } from './components/AddItem';

export default function App() {
  const [activeView, setActiveView] = useState<'catalog' | 'tracker'>('catalog');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (credentials: { email: string; password: string }) => {
    // TODO: Replace with real API call, e.g.:
    // const res = await fetch('http://localhost:3000/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    // if (res.ok) { setIsAuthenticated(true); setShowLogin(false); }
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleRegister = (data: { name: string; email: string; password: string }) => {
    // TODO: Replace with real API call, e.g.:
    // const res = await fetch('http://localhost:3000/api/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // if (res.ok) { setIsAuthenticated(true); setShowRegister(false); }
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  if (showLogin) {
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }} />;
  }

  if (showRegister) {
    return <Register onRegister={handleRegister} onBack={() => setShowRegister(false)} onLoginClick={() => { setShowRegister(false); setShowLogin(true); }} />;
  }

  if (showAddItem) {
    return <AddItem onBack={() => setShowAddItem(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAddItem={() => setShowAddItem(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        onSignIn={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
      />
      <HeroSection />

      <main className="container mx-auto px-4 py-8">
        {activeView === 'catalog' ? <ItemCatalog /> : <RentalTracker />}
      </main>

      <Footer />
    </div>
  );
}