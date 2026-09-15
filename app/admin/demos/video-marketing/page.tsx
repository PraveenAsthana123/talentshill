'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function VideoMarketingDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — Long-Form-to-Multi-Channel Video Factory"
      subtitle="Real composition of the existing Video Editing and Videos modules, plus the real Ollama-backed Video Script Generation Engine. Rendering/transcode remains a disclosed gap."
      sources={[
        { label: 'Video Editing', apiPath: '/api/admin/video-editing/dashboard/' },
        { label: 'Videos', apiPath: '/api/admin/videos/dashboard/' },
      ]}
    />
  );
}
