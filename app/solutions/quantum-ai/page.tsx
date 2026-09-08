import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Quantum AI Solutions',
  description: 'Quantum optimization, quantum machine learning, and post-quantum cryptography consulting.',
};

export default function QuantumPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Quantum AI" subtitle="Exploring the frontier of quantum computing for enterprise advantage." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {[
            { title: 'Quantum Optimization', desc: 'QAOA and VQE algorithms for portfolio optimization, supply chain routing, and resource allocation.', icon: '🔮' },
            { title: 'Quantum ML', desc: 'Quantum kernel methods, quantum neural networks, and hybrid quantum-classical models.', icon: '🧬' },
            { title: 'Post-Quantum Cryptography', desc: 'Preparing your security infrastructure for the quantum era with lattice-based and hash-based schemes.', icon: '🔐' },
          ].map((cap) => (
            <div key={cap.title} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
              <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-4)' }}>{cap.icon}</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>{cap.title}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{cap.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-12)', gap: 'var(--space-4)' }}>
          <Link href="/demo"><Button>Explore Demo</Button></Link>
          <Link href="/contact"><Button variant="outline">Talk to an Expert</Button></Link>
        </div>
      </div>
    </div>
  );
}
