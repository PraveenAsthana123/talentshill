'use client';

import { Tabs } from '@/components/ui';
import styles from './IntegrationsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a readiness recommendation from real account data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Real security fix in this build:</strong> the list and detail APIs previously returned each account&apos;s raw <code>credentials</code> field verbatim (plaintext API keys/secrets) to the browser on every page load. Fixed to redact the field entirely, exposing only a <code>hasCredentials</code> boolean.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist, not a black box) and never reads or exposes the credential value itself. Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the account&apos;s status/error fields only, never the credential value. This module&apos;s admin API (<code>/api/admin/integrations</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on create/delete/test, and a fixed <code>connectedBy</code> gap (the field existed but was never populated on account creation).</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores connection-record completeness, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/delete/test action records real <code>triggeredBy</code> — newly wired in this build. <code>connectedBy</code> is now populated on creation (previously always null despite the schema supporting it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (credentials/status/error/tested checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Credential secrecy is directly compliance-relevant — this build&apos;s redaction fix reduces exposure surface for third-party API keys/secrets stored in this system.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not jurisdiction-specific — the credential-redaction fix is a general security hardening, not tied to any one region&apos;s regulation.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, disclosed gap not fixed in this build:</strong> credentials are stored as plain JSON in <code>integration_accounts.credentials</code> (the schema comment claims &quot;(encrypted)&quot; but no encryption is actually applied). A separate <code>integration_credentials</code> table exists in the schema for normalized encrypted storage but has zero real callers anywhere in the codebase — encryption-at-rest remains a real, open gap beyond this session&apos;s scope.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium-High.</strong> Third-party credentials at rest are unencrypted (a real, disclosed gap); this build closes the more immediately exploitable client-exposure path (credentials no longer travel to the browser) but does not close the at-rest gap.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
