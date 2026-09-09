'use client';

import { Tabs } from '@/components/ui';
import styles from './RolesShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

// Real governance content specific to Roles. Like Users, this module IS
// the access-control system, not content protected by it. This session
// found and fixed a real bug here: the Manual tab's permission editor
// only exposed 20 of 38 real RBAC resources, so 18 resources' permissions
// could never be granted through the UI at all.
const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab drafts a fix recommendation from real role/permission data and the real hygiene pipeline output — see Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> the role&apos;s own stored fields and its real permission/user-assignment joins only. <strong>Consent:</strong> not applicable — RBAC configuration, not customer data.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline hygiene scoring is fully transparent (a real deterministic checklist against actual RBAC state). Agentic reasoning is logged per real agent_execution_step, phase=&apos;plan&apos;.</p></Section>
    <Section title="Experiment"><p>Model: phi4-mini:latest via local Ollama. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic hygiene scoring, or &quot;Run Agent&quot; (30-60s) for a written fix recommendation alongside the same score.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (<>
    <Section title="Model, data lineage &amp; approval status">
      <p>Model: phi4-mini:latest, unmodified. Data: the role&apos;s own stored fields plus real rolePermissions/userRoles joins, read at run time. This module&apos;s admin API (<code>/api/admin/roles</code>) was already correctly RBAC-gated before this build. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
    <Section title="Disclosed remediation">
      <p><strong>Fixed 2026-09-09:</strong> the Manual tab&apos;s permission-editing grid previously used a hardcoded 20-resource list, silently omitting 18 of the real 38 RBAC resources (e.g. analysis, chat, content, integrations, rag, workflows) from the UI entirely — an admin could never grant or revoke those permissions through this page even though the permission rows exist in the DB. Now derived from the real permissions the API returns.</p>
    </Section>
  </>) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable — this pipeline scores role access-control hygiene, not people or business fairness. No bias vector identified.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every create/update/delete action records real <code>triggeredBy</code> — who created or modified which role&apos;s permission set, now real transactional history for the module that defines every other module&apos;s access boundaries.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (permission-count and usage checks shown separately, not just a final number). The Agentic tab&apos;s SEARCH step additionally surfaces which specific checks failed.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p><strong>Real consideration:</strong> this module directly implements least-privilege access control (a common SOC2/ISO27001 control). The fixed permission-grid bug above was a real compliance-relevant gap: 18 resources' access could not be reviewed or restricted via the intended UI.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not implemented — no jurisdiction-specific access-control policy differentiation.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li>Hallucination in the Agentic recommendation — mitigated by an explicit &quot;never invent facts&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Fixed, disclosed:</strong> the 18-resource permission-grid gap described above — see GovAI for the fix.</li>
        <li>A dead role (zero permissions) or unused custom role is the real risk class this pipeline exists to catch — access-control clutter that could later be misassigned.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium-High.</strong> Highest access-control blast radius in the portal — this module defines the permission boundaries every other module enforces. The permission-grid bug fixed this session was a real, non-hypothetical gap in that system.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
