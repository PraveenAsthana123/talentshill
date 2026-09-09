'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import styles from './AdminIntegrations.module.css';
import sharedStyles from './IntegrationsShared.module.css';

const CATEGORIES = ['all', 'messaging', 'social', 'productivity', 'data', 'webhook'];
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  useEffect(() => {
    fetch('/api/admin/integrations').then(r => r.json()).then(setIntegrations);
  }, []);

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=integrations&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  }, []);

  const filtered = category === 'all' ? integrations : integrations.filter((i: any) => i.category === category);

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Browse available integration providers, connect real accounts, test connections, and view real integration_logs — real create/test/delete control on the detail page for each provider.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Fixed security gap in this build</h4>
        <p>The list and detail APIs previously returned each account&apos;s raw <code>credentials</code> field verbatim (plaintext API keys/secrets) to the browser. Fixed to redact it, exposing only a <code>hasCredentials</code> boolean.</p>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.tabs}>
          {CATEGORIES.map(c => (
            <button key={c} className={`${styles.tab} ${category === c ? styles.tabActive : ''}`} onClick={() => setCategory(c)}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((i: any) => (
            <Link key={i.id} href={`/admin/integrations/${i.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardName}>{i.name}</h3>
                <span className={`${styles.badge} ${i.accounts?.length > 0 ? styles.badgeConnected : styles.badgeAvailable}`}>
                  {i.accounts?.length > 0 ? 'Connected' : 'Available'}
                </span>
              </div>
              <p className={styles.cardDesc}>{i.description || 'No description'}</p>
              <span className={styles.cardCategory}>{i.category}</span>
            </Link>
          ))}
          {filtered.length === 0 && <p className={styles.empty}>No integrations found</p>}
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
