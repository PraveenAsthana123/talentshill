'use client';

import { Tabs } from '@/components/ui';
import styles from './SettingsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts an integrity recommendation from a setting&apos;s real stored value and the real integrity pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the setting&apos;s own stored value only.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline integrity scoring is fully transparent (a real deterministic checklist, each check explicit about format expectations and current public-wiring status). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic integrity scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the setting&apos;s own stored value, read at run time. This module&apos;s admin API (<code>/api/admin/settings</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on update. A new public route (<code>/api/settings/public</code>) intentionally exposes only 6 non-sensitive keys, unauthenticated, for the public site to read. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores setting-record integrity, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Setting updates already recorded real <code>updatedBy</code> and a real audit-log row before this build; now also carry a real manual operation_run.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (value-present/format/public-wiring/not-placeholder checks shown separately with their real inputs and outputs).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable — site configuration values carry no recipient PII.</p>
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
        <li><strong>Real, headline fix in this build:</strong> the Social Links group had zero real public readers — <code>components/Footer.tsx</code> read build-time <code>NEXT_PUBLIC_*</code> env vars instead, so editing LinkedIn/Facebook/WhatsApp here silently did nothing. Fixed by adding a real public route (<code>GET /api/settings/public</code>) and wiring Footer.tsx to read it, overriding the env-var defaults when a DB value is present. Verified live.</li>
        <li><strong>Real fix, architectural duplication found:</strong> the &quot;Features&quot; group (feature_blog/survey/chatbot/booking) wrote to this generic key-value <code>site_settings</code> table under keys that exactly collided in name with the real, separately-built <code>feature_flags</code> table (Module 23) — two disconnected admin UIs both claiming to control the same features, writing to different tables, neither read by any real public page. Removed the duplicate group from this page and pointed admins to the real Feature Flags page instead of maintaining two parallel dead controls.</li>
        <li><strong>Honest, still-open gap:</strong> <code>site_name</code>, <code>site_description</code>, and <code>contact_email</code> in the General group are still not read by any real public page (the homepage&apos;s title/meta and footer branding remain hardcoded in <code>app/layout.tsx</code> and elsewhere) — only Social Links were wired in this build, per this workspace&apos;s &quot;wire 1-2 real sources first, document the rest&quot; phasing convention.</li>
        <li><strong>Honest, still-open gap:</strong> per the module registry (Module 23), the real <code>feature_flags</code> table itself is also not yet read by any public page — flags exist and can be toggled, but nothing on the live site actually checks them yet. Not fixed here (out of this module&apos;s scope), but disclosed since an admin toggling a feature flag today still has no real effect on the live site either.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium (down from before the Footer fix).</strong> No personal data at the setting-record level; the real risk was silent no-op configuration UI giving false confidence that a saved change took effect — fixed for Social Links, disclosed as still-open for General and for the separate Feature Flags module.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
