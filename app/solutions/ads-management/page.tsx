import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Ads Management',
  description: 'Paid search, paid social, and programmatic advertising, managed end-to-end.',
};

export default function AdsManagementPage() {
  const capabilities = [
    { title: 'Paid Search', desc: 'Google Ads and Bing Ads campaign strategy, keyword architecture, and bid management.', icon: '🔍' },
    { title: 'Paid Social', desc: 'Meta, LinkedIn, and TikTok Ads campaign build, audience targeting, and creative testing.', icon: '📱' },
    { title: 'Programmatic & Retargeting', desc: 'Display and video programmatic buying with cross-device retargeting.', icon: '🎯' },
    { title: 'Budget Optimization', desc: 'Cross-channel budget allocation based on real performance data, not fixed splits.', icon: '💰' },
    { title: 'Creative A/B Testing', desc: 'Structured creative and copy testing to identify what actually drives conversions.', icon: '🧪' },
    { title: 'Cross-Platform Ad Analytics', desc: 'Unified reporting across ad platforms, tied back to real conversion and revenue data.', icon: '📈' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Ads Management" subtitle="Paid search, paid social, and programmatic advertising, managed end-to-end." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {capabilities.map((cap) => (
            <div key={cap.title} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>{cap.icon}</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{cap.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{cap.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-12)', gap: 'var(--space-4)' }}>
          <Link href="/demo"><Button>Book a Demo</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  );
}
