'use client';

import { Tabs } from '@/components/ui';
import styles from './ComposeShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a pre-send recommendation from the real draft fields and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Real bug fixed in this build:</strong> the Compose form has always offered a &quot;Profile (optional)&quot; dropdown, but the send route discarded the selected <code>profileId</code> and always resolved the sender via a hardcoded <code>eventType: &apos;broadcast&apos;</code> route. <code>lib/email/profile-mailer.ts</code>&apos;s <code>sendWithProfile()</code> now accepts an explicit <code>profileId</code> that takes precedence, so the admin&apos;s selection is actually honored.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written pre-send recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the draft form fields, never persisted beyond the real <code>email_compose_log</code> audit row. This module&apos;s admin API (<code>/api/admin/email-compose</code>) was already correctly RBAC-gated before this build — now also carries real transactional history and a fixed sender-profile bug. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores draft-email completeness, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every send now records real <code>triggeredBy</code> in both <code>operation_run</code> and the new <code>email_compose_log</code> table — newly wired in this build (the route previously performed the send but never logged who did it or with what outcome).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (recipient/subject/html/profile checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the pipeline level — this is a one-off transactional send tool, not a marketing broadcast; no unsubscribe/consent tracking applies here (that lives in the Broadcasts/Contacts modules for bulk sends).</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not applicable for the same reason as Compliance AI above.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, pre-existing risk this build fixes:</strong> the silently-dropped <code>profileId</code> meant every one-off email sent from a non-default sender identity actually still went out under the default/broadcast identity — a real correctness bug with brand/identity impact, not hypothetical.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No persisted draft entity beyond the audit log, and the readiness pipeline never sends an email itself — it is purely observational.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
