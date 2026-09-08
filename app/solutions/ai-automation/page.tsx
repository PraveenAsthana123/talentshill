import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AI Automation',
  description: 'AI-driven automation for marketing operations, lead handling, and reporting.',
};

export default function AiAutomationPage() {
  const capabilities = [
    { title: 'Marketing Workflow Automation', desc: 'End-to-end automation of campaign operations, approvals, and asset handoffs.', icon: '⚙️' },
    { title: 'AI Lead Scoring & Routing', desc: 'Model-driven lead scoring and routing rules that adapt to real conversion signals.', icon: '🎯' },
    { title: 'Automated Content & Personalization', desc: 'AI-assisted content generation and dynamic personalization at scale.', icon: '✍️' },
    { title: 'Conversational Automation', desc: 'Chatbot and voice automation for support, qualification, and scheduling.', icon: '💬' },
    { title: 'RPA for Marketing Ops', desc: 'Robotic process automation for repetitive back-office marketing operations.', icon: '🤖' },
    { title: 'Automated Reporting & Alerting', desc: 'Scheduled, anomaly-aware reporting that surfaces issues before they compound.', icon: '🔔' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="AI Automation" subtitle="AI-driven automation for marketing operations, lead handling, and reporting." />
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
