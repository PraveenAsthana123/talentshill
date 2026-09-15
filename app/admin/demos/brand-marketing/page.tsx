'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function BrandMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Brand Perception Dashboard"
      subtitle="Real composition of the existing Branding module (assets, mentions, health snapshots)."
      sources={[{ label: 'Branding', apiPath: '/api/admin/branding/dashboard/' }]}
    />
  );
}
