import { useState } from 'react';
import { X, Package, Calendar, Tag, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  priceLabel: string;
  availableQuantity: number;
}

interface RentRequestModalProps {
  item: Item;
  onClose: () => void;
}

export function RentRequestModal({ item, onClose }: RentRequestModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getEstimatedCost = () => {
    const days = getDayCount();
    if (!days) return null;
    return (item.price * days).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!startDate) { setError('Please select a start date.'); return; }
    if (!endDate) { setError('Please select an end date.'); return; }
    if (getDayCount() <= 0) { setError('End date must be after start date.'); return; }

    const user = auth.currentUser;
    if (!user) { setError('You must be logged in to rent.'); return; }

    setIsSubmitting(true);
    try {
      // 1. Create rental request in Firestore
      await addDoc(collection(db, 'rentals'), {
        itemId: item.id,
        itemName: item.name,
        itemCategory: item.category,
        itemPriceLabel: item.priceLabel,
        itemPrice: item.price,
        itemPriceUnit: item.priceUnit,
        userId: user.uid,
        userEmail: user.email,
        startDate,
        endDate,
        days: getDayCount(),
        estimatedCost: Number(getEstimatedCost()),
        notes: notes.trim(),
        status: 'pending',
        rentedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dueDate: new Date(endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: serverTimestamp(),
      });

      // 2. Decrement availableQuantity on the item
      await updateDoc(doc(db, 'items', item.id), {
        availableQuantity: increment(-1),
      });

      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
    color: '#111827', background: '#fff', outline: 'none', fontFamily: 'inherit',
  };

  if (showConfirmation) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 420, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle style={{ width: 36, height: 36, color: '#16a34a' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Request Submitted!</h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
            Your request for <strong>{item.name}</strong> has been submitted. An admin or staff will review and approve it. You can track its status under <strong>My Rentals</strong>.
          </p>
          <div style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Clock style={{ width: 14, height: 14, color: '#6b7280' }} />
              <span style={{ fontSize: 12, color: '#6b7280' }}>Rental Period</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{formatDate(startDate)} → {formatDate(endDate)}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              {getDayCount()} day{getDayCount() !== 1 ? 's' : ''} · Est. cost: ₱{getEstimatedCost()}
            </div>
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', padding: '1.5rem', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package style={{ width: 24, height: 24, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(191,219,254,0.9)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rental Request</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{item.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#fff' }}>
              <Tag style={{ width: 12, height: 12 }} /> {item.category}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#fff', fontWeight: 600 }}>
              {item.priceLabel}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {(['Start Date', 'End Date'] as const).map((label, i) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
                  <input type="date"
                    value={i === 0 ? startDate : endDate}
                    min={i === 0 ? today : (startDate || today)}
                    onChange={e => {
                      if (i === 0) { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(''); }
                      else setEndDate(e.target.value);
                    }}
                    required style={{ ...inputStyle, paddingLeft: 32 }}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            ))}
          </div>

          {getDayCount() > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#1d4ed8' }}>
                <span style={{ fontWeight: 500 }}>{getDayCount()} day{getDayCount() !== 1 ? 's' : ''}</span>
                <span style={{ color: '#93c5fd', margin: '0 6px' }}>·</span>
                {formatDate(startDate)} → {formatDate(endDate)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>Est. ₱{getEstimatedCost()}</div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Notes <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requirements..." rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{ flex: 2, padding: '12px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {isSubmitting ? 'Submitting...' : <> Confirm Rental <ChevronRight style={{ width: 15, height: 15 }} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}