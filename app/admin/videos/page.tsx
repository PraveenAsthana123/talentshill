'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useUIStore } from '@/store/ui-store';
import styles from './AdminVideos.module.css';

interface Video {
  id: string;
  title: string;
  summary: string | null;
  videoUrl: string;
  provider: string | null;
  tags: string[];
  category: string | null;
  duration: string | null;
  sortOrder: number | null;
  isActive: boolean;
}

const emptyForm = { title: '', summary: '', videoUrl: '', tags: '', category: '', duration: '' };

export default function AdminVideosPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {
      setVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.videoUrl) {
      addToast({ type: 'error', message: 'Title and Video URL are required.' });
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      const url = editId ? `/api/admin/videos/${editId}` : '/api/admin/videos';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', message: editId ? 'Video updated.' : 'Video created.' });
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchVideos();
    } catch {
      addToast({ type: 'error', message: 'Failed to save video.' });
    }
    setSaving(false);
  };

  const handleEdit = (video: Video) => {
    setEditId(video.id);
    setForm({
      title: video.title,
      summary: video.summary || '',
      videoUrl: video.videoUrl,
      tags: (video.tags || []).join(', '),
      category: video.category || '',
      duration: video.duration || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' });
      addToast({ type: 'success', message: 'Video deleted.' });
      fetchVideos();
    } catch {
      addToast({ type: 'error', message: 'Failed to delete.' });
    }
  };

  return (
    <div className={styles.page}>
      <div className="container section">
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Videos</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}>
            {showForm ? 'Cancel' : 'Add Video'}
          </Button>
        </div>

        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editId ? 'Edit Video' : 'New Video'}</h2>
            <div className={styles.formGrid}>
              <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Video URL *" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
              <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input label="Duration" placeholder="12:30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
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
          ) : videos.length === 0 ? (
            <div className={styles.empty}>No videos yet.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Tags</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v.id}>
                    <td className={styles.nameCell}>{v.title}</td>
                    <td>{v.category || '-'}</td>
                    <td>{v.duration || '-'}</td>
                    <td>{(v.tags || []).join(', ') || '-'}</td>
                    <td>{v.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleEdit(v)}>Edit</button>
                        <button className={styles.actionBtnDanger} onClick={() => handleDelete(v.id)}>Delete</button>
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
