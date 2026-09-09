'use client';

import { Tabs } from '@/components/ui';
import styles from './AppointmentsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Appointments. This module was the
// site of a real, fixed security finding (2026-09-09): the public booking
// API was unintentionally serving admin-level read/write with zero auth --
// see the GovAI and Risk AI sections below for the actual disclosure.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a follow-up recommendation from real booking data and the real urgency pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the booking&apos;s own submitted form fields only. <strong>Consent:</strong> the public booking form is the only intake path — filling it out and submitting is the consent event, no separate opt-in exists or is verified. <strong>Bias checks:</strong> the booking-time leadScore formula weights company size and budget heavily, which could systematically deprioritize smaller/earlier-stage prospects — not formally evaluated for this bias.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline urgency scoring is fully transparent (a real deterministic formula, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic urgency scoring, or &quot;Run Agent&quot; (30-60s) for a written next-step recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<>
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the booking&apos;s own submitted fields, read at run time (a flat JSON file, not the SQLite database used by every other module — a real architectural inconsistency, not yet migrated). Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
    <Section title="Disclosed remediation">
      <p><strong>Fixed 2026-09-09:</strong> the admin data source for this module (list/detail/status-update/delete/export) previously lived at an unauthenticated public API path. Moved to RBAC-gated <code>/api/admin/appointments/*</code> routes; verified live that unauthenticated requests now 401/404/405 and the authenticated admin flow is unaffected. See the Log &amp; Tracking tab and commit history for the full record.</p>
    </Section>
  </>) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p><strong>Real gap:</strong> both the booking-time leadScore and the follow-up urgency score weight company size/budget/timeline, which structurally favors larger, better-funded prospects for prioritized attention over smaller ones with genuine intent. Not formally evaluated for this bias — flagged, not fixed.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every pipeline/agentic run records real <code>triggeredBy</code>. Booking creation itself is customer-initiated (triggeredBy=null, correctly attributed to the public form, not a staff account) — status changes and deletions require a real logged authenticated admin action, which was NOT true before the 2026-09-09 fix.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (status/tier/staleness components shown separately, not just a final number). The Agentic tab&apos;s PLAN step additionally logs the agent&apos;s own stated reasoning.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real, higher-severity gap than other modules:</strong> this module handles the most detailed personal + business data collected anywhere on the site (name, email, phone, company, job title, company size, budget, timeline, free-text use-case) via a public form with no explicit consent checkbox, and until 2026-09-09 that full data set was also unauthenticated-readable. No formal data-retention or right-to-deletion workflow verified. A real compliance exposure under GDPR/CCPA-type regimes.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction detection or region-specific data-handling rules for bookings (e.g. EU vs. non-EU prospects) — a real open item.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li><strong>Fixed, disclosed:</strong> unauthenticated access to full booking PII and write/delete capability via the public API path — see GovAI above for the fix and Log &amp; Tracking for verification evidence.</li>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li>File-based storage (data/appointments.json) instead of the SQLite database every other module uses — no transactional guarantees under concurrent writes, a real architectural risk at higher booking volume, not yet migrated.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium (post-fix), was High pre-fix.</strong> The unauthenticated-access finding was the module&apos;s most severe issue and is now closed. Remaining risk is the file-based storage concurrency gap and the unweighted fairness concern above.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
