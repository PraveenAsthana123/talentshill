'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import styles from './AdminServices.module.css';

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDesc: string | null;
  longDesc: string | null;
  icon: string | null;
  tags: string[];
  useCases: string[];
  sortOrder: number | null;
  isActive: boolean;
}

const emptyForm = { name: '', category: '', shortDesc: '', longDesc: '', icon: '', tags: '', useCases: '' };

export default function AdminServicesPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setServices(data.services || []);
    } catch {
      setServices([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.category) {
      addToast({ type: 'error', message: 'Name and Category are required.' });
      return;
    }
    setSaving(true);
    try {
      const body = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        useCases: form.useCases ? form.useCases.split(',').map(u => u.trim()) : [],
      };
      const url = editId ? `/api/admin/services/${editId}` : '/api/admin/services';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', message: editId ? 'Service updated.' : 'Service created.' });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchServices();
    } catch {
      addToast({ type: 'error', message: 'Failed to save service.' });
    }
    setSaving(false);
  };

  const handleEdit = (service: Service) => {
    setEditId(service.id);
    setForm({
      name: service.name,
      category: service.category,
      shortDesc: service.shortDesc || '',
      longDesc: service.longDesc || '',
      icon: service.icon || '',
      tags: (service.tags || []).join(', '),
      useCases: (service.useCases || []).join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await fetch(`/api/admin/services/${id}`, { method: 'DELETE' });
      addToast({ type: 'success', message: 'Service deleted.' });
      fetchServices();
    } catch {
      addToast({ type: 'error', message: 'Failed to delete.' });
    }
  };

  return (
    <div className={styles.page}>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Services</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
            {showForm ? 'Cancel' : 'Add Service'}
          </Button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editId ? 'Edit Service' : 'New Service'}</h2>
            <div className={styles.formGrid}>
              <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input label="Icon" placeholder="e.g. brain, chart-bar" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              <div />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Short Description" value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Use Cases (comma-separated)" value={form.useCases} onChange={(e) => setForm({ ...form, useCases: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea label="Long Description" rows={4} value={form.longDesc} onChange={(e) => setForm({ ...form, longDesc: e.target.value })} />
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
          ) : services.length === 0 ? (
            <div className={styles.empty}>No services yet.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th>Use Cases</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className={styles.nameCell}>{s.name}</td>
                    <td>{s.category}</td>
                    <td>{(s.tags || []).join(', ') || '-'}</td>
                    <td>{(s.useCases || []).length} items</td>
                    <td>{s.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(s)}>Edit</button>
                        <button className={styles.actionBtnDanger} onClick={() => handleDelete(s.id)}>Delete</button>
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
