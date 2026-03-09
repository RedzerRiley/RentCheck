import { useState, useRef } from 'react';
import { Package, ArrowLeft, Upload, X, Plus, Tag, DollarSign, Hash, FileText, Image, CheckCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

interface AddItemProps {
  onBack?: () => void;
}

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const PRICE_UNITS = ['day', 'hour', 'week'];

export function AddItem({ onBack }: AddItemProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('day');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Good');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addedName, setAddedName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const finalCategory = category === '__custom__' ? customCategory.trim() : category;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) { setError('Image must be under 800KB (stored in Firestore).'); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Item name is required.'); return; }
    if (!finalCategory) { setError('Please select or enter a category.'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Please enter a valid price.'); return; }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'items'), {
        name: name.trim(),
        category: finalCategory,
        price: Number(price),
        priceUnit,
        priceLabel: `₱${price}/${priceUnit}`,
        quantity,
        availableQuantity: quantity,
        description: description.trim(),
        condition,
        tags,
        imageBase64: imagePreview || null,
        status: 'available',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || '',
      });
      setAddedName(name.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to add item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false); setName(''); setCategory(''); setCustomCategory('');
    setPrice(''); setDescription(''); setTags([]); setImagePreview(null);
    setQuantity(1); setCondition('Good'); setError('');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '11px 14px',
    border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff',
    color: '#111827', fontSize: 14, outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151',
    marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
          <div style={{ width: 72, height: 72, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle style={{ width: 36, height: 36, color: '#16a34a' }} />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Item Added!</h2>
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 28 }}>
            <strong>{addedName}</strong> has been added to the catalog.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={resetForm} style={{ padding: '11px 24px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Add Another
            </button>
            <button onClick={onBack} style={{ padding: '11px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Back to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'inherit' }}>
      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14, padding: 0 }}>
              <ArrowLeft style={{ width: 16, height: 16 }} /> Back
            </button>
            <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: 17, height: 17, color: '#fff' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#111827', letterSpacing: '0.05em' }}>RENTCHECK</span>
            </div>
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af' }}>New Item</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Add New Item</h1>
          <p style={{ color: '#6b7280', fontSize: 15 }}>Fill in the details to list a new item in the catalog.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Basic Info */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <FileText style={{ width: 16, height: 16, color: '#2563eb' }} />
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Basic Information</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Item Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Professional Camera" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
                </div>

                {/* Category — free text, no fixed list */}
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Category</label>
                  <input type="text" value={finalCategory === category && category !== '__custom__' ? category : customCategory}
                    onChange={e => { setCategory('__custom__'); setCustomCategory(e.target.value); }}
                    placeholder="Type any category, e.g. Electronics, Tools, Sports..."
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>Enter any category name — it will appear as a filter in the catalog.</p>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the item, what's included, usage notes..." rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <DollarSign style={{ width: 16, height: 16, color: '#2563eb' }} />
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Pricing & Stock</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Price (₱)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>₱</span>
                      <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                        style={{ ...inputStyle, paddingLeft: 26 }}
                        onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Per</label>
                    <select value={priceUnit} onChange={e => setPriceUnit(e.target.value)} style={inputStyle}>
                      {PRICE_UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: 38, height: 42, background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: 18, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#111827' }}>{quantity}</span>
                      <button type="button" onClick={() => setQuantity(quantity + 1)}
                        style={{ width: 38, height: 42, background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: 18, color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Tag style={{ width: 16, height: 16, color: '#2563eb' }} />
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Tags</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Type a tag and press Enter" style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={addTag}
                    style={{ padding: '11px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                    <Plus style={{ width: 14, height: 14 }} /> Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map(tag => (
                      <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, fontSize: 12, color: '#2563eb', fontWeight: 500 }}>
                        {tag}
                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', padding: 0, display: 'flex' }}>
                          <X style={{ width: 12, height: 12 }} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Image */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Image style={{ width: 16, height: 16, color: '#2563eb' }} />
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Item Photo</span>
                </div>
                {imagePreview ? (
                  <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                    <button type="button" onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width: '100%', height: 160, background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#9ca3af' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#93c5fd')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#d1d5db')}>
                    <Upload style={{ width: 24, height: 24 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Click to upload photo</span>
                    <span style={{ fontSize: 11 }}>PNG, JPG — max 800KB</span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>

              {/* Condition */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Hash style={{ width: 16, height: 16, color: '#2563eb' }} />
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Condition</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CONDITIONS.map(c => (
                    <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: condition === c ? '1.5px solid #2563eb' : '1.5px solid #e5e7eb', background: condition === c ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
                      <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)} style={{ accentColor: '#2563eb' }} />
                      <span style={{ fontSize: 14, fontWeight: 500, color: condition === c ? '#2563eb' : '#374151' }}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</span>
                <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 10, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
                  <div style={{ height: 80, background: imagePreview ? 'none' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {imagePreview ? <img src={imagePreview} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} /> : <Package style={{ width: 28, height: 28, color: '#9ca3af' }} />}
                    <span style={{ position: 'absolute', top: 6, right: 6, padding: '3px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontSize: 10, fontWeight: 600 }}>Available</span>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 3 }}>{name || 'Item Name'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{finalCategory || 'Category'}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}>{price ? `₱${price}/${priceUnit}` : '₱0/day'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginTop: 20 }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
            <button type="button" onClick={onBack} style={{ padding: '12px 24px', background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              style={{ padding: '12px 28px', background: isLoading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {isLoading ? 'Saving...' : <><Plus style={{ width: 15, height: 15 }} /> Add Item</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}