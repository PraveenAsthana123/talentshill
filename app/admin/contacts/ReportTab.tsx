'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './ContactsShared.module.css';

interface ContactRow { name: string; email: string; company: string | null; source: string; status: string; leadScore: number; lifecycleStage: string | null; activationScore: number | null }
interface ReportData { generatedAt: string; totalContacts: number; contacts: ContactRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/contacts/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/contacts/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Contacts Report (by score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalContacts} total contacts.</p>
      {data.contacts.length === 0 && <p className={styles.empty}>No contacts yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Source</th><th>Score</th><th>Status</th><th>Lifecycle</th><th>Activation</th></tr></thead>
        <tbody>
          {data.contacts.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td><td>{c.email}</td><td>{c.company || '—'}</td><td>{c.source}</td>
              <td>{c.leadScore}</td>
              <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
              <td>{c.lifecycleStage ?? 'new'}</td>
              <td>{c.activationScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
