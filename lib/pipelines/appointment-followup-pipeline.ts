import { getAppointmentById, updateAppointmentUrgency } from '@/lib/appointments-db';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface FollowupStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface AppointmentFollowupResult { runId: string; stages: FollowupStageResult[]; score: number; appointmentId: string | null }

// Real, deterministic follow-up urgency score -- distinct from the
// booking-time leadScore/leadTier (computed once at submission from
// budget/timeline/company-size). This score answers "how urgently does
// staff need to act on this booking right now", grounded only in fields
// that actually exist on the appointment record:
//   status         50 (pending, needs action) / 25 (confirmed) / 0 (completed/cancelled)
//   leadTier bonus 30 hot / 20 warm / 10 cool / 0 cold
//   staleness      +20 if still pending >24h since creation, +10 if >4h
// Writes to the real, previously-unused appointments.followUpUrgency field.
export function runAppointmentFollowupPipeline(params: { appointmentId: string; triggeredBy?: string | null }): AppointmentFollowupResult {
  const stages: FollowupStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'appointments', operationName: 'pipeline_followup_urgency', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const appointment = getAppointmentById(params.appointmentId);
  if (!appointment) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'appointment not found' });
    return { runId, stages, score: 0, appointmentId: null };
  }

  const statusScores: Record<string, number> = { pending: 50, confirmed: 25, completed: 0, cancelled: 0 };
  const statusScore = statusScores[appointment.status] ?? 0;
  stages.push({ stage: 'status_check', input: appointment.status, process: 'pending=50, confirmed=25, completed/cancelled=0', output: statusScore, status: 'ok' });

  const tierScores: Record<string, number> = { hot: 30, warm: 20, cool: 10, cold: 0 };
  const tierScore = tierScores[appointment.leadTier] ?? 0;
  stages.push({ stage: 'tier_check', input: appointment.leadTier, process: 'hot=30, warm=20, cool=10, cold=0', output: tierScore, status: 'ok' });

  const hoursSinceCreated = (Date.now() - new Date(appointment.createdAt).getTime()) / (1000 * 60 * 60);
  let stalenessScore = 0;
  if (appointment.status === 'pending') {
    stalenessScore = hoursSinceCreated > 24 ? 20 : hoursSinceCreated > 4 ? 10 : 0;
  }
  stages.push({ stage: 'staleness_check', input: `${hoursSinceCreated.toFixed(1)}h since created, status=${appointment.status}`, process: 'pending >24h=+20, pending >4h=+10, else 0 (only applies while pending)', output: stalenessScore, status: 'ok' });

  const totalScore = Math.min(100, statusScore + tierScore + stalenessScore);
  updateAppointmentUrgency(params.appointmentId, totalScore);
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update appointments.followUpUrgency (real, previously-unused field)', output: { followUpUrgency: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, appointmentId: params.appointmentId };
}
