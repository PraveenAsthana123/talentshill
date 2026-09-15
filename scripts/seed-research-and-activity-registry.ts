import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();

const MODULES: { moduleKey: string; name: string; description: string; apiRouteCount: number; missingItems: string }[] = [
  {
    moduleKey: 'research_assessment', name: 'Research Assessment Engine',
    description: 'Real, generic structured-assessment tool (composite score from real admin-entered dimension ratings) backing 87 of the 90 research-methodology-catalog items, plus 3 distinct real calculators (TAM/SAM/SOM, NPS, Van Westendorp) for the ones whose math genuinely differs. Live-verified: PESTLE composite 71.7 hand-matched (70+55+90)/3; TAM/SAM/SOM 1B->150M->7.5M exact; NPS=10 exact; Van Westendorp medians exact.',
    apiRouteCount: 1, missingItems: 'No live third-party research-data feed for any methodology -- every input is real but manually entered by an analyst (disclosed, same pattern as every other partial module).',
  },
  {
    moduleKey: 'marketing_activity_log', name: 'Marketing Activity Log',
    description: 'Real, generic structured activity log covering 12 of the demo_showcase catalog\'s marketing-type items (demand generation, referral, social media, marketing automation, customer/upsell, reputation, social listening, community, retargeting, personalization, journey orchestration, pricing/promotion). Live-verified: uncovered demoKey correctly rejected, real activity logged and persisted with real outcome metric.',
    apiRouteCount: 1, missingItems: 'No automated channel integration, sentiment analysis, or trigger logic -- every entry is real but manually logged, not an automated pipeline. Deliberately does not cover 5 items that assume a business model TalentsHill does not have (product-led growth, local/multi-location, e-commerce, podcast, loyalty points).',
  },
];

for (const m of MODULES) {
  const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).get();
  const values = {
    name: m.name, description: m.description, builtStatus: 'real' as const, apiRouteCount: m.apiRouteCount,
    hasAdminUi: true, missingItems: m.missingItems, sourceDoc: 'docs/testing/2026-09-15_full-catalog-completion-log.txt',
    lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-15-full-catalog-completion', updatedAt: now,
  };
  if (existing) {
    db.update(schema.moduleRegistry).set(values).where(eq(schema.moduleRegistry.id, existing.id)).run();
    console.log(`Updated module_registry: ${m.moduleKey}`);
  } else {
    db.insert(schema.moduleRegistry).values({ id: randomUUID(), moduleKey: m.moduleKey, createdAt: now, ...values }).run();
    console.log(`Inserted module_registry: ${m.moduleKey}`);
  }
}
console.log('Done.');
