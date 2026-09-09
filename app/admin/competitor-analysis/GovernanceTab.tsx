'use client';

import { Tabs } from '@/components/ui';
import styles from './AdminCompetitorAnalysis.module.css';

// Real governance content specific to this module, authored from what's
// actually built (verified this session) -- not generic boilerplate
// copy-pasted across modules. Honestly documents real gaps (no bias
// testing, no robots.txt check, no jurisdiction tracking) rather than
// claiming compliance that doesn't exist.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.subSection}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}

const SUB_TABS = [
  {
    id: 'resai', label: 'ResAI', content: (
      <>
        <Section title="Research AI">
          <p>The Agentic tab&apos;s agent (role: <code>competitor_researcher</code>) actively runs research: it plans, fetches the competitor&apos;s real public page, and drafts an analysis. Verified live — see the Agentic and Testing tabs for the actual run evidence.</p>
        </Section>
        <Section title="Responsible AI">
          <p><strong>Data provenance:</strong> only the competitor&apos;s own public website content (no third-party/private data sources). <strong>Consent/privacy:</strong> no personal data is collected — this module researches companies, not individuals. <strong>Bias checks:</strong> not formally run — the underlying model (phi4-mini) may carry training-data biases that haven&apos;t been evaluated for this use case. Real gap, not silently claimed as handled.</p>
        </Section>
      </>
    )
  },
  {
    id: 'expai', label: 'ExpAI', content: (
      <>
        <Section title="Explainability">
          <p>Every agent run logs its full reasoning chain as real <code>agent_execution_step</code> rows — the plan (why these research steps), the raw fetched data, and the analysis drafted from it. Nothing is a black box; see the Agentic tab for the real per-step input/output.</p>
        </Section>
        <Section title="Experiment">
          <p>Current live model: <code>phi4-mini:latest</code> via local Ollama (127.0.0.1:11435). No other models have been tested against this task yet — a single-model pilot, not a compared/tuned selection.</p>
        </Section>
        <Section title="Experience">
          <p>Plain-language: click &quot;Run Agent&quot; on the Agentic tab, wait ~30-60 seconds (real model inference time, confirmed live), and a draft research entry appears in your Manual tab list, clearly marked for your review.</p>
        </Section>
      </>
    )
  },
  {
    id: 'govai', label: 'GovAI', content: (
      <>
        <Section title="Model &amp; data lineage">
          <p>Model: phi4-mini:latest, unmodified (no fine-tuning). Data: real-time fetch of the competitor&apos;s current public page at run time — no cached/stale training data used for the fetched content itself.</p>
        </Section>
        <Section title="Approval status">
          <p>Pilot status — this is the first module built to the Operational Portal 10-tab standard. Not yet formally reviewed/approved for unsupervised production use; every AI-drafted entry requires human review before being marked &quot;researched&quot; (enforced by never auto-setting that status from Pipeline/Agentic runs).</p>
        </Section>
      </>
    )
  },
  {
    id: 'fairness', label: 'Fairness AI', content: (
      <Section title="Fairness / equity checks">
        <p><strong>Real gap, honestly stated:</strong> no formal fairness/bias evaluation has been run on this module&apos;s AI output. Risk: the model could describe competitors inconsistently based on how much/little text is on their public page, which isn&apos;t itself a fairness concern for company research the way it would be for decisions about people — but hasn&apos;t been checked. Flagged as an open item, not silently assumed fine.</p>
      </Section>
    )
  },
  {
    id: 'accountable', label: 'Accountable AI', content: (
      <>
        <Section title="Ownership">
          <p>Every run (all 3 execution modes) records <code>triggeredBy</code> — a real user ID, not &quot;system&quot; unless genuinely unattended. See the Log &amp; Tracking tab for the real per-run attribution.</p>
        </Section>
        <Section title="Sign-off mechanism">
          <p>The accountability control <em>is</em> the status field: AI-drafted entries stay <code>needs_research</code> until a human admin edits and re-saves them (which is a real, logged <code>update_entry</code> operation_run row) — there is no path for an AI-drafted entry to become authoritative without a human action in the audit trail.</p>
        </Section>
      </>
    )
  },
  {
    id: 'decision', label: 'Decision AI', content: (
      <Section title="Decision-rationale logging">
        <p>The agent&apos;s PLAN step is real rationale logging — it states, in its own words, why it chose the research steps it did, before taking any action. This is captured verbatim in <code>agent_execution_step</code> (phase=&apos;plan&apos;), not summarized or discarded after the fact.</p>
      </Section>
    )
  },
  {
    id: 'compliance', label: 'Compliance AI', content: (
      <Section title="Regulatory mapping for this module's domain">
        <p><strong>Real gap:</strong> the Pipeline/Agentic website-fetch does not currently check <code>robots.txt</code> or a site&apos;s terms of service before fetching. For a single-page title/description fetch this is low-risk, but it is not currently automated or verified compliant — flagged honestly rather than asserted as handled. No PII is processed (public company data only), which limits most data-protection regulation exposure but doesn&apos;t eliminate web-scraping-specific terms-of-service considerations.</p>
      </Section>
    )
  },
  {
    id: 'regulation', label: 'Regulation AI', content: (
      <Section title="Jurisdiction-aware regulation tracking">
        <p><strong>Not implemented.</strong> This module has no jurisdiction-specific regulation tracking (e.g. varying web-scraping or competitive-intelligence rules by country). If TalentsHill researches competitors across multiple jurisdictions, this is a real open item, not yet built.</p>
      </Section>
    )
  },
  {
    id: 'risk', label: 'Risk AI', content: (
      <>
        <Section title="Known failure modes">
          <ul>
            <li>Hallucination — mitigated by an explicit "say insufficient data" system prompt; verified live that the model actually follows this when data is thin (see Testing tab).</li>
            <li>Website fetch failure (timeout, non-200, malformed HTML) — handled gracefully, logged as a failed stage, does not crash the run.</li>
            <li>Website ToS/robots.txt violation — not currently checked (see Compliance AI above).</li>
            <li>No rate-limiting on outbound fetches — a burst of pipeline/agentic runs could hit the same competitor site repeatedly with no backoff.</li>
          </ul>
        </Section>
        <Section title="Current risk level">
          <p><strong>Low-Medium.</strong> No PII, no autonomous external actions (draft-only, human review required), real fetch/model-call error handling in place. Main open risks are the ToS/rate-limiting gaps above, not data-safety or fabrication risks.</p>
        </Section>
      </>
    )
  },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
