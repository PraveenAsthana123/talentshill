import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface RoiSuggestion {
  campaignId: string;
  influencerName: string;
  platform: string;
  roi: number | null;
  action: string;
  reason: string;
}

export default async function InfluencerShareReportPage({ params }: Props) {
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

  const data = report.data as { scoredCreators: number; unscoredCreators: number; suggestions: RoiSuggestion[] };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Creators with performance data</span>
          <span className={styles.summaryValue}>{data.scoredCreators}</span>
        </div>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Creators awaiting data</span>
          <span className={styles.summaryValue}>{data.unscoredCreators}</span>
        </div>
      </div>

      {data.suggestions.length === 0 ? (
        <p className={styles.empty}>No creator performance data has been entered yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Creator</th>
              <th>Platform</th>
              <th>ROI</th>
              <th>Recommendation</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.suggestions.map((s) => (
              <tr key={s.campaignId}>
                <td>{s.influencerName}</td>
                <td>{s.platform}</td>
                <td>{s.roi === null ? 'No data' : `${(s.roi * 100).toFixed(0)}%`}</td>
                <td className={styles[s.action === 'renew' ? 'increase' : s.action === 'drop' ? 'decrease' : 'hold'] ?? ''}>
                  {s.action === 'renew' ? 'Renew' : s.action === 'drop' ? 'Do not renew' : 'Hold'}
                </td>
                <td>{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        This report is generated from manually-entered creator campaign metrics. It does not
        reflect a live social-platform data sync. Recommendations are advisory, not automatically
        applied.
      </p>
    </div>
  );
}
