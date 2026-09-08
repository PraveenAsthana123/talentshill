import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Generative AI Solutions',
  description: 'Custom LLM solutions, RAG pipelines, AI copilots, and conversational AI for enterprises.',
};

export default function GenAIPage() {
  const capabilities = [
    { title: 'RAG Pipelines', desc: 'Document ingestion, semantic chunking, vector search, and retrieval-augmented generation for enterprise knowledge.', icon: '📚' },
    { title: 'AI Copilots', desc: 'Domain-specific AI assistants for customer service, code review, document analysis, and decision support.', icon: '🤝' },
    { title: 'LLM Fine-tuning', desc: 'Custom model training on your data with RLHF, LoRA, and domain adaptation techniques.', icon: '🎯' },
    { title: 'Conversational AI', desc: 'Multi-turn chatbots with context memory, tool use, and enterprise system integration.', icon: '💬' },
    { title: 'Document Intelligence', desc: 'Automated extraction, summarization, classification, and Q&A over enterprise documents.', icon: '📄' },
    { title: 'AI Safety & Guardrails', desc: 'Prompt injection protection, content filtering, bias detection, and responsible AI practices.', icon: '🛡️' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Generative AI" subtitle="Production-grade GenAI solutions from RAG pipelines to enterprise AI copilots." />
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
