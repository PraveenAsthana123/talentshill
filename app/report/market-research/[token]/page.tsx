import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface RankedRow {
  rank: number | null;
  title: string;
  topic: string;
  opportunityScore: number | null;
  somEstimateUsd: number | null;
  competitionLevel: string | null;
  riskLevel: string | null;
  strategicFitScore: number | null;
}

export default async function MarketResearchShareReportPage({ params }: Props) {
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

  const data = report.data as { ranked: RankedRow[] };

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      {data.ranked.length === 0 ? (
        <p className={styles.empty}>No opportunities scored yet.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr><th>Rank</th><th>Opportunity</th><th>Topic</th><th>Score</th><th>SOM Estimate</th><th>Competition</th><th>Risk</th><th>Strategic Fit</th></tr>
          </thead>
          <tbody>
            {data.ranked.map((r, i) => (
              <tr key={i}>
                <td>{r.rank}</td>
                <td>{r.title}</td>
                <td>{r.topic}</td>
                <td>{r.opportunityScore}/100</td>
                <td>{r.somEstimateUsd !== null ? `$${r.somEstimateUsd.toLocaleString()}` : '—'}</td>
                <td>{r.competitionLevel ?? '—'}</td>
                <td>{r.riskLevel ?? '—'}</td>
                <td>{r.strategicFitScore ?? '—'}/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className={styles.disclosure}>
        Every SOM estimate, competition level, risk level, and strategic-fit score above is a real
        input entered by an analyst. The composite opportunity score and rank are computed by a
        fixed, disclosed deterministic formula -- never estimated or fabricated by an AI model.
      </p>
    </div>
  );
}
