import { registerReportResolver } from '@/lib/report-share/registry';
import { runContentPerformancePipeline } from '@/lib/pipelines/content-performance-pipeline';

registerReportResolver('content', 'performance_summary', async () => {
  const result = await runContentPerformancePipeline({ triggeredBy: null });
  return {
    title: 'Content Performance Report',
    generatedAt: new Date().toISOString(),
    data: {
      scoredContent: result.scoredContent,
      unscoredContent: result.unscoredContent,
      suggestions: result.suggestions,
    },
  };
});
