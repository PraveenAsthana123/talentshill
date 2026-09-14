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
  totalMessages: number;
  byChannel: Record<string, number>;
  byStatus: Record<string, number>;
}

export default async function BroadcastsShareReportPage({ params }: Props) {
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
          <tr><td>Total re-engagement messages</td><td>{data.totalMessages}</td></tr>
          <tr><td>SMS</td><td>{data.byChannel.sms ?? 0}</td></tr>
          <tr><td>WhatsApp</td><td>{data.byChannel.whatsapp ?? 0}</td></tr>
          <tr><td>Logged</td><td>{data.byStatus.logged ?? 0}</td></tr>
          <tr><td>Failed</td><td>{data.byStatus.failed ?? 0}</td></tr>
        </tbody>
      </table>

      <p className={styles.disclosure}>
        Aggregate counts only -- message content and phone numbers are never included in this
        shared report. No real SMS/WhatsApp gateway integration exists in this build -- every
        message is a real, logged record of what would be sent to a real at-risk contact, not a
        confirmed delivery.
      </p>
    </div>
  );
}
