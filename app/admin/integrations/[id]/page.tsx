'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminIntegrationDetail.module.css';

export default function IntegrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [integration, setIntegration] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    fetch(`/api/admin/integrations/${id}`).then(r => r.json()).then(setIntegration);
    fetch(`/api/admin/integrations/${id}/logs`).then(r => r.json()).then(d => setLogs(d.logs || []));
  }, [id]);

  const handleTest = async () => {
    setTesting(true);
    const res = await fetch(`/api/admin/integrations/${id}/test`, { method: 'POST' });
    const data = await res.json();
    setTestResult(data.message || (data.success ? 'Test passed' : 'Test failed'));
    setTesting(false);
  };

  const handleConnect = async () => {
    await fetch(`/api/admin/integrations/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Default' }),
    });
    fetch(`/api/admin/integrations/${id}`).then(r => r.json()).then(setIntegration);
  };

  if (!integration) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{integration.name}</h1>
      <p className={styles.desc}>{integration.description}</p>
      <span className={styles.categoryBadge}>{integration.category}</span>

      <div className={styles.actions}>
        {integration.accounts?.length === 0 ? (
          <button className={styles.btnPrimary} onClick={handleConnect}>Connect</button>
        ) : (
          <span className={styles.connectedBadge}>Connected</span>
        )}
        <button className={styles.btnSecondary} onClick={handleTest} disabled={testing}>
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {testResult && <div className={styles.testResult}>{testResult}</div>}

      <h2 className={styles.sectionTitle}>Activity Logs</h2>
      <table className={styles.table}>
        <thead>
          <tr><th>Action</th><th>Status</th><th>Duration</th><th>Time</th></tr>
        </thead>
        <tbody>
          {logs.map((l: any) => (
            <tr key={l.id}>
              <td>{l.action}</td>
              <td><span className={`${styles.logStatus} ${l.status === 'success' ? styles.logSuccess : styles.logError}`}>{l.status}</span></td>
              <td>{l.durationMs ? `${l.durationMs}ms` : '-'}</td>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={4} className={styles.empty}>No logs yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
