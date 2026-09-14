import { registerReportResolver } from '@/lib/report-share/registry';
import { getRankedMarketResearchBriefs } from '@/lib/db/market-research-queries';

// Business data (topic/score rankings), not personal PII -- same
// disclosure tier as campaigns/content/branding, unlike the aggregate-
// only leads/contacts resolvers.
registerReportResolver('market_research', 'opportunity_ranking', async () => {
  const ranked = getRankedMarketResearchBriefs();

  return {
    title: 'Market Opportunity Ranking',
    generatedAt: new Date().toISOString(),
    data: {
      ranked: ranked.map((b) => ({
        rank: b.opportunityRank,
        title: b.title,
        topic: b.topic,
        opportunityScore: b.opportunityScore,
        somEstimateUsd: b.somEstimateUsd,
        competitionLevel: b.competitionLevel,
        riskLevel: b.riskLevel,
        strategicFitScore: b.strategicFitScore,
      })),
    },
  };
});
