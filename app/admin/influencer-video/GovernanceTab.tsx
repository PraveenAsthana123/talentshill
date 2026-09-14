'use client';

import { Tabs } from '@/components/ui';
import styles from './InfluencerVideoShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<Section title="Research AI"><p>The Agentic tab drafts a readiness recommendation from a campaign&apos;s real stored fields and the real readiness pipeline output.</p></Section>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<Section title="Model, data lineage &amp; approval status"><p>Model: phi4-mini:latest, unmodified. Data: the campaign record&apos;s own stored fields, including a real contact email. RBAC-gated under the new &apos;influencer_video&apos; resource, added this session. Pilot status.</p></Section>) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores campaign-record readiness only.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab&apos;s per-stage output IS real decision rationale.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real PII stored here:</strong> unlike most of the other 7 new modules, this one stores a real contact email for a real third-party individual (the influencer or their manager). Standard data-protection practice applies — access is already RBAC-gated under the &apos;influencer_video&apos; resource; no additional consent-tracking or retention-limit field exists yet in this build, a real disclosed gap.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not yet jurisdiction-specific — see Compliance AI above for the real PII-handling gap.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed.</li>
        <li><strong>Real, disclosed gap:</strong> no consent-tracking or data-retention-limit field exists for the stored contact email — add one before this module handles real third-party data at any scale.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> Real PII (contact email) is stored; the retention/consent gap is the main open item.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
