'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function YoutubeMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Channel Growth Engine"
      subtitle="Real composition of the existing YouTube module (per-video tracking, channel snapshots). No YouTube Data API integration exists — real, manually-entered data only."
      sources={[{ label: 'YouTube', apiPath: '/api/admin/youtube/dashboard/' }]}
    />
  );
}
