export interface JobContext {
  jobId: string;
  attempt: number;
  runId: string;
  payload: Record<string, unknown>;
  log: (level: 'info' | 'warn' | 'error', message: string, metadata?: Record<string, unknown>) => void;
}

export type JobHandler = (ctx: JobContext) => Promise<Record<string, unknown> | void>;

// Job type constants
export const JOB_TYPES = {
  CAMPAIGN_SEND: 'campaign_send',
  BROADCAST_SEND: 'broadcast_send',
  BANNER_SCHEDULE: 'banner_schedule',
  CSV_IMPORT: 'csv_import',
  EMAIL_SEND: 'email_send',
  MAINTENANCE_TOGGLE: 'maintenance_toggle',
  RAG_INGEST: 'rag_ingest',
  RAG_EMBED: 'rag_embed',
  RAG_EVALUATE: 'rag_evaluate',
} as const;
