'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminContacts.module.css';
import sharedStyles from './ContactsShared.module.css';

interface Contact {
  id: string; email: string; firstName: string | null; lastName: string | null; company: string | null;
  phone: string | null; source: string; tags: string | null; leadScore: number; status: string; createdAt: string;
}
interface ImportResult { total: number; imported: number; duplicates: number; errors: number; errorMessages: string[] }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', company: '', phone: '' });
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const csvRef = useRef<HTMLInputElement>(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      params.set('limit', '50'); params.set('offset', String(offset));
      const [res, rRes] = await Promise.all([
        fetch(`/api/admin/contacts/?${params}`),
        fetch('/api/admin/operation-runs/?moduleKey=contacts&executionMode=manual&limit=20'),
      ]);
      const data = await res.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
      setRuns(rData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, [search, statusFilter, sourceFilter, offset]);

  const handleCreate = async () => {
    if (!form.email) return;
    await fetch('/api/admin/contacts/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ email: '', firstName: '', lastName: '', company: '', phone: '' });
    setShowCreate(false);
    fetchContacts();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/admin/contacts/${id}/`, { method: 'DELETE' });
    fetchContacts();
  };
  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/contacts/import/', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.result) { setImportResult(data.result); fetchContacts(); }
  };
  const handleExport = () => { window.location.href = '/api/admin/contacts/export/'; };
  const parseTags = (tagsStr: string | null): string[] => {
    if (!tagsStr) return [];
    try {
      const parsed = JSON.parse(tagsStr);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') return parsed.split(',').map((t) => t.trim()).filter(Boolean);
      return [];
    } catch { return []; }
  };
  const statusClass = (s: string) => {
    const map: Record<string, string> = { active: styles.statusActive, unsubscribed: styles.statusUnsubscribed, bounced: styles.statusBounced, inactive: styles.statusInactive };
    return map[s] || styles.statusInactive;
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Maintain a real, usable CRM contact database with import/export, and a real engagement score (leadScore) for every contact rather than a stale default 0.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Import contacts via CSV or add manually</li><li>Run Pipeline or Agentic scoring to populate real leadScore</li><li>Tag and segment for campaign targeting</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.statsRow}><div className={styles.statBadge}><span className={styles.statValue}>{total}</span><span className={styles.statLabel}>Total</span></div></div>
        <div className={styles.toolbar}>
          <input className={styles.searchInput} placeholder="Search contacts..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} />
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}>
            <option value="">All statuses</option><option value="active">Active</option><option value="unsubscribed">Unsubscribed</option><option value="bounced">Bounced</option><option value="inactive">Inactive</option>
          </select>
          <select className={styles.filterSelect} value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setOffset(0); }}>
            <option value="">All sources</option><option value="manual">Manual</option><option value="import">Import</option><option value="contact_form">Contact Form</option><option value="survey">Survey</option><option value="booking">Booking</option><option value="newsletter">Newsletter</option>
          </select>
          {!showCreate && <Button size="sm" onClick={() => setShowCreate(true)}>Add Contact</Button>}
          <Button variant="ghost" size="sm" onClick={() => csvRef.current?.click()}>Import CSV</Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>Export</Button>
          <input ref={csvRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
        </div>

        {importResult && <div className={styles.importResult}>Import complete: {importResult.imported} imported, {importResult.duplicates} duplicates, {importResult.errors} errors <button style={{ marginLeft: 'var(--space-3)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }} onClick={() => setImportResult(null)}>dismiss</button></div>}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Add Contact</div>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Email *</label><input className={styles.formInput} type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>First Name</label><input className={styles.formInput} value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Last Name</label><input className={styles.formInput} value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Company</label><input className={styles.formInput} value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Phone</label><input className={styles.formInput} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button><Button size="sm" onClick={handleCreate}>Add</Button></div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : contacts.length === 0 ? <div className={styles.empty}>No contacts found.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Source</th><th>Tags</th><th>Score</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td className={styles.nameCell}>{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{c.email}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{c.company || '—'}</td>
                    <td><span className={styles.sourceBadge}>{c.source}</span></td>
                    <td>{parseTags(c.tags).map((t) => <span key={t} className={styles.tagBadge}>{t}</span>)}</td>
                    <td>{c.leadScore || 0}</td>
                    <td><span className={cn(styles.statusBadge, statusClass(c.status))}>{c.status}</span></td>
                    <td><div className={styles.actions}><button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button></div></td>
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
