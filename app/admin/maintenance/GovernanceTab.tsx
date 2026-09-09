'use client';

import { Tabs } from '@/components/ui';
import styles from './MaintenanceShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a recommendation from a real self-test (an actual live HTTP request to the public homepage) — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>The most significant bug found and fixed this session:</strong> <code>isMaintenanceMode()</code> (lib/ops/maintenance.ts) had zero callers anywhere in the codebase. Toggling &quot;Maintenance Mode: ON&quot; in this admin panel wrote a real settings row but had no actual effect on the public site whatsoever -- every visitor would have continued seeing the normal site during what the admin believed was an active maintenance window.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline enforcement checking is fully transparent and empirical (a real HTTP request and its real observed status code, not a simulated or assumed result). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for an instant real enforcement check, or &quot;Run Agent&quot; (30-60s) for the same check plus a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<>
    <Section title="How the fix works">
      <p>1. <code>getMaintenanceStatus()</code> now auto-expires <code>scheduledEnd</code> for real (previously stored and never checked). 2. A new public, unauthenticated route (<code>/api/maintenance-status</code>) exposes only <code>{'{enabled, message}'}</code> — not sensitive, and necessary because <code>middleware.ts</code> runs on the Edge runtime by default and cannot call better-sqlite3 directly. 3. <code>middleware.ts</code> gained a third matcher entry covering public pages only (explicitly excluding anything starting with <code>admin</code> or <code>api</code>, so an admin can never lock themselves out of the one panel that turns maintenance mode back off) and fetches the status route, returning a real 503 maintenance page when enabled.</p>
    </Section>
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. This module&apos;s admin API (<code>/api/admin/maintenance</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on every toggle/update. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  </>) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — maintenance mode affects every visitor identically, with no per-user or per-group targeting. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every toggle now records real <code>triggeredBy</code> — newly wired in this build (the route previously performed the mutation but never logged who flipped the site into or out of maintenance mode).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (the exact expected vs. observed HTTP status code, message length, and scheduledEnd validity shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not directly regulatory, but operationally significant: a site owner may rely on maintenance mode during a real outage or data migration window believing visitor traffic is blocked -- this fix closes a real gap between that belief and actual behavior.</p>
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
        <li><strong>Fail-open by design:</strong> if the internal fetch to <code>/api/maintenance-status</code> itself fails (network hiccup, cold start), the middleware serves the page normally rather than blocking it — a deliberate choice so a broken status check can never cause a full site outage on its own, at the cost of occasionally under-enforcing maintenance mode during a transient failure.</li>
        <li>API routes (non-admin) are deliberately NOT blocked during maintenance, so webhook receivers and the chat widget stay reachable — this is a scope decision, not an oversight, but means "maintenance mode" blocks pages, not every integration.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Was Critical (silent no-op), now Low.</strong> The core enforcement gap is fixed and live-verified; remaining risk is the standard, disclosed fail-open tradeoff above.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
