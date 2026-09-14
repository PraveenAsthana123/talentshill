import { describe, it, expect, afterAll } from 'vitest';
import { personalizeOccasionMessage, computeYearsSince, runOccasionTriggerPipeline } from '@/lib/pipelines/occasion-trigger-pipeline';
import { createContact } from '@/lib/db/contact-crm-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

describe('personalizeOccasionMessage (pure)', () => {
  it('substitutes a real first name and a real years count (positive case)', () => {
    expect(personalizeOccasionMessage('Happy {{years}}th, {{firstName}}!', 'Jane', 5)).toBe('Happy 5th, Jane!');
  });
  it('falls back to a generic greeting when no real name is on file (negative case)', () => {
    expect(personalizeOccasionMessage('Hi {{firstName}}!', null, null)).toBe('Hi there!');
  });
  it('renders an empty string for {{years}} when years is null, never a fabricated number (negative case)', () => {
    expect(personalizeOccasionMessage('{{years}} years!', 'Sam', null)).toBe(' years!');
  });
});

describe('computeYearsSince (pure)', () => {
  it('computes a real whole-year difference by calendar year (positive case)', () => {
    expect(computeYearsSince(new Date('2020-03-01'), new Date('2026-09-14'))).toBe(6);
  });
  it('returns 0 for the same calendar year (boundary)', () => {
    expect(computeYearsSince(new Date('2026-01-01'), new Date('2026-09-14'))).toBe(0);
  });
});

const cleanupContactEmails: string[] = [];
const cleanupFestivalCodes: string[] = [];
const cleanupTemplateIds: string[] = [];

afterAll(() => {
  for (const email of cleanupContactEmails) {
    const c = db.select().from(schema.contacts).where(eq(schema.contacts.email, email)).get();
    if (c) {
      db.delete(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, c.id)).run();
      db.delete(schema.contacts).where(eq(schema.contacts.id, c.id)).run();
    }
  }
  for (const code of cleanupFestivalCodes) {
    db.delete(schema.occasionMessages).where(eq(schema.occasionMessages.festivalCode, code)).run();
    db.delete(schema.occasionTemplates).where(eq(schema.occasionTemplates.festivalCode, code)).run();
    db.delete(schema.festivalCalendar).where(eq(schema.festivalCalendar.code, code)).run();
  }
  for (const id of cleanupTemplateIds) {
    db.delete(schema.occasionTemplates).where(eq(schema.occasionTemplates.id, id)).run();
  }
});

function addTemplate(occasionType: 'birthday' | 'anniversary' | 'festival', channel: 'email' | 'sms' | 'whatsapp', body: string, festivalCode?: string) {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.occasionTemplates).values({
    id, occasionType, festivalCode: festivalCode ?? null, channel, name: `__test_template_${id}`,
    subject: channel === 'email' ? 'Test subject' : null, body, isActive: true, createdAt: now, updatedAt: now,
  }).run();
  cleanupTemplateIds.push(id);
  return id;
}

describe('runOccasionTriggerPipeline (real DB)', () => {
  it('logs a real birthday message for a contact whose real date_of_birth matches today (positive case)', async () => {
    addTemplate('birthday', 'email', 'Happy Birthday {{firstName}}!');
    const today = new Date('2026-09-14T12:00:00Z');
    const email = `__test_occasion_bday_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'Priya' });
    db.update(schema.contacts).set({ dateOfBirth: new Date('1990-09-14') }).where(eq(schema.contacts.id, contactId)).run();

    const result = await runOccasionTriggerPipeline({ today, channel: 'email' });
    expect(result.birthdaysFound).toBeGreaterThanOrEqual(1);

    const messages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, contactId)).all();
    expect(messages.length).toBe(1);
    expect(messages[0].messageBody).toBe('Happy Birthday Priya!');
    expect(messages[0].occasionType).toBe('birthday');
    expect(messages[0].status).toBe('logged');
  });

  it('does not match a contact whose date_of_birth is a different month/day (negative case)', async () => {
    const today = new Date('2026-09-14T12:00:00Z');
    const email = `__test_occasion_no_bday_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'NotToday' });
    db.update(schema.contacts).set({ dateOfBirth: new Date('1990-03-02') }).where(eq(schema.contacts.id, contactId)).run();

    await runOccasionTriggerPipeline({ today, channel: 'email' });
    const messages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, contactId)).all();
    expect(messages.length).toBe(0);
  });

  it('skips a contact already messaged for the same occasion today on a second run (negative case, dedupe)', async () => {
    addTemplate('birthday', 'email', 'Happy Birthday {{firstName}}!');
    const today = new Date('2026-09-14T12:00:00Z');
    const email = `__test_occasion_dedupe_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'Dupe' });
    db.update(schema.contacts).set({ dateOfBirth: new Date('1995-09-14') }).where(eq(schema.contacts.id, contactId)).run();

    await runOccasionTriggerPipeline({ today, channel: 'email' });
    await runOccasionTriggerPipeline({ today, channel: 'email' });

    const messages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, contactId)).all();
    expect(messages.length).toBe(1);
  });

  it('logs a real festival message only for a contact whose real country matches a country-scoped festival, never for a mismatched country (positive + negative case)', async () => {
    const code = `__test_festival_${Date.now()}`;
    cleanupFestivalCodes.push(code);
    const today = new Date('2026-11-01T12:00:00Z');
    db.insert(schema.festivalCalendar).values({
      id: randomUUID(), code, name: 'Test Regional Festival', occasionDate: today, country: 'IN', isActive: true, createdAt: today, updatedAt: today,
    }).run();
    addTemplate('festival', 'email', 'Happy {{firstName}}!', code);

    const emailIn = `__test_occasion_festival_in_${Date.now()}@example.com`;
    const emailUs = `__test_occasion_festival_us_${Date.now()}@example.com`;
    cleanupContactEmails.push(emailIn, emailUs);
    const inContactId = createContact({ email: emailIn, firstName: 'Anita' });
    db.update(schema.contacts).set({ country: 'IN' }).where(eq(schema.contacts.id, inContactId)).run();
    const usContactId = createContact({ email: emailUs, firstName: 'Sam' });
    db.update(schema.contacts).set({ country: 'US' }).where(eq(schema.contacts.id, usContactId)).run();

    const result = await runOccasionTriggerPipeline({ today, channel: 'email' });
    expect(result.festivalsFound).toBeGreaterThanOrEqual(1);

    const inMessages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, inContactId)).all();
    const usMessages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, usContactId)).all();
    expect(inMessages.length).toBe(1);
    expect(usMessages.length).toBe(0);
  });

  it('skips and reports when no active template exists for an occasion type (boundary)', async () => {
    const today = new Date('2026-12-25T12:00:00Z');
    const email = `__test_occasion_no_template_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'NoTemplate' });
    db.update(schema.contacts).set({ dateOfBirth: new Date('1990-12-25') }).where(eq(schema.contacts.id, contactId)).run();

    const result = await runOccasionTriggerPipeline({ today, channel: 'whatsapp' });
    expect(result.skippedNoTemplate).toBeGreaterThanOrEqual(1);
    const messages = db.select().from(schema.occasionMessages).where(eq(schema.occasionMessages.contactId, contactId)).all();
    expect(messages.length).toBe(0);
  });
});
