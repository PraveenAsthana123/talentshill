/**
 * Seed script for the module_registry table -- one row per real RBAC
 * resource (lib/db/seed-rbac.ts's RESOURCES list), status classified from
 * what this session actually verified while wiring RBAC into all 96 admin
 * routes (each file was read, not guessed) plus the earlier TalentsHill
 * comparison audit (docs/evidence/TALENTSHILL_COMPARISON.md in the sibling
 * sohamyoga repo). Run: npx tsx lib/db/seed-module-registry.ts
 *
 * built_status meanings (same taxonomy as sohamyoga-frontend's registry):
 *   real            -- API route(s) + real business logic + DB-backed, confirmed by reading the code
 *   partial         -- real schema/code exists but is unexercised or has a known real gap
 *   not_built       -- named as a resource but no working implementation
 *   not_yet_cataloged -- default; nothing here should stay this way after this seed runs
 */
import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const DB_PATH = join(process.cwd(), 'data', 'talentshill.db');
const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

type Row = {
  moduleKey: string;
  name: string;
  description: string;
  builtStatus: 'real' | 'partial' | 'not_built' | 'not_yet_cataloged';
  apiRouteCount: number;
  hasAdminUi: boolean;
  missingItems?: string;
};

const MODULES: Row[] = [
  { moduleKey: 'activity', name: 'Activity Feed', description: 'Admin activity log', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'analysis', name: 'AI Governance / Responsible AI Analysis', description: '35-category real Responsible-AI assessment framework, ported into sohamyoga-frontend this session', builtStatus: 'real', apiRouteCount: 7, hasAdminUi: true },
  { moduleKey: 'analytics', name: 'Analytics', description: 'Campaign and contact analytics dashboards', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'assets', name: 'Assets', description: 'Presentation/deck asset management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'banners', name: 'Banners', description: 'Site banner management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'broadcasts', name: 'Broadcasts', description: 'Mass-email broadcasts, launch bundled into generic PATCH', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true, missingItems: 'Launch action shares its permission gate with generic field edits (update, not manage) -- flagged, not fixed, this session' },
  { moduleKey: 'campaigns', name: 'Campaigns', description: 'Email campaign creation, launch, recipient tracking', builtStatus: 'real', apiRouteCount: 5, hasAdminUi: true },
  { moduleKey: 'chat', name: 'Live Chat', description: 'Chat request/session management with notes and responses', builtStatus: 'real', apiRouteCount: 6, hasAdminUi: true },
  { moduleKey: 'contacts', name: 'Contacts', description: 'Contact CRM, import/export, bulk actions', builtStatus: 'real', apiRouteCount: 5, hasAdminUi: true },
  { moduleKey: 'content', name: 'Content Management', description: 'Draft/version/publish content workflow', builtStatus: 'real', apiRouteCount: 5, hasAdminUi: true },
  { moduleKey: 'content_overrides', name: 'Content Overrides', description: 'Page/section/key-level content patching', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: false, missingItems: 'No dedicated admin page found this session (API only)' },
  { moduleKey: 'dashboard', name: 'Admin Dashboard', description: 'Top-level admin dashboard summary', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'email_compose', name: 'Email Compose', description: 'Ad-hoc compose-and-send, distinct from campaigns', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'email_profiles', name: 'Email Sender Profiles', description: 'SMTP sender identity management, distinct from smtp_configs', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'event_routes', name: 'Event Routing', description: 'Webhook-event to email-profile routing table', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: false, missingItems: 'No dedicated admin page found this session (API only)' },
  { moduleKey: 'features', name: 'Feature Flags', description: 'Feature flag toggle/versioning with cache-bust', builtStatus: 'real', apiRouteCount: 3, hasAdminUi: true },
  { moduleKey: 'health', name: 'Health Monitoring', description: 'Admin-authenticated operational health (DB size, table counts, job queue, errors)', builtStatus: 'partial', apiRouteCount: 1, hasAdminUi: true, missingItems: 'No public/unauthenticated liveness endpoint existed before this session; no continuously-scheduled external health-monitor was running (TalentsHill has no persistent deployment yet, per TALENTSHILL_COMPARISON.md)' },
  { moduleKey: 'industries', name: 'Industries', description: 'Industry catalog backing the public solutions/* pages', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'integrations', name: 'Integrations', description: 'Third-party integration accounts, connectivity test, logs', builtStatus: 'real', apiRouteCount: 4, hasAdminUi: true },
  { moduleKey: 'jobs', name: 'Job Queue', description: 'Background job queue with pause/cancel/retry', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'leads', name: 'Leads', description: 'Lead tracking and export', builtStatus: 'real', apiRouteCount: 3, hasAdminUi: true },
  { moduleKey: 'links', name: 'Links', description: 'Shortlink/redirect management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'lists', name: 'Contact Lists', description: 'Segmented contact lists with member preview', builtStatus: 'real', apiRouteCount: 3, hasAdminUi: true, missingItems: 'Was already granted to the Marketing role but had no matching RESOURCES entry -- silently no-op\'d until fixed this session' },
  { moduleKey: 'maintenance', name: 'Maintenance Mode', description: 'Global site maintenance-mode toggle', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'media', name: 'Media Library', description: 'File/media upload and management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'rag', name: 'RAG Pipeline', description: 'Document ingestion, chunking, search, evaluation', builtStatus: 'partial', apiRouteCount: 10, hasAdminUi: true, missingItems: 'Schema and routes are real, but rag_documents/rag_chunks/rag_embeddings/rag_runs all have zero real rows -- never exercised once, per TALENTSHILL_COMPARISON.md. Per this workspace\'s RAG+Ollama mandatory policy, this needs a real ingested document and a real retrieval run before it can be called functional, not just schema-complete' },
  { moduleKey: 'roles', name: 'Roles & Permissions', description: 'RBAC role/permission management, 274+ real permission rows', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true, missingItems: 'Admin role\'s description says "except role management" but Admin has always had full CRUD on roles (resources:\'*\' includes roles, and no roles/* route is manage-gated) -- pre-existing description/reality mismatch, not fixed this session' },
  { moduleKey: 'runs', name: 'Run History', description: 'Generic execution-run tracking (used by RAG evaluate, jobs, etc.)', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'services', name: 'Services Catalog', description: 'Service catalog backing public solutions pages', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'settings', name: 'Site Settings', description: 'Singleton site-wide settings', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'smtp_configs', name: 'SMTP Server Configs', description: 'SMTP server configuration and connectivity test', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true, missingItems: 'The create and test-connection actions share one POST handler/permission gate (create) -- a user who should only test cannot get narrower access without a route split, flagged this session' },
  { moduleKey: 'survey', name: 'Surveys', description: 'Survey response listing', builtStatus: 'real', apiRouteCount: 1, hasAdminUi: true },
  { moduleKey: 'templates', name: 'Email Templates', description: 'Email template management with test-send', builtStatus: 'real', apiRouteCount: 3, hasAdminUi: true },
  { moduleKey: 'users', name: 'Admin Users', description: 'Admin user account management (soft-deactivate on delete)', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'videos', name: 'Videos', description: 'Video content management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'webhooks', name: 'Webhooks', description: 'Outbound webhook management', builtStatus: 'real', apiRouteCount: 2, hasAdminUi: true },
  { moduleKey: 'workflows', name: 'Approval Workflows', description: 'Multi-step workflow with approve/comment sub-actions', builtStatus: 'real', apiRouteCount: 4, hasAdminUi: true },
  { moduleKey: 'oauth_login', name: 'Google/Microsoft OAuth Login', description: 'Existing-admin-only OAuth2+PKCE login, built this session', builtStatus: 'partial', apiRouteCount: 5, hasAdminUi: true, missingItems: 'Code-complete and tsc-verified, fail-closed path verified live -- but the actual provider redirect/token-exchange flow cannot be tested until real Google Cloud Console / Azure AD app credentials are registered and supplied' },
];

function seed() {
  console.log('--- Seeding module_registry ---');
  const now = new Date();
  for (const m of MODULES) {
    const existing = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).get();
    if (existing) {
      db.update(schema.moduleRegistry).set({
        name: m.name,
        description: m.description,
        builtStatus: m.builtStatus,
        apiRouteCount: m.apiRouteCount,
        hasAdminUi: m.hasAdminUi,
        missingItems: m.missingItems ?? null,
        sourceDoc: 'RBAC wiring session, 2026-09-08',
        lastVerifiedAt: now,
        verifiedBy: 'claude-session-2026-09-08',
        updatedAt: now,
      }).where(eq(schema.moduleRegistry.moduleKey, m.moduleKey)).run();
      console.log(`  Updated: ${m.moduleKey}`);
    } else {
      db.insert(schema.moduleRegistry).values({
        id: randomUUID(),
        moduleKey: m.moduleKey,
        name: m.name,
        description: m.description,
        builtStatus: m.builtStatus,
        apiRouteCount: m.apiRouteCount,
        hasAdminUi: m.hasAdminUi,
        missingItems: m.missingItems ?? null,
        sourceDoc: 'RBAC wiring session, 2026-09-08',
        lastVerifiedAt: now,
        verifiedBy: 'claude-session-2026-09-08',
        createdAt: now,
        updatedAt: now,
      }).run();
      console.log(`  Created: ${m.moduleKey}`);
    }
  }
  console.log(`--- Done: ${MODULES.length} modules seeded ---`);
}

seed();
