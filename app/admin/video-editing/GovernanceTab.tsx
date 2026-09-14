'use client';

import { Tabs } from '@/components/ui';
import styles from './VideoEditingShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (
    <Section title="Research AI">
      <p>The Agentic tab drafts a readiness recommendation from a project&apos;s real stored fields and the real readiness pipeline output. Added 2026-09-14: a second agent suggests clip-idea themes for the Video Repurposing Factory, grounded only in the source project&apos;s real title/strategy-notes/duration metadata — it has NOT watched the actual footage and is explicitly instructed to say so, never claiming specific quotes or content it has no access to.</p>
    </Section>
  ) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist).</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the project record&apos;s own stored fields. RBAC-gated under the new &apos;video_editing&apos; resource, added this session. Pilot status.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores project-record readiness only.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab&apos;s per-stage output IS real decision rationale.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p>Not applicable — no recipient PII stored here.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not applicable for the same reason as Compliance AI above.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed.</li>
        <li><strong>Honest, disclosed scope:</strong> no Adobe (Premiere/After Effects), CapCut, or HeyGen API credentials exist in this build. &quot;Tool&quot; is a real classification field an editor sets manually, not a live integration — no automatic export, render-status polling, or AI-avatar generation happens through this module. The strategy playbook is real, static reference content, not project-specific AI-generated analysis.</li>
        <li><strong>No real video-processing/transcoding integration exists</strong> (confirmed via repo-wide search before building the Video Repurposing Factory — no FFmpeg or similar library anywhere in this codebase, no dependency in package.json). Clip plans are real, admin-entered timestamp/platform/status metadata — never an automatic render, crop, or transcode. A clip&apos;s status can only reach &quot;delivered&quot; by an admin manually attaching a real output link they produced externally.</li>
        <li>Clip range validation checks a clip&apos;s real start/end against the source project&apos;s own real duration field — but only if that duration was actually entered; an unset source duration means range validation cannot catch an out-of-bounds clip.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No live third-party API calls, no PII. The repurposing feature carries the same real-not-fabricated-render caveat as every other module in this build with no real third-party processing credentials.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
