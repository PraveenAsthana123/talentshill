import { registerReportResolver } from '@/lib/report-share/registry';
import { runInfluencerRoiPipeline } from '@/lib/pipelines/influencer-roi-pipeline';

registerReportResolver('influencer_video', 'roi_summary', async () => {
  const result = await runInfluencerRoiPipeline({ triggeredBy: null });
  return {
    title: 'Influencer Creator ROI Report',
    generatedAt: new Date().toISOString(),
    data: {
      scoredCreators: result.scoredCreators,
      unscoredCreators: result.unscoredCreators,
      suggestions: result.suggestions,
    },
  };
});
