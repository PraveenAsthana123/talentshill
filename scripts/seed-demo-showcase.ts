import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

// Seeds the 7 prioritized client-facing demos, per the source ChatGPT
// conversation's own "Best demos to build first" recommendation (msg 19,
// docs/chatgpt-extracts/2026-09-13_affiliate-...md) -- not all 40
// marketing-type use cases separately. Idempotent: upserts by demoKey.

const now = new Date();

const DEMOS: {
  demoKey: string; name: string; flowSummary: string; valueStory: string;
  backingModuleKeys: string[]; readiness: 'ready' | 'partial' | 'not_started'; gapsDisclosed: string;
}[] = [
  {
    demoKey: 'control_tower',
    name: 'Marketing Intelligence Control Tower',
    flowSummary: 'Ad/CRM/email/website data -> Marketing Data Hub -> Predictive AI + Opportunity Ranking + 6-month Scenario Simulation -> Control Tower dashboard (Revenue/CAC/CPL/ROAS/Readiness).',
    valueStory: 'Instead of reviewing dozens of disconnected reports, a marketing leader sees one real, evidence-backed readiness score, ranked opportunities, and growth scenarios in one place.',
    backingModuleKeys: ['kpi_engine', 'growth_readiness_score', 'opportunity_benchmark_engine', 'growth_scenario_simulator', 'evidence_ledger'],
    readiness: 'ready',
    gapsDisclosed: 'Pure composition of 5 already-real, live-verified engines. A KPI dimension with no real data is honestly excluded from every downstream computation, never shown as ready.',
  },
  {
    demoKey: 'lead_generation',
    name: 'AI Lead Capture and Qualification',
    flowSummary: 'Ad/content -> landing page -> smart form -> AI lead score -> qualification stage -> next-best-action -> sales alert.',
    valueStory: 'Client was receiving leads with no prioritization; AI scoring identifies the highest-intent leads and automates next-best-action for the rest.',
    backingModuleKeys: ['leads', 'lead_scoring_nba', 'research_router'],
    readiness: 'ready',
    gapsDisclosed: 'The real Appointments module exists but is not yet joined into this specific end-to-end view (score -> scheduled meeting handoff is a follow-up, not yet wired here).',
  },
  {
    demoKey: 'affiliate_marketing',
    name: 'Affiliate Revenue Control Tower',
    flowSummary: 'Recruit affiliate -> unique tracking link -> customer click -> conversion -> attribution -> fraud check -> commission -> payout.',
    valueStory: 'Acquire customers without paying large upfront media costs, with fraud-checked, transparently-computed commissions.',
    backingModuleKeys: ['affiliate'],
    readiness: 'partial',
    gapsDisclosed: 'No real payout-gateway integration exists -- commission is computed and recorded, never marked paid. Fraud check is a disclosed 2-second click-to-conversion heuristic, not an ML fraud model.',
  },
  {
    demoKey: 'seo_content',
    name: 'SEO + Content AI Factory',
    flowSummary: 'Topic/persona -> editorial calendar -> RAG-assisted draft -> human review -> publish -> engagement metrics.',
    valueStory: 'Reduce content-production time while increasing organic customer acquisition.',
    backingModuleKeys: ['content', 'competitor_analysis', 'rag'],
    readiness: 'partial',
    gapsDisclosed: 'No live site crawl, keyword-gap tool, or rank-tracking integration exists -- "keyword research" and "rank tracking" stages of the source flow are not automated.',
  },
  {
    demoKey: 'social_influencer',
    name: 'Creator Discovery and Campaign ROI',
    flowSummary: 'Define audience -> creator prospecting -> audience-fit scoring -> campaign -> deliverables -> real metrics -> ROI.',
    valueStory: 'Choose creators based on audience fit and actual revenue rather than follower count.',
    backingModuleKeys: ['influencer_video'],
    readiness: 'partial',
    gapsDisclosed: 'No creator-discovery/audience-data API exists -- audienceFitScore is real human judgment, not an automated lookup. No automated social-listening sentiment feed.',
  },
  {
    demoKey: 'performance_marketing',
    name: 'AI Budget Optimizer',
    flowSummary: 'Connect Google/Meta/LinkedIn ad accounts -> spend/click/conversion data -> CPA/ROAS -> AI recommendation -> budget reallocation.',
    valueStory: 'Instead of manually reviewing hundreds of campaigns, the marketing manager receives daily recommendations on which campaigns to scale, reduce, or stop.',
    backingModuleKeys: ['ads_management'],
    readiness: 'partial',
    gapsDisclosed: 'No live ad-platform API sync exists -- spend/impressions/clicks/conversions are real but manually entered from each platform\'s own reporting UI. ROAS/CPA are computed live from those real entries.',
  },
  {
    demoKey: 'lifecycle_churn',
    name: 'Lifecycle / Churn AI',
    flowSummary: 'Signup -> qualification stage -> recency-based lifecycle classification -> churn-risk flag -> retention prioritization.',
    valueStory: 'Move marketing beyond acquisition into retention: surface at-risk and churned accounts before revenue is lost.',
    backingModuleKeys: ['lifecycle'],
    readiness: 'partial',
    gapsDisclosed: 'Recency is derived only from contact_submissions.createdAt (a single intake event) -- no real product-usage or purchase-event log exists yet to compute a richer engagement/activation score.',
  },
];

