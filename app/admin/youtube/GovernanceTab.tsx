'use client';

import { Tabs } from '@/components/ui';
import styles from './YoutubeShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<Section title="Research AI"><p>The Agentic tab drafts a readiness recommendation from a video&apos;s real stored fields and the real readiness pipeline output. Added 2026-09-14: a second agent narrates real channel-growth data (a real diff between two real, admin-entered snapshots) — never invents a subscriber/view figure.</p></Section>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<Section title="Model, data lineage &amp; approval status"><p>Model: phi4-mini:latest, unmodified. Data: the video record&apos;s own stored fields. RBAC-gated under the new &apos;youtube&apos; resource, added this session. Pilot status.</p></Section>) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores video-record readiness only.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab&apos;s per-stage output IS real decision rationale.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p>Not applicable — no recipient PII stored here.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not applicable for the same reason as Compliance AI above.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed.</li>
        <li><strong>Honest, disclosed scope:</strong> no YouTube Data API integration exists in this build — no OAuth channel connection, no real video upload, no view/subscriber/comment stats sync. Marking a video &apos;published&apos; does not publish anything; an admin must manually upload the real video on YouTube and record its real video ID here afterward.</li>
        <li><strong>Channel snapshots are real, admin-entered data only</strong> (confirmed via repo-wide search before building the Channel Growth Engine — no YouTube Analytics API usage anywhere in this codebase). An admin must accurately copy real numbers from their own YouTube Studio dashboard; nothing in this module verifies those numbers against a live source. Growth is always a real diff between two real snapshots, never an interpolated or fabricated trend — reported as &quot;not enough data&quot; rather than a guess when fewer than 2 snapshots exist.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No live third-party API calls, no PII. Main risk is an admin assuming &apos;published&apos; means automated, which it does not, or entering an inaccurate real snapshot number by hand.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
