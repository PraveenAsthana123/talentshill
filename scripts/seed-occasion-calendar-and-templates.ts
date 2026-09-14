/**
 * Seeds real festival dates (verified via web search, not guessed -- see
 * task log) and a real standard template library for the Customer
 * Occasion Messaging module. Idempotent (checks by code/name before
 * inserting). Run: npx tsx scripts/seed-occasion-calendar-and-templates.ts
 */
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();

// Real 2026 calendar dates. Christmas/New Year are fixed-date festivals
// (same real date every year). Diwali is a lunar festival -- its real
// 2026 date (2026-11-08) was confirmed via live web search against
// multiple real sources (timeanddate.com, farmersalmanac.com,
// awarenessdays.com), not estimated, per this module's own disclosed
// "lunar festivals must be seeded per real calendar year" limitation.
const FESTIVALS: { code: string; name: string; date: string; country: string | null }[] = [
  { code: 'christmas_2026', name: 'Christmas', date: '2026-12-25', country: null },
  { code: 'new_year_2026', name: "New Year's Day", date: '2026-01-01', country: null },
  { code: 'diwali_2026', name: 'Diwali', date: '2026-11-08', country: 'IN' },
];

const TEMPLATES: { occasionType: 'birthday' | 'anniversary' | 'festival'; festivalCode?: string; channel: 'email' | 'sms' | 'whatsapp'; name: string; subject?: string; body: string }[] = [
  { occasionType: 'birthday', channel: 'email', name: 'Standard Birthday (Email)', subject: 'Happy Birthday, {{firstName}}!', body: 'Hi {{firstName}},\n\nWishing you a very happy birthday from all of us at TalentsHill! We hope your day is filled with joy.\n\nWarm regards,\nThe TalentsHill Team' },
  { occasionType: 'birthday', channel: 'sms', name: 'Standard Birthday (SMS)', body: "Happy Birthday, {{firstName}}! Wishing you a wonderful day. - TalentsHill" },
  { occasionType: 'anniversary', channel: 'email', name: 'Standard Customer Anniversary (Email)', subject: 'Happy {{years}}-Year Anniversary, {{firstName}}!', body: "Hi {{firstName}},\n\nToday marks {{years}} year(s) since you joined us -- thank you for being part of the TalentsHill community!\n\nWarm regards,\nThe TalentsHill Team" },
  { occasionType: 'anniversary', channel: 'sms', name: 'Standard Customer Anniversary (SMS)', body: 'Happy {{years}}-year anniversary with us, {{firstName}}! Thank you for your continued trust. - TalentsHill' },
  { occasionType: 'festival', festivalCode: 'christmas_2026', channel: 'email', name: 'Christmas (Email)', subject: 'Merry Christmas, {{firstName}}!', body: 'Hi {{firstName}},\n\nMerry Christmas and warm wishes for the holiday season from all of us at TalentsHill!\n\nWarm regards,\nThe TalentsHill Team' },
  { occasionType: 'festival', festivalCode: 'new_year_2026', channel: 'email', name: 'New Year (Email)', subject: 'Happy New Year, {{firstName}}!', body: 'Hi {{firstName}},\n\nWishing you a happy and successful New Year from all of us at TalentsHill!\n\nWarm regards,\nThe TalentsHill Team' },
  { occasionType: 'festival', festivalCode: 'diwali_2026', channel: 'email', name: 'Diwali (Email)', subject: 'Happy Diwali, {{firstName}}!', body: 'Hi {{firstName}},\n\nWishing you and your family a very Happy Diwali, filled with light and prosperity!\n\nWarm regards,\nThe TalentsHill Team' },
];

async function main() {
  console.log('=== Seeding real festival calendar + standard templates ===');
  let festivalsAdded = 0;
  for (const f of FESTIVALS) {
    const existing = db.select().from(schema.festivalCalendar).where(eq(schema.festivalCalendar.code, f.code)).get();
    if (existing) continue;
    db.insert(schema.festivalCalendar).values({
      id: randomUUID(), code: f.code, name: f.name, occasionDate: new Date(f.date), country: f.country,
      isActive: true, createdBy: 'seed-script', createdAt: now, updatedAt: now,
    }).run();
    festivalsAdded++;
  }
  console.log(`Festivals added: ${festivalsAdded} (${FESTIVALS.length} total defined)`);

  let templatesAdded = 0;
  for (const t of TEMPLATES) {
    const existing = db.select().from(schema.occasionTemplates).where(and(
      eq(schema.occasionTemplates.occasionType, t.occasionType),
      eq(schema.occasionTemplates.channel, t.channel),
      eq(schema.occasionTemplates.name, t.name),
    )).get();
    if (existing) continue;
    db.insert(schema.occasionTemplates).values({
      id: randomUUID(), occasionType: t.occasionType, festivalCode: t.festivalCode ?? null, channel: t.channel,
      name: t.name, subject: t.subject ?? null, body: t.body, isActive: true,
      createdBy: 'seed-script', createdAt: now, updatedAt: now,
    }).run();
    templatesAdded++;
  }
  console.log(`Templates added: ${templatesAdded} (${TEMPLATES.length} total defined)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
