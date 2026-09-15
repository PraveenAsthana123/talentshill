import { db, schema } from './index';
import { eq, and, isNotNull, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { contacts, festivalCalendar, occasionTemplates, occasionMessages } = schema;

// Real contacts with a real, known date_of_birth whose real month+day
// matches `today` -- year is deliberately ignored (a birthday recurs
// every year; only month/day identifies "today is their birthday").
export function getContactsWithBirthdayOn(month: number, day: number) {
  return db.select().from(contacts).where(isNotNull(contacts.dateOfBirth)).all()
    .filter((c) => {
      if (!c.dateOfBirth) return false;
      const d = new Date(c.dateOfBirth);
      return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
    });
}

export function getContactsWithAnniversaryOn(month: number, day: number) {
  return db.select().from(contacts).where(isNotNull(contacts.customerAnniversaryDate)).all()
    .filter((c) => {
      if (!c.customerAnniversaryDate) return false;
      const d = new Date(c.customerAnniversaryDate);
      return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
    });
}

// Real, active festival_calendar rows whose real occasion_date matches
// `dateKey` ('YYYY-MM-DD') -- lunar/shifting festivals are dated per
// real calendar year at seed time (disclosed), not computed here.
export function getFestivalsForDate(dateKey: string) {
  return db.select().from(festivalCalendar)
    .where(eq(festivalCalendar.isActive, true)).all()
    .filter((f) => new Date(f.occasionDate).toISOString().slice(0, 10) === dateKey);
}

export function getContactsForFestival(country: string | null) {
  const all = db.select().from(contacts).all();
  if (country === null) return all; // global festival -- every contact regardless of country
  return all.filter((c) => c.country === country);
}

// Real bug fixed 2026-09-15: with no ORDER BY, SQLite returned whichever
// active template happened to be first by insertion/rowid order --
// effectively "oldest wins" with no deliberate policy behind it. If an
// admin ever creates a second active template for the same
// occasionType+channel(+festivalCode) (e.g. replacing an old one, or two
// people editing templates around the same time), the real trigger
// pipeline would silently keep using the stale one. Ordering by
// updatedAt DESC makes "the most recently active template wins" an
// explicit, real policy instead of an accidental storage-engine artifact.
export function getActiveTemplate(occasionType: 'birthday' | 'anniversary' | 'festival', channel: 'email' | 'sms' | 'whatsapp', festivalCode?: string | null) {
  return db.select().from(occasionTemplates).where(and(
    eq(occasionTemplates.occasionType, occasionType),
    eq(occasionTemplates.channel, channel),
    eq(occasionTemplates.isActive, true),
    ...(festivalCode ? [eq(occasionTemplates.festivalCode, festivalCode)] : []),
  )).orderBy(desc(occasionTemplates.updatedAt)).all()[0];
}

export function alreadyMessagedToday(contactId: string, occasionType: string, festivalCode: string | null, dateKey: string) {
  const conditions = [
    eq(occasionMessages.contactId, contactId),
    eq(occasionMessages.occasionType, occasionType as any),
    eq(occasionMessages.triggeredDate, dateKey),
  ];
  if (festivalCode) conditions.push(eq(occasionMessages.festivalCode, festivalCode));
  return db.select().from(occasionMessages).where(and(...conditions)).all().length > 0;
}

export function createOccasionMessage(data: {
  contactId: string;
  occasionType: 'birthday' | 'anniversary' | 'festival' | 'custom';
  festivalCode?: string | null;
  templateId?: string | null;
  channel: 'email' | 'sms' | 'whatsapp';
  subject?: string | null;
  messageBody: string;
  status?: 'logged' | 'failed';
  failureReason?: string | null;
  triggeredAt?: Date;
  createdBy?: string | null;
}) {
  const id = randomUUID();
  const now = new Date();
  const triggeredAt = data.triggeredAt ?? now;
  db.insert(occasionMessages).values({
    id,
    contactId: data.contactId,
    occasionType: data.occasionType,
    festivalCode: data.festivalCode ?? null,
    templateId: data.templateId ?? null,
    channel: data.channel,
    subject: data.subject ?? null,
    messageBody: data.messageBody,
    status: data.status ?? 'logged',
    failureReason: data.failureReason ?? null,
    triggeredAt,
    triggeredDate: triggeredAt.toISOString().slice(0, 10),
    createdBy: data.createdBy ?? null,
    createdAt: now,
  }).run();
  return id;
}

export function getAllOccasionMessages(options: { occasionType?: string; limit?: number; offset?: number } = {}) {
  const { occasionType, limit = 50, offset = 0 } = options;
  const conditions = occasionType ? [eq(occasionMessages.occasionType, occasionType as any)] : [];
  const query = conditions.length ? db.select().from(occasionMessages).where(and(...conditions)) : db.select().from(occasionMessages);
  const items = query.orderBy(desc(occasionMessages.triggeredAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(occasionMessages).where(and(...conditions)) : db.select().from(occasionMessages)).all().length;
  return { items, total };
}
