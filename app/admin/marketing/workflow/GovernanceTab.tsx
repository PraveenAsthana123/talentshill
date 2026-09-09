'use client';

import { Tabs } from '@/components/ui';
import styles from './WorkflowShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a consistency recommendation from real workflow data and the real readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the workflow&apos;s own stored fields (status, linked content/asset/list/campaign ids) only. <strong>Scope note:</strong> this module covers the Workflow (create) and Approvals (review) pages, which share one real entity (<code>marketing_workflows</code>). Segments reuses the Lists module (Module 26); Monitor reuses Campaigns — neither is duplicated here.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline consistency scoring is fully transparent (a real deterministic checklist, not a black box, with each check explicitly marked applicable/not-applicable per current status). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic consistency scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the workflow&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/workflows</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on create/update-step/update-status/approve/delete. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores workflow-record consistency, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update-step/update-status/approve/delete action now records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it, beyond the workflow&apos;s own <code>approvedBy</code> field on the real approve action).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (content/targeting/approval/completion checks shown separately, each explicitly marked applicable or not for the workflow&apos;s current status).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the workflow-record level — workflows orchestrate content/targeting/campaign links, no recipient PII lives here directly (that&apos;s in the linked Contacts/Lists/Campaigns records).</p>
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
        <li><strong>Real, pre-existing risk this pipeline exists to catch:</strong> <code>PATCH .../[id] {'{'} action: &apos;update-status&apos; {'}'}</code> accepts any status transition with zero prerequisite validation — a workflow can be marked &quot;approved&quot; or &quot;completed&quot; without ever going through the real Approvals page action or having real content/targeting linked. The readiness pipeline surfaces this, but does not yet block the raw status-update endpoint itself.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> No personal data at the workflow-record level, but an inconsistent workflow could reach &quot;approved&quot; without real review, or &quot;completed&quot; with no audience ever targeted — exactly what the Pipeline tab&apos;s checks exist to catch before that happens.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
