'use client';

import { Tabs } from '@/components/ui';
import styles from './ListsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a list-health recommendation from real segment-sync results and the real sync pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Real cross-module bug fixed in this build:</strong> dynamic-list segment rules were evaluable for a UI preview (capped at 10 sample contacts) but never materialized into real <code>listMembers</code> rows. <code>lib/jobs/handlers/broadcast-sender.ts</code> resolves audience by reading <code>listMembers</code> directly and never evaluates segment rules -- a broadcast targeted at a dynamic list silently reached zero recipients. This pipeline performs the real sync that was missing.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline sync is fully transparent (real evaluate/diff/materialize stages shown separately, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; to sync a dynamic list&apos;s real membership instantly, or &quot;Run Agent&quot; (30-60s) for the same sync plus a written list-health recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the list&apos;s own segment rules and the real contacts table, read and diffed at run time. This module&apos;s admin API (<code>/api/admin/lists</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on create/update/add-members/remove-members/delete. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Segment rules are admin-authored filters on contact fields (e.g. company, status) -- not a protected-class targeting surface in this system. No bias vector identified in the sync mechanism itself; rule content is the admin&apos;s own business logic.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/add-members/remove-members/delete action now records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (the exact matching contact count, the exact add/remove diff, all shown before and after materialization).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>List membership changes affect who receives marketing email — correctness here is directly relevant to consent/targeting accuracy, which this build&apos;s sync fix directly improves for dynamic lists.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not jurisdiction-specific — the sync mechanism is general; consent/unsubscribe enforcement happens at the Contacts/Broadcasts level, outside this module&apos;s scope.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, disclosed gap:</strong> the Manual tab&apos;s Create-List form has no segment-rule builder UI — a dynamic list created there has no rules until set via the API directly, so its first sync correctly reports &quot;invalid or missing segmentRules&quot; rather than silently succeeding with zero rules.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Was High, now Low for lists that are actually synced.</strong> Before this fix, every dynamic list silently failed to deliver to its real audience. The remaining risk is operational: a dynamic list must actually be run through Pipeline/Agentic (or a future scheduled sync) to stay current — it does not yet sync automatically on a schedule.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