for (const d of DEMOS) {
  const existing = db.select().from(schema.demoShowcase).where(eq(schema.demoShowcase.demoKey, d.demoKey)).get();
  const values = {
    name: d.name, flowSummary: d.flowSummary, valueStory: d.valueStory,
    backingModuleKeys: JSON.stringify(d.backingModuleKeys), readiness: d.readiness,
    gapsDisclosed: d.gapsDisclosed, lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-15-demo-showcase', updatedAt: now,
  };
  if (existing) {
    db.update(schema.demoShowcase).set(values).where(eq(schema.demoShowcase.id, existing.id)).run();
    console.log(`Updated demo_showcase: ${d.demoKey}`);
  } else {
    db.insert(schema.demoShowcase).values({ id: randomUUID(), demoKey: d.demoKey, createdAt: now, ...values }).run();
    console.log(`Inserted demo_showcase: ${d.demoKey}`);
  }
}

// Register the 2 genuinely net-new modules in module_registry too, per the
// Module Understanding Standard -- distinct from the demo_showcase catalog
// entry above (that's client-facing readiness; this is the underlying
// module's own real/partial/not_built status).
const NEW_MODULES: { moduleKey: string; name: string; description: string; apiRouteCount: number; missingItems: string; sourceDoc: string }[] = [
  {
    moduleKey: 'affiliate', name: 'Affiliate Engine',
    description: 'Real recruit -> tracking link -> click -> attributed conversion -> deterministic commission -> heuristic fraud check. No real payout-gateway integration exists.',
    apiRouteCount: 2, missingItems: 'No payout-gateway integration (disclosed).', sourceDoc: 'docs/testing/2026-09-15_demo-showcase-log.txt',
  },
  {
    moduleKey: 'lifecycle', name: 'Lifecycle & Churn Engine',
    description: 'Real, deterministic lifecycle-stage + churn-risk classification from real contact recency. No product-usage/purchase-event log exists yet.',
    apiRouteCount: 2, missingItems: 'Recency signal is single-event (createdAt) only, not a full engagement log (disclosed).', sourceDoc: 'docs/testing/2026-09-15_demo-showcase-log.txt',
  },
  {
    moduleKey: 'demo_showcase', name: 'Client Demo Showcase',
    description: 'Real, registry-backed catalog of the 7 prioritized client-facing demos (per the source conversation\'s own "build 7, not 40" recommendation), each with a real readiness status derived from live-verified backing modules, never hand-set.',
    apiRouteCount: 7, missingItems: '33 of the 40 marketing-type use cases from the source catalog remain undemoed by design (the source material itself advises against building all 40 separately).', sourceDoc: 'docs/testing/2026-09-15_demo-showcase-log.txt',
  },
];

for (const m of NEW_MODULES) {
  const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).get();
  const values = {
    name: m.name, description: m.description, builtStatus: 'real' as const, apiRouteCount: m.apiRouteCount,
    hasAdminUi: true, missingItems: m.missingItems, sourceDoc: m.sourceDoc, lastVerifiedAt: now,
    verifiedBy: 'claude-session-2026-09-15-demo-showcase', updatedAt: now,
  };
  if (existing) {
    db.update(schema.moduleRegistry).set(values).where(eq(schema.moduleRegistry.id, existing.id)).run();
    console.log(`Updated module_registry: ${m.moduleKey}`);
  } else {
    db.insert(schema.moduleRegistry).values({ id: randomUUID(), moduleKey: m.moduleKey, createdAt: now, ...values }).run();
    console.log(`Inserted module_registry: ${m.moduleKey}`);
  }
}

console.log('Demo Showcase seed complete.');
