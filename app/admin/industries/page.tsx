'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import styles from './AdminIndustries.module.css';

interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

const emptyForm = { name: '', icon: '', description: '' };

export default function AdminIndustriesPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchIndustries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/industries');
      const data = await res.json();
      setIndustries(data.industries || []);
    } catch {
      setIndustries([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchIndustries(); }, []);

  const handleSave = async () => {
    if (!form.name) {
      addToast({ type: 'error', message: 'Name is required.' });
      return;
    }
    setSaving(true);
    try {
      const url = editId ? `/api/admin/industries/${editId}` : '/api/admin/industries';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', message: editId ? 'Industry updated.' : 'Industry created.' });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchIndustries();
    } catch {
      addToast({ type: 'error', message: 'Failed to save industry.' });
    }
    setSaving(false);
  };

  const handleEdit = (industry: Industry) => {
    setEditId(industry.id);
    setForm({
      name: industry.name,
      icon: industry.icon || '',
      description: industry.description || '',
    });
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
    <div className={styles.page}>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Industries</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
            {showForm ? 'Cancel' : 'Add Industry'}
          </Button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editId ? 'Edit Industry' : 'New Industry'}</h2>
            <div className={styles.formGrid}>
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Icon" placeholder="e.g. factory, heart-pulse" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea label="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
              <Button loading={saving} onClick={handleSave}>{editId ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : industries.length === 0 ? (
            <div className={styles.empty}>No industries yet.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
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
    </div>
  );
}
