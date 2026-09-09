'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './AdminModuleRegistry.module.css';
import sharedStyles from './ModuleRegistryShared.module.css';

interface ModuleRow {
  id: string;
  moduleKey: string;
  name: string;
  description: string;
  builtStatus: 'real' | 'partial' | 'not_built' | 'not_yet_cataloged';
  apiRouteCount: number;
  hasAdminUi: boolean;
  missingItems: string | null;
  driftScore: number | null;
  lastVerifiedAt: string | null;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const STATUS_VARIANT: Record<ModuleRow['builtStatus'], 'success' | 'warning' | 'error' | 'default'> = {
  real: 'success',
  partial: 'warning',
  not_built: 'error',
  not_yet_cataloged: 'default',
};

export default function ManualTab() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingId, setVerifyingId] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const load = () => {
    fetch('/api/admin/module-registry')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => { setModules(d.modules); setTally(d.tally); setNote(d.note); })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=module-registry&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => { load(); loadRuns(); }, []);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      await fetch('/api/admin/module-registry', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
      });
      load();
      loadRuns();
    } finally { setVerifyingId(''); }
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Real, queryable catalog of every admin module&apos;s built-vs-partial status — not a claim, checked against the actual code. &quot;Verify&quot; records that an admin re-confirmed the row is still accurate.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>A &quot;partial&quot; status must always carry a disclosed missingItems reason, never a blank gap</li><li>Verify a module after re-checking it against the real code, not on a schedule alone</li><li>Run Pipeline or Agentic drift scoring to catch a stale or inconsistent registry row</li></ul>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className={styles.error}>Failed to load: {error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.cardsGrid}>
            <div className={styles.card}><div className={styles.cardTitle}>Real</div><div className={styles.cardValue}>{tally.real ?? 0}</div></div>
            <div className={styles.card}><div className={styles.cardTitle}>Partial</div><div className={styles.cardValue}>{tally.partial ?? 0}</div></div>
            <div className={styles.card}><div className={styles.cardTitle}>Not built</div><div className={styles.cardValue}>{tally.not_built ?? 0}</div></div>
            <div className={styles.card}><div className={styles.cardTitle}>Not yet cataloged</div><div className={styles.cardValue}>{tally.not_yet_cataloged ?? 0}</div></div>
          </div>

          <p className={styles.note}>{note}</p>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Module</th>
                <th>Status</th>
                <th>API routes</th>
                <th>Admin UI</th>
                <th>Disclosed gap</th>
                <th>Drift score</th>
                <th>Last verified</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong><div className={styles.desc}>{m.description}</div></td>
                  <td><Badge variant={STATUS_VARIANT[m.builtStatus]}>{m.builtStatus}</Badge></td>
                  <td>{m.apiRouteCount}</td>
                  <td>{m.hasAdminUi ? 'Yes' : 'No'}</td>
                  <td className={styles.missing}>{m.missingItems || '—'}</td>
                  <td>{m.driftScore ?? '—'}</td>
                  <td>{m.lastVerifiedAt ? new Date(m.lastVerifiedAt).toLocaleDateString() : 'Never'}</td>
                  <td><Button size="sm" variant="ghost" onClick={() => handleVerify(m.id)} disabled={verifyingId === m.id}>{verifyingId === m.id ? 'Verifying…' : 'Verify'}</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
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
