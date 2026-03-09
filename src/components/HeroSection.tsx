import { Package, ClipboardList, ShieldCheck, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)', padding: '52px 0 44px' }}>
      <div className="container mx-auto px-4">

        {/* Top row: headline + sub */}
        <div style={{ maxWidth: 680, marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 20, padding: '4px 14px', marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#bfdbfe', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Rental Management System</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: '#fff', lineHeight: 1.2, margin: '0 0 14px', letterSpacing: '-0.5px' }}>
            Everything you need to<br />
            <span style={{ color: '#93c5fd' }}>manage rentals</span>, in one place.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
            Browse available items, submit rental requests, and track their status — all from a single dashboard.
          </p>
        </div>

        {/* Feature pills row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
          {[
            { icon: Package,       label: 'Catalog of rental items' },
            { icon: ClipboardList, label: 'Track your active rentals' },
            { icon: ShieldCheck,   label: 'Staff-verified approvals' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 24, padding: '7px 16px' }}>
              <Icon style={{ width: 15, height: 15, color: '#93c5fd' }} />
              <span style={{ fontSize: 13, color: '#e0f2fe', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.0)', padding: '7px 4px' }}>
            <ArrowRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, maxWidth: 560 }}>
          {[
            { value: '500+',  label: 'Items available',    accent: '#60a5fa' },
            { value: '1,200+', label: 'Rentals processed', accent: '#34d399' },
            { value: '98%',   label: 'Return rate',        accent: '#f472b6' },
          ].map(({ value, label, accent }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: accent, marginBottom: 4, letterSpacing: '-0.5px' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}