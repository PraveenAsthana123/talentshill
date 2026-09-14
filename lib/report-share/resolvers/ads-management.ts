import { registerReportResolver } from '@/lib/report-share/registry';
import { runAdBudgetOptimizationPipeline } from '@/lib/pipelines/ad-budget-optimization-pipeline';

registerReportResolver('ads_management', 'budget_optimization', async () => {
  const result = await runAdBudgetOptimizationPipeline({ triggeredBy: null });
  return {
    title: 'Ad Budget Optimization Report',
    generatedAt: new Date().toISOString(),
    data: {
      scoredCampaigns: result.scoredCampaigns,
      unscoredCampaigns: result.unscoredCampaigns,
      suggestions: result.suggestions,
    },
  };
});
