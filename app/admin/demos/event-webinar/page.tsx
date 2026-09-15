'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function EventWebinarDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Webinar-to-Pipeline Engine"
      subtitle="Real composition of the existing Appointments module."
      sources={[{ label: 'Appointments', apiPath: '/api/admin/appointments/dashboard/' }]}
    />
  );
}
