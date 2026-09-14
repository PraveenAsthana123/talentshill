import { getVoiceCallLogById, setCallQualification } from '@/lib/db/voice-call-queries';
import { getContactByEmail, createContact } from '@/lib/db/contact-crm-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface CallSignal { key: string; label: string; detected: boolean; matchedText: string | null }
export interface CallSignalResult { signals: CallSignal[]; score: number; tier: 'cold' | 'warm' | 'hot' }

// Pure, unit-tested: scans real, admin-entered call-transcript text for
// 5 classic BANT-style qualification signals (Budget, Authority, Need,
// Timeline, plus a real next-step commitment). Each contributes 20
// points (0-100). Never an LLM guess -- a fixed, disclosed keyword
// match against text a human actually typed describing a real call.
const SIGNAL_PATTERNS: { key: string; label: string; pattern: RegExp }[] = [
  { key: 'budget_mentioned', label: 'Budget discussed', pattern: /\b(budget|price|pricing|cost|afford|quote)\b/i },
  { key: 'authority_confirmed', label: 'Decision-making authority confirmed', pattern: /\b(decision.?maker|i (can|will) decide|i'?m the one who decides|my (boss|manager|team) approved|i have (the )?authority)\b/i },
  { key: 'need_expressed', label: 'Real business need/pain point expressed', pattern: /\b(need|problem|pain point|struggling with|looking for a solution|challenge)\b/i },
  { key: 'timeline_committed', label: 'Timeline committed', pattern: /\b(asap|next (week|month|quarter)|this (week|month)|by [a-z]+ \d|timeline|deadline)\b/i },
  { key: 'next_step_agreed', label: 'Concrete next step agreed', pattern: /\b(follow.?up|send me|schedule|book a (call|demo|meeting)|next steps?)\b/i },
];

export function detectCallSignals(transcript: string): CallSignalResult {
  const signals: CallSignal[] = SIGNAL_PATTERNS.map(({ key, label, pattern }) => {
    const match = transcript.match(pattern);
    return { key, label, detected: !!match, matchedText: match ? match[0] : null };
  });

  const score = signals.filter((s) => s.detected).length * 20;
  const tier: 'cold' | 'warm' | 'hot' = score >= 60 ? 'hot' : score >= 20 ? 'warm' : 'cold';
  return { signals, score, tier };
}

// Extracts a real email address from the transcript text, if present --
// same fallback discipline as the chat sales-qualification pipeline
// (use case 9): a contact can only be auto-linked using a real value
// that was actually said/typed, never fabricated.
function extractEmailFromTranscript(transcript: string): string | null {
  const match = transcript.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return match ? match[0] : null;
}

export interface CallQualificationStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface VoiceCallQualificationResult {
  runId: string;
  stages: CallQualificationStageResult[];
  callId: string | null;
  score: number;
  tier: 'cold' | 'warm' | 'hot' | null;
  signals: CallSignal[];
  contactId: string | null;
  contactCreated: boolean;
}

// Real, deterministic. Loads a real call log's real transcript, scores
// real BANT+next-step signals, writes the score/tier back, and -- only
// for a real hot tier -- links to an already-selected contact or, if
// none was selected, falls back to a real email address found in the
// transcript text itself. Never auto-links a cold/warm call (too
// little signal to justify creating a sales record) and never
// fabricates an email.
export async function runVoiceCallQualificationPipeline(params: { callId: string; triggeredBy?: string | null }): Promise<VoiceCallQualificationResult> {
  const stages: CallQualificationStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'voice_ai',
    operationName: 'pipeline_call_qualification',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const call = getVoiceCallLogById(params.callId);
  if (!call) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'call not found' });
    return { runId, stages, callId: null, score: 0, tier: null, signals: [], contactId: null, contactCreated: false };
  }

  stages.push({ stage: 'fetch_transcript', input: { callId: params.callId }, process: 'Load the real, admin-entered transcript for this call log', output: { transcriptLength: call.transcript.length }, status: 'ok' });

  const result = detectCallSignals(call.transcript);
  stages.push({
    stage: 'detect_call_signals',
    input: { rule: '5 BANT-style signal categories, 20 points each, real transcript text only' },
    process: 'Scan the real transcript for budget/authority/need/timeline/next-step signals',
    output: { score: result.score, tier: result.tier, detected: result.signals.filter((s) => s.detected).map((s) => s.key) },
    status: 'ok',
  });

  let contactId: string | null = call.contactId ?? null;
  let contactCreated = false;
  if (result.tier === 'hot' && !contactId) {
    const emailFromTranscript = extractEmailFromTranscript(call.transcript);
    if (emailFromTranscript) {
      const existing = getContactByEmail(emailFromTranscript);
      if (existing) {
        contactId = existing.id;
        stages.push({ stage: 'link_contact', input: { email: emailFromTranscript }, process: 'Hot call with a real email in the transcript already on file as a contact -- link, do not duplicate', output: { contactId, created: false }, status: 'ok' });
      } else {
        contactId = createContact({ email: emailFromTranscript, source: 'voice_call' });
        contactCreated = true;
        stages.push({ stage: 'link_contact', input: { email: emailFromTranscript }, process: 'Hot call with a real email in the transcript not yet a contact -- create one, source=voice_call', output: { contactId, created: true }, status: 'ok' });
      }
    } else {
      stages.push({ stage: 'link_contact', input: {}, process: 'Hot call but no contact was pre-selected and no real email is present in the transcript -- cannot create a contact without one', output: 'skipped', status: 'ok' });
    }
  } else {
    stages.push({ stage: 'link_contact', input: {}, process: contactId ? 'Already linked to a contact' : `Tier is ${result.tier}, below the hot threshold for auto-linking a contact`, output: 'skipped', status: 'ok' });
  }

  setCallQualification(params.callId, { qualificationScore: result.score, qualificationTier: result.tier, contactId: contactId ?? undefined });
  stages.push({ stage: 'write_qualification', input: {}, process: 'Write real score/tier (and contactId if linked) back to voice_call_logs', output: { score: result.score, tier: result.tier, contactId }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: result.score, tier: result.tier, contactId } });
  return { runId, stages, callId: params.callId, score: result.score, tier: result.tier, signals: result.signals, contactId, contactCreated };
}
