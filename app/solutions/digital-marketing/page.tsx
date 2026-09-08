import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Digital Marketing Solutions',
  description: 'Full-funnel digital marketing strategy, execution, and measurement for enterprises.',
};

export default function DigitalMarketingPage() {
  const capabilities = [
    { title: 'Multi-Channel Campaigns', desc: 'Coordinated campaign planning and execution across email, social, search, and display.', icon: '📣' },
    { title: 'Marketing Automation', desc: 'Lifecycle journeys, lead nurturing, and triggered messaging built on your CRM and marketing stack.', icon: '⚙️' },
    { title: 'Content Strategy & Distribution', desc: 'Editorial planning, content production, and distribution mapped to funnel stage and audience.', icon: '📝' },
    { title: 'Brand & Creative Development', desc: 'Brand positioning, messaging frameworks, and creative production for campaigns and channels.', icon: '🎨' },
    { title: 'Marketing Analytics & Attribution', desc: 'Cross-channel reporting, multi-touch attribution, and dashboards tied to real pipeline and revenue.', icon: '📊' },
    { title: 'CRM & Lifecycle Marketing', desc: 'Segmentation, lifecycle stages, and retention programs built on real customer data.', icon: '🔄' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Digital Marketing" subtitle="Full-funnel digital marketing strategy, execution, and measurement -- from brand to pipeline." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {capabilities.map((cap) => (
            <div key={cap.title} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>{cap.icon}</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{cap.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{cap.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
          <Link href="/solutions/ads-management"><Button variant="outline">Ads Management</Button></Link>
          <Link href="/solutions/market-research"><Button variant="outline">Market Research</Button></Link>
          <Link href="/solutions/performance-marketing"><Button variant="outline">Performance Marketing</Button></Link>
          <Link href="/solutions/seo-geo"><Button variant="outline">SEO & GEO</Button></Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)', gap: 'var(--space-4)' }}>
          <Link href="/demo"><Button>Book a Demo</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  );
}
