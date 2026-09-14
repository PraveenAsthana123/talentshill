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
  totalRequests: number;
  qualifiedRequests: number;
  byTier: Record<string, number>;
  contactsLinkedFromChat: number;
}

export default async function ChatShareReportPage({ params }: Props) {
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
          <tr><td>Total chat requests</td><td>{data.totalRequests}</td></tr>
          <tr><td>Qualified (scored)</td><td>{data.qualifiedRequests}</td></tr>
          <tr><td>Hot</td><td>{data.byTier.hot ?? 0}</td></tr>
          <tr><td>Warm</td><td>{data.byTier.warm ?? 0}</td></tr>
          <tr><td>Cold</td><td>{data.byTier.cold ?? 0}</td></tr>
          <tr><td>Contacts linked from chat</td><td>{data.contactsLinkedFromChat}</td></tr>
        </tbody>
      </table>

      <p className={styles.disclosure}>
        Aggregate counts only -- visitor names, emails, and conversation content are never included
        in this shared report. Qualification tiers are computed from real keyword-detected buying
        signals in the real conversation, never estimated by an AI model.
      </p>
    </div>
  );
}
