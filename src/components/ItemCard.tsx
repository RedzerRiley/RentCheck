import { useState } from 'react';
import { Tag, Package, Pencil, Trash2 } from 'lucide-react';
import { RentRequestModal } from './RentRequestModal';

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string;
  priceLabel: string;
  availableQuantity: number;
  quantity: number;
  description?: string;
  condition?: string;
  tags?: string[]
  imageBase64?: string | null;
}

interface ItemCardProps {
  item: Item;
  listMode?: boolean;
  isPrivileged: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemCard({ item, listMode = false, isPrivileged, onEdit, onDelete }: ItemCardProps) {
  const [showModal, setShowModal] = useState(false);
  const isAvailable = item.availableQuantity > 0;

  const AdminButtons = () =>
    isPrivileged ? (
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          title="Edit item"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', color: '#2563eb', flexShrink: 0 }}
        >
          <Pencil style={{ width: 14, height: 14 }} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Delete item"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}
        >
          <Trash2 style={{ width: 14, height: 14 }} />
        </button>
      </div>
    ) : null;

  if (listMode) {
    return (
      <>
        <div
          style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.imageBase64
              ? <img src={item.imageBase64} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package style={{ width: 24, height: 24, color: '#d1d5db' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{item.name}</span>
              <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: isAvailable ? '#dcfce7' : '#fee2e2', color: isAvailable ? '#16a34a' : '#dc2626' }}>
                {isAvailable ? `${item.availableQuantity} available` : 'Rented out'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
              <Tag style={{ width: 12, height: 12 }} /> {item.category}
              {item.condition && <><span style={{ color: '#d1d5db' }}>·</span>{item.condition}</>}
            </div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', flexShrink: 0, marginRight: 8 }}>{item.priceLabel}</div>
          <AdminButtons />
          <button
            onClick={() => isAvailable && setShowModal(true)}
            disabled={!isAvailable}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: isAvailable ? 'pointer' : 'not-allowed', background: isAvailable ? '#2563eb' : '#e5e7eb', color: isAvailable ? '#fff' : '#9ca3af', flexShrink: 0 }}
          >
            {isAvailable ? 'Rent Now' : 'Unavailable'}
          </button>
        </div>
        {showModal && <RentRequestModal item={item} onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow" style={{ position: 'relative' }}>
        {isPrivileged && (
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 5 }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              title="Edit"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.92)', border: '1px solid #bfdbfe', borderRadius: 7, cursor: 'pointer', color: '#2563eb' }}
            >
              <Pencil style={{ width: 13, height: 13 }} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              title="Delete"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.92)', border: '1px solid #fecaca', borderRadius: 7, cursor: 'pointer', color: '#dc2626' }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          </div>
        )}

        <div style={{ height: 180, background: '#f3f4f6', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.imageBase64
            ? <img src={item.imageBase64} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Package style={{ width: 40, height: 40, color: '#d1d5db' }} />}
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: isAvailable ? '#dcfce7' : '#fee2e2', color: isAvailable ? '#16a34a' : '#dc2626' }}>
              {isAvailable ? 'Available' : 'Rented'}
            </span>
          </div>
          {item.condition && (
            <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
              <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                {item.condition}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{item.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            <Tag style={{ width: 13, height: 13 }} /> {item.category}
          </div>
          {item.description && (
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
              {item.description}
            </p>
          )}
          {item.tags && item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ padding: '2px 8px', background: '#f3f4f6', borderRadius: 20, fontSize: 11, color: '#6b7280' }}>#{tag}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#2563eb' }}>{item.priceLabel}</div>
              {item.availableQuantity > 1 && (
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.availableQuantity} of {item.quantity} available</div>
              )}
            </div>
            <button
              onClick={() => isAvailable && setShowModal(true)}
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isAvailable ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {isAvailable ? 'Rent Now' : 'Unavailable'}
            </button>
          </div>
        </div>
      </div>
      {showModal && <RentRequestModal item={item} onClose={() => setShowModal(false)} />}
    </>
  );
}