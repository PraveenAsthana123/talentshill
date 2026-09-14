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
  totalWebinars: number;
  totalRegistrants: number;
  attendedCount: number;
  qualifiedCount: number;
  pipelineLinkedCount: number;
  byTier: Record<string, number>;
}

export default async function AppointmentsShareReportPage({ params }: Props) {
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
          <tr><td>Webinars</td><td>{data.totalWebinars}</td></tr>
          <tr><td>Registrants</td><td>{data.totalRegistrants}</td></tr>
          <tr><td>Attended</td><td>{data.attendedCount}</td></tr>
          <tr><td>Qualified (warm/hot)</td><td>{data.qualifiedCount}</td></tr>
          <tr><td>Linked into the leads pipeline</td><td>{data.pipelineLinkedCount}</td></tr>
        </tbody>
      </table>

      <p className={styles.disclosure}>
        Aggregate counts only -- registrant names, emails, and engagement notes are never included
        in this shared report. No real webinar-platform integration exists in this build --
        attendance and engagement are real, admin-entered observations, never a fabricated
        join-duration or engagement figure.
      </p>
    </div>
  );
}
