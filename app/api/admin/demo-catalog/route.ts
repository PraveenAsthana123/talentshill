import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getOwnModuleDemoCatalog, getOwnModuleDemoCatalogCount } from '@/lib/presales/demo-catalog';

// Reuses the 'health' RBAC resource, same as the pre-existing
// app/api/admin/module-registry/route.ts (this is a filtered view of the
// same real table, not a new data source).
export const GET = withPermission('health', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ catalog: getOwnModuleDemoCatalog(), counts: getOwnModuleDemoCatalogCount() });
});
