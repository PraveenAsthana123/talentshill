'use client';

import { Tabs } from '@/components/ui';
import styles from './TemplatesShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a content-improvement suggestion from real template data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the template&apos;s own stored fields only. No personal data is involved — templates are reusable content shells, not filled with real recipient data until send time. <strong>Consent:</strong> not applicable to the template itself (consent applies at actual send time, outside this module).</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist including a real variable-consistency parser, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written improvement suggestion alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the template&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/templates</code>) was already correctly RBAC-gated before this build — no security remediation needed. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores template content-completeness, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/delete action records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (html/text/subject/variable-consistency/active checks shown separately). The variable-consistency stage specifically lists the exact declared vs. used placeholder sets, not just pass/fail.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the template level — the template itself carries no recipient PII. Compliance considerations (consent, unsubscribe links, CAN-SPAM/CASL headers) apply at actual send time via the campaigns/broadcasts modules, outside this module&apos;s scope.</p>
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
        <li><strong>Real, pre-existing risk this pipeline exists specifically to catch:</strong> an undeclared {'{{'}placeholder{'}}'} used in a template&apos;s HTML or subject renders literally, unfilled, in every email sent from it — a real production embarrassment risk, not hypothetical.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low-Medium.</strong> No personal data at the template level, but the unfixed-placeholder failure mode has real customer-facing impact if it ships — exactly what the Pipeline tab&apos;s variable-consistency check exists to catch before send time.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
