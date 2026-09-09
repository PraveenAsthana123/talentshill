'use client';

import { Tabs } from '@/components/ui';
import styles from './BlogShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Blog. This module was the site of
// a real, fixed security finding (2026-09-09): the public content API was
// unintentionally serving admin-level create/edit/delete/publish and full
// subscriber-PII read with zero auth -- see GovAI/Risk AI below.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts an editorial improvement suggestion from real post data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the post&apos;s own stored fields only. <strong>Consent:</strong> newsletter subscription is an explicit opt-in action (POST /api/blog/subscribers); no other consent mechanism applies to content itself. <strong>Bias checks:</strong> not applicable — this pipeline scores structural SEO completeness, not editorial content/viewpoint.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written top-improvement suggestion alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<>
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the post&apos;s own stored fields, read at run time via the SQLite database. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
    <Section title="Disclosed remediation">
      <p><strong>Fixed 2026-09-09:</strong> the admin data source for this module (post list/create/edit/delete/publish, category creation, subscriber list, stats) previously lived at unauthenticated public API paths — the same class of bug as the appointments module fix. Moved to RBAC-gated <code>/api/admin/blog/*</code> routes; the public list route also had its <code>?admin=true</code> draft-bypass removed entirely rather than merely gated. Verified live that unauthenticated requests now 401/404/405 and the authenticated admin flow, plus the genuinely public read/subscribe/track paths, are unaffected.</p>
    </Section>
  </>) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable in the way it is for lead/contact scoring — this pipeline scores structural post completeness (has a meta description, has a cover image, etc.), not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/delete/publish action now records real <code>triggeredBy</code>, which was NOT true before the 2026-09-09 fix (the old unauthenticated routes had no session to attribute to at all).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (each readiness component shown separately, not just a final number). The Agentic tab&apos;s SEARCH step additionally surfaces which specific checks scored zero.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real, higher-severity gap than most modules, now closed:</strong> until 2026-09-09, the full newsletter subscriber list (real emails) was readable by anyone with zero auth — a clear PII exposure under GDPR/CCPA-type regimes. Now RBAC-gated. No formal data-retention or right-to-erasure workflow verified for subscribers beyond the existing unsubscribe-token flow.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction detection or region-specific handling for subscriber data (e.g. EU vs. non-EU) — a real open item.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li><strong>Fixed, disclosed:</strong> unauthenticated draft-content read, post create/edit/delete/publish, category creation, and subscriber-PII read via the public API path — see GovAI above for the fix and Log &amp; Tracking for verification evidence.</li>
        <li>Hallucination in the Agentic suggestion — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li>The public content-creation/edit/delete path being unauthenticated (pre-fix) was also a defacement risk — anyone could have altered or deleted live public content, not just leaked it.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium (post-fix), was High pre-fix</strong> — this was the most severe finding across the modules audited so far, combining PII exposure (subscriber emails), content-integrity risk (unauthenticated edit/delete/publish of public-facing content), and information disclosure (unpublished drafts). Now closed.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
