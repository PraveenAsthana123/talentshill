'use client';

import { Tabs } from '@/components/ui';
import styles from './RunsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a health recommendation from a run&apos;s real stored fields and the real health pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the run row&apos;s own stored fields plus its real run_events timeline only. <strong>Scope note:</strong> the runs table is currently populated by one real source (broadcast sends) — campaign/import/survey/form runs are documented in the schema&apos;s type enum but not yet wired to any real caller.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline health scoring is fully transparent (a real deterministic checklist, each check explicitly marked applicable/not-applicable per current status). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic health scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score. Use Force Status on the Manual tab for a deliberate manual override.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the run row&apos;s own stored fields and event timeline, read at run time. This module&apos;s admin API (<code>/api/admin/runs</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on force-status, plus real events on start/progress/completion/failure from its one real populating source. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores run-record health, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Force Status actions now record real <code>triggeredBy</code> and a real <code>status_forced</code> run_event — newly wired in this build (the route previously performed the mutation but never logged who did it, and had zero UI callers).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (started/completed/not-stuck/config checks shown separately, each explicitly marked applicable or not for the run&apos;s current status).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the run-record level — runs track execution metadata (status, timestamps, config), no recipient PII lives here directly.</p>
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
        <li><strong>Real, most severe bug found while testing this module (in Broadcasts, Module 17, not this module's own code):</strong> nothing anywhere in the app ever created a <code>broadcast_send</code> job. The Launch action (<code>PATCH .../broadcasts/[id]</code>, <code>action: 'launch'</code>) only ever flipped the broadcast&apos;s DB status to &apos;sending&apos; via <code>launchBroadcast()</code> — <code>handleBroadcastSend</code> (the fully-implemented job handler) was completely unreachable, so clicking &quot;Launch&quot; never sent a single real email. Fixed by having the launch action also enqueue a real <code>broadcast_send</code> job. Discovered specifically because fixing this module required a real send to test against.</li>
        <li><strong>Real, most fundamental gap in this module itself:</strong> <code>lib/db/run-queries.ts</code>&apos;s <code>createRun()</code>/<code>addRunEvent()</code> had zero callers anywhere in the app despite a real UI (Run Console) and real API reading from the table — the module registry&apos;s claim that this table was &quot;used by RAG evaluate, jobs, etc.&quot; was false (RAG uses its own separate <code>rag_runs</code> table). The runs/run_events tables were always empty, compounding the bug above. Fixed by wiring real run tracking into <code>lib/jobs/handlers/broadcast-sender.ts</code> — the first real populator, with a try/catch that marks the run &apos;failed&apos; (instead of leaving it stuck &apos;active&apos; forever) if the send job crashes.</li>
        <li><strong>Real fix, third orphaned endpoint found in the same investigation:</strong> the PATCH <code>/api/admin/runs/[id]</code> status-update route also had zero UI callers. Fixed by adding the Manual tab&apos;s Force Status control.</li>
        <li><strong>Honest, still-open gap:</strong> campaign/import/survey/form run types remain schema-only (in the <code>type</code> enum) with no real caller yet — only broadcast sends are wired as of this build.</li>
        <li><strong>Honest, still-open gap:</strong> there is no DELETE endpoint for a run row — cleaning up disposable test runs during this build required a direct database delete. Not fixed in this build since a Run Console&apos;s history is normally meant to be kept as an audit trail, not pruned via the UI; flagged here rather than silently worked around.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data at the run-record level; worst case was silent observability (an empty console giving false confidence that nothing needed watching), now fixed for broadcasts specifically.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
