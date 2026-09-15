import { db, schema } from '@/lib/db/index';
import { desc, eq } from 'drizzle-orm';
import { computeResearchDepth } from '@/lib/agents/research-depth-router';

// Demo 1 -- AI Lead Capture and Qualification. Pure, read-only composition
// of the real Leads/Contacts intake, the real deterministic lead-scoring
// rubric (lib/contact/lead-scoring.ts), the real persisted Next-Best-
// Action, and the real Research-Depth Router gate -- all built and
// live-verified earlier this session. No new data source, no LLM call.
export function getLeadGenerationJourney(limit = 5) {
  const submissions = db.select().from(schema.contactSubmissions)
    .orderBy(desc(schema.contactSubmissions.createdAt))
    .limit(limit)
    .all();

  return submissions.map((s) => {
    const nba = db.select().from(schema.leadNextBestAction)
      .where(eq(schema.leadNextBestAction.submissionId, s.id))
      .orderBy(desc(schema.leadNextBestAction.computedAt))
      .get();

    const researchDepth = computeResearchDepth(s.leadTier ?? 'cold', s.budgetRange);

    return {
      submissionId: s.id,
      company: s.company,
      industry: s.industry,
      projectStage: s.projectStage,
      score: s.leadScore,
      tier: s.leadTier,
      qualificationStage: s.qualificationStage,
      nextBestAction: nba ? { action: nba.action, reason: nba.reason, computedAt: nba.computedAt } : null,
      researchDepth,
      alertSent: s.alertSentAt !== null,
      createdAt: s.createdAt,
    };
  });
}

export function getLeadGenerationFunnelSummary() {
  const all = db.select().from(schema.contactSubmissions).all();
  const byStage: Record<string, number> = {};
  for (const s of all) {
    const stage = s.qualificationStage ?? 'unqualified';
    byStage[stage] = (byStage[stage] ?? 0) + 1;
  }
  return { totalLeads: all.length, byStage };
}
