'use client';

import { Tabs } from '@/components/ui';
import styles from './VoiceAiShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<Section title="Research AI"><p>The Agentic tab drafts a readiness recommendation from an asset&apos;s real stored fields and the real readiness pipeline output.</p></Section>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<Section title="Model, data lineage &amp; approval status"><p>Model: phi4-mini:latest, unmodified. Data: the asset record&apos;s own stored fields. RBAC-gated under the new &apos;voice_ai&apos; resource, added this session. Pilot status.</p></Section>) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores asset-record readiness only.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab&apos;s per-stage output IS real decision rationale.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p>Voice recordings could contain a speaker&apos;s voice/likeness data. No consent-tracking field exists yet in this build — a real, disclosed gap; add one before recording real third-party voices.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not yet jurisdiction-specific — see Compliance AI above for the consent-tracking gap.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed.</li>
        <li><strong>Honest, disclosed scope:</strong> no voice-cloning/TTS/STT API credentials exist in this build (e.g. ElevenLabs, a real transcription service). Content is manually entered text; recordings are manually referenced file paths, not generated or transcribed by this module.</li>
        <li><strong>Real, disclosed gap:</strong> no consent-tracking field exists for recordings of a real person&apos;s voice — add one before this module is used for anything beyond internal drafts/AI-generated scripts.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low-Medium.</strong> No live third-party API calls; the consent-tracking gap is the main open item if real human voice recordings are added.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
