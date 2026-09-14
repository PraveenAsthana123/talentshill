import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface SnapshotRow { snapshotDate: string; subscriberCount: number; totalViews: number }
interface SummaryData {
  latestSnapshots: SnapshotRow[];
  latestDelta: { daysBetween: number; subscriberDelta: number; viewsDelta: number; subscribersPerDay: number | null } | null;
}

export default async function YoutubeShareReportPage({ params }: Props) {
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

      {data.latestDelta && (
        <p>
          Over the last {data.latestDelta.daysBetween} days: {data.latestDelta.subscriberDelta >= 0 ? '+' : ''}{data.latestDelta.subscriberDelta} subscribers,
          {' '}{data.latestDelta.viewsDelta >= 0 ? '+' : ''}{data.latestDelta.viewsDelta} views.
        </p>
      )}

      {data.latestSnapshots.length === 0 ? (
        <p className={styles.empty}>No channel snapshots logged yet.</p>
      ) : (
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Subscribers</th><th>Total Views</th></tr></thead>
          <tbody>
            {data.latestSnapshots.map((s, i) => (
              <tr key={i}>
                <td>{new Date(s.snapshotDate).toLocaleDateString()}</td>
                <td>{s.subscriberCount.toLocaleString()}</td>
                <td>{s.totalViews.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        This report reflects real, manually-entered channel snapshots copied from the real YouTube
        Studio dashboard. No YouTube Data API/OAuth integration exists in this build -- growth
        figures are a real diff between two real snapshots, never a fabricated trend.
      </p>
    </div>
  );
}
