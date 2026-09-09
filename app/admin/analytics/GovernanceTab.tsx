'use client';

import { Tabs } from '@/components/ui';
import styles from './AnalyticsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a program-improvement recommendation from real campaign/contact rollups and the real health pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> aggregate counts and rates only, rolled up from the Campaigns and Contacts tables — no individual contact PII surfaces in this module. <strong>Benchmark disclosure:</strong> the 25% open-rate / 3% click-rate / 1% bounce-rate benchmarks are disclosed, typical email-marketing industry figures, not empirically validated for this specific business.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline health scoring is fully transparent (a real deterministic checklist scaled to disclosed benchmarks, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic program-health scoring, or &quot;Run Agent&quot; (30-60s) for a written priority recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: aggregate rollups from Campaigns/Contacts, read at run time. This module&apos;s admin API (<code>/api/admin/analytics</code>) was already correctly RBAC-gated before this build. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores aggregate program performance, not individuals. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every Pipeline/Agentic run records real <code>triggeredBy</code>. This module has no create/update/delete of its own — all record-level mutations happen in the Campaigns and Contacts modules, which carry their own transactional history.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (open/click/bounce/contact-health checks shown separately, each against its disclosed benchmark).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the rollup level — this module surfaces aggregate rates only. Compliance considerations (consent, unsubscribe, CAN-SPAM/CASL) apply at the Campaigns/Contacts record level, outside this module&apos;s scope.</p>
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
        <li><strong>Benchmark mismatch risk:</strong> the disclosed 25%/3%/1% benchmarks are generic industry figures. If this business&apos;s real target audience or send cadence differs meaningfully, the health score could over- or under-state actual program health — flagged here rather than presented as a validated target.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data at the snapshot level, and the pipeline is purely observational — it never edits any campaign or contact record.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
