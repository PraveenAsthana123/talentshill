'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function ConversationalMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Website Sales Assistant"
      subtitle="Real composition of the existing Live Chat module (sessions, requests, qualification tiers)."
      sources={[{ label: 'Chat', apiPath: '/api/admin/chat/dashboard/' }]}
    />
  );
}
