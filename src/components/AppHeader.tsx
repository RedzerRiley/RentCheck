import { useState } from 'react';
import { Package, ClipboardList, Menu, Plus, ShoppingBag, LogOut, UserCircle, ChevronDown, Users } from 'lucide-react';
import { User } from 'firebase/auth';
import { UserRole } from '../hooks/useUserRole';

interface HeaderProps {
  activeView: 'catalog' | 'tracker' | 'rentedItems';
  setActiveView: (view: 'catalog' | 'tracker' | 'rentedItems') => void;
  onAddItem?: () => void;
  onSignOut?: () => void;
  onViewProfile?: () => void;
  onVerifyUsers?: () => void;
  currentUser: User;
  role: UserRole;
  profilePic?: string | null;
  firestoreDisplayName?: string | null;
}

export function AppHeader({ activeView, setActiveView, onAddItem, onSignOut, onViewProfile, onVerifyUsers, currentUser, role, profilePic, firestoreDisplayName }: HeaderProps) {
  const displayName = firestoreDisplayName || currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const [imgError, setImgError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isPrivileged = role === 'admin' || role === 'staff';

  const roleBadge: Record<UserRole, { label: string; bg: string; color: string; border: string }> = {
    admin:  { label: 'Admin',  bg: '#fef3c7', color: '#92400e', border: '#f59e0b' },
    staff:  { label: 'Staff',  bg: '#eff6ff', color: '#1e40af', border: '#3b82f6' },
    user:   { label: 'User',   bg: '#f0fdf4', color: '#166534', border: '#4ade80' },
  };
  const badge = roleBadge[role];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" style={{ position: 'relative', zIndex: 50 }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">RENTCHECK</div>
            </div>
          </div>

          {/* Navigation — filtered by role */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Item Catalog — everyone */}
            <button
              onClick={() => setActiveView('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'catalog' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" />
              Item Catalog
            </button>

            {/* My Rentals — everyone */}
            <button
              onClick={() => setActiveView('rentedItems')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'rentedItems' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              My Rentals
            </button>

            {/* Rental Tracker — admin/staff only */}
            {isPrivileged && (
              <button
                onClick={() => setActiveView('tracker')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'tracker' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Rental Tracker
              </button>
            )}

            {/* Add Item — admin/staff only */}
            {isPrivileged && (
              <button
                onClick={onAddItem}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            )}

            {/* Users Dashboard — admin/staff only */}
            {isPrivileged && (
              <button
                onClick={onVerifyUsers}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
              >
                <Users className="w-4 h-4" />
                Users Dashboard
              </button>
            )}
          </nav>

          {/* User dropdown */}
          <div className="hidden md:flex items-center gap-3" style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 12px 7px 8px',
                background: dropdownOpen ? '#f0f4ff' : '#f8fafc',
                border: `1px solid ${dropdownOpen ? '#bfcfef' : '#e2e8f0'}`,
                borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!dropdownOpen) (e.currentTarget as HTMLElement).style.background = '#f0f4ff'; }}
              onMouseLeave={e => { if (!dropdownOpen) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
            >
              {profilePic || (currentUser.photoURL && !imgError) ? (
                <img
                  src={profilePic || currentUser.photoURL!}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e2e8f0' }}
                />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#f1f5f9', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCircle style={{ width: 22, height: 22, color: '#94a3b8' }} />
                </div>
              )}
              <div style={{ lineHeight: 1.25, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                {/* Role badge inline */}
                <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: 2, background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 10, padding: '1px 7px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge.label}</span>
                </div>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: '#94a3b8', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 2 }} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropdownOpen(false)} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 210, zIndex: 50, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{displayName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{currentUser.email}</div>
                    <div style={{ marginTop: 6, display: 'inline-flex', background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 10, padding: '2px 9px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{badge.label}</span>
                    </div>
                  </div>

                  <button onClick={() => { setDropdownOpen(false); onViewProfile?.(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#334155', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                    <UserCircle style={{ width: 16, height: 16, color: '#64748b' }} />
                    View Profile
                  </button>

                  <div style={{ height: 1, background: '#f1f5f9' }} />

                  <button onClick={() => { setDropdownOpen(false); onSignOut?.(); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#ef4444', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fff5f5'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#none'}>
                    <LogOut style={{ width: 16, height: 16 }} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

          <button className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}