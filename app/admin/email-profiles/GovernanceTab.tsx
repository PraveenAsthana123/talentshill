'use client';

import { Tabs } from '@/components/ui';
import styles from './ProfilesShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a readiness recommendation from real profile data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Cross-module finding:</strong> the SMTP-linked check (35 of 100 points) exists because building the Compose module (Module 21) confirmed live that an unlinked profile silently falls back to process.env credentials at send time — a real risk to sender-identity correctness, not a hypothetical one.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the profile&apos;s own stored fields (never the SMTP password itself), read at run time. This module&apos;s admin API (<code>/api/admin/email-profiles</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on create/update/assign-smtp/delete. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores sender-profile configuration completeness, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/assign-smtp/delete action records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (fromEmail/replyTo/smtp-linked/signature/active checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — profiles carry no recipient PII, only sender identity configuration.</p>
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
        <li><strong>Real, cross-module risk this pipeline surfaces:</strong> an unlinked profile appears fully configured in this UI but silently sends via env-var credentials (or fails entirely with no env fallback) at send time — the SMTP-linked check exists specifically to catch this before an admin relies on it.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> No PII at the profile-record level, but a misconfigured profile has real, immediate sender-identity impact for every email sent through it.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
