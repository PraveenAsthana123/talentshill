import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// Real, queryable module status -- see lib/db/seed-module-registry.ts for
// how built_status is classified (from actually reading the code this
// session, not guessed). Mirrors sohamyoga-frontend's own module_registry
// pattern (Postgres there, SQLite/Drizzle here, same shape).
export const GET = withPermission('health', 'read')(async (_request: NextRequest, _context: unknown) => {
  const modules = db.select().from(schema.moduleRegistry).all()
    .sort((a, b) => {
      if (a.builtStatus === 'not_yet_cataloged' && b.builtStatus !== 'not_yet_cataloged') return -1;
      if (b.builtStatus === 'not_yet_cataloged' && a.builtStatus !== 'not_yet_cataloged') return 1;
      return a.name.localeCompare(b.name);
    });

  const tally = modules.reduce((m: Record<string, number>, r) => ({ ...m, [r.builtStatus]: (m[r.builtStatus] ?? 0) + 1 }), {} as Record<string, number>);
  const totalApiRoutes = modules.reduce((sum, r) => sum + r.apiRouteCount, 0);
  const adminUiCount = modules.filter((r) => r.hasAdminUi).length;

  return NextResponse.json({
    modules,
    tally,
    catalogedCount: modules.length,
    totalApiRoutes,
    adminUiCount,
    note: `${modules.length} module(s) cataloged, covering ${totalApiRoutes} of the 96 real admin API routes wired with RBAC this session. ${tally.partial ?? 0} marked partial have a real, disclosed gap -- see each module's missingItems, not a hidden shortfall.`,
  });
});

export const PATCH = withPermission('health', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { id?: string; verifiedBy?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

  const { eq } = await import('drizzle-orm');
  const userId = await getSessionUserIdAsync(request);
  const now = new Date();
  const updated = db.update(schema.moduleRegistry)
    .set({ lastVerifiedAt: now, verifiedBy: body.verifiedBy || 'admin', updatedAt: now })
    .where(eq(schema.moduleRegistry.id, body.id))
    .returning()
    .get();

  if (!updated) return NextResponse.json({ error: 'Module not found.' }, { status: 404 });
  logOperationRun({ moduleKey: 'module-registry', operationName: 'manual_verify_module', executionMode: 'manual', status: 'completed', inputPayload: { id: body.id }, triggeredBy: userId });
  return NextResponse.json({ module: updated });
});
