import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  // Stays 'partial' -- the telephony-integration gap (no Twilio/SIP/IVR)
  // remains real and unaddressed, central to this module's core value
  // prop. Only the consent-tracking sub-gap is closed by this fix.
  missingItems: 'Real voice-asset CRUD + BANT qualification scoring + Ollama call-summary agent (all live-verified, unchanged). No telephony integration exists in this build (no Twilio/SIP/IVR) -- this remains the real, unaddressed blocker to full functionality; a real paid telephony provider is required and out of scope for a code fix. FIXED 2026-09-14: added real consentRecorded/consentNotes fields to voice_call_logs, wired into the create-call-log API route, live-verified (a real call log with consentRecorded=true+notes persisted correctly; a real call log with no consent info honestly persisted null, not a fabricated default).',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'voice_ai')).run();
console.log('Updated voice_ai missing_items (consent gap closed, telephony gap remains, stays partial)');
