import { useState } from 'react';
import { Package, X, Send, CheckCircle, Mail, MessageSquare } from 'lucide-react';

export function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) return;
    setSending(true);
    // Simulate send — replace with your actual email/Firestore logic
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
  };

  const closeModal = () => {
    setShowContact(false);
    setTimeout(() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }, 300);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', background: '#1e293b',
    border: '1px solid #334155', borderRadius: 8,
    fontSize: 14, color: '#f1f5f9', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.2s',
  };

  return (
    <>
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', marginTop: 64, fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start', paddingBottom: 40, borderBottom: '1px solid #1e293b' }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package style={{ width: 18, height: 18, color: '#fff' }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.3px' }}>RENTCHECK</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, maxWidth: 340, margin: 0 }}>
                Simplifying rental management and item tracking — built for communities that trust each other.
              </p>
            </div>

            {/* Contact button */}
            <div style={{ paddingTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Need help?</p>
              <button
                onClick={() => setShowContact(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#1e293b', border: '1px solid #334155', borderRadius: 10, color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2563eb'; (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1e293b'; (e.currentTarget as HTMLElement).style.borderColor = '#334155'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                <MessageSquare style={{ width: 15, height: 15 }} />
                Contact Admin / Staff
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#334155' }}>© 2026 RENTCHECK. All rights reserved.</span>
            <span style={{ fontSize: 12, color: '#1e3a5f' }}>Item Rental & Tracking</span>
          </div>
        </div>
      </footer>

      {/* ── CONTACT MODAL ── */}
      {showContact && (
        <>
          <div onClick={closeModal}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />

          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', maxWidth: 460, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', zIndex: 201, overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail style={{ width: 16, height: 16, color: '#fff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Contact Admin / Staff</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>We'll get back to you as soon as possible</div>
                </div>
              </div>
              <button onClick={closeModal}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '6px', cursor: 'pointer', display: 'flex' }}>
                <X style={{ width: 15, height: 15, color: '#64748b' }} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '22px 24px 24px' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <div style={{ width: 56, height: 56, background: '#ecfdf5', border: '2px solid #6ee7b7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle style={{ width: 26, height: 26, color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Message Sent!</div>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
                    Thanks for reaching out. An admin or staff member will follow up with you shortly.
                  </div>
                  <button onClick={closeModal}
                    style={{ padding: '10px 28px', background: '#2563eb', border: 'none', borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Name *</label>
                      <input
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your name"
                        style={inputStyle}
                        onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
                        onBlur={e => (e.target as HTMLElement).style.borderColor = '#334155'}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        style={inputStyle}
                        onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
                        onBlur={e => (e.target as HTMLElement).style.borderColor = '#334155'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Subject</label>
                    <input
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      placeholder="What's this about?"
                      style={inputStyle}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = '#334155'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Message *</label>
                    <textarea
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="Describe your issue or question..."
                      rows={4}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = '#2563eb'}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = '#334155'}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={sending || !formData.name || !formData.email || !formData.message}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: (sending || !formData.name || !formData.email || !formData.message) ? '#1e293b' : '#2563eb', border: 'none', borderRadius: 10, color: (sending || !formData.name || !formData.email || !formData.message) ? '#475569' : '#fff', fontSize: 14, fontWeight: 600, cursor: (sending || !formData.name || !formData.email || !formData.message) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: 2 }}>
                    <Send style={{ width: 15, height: 15 }} />
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}