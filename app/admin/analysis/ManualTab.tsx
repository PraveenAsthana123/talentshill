'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import styles from './AdminAnalysis.module.css';
import sharedStyles from './AnalysisShared.module.css';

interface Framework {
  id: string;
  categoryKey: string;
  categoryName: string;
  description: string | null;
  totalItems: number;
  analysisTypes: { index: number; name: string }[];
  assessmentCount: number;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fwRes, rRes] = await Promise.all([
          fetch('/api/admin/analysis/frameworks'),
          fetch('/api/admin/operation-runs/?moduleKey=analysis&executionMode=manual&limit=20'),
        ]);
        const fwData = await fwRes.json();
        const rData = await rRes.json().catch(() => ({ runs: [] }));
        setFrameworks(fwData.frameworks || []);
        setRuns(rData.runs || []);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = frameworks.filter(fw =>
    fw.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    (fw.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Evaluate AI systems across 35 analysis frameworks with scoring matrices — real per-item scoring, saved as assessments per project. Full item-by-item scoring editor lives on each framework&apos;s detail page.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Create an assessment against the right framework for the project</li><li>Score items as you go — status + score per item</li><li>Run Pipeline or Agentic health scoring to catch stale or abandoned assessments before they rot</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/admin/analysis/projects" className={styles.projectsLink}>View Projects</Link>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading frameworks...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No frameworks found.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((fw) => (
              <Link key={fw.id} href={`/admin/analysis/${fw.categoryKey}`} className={styles.card}>
                <h3 className={styles.cardTitle}>{fw.categoryName}</h3>
                <p className={styles.cardDesc}>{fw.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardStat}>{fw.totalItems} items</span>
                  <span className={styles.cardStat}>{fw.assessmentCount} assessments</span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
