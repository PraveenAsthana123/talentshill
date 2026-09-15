import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

// Seeds all 90 real, named market-research methodologies from the source
// ChatGPT conversation's own catalog (msg 21). Every row is honestly
// status='not_started' -- the pre-existing Market Research module does
// not implement any of these as a distinct, data-driven capability
// (confirmed via repo search before seeding). Exists so "complete all
// pending" produces an honest, complete 130-item picture (this 90 +
// the 40 marketing-type demo_showcase rows) rather than only the 23
// demoed items being visible.

const now = new Date();

const RESEARCH_METHODOLOGIES: { num: number; name: string; description: string; typicalOutput: string }[] = [
  { num: 1, name: 'Market Size Analysis', description: 'Collect industry, revenue, company, customer and geographic data', typicalOutput: 'TAM / SAM / SOM; investment decision' },
  { num: 2, name: 'Market Growth Forecasting', description: 'Analyze historical market data and growth drivers', typicalOutput: '3–5 year market forecast' },
  { num: 3, name: 'Market Attractiveness Scoring', description: 'Score markets by growth, margin, competition, regulation and entry barriers', typicalOutput: 'Prioritized market opportunity matrix' },
  { num: 4, name: 'Emerging Market Identification', description: 'Detect fast-growing categories, technologies and regions', typicalOutput: 'Early opportunity identification' },
  { num: 5, name: 'Industry Trend Analysis', description: 'Monitor news, research, search trends, patents and investments', typicalOutput: 'Trend dashboard and strategic themes' },
  { num: 6, name: 'Technology Trend Scouting', description: 'Track GenAI, robotics, quantum, AR/VR, satellite, HPC, IoT, etc.', typicalOutput: 'Technology adoption roadmap' },
  { num: 7, name: 'PESTLE Analysis', description: 'Analyze political, economic, social, technological, legal and environmental factors', typicalOutput: 'External-risk assessment' },
  { num: 8, name: 'Porter Five Forces', description: 'Evaluate competitors, suppliers, buyers, substitutes and new entrants', typicalOutput: 'Industry attractiveness assessment' },
  { num: 9, name: 'SWOT Research', description: 'Combine internal and external evidence', typicalOutput: 'Strengths, weaknesses, opportunities, threats' },
  { num: 10, name: 'Scenario Planning', description: 'Model optimistic, base and downside market scenarios', typicalOutput: 'Strategy under uncertainty' },
  { num: 11, name: 'Competitor Identification', description: 'Discover direct, indirect and emerging competitors', typicalOutput: 'Competitive landscape' },
  { num: 12, name: 'Competitor Benchmarking', description: 'Compare features, price, market presence, customer ratings and positioning', typicalOutput: 'Competitive scorecard' },
  { num: 13, name: 'Competitor Product Monitoring', description: 'Monitor product launches, features and releases', typicalOutput: 'Product-gap identification' },
  { num: 14, name: 'Competitor Pricing Tracking', description: 'Monitor pricing, bundles, discounts and promotions', typicalOutput: 'Pricing response strategy' },
  { num: 15, name: 'Competitor Marketing Analysis', description: 'Analyze competitor ads, SEO, social and campaigns', typicalOutput: 'Marketing strategy benchmark' },
  { num: 16, name: 'Competitor Content Intelligence', description: 'Compare blogs, videos, topics, keywords and engagement', typicalOutput: 'Content-gap opportunities' },
  { num: 17, name: 'Competitor Review Mining', description: 'Analyze public customer reviews', typicalOutput: 'Competitor strengths and pain points' },
  { num: 18, name: 'Competitive Positioning Map', description: 'Map competitors by price, quality, innovation, service, etc.', typicalOutput: 'White-space identification' },
  { num: 19, name: 'Share-of-Voice Analysis', description: 'Measure brand/competitor mentions across channels', typicalOutput: 'Brand visibility benchmark' },
  { num: 20, name: 'Customer Segmentation', description: 'Cluster customers using demographic, behavioral or firmographic data', typicalOutput: 'Actionable customer segments' },
  { num: 21, name: 'Persona Development', description: 'Turn research into customer personas', typicalOutput: 'Buyer personas for marketing/sales' },
  { num: 22, name: 'ICP Identification', description: 'Analyze best customers to define ideal customer profile', typicalOutput: 'Better targeting and lower CAC' },
  { num: 23, name: 'Customer Needs Analysis', description: 'Survey/interview customers and analyze pain points', typicalOutput: 'Product/service priorities' },
  { num: 24, name: 'Jobs-to-be-Done Research', description: 'Understand what customers are trying to accomplish', typicalOutput: 'Better product-market alignment' },
  { num: 25, name: 'Voice of Customer', description: 'Analyze surveys, reviews, support tickets, calls and interviews', typicalOutput: 'Customer insight dashboard' },
  { num: 26, name: 'Customer Pain-Point Mining', description: 'Extract repeated problems from qualitative data', typicalOutput: 'Ranked problem backlog' },
  { num: 27, name: 'Customer Satisfaction Research', description: 'Analyze CSAT, CES and survey feedback', typicalOutput: 'Customer-experience priorities' },
  { num: 28, name: 'NPS Analysis', description: 'Segment promoters, passives and detractors', typicalOutput: 'Loyalty and retention actions' },
  { num: 29, name: 'Customer Sentiment Analysis', description: 'Apply NLP/LLMs to reviews and conversations', typicalOutput: 'Positive/negative sentiment trends' },
  { num: 30, name: 'Customer Emotion Analysis', description: 'Identify frustration, trust, excitement, anxiety, etc.', typicalOutput: 'Deeper experience insight' },
  { num: 31, name: 'Behavioral Research', description: 'Analyze clicks, sessions, purchases and journeys', typicalOutput: 'Behavioral patterns' },
  { num: 32, name: 'Customer Journey Research', description: 'Map awareness → consideration → purchase → retention', typicalOutput: 'Journey gaps and opportunities' },
  { num: 33, name: 'Churn Research', description: 'Study cancellation behavior and reasons', typicalOutput: 'Retention strategy' },
  { num: 34, name: 'Win/Loss Analysis', description: 'Analyze why deals were won or lost', typicalOutput: 'Better sales/product strategy' },
  { num: 35, name: 'Lost-Customer Interviews', description: 'Research former customers', typicalOutput: 'Root causes of churn' },
  { num: 36, name: 'Product Concept Testing', description: 'Test product concepts before development', typicalOutput: 'Go/no-go decision' },
  { num: 37, name: 'Feature Demand Research', description: 'Analyze requested features and customer importance', typicalOutput: 'Feature prioritization' },
  { num: 38, name: 'Product-Market Fit Research', description: 'Measure customer dependence, usage and satisfaction', typicalOutput: 'PMF score and improvement areas' },
  { num: 39, name: 'Prototype Testing', description: 'Get user feedback on mockups or MVP', typicalOutput: 'UX/product validation' },
  { num: 40, name: 'New Product Opportunity Discovery', description: 'Identify unmet needs and market gaps', typicalOutput: 'New-product pipeline' },
  { num: 41, name: 'Product Gap Analysis', description: 'Compare customer needs against current offering', typicalOutput: 'Product roadmap priorities' },
  { num: 42, name: 'Feature Benchmarking', description: 'Compare your features with competitors', typicalOutput: 'Differentiation strategy' },
  { num: 43, name: 'Product Adoption Research', description: 'Understand who adopts and why', typicalOutput: 'Adoption strategy' },
  { num: 44, name: 'Pricing Research', description: 'Study willingness to pay and price sensitivity', typicalOutput: 'Recommended price range' },
  { num: 45, name: 'Van Westendorp Pricing Study', description: 'Ask too-cheap/cheap/expensive/too-expensive questions', typicalOutput: 'Acceptable pricing window' },
  { num: 46, name: 'Conjoint Analysis', description: 'Measure how customers value combinations of features and price', typicalOutput: 'Feature-price trade-offs' },
  { num: 47, name: 'Price Elasticity Analysis', description: 'Measure demand response to price changes', typicalOutput: 'Pricing optimization' },
  { num: 48, name: 'Promotion Effectiveness Research', description: 'Study discount/promotion response', typicalOutput: 'Better campaign profitability' },
  { num: 49, name: 'Packaging Research', description: 'Compare bundles and subscription tiers', typicalOutput: 'Better package design' },
  { num: 50, name: 'Brand Awareness Study', description: 'Measure aided and unaided awareness', typicalOutput: 'Brand awareness baseline' },
  { num: 51, name: 'Brand Perception Analysis', description: 'Study how customers describe the brand', typicalOutput: 'Brand positioning improvement' },
  { num: 52, name: 'Brand Trust Research', description: 'Measure credibility, safety and reliability', typicalOutput: 'Trust-building strategy' },
  { num: 53, name: 'Brand Equity Analysis', description: 'Measure awareness, preference and loyalty', typicalOutput: 'Brand-value indicators' },
  { num: 54, name: 'Brand Positioning Research', description: 'Compare desired vs perceived position', typicalOutput: 'Repositioning decisions' },
  { num: 55, name: 'Message Testing', description: 'Test slogans, value propositions and campaign messages', typicalOutput: 'Highest-performing messaging' },
  { num: 56, name: 'Ad Concept Testing', description: 'Compare creatives before media spend', typicalOutput: 'Reduce ad waste' },
  { num: 57, name: 'Campaign Effectiveness Study', description: 'Measure pre/post campaign awareness and intent', typicalOutput: 'Marketing ROI insight' },
  { num: 58, name: 'Channel Preference Research', description: 'Discover where customers prefer to engage/buy', typicalOutput: 'Channel allocation strategy' },
  { num: 59, name: 'Media Consumption Research', description: 'Analyze customer use of YouTube, TikTok, LinkedIn, etc.', typicalOutput: 'Media planning' },
  { num: 60, name: 'Influencer Research', description: 'Identify creators aligned with target audiences', typicalOutput: 'Better influencer selection' },
  { num: 61, name: 'Search Demand Research', description: 'Analyze search volume and query intent', typicalOutput: 'Demand/SEO opportunity' },
  { num: 62, name: 'Social Listening Research', description: 'Analyze discussions across public social platforms', typicalOutput: 'Emerging topics and sentiment' },
  { num: 63, name: 'Review Intelligence', description: 'Analyze Google, Amazon, marketplace and app reviews', typicalOutput: 'Product/service insights' },
  { num: 64, name: 'Community Research', description: 'Analyze Reddit/forums/community conversations', typicalOutput: 'Unfiltered customer needs' },
  { num: 65, name: 'Geographic Market Research', description: 'Compare countries, provinces, cities or regions', typicalOutput: 'Market-entry priorities' },
  { num: 66, name: 'Location Intelligence', description: 'Combine demographics, traffic, competition and purchasing data', typicalOutput: 'New-store/location selection' },
  { num: 67, name: 'International Expansion Research', description: 'Compare demand, regulation, competition and localization', typicalOutput: 'Country-entry strategy' },
  { num: 68, name: 'Cultural Research', description: 'Understand local attitudes and buying behavior', typicalOutput: 'Localization strategy' },
  { num: 69, name: 'B2B Market Research', description: 'Analyze accounts, industries, buying committees and budgets', typicalOutput: 'Better enterprise targeting' },
  { num: 70, name: 'Account Research / ABM Research', description: 'Deep research into selected target accounts', typicalOutput: 'Personalized ABM strategy' },
  { num: 71, name: 'Buyer Committee Research', description: 'Identify decision maker, influencer, user and procurement roles', typicalOutput: 'Better B2B sales strategy' },
  { num: 72, name: 'Procurement Research', description: 'Understand buying criteria, RFPs and vendor requirements', typicalOutput: 'Enterprise sales readiness' },
  { num: 73, name: 'Partner Ecosystem Research', description: 'Identify distributors, resellers and technology partners', typicalOutput: 'Partner-growth strategy' },
  { num: 74, name: 'Market Entry Research', description: 'Evaluate demand, competitors, regulations and channels', typicalOutput: 'Go/no-go market decision' },
  { num: 75, name: 'Go-to-Market Research', description: 'Combine ICP, positioning, pricing and channels', typicalOutput: 'GTM plan' },
  { num: 76, name: 'White-Space Analysis', description: 'Identify underserved customer/feature/geography combinations', typicalOutput: 'New opportunity areas' },
  { num: 77, name: 'Innovation Opportunity Research', description: 'Combine customer problems, technology and trends', typicalOutput: 'Innovation portfolio' },
  { num: 78, name: 'Startup Idea Validation', description: 'Test problem, audience, alternatives and willingness to pay', typicalOutput: 'Investment/build decision' },
  { num: 79, name: 'Business Model Research', description: 'Compare subscription, transaction, freemium, marketplace models', typicalOutput: 'Business-model selection' },
  { num: 80, name: 'M&A / Investment Market Research', description: 'Analyze industry attractiveness, growth and target companies', typicalOutput: 'Due diligence support' },
  { num: 81, name: 'Regulatory Market Research', description: 'Track privacy, AI, finance, health or industry regulation', typicalOutput: 'Compliance and market risk' },
  { num: 82, name: 'ESG / Sustainability Research', description: 'Analyze customer expectations, policies and competitors', typicalOutput: 'Sustainability strategy' },
  { num: 83, name: 'Patent / Innovation Landscape', description: 'Analyze patents, publications and technology players', typicalOutput: 'R&D direction' },
  { num: 84, name: 'Research / Publication Landscape', description: 'Map academic topics, institutions and emerging findings', typicalOutput: 'Technology/research scouting' },
  { num: 85, name: 'Funding / Investment Trend Research', description: 'Analyze VC deals, funding rounds and sectors', typicalOutput: 'Emerging-category identification' },
  { num: 86, name: 'Talent / Skills Market Research', description: 'Analyze job postings and skill demand', typicalOutput: 'Workforce planning' },
  { num: 87, name: 'Employer Brand Research', description: 'Analyze employee reviews and employer perception', typicalOutput: 'Talent strategy' },
  { num: 88, name: 'Supplier Market Research', description: 'Compare vendors, cost, quality and risk', typicalOutput: 'Procurement strategy' },
  { num: 89, name: 'Vendor Evaluation Research', description: 'Score technology/service providers', typicalOutput: 'Vendor shortlist' },
  { num: 90, name: 'AI-Generated Research Brief', description: 'Agents continuously collect and summarize market signals', typicalOutput: 'Faster executive decision-making' },
];

for (const m of RESEARCH_METHODOLOGIES) {
  const existing = db.select().from(schema.researchMethodologyCatalog).where(eq(schema.researchMethodologyCatalog.num, m.num)).get();
  const values = {
    name: m.name, description: m.description, typicalOutput: m.typicalOutput, status: 'not_started' as const,
    lastVerifiedAt: now, verifiedBy: 'claude-session-2026-09-15-demo-showcase',
  };
  if (existing) {
    db.update(schema.researchMethodologyCatalog).set(values).where(eq(schema.researchMethodologyCatalog.id, existing.id)).run();
  } else {
    db.insert(schema.researchMethodologyCatalog).values({ id: randomUUID(), num: m.num, createdAt: now, ...values }).run();
  }
}

console.log(`Research Methodology Catalog seed complete: ${RESEARCH_METHODOLOGIES.length} rows.`);
