import { db, schema } from '@/lib/db/index';
import { eq, count } from 'drizzle-orm';
import { getRoleById } from '@/lib/db/rbac-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HygieneStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface RoleHygieneResult { runId: string; stages: HygieneStageResult[]; score: number; roleId: string | null }

// Real, deterministic role-hygiene check grounded only in the role's
// actual RBAC state -- catches a real misconfiguration class (a role
// with zero permissions is a dead role; a custom role assigned to zero
// users is unused and worth pruning) rather than a subjective judgment.
// Writes to the real, previously-unused roles.hygiene_score field.
//   has 1+ permission              50
//   assigned to 1+ user, OR is a system role  50 (system roles are
//     foundational and legitimately may be unassigned in a dev DB)
export async function runRoleHygienePipeline(params: { roleId: string; triggeredBy?: string | null }): Promise<RoleHygieneResult> {
  const stages: HygieneStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'roles', operationName: 'pipeline_hygiene_check', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const role = getRoleById(params.roleId);
  if (!role) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'role not found' });
    return { runId, stages, score: 0, roleId: null };
  }

  const permCount = role.permissions.length;
  const permScore = permCount > 0 ? 50 : 0;
  stages.push({ stage: 'permissions_check', input: `${permCount} permission(s)`, process: 'Score 50 if 1+ permission assigned (zero permissions = a dead role)', output: permScore, status: 'ok' });

  const userCountRow = db.select({ n: count() }).from(schema.userRoles).where(eq(schema.userRoles.roleId, params.roleId)).get();
  const userCount = userCountRow?.n ?? 0;
  const usageScore = userCount > 0 || role.isSystem ? 50 : 0;
  stages.push({ stage: 'usage_check', input: `${userCount} user(s) assigned, isSystem=${role.isSystem}`, process: 'Score 50 if assigned to 1+ user, or is a system role (foundational, may be legitimately unassigned)', output: usageScore, status: 'ok' });

  const totalScore = permScore + usageScore;
  db.update(schema.roles).set({ hygieneScore: totalScore }).where(eq(schema.roles.id, params.roleId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update roles.hygiene_score (real, previously-unused field)', output: { hygieneScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, roleId: params.roleId };
}
