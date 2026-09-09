'use client';

import { Tabs } from '@/components/ui';
import styles from './LeadsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Leads. Different risk profile from
// Competitor Analysis: leads ARE personal data (name/email/phone), so
// privacy/consent considerations are real and load-bearing here, not a
// minor footnote.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a qualification narrative from real submission data — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the lead&apos;s own form submission only. <strong>Consent:</strong> the contact form requires <code>consent=true</code> to submit — this module processes personal data, so consent is a real, load-bearing control here (unlike Competitor Analysis, which handles no personal data). <strong>Bias checks:</strong> not formally run — real gap.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline scoring is fully transparent (a real lookup table, not a black box). Agentic narrative reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic scoring, or &quot;Run Agent&quot; (30-60s) for a written narrative alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the lead&apos;s own submitted form fields, read at run time. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p><strong>Real gap:</strong> the scoring rubric weights budget/timeline/stage equally regardless of industry or company size, which could systematically disadvantage smaller/earlier-stage companies with genuinely strong intent but smaller budgets. Not formally evaluated for this kind of bias — flagged, not fixed.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every run records real <code>triggeredBy</code>. Unlike Competitor Analysis, scores here are written immediately (not held in a draft/pending state) since scoring is deterministic and low-risk — but status changes (contacted/qualified/closed) still require a real logged human action.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (each score component shown separately, not just a final number). The Agentic tab&apos;s PLAN step additionally logs the agent&apos;s own stated reasoning.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real consideration:</strong> this module processes personal data (name, email, phone) collected via consent. No formal data-retention policy or right-to-deletion workflow has been verified for this module — a real compliance gap if operating under GDPR/CCPA-type regimes, not yet checked.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction detection or region-specific data-handling rules (e.g. EU leads vs. non-EU) — a real open item if TalentsHill has leads from regulated jurisdictions.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic narrative — mitigated by an explicit "don't invent facts" prompt, not formally red-teamed for this module specifically.</li>
        <li>Scoring rubric gaming — since the rubric is fully deterministic and documented, a lead (or whoever fills the form) could theoretically pick answers to maximize score. Low real-world risk since forms are usually filled honestly by genuine prospects, but not zero.</li>
        <li>PII handling — real personal data is processed; no formal data-retention or deletion policy verified.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> Higher than Competitor Analysis because this module handles real personal data (PII) rather than public company research — the compliance gap above is the main driver, not the AI components themselves.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
