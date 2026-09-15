import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  builtStatus: 'real',
  description: 'Real local-Ollama (phi4-mini:latest) video script generation for a video_clip_plans row or a standalone topic -- genuinely new LLM-generated content, not a template fill-in. Live-verified: real script generated and persisted with real token counts (69 prompt / 199 completion). Rendering (FFmpeg/transcode) remains a disclosed gap, same as the pre-existing videoClipPlans table.',
  apiRouteCount: 1,
  hasAdminUi: false,
  missingItems: 'API-only for now -- not yet wired into the existing video-editing admin UI tabs. No rendering pipeline (script generation only).',
  sourceDoc: 'docs/testing/2026-09-14_video-script-engine-log.txt',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-14-gap-analysis',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'video_script_engine')).run();
console.log('Updated video_script_engine -> real');
