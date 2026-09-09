'use client';

import { Tabs } from '@/components/ui';
import styles from './CampaignsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Campaigns. Different risk profile
// again: this module sends real email to real people at scale, so
// deliverability/spam/anti-spam-law considerations are the load-bearing
// concern here, not privacy (Leads) or fabrication (Competitor Analysis).
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI"><p>The Agentic tab drafts subject-line suggestions grounded in the real readiness check — see Agentic/Testing tabs.</p></Section>
    <Section title="Responsible AI"><p>Subject-line suggestions are advisory only, never auto-applied or auto-sent. The AI never triggers a real send — launch remains a distinct, human-initiated Manual-tab action.</p></Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Readiness check is fully transparent (a real per-field validation, not a black box). Agentic reasoning logged per real agent_execution_step.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot.</p></Section>
    <Section title="Experience"><p>&quot;Run Readiness Check&quot; is instant; &quot;Get Subject Line Suggestions&quot; takes 30-60s (real inference).</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<Section title="Model, data lineage &amp; approval status"><p>Model: phi4-mini:latest, unmodified. Pilot status — subject-line suggestions require human review before use, same as other modules.</p></Section>) },
  { id: 'fairness', label: 'Fairness AI', content: (<Section title="Fairness / equity checks"><p><strong>Not directly applicable</strong> to this module's AI components (subject-line copywriting has no obvious equity dimension) — but the campaign's audience-selection logic itself (which list/segment gets targeted) is a real fairness-adjacent question not evaluated here.</p></Section>) },
  { id: 'accountable', label: 'Accountable AI', content: (<Section title="Ownership &amp; sign-off"><p>Every manual action (create/update/delete/launch) now logs real <code>triggeredBy</code>. Launch specifically requires a human click — no automated/scheduled launch path exists yet.</p></Section>) },
  { id: 'decision', label: 'Decision AI', content: (<Section title="Decision-rationale logging"><p>The Pipeline tab's per-check output IS the decision rationale for launch-readiness (each blocker named individually). The Agentic PLAN step additionally logs its own subject-line strategy reasoning.</p></Section>) },
  { id: 'compliance', label: 'Compliance AI', content: (<Section title="Regulatory mapping"><p><strong>Real, load-bearing consideration for this module:</strong> email campaigns are subject to anti-spam law (e.g. CASL in Canada, CAN-SPAM in the US) requiring verified consent and a working unsubscribe mechanism. This module's readiness pipeline does NOT currently check consent/opt-in status or unsubscribe-link presence before flagging a campaign "ready" — a real, undisclosed-until-now gap, more consequential than the AI components themselves.</p></Section>) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p><strong>Not implemented.</strong> No jurisdiction detection for recipients (different anti-spam regimes by country/region) — real gap if the audience spans multiple jurisdictions.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucinated subject lines — mitigated by grounding in real campaign name/type, not formally red-teamed.</li>
        <li><strong>Readiness check does not verify consent/unsubscribe compliance</strong> — the most significant real risk in this module, see Compliance AI above.</li>
        <li>No dedupe/rate-limit check against recently-sent campaigns to the same audience (could over-email a list).</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium-High.</strong> Higher than the other two modules built so far — this module can trigger real bulk email sends to real people, and the readiness check's compliance gap (consent/unsubscribe not verified) is a genuine operational risk, not just an AI-quality concern.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
