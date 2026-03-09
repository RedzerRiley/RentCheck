import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { ItemCard } from './ItemCard';
import {
  Filter, Grid, List, Package, Search, X,
  Pencil, Trash2, Tag, DollarSign, Hash, FileText, Image,
  Plus, CheckCircle, AlertCircle
} from 'lucide-react';

interface FirestoreItem {
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

interface ItemCatalogProps {
  isPrivileged?: boolean;
}

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const PRICE_UNITS = ['day', 'hour', 'week'];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px',
  border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14,
  outline: 'none', color: '#111827', background: '#fff', fontFamily: 'inherit',
};

function EditItemModal({ item, onClose }: { item: FirestoreItem; onClose: () => void }) {
  const [form, setForm] = useState({ ...item, tagInput: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    if (!form.name?.trim()) { setError('Name is required.'); return; }
    if (!form.category?.trim()) { setError('Category is required.'); return; }
    if (!form.price || form.price <= 0) { setError('Enter a valid price.'); return; }
    setSaving(true); setError('');
    try {
      await updateDoc(doc(db, 'items', item.id), {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        priceUnit: form.priceUnit || 'day',
        priceLabel: `₱${form.price}/${form.priceUnit || 'day'}`,
        quantity: Number(form.quantity) || 1,
        description: form.description || '',
        condition: form.condition || 'Good',
        tags: form.tags || [],
        imageBase64: form.imageBase64 ?? null,
      });
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (e: any) {
      setError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil style={{ width: 15, height: 15, color: '#2563eb' }} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#111827' }}>Edit Item</h3>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Changes save directly to Firestore</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, display: 'flex' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Image */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <Image style={{ width: 12, height: 12 }} /> Photo
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                {form.imageBase64 ? <img src={form.imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package style={{ width: 24, height: 24, color: '#d1d5db' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ padding: '7px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}>Change Photo</button>
                  {form.imageBase64 && <button onClick={() => setForm(p => ({ ...p, imageBase64: null }))} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>Remove</button>}
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>PNG or JPG, max 800KB</span>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  if (file.size > 800 * 1024) { setError('Image must be under 800KB.'); return; }
                  const r = new FileReader(); r.onload = () => setForm(p => ({ ...p, imageBase64: r.result as string })); r.readAsDataURL(file);
                }} />
              </div>
            </div>
          </div>

          {/* Name + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><FileText style={{ width: 12, height: 12 }} /> Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><Tag style={{ width: 12, height: 12 }} /> Category</label>
              <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
          </div>

          {/* Price + Unit + Qty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><DollarSign style={{ width: 12, height: 12 }} /> Price (₱)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Per</label>
              <select value={form.priceUnit} onChange={e => setForm(p => ({ ...p, priceUnit: e.target.value }))} style={inputStyle}>
                {PRICE_UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}><Hash style={{ width: 12, height: 12 }} /> Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} style={inputStyle} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
          </div>

          {/* Condition */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>Condition</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CONDITIONS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, condition: c }))}
                  style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: form.condition === c ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb', background: form.condition === c ? '#eff6ff' : '#fff', color: form.condition === c ? '#2563eb' : '#6b7280' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>Tags</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={form.tagInput} onChange={e => setForm(p => ({ ...p, tagInput: e.target.value }))}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return; e.preventDefault();
                  const t = form.tagInput.trim().toLowerCase();
                  if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t], tagInput: '' }));
                  else setForm(p => ({ ...p, tagInput: '' }));
                }}
                placeholder="Type tag and press Enter" style={{ ...inputStyle, flex: 1 }} onFocus={e => (e.target.style.borderColor = '#3b82f6')} onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
              <button type="button" onClick={() => {
                const t = form.tagInput.trim().toLowerCase();
                if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t], tagInput: '' }));
              }} style={{ padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} /> Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 12, color: '#2563eb' }}>
                    {tag}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: 0, display: 'flex' }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#dc2626' }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle style={{ width: 14, height: 14, color: '#16a34a' }} />
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Saved!</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
            <button onClick={save} disabled={saving} style={{ flex: 2, padding: '11px', background: saving ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItemCatalog({ isPrivileged = false }: ItemCatalogProps) {
  const [items, setItems] = useState<FirestoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editItem, setEditItem] = useState<FirestoreItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreItem)));
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(i => i.category).filter(Boolean)));
    return ['All', ...cats.sort()];
  }, [items]);

  const filtered = useMemo(() => items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.tags?.some(t => t.includes(q));
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchStatus = statusFilter === 'All Status' ? true : statusFilter === 'Available' ? item.availableQuantity > 0 : item.availableQuantity === 0;
    return matchSearch && matchCat && matchStatus;
  }), [items, search, activeCategory, statusFilter]);

  const handleDeleteCategory = async (cat: string) => {
    if (!window.confirm(`Delete ALL items in "${cat}"? This cannot be undone.`)) return;
    await Promise.all(items.filter(i => i.category === cat).map(i => deleteDoc(doc(db, 'items', i.id))));
    if (activeCategory === cat) setActiveCategory('All');
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try { await deleteDoc(doc(db, 'items', deleteTarget.id)); setDeleteTarget(null); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Item Catalog</h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            {loading ? 'Loading...' : search ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${search}"` : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} available`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? '#eff6ff' : 'transparent', color: viewMode === 'grid' ? '#2563eb' : '#6b7280' }}><Grid style={{ width: 18, height: 18 }} /></button>
          <button onClick={() => setViewMode('list')} style={{ padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? '#eff6ff' : 'transparent', color: viewMode === 'list' ? '#2563eb' : '#6b7280' }}><List style={{ width: 18, height: 18 }} /></button>
        </div>
      </div>

      {/* Search + Filters card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px', marginBottom: 22 }}>
        {/* Search bar — fully self-contained, no prop */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="catalog-search" placeholder="Search by name, category, description or tags..."
            style={{ ...inputStyle, paddingLeft: 36, paddingRight: search ? 34 : 12 }}
            onFocus={e => (e.target.style.borderColor = '#3b82f6')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 2 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Filter style={{ width: 14, height: 14, color: '#9ca3af' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Category:</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {categories.map(cat => (
              <div key={cat} style={{ display: 'flex' }}>
                <button onClick={() => setActiveCategory(cat)}
                  style={{ padding: '6px 12px', fontSize: 13, fontWeight: 500, cursor: 'pointer', borderRadius: isPrivileged && cat !== 'All' ? '7px 0 0 7px' : 7, border: activeCategory === cat ? '1px solid #2563eb' : '1px solid #e5e7eb', borderRight: isPrivileged && cat !== 'All' ? 'none' : undefined, background: activeCategory === cat ? '#2563eb' : '#fff', color: activeCategory === cat ? '#fff' : '#374151', transition: 'all 0.15s' }}>
                  {cat}
                </button>
                {isPrivileged && cat !== 'All' && (
                  <button onClick={() => handleDeleteCategory(cat)}
                    title={`Delete all "${cat}" items`}
                    style={{ padding: '6px 7px', fontSize: 13, cursor: 'pointer', borderRadius: '0 7px 7px 0', border: activeCategory === cat ? '1px solid #2563eb' : '1px solid #e5e7eb', borderLeft: 'none', background: activeCategory === cat ? '#1d4ed8' : '#fafafa', color: activeCategory === cat ? 'rgba(255,255,255,0.8)' : '#9ca3af', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#dc2626'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = activeCategory === cat ? '#1d4ed8' : '#fafafa'; (e.currentTarget as HTMLElement).style.color = activeCategory === cat ? 'rgba(255,255,255,0.8)' : '#9ca3af'; }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ marginLeft: 'auto', padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>
            <option>All Status</option>
            <option>Available</option>
            <option>Rented</option>
          </select>
        </div>
      </div>

      {/* Grid / List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
          <Package style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 500 }}>Loading items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9ca3af', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          <Package style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>{items.length === 0 ? 'No items yet' : 'No items match'}</p>
          <p style={{ fontSize: 13, margin: 0 }}>{items.length === 0 ? 'Admin or staff can add items.' : 'Try a different search or filter.'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map(item => <ItemCard key={item.id} item={item} isPrivileged={isPrivileged} onEdit={() => setEditItem(item)} onDelete={() => setDeleteTarget(item)} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(item => <ItemCard key={item.id} item={item} listMode isPrivileged={isPrivileged} onEdit={() => setEditItem(item)} onDelete={() => setDeleteTarget(item)} />)}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div onClick={() => setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: '2rem', maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 52, height: 52, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 style={{ width: 24, height: 24, color: '#dc2626' }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', textAlign: 'center', margin: '0 0 8px' }}>Delete Item?</h3>
            <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', margin: '0 0 22px', lineHeight: 1.6 }}>
              <strong>{deleteTarget.name}</strong> will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '11px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
              <button onClick={handleDeleteItem} disabled={deleteLoading} style={{ flex: 1, padding: '11px', background: deleteLoading ? '#fca5a5' : '#ef4444', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: deleteLoading ? 'not-allowed' : 'pointer', color: '#fff' }}>
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && <EditItemModal item={editItem} onClose={() => setEditItem(null)} />}
    </div>
  );
}