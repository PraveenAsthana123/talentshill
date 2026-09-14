import { describe, it, expect, afterAll } from 'vitest';
import { computeAttendeeQualificationScore, runWebinarConversionPipeline } from '@/lib/pipelines/webinar-pipeline-conversion-pipeline';
import { createWebinar, createRegistrant, recordAttendance, deleteWebinar } from '@/lib/db/webinar-queries';
import { getSubmissionByEmail } from '@/lib/db/contact-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

describe('computeAttendeeQualificationScore (pure)', () => {
  it('scores a no-show at 0 regardless of any notes present (negative case)', () => {
    const result = computeAttendeeQualificationScore(false, 'asked a question, requested a demo');
    expect(result.score).toBe(0);
    expect(result.tier).toBe('cold');
  });

  it('scores an attendee with no engagement notes at the 50-point base (boundary)', () => {
    const result = computeAttendeeQualificationScore(true, null);
    expect(result.score).toBe(50);
    expect(result.tier).toBe('warm');
  });

  it('scores a fully engaged attendee at the max 100 (positive case)', () => {
    const result = computeAttendeeQualificationScore(true, 'asked a great question, requested a follow-up demo, stayed until the end');
    expect(result.score).toBe(100);
    expect(result.tier).toBe('hot');
    expect(result.signals.every((s) => s.detected)).toBe(true);
  });

  it('caps the score at 100 even if patterns could overlap (boundary)', () => {
    const result = computeAttendeeQualificationScore(true, 'asked a question and asked another question, requested a follow-up, stayed until the end');
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('never treats attended=null the same as attended=true (negative case)', () => {
    const result = computeAttendeeQualificationScore(null, 'asked a question');
    expect(result.score).toBe(0);
  });
});

const cleanupWebinarIds: string[] = [];
const cleanupEmails: string[] = [];

afterAll(() => {
  for (const id of cleanupWebinarIds) deleteWebinar(id);
  for (const email of cleanupEmails) {
    const s = getSubmissionByEmail(email);
    if (s) db.delete(schema.contactSubmissions).where(eq(schema.contactSubmissions.id, s.id)).run();
  }
});

describe('runWebinarConversionPipeline (real DB)', () => {
  it('does not push a cold no-show registrant into the leads pipeline (negative case)', async () => {
    const webinarId = createWebinar({ title: `__test webinar cold ${Date.now()}`, topic: 'test topic', scheduledAt: new Date() });
    cleanupWebinarIds.push(webinarId);
    const email = `__test_webinar_coldregistrant_${Date.now()}@example.com`;
    cleanupEmails.push(email);
    const registrantId = createRegistrant({ webinarId, fullName: 'Cold NoShow', email, consent: true });
    recordAttendance(registrantId, { attended: false });

    const result = await runWebinarConversionPipeline({ webinarId });
    expect(result.qualifiedCount).toBe(0);
    expect(getSubmissionByEmail(email)).toBeNull();
  });

  it('creates a real leads-pipeline row for a real qualifying attendee (positive case)', async () => {
    const webinarId = createWebinar({ title: `__test webinar hot ${Date.now()}`, topic: 'AI in marketing', scheduledAt: new Date() });
    cleanupWebinarIds.push(webinarId);
    const email = `__test_webinar_hotregistrant_${Date.now()}@example.com`;
    cleanupEmails.push(email);
    const registrantId = createRegistrant({ webinarId, fullName: 'Hot Attendee', email, company: 'Acme Co', consent: true });
    recordAttendance(registrantId, { attended: true, engagementNotes: 'asked a question and requested a follow-up demo, stayed until the end' });

    const result = await runWebinarConversionPipeline({ webinarId });
    expect(result.qualifiedCount).toBe(1);
    expect(result.pipelineLinked.length).toBe(1);
    expect(result.pipelineLinked[0].created).toBe(true);

    const submission = getSubmissionByEmail(email);
    expect(submission).not.toBeNull();
    expect(submission?.qualificationStage).toBe('sql');
    expect(submission?.company).toBe('Acme Co');
  });

  it('never demotes an already-promoted lead on a pipeline re-run (positive case, regression guard)', async () => {
    const webinarId = createWebinar({ title: `__test webinar rerun ${Date.now()}`, topic: 'test topic', scheduledAt: new Date() });
    cleanupWebinarIds.push(webinarId);
    const email = `__test_webinar_rerun_${Date.now()}@example.com`;
    cleanupEmails.push(email);
    const registrantId = createRegistrant({ webinarId, fullName: 'Rerun Test', email, consent: true });
    recordAttendance(registrantId, { attended: true, engagementNotes: 'asked a question' });

    await runWebinarConversionPipeline({ webinarId });
    const submission = getSubmissionByEmail(email);
    expect(submission).not.toBeNull();

    // Manually promote to 'customer' (further along than the auto-classified 'mql'/'sql')
    db.update(schema.contactSubmissions).set({ qualificationStage: 'customer' }).where(eq(schema.contactSubmissions.id, submission!.id)).run();

    await runWebinarConversionPipeline({ webinarId });
    const afterRerun = getSubmissionByEmail(email);
    expect(afterRerun?.qualificationStage).toBe('customer');
  });
});
