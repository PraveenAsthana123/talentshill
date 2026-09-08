import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Market Research',
  description: 'Competitive intelligence, audience research, and market sizing to ground strategy in evidence.',
};

export default function MarketResearchPage() {
  const capabilities = [
    { title: 'Competitive Intelligence', desc: 'Structured tracking of competitor positioning, pricing, messaging, and market moves.', icon: '🕵️' },
    { title: 'Audience Segmentation', desc: 'Behavioral and demographic segmentation to identify and prioritize target audiences.', icon: '👥' },
    { title: 'Survey Design & Analysis', desc: 'Primary research instrument design, fielding, and statistical analysis.', icon: '📋' },
    { title: 'Market Sizing (TAM/SAM/SOM)', desc: 'Total addressable market analysis grounded in real data sources, not assumption.', icon: '📐' },
    { title: 'Trend & Sentiment Analysis', desc: 'Ongoing monitoring of market and category trends, and customer sentiment signals.', icon: '📉' },
    { title: 'Voice-of-Customer Research', desc: 'Structured interview and feedback programs to surface real customer needs.', icon: '💬' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Market Research" subtitle="Competitive intelligence, audience research, and market sizing to ground strategy in evidence." />
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
