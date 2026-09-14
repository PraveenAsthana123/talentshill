import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface LeadsSummaryData {
  total: number;
  hotLeads: number;
  warmLeads: number;
  byIndustry: { industry: string; count: number }[];
  byQualificationStage: { stage: string; count: number }[];
}

export default async function LeadsShareReportPage({ params }: Props) {
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

  const data = report.data as LeadsSummaryData;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Total leads</span>
          <span className={styles.summaryValue}>{data.total}</span>
        </div>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Hot leads</span>
          <span className={styles.summaryValue}>{data.hotLeads}</span>
        </div>
        <div className={styles.summaryBox}>
          <span className={styles.summaryLabel}>Warm leads</span>
          <span className={styles.summaryValue}>{data.warmLeads}</span>
        </div>
      </div>

      <h3>By qualification stage</h3>
      <table className={styles.table}>
        <thead><tr><th>Stage</th><th>Count</th></tr></thead>
        <tbody>
          {data.byQualificationStage.map((s) => (
            <tr key={s.stage}><td>{s.stage}</td><td>{s.count}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>By industry</h3>
      <table className={styles.table}>
        <thead><tr><th>Industry</th><th>Count</th></tr></thead>
        <tbody>
          {data.byIndustry.map((i) => (
            <tr key={i.industry}><td>{i.industry}</td><td>{i.count}</td></tr>
          ))}
        </tbody>
      </table>

      <p className={styles.disclosure}>
        This is an aggregate summary only. Individual lead names, emails, and phone numbers are
        never included in a shared report.
      </p>
    </div>
  );
}
