import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface ObservationRow { competitorName: string; observedAt: string; channel: string; campaignType: string }
interface SummaryData {
  totalCompetitors: number;
  totalObservations: number;
  byChannel: Record<string, number>;
  byType: Record<string, number>;
  recentObservations: ObservationRow[];
}

export default async function CompetitorAnalysisShareReportPage({ params }: Props) {
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
          <tr><td>Competitors tracked</td><td>{data.totalCompetitors}</td></tr>
          <tr><td>Campaign observations logged</td><td>{data.totalObservations}</td></tr>
        </tbody>
      </table>

      {data.recentObservations.length > 0 && (
        <>
          <h2 style={{ marginTop: '1.5rem', fontSize: '1.1rem' }}>Recent Observations</h2>
          <table className={styles.table}>
            <thead><tr><th>Competitor</th><th>Date</th><th>Channel</th><th>Type</th></tr></thead>
            <tbody>
              {data.recentObservations.map((o, i) => (
                <tr key={i}>
                  <td>{o.competitorName}</td><td>{new Date(o.observedAt).toLocaleDateString()}</td>
                  <td>{o.channel}</td><td>{o.campaignType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className={styles.disclosure}>
        Real, admin-entered observations of publicly visible competitor activity. No automated
        scraping, ad-library, or competitive-intelligence API integration exists in this build --
        every observation was logged by a human who actually saw it.
      </p>
    </div>
  );
}
