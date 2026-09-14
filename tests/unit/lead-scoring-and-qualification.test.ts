import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateLeadScore } from '@/lib/contact/lead-scoring';
import { classifyQualificationStage, isValidStageTransition, resolveQualificationStageOnRescore } from '@/lib/contact/lead-qualification-stage';
import { shouldSendHotLeadAlert } from '@/lib/contact/lead-alert';

describe('calculateLeadScore (single source of truth)', () => {
  it('scores a maximally strong lead at 100 with hot tier (positive case)', () => {
    const result = calculateLeadScore({
      budgetRange: '250k+', timeline: 'immediate', company: 'Acme Corp',
      message: 'x'.repeat(600), interestAreas: ['a', 'b', 'c', 'd', 'e'], projectStage: 'ready-to-start', industry: 'banking',
    });
    // 25 (budget) + 20 (timeline) + 15 (stage) + 15 (5 areas x 3, capped) + 15 (message) + 5 (company) + 5 (industry) = 100
    expect(result.score).toBe(100);
    expect(result.tier).toBe('hot');
  });

  it('scores a weak/empty lead at or near 0 with cold tier (negative case)', () => {
    const result = calculateLeadScore({
      budgetRange: null, timeline: 'exploring', company: '',
      message: 'hi', interestAreas: [], projectStage: 'just-exploring', industry: 'other',
    });
    expect(result.score).toBeLessThan(25);
    expect(result.tier).toBe('cold');
  });

  it('treats an unrecognized enum value as 0 points, not a crash (boundary)', () => {
    const result = calculateLeadScore({
      budgetRange: 'not-a-real-range', timeline: 'not-a-real-timeline', company: 'X',
      message: '', interestAreas: [], projectStage: 'not-a-real-stage', industry: 'not-a-real-industry',
    });
    expect(result.score).toBe(0);
    expect(result.tier).toBe('cold');
  });

  it('caps score at 100 even if points would sum higher (boundary)', () => {
    const result = calculateLeadScore({
      budgetRange: '250k+', timeline: 'immediate', company: 'Acme',
      message: 'x'.repeat(600), interestAreas: ['a', 'b', 'c', 'd', 'e'], projectStage: 'ready-to-start', industry: 'banking',
    });
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('returns a per-stage breakdown that sums to the total score', () => {
    const result = calculateLeadScore({
      budgetRange: '50k-100k', timeline: '1-3months', company: 'Beta LLC',
      message: 'x'.repeat(200), interestAreas: ['a'], projectStage: 'evaluating-vendors', industry: 'healthcare',
    });
    const sum = result.stages.reduce((s, st) => s + st.points, 0);
    expect(sum).toBe(result.score);
  });
});

describe('classifyQualificationStage', () => {
  it('maps hot tier to sql (positive case)', () => {
    expect(classifyQualificationStage('hot')).toBe('sql');
  });
  it('maps warm tier to mql (positive case)', () => {
    expect(classifyQualificationStage('warm')).toBe('mql');
  });
  it('maps cool and cold tiers to unqualified (negative/boundary case)', () => {
    expect(classifyQualificationStage('cool')).toBe('unqualified');
    expect(classifyQualificationStage('cold')).toBe('unqualified');
  });
  it('validates only real stage names in a transition (negative case)', () => {
    expect(isValidStageTransition('mql', 'sql')).toBe(true);
    // @ts-expect-error intentionally invalid stage for the negative case
    expect(isValidStageTransition('mql', 'not-a-real-stage')).toBe(false);
  });
});

describe('resolveQualificationStageOnRescore', () => {
  it('never regresses a manually-promoted stage on re-score (regression: caught live 2026-09-14)', () => {
    // Admin manually promoted to 'opportunity'; a hot-tier re-score would
    // auto-classify as 'sql', which is earlier in the funnel -- must hold.
    expect(resolveQualificationStageOnRescore('opportunity', 'sql')).toBe('opportunity');
  });
  it('advances an unqualified/lower lead when the re-score genuinely improves it (positive case)', () => {
    expect(resolveQualificationStageOnRescore('unqualified', 'mql')).toBe('mql');
  });
  it('holds steady when the re-score matches the current stage exactly (boundary)', () => {
    expect(resolveQualificationStageOnRescore('mql', 'mql')).toBe('mql');
  });
});

describe('shouldSendHotLeadAlert', () => {
  it('sends for a hot lead never alerted (positive case)', () => {
    expect(shouldSendHotLeadAlert('hot', null)).toBe(true);
  });
  it('does not send for a non-hot lead (negative case)', () => {
    expect(shouldSendHotLeadAlert('warm', null)).toBe(false);
  });
  it('does not re-send once already alerted, even if still hot (negative/idempotency case)', () => {
    expect(shouldSendHotLeadAlert('hot', new Date())).toBe(false);
  });
});

describe('sendHotLeadAlertIfNeeded (failure handling)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does NOT mark alertSentAt when the email send fails (regression: caught live 2026-09-14 -- sendEmail swallows errors and returns {success:false} instead of throwing)', async () => {
    vi.doMock('@/lib/email/mailer', () => ({ sendEmail: vi.fn().mockResolvedValue({ success: false }) }));
    const markAlertSentMock = vi.fn();
    vi.doMock('@/lib/db/contact-queries', () => ({ markAlertSent: markAlertSentMock }));

    const { sendHotLeadAlertIfNeeded } = await import('@/lib/contact/lead-alert');
    const sent = await sendHotLeadAlertIfNeeded(
      { id: 'x', fullName: 'Test', company: 'Co', email: 'a@b.com', leadScore: 90, leadTier: 'hot', alertSentAt: null, assignedTo: null },
      'sql',
    );

    expect(sent).toBe(false);
    expect(markAlertSentMock).not.toHaveBeenCalled();
    vi.doUnmock('@/lib/email/mailer');
    vi.doUnmock('@/lib/db/contact-queries');
  });

  it('DOES mark alertSentAt when the email send succeeds (positive case)', async () => {
    vi.doMock('@/lib/email/mailer', () => ({ sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-1' }) }));
    const markAlertSentMock = vi.fn();
    vi.doMock('@/lib/db/contact-queries', () => ({ markAlertSent: markAlertSentMock }));

    const { sendHotLeadAlertIfNeeded } = await import('@/lib/contact/lead-alert');
    const sent = await sendHotLeadAlertIfNeeded(
      { id: 'y', fullName: 'Test', company: 'Co', email: 'a@b.com', leadScore: 90, leadTier: 'hot', alertSentAt: null, assignedTo: null },
      'sql',
    );

    expect(sent).toBe(true);
    expect(markAlertSentMock).toHaveBeenCalledWith('y');
    vi.doUnmock('@/lib/email/mailer');
    vi.doUnmock('@/lib/db/contact-queries');
  });
});
