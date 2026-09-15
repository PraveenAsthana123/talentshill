import { defineGoldenPath } from '../lib/goldenpath/golden-path';

const PATHS: Parameters<typeof defineGoldenPath>[0][] = [
  {
    code: 'GP-01',
    title: 'Evidence Ledger wired into real lead scoring',
    description: 'A real lead-scoring pipeline run writes a real, traceable evidence_record row -- confirmed live against a real contact_submissions row.',
    evidenceDocPath: 'docs/testing/2026-09-14_evidence-ledger-log.txt',
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  },
  {
    code: 'GP-02',
    title: 'Strategic layer chain: Evidence -> KPI -> Opportunity -> Growth Readiness -> Growth Brief',
    description: 'A generated Growth Brief exactly matches the independently-verified real Growth Readiness score, all 6 real KPI dimensions, and the real top-ranked Opportunity -- confirms genuine end-to-end composition across 4 real engines.',
    evidenceDocPath: 'docs/testing/2026-09-14_growth-brief-log.txt',
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  },
  {
    code: 'GP-03',
    title: 'Research-Depth Router genuinely gates a real costed Ollama call',
    description: 'A real cold-tier lead\'s PLAN step correctly skips its real Ollama call (0 tokens), while ACT still runs normally -- a measurable, live-verified cost reduction, not standalone unused logic.',
    evidenceDocPath: 'docs/testing/2026-09-14_research-depth-router-log.txt',
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  },
  {
    code: 'GP-04',
    title: 'Case Study evidence-gated publishing (2-layer enforcement)',
    description: 'Publishing without a real evidence_record citation is blocked at the app layer; a fabricated evidenceId is additionally rejected by a real SQLite foreign-key constraint at creation time.',
    evidenceDocPath: 'docs/testing/2026-09-14_case-study-engine-log.txt',
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  },
  {
    code: 'GP-05',
    title: 'Customer Occasion Messaging: real birthday trigger, real dedupe',
    description: 'Pre-existing real flow (built earlier this session, before the gap-analysis backlog): a real contact with a real date_of_birth=today matches and logs a correctly personalized message; a second same-day trigger run correctly skips the already-messaged contact.',
    evidenceDocPath: 'docs/testing/2026-09-14_occasion-messaging-log.txt',
    verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  },
];

for (const p of PATHS) {
  const id = defineGoldenPath(p);
  console.log(`Registered ${p.code}: ${id}`);
}
