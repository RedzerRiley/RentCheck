import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { Package, Tag, Calendar, CheckCircle, Clock, AlertCircle, Hourglass, XCircle } from 'lucide-react';

interface RentalDoc {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemPriceLabel: string;
  rentedDate: string;
  dueDate: string;
  estimatedCost: number;
  days: number;
  notes?: string;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'denied';
}

const STATUS_FILTERS = ['All', 'Pending', 'Active', 'Returned', 'Overdue', 'Denied'] as const;
type FilterType = typeof STATUS_FILTERS[number];

const statusConfig: Record<RentalDoc['status'], { label: string; Icon: any; accentColor: string; badgeBg: string; badgeColor: string; badgeBorder: string }> = {
  pending:  { label: 'Pending Approval', Icon: Hourglass,   accentColor: '#f59e0b', badgeBg: '#fffbeb', badgeColor: '#b45309', badgeBorder: '#fde68a' },
  active:   { label: 'Active',           Icon: Clock,        accentColor: '#3b82f6', badgeBg: '#eff6ff', badgeColor: '#2563eb', badgeBorder: '#bfdbfe' },
  returned: { label: 'Returned',         Icon: CheckCircle,  accentColor: '#22c55e', badgeBg: '#f0fdf4', badgeColor: '#16a34a', badgeBorder: '#bbf7d0' },
  overdue:  { label: 'Overdue',          Icon: AlertCircle,  accentColor: '#ef4444', badgeBg: '#fef2f2', badgeColor: '#dc2626', badgeBorder: '#fecaca' },
  denied:   { label: 'Denied',           Icon: XCircle,      accentColor: '#9ca3af', badgeBg: '#f9fafb', badgeColor: '#6b7280', badgeBorder: '#e5e7eb' },
};

export function RentedItems() {
  const [rentals, setRentals] = useState<RentalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }
    const q = query(collection(db, 'rentals'), where('userId', '==', user.uid));
    return onSnapshot(q, snap => {
      const now = new Date();
      const docs = snap.docs.map(d => {
        const data = d.data() as Omit<RentalDoc, 'id'>;
        let status = data.status;
        if (status === 'active' && new Date(data.dueDate) < now) status = 'overdue';
        return { id: d.id, ...data, status };
      });
      const order: Record<string, number> = { pending: 0, overdue: 1, active: 2, returned: 3, denied: 4 };
      docs.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
      setRentals(docs);
      setLoading(false);
    });
  }, []);

  const filtered = rentals.filter(r => filter === 'All' || r.status === filter.toLowerCase());

  const counts: Record<FilterType, number> = {
    All:      rentals.length,
    Pending:  rentals.filter(r => r.status === 'pending').length,
    Active:   rentals.filter(r => r.status === 'active').length,
    Returned: rentals.filter(r => r.status === 'returned').length,
    Overdue:  rentals.filter(r => r.status === 'overdue').length,
    Denied:   rentals.filter(r => r.status === 'denied').length,
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>Loading your rentals...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>My Rented Items</h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Track your current and past rental requests</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Pending',   count: counts.Pending,  Icon: Hourglass,   color: '#b45309', bg: '#fffbeb' },
          { label: 'Active',    count: counts.Active,   Icon: Clock,       color: '#2563eb', bg: '#eff6ff' },
          { label: 'Overdue',   count: counts.Overdue,  Icon: AlertCircle, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Returned',  count: counts.Returned, Icon: CheckCircle, color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ label, count, Icon, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 19, height: 19, color }} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 8, border: filter === f ? '1px solid #2563eb' : '1px solid #e5e7eb', background: filter === f ? '#2563eb' : '#fff', color: filter === f ? '#fff' : '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {f}
              <span style={{ padding: '1px 6px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: filter === f ? 'rgba(255,255,255,0.25)' : '#f3f4f6', color: filter === f ? '#fff' : '#6b7280' }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '64px 24px', textAlign: 'center' }}>
          <Package style={{ width: 40, height: 40, color: '#d1d5db', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
            {rentals.length === 0 ? "You haven't rented anything yet" : 'No items match this filter'}
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {rentals.length === 0 ? 'Browse the Item Catalog to submit a rental request.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(rental => {
            const cfg = statusConfig[rental.status];
            return (
              <div key={rental.id}
                style={{ background: '#fff', border: '1px solid #e5e7eb', borderLeft: `4px solid ${cfg.accentColor}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ width: 48, height: 48, background: cfg.badgeBg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package style={{ width: 22, height: 22, color: cfg.accentColor }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.itemName}</h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0, background: cfg.badgeBg, color: cfg.badgeColor, border: `1px solid ${cfg.badgeBorder}` }}>
                      <cfg.Icon style={{ width: 11, height: 11 }} /> {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                    <Tag style={{ width: 12, height: 12 }} />
                    <span>{rental.itemCategory}</span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{rental.itemPriceLabel}</span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <span style={{ fontWeight: 600, color: '#374151' }}>₱{rental.estimatedCost} total</span>
                  </div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af' }}>
                      <Calendar style={{ width: 11, height: 11 }} />
                      Requested: <strong style={{ color: '#4b5563', marginLeft: 3 }}>{rental.rentedDate}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9ca3af' }}>
                      <Calendar style={{ width: 11, height: 11 }} />
                      Due: <strong style={{ color: rental.status === 'overdue' ? '#ef4444' : '#4b5563', marginLeft: 3 }}>{rental.dueDate}</strong>
                    </span>
                    {rental.days && <span style={{ fontSize: 12, color: '#9ca3af' }}>{rental.days} day{rental.days !== 1 ? 's' : ''}</span>}
                  </div>
                  {rental.notes && <div style={{ marginTop: 6, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>Note: {rental.notes}</div>}

                  {/* Status info banners — no action buttons for users */}
                  {rental.status === 'pending' && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '5px 10px' }}>
                      <Hourglass style={{ width: 11, height: 11 }} /> Awaiting approval from admin or staff
                    </div>
                  )}
                  {rental.status === 'active' && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '5px 10px' }}>
                      <Clock style={{ width: 11, height: 11 }} /> Return the item to the admin or staff when done
                    </div>
                  )}
                  {rental.status === 'overdue' && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 10px' }}>
                      <AlertCircle style={{ width: 11, height: 11 }} /> Past due — please return the item immediately
                    </div>
                  )}
                  {rental.status === 'denied' && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px' }}>
                      <XCircle style={{ width: 11, height: 11 }} /> Request was denied by admin or staff
                    </div>
                  )}
                  {rental.status === 'returned' && (
                    <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '5px 10px' }}>
                      <CheckCircle style={{ width: 11, height: 11 }} /> Item returned — rental complete
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}