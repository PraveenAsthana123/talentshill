'use client';

import { Tabs } from '@/components/ui';
import styles from './BannersShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a fix recommendation from real banner data and the real health pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the banner&apos;s own stored fields only. No personal data is involved — banners are site-wide public content, not tied to any individual user. <strong>Consent:</strong> not applicable.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline health scoring is fully transparent (a real deterministic checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic health scoring, or &quot;Run Agent&quot; (30-60s) for a written fix recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the banner&apos;s own stored fields, read at run time via the SQLite database. This module&apos;s admin API (<code>/api/admin/banners</code>) was already correctly RBAC-gated before this build. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores content-integrity of site-wide public banners, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/delete action now records real <code>triggeredBy</code> (newly wired in this build — the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (schedule/stale-active/CTA/content checks shown separately, not just a final number). The Agentic tab&apos;s SEARCH step additionally surfaces which specific checks failed.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — banners carry no personal data and are public-facing content only. The real operational risk here is a stale-active banner showing incorrect/expired promotional claims to site visitors (a customer-trust issue, not a regulatory one).</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p><strong>Not implemented.</strong> No jurisdiction-aware banner targeting (e.g. a region-specific promotional disclaimer) — a real open item if TalentsHill needs geo-targeted banners in future.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Real, pre-existing risk this pipeline exists specifically to catch:</strong> a banner can be left marked active past its own end date and continue displaying stale content indefinitely — the stale_active_check stage detects this directly.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data, no destructive-without-confirmation admin actions (delete requires a browser confirm dialog), and the pipeline itself is a risk-reduction tool for a real content-freshness bug class.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
