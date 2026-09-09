import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Agentic AI',
  description: 'Multi-agent systems and workflow automation, with human approval on consequential actions.',
};

export default function AgenticAiPage() {
  const capabilities = [
    { title: 'Multi-Agent Systems', desc: 'Planner, researcher, executor, and reviewer agents coordinated to complete complex workflows.', icon: '🕸️' },
    { title: 'MCP Integration', desc: 'Connect agents to your business systems via MCP servers, tools, and gateways.', icon: '🔌' },
    { title: 'AI Sales & Marketing Agents', desc: 'Lead qualification, campaign coordination, and follow-up agents built for revenue teams.', icon: '🤖' },
    { title: 'Customer-Service Agents', desc: 'Intent detection, knowledge retrieval, and escalation-aware support automation.', icon: '💬' },
    { title: 'Research Agents', desc: 'Question-driven research, retrieval, reasoning, and source validation for internal or market questions.', icon: '🔎' },
    { title: 'AI Workflow Automation', desc: 'CRM, email, document, and approval workflows automated end-to-end.', icon: '⚙️' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Agentic AI" subtitle="Multi-agent systems and workflow automation, with human approval on consequential actions." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {capabilities.map((cap) => (
            <div key={cap.title} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>{cap.icon}</div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-2)' }}>{cap.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{cap.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 'var(--space-8)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: '640px' }}>
          Agents recommend, humans approve consequential actions, systems execute, results are measured — not autonomous publishing or spending by default.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)', gap: 'var(--space-4)' }}>
          <Link href="/demo"><Button>Book a Demo</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  );
}
