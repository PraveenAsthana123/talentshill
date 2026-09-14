import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface SummaryData {
  totalCalls: number;
  qualifiedCalls: number;
  byTier: Record<string, number>;
  contactsLinkedFromCalls: number;
}

export default async function VoiceAiShareReportPage({ params }: Props) {
  const { token } = await params;
  const resolved = resolveReportShareToken(token);

  if (!resolved) notFound();

  if (!resolved.valid) {
    return (
      <div className={styles.wrap}>
        <div className={styles.errorCard}>
          <h1>Report unavailable</h1>
          <p>{resolved.reason}</p>
        </div>
      </div>
    );
  }

  const report = await resolveShareableReport(resolved.moduleKey, resolved.reportType, resolved.entityId);
  if (!report) notFound();

  const data = report.data as SummaryData;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <table className={styles.table}>
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Total calls logged</td><td>{data.totalCalls}</td></tr>
          <tr><td>Qualified (scored)</td><td>{data.qualifiedCalls}</td></tr>
          <tr><td>Hot</td><td>{data.byTier.hot ?? 0}</td></tr>
          <tr><td>Warm</td><td>{data.byTier.warm ?? 0}</td></tr>
          <tr><td>Cold</td><td>{data.byTier.cold ?? 0}</td></tr>
          <tr><td>Contacts linked from calls</td><td>{data.contactsLinkedFromCalls}</td></tr>
        </tbody>
      </table>

      <p className={styles.disclosure}>
        Aggregate counts only -- call transcripts and phone numbers are never included in this
        shared report. Qualification tiers are computed from real BANT-style signals detected in
        real, admin-entered call transcripts, never estimated by an AI model. No telephony
        integration exists in this build -- transcripts are manually entered by an admin from a
        real call, not recorded or transcribed automatically.
      </p>
    </div>
  );
}
