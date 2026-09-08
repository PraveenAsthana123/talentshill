import type { Metadata } from 'next';
import Link from 'next/link';
import { DEMO_ITEMS } from '@/lib/constants';
import { SectionHeader } from '@/components/ui';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { DemoForm } from '@/features/forms';

export const metadata: Metadata = {
  title: 'Demos',
  description: 'Explore interactive demos of our AI, Robotics, and Quantum solutions.',
};

export default function DemoPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Interactive Demos" title="See It in Action" subtitle="Explore our solutions through interactive demonstrations." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-16)' }}>
          {DEMO_ITEMS.map((demo) => (
            <div key={demo.id} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', transition: 'transform 0.3s' }}>
              <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--color-surface-lighter), var(--color-surface))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-4xl)' }}>
                {demo.category === 'Generative AI' ? '🤖' : demo.category === 'Robotics' ? '⚙️' : '🔮'}
              </div>
              <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', flex: 1 }}>{demo.title}</h3>
                  <Badge variant={demo.status === 'live' ? 'success' : demo.status === 'beta' ? 'warning' : 'default'}>
                    {demo.status}
                  </Badge>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{demo.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {demo.tags.map((t) => <Badge key={t} variant="accent">{t}</Badge>)}
                </div>
                <Button variant="outline" size="sm" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}>
                  {demo.status === 'live' ? 'Try Demo' : 'Request Access'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div id="book-demo" style={{ textAlign: 'center' }}>
          <SectionHeader label="Ready for More?" title="Book a Personalized Session" subtitle="Get a tailored walkthrough with our engineering team. Choose your service, pick a time, and let us prepare the perfect demo for you." />
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-12)' }}>
            <Link href="/book">
              <Button size="lg">Book an Appointment</Button>
            </Link>
          </div>

          <SectionHeader label="Quick Request" title="Or Submit a Quick Demo Request" subtitle="Prefer a simpler form? Fill out the basics and we will reach out to schedule." />
          <div style={{ maxWidth: '700px', margin: '0 auto', background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
            <DemoForm />
          </div>
        </div>
      </div>
    </div>
  );
}
