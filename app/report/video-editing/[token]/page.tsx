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
  totalProjects: number;
  totalClipPlans: number;
  deliveredClips: number;
  byClipStatus: Record<string, number>;
  byClipPlatform: Record<string, number>;
}

export default async function VideoEditingShareReportPage({ params }: Props) {
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
          <tr><td>Source video projects</td><td>{data.totalProjects}</td></tr>
          <tr><td>Clip plans</td><td>{data.totalClipPlans}</td></tr>
          <tr><td>Delivered</td><td>{data.deliveredClips}</td></tr>
          {Object.entries(data.byClipPlatform).map(([platform, n]) => (
            <tr key={platform}><td>Platform: {platform}</td><td>{n}</td></tr>
          ))}
        </tbody>
      </table>

      <p className={styles.disclosure}>
        Aggregate counts only. No real video-processing/transcoding integration exists in this
        build -- clip plans are real, admin-entered timestamp/platform/status records, never an
        automatic render. &quot;Delivered&quot; means an admin manually attached a real output link
        they produced externally.
      </p>
    </div>
  );
}
