import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface ContentSuggestion {
  contentId: string;
  title: string;
  contentType: string;
  conversionRate: number | null;
  action: string;
  reason: string;
}

export default async function ContentShareReportPage({ params }: Props) {
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

  const data = report.data as { scoredContent: number; unscoredContent: number; suggestions: ContentSuggestion[] };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Content with engagement data</span>
          <span className={styles.summaryValue}>{data.scoredContent}</span>
        </div>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Content awaiting data</span>
          <span className={styles.summaryValue}>{data.unscoredContent}</span>
        </div>
      </div>

      {data.suggestions.length === 0 ? (
        <p className={styles.empty}>No content performance data has been entered yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Title</th><th>Type</th><th>Conversion</th><th>Recommendation</th><th>Reason</th></tr>
          </thead>
          <tbody>
            {data.suggestions.map((s) => (
              <tr key={s.contentId}>
                <td>{s.title}</td>
                <td>{s.contentType}</td>
                <td>{s.conversionRate === null ? 'No data' : `${(s.conversionRate * 100).toFixed(1)}%`}</td>
                <td className={styles[s.action === 'produce_more' ? 'increase' : s.action === 'deprioritize' ? 'decrease' : 'hold'] ?? ''}>
                  {s.action === 'produce_more' ? 'Produce more' : s.action === 'deprioritize' ? 'Deprioritize' : 'Hold'}
                </td>
                <td>{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        This report is generated from manually-entered engagement metrics. It does not reflect a
        live analytics-platform sync. Recommendations are advisory, not automatically applied.
      </p>
    </div>
  );
}
