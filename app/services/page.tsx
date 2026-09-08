import type { Metadata } from 'next';
import { getAllServices } from '@/lib/db/admin-queries';
import { SectionHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Analytics, AI, Robotics, IoT, and Quantum consulting services from Talents Hill.',
};

export default function ServicesPage() {
  const services = getAllServices(true);

  // Group services by category
  const grouped = services.reduce<Record<string, typeof services>>((acc, svc) => {
    const cat = svc.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(svc);
    return acc;
  }, {});

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Our Services" title="What We Deliver" subtitle="End-to-end enterprise solutions across analytics, AI, robotics, and emerging technologies." />
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 'var(--space-12)' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-accent)', marginBottom: 'var(--space-6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
              {items.map((svc) => (
                <div key={svc.id} id={svc.slug} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
                  <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>{svc.name}</h4>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-4)' }}>{svc.shortDesc || svc.longDesc || ''}</p>
                  {svc.useCases.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                      {svc.useCases.map((uc) => (
                        <span key={uc} style={{ padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-xs)', background: 'rgba(8,145,178,0.1)', color: 'var(--color-accent-light)', borderRadius: 'var(--radius-full)' }}>{uc}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
