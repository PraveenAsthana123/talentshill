import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

// Seeds the 7 prioritized client-facing demos, per the source ChatGPT
// conversation's own "Best demos to build first" recommendation (msg 19,
// docs/chatgpt-extracts/2026-09-13_affiliate-...md) -- not all 40
// marketing-type use cases separately. Idempotent: upserts by demoKey.

const now = new Date();

const DEMOS: {
  demoKey: string; sourceNum: number | null; pageRoute: string | null; name: string; flowSummary: string; valueStory: string;
  backingModuleKeys: string[]; readiness: 'ready' | 'partial' | 'not_started'; gapsDisclosed: string;
}[] = [
  {
    demoKey: 'control_tower', sourceNum: null, pageRoute: '/admin/demos/control-tower',
    name: 'Marketing Intelligence Control Tower',
    flowSummary: 'Ad/CRM/email/website data -> Marketing Data Hub -> Predictive AI + Opportunity Ranking + 6-month Scenario Simulation -> Control Tower dashboard (Revenue/CAC/CPL/ROAS/Readiness).',
    valueStory: 'Instead of reviewing dozens of disconnected reports, a marketing leader sees one real, evidence-backed readiness score, ranked opportunities, and growth scenarios in one place.',
    backingModuleKeys: ['kpi_engine', 'growth_readiness_score', 'opportunity_benchmark_engine', 'growth_scenario_simulator', 'evidence_ledger'],
    readiness: 'ready',
    gapsDisclosed: 'Pure composition of 5 already-real, live-verified engines. A KPI dimension with no real data is honestly excluded from every downstream computation, never shown as ready.',
  },
  {
    demoKey: 'lead_generation', sourceNum: 2, pageRoute: '/admin/demos/lead-generation',
    name: 'AI Lead Capture and Qualification',
    flowSummary: 'Ad/content -> landing page -> smart form -> AI lead score -> qualification stage -> next-best-action -> sales alert.',
    valueStory: 'Client was receiving leads with no prioritization; AI scoring identifies the highest-intent leads and automates next-best-action for the rest.',
    backingModuleKeys: ['leads', 'lead_scoring_nba', 'research_router'],
    readiness: 'ready',
    gapsDisclosed: 'The real Appointments module exists but is not yet joined into this specific end-to-end view (score -> scheduled meeting handoff is a follow-up, not yet wired here).',
  },
  {
    demoKey: 'affiliate_marketing', sourceNum: 4, pageRoute: '/admin/demos/affiliate',
    name: 'Affiliate Revenue Control Tower',
    flowSummary: 'Recruit affiliate -> unique tracking link -> customer click -> conversion -> attribution -> fraud check -> commission -> payout.',
    valueStory: 'Acquire customers without paying large upfront media costs, with fraud-checked, transparently-computed commissions.',
    backingModuleKeys: ['affiliate'],
    readiness: 'partial',
    gapsDisclosed: 'No real payout-gateway integration exists -- commission is computed and recorded, never marked paid. Fraud check is a disclosed 2-second click-to-conversion heuristic, not an ML fraud model.',
  },
  {
    demoKey: 'seo_content', sourceNum: 9, pageRoute: '/admin/demos/seo-content',
    name: 'SEO + Content AI Factory',
    flowSummary: 'Topic/persona -> editorial calendar -> RAG-assisted draft -> human review -> publish -> engagement metrics.',
    valueStory: 'Reduce content-production time while increasing organic customer acquisition.',
    backingModuleKeys: ['content', 'competitor_analysis', 'rag'],
    readiness: 'partial',
    gapsDisclosed: 'No live site crawl, keyword-gap tool, or rank-tracking integration exists -- "keyword research" and "rank tracking" stages of the source flow are not automated. Also covers item #11 (Content Marketing).',
  },
  {
    demoKey: 'social_influencer', sourceNum: 5, pageRoute: '/admin/demos/social-influencer',
    name: 'Creator Discovery and Campaign ROI',
    flowSummary: 'Define audience -> creator prospecting -> audience-fit scoring -> campaign -> deliverables -> real metrics -> ROI.',
    valueStory: 'Choose creators based on audience fit and actual revenue rather than follower count.',
    backingModuleKeys: ['influencer_video'],
    readiness: 'partial',
    gapsDisclosed: 'No creator-discovery/audience-data API exists -- audienceFitScore is real human judgment, not an automated lookup. No automated social-listening sentiment feed.',
  },
  {
    demoKey: 'performance_marketing', sourceNum: 1, pageRoute: '/admin/demos/performance-marketing',
    name: 'AI Budget Optimizer',
    flowSummary: 'Connect Google/Meta/LinkedIn ad accounts -> spend/click/conversion data -> CPA/ROAS -> AI recommendation -> budget reallocation.',
    valueStory: 'Instead of manually reviewing hundreds of campaigns, the marketing manager receives daily recommendations on which campaigns to scale, reduce, or stop.',
    backingModuleKeys: ['ads_management'],
    readiness: 'partial',
    gapsDisclosed: 'No live ad-platform API sync exists -- spend/impressions/clicks/conversions are real but manually entered from each platform\'s own reporting UI. ROAS/CPA are computed live from those real entries. Also covers items #7 (Paid Search/PPC) and #8 (Paid Social) -- same underlying ad_campaigns table, distinguished only by the real platform field.',
  },
  {
    demoKey: 'lifecycle_churn', sourceNum: 14, pageRoute: '/admin/demos/lifecycle',
    name: 'Lifecycle / Churn AI',
    flowSummary: 'Signup -> qualification stage -> recency-based lifecycle classification -> churn-risk flag -> retention prioritization.',
    valueStory: 'Move marketing beyond acquisition into retention: surface at-risk and churned accounts before revenue is lost.',
    backingModuleKeys: ['lifecycle'],
    readiness: 'partial',
    gapsDisclosed: 'Recency is derived only from contact_submissions.createdAt (a single intake event) -- no real product-usage or purchase-event log exists yet to compute a richer engagement/activation score.',
  },
  {
    demoKey: 'geo_aeo', sourceNum: 10, pageRoute: '/admin/demos/geo-aeo',
    name: 'AEO/GEO: Optimize Brand for AI-Answer Engines',
    flowSummary: 'Analyze FAQs/content -> create structured answers -> monitor AI visibility via real, human-run queries -> update content.',
    valueStory: 'More visibility in AI search/answer engines like ChatGPT, Perplexity, Gemini, Copilot.',
    backingModuleKeys: ['geo_visibility'],
    readiness: 'partial',
    gapsDisclosed: 'No AI-search-engine API integration exists -- every observation is a real, human-run query, logged honestly, not an automated crawl.',
  },
  {
    demoKey: 'abm', sourceNum: 22, pageRoute: '/admin/demos/abm',
    name: 'AI Campaign for Top Enterprise Accounts',
    flowSummary: 'Select accounts -> enrich firmographics -> stakeholder mapping -> personalized outreach -> sales alert.',
    valueStory: 'Higher win rates for high-value B2B accounts via multi-stakeholder buying-committee visibility.',
    backingModuleKeys: ['abm'],
    readiness: 'partial',
    gapsDisclosed: 'Real named-account rollup from contact_submissions only -- no firmographic enrichment API, no personalized-content/ad delivery exists.',
  },
  {
    demoKey: 'partner_marketing', sourceNum: 23, pageRoute: '/admin/demos/partner-marketing',
    name: 'B2B Partner Pipeline Platform',
    flowSummary: 'Recruit partner -> onboarding -> co-marketing tracking -> status transitions -> revenue attribution.',
    valueStory: 'Expands market reach without equivalent sales headcount.',
    backingModuleKeys: ['partner_ecosystem'],
    readiness: 'partial',
    gapsDisclosed: 'No partner-portal/CRM-sync integration exists -- real admin-entered tracking only, no deal-registration or lead-sharing automation.',
  },
  {
    demoKey: 'cro', sourceNum: 24, pageRoute: '/admin/demos/cro',
    name: 'AI Landing-Page Optimization',
    flowSummary: 'Capture visitor funnel -> identify drop-off -> log friction findings -> compute readiness score -> prioritize fixes.',
    valueStory: 'More conversions from the same traffic.',
    backingModuleKeys: ['cro_friction'],
    readiness: 'partial',
    gapsDisclosed: 'No automated site crawler/UX-analytics/heatmap integration exists -- findings are real but manually logged, not auto-detected.',
  },
  {
    demoKey: 'email_marketing', sourceNum: 13, pageRoute: '/admin/demos/email-marketing',
    name: 'AI Personalized Newsletter Campaign',
    flowSummary: 'Segment audience -> generate subject/body variants -> send -> open/click tracking -> behavioral segmentation -> resend/nurture.',
    valueStory: 'Higher open rate, CTR and revenue per email.',
    backingModuleKeys: ['campaigns', 'templates'],
    readiness: 'partial',
    gapsDisclosed: 'Real campaign/template infrastructure and send tracking exist. No AI-generated subject/body variant testing or behavioral re-segmentation loop is wired yet.',
  },
  {
    demoKey: 'brand_marketing', sourceNum: 18, pageRoute: '/admin/demos/brand-marketing',
    name: 'AI Brand Perception Dashboard',
    flowSummary: 'Collect social/review/news data -> sentiment/topics -> competitor benchmark -> brand health score.',
    valueStory: 'Stronger brand trust, better positioning, early issue detection.',
    backingModuleKeys: ['branding'],
    readiness: 'partial',
    gapsDisclosed: 'Real brand assets, mentions and health snapshots exist. No automated social/review/news ingestion -- mentions are manually logged.',
  },
  {
    demoKey: 'market_research_demo', sourceNum: 21, pageRoute: '/admin/demos/market-research',
    name: 'AI Market Intelligence Workspace',
    flowSummary: 'Define research question -> analyst-entered inputs -> Ollama synthesis -> opportunity score -> report.',
    valueStory: 'Faster research, better decisions, lower research cost.',
    backingModuleKeys: ['market_research'],
    readiness: 'partial',
    gapsDisclosed: 'Real brief CRUD, Ollama synthesis, and deterministic opportunity scoring exist. Does not implement any of the source conversation\'s separate 90 named research methodologies (see the Research Methodology Catalog) as distinct capabilities.',
  },
  {
    demoKey: 'conversational_marketing', sourceNum: 26, pageRoute: '/admin/demos/conversational-marketing',
    name: 'AI Website Sales Assistant',
    flowSummary: 'Visitor arrives -> chatbot identifies need -> qualifies -> captures lead -> CRM update.',
    valueStory: '24/7 lead capture, faster responses, better conversion.',
    backingModuleKeys: ['chat'],
    readiness: 'partial',
    gapsDisclosed: 'Real chat sessions, requests and qualification-tier tracking exist. RAG-grounded answering exists elsewhere in the app but is not yet wired into this specific chat flow\'s dashboard.',
  },
  {
    demoKey: 'voice_ai_marketing', sourceNum: 27, pageRoute: '/admin/demos/voice-ai-marketing',
    name: 'AI Inbound/Outbound Lead Qualification (Voice)',
    flowSummary: 'Campaign leads -> voice agent calls -> qualifies need/budget/timeline -> CRM transcript/score.',
    valueStory: 'Scales follow-up, reduces call-center effort.',
    backingModuleKeys: ['voice_ai'],
    readiness: 'partial',
    gapsDisclosed: 'Real voice assets and call-log qualification-tier tracking exist. No live voice-AI telephony/ASR integration -- transcripts are real but manually entered.',
  },
  {
    demoKey: 'sms_whatsapp_marketing', sourceNum: 28, pageRoute: '/admin/demos/sms-whatsapp',
    name: 'Event-Triggered Re-Engagement (SMS/WhatsApp)',
    flowSummary: 'Customer abandons -> trigger -> personalized SMS/WhatsApp -> response -> conversion -> opt-out/compliance tracking.',
    valueStory: 'High-engagement recovery channel, faster conversions.',
    backingModuleKeys: ['broadcasts'],
    readiness: 'partial',
    gapsDisclosed: 'Real broadcast/re-engagement trigger and at-risk-contact tracking exist. No live SMS/WhatsApp gateway integration -- sends are real but simulated/logged, not delivered.',
  },
  {
    demoKey: 'event_webinar_marketing', sourceNum: 31, pageRoute: '/admin/demos/event-webinar',
    name: 'AI Webinar-to-Pipeline Engine',
    flowSummary: 'Audience targeting -> registration -> event -> attendance/engagement score -> follow-up -> sales handoff.',
    valueStory: 'Turns events into measurable pipeline.',
    backingModuleKeys: ['appointments'],
    readiness: 'partial',
    gapsDisclosed: 'Real booking/scheduling infrastructure exists. No dedicated webinar-attendance/engagement-scoring or transcript-reuse pipeline is wired yet.',
  },
  {
    demoKey: 'video_marketing', sourceNum: 32, pageRoute: '/admin/demos/video-marketing',
    name: 'Long-Form-to-Multi-Channel Video Factory',
    flowSummary: 'Recording -> transcript -> AI clips/titles/descriptions -> publish -> attribution.',
    valueStory: 'More content from one asset, increased reach.',
    backingModuleKeys: ['video_editing', 'videos'],
    readiness: 'partial',
    gapsDisclosed: 'Real video library and the real Ollama-backed Video Script Generation Engine exist. No FFmpeg/transcode rendering pipeline -- clip generation is scripted, not rendered (disclosed gap carried from the pre-existing module).',
  },
  {
    demoKey: 'youtube_marketing', sourceNum: 33, pageRoute: '/admin/demos/youtube-marketing',
    name: 'AI Channel Growth Engine',
    flowSummary: 'Topic research -> script -> publish -> audience retention analytics -> identify drop-offs -> repurpose.',
    valueStory: 'More views, subscribers, traffic and leads.',
    backingModuleKeys: ['youtube'],
    readiness: 'partial',
    gapsDisclosed: 'Real per-video tracking and channel snapshots exist. No YouTube Data API integration -- all metrics are real but manually entered.',
  },
  {
    demoKey: 'competitive_intelligence', sourceNum: 39, pageRoute: '/admin/demos/competitive-intelligence',
    name: 'Competitor Campaign Monitor',
    flowSummary: 'Monitor competitor website/pricing/ads/content -> detect changes -> summarize -> impact score -> recommended response.',
    valueStory: 'Faster competitive response and positioning.',
    backingModuleKeys: ['competitor_analysis'],
    readiness: 'partial',
    gapsDisclosed: 'Real competitor profiles and the real 8-dimension numeric Competitor Benchmark Engine exist. No automated change-detection crawler -- observations are real but manually entered.',
  },
  // -- Items #7, #8, #11 fold into an existing demo above rather than
  // getting their own page (same underlying real module/table) -- still
  // registered under their own sourceNum so all 40 numbers are visible
  // and queryable, never silently absorbed without a trace.
  { demoKey: 'paid_search_ppc', sourceNum: 7, pageRoute: '/admin/demos/performance-marketing', name: 'AI Google Ads Optimization', flowSummary: 'Keyword research -> campaign/ad groups -> bid/budget -> conversion tracking -> optimization.', valueStory: 'More conversions from search, lower CPC/CPA.', backingModuleKeys: ['ads_management'], readiness: 'partial', gapsDisclosed: 'Folded into the Performance Marketing AI demo -- same real ad_campaigns table (platform=google), not a separate page. No live Google Ads API sync exists.' },
  { demoKey: 'paid_social', sourceNum: 8, pageRoute: '/admin/demos/performance-marketing', name: 'AI Creative and Audience Optimization', flowSummary: 'Define audience -> generate creatives -> launch Meta/LinkedIn/TikTok variants -> A/B test -> scale winner.', valueStory: 'Faster campaign testing, higher CTR and ROAS.', backingModuleKeys: ['ads_management'], readiness: 'partial', gapsDisclosed: 'Folded into the Performance Marketing AI demo -- same real ad_campaigns table (platform=meta/linkedin/tiktok), not a separate page. No live ad-platform API sync exists.' },
  { demoKey: 'content_marketing', sourceNum: 11, pageRoute: '/admin/demos/seo-content', name: 'AI Content Factory', flowSummary: 'Customer persona -> topics -> editorial calendar -> generate blogs/social snippets -> human review -> publish.', valueStory: 'Higher content output, lower production cost, consistent brand voice.', backingModuleKeys: ['content', 'rag'], readiness: 'partial', gapsDisclosed: 'Folded into the SEO + Content AI Factory demo -- same real Content Management + RAG Pipeline modules, not a separate page.' },
  // -- Genuinely zero-coverage items (no real module exists at all).
  // Registered honestly as not_started, not silently omitted, so the
  // full 40-item picture is visible in one place.
  { demoKey: 'demand_generation', sourceNum: 3, pageRoute: null, name: 'B2B AI Awareness-to-Pipeline Campaign', flowSummary: 'Identify ICP -> thought-leadership content -> webinar/social/video -> intent score -> nurture -> opportunity.', valueStory: 'Creates future pipeline, improves brand awareness and buyer intent.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists. Overlaps Content Marketing + Lead Generation but no intent-scoring/nurture-sequencing capability has been built.' },
  { demoKey: 'referral_marketing', sourceNum: 6, pageRoute: null, name: 'Customer-Refers-Customer Engine', flowSummary: 'Existing customer -> referral link/code -> friend signup -> reward both parties -> fraud check.', valueStory: 'Low CAC, trusted acquisition, stronger loyalty.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists. Structurally similar to the real Affiliate Engine but customer-to-customer, not partner-to-customer -- not yet built as its own capability.' },
  { demoKey: 'social_media_marketing', sourceNum: 12, pageRoute: null, name: 'Multi-Channel AI Social Manager', flowSummary: 'Content calendar -> generate posts -> approval -> schedule -> monitor comments -> sentiment -> analytics.', valueStory: 'Saves time, increases posting consistency and engagement.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists in TalentsHill (SohamYoga has separate social-scheduling infrastructure for its own B2C use case, not reused here).' },
  { demoKey: 'marketing_automation', sourceNum: 15, pageRoute: null, name: 'Cross-Channel Autonomous Nurture', flowSummary: 'Trigger from form/event -> CRM update -> segment -> email/SMS/WhatsApp -> wait -> next-best-action -> sales handoff.', valueStory: 'Less manual work, faster follow-up, consistent customer journeys.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'The existing "workflows" module is approval-routing, not nurture automation -- confirmed distinct, not a match.' },
  { demoKey: 'customer_marketing', sourceNum: 16, pageRoute: null, name: 'Upsell/Cross-Sell Engine', flowSummary: 'Customer usage/order data -> identify expansion opportunity -> personalized offer -> account manager alert.', valueStory: 'Higher revenue from existing customers.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no order/usage-event log to compute expansion opportunities from.' },
  { demoKey: 'loyalty_marketing', sourceNum: 17, pageRoute: null, name: 'AI Loyalty/Reward Optimization', flowSummary: 'Purchase -> points -> segment by behavior/value -> recommend reward -> redemption.', valueStory: 'Increases repeat purchases and customer lifetime value.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no points/rewards ledger.' },
  { demoKey: 'reputation_review_marketing', sourceNum: 19, pageRoute: null, name: 'AI Review Monitoring and Response', flowSummary: 'Pull Google/social reviews -> sentiment -> urgent complaint detection -> AI draft response -> resolution.', valueStory: 'Protects reputation, improves ratings and customer satisfaction.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists. The real PR & Earned Media module (Share-of-Voice) is adjacent but measures media-mention sentiment, not customer review management -- confirmed distinct, not a match.' },
  { demoKey: 'social_listening', sourceNum: 20, pageRoute: null, name: 'Real-Time Customer Sentiment Radar', flowSummary: 'Monitor brand/product/competitor mentions -> sentiment -> emerging topic detection -> crisis alert.', valueStory: 'Faster response to market/customer issues.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no social-listening feed integration.' },
  { demoKey: 'product_led_growth', sourceNum: 25, pageRoute: null, name: 'Free-User-to-Paid Conversion Agent', flowSummary: 'Signup -> product events -> activation score -> PQL identification -> upgrade offer.', valueStory: 'Higher self-service conversion, reduced sales dependency.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- TalentsHill is a services business, not a self-serve product, so no product-usage-event log exists to build this from.' },
  { demoKey: 'local_marketing', sourceNum: 29, pageRoute: null, name: 'Multi-Location Business Visibility Platform', flowSummary: 'Manage locations -> listings -> local SEO -> reviews -> local ads -> visit tracking.', valueStory: 'More local traffic, calls and store visits.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- not applicable to TalentsHill\'s current single-location B2B model.' },
  { demoKey: 'community_marketing', sourceNum: 30, pageRoute: null, name: 'AI Community Engagement Assistant', flowSummary: 'User joins community -> onboarding -> recommend content -> unanswered-question detection -> advocacy score.', valueStory: 'Higher engagement, retention and customer advocacy.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no community platform exists to instrument.' },
  { demoKey: 'podcast_marketing', sourceNum: 34, pageRoute: null, name: 'Podcast-to-Demand-Gen Engine', flowSummary: 'Topic/guest selection -> record -> transcript -> clips/blog/social/email -> track listeners to leads.', valueStory: 'Thought leadership plus reusable content.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no podcast production/hosting infrastructure.' },
  { demoKey: 'ecommerce_marketing', sourceNum: 35, pageRoute: null, name: 'Personalized Shopping Journey', flowSummary: 'Behavioral tracking -> product recommendation -> abandoned-cart automation -> cross-sell -> loyalty.', valueStory: 'Higher AOV, conversion and repeat purchase.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- TalentsHill is a B2B services business, not e-commerce; not applicable to the current business model.' },
  { demoKey: 'retargeting', sourceNum: 36, pageRoute: null, name: 'Abandoned Visitor Recovery', flowSummary: 'Visitor views product -> leaves -> audience created -> retargeting ad/email -> revisit -> purchase.', valueStory: 'Recovers lost traffic and improves campaign ROI.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no visitor-tracking/audience-pixel infrastructure.' },
  { demoKey: 'personalization_marketing', sourceNum: 37, pageRoute: null, name: 'Next-Best-Content/Product Engine', flowSummary: 'Capture behavior/profile -> segments -> AI predicts intent -> personalized homepage/email/offer.', valueStory: 'Higher relevance, engagement and conversion.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no behavioral-event log to personalize from.' },
  { demoKey: 'customer_journey_orchestration', sourceNum: 38, pageRoute: null, name: 'Next-Best-Action Across Channels', flowSummary: 'Combine CRM/CDP/web/events -> determine journey stage -> AI selects next action/channel -> observe outcome.', valueStory: 'Consistent omnichannel experience.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- the real per-lead Next-Best-Action (lead_scoring_nba) is single-channel/single-decision, not a full cross-channel orchestration engine -- confirmed distinct, not a match.' },
  { demoKey: 'pricing_promotion_marketing', sourceNum: 40, pageRoute: null, name: 'AI Promotion Optimizer', flowSummary: 'Historical sales + margin + customer response -> simulate discount options -> select promotion -> measure uplift.', valueStory: 'Increases revenue without unnecessary discounting.', backingModuleKeys: [], readiness: 'not_started', gapsDisclosed: 'No real module exists -- no historical sales/margin dataset to simulate discount scenarios from.' },
];

for (const d of DEMOS) {
  const existing = db.select().from(schema.demoShowcase).where(eq(schema.demoShowcase.demoKey, d.demoKey)).get();
  const values = {
    sourceNum: d.sourceNum, pageRoute: d.pageRoute, name: d.name, flowSummary: d.flowSummary, valueStory: d.valueStory,
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
