import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Enterprise RAG',
  description: 'Retrieval-augmented generation grounded in your own enterprise knowledge, evaluated for quality.',
};

export default function EnterpriseRagPage() {
  const capabilities = [
    { title: 'Enterprise Knowledge Assistant', desc: 'Ask questions across company documents, grounded in your real source material.', icon: '📚' },
    { title: 'Document Repository Integration', desc: 'Connect existing repositories (SharePoint, Drive, wikis) into a governed retrieval layer.', icon: '🗂️' },
    { title: 'Multimodal RAG', desc: 'Retrieval across PDF, image, audio, video, and tabular sources, not just plain text.', icon: '🧩' },
    { title: 'GraphRAG', desc: 'Relationship-aware retrieval for research and knowledge that spans connected entities.', icon: '🕸️' },
    { title: 'Secure RAG', desc: 'RBAC/ABAC and document-level authorization so retrieval respects who is allowed to see what.', icon: '🔒' },
    { title: 'RAG Evaluation & Optimization', desc: 'Retrieval precision/recall, faithfulness, groundedness, hallucination rate, latency, and cost — measured, not assumed.', icon: '📏' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Enterprise RAG" subtitle="Retrieval-augmented generation grounded in your own enterprise knowledge, evaluated for quality." />
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
          We also offer RAG Modernization for organizations that already have a RAG prototype but need it evaluated and hardened for production.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-8)', gap: 'var(--space-4)' }}>
          <Link href="/demo"><Button>Book a Demo</Button></Link>
          <Link href="/contact"><Button variant="outline">Contact Us</Button></Link>
        </div>
      </div>
    </div>
  );
}
