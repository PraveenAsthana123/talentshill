'use client';

import { Tabs } from '@/components/ui';
import styles from './AdsManagementShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (
    <Section title="Research AI">
      <p>The Agentic tab drafts a readiness recommendation from a campaign&apos;s real stored fields and the real readiness pipeline output.</p>
    </Section>
  ) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the campaign record&apos;s own stored fields, read at run time. RBAC-gated under the new &apos;ads_management&apos; resource, added this session. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores campaign-record readiness, not audience targeting fairness. Ad-targeting fairness would become relevant once real platform sync exists (see Risk AI) — not evaluated here since no real targeting is executed by this module.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Create/update/delete actions record real <code>triggeredBy</code>.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (objective/audience/creative/date checks shown separately).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the campaign-record level — no recipient PII stored here (target audience is a free-text description, not a real contact list).</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not applicable for the same reason as Compliance AI above. Ad-platform-specific policy compliance (Google/Meta ad policies) would become relevant once real platform sync exists.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Honest, disclosed scope:</strong> this module is a real local system of record (CRUD + readiness scoring), NOT a live ad-platform integration. No Google Ads/Meta/LinkedIn/TikTok API credentials exist in this build — spend/impressions/clicks are manually entered, never pulled live. Do not treat the &quot;spend&quot; field as authoritative for real ad-platform billing.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No live spend or PII at risk; the main risk is an admin mistaking manually-entered spend for a live platform sync — mitigated by this disclosure appearing directly on the Monitoring tab as well.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
