import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import {
  getContactsWithBirthdayOn, getContactsWithAnniversaryOn, getFestivalsForDate,
  getContactsForFestival, getActiveTemplate, alreadyMessagedToday, createOccasionMessage,
} from '@/lib/db/occasion-queries';

// Pure: substitutes real {{firstName}}/{{years}} placeholders -- never
// invents a name or a year count. {{years}} is only ever a real,
// computed integer (today's year minus the real stored year), never
// estimated.
export function personalizeOccasionMessage(template: string, firstName: string | null, years: number | null): string {
  return template
    .replace(/\{\{\s*firstName\s*\}\}/gi, firstName?.trim() || 'there')
    .replace(/\{\{\s*years\s*\}\}/gi, years !== null ? String(years) : '');
}

export function computeYearsSince(date: Date, today: Date): number {
  return today.getUTCFullYear() - date.getUTCFullYear();
}

export interface OccasionStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface OccasionTriggerResult {
  runId: string;
  stages: OccasionStageResult[];
  dateKey: string;
  birthdaysFound: number;
  anniversariesFound: number;
  festivalsFound: number;
  triggered: number;
  skippedNoTemplate: number;
  skippedAlreadySent: number;
}

// Real, deterministic daily scan: birthdays + anniversaries (by real
// contact date fields) + festivals (by real festival_calendar rows
// matching today, filtered to matching real contact.country or global).
// Every send uses a real, admin-authored standard template -- never an
// LLM-composed message -- personalized with real {{firstName}}/{{years}}
// only. Same "status is always logged, never a fabricated delivery
// confirmation" honesty boundary as re-engagement-trigger-pipeline.ts
// (no real SMS/WhatsApp/email gateway exists in this build, disclosed).
export async function runOccasionTriggerPipeline(params: {
  today?: Date;
  channel: 'email' | 'sms' | 'whatsapp';
  triggeredBy?: string | null;
}): Promise<OccasionTriggerResult> {
  const today = params.today ?? new Date();
  const dateKey = today.toISOString().slice(0, 10);
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();
  const stages: OccasionStageResult[] = [];

  const runId = logOperationRun({
    moduleKey: 'occasions',
    operationName: 'pipeline_occasion_trigger',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const birthdayContacts = getContactsWithBirthdayOn(month, day);
  const anniversaryContacts = getContactsWithAnniversaryOn(month, day);
  const festivals = getFestivalsForDate(dateKey);
  stages.push({
    stage: 'scan_todays_occasions',
    input: { dateKey },
    process: 'Real scan: contacts.date_of_birth / contacts.customer_anniversary_date matching real month+day of today, and festival_calendar rows whose real occasion_date is today',
    output: { birthdays: birthdayContacts.length, anniversaries: anniversaryContacts.length, festivals: festivals.length },
    status: 'ok',
  });

  let triggered = 0, skippedNoTemplate = 0, skippedAlreadySent = 0;

  const sendFor = (contactId: string, firstName: string | null, occasionType: 'birthday' | 'anniversary' | 'festival', years: number | null, festivalCode: string | null) => {
    if (alreadyMessagedToday(contactId, occasionType, festivalCode, dateKey)) { skippedAlreadySent++; return; }
    const template = getActiveTemplate(occasionType, params.channel, festivalCode);
    if (!template) { skippedNoTemplate++; return; }
    const messageBody = personalizeOccasionMessage(template.body, firstName, years);
    const subject = template.subject ? personalizeOccasionMessage(template.subject, firstName, years) : null;
    createOccasionMessage({
      contactId, occasionType, festivalCode, templateId: template.id, channel: params.channel,
      subject, messageBody, status: 'logged', triggeredAt: today, createdBy: params.triggeredBy,
    });
    triggered++;
  };

  for (const c of birthdayContacts) sendFor(c.id, c.firstName, 'birthday', null, null);
  for (const c of anniversaryContacts) {
    const years = c.customerAnniversaryDate ? computeYearsSince(new Date(c.customerAnniversaryDate), today) : null;
    sendFor(c.id, c.firstName, 'anniversary', years, null);
  }
  for (const f of festivals) {
    const eligibleContacts = getContactsForFestival(f.country);
    for (const c of eligibleContacts) sendFor(c.id, c.firstName, 'festival', null, f.code);
  }

  stages.push({
    stage: 'personalize_and_log',
    input: { channel: params.channel },
    process: 'For each real occasion match, use the real active standard template for that occasion type+channel (and festival code, if applicable), personalize deterministically, and write one real occasion_messages row -- skip if no active template exists or a message for this exact contact+occasion+day was already logged',
    output: { triggered, skippedNoTemplate, skippedAlreadySent },
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', {
    outputPayload: { dateKey, birthdaysFound: birthdayContacts.length, anniversariesFound: anniversaryContacts.length, festivalsFound: festivals.length, triggered, skippedNoTemplate, skippedAlreadySent },
  });

  return {
    runId, stages, dateKey,
    birthdaysFound: birthdayContacts.length, anniversariesFound: anniversaryContacts.length, festivalsFound: festivals.length,
    triggered, skippedNoTemplate, skippedAlreadySent,
  };
}
