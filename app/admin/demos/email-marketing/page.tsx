'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function EmailMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Personalized Newsletter Campaign"
      subtitle="Real composition of the existing Campaigns and Email Templates modules."
      sources={[
        { label: 'Campaigns', apiPath: '/api/admin/campaigns/dashboard/' },
        { label: 'Templates', apiPath: '/api/admin/templates/dashboard/' },
      ]}
    />
  );
}
