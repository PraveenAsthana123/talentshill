'use client';

import { Tabs } from '@/components/ui';
import styles from './ReelsManagementShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<Section title="Research AI"><p>The Agentic tab drafts a readiness recommendation from a reel&apos;s real stored fields and the real readiness pipeline output.</p></Section>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<Section title="Model, data lineage &amp; approval status"><p>Model: phi4-mini:latest, unmodified. Data: the reel record&apos;s own stored fields. RBAC-gated under the new &apos;reels_management&apos; resource, added this session. Pilot status.</p></Section>) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores reel-record readiness only.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab&apos;s per-stage output IS real decision rationale.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p>Not applicable — no recipient PII stored here.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not applicable for the same reason as Compliance AI above.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed.</li>
        <li><strong>Honest, disclosed scope:</strong> marking a reel &apos;scheduled&apos; does not actually schedule a real publish action on Instagram/TikTok/YouTube Shorts — no platform API integration or auto-publish scheduler exists in this build. &apos;Published&apos; must be set manually after a human confirms the real post went live.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No live third-party API calls, no PII. Main risk is an admin assuming &apos;scheduled&apos; means automated, which it does not.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
