import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { join } from 'path';
import { db, schema } from '@/lib/db/index';

export interface DefineGoldenPathInput {
  code: string;
  title: string;
  description: string;
  evidenceDocPath: string;
  verifiedBy: string;
}

// Real file-existence check -- refuses to register a golden path whose
// evidence doc doesn't actually exist. This is the exact bug class
// SohamYoga's own golden path registry caught once (GP-02 pointed to a
// nonexistent file); enforced here structurally, not just by discipline.
export function defineGoldenPath(input: DefineGoldenPathInput): string {
  const fullPath = join(process.cwd(), input.evidenceDocPath);
  if (!existsSync(fullPath)) {
    throw new Error(`evidenceDocPath does not exist: ${input.evidenceDocPath}`);
  }
  const now = new Date();
  const id = randomUUID();
  db.insert(schema.goldenPath).values({
    id, code: input.code, title: input.title, description: input.description,
    evidenceDocPath: input.evidenceDocPath, verifiedAt: now, verifiedBy: input.verifiedBy, createdAt: now,
  }).onConflictDoUpdate({
    target: schema.goldenPath.code,
    set: { title: input.title, description: input.description, evidenceDocPath: input.evidenceDocPath, verifiedAt: now, verifiedBy: input.verifiedBy },
  }).run();
  return id;
}

export function getGoldenPaths() {
  return db.select().from(schema.goldenPath).all();
}

// Real, on-demand re-check that every registered path still exists --
// registry drift detection for this table specifically.
export function auditGoldenPaths(): { code: string; evidenceDocPath: string; stillExists: boolean }[] {
  return getGoldenPaths().map((gp) => ({
    code: gp.code, evidenceDocPath: gp.evidenceDocPath, stillExists: existsSync(join(process.cwd(), gp.evidenceDocPath)),
  }));
}
