import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface SnapshotRow {
  snapshotDate: string;
  healthScore: number;
  totalMentions: number;
  positiveMentions: number;
  neutralMentions: number;
  negativeMentions: number;
  competitorsTracked: number;
  label: string | null;
}

export default async function BrandingShareReportPage({ params }: Props) {
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

  const data = report.data as { latestSnapshots: SnapshotRow[] };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      {data.latestSnapshots.length === 0 ? (
        <p className={styles.empty}>No brand health snapshots yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Date</th><th>Label</th><th>Health Score</th><th>Positive</th><th>Neutral</th><th>Negative</th><th>Competitors Tracked</th></tr>
          </thead>
          <tbody>
            {data.latestSnapshots.map((s, i) => (
              <tr key={i}>
                <td>{new Date(s.snapshotDate).toLocaleDateString()}</td>
                <td>{s.label ?? '—'}</td>
                <td>{s.healthScore}</td>
                <td>{s.positiveMentions}</td>
                <td>{s.neutralMentions}</td>
                <td>{s.negativeMentions}</td>
                <td>{s.competitorsTracked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        This report reflects real, manually-logged mention data and Ollama-computed sentiment. No
        social-listening/news/review-platform API integration exists -- mentions are entered by an
        analyst from real sources they have reviewed.
      </p>
    </div>
  );
}
