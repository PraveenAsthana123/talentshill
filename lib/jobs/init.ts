/**
 * Job runner initialization.
 * Import this file once to register all handlers and start the runner.
 */
import './handlers/index';
import { startJobRunner, isJobRunnerRunning } from './runner';

let initialized = false;

export function initJobRunner() {
  if (initialized || isJobRunnerRunning()) return;
  initialized = true;
  startJobRunner();
}
