import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
const SOURCE_DOC = 'docs/audits/2026-09-14_self-generated-gap-analysis-and-backlog.md';

// Self-generated gap-analysis backlog (no source ChatGPT conversation for
// TalentsHill -- user explicitly asked to generate it from the codebase).
// Same 30-capability list validated for SohamYoga, extended with #31
// (B2B ABM, real gap specific to TalentsHill's actual B2B model).
const ITEMS: { key: string; name: string; description: string }[] = [
  { key: 'evidence_ledger', name: 'Evidence Ledger', description: 'FACT/ESTIMATE/INFERENCE/HYPOTHESIS/UNKNOWN claim classification with mandatory source traceability.' },
  { key: 'kpi_engine', name: 'KPI Engine', description: 'Cross-cutting explainable KPI dimensions computed from real data, each with confidence/sample-size.' },
  { key: 'opportunity_benchmark_engine', name: 'Opportunity & Benchmark Engine', description: 'Ranks real gaps by impact x feasibility x confidence, recommends real existing modules as remediation.' },
  { key: 'competitor_benchmark_engine', name: 'Competitor Benchmark Engine (numeric)', description: 'Extends competitor_analysis with structured multi-dimension numeric scoring and head-to-head gap-vs-owned-KPI comparison.' },
  { key: 'lead_scoring_nba', name: 'Lead Scoring + Next-Best-Action', description: 'Extends lead-scoring.ts with a structured, stored, deterministic next-best-action field.' },
  { key: 'growth_readiness_score', name: 'Growth Readiness Score', description: 'Company-wide confidence-weighted composite across all real KPI dimensions (not just email/contact program).' },
  { key: 'business_diagnostic', name: 'Business Diagnostic', description: 'Demand Map from real booking/lead data; Funnel Constraint detection.' },
  { key: 'geo_visibility', name: 'GEO Visibility', description: 'Real admin-observed AI-answer-engine (ChatGPT/Perplexity) mention tracking.' },
  { key: 'cro_friction_engine', name: 'CRO / Website Friction Engine', description: 'Real admin-logged conversion-friction findings with a readiness score.' },
  { key: 'channel_attribution', name: 'Channel Attribution', description: 'Cross-channel lead dedup + conversion-rate-by-channel rollup, extending the real contacts.source field.' },
  { key: 'video_script_engine', name: 'Video Script Generation Engine', description: 'Real Ollama-backed script generation for video_clip_plans (rendering pipeline remains a disclosed gap).' },
  { key: 'presales_growth_brief', name: 'Pre-Sales Growth Brief', description: 'Composes Evidence Ledger + KPI Engine + Opportunity Engine + Competitor Benchmark into one real brief.' },
  { key: 'research_depth_router', name: 'Research-Depth Router', description: 'Real rule-based pre-filter deciding research depth before spending a costed AI call.' },
  { key: 'demo_recommendation_engine', name: 'Demo Recommendation Engine', description: 'Maps the top real opportunity to a real existing TalentsHill module to demo.' },
  { key: 'sales_copilot', name: 'Sales Copilot Talking Points', description: 'Real deterministic composition of talking points from real Evidence/KPI/Competitor data.' },
  { key: 'growth_scenario_simulator', name: 'Growth Scenario Simulator', description: 'Real compound projection from a real current KPI value under disclosed assumption rates.' },
  { key: 'demo_catalog_own_modules', name: 'Demo Catalog Portal (own modules)', description: 'Extends app/demo to also catalog TalentsHill\'s own 15+ live-verified built modules, not just generic solution demos.' },
  { key: 'vertical_pack', name: 'Vertical Pack + KPI Registry', description: 'Real classification of TalentsHill\'s own business vertical (B2B AI/digital-marketing consultancy) + real KPI dimension list.' },
  { key: 'case_study_engine', name: 'Case Study Engine', description: 'Real case_studies table gated from publishing without at least one real evidence_id citation.' },
  { key: 'golden_path_registry', name: 'Golden Path Registry', description: 'DB-backed catalog of real end-to-end flows with real evidence of live verification.' },
  { key: 'partner_ecosystem', name: 'Partner Ecosystem Tracking', description: 'Real admin-entered B2B co-marketing/partner tracking, distinct from influencer-creator partnerships.' },
  { key: 'positioning_statement', name: 'Positioning Statement', description: 'Real one-time admin-authored "For X who Y, TalentsHill is Z..." template.' },
  { key: 'pmf_sean_ellis', name: 'PMF Sean-Ellis Survey', description: 'Real "how would you feel if you could no longer use TalentsHill" PMF survey schema, distinct from the existing AI-maturity quiz.' },
  { key: 'pr_earned_media', name: 'PR & Earned Media / Share of Voice', description: 'Real admin-logged media mentions + share-of-voice computation.' },
  { key: 'b2b_abm_engine', name: 'B2B ABM Engine', description: 'Real named-account rollup grouping existing contacts/contactSubmissions by company, with buying-committee view. New item (#31), specific to TalentsHill\'s actual B2B model -- not applicable to SohamYoga.' },
];

function upsert(key: string, name: string, description: string) {
  const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, key)).get();
  const data = {
    name,
    description,
    builtStatus: 'not_built' as const,
    apiRouteCount: 0,
    hasAdminUi: false,
    missingItems: 'Not yet built -- registered from self-generated gap analysis, see sourceDoc.',
    sourceDoc: SOURCE_DOC,
  };
  if (existing) {
    console.log(`Skip (already tracked, status=${existing.builtStatus}): ${key}`);
    return;
  }
  db.insert(schema.moduleRegistry).values({
    id: randomUUID(), moduleKey: key, ...data,
    lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-14-gap-analysis',
    createdAt: now, updatedAt: now,
  }).run();
  console.log(`Inserted module_registry (not_built): ${key}`);
}

for (const item of ITEMS) upsert(item.key, item.name, item.description);

// #27 Commerce Product Intelligence: NOT_APPLICABLE, documented (not a
// buildable backlog item) -- same honest-exclusion pattern as Shopify for
// SohamYoga.
const commerceExisting = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, 'commerce_product_intelligence')).get();
if (!commerceExisting) {
  db.insert(schema.moduleRegistry).values({
    id: randomUUID(),
    moduleKey: 'commerce_product_intelligence',
    name: 'Commerce Product Intelligence',
    description: 'NOT_APPLICABLE: TalentsHill sells services via lead-gen + booking, not e-commerce. Zero product/order/cart/SKU tables exist in the schema; services table is a static menu. Confirmed via full schema.ts read, not assumed.',
    builtStatus: 'not_built' as const,
    apiRouteCount: 0,
    hasAdminUi: false,
    missingItems: 'NOT_APPLICABLE -- no commerce domain in this business model. Documented exclusion, not a build gap.',
    sourceDoc: SOURCE_DOC,
    lastVerifiedAt: now,
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
    createdAt: now,
    updatedAt: now,
  }).run();
  console.log('Inserted module_registry (not_applicable, documented): commerce_product_intelligence');
}

console.log('Backlog seed complete.');
