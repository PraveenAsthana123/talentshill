import { describe, it, expect, afterAll } from 'vitest';
import { detectBuyingSignals, runChatSalesQualificationPipeline } from '@/lib/pipelines/chat-sales-qualification-pipeline';
import { createSession, createRequest, createMessage } from '@/lib/db/chat-queries';
import { getContactByEmail } from '@/lib/db/contact-crm-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

describe('detectBuyingSignals (pure)', () => {
  it('detects zero signals in a plain greeting (negative case)', () => {
    const result = detectBuyingSignals([{ role: 'user', content: 'Hi there, just browsing.' }], null);
    expect(result.score).toBe(0);
    expect(result.tier).toBe('cold');
    expect(result.signals.every((s) => !s.detected)).toBe(true);
  });

  it('detects all 5 signals for a fully qualified conversation (positive case)', () => {
    const result = detectBuyingSignals([
      { role: 'user', content: 'What is your pricing? Can I get a demo? I want to buy asap, my email is jane@example.com' },
    ], null);
    expect(result.score).toBe(100);
    expect(result.tier).toBe('hot');
    expect(result.signals.every((s) => s.detected)).toBe(true);
  });

  it('classifies exactly at the warm/hot boundary (boundary)', () => {
    // 3 signals detected -> 60 -> hot (>=60)
    const hot = detectBuyingSignals([{ role: 'user', content: 'What is the pricing for a demo, I want to buy this asap' }], null);
    expect(hot.score).toBe(80);
    expect(hot.tier).toBe('hot');

    // exactly 1 signal -> 20 -> warm (>=20, <60)
    const warm = detectBuyingSignals([{ role: 'user', content: 'What is your pricing?' }], null);
    expect(warm.score).toBe(20);
    expect(warm.tier).toBe('warm');
  });

  it('counts a real visitor email already on file as the contact_shared signal without re-scanning message text (boundary)', () => {
    const result = detectBuyingSignals([{ role: 'user', content: 'no contact info in this message' }], 'visitor@example.com');
    const contactSignal = result.signals.find((s) => s.key === 'contact_shared');
    expect(contactSignal?.detected).toBe(true);
    expect(contactSignal?.matchedText).toBe('visitor@example.com');
  });

  it('ignores assistant-authored messages when scanning for visitor buying signals (negative case)', () => {
    const result = detectBuyingSignals([
      { role: 'assistant', content: 'Would you like to buy a demo with pricing details asap?' },
    ], null);
    expect(result.score).toBe(0);
  });
});

const cleanupSessionIds: string[] = [];
const cleanupContactEmails: string[] = [];

afterAll(() => {
  for (const id of cleanupSessionIds) {
    db.delete(schema.chatMessages).where(eq(schema.chatMessages.sessionId, id)).run();
    db.delete(schema.chatRequests).where(eq(schema.chatRequests.sessionId, id)).run();
    db.delete(schema.chatSessions).where(eq(schema.chatSessions.id, id)).run();
  }
  for (const email of cleanupContactEmails) {
    const c = getContactByEmail(email);
    if (c) db.delete(schema.contacts).where(eq(schema.contacts.id, c.id)).run();
  }
});

describe('runChatSalesQualificationPipeline (real DB)', () => {
  it('writes score/tier back to chat_requests without linking a contact for a cold conversation (negative case)', async () => {
    const sessionId = createSession({ sessionToken: `__test_token_cold_${Date.now()}` });
    cleanupSessionIds.push(sessionId);
    const requestId = createRequest({ sessionId, subject: 'test' });
    createMessage({ sessionId, requestId, role: 'user', content: 'just saying hello' });

    const result = await runChatSalesQualificationPipeline({ requestId });
    expect(result.tier).toBe('cold');
    expect(result.contactId).toBeNull();
  });

  it('creates a real contact and links contactId for a hot conversation with a real visitor email (positive case)', async () => {
    const email = `__test_hot_lead_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const sessionId = createSession({ sessionToken: `__test_token_hot_${Date.now()}`, visitorEmail: email });
    cleanupSessionIds.push(sessionId);
    const requestId = createRequest({ sessionId, subject: 'test' });
    createMessage({ sessionId, requestId, role: 'user', content: 'What is your pricing for a demo? I want to buy asap.' });

    const result = await runChatSalesQualificationPipeline({ requestId });
    expect(result.tier).toBe('hot');
    expect(result.contactId).not.toBeNull();
    expect(result.contactCreated).toBe(true);

    const contact = getContactByEmail(email);
    expect(contact?.source).toBe('chat');
  });
});
