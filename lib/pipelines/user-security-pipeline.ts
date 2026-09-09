import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getUserById } from '@/lib/db/admin-queries';
import { getUserRoles, getUserPermissions } from '@/lib/db/rbac-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface SecurityStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface UserSecurityResult { runId: string; stages: SecurityStageResult[]; score: number; userId: string | null }

// Real, deterministic account-security health check grounded only in
// fields that actually exist -- catches a real misconfiguration class
// (a user with zero RBAC roles assigned can log in but perform no
// admin actions; a user with roles but zero resolved permissions is a
// dead-end account) rather than a subjective judgment. Writes to the
// real, previously-unused users.security_score field.
//   has 1+ RBAC role assigned      40
//   isActive                       30
//   role(s) resolve to 1+ permission  30
export async function runUserSecurityPipeline(params: { userId: string; triggeredBy?: string | null }): Promise<UserSecurityResult> {
  const stages: SecurityStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'users', operationName: 'pipeline_security_check', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const user = getUserById(params.userId);
  if (!user) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'user not found' });
    return { runId, stages, score: 0, userId: null };
  }

  const roles = getUserRoles(params.userId);
  const rolesScore = roles.length > 0 ? 40 : 0;
  stages.push({ stage: 'roles_check', input: `${roles.length} role(s): ${roles.map((r) => r.name).join(', ') || 'none'}`, process: 'Score 40 if 1+ RBAC role assigned (zero roles = user can log in but perform no admin actions)', output: rolesScore, status: 'ok' });

  const activeScore = user.isActive ? 30 : 0;
  stages.push({ stage: 'active_check', input: user.isActive, process: 'Score 30 if active', output: activeScore, status: 'ok' });

  const permissions = getUserPermissions(params.userId);
  const permissionsScore = permissions.length > 0 ? 30 : 0;
  stages.push({ stage: 'permissions_check', input: `${permissions.length} resolved permission(s)`, process: 'Score 30 if assigned role(s) resolve to 1+ permission (a role with zero permissions is a dead-end account)', output: permissionsScore, status: 'ok' });

  const totalScore = rolesScore + activeScore + permissionsScore;
  db.update(schema.users).set({ securityScore: totalScore }).where(eq(schema.users.id, params.userId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update users.security_score (real, previously-unused field)', output: { securityScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, userId: params.userId };
}
