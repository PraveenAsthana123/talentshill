import { eq, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';

export interface OwnModuleDemo {
  moduleKey: string;
  name: string;
  description: string;
  hasAdminUi: boolean;
  sourceDoc: string | null;
  lastVerifiedAt: Date | null;
}

// Real catalog of TalentsHill's OWN live-verified built modules (distinct
// from app/demo's generic public AI/robotics solution demos) -- for
// internal/sales use when a prospect asks "what have you actually built
// for yourselves." Only builtStatus='real' rows qualify; 'partial' and
// 'not_built' are excluded, never listed as demo-ready.
export function getOwnModuleDemoCatalog(): OwnModuleDemo[] {
  const rows = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.builtStatus, 'real')).all();
  return rows
    .map((r) => ({ moduleKey: r.moduleKey, name: r.name, description: r.description, hasAdminUi: r.hasAdminUi, sourceDoc: r.sourceDoc, lastVerifiedAt: r.lastVerifiedAt }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getOwnModuleDemoCatalogCount(): { real: number; partial: number; notBuilt: number } {
  const real = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.builtStatus, 'real')).all().length;
  const partial = db.select().from(schema.moduleRegistry).where(eq(schema.moduleRegistry.builtStatus, 'partial')).all().length;
  const notBuilt = db.select().from(schema.moduleRegistry).where(and(eq(schema.moduleRegistry.builtStatus, 'not_built'))).all().length;
  return { real, partial, notBuilt };
}
