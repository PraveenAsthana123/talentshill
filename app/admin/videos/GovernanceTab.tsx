'use client';

import { Tabs } from '@/components/ui';
import styles from './VideosShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a content-improvement suggestion from real video data and the real content-readiness pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the video record&apos;s own stored fields only. No personal data is involved — videos are public marketing content. <strong>Consent:</strong> not applicable.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline content scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic content scoring, or &quot;Run Agent&quot; (30-60s) for a written improvement suggestion alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the video record&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/videos</code>) was already correctly RBAC-gated before this build — no security remediation needed. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores content-completeness of public marketing pages, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/delete action records real <code>triggeredBy</code> via both the pre-existing audit log (<code>logAudit</code>) and the newly-added standard operation_run history — dual-logged, not replaced.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (thumbnail/summary/tags/category/duration/active checks shown separately, not just a final number). The Agentic tab&apos;s SEARCH step additionally surfaces which specific checks failed.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — video records carry no personal data and are public marketing content only.</p>
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
        <li>A thin content record (missing thumbnail/summary/tags) rendering on the real public page is the main quality risk this pipeline exists to catch.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data, no regulatory surface, and the module was already properly access-controlled before this build.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
