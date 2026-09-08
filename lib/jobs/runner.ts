import {
  claimNextJob,
  updateJobStatus,
  createJobRun,
  completeJobRun,
  addJobLog,
} from '@/lib/db/job-queries';
import { getHandler } from './handlers';

const POLL_INTERVAL_MS = 5_000;
const MAX_BACKOFF_MS = 60_000;

let isRunning = false;
let pollTimer: ReturnType<typeof setTimeout> | null = null;

function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt - 1), MAX_BACKOFF_MS);
}

async function processNextJob(): Promise<boolean> {
  const job = claimNextJob();
  if (!job) return false;

  const handler = getHandler(job.type);
  if (!handler) {
    addJobLog(job.id, 'error', `No handler registered for job type: ${job.type}`);
    updateJobStatus(job.id, 'failed', { error: `Unknown job type: ${job.type}`, completedAt: new Date() });
    return true;
  }

  const runId = createJobRun(job.id, job.attempts ?? 1);
  const payload = job.payload ? JSON.parse(job.payload) : {};

  try {
    addJobLog(job.id, 'info', `Starting job (attempt ${job.attempts})`);

    const result = await handler({
      jobId: job.id,
      attempt: job.attempts ?? 1,
      runId,
      payload,
      log: (level, message, metadata) => addJobLog(job.id, level, message, metadata),
    });

    completeJobRun(runId, 'completed', result as Record<string, unknown> | undefined);
    updateJobStatus(job.id, 'completed', { completedAt: new Date() });
    addJobLog(job.id, 'info', 'Job completed successfully');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    completeJobRun(runId, 'failed', undefined, errorMessage);
    addJobLog(job.id, 'error', `Job failed: ${errorMessage}`);

    const maxRetries = job.maxRetries ?? 3;
    const attempts = job.attempts ?? 1;

    if (attempts < maxRetries) {
      // Schedule retry with backoff
      const backoffMs = getBackoffDelay(attempts);
      const retryAt = new Date(Date.now() + backoffMs);
      updateJobStatus(job.id, 'pending');
      addJobLog(job.id, 'info', `Retrying in ${backoffMs}ms (attempt ${attempts + 1}/${maxRetries})`);
    } else {
      updateJobStatus(job.id, 'failed', { error: errorMessage, completedAt: new Date() });
      addJobLog(job.id, 'error', `Job permanently failed after ${attempts} attempts`);
    }
    return true;
  }
}

async function poll() {
  if (!isRunning) return;

  try {
    const processed = await processNextJob();
    // If we processed a job, poll immediately for more
    if (processed && isRunning) {
      pollTimer = setTimeout(poll, 100);
    } else {
      pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
    }
  } catch {
    // Retry polling after delay on error
    pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
  }
}

export function startJobRunner() {
  if (isRunning) return;
  isRunning = true;
  poll();
}

export function stopJobRunner() {
  isRunning = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

export function isJobRunnerRunning(): boolean {
  return isRunning;
}
