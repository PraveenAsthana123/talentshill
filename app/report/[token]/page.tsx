import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from './ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface BudgetSuggestion {
  campaignId: string;
  name: string;
  platform: string;
  currentBudget: number | null;
  roas: number | null;
  action: string;
  suggestedDeltaPct: number;
  reason: string;
}

export default async function ShareReportPage({ params }: Props) {
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

  const data = report.data as { scoredCampaigns: number; unscoredCampaigns: number; suggestions: BudgetSuggestion[] };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Campaigns with performance data</span>
          <span className={styles.summaryValue}>{data.scoredCampaigns}</span>
        </div>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Campaigns awaiting data</span>
          <span className={styles.summaryValue}>{data.unscoredCampaigns}</span>
        </div>
      </div>

      {data.suggestions.length === 0 ? (
        <p className={styles.empty}>No campaign performance data has been entered yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Platform</th>
              <th>ROAS</th>
              <th>Recommendation</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.suggestions.map((s) => (
              <tr key={s.campaignId}>
                <td>{s.name}</td>
                <td>{s.platform}</td>
                <td>{s.roas === null ? 'No data' : s.roas.toFixed(2)}</td>
                <td className={styles[s.action] ?? ''}>
                  {s.action === 'increase' ? `Increase ${s.suggestedDeltaPct}%` : s.action === 'decrease' ? `Decrease ${Math.abs(s.suggestedDeltaPct)}%` : 'Hold'}
                </td>
                <td>{s.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        This report is generated from manually-entered campaign metrics. It does not reflect a
        live ad-platform data sync. Recommendations are advisory, not automatically applied.
      </p>
    </div>
  );
}
