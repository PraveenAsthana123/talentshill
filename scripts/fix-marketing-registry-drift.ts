import { eq } from 'drizzle-orm';
import { db, schema } from '../lib/db/index';

const now = new Date();
db.update(schema.moduleRegistry).set({
  // Real bug found via the module-registry drift pipeline's
  // admin_ui_consistency_check: hasAdminUi=true but api_route_count=0.
  // Confirmed via repo search: the real UI is app/admin/marketing/workflow
  // (DashboardTab/ReportTab/PipelineTab/MonitoringTab/AgenticTab), which
  // genuinely consumes 5 real API routes under /api/admin/marketing/
  // (dashboard/report/pipeline/monitoring/agentic) -- api_route_count was
  // simply never set, same stale-count issue class already found and
  // fixed in broadcasts/appointments/video_editing/reels_management/youtube.
  apiRouteCount: 5,
  description: 'Marketing Workflow Readiness -- real UI at app/admin/marketing/workflow (Dashboard/Report/Pipeline/Monitoring/Agentic tabs), backed by 5 real API routes over the real marketing_workflows table.',
  lastVerifiedAt: now,
  verifiedBy: 'claude-session-2026-09-15-fix-all',
  updatedAt: now,
}).where(eq(schema.moduleRegistry.moduleKey, 'marketing')).run();
console.log('Fixed marketing registry drift: api_route_count 0 -> 5');
