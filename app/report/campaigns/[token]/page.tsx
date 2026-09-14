import { notFound } from 'next/navigation';
import { resolveReportShareToken } from '@/lib/report-share/queries';
import { resolveShareableReport } from '@/lib/report-share/registry';
import '@/lib/report-share/resolvers/index';
import styles from '../../[token]/ShareReport.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

interface CampaignReportData {
  name: string;
  status: string;
  audienceCount: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  variants: { name: string; subject: string | null; openCount: number; clickCount: number }[];
}

export default async function CampaignShareReportPage({ params }: Props) {
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

  const data = report.data as CampaignReportData;

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1>{report.title}</h1>
        <p className={styles.meta}>Generated {new Date(report.generatedAt).toLocaleString()} — Status: {data.status}</p>
      </header>

      <div className={styles.summaryRow}>
        <div className={styles.summaryBox}><span className={styles.summaryLabel}>Audience</span><span className={styles.summaryValue}>{data.audienceCount}</span></div>
        <div className={styles.summaryBox}><span className={styles.summaryLabel}>Sent</span><span className={styles.summaryValue}>{data.totalSent}</span></div>
        <div className={styles.summaryBox}><span className={styles.summaryLabel}>Opened</span><span className={styles.summaryValue}>{data.totalOpened}</span></div>
        <div className={styles.summaryBox}><span className={styles.summaryLabel}>Clicked</span><span className={styles.summaryValue}>{data.totalClicked}</span></div>
      </div>

      {data.variants.length > 0 && (
        <>
          <h3>A/B Variants</h3>
          <table className={styles.table}>
            <thead><tr><th>Variant</th><th>Subject</th><th>Opens</th><th>Clicks</th></tr></thead>
            <tbody>
              {data.variants.map((v) => (
                <tr key={v.name}><td>{v.name}</td><td>{v.subject ?? '—'}</td><td>{v.openCount}</td><td>{v.clickCount}</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className={styles.disclosure}>
        This report reflects real campaign send/open/click data only. Individual recipient emails
        are never included in a shared report.
      </p>
    </div>
  );
}
