import { useState } from 'react';
import { Package, ClipboardList, Menu, Plus, ShoppingBag, LogOut, UserCircle } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeView: 'catalog' | 'tracker' | 'rentedItems';
  setActiveView: (view: 'catalog' | 'tracker' | 'rentedItems') => void;
  onAddItem?: () => void;
  onSignOut?: () => void;
  currentUser: User;
}

export function AppHeader({ activeView, setActiveView, onAddItem, onSignOut, currentUser }: HeaderProps) {
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const [imgError, setImgError] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">RENTCHECK</div>
              <div className="text-xs text-gray-500">Item Rental & Tracking</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveView('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'catalog' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Item Catalog
            </button>
            <button
              onClick={() => setActiveView('tracker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'tracker' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Rental Tracker
            </button>
            <button
              onClick={() => setActiveView('rentedItems')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'rentedItems' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              My Rentals
            </button>
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </nav>

          {/* User info + Sign out */}
          <div className="hidden md:flex items-center gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {currentUser.photoURL && !imgError ? (
                <img
                  src={currentUser.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e2e8f0' }}
                />
              ) : (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: '#f1f5f9', border: '2px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserCircle style={{ width: 22, height: 22, color: '#94a3b8' }} />
                </div>
              )}
              <div style={{ lineHeight: 1.2 }}>
                <div className="text-sm font-semibold text-gray-800" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div className="text-xs text-gray-400" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}