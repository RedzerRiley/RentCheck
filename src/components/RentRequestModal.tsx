import { useState } from 'react';
import {
  X, Package, Calendar, Tag, CheckCircle, Clock,
  ChevronRight, Truck, ShoppingBag, CreditCard, Wallet,
  Banknote, MapPin, FileText, ChevronLeft
} from 'lucide-react';
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

type Step = 'dates' | 'delivery' | 'payment' | 'confirm' | 'receipt';

const DELIVERY_OPTIONS = [
  {
    id: 'pickup',
    label: 'Pickup',
    desc: 'Pick up the item at our location.',
    Icon: ShoppingBag,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'lalamove',
    label: 'Lalamove Delivery',
    desc: 'We arrange delivery via Lalamove. Delivery fee applies.',
    Icon: Truck,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'cash_pickup',
    label: 'Cash on Pickup',
    desc: 'Pay in cash when you pick up the item.',
    Icon: Banknote,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#6ee7b7',
    forDelivery: ['pickup'],
  },
  {
    id: 'cash_delivery',
    label: 'Cash on Delivery',
    desc: 'Pay in cash when the item is delivered.',
    Icon: Banknote,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    forDelivery: ['lalamove'],
  },
  {
    id: 'gcash',
    label: 'GCash / E-Wallet',
    desc: 'Pay via GCash or any linked e-wallet.',
    Icon: Wallet,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    forDelivery: ['pickup', 'lalamove'],
  },
  {
    id: 'credit_card',
    label: 'Credit / Debit Card',
    desc: 'Pay securely with your card.',
    Icon: CreditCard,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
    forDelivery: ['pickup', 'lalamove'],
  },
];

