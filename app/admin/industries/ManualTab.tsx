'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui';
import { useUIStore } from '@/store/ui-store';
import styles from './AdminIndustries.module.css';
import sharedStyles from './IndustriesShared.module.css';

interface Industry { id: string; name: string; slug: string; icon: string | null; description: string | null; sortOrder: number | null; isActive: boolean }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const emptyForm = { name: '', icon: '', description: '' };

export default function ManualTab() {
  const addToast = useUIStore((s) => s.addToast);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchIndustries = async () => {
    setLoading(true);
    try {
      const [res, rRes] = await Promise.all([
        fetch('/api/admin/industries'),
        fetch('/api/admin/operation-runs/?moduleKey=industries&executionMode=manual&limit=20'),
      ]);
      const data = await res.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setIndustries(data.industries || []);
      setRuns(rData.runs || []);
    } catch { setIndustries([]); }
    setLoading(false);
  };

  useEffect(() => { fetchIndustries(); }, []);

  const handleSave = async () => {
    if (!form.name) { addToast({ type: 'error', message: 'Name is required.' }); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/industries/${editId}` : '/api/admin/industries';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', message: editId ? 'Industry updated.' : 'Industry created.' });
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchIndustries();
    } catch {
      addToast({ type: 'error', message: 'Failed to save industry.' });
    }
    setSaving(false);
  };

  const handleEdit = (industry: Industry) => {
    setEditId(industry.id);
    setForm({ name: industry.name, icon: industry.icon || '', description: industry.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this industry?')) return;
    try {
      await fetch(`/api/admin/industries/${id}`, { method: 'DELETE' });
      addToast({ type: 'success', message: 'Industry deleted.' });
      fetchIndustries();
    } catch {
      addToast({ type: 'error', message: 'Failed to delete.' });
    }
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage the industries shown on the real public /industries page — real create/edit/delete control over public-facing content.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Give every industry an icon and a substantial description</li><li>Run Pipeline or Agentic content-readiness scoring before relying on a record being public-ready</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.header}>
          <div />
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>{showForm ? 'Cancel' : 'Add Industry'}</Button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editId ? 'Edit Industry' : 'New Industry'}</h2>
            <div className={styles.formGrid}>
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Icon" placeholder="e.g. factory, heart-pulse" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <div style={{ gridColumn: '1 / -1' }}><Textarea label="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
              <Button loading={saving} onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : industries.length === 0 ? <div className={styles.empty}>No industries yet.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {industries.map((ind) => (
                  <tr key={ind.id}>
                    <td>{ind.icon || '-'}</td>
                    <td className={styles.nameCell}>{ind.name}</td>
                    <td className={styles.descCell}>{ind.description || '-'}</td>
                    <td>{ind.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(ind)}>Edit</button>
                        <button className={styles.actionBtnDanger} onClick={() => handleDelete(ind.id)}>Delete</button>
                      </div>
                    </td>
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
