'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminSurvey.module.css';
import sharedStyles from './SurveyShared.module.css';

interface SurveyStats {
  total: number; avgScore: number; levelDistribution: { level: string; count: number }[];
  industryDistribution: { industry: string; count: number }[]; topTags: { tag: string; count: number }[]; recentCount30d: number;
}
interface ResponseRow {
  id: string; contactName: string | null; email: string | null; company: string | null; industry: string | null;
  totalScore: number; maturityLevel: string; segmentationTags: string[]; createdAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/survey?stats=true').then((r) => r.json()),
      fetch('/api/admin/survey?limit=50').then((r) => r.json()),
      fetch('/api/admin/operation-runs/?moduleKey=survey&executionMode=manual&limit=20').then((r) => (r.ok ? r.json() : { runs: [] })),
    ])
      .then(([statsData, listData, rData]) => {
        setStats(statsData.stats || null);
        setResponses(listData.responses || []);
        setRuns(rData.runs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const levelColor = (level: string) => {
    switch (level) { case 'leader': return styles.levelLeader; case 'advanced': return styles.levelAdvanced; case 'developing': return styles.levelDeveloping; default: return styles.levelBeginner; }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Review AI-readiness survey submissions, maturity distribution, and segmentation tags to identify real prospects worth following up with.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Review recent responses and maturity distribution</li><li>Run Pipeline or Agentic outreach-priority scoring for follow-up</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {stats && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><div className={styles.statValue}>{stats.total}</div><div className={styles.statLabel}>Total Responses</div></div>
              <div className={styles.statCard}><div className={styles.statValue}>{stats.avgScore}</div><div className={styles.statLabel}>Avg Score</div></div>
              <div className={styles.statCard}><div className={styles.statValue}>{stats.recentCount30d}</div><div className={styles.statLabel}>Last 30 Days</div></div>
            </div>
            <div className={styles.columns}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Maturity Distribution</h2>
                <div className={styles.distributionList}>
                  {stats.levelDistribution.map(({ level, count }) => (
                    <div key={level} className={styles.distributionItem}>
                      <span className={cn(styles.levelBadge, levelColor(level))}>{level}</span>
                      <div className={styles.barWrap}><div className={styles.bar} style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }} /></div>
                      <span className={styles.distributionCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Top Segmentation Tags</h2>
                <div className={styles.tagsList}>
                  {stats.topTags.map(({ tag, count }) => (
                    <div key={tag} className={styles.tagItem}><span className={styles.tagName}>{tag}</span><span className={styles.tagCount}>{count}</span></div>
                  ))}
                  {stats.topTags.length === 0 && <p className={styles.empty}>No tags yet.</p>}
                </div>
              </div>
            </div>
          </>
        )}

        <h2 className={styles.sectionTitle}>Recent Responses</h2>
        <div className={styles.tableWrap}>
          {responses.length === 0 ? <div className={styles.empty}>No survey responses yet.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Company</th><th>Score</th><th>Level</th><th>Tags</th><th>Date</th></tr></thead>
              <tbody>
                {responses.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.nameCell}>{r.contactName || 'Anonymous'}</td>
                    <td>{r.company || '-'}</td>
                    <td><strong>{r.totalScore}</strong></td>
                    <td><span className={cn(styles.levelBadge, levelColor(r.maturityLevel))}>{r.maturityLevel}</span></td>
                    <td>
                      <div className={styles.tagsWrap}>
                        {r.segmentationTags.slice(0, 3).map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                        {r.segmentationTags.length > 3 && <span className={styles.tagMore}>+{r.segmentationTags.length - 3}</span>}
                      </div>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={sharedStyles.empty}>No manual operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.operationName}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
