'use client';

import { Tabs } from '@/components/ui';
import styles from './SurveyShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a follow-up recommendation from real response data and the real outreach-priority pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the respondent&apos;s own submitted assessment answers only. <strong>Consent:</strong> filling out and submitting the assessment is the consent event — contact fields (name/email/company) are optional in the form itself, and the pipeline correctly scores 0 for the email component when absent rather than assuming consent to contact. <strong>Bias checks:</strong> not formally run.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline outreach scoring is fully transparent (a real deterministic formula, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic priority scoring, or &quot;Run Agent&quot; (30-60s) for a written follow-up recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the respondent&apos;s own submitted fields, read at run time. This module&apos;s admin API (<code>/api/admin/survey</code>) was already correctly RBAC-gated before this build — no security remediation was needed here, unlike the appointments and blog modules. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p><strong>Real gap:</strong> the outreach-priority formula weights the respondent&apos;s own AI-maturity score at 50%, which could deprioritize genuinely interested but early-stage (low-maturity) prospects who may in fact be more receptive to a sales conversation. Not formally evaluated for this bias — flagged, not fixed.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every pipeline/agentic run records real <code>triggeredBy</code>. This module has no create/edit/delete operations on responses (survey submission is one-way and anonymous-optional) — only real-time scoring, so there is no destructive action requiring additional sign-off.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (maturity-score contribution, email/company/recency components shown separately). The Agentic tab&apos;s PLAN step additionally logs the agent&apos;s own stated reasoning.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real consideration:</strong> this module processes optional personal data (name, email, company) collected without an explicit consent checkbox distinct from assessment submission itself. No formal data-retention or right-to-deletion workflow verified — a real compliance gap if operating under GDPR/CCPA-type regimes, not yet checked.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction detection or region-specific data-handling rules for respondents — a real open item.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;don&apos;t invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li>Anonymous responses (no email/company) always score low outreach priority by design — correct behavior, but worth noting they are still visible in aggregate maturity/industry stats even with no contact path.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> Lower than Contacts/Appointments/Blog — this module was already properly access-controlled, has no personal-data write path beyond the respondent&apos;s own one-time submission, and no destructive admin actions exist.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
