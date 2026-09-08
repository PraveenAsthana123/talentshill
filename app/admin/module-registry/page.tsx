'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Badge } from '@/components/ui';
import styles from './AdminModuleRegistry.module.css';

interface ModuleRow {
  id: string;
  moduleKey: string;
  name: string;
  description: string;
  builtStatus: 'real' | 'partial' | 'not_built' | 'not_yet_cataloged';
  apiRouteCount: number;
  hasAdminUi: boolean;
  missingItems: string | null;
  lastVerifiedAt: string | null;
}

const STATUS_VARIANT: Record<ModuleRow['builtStatus'], 'success' | 'warning' | 'error' | 'default'> = {
  real: 'success',
  partial: 'warning',
  not_built: 'error',
  not_yet_cataloged: 'default',
};

export default function ModuleRegistryPage() {
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/module-registry')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setModules(d.modules);
        setTally(d.tally);
        setNote(d.note);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <SectionHeader
        title="Module Registry"
        subtitle="Real, verified built-vs-partial status per admin module -- not a claim, a catalog checked against the actual code this session."
      />

      {loading && <p>Loading…</p>}
      {error && <p className={styles.error}>Failed to load: {error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.cardsGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Real</div>
              <div className={styles.cardValue}>{tally.real ?? 0}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Partial</div>
              <div className={styles.cardValue}>{tally.partial ?? 0}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Not built</div>
              <div className={styles.cardValue}>{tally.not_built ?? 0}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Not yet cataloged</div>
              <div className={styles.cardValue}>{tally.not_yet_cataloged ?? 0}</div>
            </div>
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
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.name}</strong>
                    <div className={styles.desc}>{m.description}</div>
                  </td>
                  <td><Badge variant={STATUS_VARIANT[m.builtStatus]}>{m.builtStatus}</Badge></td>
                  <td>{m.apiRouteCount}</td>
                  <td>{m.hasAdminUi ? 'Yes' : 'No'}</td>
                  <td className={styles.missing}>{m.missingItems || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
