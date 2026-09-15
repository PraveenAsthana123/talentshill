'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function CompetitiveIntelligenceDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — Competitor Campaign Monitor"
      subtitle="Real composition of the existing Competitor Analysis module plus the real 8-dimension Competitor Benchmark Engine (numeric head-to-head scoring)."
      sources={[{ label: 'Competitor Analysis', apiPath: '/api/admin/competitor-analysis/dashboard/' }]}
    />
  );
}
