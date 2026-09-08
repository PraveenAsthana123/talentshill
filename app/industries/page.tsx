import type { Metadata } from 'next';
import { getAllIndustries } from '@/lib/db/admin-queries';
import { SectionHeader } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Industries',
  description: 'Industry-specific AI and analytics solutions for banking, healthcare, real estate, agritech, retail, and manufacturing.',
};

export default function IndustriesPage() {
  const industries = getAllIndustries(true);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Industries" title="Domain Expertise" subtitle="Deep vertical knowledge combined with cutting-edge AI." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-8)' }}>
          {industries.map((ind) => (
            <div key={ind.id} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
              {ind.icon && <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>{ind.icon}</div>}
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>{ind.name}</h3>
              {ind.description && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{ind.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
