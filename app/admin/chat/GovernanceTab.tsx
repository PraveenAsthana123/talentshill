'use client';

import { Tabs } from '@/components/ui';
import styles from './ChatShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a response-quality note from real message content and the real safety pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the admin&apos;s own response text, read at run time. <strong>PII handling:</strong> the pipeline&apos;s own pii_check exists specifically to catch PII accidentally pasted into a response before it&apos;s emailed to the visitor.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline safety scoring reuses <code>evaluateMessage()</code> (deterministic pii/toxicity/bias/safety/compliance checks, not a black box) — the same evaluator already used for automated bot responses — and writes the same real per-check rows to <code>chat_message_evals</code>. Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic safety scoring, or &quot;Run Agent&quot; (30-60s) for a written quality note alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the response message&apos;s own content, read at run time. This module&apos;s admin API (<code>/api/admin/chat</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on respond/update. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores one admin response&apos;s content for safety, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every respond/status-update action records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (pii/toxicity/compliance checks shown separately, each with the specific matched pattern or word when one is found).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>The pii_check directly supports data-minimization discipline — flagging accidental PII disclosure in an outbound support email before it&apos;s sent, not just after.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not jurisdiction-specific — the pii_check is a generic pattern match (email/SSN-like/card-like), not tuned to any one region&apos;s specific PII definitions.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, pre-existing risk this pipeline exists to catch:</strong> <code>evaluateMessage()</code> already ran on every automated bot response, but the human-admin respond endpoint (the path that actually reaches real customers most often) never called it — a safety-eval gap between the automated and human-authored paths.</li>
        <li>The underlying evaluateMessage() checks are pattern/keyword matches, not a trained classifier — they will miss PII, toxicity, or bias that doesn&apos;t match the specific patterns checked (a limitation of the pre-existing evaluator itself, not introduced by this pipeline).</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> Chat responses go directly to real customer email addresses, and the pii_check exists specifically to catch accidental PII disclosure before that happens — but pattern-matching has real, disclosed blind spots.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
