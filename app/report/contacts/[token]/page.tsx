import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface LifecycleSummaryData {
  total: number;
  byLifecycleStage: { stage: string; count: number }[];
}

export default async function ContactsShareReportPage({ params }: Props) {
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

  const data = report.data as LifecycleSummaryData;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Total contacts</span>
          <span className={styles.summaryValue}>{data.total}</span>
        </div>
      </div>

      <h3>By lifecycle stage</h3>
      <table className={styles.table}>
        <thead><tr><th>Stage</th><th>Count</th></tr></thead>
        <tbody>
          {data.byLifecycleStage.map((s) => (
            <tr key={s.stage}><td>{s.stage}</td><td>{s.count}</td></tr>
          ))}
        </tbody>
      </table>

      <p className={styles.disclosure}>
        This is an aggregate summary only. Individual contact names and emails are never included
        in a shared report.
      </p>
    </div>
  );
}
