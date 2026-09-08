import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AI Strategy',
  description: 'AI readiness, roadmap, and governance advisory for enterprises adopting AI.',
};

export default function AiStrategyPage() {
  const capabilities = [
    { title: 'AI Readiness Assessment', desc: 'Evaluation of data, infrastructure, and organizational readiness for AI adoption.', icon: '🧭' },
    { title: 'Roadmap & Use-Case Prioritization', desc: 'Structured prioritization of AI use cases by feasibility and business impact.', icon: '🗺️' },
    { title: 'Responsible AI Governance', desc: 'Governance frameworks covering explainability, fairness, and risk management.', icon: '🛡️' },
    { title: 'Build-vs-Buy Strategy', desc: 'Technology and vendor evaluation to decide what to build, buy, or integrate.', icon: '⚖️' },
    { title: 'AI Center of Excellence Setup', desc: 'Operating model, roles, and processes for scaling AI initiatives across the org.', icon: '🏛️' },
    { title: 'Change Management for AI Adoption', desc: 'Structured programs to build organizational capability and adoption.', icon: '🔄' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="AI Strategy" subtitle="AI readiness, roadmap, and governance advisory for enterprises adopting AI." />
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
