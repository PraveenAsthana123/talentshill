'use client';

import { Tabs } from '@/components/ui';
import styles from './OccasionsShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (
    <Section title="Research AI">
      <p>No LLM agent exists in this module, deliberately. Occasion messages are always a real standard template (personalized only with real {'{{firstName}}'}/{'{{years}}'}) or a real admin-typed custom message — never model-generated. This avoids the specific failure mode of an LLM inventing a wrong name, a wrong relationship-year count, or a culturally inappropriate festival reference.</p>
    </Section>
  ) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>The trigger pipeline is a fully deterministic, disclosed rule (real DOB/anniversary date match, real festival_calendar match by date+country) — every stage&apos;s input/output is shown in the Pipeline tab, not a black box.</p></Section>
    <Section title="Experiment"><p>Not applicable — no model involved.</p></Section>
    <Section title="Experience"><p>Admin clicks &quot;Run Occasion Scan&quot; for an instant deterministic scan of today&apos;s real birthdays/anniversaries/festivals, or uses Manual tab to send a one-off custom message.</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Data lineage &amp; approval status">
      <p>Data: contacts.date_of_birth / contacts.customer_anniversary_date / contacts.country — all real, admin/import-entered fields, never inferred. This module&apos;s admin API (<code>/api/admin/occasions/*</code>) is RBAC-gated under the <code>occasions</code> resource. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Location-festival matching is deliberately opt-in per real <code>contact.country</code> value — a contact with no country on file simply never matches a country-scoped festival (never defaulted to a guessed region). Global festivals (country=null) apply to every contact equally.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Every template/festival create and every trigger run and custom send records real <code>createdBy</code>/<code>triggeredBy</code> via <code>operation_run</code>.</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s stage output IS the real decision rationale (which real contacts/festivals matched, which were skipped and why — no active template vs. already sent today).</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Not applicable at this record level — consent/unsubscribe state lives on the Contacts module, outside this feature&apos;s scope. This module does not add a new consent-capture surface.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (<Section title="Jurisdiction-aware regulation tracking"><p>Not applicable for the same reason as Compliance AI above.</p></Section>) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known limitations">
      <ul>
        <li><strong>No real SMS/WhatsApp/email gateway exists in this build</strong> (same disclosed gap as the broadcasts/re-engagement feature — confirmed via the same repo-wide search, no Twilio/SMS/SMTP-send library wired to this module). Every occasion_messages row has status &apos;logged&apos;, never a fabricated &apos;delivered&apos;/&apos;sent&apos; — it is a real record of a message that WOULD be sent, not proof of actual transmission.</li>
        <li>Lunar/shifting festivals (Diwali, Eid, etc.) are dated per calendar year at entry time and are NOT computed automatically — the festival calendar must be re-populated for each new year, or those festivals will simply stop matching. A fixed-date festival like Christmas (Dec 25) does not have this problem if re-entered with a year-agnostic recurring convention, but this build stores one explicit date per code/year, so it still needs annual upkeep.</li>
        <li>The scan is a real, on-demand pipeline run (Pipeline tab), not a continuously-running background scheduler — consistent with every other pipeline in this codebase (no cron scheduler exists here for any module). An admin (or an external cron calling the API) must trigger it on the actual day for same-day sends to happen.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Low.</strong> No real third-party send capability, so no risk of an actual wrong message reaching a real customer via this module&apos;s own code — the real risk is entirely in the &quot;logged, not confirmed-sent&quot; gap, same as broadcasts.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
