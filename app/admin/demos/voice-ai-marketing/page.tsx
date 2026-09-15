'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function VoiceAiMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Inbound/Outbound Lead Qualification (Voice)"
      subtitle="Real composition of the existing Voice AI module (assets, calls, qualification tiers)."
      sources={[{ label: 'Voice AI', apiPath: '/api/admin/voice-ai/dashboard/' }]}
    />
  );
}
