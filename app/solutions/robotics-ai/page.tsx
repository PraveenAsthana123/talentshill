import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionHeader, Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Robotics & AI Solutions',
  description: 'Industrial robotics, autonomous systems, computer vision, and RPA solutions.',
};

export default function RoboticsPage() {
  const capabilities = [
    { title: 'Industrial Robotics', desc: 'Robot arm programming, path planning, force control, and multi-robot coordination for manufacturing.', icon: '🤖' },
    { title: 'Computer Vision', desc: 'Real-time defect detection, object recognition, OCR, and visual inspection at line speed.', icon: '👁️' },
    { title: 'Autonomous Navigation', desc: 'SLAM, path planning, obstacle avoidance, and fleet management for AMRs and AGVs.', icon: '🧭' },
    { title: 'Predictive Maintenance', desc: 'Sensor fusion, anomaly detection, and failure prediction for industrial equipment.', icon: '🔧' },
    { title: 'Digital Twins', desc: 'Virtual replicas of physical systems for simulation, testing, and optimization.', icon: '🪞' },
    { title: 'RPA', desc: 'Robotic Process Automation for back-office workflows, data entry, and document processing.', icon: '⚡' },
  ];

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Solutions" title="Robotics & AI" subtitle="From factory floor to warehouse — intelligent automation at every scale." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {capabilities.map((cap) => (
            <div key={cap.title} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', transition: 'transform 0.3s', cursor: 'default' }}>
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
