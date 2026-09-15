'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function SmsWhatsappDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — Event-Triggered Re-Engagement (SMS/WhatsApp)"
      subtitle="Real composition of the existing Broadcasts module (messages, re-engagement triggers, at-risk contacts)."
      sources={[{ label: 'Broadcasts', apiPath: '/api/admin/broadcasts/dashboard/' }]}
    />
  );
}
