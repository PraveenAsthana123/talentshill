'use client';

import { Tabs } from '@/components/ui';
import styles from './MediaShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts an integrity recommendation from real media data and the real integrity pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the media record&apos;s own stored fields (path, size, alt, isActive) plus a real filesystem check (<code>existsSync</code>/<code>statSync</code>) only. No file content is read or sent to the model.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline integrity scoring is fully transparent (a real deterministic checklist against the real filesystem, not a black box). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic integrity scoring, or &quot;Run Agent&quot; (30-60s) for a written recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the media record&apos;s own stored fields plus a live filesystem check, read at run time. This module&apos;s admin API (<code>/api/admin/media</code>) was already correctly RBAC-gated before this build — now also carries real transactional history on upload/update/delete. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores file-record integrity, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Upload/update/delete actions now record real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (file-exists, size-integrity, alt-text, active checks shown separately with their real inputs and outputs).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at the file-record level — media files carry no recipient PII directly. Uploaded content itself is the admin&apos;s responsibility to vet before upload; this module does not scan file content.</p>
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
        <li><strong>Real security vulnerability found and fixed in this build (CWE-22, path traversal):</strong> the upload handler (<code>lib/media/upload.ts</code>) joined the client-supplied <code>folder</code> FormData field directly into a filesystem path via <code>path.join()</code>, which resolves <code>..</code> segments. A crafted <code>folder</code> value (e.g. <code>../../../../tmp</code>) could write an uploaded file outside the intended upload directory. Fixed by adding <code>sanitizeFolder()</code>, which normalizes the path, rejects absolute paths and any segment equal to <code>..</code>, and re-validates that the resolved target directory still lives under the real upload root before <code>handleUpload()</code> proceeds — throws <code>Invalid folder path</code> on any attempted escape. Verified live in the Testing tab with both a malicious and a normal upload.</li>
        <li><strong>Real, pre-existing gap this pipeline exists to catch:</strong> nothing in the codebase ever re-verified that a <code>media</code> row&apos;s file still exists on disk with the size recorded at upload time — an orphaned DB row (file deleted outside the app) would render as if real with no error until a user clicked it.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium (down from High before the path-traversal fix).</strong> No personal data at the media-record level, but the pre-fix upload path could have allowed writing files outside the intended storage tree; the integrity pipeline separately catches silent on-disk drift from the DB record.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
