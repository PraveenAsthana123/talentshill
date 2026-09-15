'use client';
import GenericKpiDashboard from '@/components/demos/GenericKpiDashboard';

export default function MarketResearchDemoPage() {
  return (
    <GenericKpiDashboard
      title="Demo — AI Market Intelligence Workspace"
      subtitle="Real composition of the existing Market Research module (briefs, Ollama synthesis, opportunity scoring). Distinct from the source conversation's separate 90-item research-methodology catalog, which is not built."
      sources={[{ label: 'Market Research', apiPath: '/api/admin/market-research/dashboard/' }]}
    />
  );
}
