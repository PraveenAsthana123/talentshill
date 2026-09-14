'use client';

import { Tabs } from '@/components/ui';
import styles from './MarketResearchShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (
    <Section title="Research AI">
      <p>The Agentic tab is a real synthesis agent — it drafts findings strictly from the brief&apos;s own real source notes, never from the model&apos;s general knowledge. This is the module&apos;s core AI capability, not just an advisory score.</p>
    </Section>
  ) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>The synthesis prompt is shown verbatim in the agent execution log — the exact source notes given to the model are visible, so any output can be checked against them directly.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring, or &quot;Run Synthesis&quot; (30-60s) for a grounded findings draft.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the brief&apos;s own real source notes only. RBAC-gated under the new &apos;market_research&apos; resource, added this session. Pilot status.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p>Not applicable — scores/synthesizes from analyst-provided text, not people or protected-class data.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Create/update/delete actions record real <code>triggeredBy</code>. Synthesized findings are never auto-saved — a human explicitly copies them into the record, preserving a clear approval step.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The synthesis agent&apos;s &quot;act&quot; step input IS the full real source-notes prompt — the complete rationale for its output is visible, not summarized away.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p>Not applicable — briefs contain analyst notes and topic research, not recipient PII.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not applicable for the same reason as Compliance AI above.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li><strong>Real, actively-mitigated risk:</strong> an LLM synthesizing "market research" is a classic hallucination surface (inventing statistics, competitor names, market sizes). Mitigated by an explicit, repeated instruction to use ONLY the provided source notes and to say so if the notes are too thin — verified live in Testing. Not formally red-teamed beyond that.</li>
        <li>If an admin pastes unverified claims into source notes, the agent will faithfully synthesize those unverified claims — the tool cannot distinguish a verified fact from an analyst&apos;s guess. The synthesis is only as trustworthy as the source notes.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium.</strong> The main risk is human-originated (unverified source notes), not model hallucination of new facts — the grounding discipline specifically targets and reduces the latter.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
