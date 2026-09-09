'use client';

import { Tabs } from '@/components/ui';
import styles from './ModuleRegistryShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a drift recommendation from a registry row&apos;s real stored fields and the real drift pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the registry row&apos;s own stored fields only (built_status, last_verified_at, missing_items, has_admin_ui, api_route_count) — no code is re-read at run time, so a drift score of 100 means the recorded fields are internally consistent and recently verified, not that the underlying module was re-audited.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline drift scoring is fully transparent (a real deterministic checklist, each check explicitly marked applicable/not-applicable per current status). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic drift scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score. Or click &quot;Verify&quot; on the Manual tab to record a real re-check.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the registry row&apos;s own stored fields, read at run time. This module&apos;s admin API (<code>/api/admin/module-registry</code>) is RBAC-gated under the &apos;health&apos; resource (a meta/introspection module, not its own resource) — now also carries real transactional history on verify/pipeline/agentic. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores registry-record consistency, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Verify actions record real <code>verifiedBy</code> and <code>lastVerifiedAt</code> (pre-existing schema fields) — but until this build, the PATCH endpoint that writes them had zero UI callers, a real orphaned-endpoint gap found and fixed by adding the Manual tab&apos;s Verify button.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (recency/description/status-consistency/UI-consistency checks shown separately with their real inputs and outputs).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — this is an internal engineering-catalog module with no recipient PII.</p>
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
        <li><strong>Real, pre-existing gap found in this build:</strong> the registry&apos;s own PATCH &quot;verify&quot; endpoint existed with zero UI callers before this build — a registry row could show a stale lastVerifiedAt indefinitely with no way to update it short of a raw API call. Fixed by adding the Manual tab&apos;s Verify button.</li>
        <li><strong>Honest, still-open gap:</strong> per the Module Understanding Standard, a real scheduled job should flag registry drift automatically. This module exposes the same drift check manually/on-demand (Pipeline/Agentic tabs) but does not yet run on a cron schedule — see Monitoring tab.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No personal data at the registry-record level; worst case is a stale or inconsistent catalog row, which the drift pipeline now surfaces (though does not yet auto-run).</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
