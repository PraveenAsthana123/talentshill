'use client';

import { Tabs } from '@/components/ui';
import styles from './BroadcastsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a pre-launch recommendation from real broadcast data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the broadcast&apos;s own stored fields only. <strong>Consent:</strong> handled at the audience-list level (Lists/Contacts modules) before a broadcast is sent, outside this module&apos;s scope.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written pre-launch recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the broadcast&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/broadcasts</code>) was already correctly RBAC-gated before this build (including the launch-vs-edit permission split noted in the [id] route). Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores broadcast-record completeness, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/launch/update/delete action records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (html/subject/audience/sender-profile/throttle checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the broadcast-record level — unsubscribe/consent state lives on the Lists/Contacts records referenced by <code>audienceId</code>, outside this module&apos;s scope.</p>
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
        <li><strong>Real, pre-existing risk this pipeline exists specifically to catch:</strong> <code>launchBroadcast()</code> has no guard today — a broadcast can be launched with no audience configured (silently sends to nobody) or no sender profile set. The readiness pipeline surfaces this before launch, but does not yet block the Launch button itself.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> No personal data at the broadcast-record level, but an unconfigured launch has real, immediate operational impact (a broadcast that appears &quot;sent&quot; but reached nobody) — exactly what the Pipeline tab&apos;s audience/sender checks exist to catch.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
