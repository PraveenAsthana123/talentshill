'use client';

import { Tabs } from '@/components/ui';
import styles from './OverridesShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a safety recommendation from real override data and the real safety pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the override&apos;s own stored fields only. <strong>Honest scope disclosure:</strong> <code>getOverrides(pageSlug)</code> exists and is real, working code, but grep across the codebase found zero callers on any public page today — this module currently affects nothing a visitor sees. Documented here rather than implied otherwise.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline safety scoring is fully transparent (a real deterministic XSS-pattern/completeness checklist, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic safety scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the override&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/content-overrides</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on upsert/toggle/delete. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores override-record safety, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every upsert/toggle/delete action records real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (xss-pattern/value-present/slug-format checks shown separately, with the exact matched pattern when one is found).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — overrides carry no recipient or subject PII, only page-content key/value pairs.</p>
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
        <li><strong>Real, forward-looking risk this pipeline exists to catch:</strong> if a future page is wired to call <code>getOverrides()</code> and render its value unescaped, a script-tag or javascript: URI stored today would execute for every visitor. The XSS check exists now, before that wiring happens, not after.</li>
        <li><strong>Currently disclosed limitation:</strong> this module has zero live effect on the public site today (no page calls <code>getOverrides()</code>) — a real, honestly-reported gap, not a fabricated integration.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low today, would be Medium-High if wired without this check.</strong> No live public-facing impact currently, but the safety check is deliberately in place before that changes.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
