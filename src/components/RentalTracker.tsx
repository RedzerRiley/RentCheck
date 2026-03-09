import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  Calendar, Clock, User, Package, AlertCircle,
  CheckCircle, XCircle, ChevronRight, Bell, Hourglass,
  Tag, RotateCcw, X, Pencil, DollarSign, Hash, FileText, Image, Plus
} from 'lucide-react';

interface Rental {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemPriceLabel: string;
  itemPrice: number;
  itemPriceUnit: string;
  userId: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  rentedDate: string;
  days: number;
  estimatedCost: number;
  notes?: string;
  status: 'pending' | 'active' | 'returned' | 'overdue' | 'denied';
  createdAt?: any;
}

interface ItemDoc {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  priceLabel: string;
  quantity: number;
  availableQuantity: number;
  description: string;
  condition: string;
  tags: string[];
  imageBase64?: string | null;
}

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const PRICE_UNITS = ['day', 'hour', 'week'];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px',
  border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13,
  outline: 'none', color: '#111827', background: '#fff', fontFamily: 'inherit',
};

export function RentalTracker() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [items, setItems] = useState<Record<string, ItemDoc>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [selected, setSelected] = useState<Rental | null>(null);
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [detailView, setDetailView] = useState<'rental' | 'editItem'>('rental');

  // Edit item form state
  const [editForm, setEditForm] = useState<ItemDoc & { tagInput: string } | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Live rentals
  useEffect(() => {
    const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      const now = new Date();
      const docs = snap.docs.map(d => {
        const data = d.data() as Omit<Rental, 'id'>;
        let status = data.status;
        if (status === 'active' && new Date(data.dueDate) < now) status = 'overdue';
        return { id: d.id, ...data, status };
      });
      setRentals(docs);
      setSelected(prev => prev ? (docs.find(r => r.id === prev.id) ?? null) : null);
      setLoading(false);
    });
  }, []);

  // Live items index
  useEffect(() => {
    return onSnapshot(collection(db, 'items'), snap => {
      const map: Record<string, ItemDoc> = {};
      snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() } as ItemDoc; });
      setItems(map);
    });
  }, []);

  // When switching to editItem view, seed form from live items map
  useEffect(() => {
    if (detailView === 'editItem' && selected) {
      const live = items[selected.itemId];
      if (live) setEditForm({ ...live, tagInput: '' });
    }
  }, [detailView, selected?.itemId]);

  const pending = rentals.filter(r => r.status === 'pending');
  const counts = {
    pending:  pending.length,
    active:   rentals.filter(r => r.status === 'active').length,
    overdue:  rentals.filter(r => r.status === 'overdue').length,
    returned: rentals.filter(r => r.status === 'returned').length,
    denied:   rentals.filter(r => r.status === 'denied').length,
  };

  const displayList = tab === 'pending' ? pending
    : rentals.filter(r => statusFilter === 'All' || r.status === statusFilter.toLowerCase());

  const handleApprove = async (rental: Rental) => {
    setProcessing(true);
    try { await updateDoc(doc(db, 'rentals', rental.id), { status: 'active' }); }
    catch (e) { console.error(e); } finally { setProcessing(false); }
  };

  const handleDeny = async (rental: Rental) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'rentals', rental.id), { status: 'denied' });
      await updateDoc(doc(db, 'items', rental.itemId), { availableQuantity: increment(1) });
    } catch (e) { console.error(e); } finally { setProcessing(false); }
  };

  const handleMarkReturned = async (rental: Rental) => {
    setProcessing(true);
    try {
      await updateDoc(doc(db, 'rentals', rental.id), { status: 'returned' });
      await updateDoc(doc(db, 'items', rental.itemId), { availableQuantity: increment(1) });
    } catch (e) { console.error(e); } finally { setProcessing(false); }
  };

  const handleEditItemSave = async () => {
    if (!editForm || !selected) return;
    if (!editForm.name?.trim()) { setEditError('Name is required.'); return; }
    if (!editForm.category?.trim()) { setEditError('Category is required.'); return; }
    if (!editForm.price || editForm.price <= 0) { setEditError('Enter a valid price.'); return; }
    setEditSaving(true); setEditError('');
    try {
      await updateDoc(doc(db, 'items', selected.itemId), {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        price: Number(editForm.price),
        priceUnit: editForm.priceUnit || 'day',
        priceLabel: `₱${editForm.price}/${editForm.priceUnit || 'day'}`,
        quantity: Number(editForm.quantity) || 1,
        description: editForm.description || '',
        condition: editForm.condition || 'Good',
        tags: editForm.tags || [],
        imageBase64: editForm.imageBase64 ?? null,
      });
      setEditSuccess(true);
      setTimeout(() => { setDetailView('rental'); setEditSuccess(false); }, 900);
    } catch (e: any) {
      setEditError(e.message || 'Save failed.');
    } finally { setEditSaving(false); }
  };

  const statusBadge = (status: Rental['status']) => {
    const cfg: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: '#fffbeb', color: '#b45309', label: 'Pending' },
      active:   { bg: '#eff6ff', color: '#2563eb', label: 'Active' },
      overdue:  { bg: '#fef2f2', color: '#dc2626', label: 'Overdue' },
      returned: { bg: '#f0fdf4', color: '#16a34a', label: 'Returned' },
      denied:   { bg: '#f9fafb', color: '#6b7280', label: 'Denied' },
    };
    const s = cfg[status] ?? cfg.active;
    return <span style={{ padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  return (
    <div style={{ display: 'flex', gap: 22, height: 'calc(100vh - 200px)', minHeight: 500 }}>

      {/* ── LEFT: list panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', width: 400, flexShrink: 0 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>Rental Tracker</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Manage all rental requests and returns</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Pending',  n: counts.pending,  color: '#b45309', bg: '#fffbeb', Icon: Hourglass },
            { label: 'Active',   n: counts.active,   color: '#2563eb', bg: '#eff6ff', Icon: Clock },
            { label: 'Overdue',  n: counts.overdue,  color: '#dc2626', bg: '#fef2f2', Icon: AlertCircle },
            { label: 'Returned', n: counts.returned, color: '#16a34a', bg: '#f0fdf4', Icon: CheckCircle },
          ].map(({ label, n, color, bg, Icon }) => (
            <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, background: bg, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px' }}>
                <Icon style={{ width: 13, height: 13, color }} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 3, marginBottom: 12, gap: 3 }}>
          <button onClick={() => setTab('pending')}
            style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: tab === 'pending' ? '#fff' : 'transparent', color: tab === 'pending' ? '#1e40af' : '#6b7280', boxShadow: tab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Bell style={{ width: 13, height: 13 }} />
            Requests
            {counts.pending > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{counts.pending}</span>}
          </button>
          <button onClick={() => setTab('all')}
            style={{ flex: 1, padding: '8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, background: tab === 'all' ? '#fff' : 'transparent', color: tab === 'all' ? '#1e40af' : '#6b7280', boxShadow: tab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            All Rentals
          </button>
        </div>

        {/* Status filter for All tab */}
        {tab === 'all' && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {['All', 'Pending', 'Active', 'Overdue', 'Returned', 'Denied'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                style={{ padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer', background: statusFilter === s ? '#2563eb' : '#f3f4f6', color: statusFilter === s ? '#fff' : '#6b7280' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Rental list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 40 }}>Loading...</p>
          ) : displayList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
              {tab === 'pending'
                ? <><Bell style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }} /><p style={{ fontWeight: 500, fontSize: 13 }}>No pending requests</p></>
                : <><Package style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.3 }} /><p style={{ fontWeight: 500, fontSize: 13 }}>No rentals found</p></>
              }
            </div>
          ) : displayList.map(rental => {
            const isSelected = selected?.id === rental.id;
            return (
              <button key={rental.id} onClick={() => { setSelected(rental); setDetailView('rental'); }}
                style={{ width: '100%', textAlign: 'left', padding: '12px', border: 'none', borderRadius: 10, cursor: 'pointer', background: isSelected ? '#eff6ff' : '#fff', outline: isSelected ? '2px solid #bfdbfe' : '1px solid #e5e7eb', transition: 'all 0.12s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 32, height: 32, background: rental.status === 'pending' ? '#fffbeb' : '#f3f4f6', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package style={{ width: 14, height: 14, color: rental.status === 'pending' ? '#b45309' : '#9ca3af' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.itemName}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rental.userEmail}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 6 }}>
                    {statusBadge(rental.status)}
                    <ChevronRight style={{ width: 12, height: 12, color: '#d1d5db' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#9ca3af', paddingLeft: 40 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar style={{ width: 10, height: 10 }} />{rental.startDate} → {rental.endDate}
                  </span>
                  <span style={{ fontWeight: 600, color: '#2563eb' }}>₱{rental.estimatedCost}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: detail panel ── */}
      <div style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: 40 }}>
            <Package style={{ width: 44, height: 44, marginBottom: 12, opacity: 0.2 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 5px' }}>Select a rental to review</p>
            <p style={{ fontSize: 12, margin: 0 }}>Click any item in the list to see details and actions.</p>
          </div>
        ) : detailView === 'rental' ? (
          <>
            {/* Detail header */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '18px 22px', position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 12, right: 12, width: 28, height: 28, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.15)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(191,219,254,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Rental Request</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{selected.itemName}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '2px 9px', fontSize: 11, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}><Tag style={{ width: 10, height: 10 }} />{selected.itemCategory}</span>
                    <span style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '2px 9px', fontSize: 11, color: '#fff', fontWeight: 600 }}>{selected.itemPriceLabel}</span>
                    {statusBadge(selected.status)}
                    {/* Edit item button */}
                    <button onClick={() => setDetailView('editItem')}
                      style={{ marginLeft: 4, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
                      <Pencil style={{ width: 10, height: 10 }} /> Edit Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}><User style={{ width: 11, height: 11 }} />Renter</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500, wordBreak: 'break-all' }}>{selected.userEmail}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>Estimated Cost</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>₱{selected.estimatedCost}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{selected.days} day{selected.days !== 1 ? 's' : ''} × {selected.itemPriceLabel}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}><Calendar style={{ width: 11, height: 11 }} />Period</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{selected.startDate}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0' }}>to</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 600 }}>{selected.endDate}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}><Clock style={{ width: 11, height: 11 }} />Requested On</div>
                  <div style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{selected.rentedDate}</div>
                </div>
              </div>

              {selected.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Note from renter</div>
                  <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>{selected.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selected.status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '11px 14px', display: 'flex', gap: 10 }}>
                    <Hourglass style={{ width: 15, height: 15, color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>This request awaits your review. Approve to confirm or deny to release the item.</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleApprove(selected)} disabled={processing}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: processing ? '#6ee7b7' : '#10b981', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer' }}>
                      <CheckCircle style={{ width: 15, height: 15 }} />{processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button onClick={() => handleDeny(selected)} disabled={processing}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: processing ? '#fca5a5' : '#ef4444', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer' }}>
                      <XCircle style={{ width: 15, height: 15 }} />{processing ? 'Processing...' : 'Deny'}
                    </button>
                  </div>
                </div>
              )}
              {(selected.status === 'active' || selected.status === 'overdue') && (
                <button onClick={() => handleMarkReturned(selected)} disabled={processing}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: processing ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: processing ? 'not-allowed' : 'pointer' }}>
                  <RotateCcw style={{ width: 15, height: 15 }} />{processing ? 'Processing...' : 'Mark as Returned'}
                </button>
              )}
              {selected.status === 'returned' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#16a34a' }}>
                  <CheckCircle style={{ width: 15, height: 15 }} /> Item has been returned
                </div>
              )}
              {selected.status === 'denied' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 13, fontWeight: 600, color: '#6b7280' }}>
                  <XCircle style={{ width: 15, height: 15 }} /> Request was denied
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── Edit Item view ── */
          <>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setDetailView('rental')}
                  style={{ width: 32, height: 32, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  <ChevronRight style={{ width: 15, height: 15, transform: 'rotate(180deg)' }} />
                </button>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#111827' }}>Edit Item</h3>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{selected.itemName}</p>
                </div>
              </div>
              <button onClick={() => setDetailView('rental')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex' }}>
                <X style={{ width: 17, height: 17 }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!editForm ? (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Item not found in catalog.</p>
              ) : (
                <>
                  {/* Image */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}><Image style={{ width: 11, height: 11 }} />Photo</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 64, height: 64, borderRadius: 9, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                        {editForm.imageBase64 ? <img src={editForm.imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package style={{ width: 22, height: 22, color: '#d1d5db' }} />}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>Change</button>
                        {editForm.imageBase64 && <button onClick={() => setEditForm(p => p ? { ...p, imageBase64: null } : p)} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>Remove</button>}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files?.[0]; if (!file) return;
                        if (file.size > 800 * 1024) { setEditError('Image must be under 800KB.'); return; }
                        const r = new FileReader(); r.onload = () => setEditForm(p => p ? { ...p, imageBase64: r.result as string } : p); r.readAsDataURL(file);
                      }} />
                    </div>
                  </div>

                  {/* Name + Category */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}><FileText style={{ width: 11, height: 11 }} />Name</label>
                      <input value={editForm.name} onChange={e => setEditForm(p => p ? { ...p, name: e.target.value } : p)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}><Tag style={{ width: 11, height: 11 }} />Category</label>
                      <input value={editForm.category} onChange={e => setEditForm(p => p ? { ...p, category: e.target.value } : p)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                  </div>

                  {/* Price + Unit + Qty */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}><DollarSign style={{ width: 11, height: 11 }} />Price (₱)</label>
                      <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(p => p ? { ...p, price: Number(e.target.value) } : p)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'block' }}>Per</label>
                      <select value={editForm.priceUnit} onChange={e => setEditForm(p => p ? { ...p, priceUnit: e.target.value } : p)} style={inputStyle}>
                        {PRICE_UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 5 }}><Hash style={{ width: 11, height: 11 }} />Qty</label>
                      <input type="number" min="1" value={editForm.quantity} onChange={e => setEditForm(p => p ? { ...p, quantity: Number(e.target.value) } : p)} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'block' }}>Description</label>
                    <textarea value={editForm.description} onChange={e => setEditForm(p => p ? { ...p, description: e.target.value } : p)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                  </div>

                  {/* Condition */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7, display: 'block' }}>Condition</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {CONDITIONS.map(c => (
                        <button key={c} type="button" onClick={() => setEditForm(p => p ? { ...p, condition: c } : p)}
                          style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: editForm.condition === c ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb', background: editForm.condition === c ? '#eff6ff' : '#fff', color: editForm.condition === c ? '#2563eb' : '#6b7280' }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7, display: 'block' }}>Tags</label>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
                      <input value={editForm.tagInput} onChange={e => setEditForm(p => p ? { ...p, tagInput: e.target.value } : p)}
                        onKeyDown={e => {
                          if (e.key !== 'Enter') return; e.preventDefault();
                          const t = editForm.tagInput.trim().toLowerCase();
                          if (t && !editForm.tags.includes(t)) setEditForm(p => p ? { ...p, tags: [...p.tags, t], tagInput: '' } : p);
                          else setEditForm(p => p ? { ...p, tagInput: '' } : p);
                        }}
                        placeholder="Add tag, press Enter" style={{ ...inputStyle, flex: 1 }} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
                      <button type="button" onClick={() => {
                        const t = editForm.tagInput.trim().toLowerCase();
                        if (t && !editForm.tags.includes(t)) setEditForm(p => p ? { ...p, tags: [...p.tags, t], tagInput: '' } : p);
                      }} style={{ padding: '9px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600 }}>
                        <Plus style={{ width: 13, height: 13 }} />Add
                      </button>
                    </div>
                    {editForm.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {editForm.tags.map(tag => (
                          <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 11, color: '#2563eb' }}>
                            {tag}
                            <button type="button" onClick={() => setEditForm(p => p ? { ...p, tags: p.tags.filter(t => t !== tag) } : p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: 0, display: 'flex' }}>
                              <X style={{ width: 11, height: 11 }} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {editError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <AlertCircle style={{ width: 13, height: 13, color: '#dc2626', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#dc2626' }}>{editError}</span>
                    </div>
                  )}
                  {editSuccess && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <CheckCircle style={{ width: 13, height: 13, color: '#16a34a' }} />
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>Saved successfully!</span>
                    </div>
                  )}

                  {/* Save/Cancel */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setDetailView('rental')} style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
                    <button onClick={handleEditItemSave} disabled={editSaving} style={{ flex: 2, padding: '10px', background: editSaving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: editSaving ? 'not-allowed' : 'pointer' }}>
                      {editSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}