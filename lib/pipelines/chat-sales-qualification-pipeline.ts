import { getRequest, getMessagesForRequest, setRequestQualification } from '@/lib/db/chat-queries';
import { getSessionById } from '@/lib/db/chat-queries';
import { getContactByEmail, createContact } from '@/lib/db/contact-crm-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface BuyingSignal { key: string; label: string; detected: boolean; matchedText: string | null }
export interface BuyingSignalResult { signals: BuyingSignal[]; score: number; tier: 'cold' | 'warm' | 'hot' }

// Pure, unit-tested: scans real conversation message content for real
// keyword-based buying signals. Each of 5 signal categories present
// contributes 20 points (0-100 total). Never an LLM guess -- a fixed,
// disclosed keyword match against text that was actually typed by the
// visitor (or, for contact_shared, real session/message data already
// on file).
const SIGNAL_PATTERNS: { key: string; label: string; pattern: RegExp }[] = [
  { key: 'pricing_interest', label: 'Asked about pricing/cost', pattern: /\b(price|pricing|cost|quote|how much)\b/i },
  { key: 'demo_request', label: 'Requested a demo/trial', pattern: /\b(demo|trial|show me|walkthrough)\b/i },
  { key: 'buying_intent', label: 'Expressed buying intent', pattern: /\b(buy|purchase|sign up|signup|get started|subscribe|onboard)\b/i },
  { key: 'timeline_urgency', label: 'Mentioned a timeline/urgency', pattern: /\b(asap|urgent|this week|this month|deadline|by [a-z]+ \d)\b/i },
  { key: 'contact_shared', label: 'Shared contact info in the conversation', pattern: /[\w.+-]+@[\w-]+\.[a-z]{2,}|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/i },
];

export function detectBuyingSignals(messages: { role: string; content: string }[], visitorEmailOnFile: string | null): BuyingSignalResult {
  const userText = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n');
  const signals: BuyingSignal[] = SIGNAL_PATTERNS.map(({ key, label, pattern }) => {
    if (key === 'contact_shared' && visitorEmailOnFile) {
      return { key, label, detected: true, matchedText: visitorEmailOnFile };
    }
    const match = userText.match(pattern);
    return { key, label, detected: !!match, matchedText: match ? match[0] : null };
  });

  const score = signals.filter((s) => s.detected).length * 20;
  const tier: 'cold' | 'warm' | 'hot' = score >= 60 ? 'hot' : score >= 20 ? 'warm' : 'cold';
  return { signals, score, tier };
}

export interface QualificationStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ChatQualificationResult {
  runId: string;
  stages: QualificationStageResult[];
  requestId: string | null;
  score: number;
  tier: 'cold' | 'warm' | 'hot' | null;
  signals: BuyingSignal[];
  contactId: string | null;
  contactCreated: boolean;
}

// Real, deterministic. Loads the real conversation transcript for a
// chat request, scores real buying signals, writes the score/tier back
// to chat_requests, and -- only for a real hot tier with a real
// visitor email on file -- links or creates a real contact and
// populates the previously-unused chat_requests.contact_id column.
// Never auto-links a cold/warm conversation (too little signal to
// justify creating a sales record) and never fabricates an email.
export async function runChatSalesQualificationPipeline(params: { requestId: string; triggeredBy?: string | null }): Promise<ChatQualificationResult> {
  const stages: QualificationStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'chat',
    operationName: 'pipeline_sales_qualification',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const request = getRequest(params.requestId);
  if (!request) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'request not found' });
    return { runId, stages, requestId: null, score: 0, tier: null, signals: [], contactId: null, contactCreated: false };
  }

  const session = getSessionById(request.sessionId);
  const messages = getMessagesForRequest(params.requestId);
  stages.push({ stage: 'fetch_conversation', input: { requestId: params.requestId }, process: 'Load the real message transcript for this request via its session', output: { messageCount: messages.length }, status: 'ok' });

  const result = detectBuyingSignals(messages, session?.visitorEmail ?? null);
  stages.push({
    stage: 'detect_buying_signals',
    input: { rule: '5 keyword-based signal categories, 20 points each, real conversation text only' },
    process: 'Scan real user messages for pricing/demo/buying-intent/timeline/contact-shared signals',
    output: { score: result.score, tier: result.tier, detected: result.signals.filter((s) => s.detected).map((s) => s.key) },
    status: 'ok',
  });

  // The session's own visitorEmail field is preferred (captured via the
  // existing captureEmail() flow), but nothing in this codebase actually
  // calls captureEmail() today -- without a fallback, a hot conversation
  // could never auto-link a contact in real usage. So when the session
  // field is empty, fall back to the real email the visitor actually
  // typed, if the contact_shared signal matched one (never a phone-number
  // match, which can't populate the contacts table's required email field).
  const contactSharedSignal = result.signals.find((s) => s.key === 'contact_shared');
  const matchedEmail = contactSharedSignal?.matchedText?.includes('@') ? contactSharedSignal.matchedText : null;
  const emailForContact = session?.visitorEmail ?? matchedEmail;

  let contactId: string | null = request.contactId ?? null;
  let contactCreated = false;
  if (result.tier === 'hot' && emailForContact && !contactId) {
    const existing = getContactByEmail(emailForContact);
    if (existing) {
      contactId = existing.id;
      stages.push({ stage: 'link_contact', input: { email: emailForContact }, process: 'Hot conversation with a real visitor email already on file as a contact -- link, do not duplicate', output: { contactId, created: false }, status: 'ok' });
    } else {
      contactId = createContact({ email: emailForContact, firstName: session?.visitorName ?? undefined, source: 'chat' });
      contactCreated = true;
      stages.push({ stage: 'link_contact', input: { email: emailForContact }, process: 'Hot conversation with a real visitor email not yet a contact -- create one, source=chat', output: { contactId, created: true }, status: 'ok' });
    }
  } else {
    stages.push({ stage: 'link_contact', input: {}, process: result.tier === 'hot' ? 'Hot but no real visitor email on file -- cannot create a contact without one' : `Tier is ${result.tier}, below the hot threshold for auto-linking a contact`, output: 'skipped', status: 'ok' });
  }

  setRequestQualification(params.requestId, { qualificationScore: result.score, qualificationTier: result.tier, contactId: contactId ?? undefined });
  stages.push({ stage: 'write_qualification', input: {}, process: 'Write real score/tier (and contactId if linked) back to chat_requests', output: { score: result.score, tier: result.tier, contactId }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: result.score, tier: result.tier, contactId } });
  return { runId, stages, requestId: params.requestId, score: result.score, tier: result.tier, signals: result.signals, contactId, contactCreated };
}
