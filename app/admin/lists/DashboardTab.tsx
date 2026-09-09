'use client';

import { useEffect, useState } from 'react';
import styles from './ListsShared.module.css';

interface DashboardData {
  kpis: { totalLists: number; staticLists: number; dynamicLists: number; dynamicNeverSynced: number; totalMembers: number; totalRuns: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/lists/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; sync coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalLists}</span>Total lists</div>
          <div className={styles.vizBox}><span>{data.kpis.staticLists}</span>Static</div>
          <div className={styles.vizBox}><span>{data.kpis.dynamicLists}</span>Dynamic</div>
          <div className={styles.vizBox}><span>{data.kpis.dynamicNeverSynced}</span>Dynamic never synced</div>
          <div className={styles.vizBox}><span>{data.kpis.totalMembers}</span>Total members (all lists)</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
    </div>
  );
}
