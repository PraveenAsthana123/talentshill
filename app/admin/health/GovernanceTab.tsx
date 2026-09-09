'use client';

import { Tabs } from '@/components/ui';
import styles from './HealthShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts an operational-risk recommendation from real job-runner/error/failure-rate data and the real health pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Real bug fixed in this build:</strong> the existing <code>/api/admin/health</code> table-row-count check used <code>db.run(sql.raw(...))</code>, which discards SELECT result rows -- every table count on this page was silently 0 regardless of real data. Fixed to <code>db.get(...)</code>.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline health scoring is fully transparent (a real deterministic checklist rolled up from the same live data the Manual tab reads, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic health scoring, or &quot;Run Agent&quot; (30-60s) for a written operational-risk recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: job runner status, job_logs errors, queue stats, and DB file size, all read at run time. This module&apos;s admin API (<code>/api/admin/health</code>) was already correctly RBAC-gated before this build. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores system operational status, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every Pipeline/Agentic run records real <code>triggeredBy</code>. This module has no create/update/delete of its own — it is a read-only status rollup.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (job-runner/errors/failure-rate/db-size checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — this module surfaces operational metrics only, no recipient or subject PII.</p>
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
        <li><strong>Real, pre-existing risk this build fixes:</strong> the table-row-count display (used to sanity-check real data volume at a glance) was silently wrong for every table, every time this page was viewed, until this build&apos;s <code>db.get()</code> fix.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data at the snapshot level, and the pipeline is purely observational — it never restarts the job runner or clears errors.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
