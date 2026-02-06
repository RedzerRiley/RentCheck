import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ItemCatalog } from './components/ItemCatalog';
import { RentalTracker } from './components/RentalTracker';
import { Footer } from './components/Footer';

export default function App() {
  const [activeView, setActiveView] = useState<'catalog' | 'tracker'>('catalog');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <HeroSection />
      
      <main className="container mx-auto px-4 py-8">
        {activeView === 'catalog' ? <ItemCatalog /> : <RentalTracker />}
      </main>
      
      <Footer />
    </div>
  );
}
