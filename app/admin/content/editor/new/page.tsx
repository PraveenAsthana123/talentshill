'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from '../[id]/AdminContentEditor.module.css';

const CONTENT_TYPES = [
  { value: 'article', label: 'Article' },
  { value: 'brochure_text', label: 'Brochure Text' },
  { value: 'ppt_text', label: 'Presentation Text' },
  { value: 'email_copy', label: 'Email Copy' },
  { value: 'social_post', label: 'Social Post' },
  { value: 'landing_page', label: 'Landing Page' },
];

export default function NewContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('article');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, contentType }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/content/editor/${data.id}`);
      }
    } catch { /* empty */ }
    setCreating(false);
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="New Content" subtitle="Select a content type and title to get started." />

      <div className={styles.createCard}>
        <div className={styles.field}>
          <label className={styles.label}>Content Type</label>
          <select className={styles.select} value={contentType} onChange={(e) => setContentType(e.target.value)}>
            {CONTENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Title</label>
          <input className={styles.input} type="text" placeholder="Enter content title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <Button variant="primary" onClick={handleCreate} disabled={creating || !title.trim()}>
          {creating ? 'Creating...' : 'Create & Edit'}
        </Button>
      </div>
    </div>
  );
}
