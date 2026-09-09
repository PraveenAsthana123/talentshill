import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Influencer, Video & Viral Growth',
  description: 'Creator partnerships, short-form video production, and trend-driven content growth.',
};

export default function CreatorVideoMarketingPage() {
  const capabilities = [
    { title: 'Influencer Discovery & Outreach', desc: 'Find and engage creators by niche, geography, audience quality, and brand fit.', icon: '🔍' },
    { title: 'Campaign Management', desc: 'Brief, creator selection, approval, publishing, and performance tracking in one workflow.', icon: '📋' },
    { title: 'UGC & Short-Form Video', desc: 'Product demos, testimonials, and Reels/Shorts/TikTok-style content production.', icon: '🎬' },
    { title: 'AI Video Production', desc: 'Script, storyboard, video, voice, and captions, produced with a generative video workflow.', icon: '🎥' },
    { title: 'Viral Content Strategy', desc: 'Trend detection and rapid creative experimentation — optimizing for reach, not guaranteeing virality.', icon: '📈' },
    { title: 'Creator Analytics', desc: 'Views, engagement, leads, and revenue attribution tied back to specific creators and content.', icon: '📊' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Influencer, Video & Viral Growth" subtitle="Creator partnerships, short-form video production, and trend-driven content growth." />
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
