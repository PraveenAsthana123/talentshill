import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'SEO & GEO',
  description: 'Search engine optimization plus generative-engine optimization for visibility in AI answer engines.',
};

export default function SeoGeoPage() {
  const capabilities = [
    { title: 'Technical SEO Audits', desc: 'Crawlability, indexation, site speed, and structured-data audits with prioritized fixes.', icon: '🔧' },
    { title: 'On-Page & Content Optimization', desc: 'Keyword-mapped content optimization aligned to real search intent.', icon: '📄' },
    { title: 'Generative Engine Optimization', desc: 'Optimizing content structure and sourcing for visibility in AI answer engines like ChatGPT, Perplexity, and Google AI Overviews.', icon: '🤖' },
    { title: 'Local & International SEO', desc: 'Multi-location and multi-market SEO, including hreflang and local listing management.', icon: '🌍' },
    { title: 'Link Building & Digital PR', desc: 'Earned-media and outreach programs to build authoritative backlink profiles.', icon: '🔗' },
    { title: 'Search Analytics & Rank Tracking', desc: 'Ongoing visibility tracking across traditional and AI-driven search surfaces.', icon: '📊' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="SEO & GEO" subtitle="Search engine optimization plus generative-engine optimization for visibility in AI answer engines." />
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
