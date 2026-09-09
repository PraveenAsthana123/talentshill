'use client';

import { Tabs } from '@/components/ui';
import styles from './ContactsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Contacts. Higher PII exposure than
// Leads: this is the master CRM record (bulk CSV import of arbitrary
// third-party emails/phones), and unlike the contact form (consent=true
// required to submit), manually-added or imported contacts carry no
// verified consent record at all -- a real, load-bearing gap here.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts an engagement recommendation from real completeness-pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> contacts arrive via manual entry, CSV import, or other module writes (contact_form/survey/booking/newsletter) — sources vary in reliability. <strong>Consent:</strong> unlike Leads (which requires <code>consent=true</code> on the contact form), CSV-imported and manually-added contacts have no verified consent record — a real, unresolved gap for a CRM handling bulk PII. <strong>Bias checks:</strong> not formally run.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline scoring is fully transparent (a real weighted rubric, not a black box). Agentic recommendation reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the contact&apos;s own stored fields, read at run time. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p><strong>Real gap:</strong> the completeness rubric rewards contacts with more filled-in fields and higher-intent sources, which structurally scores CSV-imported bulk contacts (often thinner data) lower than form-submitted ones regardless of actual engagement potential. Not formally evaluated for this bias — flagged, not fixed.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every run records real <code>triggeredBy</code>. CSV imports are attributed to the importing admin session, but individual imported rows carry no per-row approval step before being scored and surfaced.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (each score component — name, company, phone, tags, source, status — shown separately). The Agentic tab&apos;s PLAN step additionally logs the agent&apos;s own stated reasoning.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real, higher-severity gap than Leads:</strong> this module stores and processes bulk third-party PII (email, phone, company) via CSV import with no verified consent trail, and no formal data-retention or right-to-deletion workflow. A real compliance exposure if operating under GDPR/CCPA-type regimes — not yet checked or remediated.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction detection or region-specific data-handling rules for imported contacts (e.g. EU vs. non-EU) — a real open item.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li>Unverified-consent bulk PII — CSV import accepts arbitrary rows with no consent check; this is the module&apos;s most material real risk.</li>
        <li>Score gaming via import — a bulk importer could pad tags/company fields to inflate scores; low real-world incentive but not zero.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium-High.</strong> Higher than Leads because contacts can enter in bulk via CSV import with no consent verification, versus Leads&apos; single-record, consent-gated contact-form intake.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
