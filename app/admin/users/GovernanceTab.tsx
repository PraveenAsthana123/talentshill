'use client';

import { Tabs } from '@/components/ui';
import styles from './UsersShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Users. This module is meaningfully
// different from the content-catalog modules (industries/services/videos)
// -- it IS the access-control system, not content protected by it, so
// the governance framing is about admin-account risk, not content quality.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a fix recommendation from real account/role data and the real security-check pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the account&apos;s own stored fields (name, email, active status) and its real RBAC role/permission assignments only. <strong>Consent:</strong> not applicable — these are internal staff accounts, not customer data.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline security scoring is fully transparent (a real deterministic checklist against actual RBAC state, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic security scoring, or &quot;Run Agent&quot; (30-60s) for a written fix recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the account&apos;s own stored fields plus real userRoles/rolePermissions joins, read at run time. This module&apos;s admin API (<code>/api/admin/users</code>) was already correctly RBAC-gated before this build — no security remediation needed. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores account access-control configuration, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/deactivate action records real <code>triggeredBy</code> — who granted or revoked access to whom, now real transactional history for this most access-sensitive module in the portal.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (role-assignment/active-status/permission-resolution checks shown separately, not just a final number). The Agentic tab&apos;s SEARCH step additionally lists the account&apos;s actual assigned role names.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real consideration:</strong> this module manages internal staff access credentials, not customer PII directly, but a roleless-yet-active account or an over-permissioned account is a real access-control compliance risk (least-privilege violation) — exactly the class of issue the Pipeline tab is built to surface.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not implemented — no jurisdiction-specific access-control policy differentiation (e.g. SOC2/ISO27001-style access review cadence enforcement).</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, pre-existing risk this pipeline exists specifically to catch:</strong> an active account with zero RBAC roles, or roles that resolve to zero permissions -- a real least-privilege/access-hygiene gap, not hypothetical.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> Higher than pure content modules because this module directly controls who can do what across the entire admin portal -- a misconfigured account here has portal-wide blast radius, even though the module&apos;s own API was already properly access-controlled.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