export function RentRequestModal({ item, onClose }: RentRequestModalProps) {
  const [step, setStep] = useState<Step>('dates');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [delivery, setDelivery] = useState<string>('');
  const [payment, setPayment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getEstimatedCost = () => {
    const days = getDayCount();
    if (!days) return 0;
    return item.price * days;
  };

  const formatDate = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const formatDateShort = (d: string) =>
    d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  const getDeliveryLabel = () => DELIVERY_OPTIONS.find(d => d.id === delivery)?.label ?? '';
  const getPaymentLabel = () => PAYMENT_OPTIONS.find(p => p.id === payment)?.label ?? '';

  const availablePayments = PAYMENT_OPTIONS.filter(p => p.forDelivery.includes(delivery));

  const generateReceiptId = () =>
    'RC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();

  const handleNextFromDates = () => {
    setError('');
    if (!startDate) { setError('Please select a start date.'); return; }
    if (!endDate)   { setError('Please select an end date.'); return; }
    if (getDayCount() <= 0) { setError('End date must be after start date.'); return; }
    setStep('delivery');
  };

  const handleNextFromDelivery = () => {
    setError('');
    if (!delivery) { setError('Please select a delivery method.'); return; }
    setPayment(''); // reset payment if delivery changed
    setStep('payment');
  };

  const handleNextFromPayment = () => {
    setError('');
    if (!payment) { setError('Please select a payment method.'); return; }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;
    if (!user) { setError('You must be logged in.'); return; }
    setIsSubmitting(true);
    setError('');
    const receiptId = generateReceiptId();
    const cost = getEstimatedCost();
    try {
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
        estimatedCost: cost,
        notes: notes.trim(),
        deliveryMethod: delivery,
        paymentMethod: payment,
        receiptId,
        status: 'pending',
        rentedDate: formatDateShort(startDate),
        dueDate: formatDateShort(endDate),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'items', item.id), { availableQuantity: increment(-1) });
      setReceiptData({
        receiptId,
        itemName: item.name,
        itemCategory: item.category,
        startDate,
        endDate,
        days: getDayCount(),
        cost,
        delivery: getDeliveryLabel(),
        payment: getPaymentLabel(),
        userEmail: user.email,
        submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      });
      setStep('receipt');
    } catch (err: any) {
      setError(err.message ?? 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '10px 14px',
    border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
    color: '#111827', background: '#fff', outline: 'none', fontFamily: 'inherit',
  };

  const STEPS: Step[] = ['dates', 'delivery', 'payment', 'confirm'];
  const stepIdx = STEPS.indexOf(step);
  const progress = step === 'receipt' ? 100 : ((stepIdx + 1) / STEPS.length) * 100;

  const OptionCard = ({
    id, label, desc, Icon, color, bg, border, selected, onClick,
  }: {
    id: string; label: string; desc: string; Icon: any;
    color: string; bg: string; border: string;
    selected: boolean; onClick: () => void;
  }) => (
    <button onClick={onClick} type="button"
      style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 12, border: `2px solid ${selected ? color : '#e5e7eb'}`, background: selected ? bg : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: selected ? color : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
        <Icon style={{ width: 18, height: 18, color: selected ? '#fff' : '#9ca3af' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: selected ? color : '#111827', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{desc}</div>
      </div>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selected ? color : '#d1d5db'}`, background: selected ? color : '#fff', flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {selected && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </button>
  );

  // ── RECEIPT SCREEN ──
  if (step === 'receipt' && receiptData) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
          {/* Receipt header */}
          <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '28px 28px 24px', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle style={{ width: 34, height: 34, color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Request Submitted!</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Awaiting staff/admin approval</p>
          </div>

          {/* Receipt body */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: 'calc(90vh - 160px)' }}>
            {/* Receipt ID */}
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 10, padding: '10px 14px', textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Transaction Receipt</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', letterSpacing: '0.08em' }}>{receiptData.receiptId}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{receiptData.submittedAt}</div>
            </div>

            {/* Item info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: '#f8fafc', borderRadius: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, background: '#e2e8f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package style={{ width: 18, height: 18, color: '#64748b' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{receiptData.itemName}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{receiptData.itemCategory} · {item.priceLabel}</div>
              </div>
            </div>

            {/* Period + Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar style={{ width: 10, height: 10 }} /> Rental Period
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>{formatDateShort(receiptData.startDate)}</div>
                <div style={{ fontSize: 10, color: '#93c5fd', margin: '1px 0' }}>→</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>{formatDateShort(receiptData.endDate)}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock style={{ width: 10, height: 10 }} /> Duration
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{receiptData.days}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>day{receiptData.days !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Delivery + Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '10px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Truck style={{ width: 10, height: 10 }} /> Delivery
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#6d28d9' }}>{receiptData.delivery}</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CreditCard style={{ width: 10, height: 10 }} /> Payment
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>{receiptData.payment}</div>
              </div>
            </div>

            {/* Total */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8' }}>Estimated Total</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>₱{receiptData.cost.toFixed(2)}</span>
            </div>

            {/* Pending notice */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 18 }}>
              <Clock style={{ width: 15, height: 15, color: '#b45309', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                Your request is <strong>pending approval</strong>. A staff member or admin will review it shortly. You can track its status under <strong>My Rentals</strong>.
              </p>
            </div>

            <button onClick={onClose}
              style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', padding: '18px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {step !== 'dates' && step !== 'receipt' && (
                <button onClick={() => {
                  if (step === 'delivery') setStep('dates');
                  else if (step === 'payment') setStep('delivery');
                  else if (step === 'confirm') setStep('payment');
                }} style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <ChevronLeft style={{ width: 15, height: 15 }} />
                </button>
              )}
              <div>
                <div style={{ fontSize: 10, color: 'rgba(191,219,254,0.85)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {step === 'dates' ? 'Step 1 of 4 · Rental Dates' :
                   step === 'delivery' ? 'Step 2 of 4 · Delivery Method' :
                   step === 'payment' ? 'Step 3 of 4 · Payment Method' :
                   'Step 4 of 4 · Confirm Order'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{item.name}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Tag style={{ width: 10, height: 10 }} />{item.category}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
              {item.priceLabel}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 4, transition: 'width 0.35s ease' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* ── STEP 1: DATES ── */}
          {step === 'dates' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {(['Start Date', 'End Date'] as const).map((label, i) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Calendar style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af', pointerEvents: 'none' }} />
                      <input type="date"
                        value={i === 0 ? startDate : endDate}
                        min={i === 0 ? today : (startDate || today)}
                        onChange={e => {
                          if (i === 0) { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(''); }
                          else setEndDate(e.target.value);
                        }}
                        style={{ ...inputStyle, paddingLeft: 32 }}
                        onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {getDayCount() > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: '#1d4ed8' }}>
                    <span style={{ fontWeight: 600 }}>{getDayCount()} day{getDayCount() !== 1 ? 's' : ''}</span>
                    <span style={{ color: '#93c5fd', margin: '0 6px' }}>·</span>
                    {formatDateShort(startDate)} → {formatDateShort(endDate)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2563eb' }}>₱{getEstimatedCost().toFixed(2)}</div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Notes <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none' }}>(optional)</span>
                </label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any special requirements..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#3b82f6'; }}
                  onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#e5e7eb'; }} />
              </div>
            </>
          )}

          {/* ── STEP 2: DELIVERY ── */}
          {step === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}>How would you like to receive the item?</p>
              {DELIVERY_OPTIONS.map(opt => (
                <OptionCard key={opt.id} {...opt} selected={delivery === opt.id} onClick={() => setDelivery(opt.id)} />
              ))}
            </div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 4px' }}>How would you like to pay?</p>
              {availablePayments.map(opt => (
                <OptionCard key={opt.id} {...opt} selected={payment === opt.id} onClick={() => setPayment(opt.id)} />
              ))}
            </div>
          )}

          {/* ── STEP 4: CONFIRM ── */}
          {step === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Review your order before submitting.</p>

              {/* Order summary card */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText style={{ width: 14, height: 14, color: '#2563eb' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</span>
                </div>
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <SummaryRow label="Item" value={item.name} />
                  <SummaryRow label="Category" value={item.category} />
                  <SummaryRow label="Period" value={`${formatDate(startDate)} → ${formatDate(endDate)}`} />
                  <SummaryRow label="Duration" value={`${getDayCount()} day${getDayCount() !== 1 ? 's' : ''}`} />
                  <SummaryRow label="Rate" value={item.priceLabel} />
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Estimated Total</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#2563eb' }}>₱{getEstimatedCost().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery + Payment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(() => {
                  const d = DELIVERY_OPTIONS.find(o => o.id === delivery)!;
                  return (
                    <div style={{ background: d.bg, border: `1px solid ${d.border}`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Truck style={{ width: 10, height: 10 }} /> Delivery
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.label}</div>
                    </div>
                  );
                })()}
                {(() => {
                  const p = PAYMENT_OPTIONS.find(o => o.id === payment)!;
                  return (
                    <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CreditCard style={{ width: 10, height: 10 }} /> Payment
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.label}</div>
                    </div>
                  );
                })()}
              </div>

              {notes.trim() && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Your Note</div>
                  <p style={{ fontSize: 13, color: '#78350f', margin: 0 }}>{notes}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px' }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer button */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          {step === 'dates' && (
            <button onClick={handleNextFromDates}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Continue <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          )}
          {step === 'delivery' && (
            <button onClick={handleNextFromDelivery}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: delivery ? '#2563eb' : '#e5e7eb', color: delivery ? '#fff' : '#9ca3af', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: delivery ? 'pointer' : 'not-allowed' }}>
              Continue <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          )}
          {step === 'payment' && (
            <button onClick={handleNextFromPayment}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: payment ? '#2563eb' : '#e5e7eb', color: payment ? '#fff' : '#9ca3af', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: payment ? 'pointer' : 'not-allowed' }}>
              Review Order <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          )}
          {step === 'confirm' && (
            <button onClick={handleSubmit} disabled={isSubmitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              {isSubmitting ? 'Submitting...' : <><CheckCircle style={{ width: 15, height: 15 }} /> Confirm & Submit</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? '#f8fafc' : '#fff', border: '1px solid #f1f5f9', borderRadius: 8, padding: '9px 12px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 12, color: '#6b7280', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', textAlign: 'right' }}>{value}</span>
    </div>
  );
}