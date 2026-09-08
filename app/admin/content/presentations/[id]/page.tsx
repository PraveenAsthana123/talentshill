'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminPresentationBuilder.module.css';

interface Slide { index: number; title: string; htmlContent: string; layout: string; notes: string; }

const LAYOUTS = ['full', 'two-column', 'title-only', 'blank'];

export default function AdminPresentationBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('draft');
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(`/api/admin/assets/${id}`);
        const data = await res.json();
        if (data.asset) {
          setTitle(data.asset.title || '');
          setSlides(Array.isArray(data.asset.slides) ? data.asset.slides : []);
          setStatus(data.asset.status || 'draft');
        }
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchAsset();
  }, [id]);

  const activeSlide = slides[activeIndex] || null;

  const updateSlide = (field: string, value: string) => {
    setSlides(prev => prev.map((s, i) => i === activeIndex ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    const newSlide: Slide = { index: slides.length + 1, title: `Slide ${slides.length + 1}`, htmlContent: '', layout: 'full', notes: '' };
    setSlides([...slides, newSlide]);
    setActiveIndex(slides.length);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, index: i + 1 }));
    setSlides(updated);
    setActiveIndex(Math.min(activeIndex, updated.length - 1));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-slides', slides }),
      });
      setMessage('Saved');
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/admin/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-status', status: newStatus }),
      });
      setStatus(newStatus);
    } catch { /* empty */ }
  };

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Presentation Builder" subtitle={title} />
      <Link href="/admin/content/presentations" className={styles.backLink}>&larr; Back to Presentations</Link>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.toolbar}>
        <input className={styles.titleInput} value={title} onChange={(e) => setTitle(e.target.value)} />
        <span className={styles.slideIndicator}>Slide {activeIndex + 1} of {slides.length}</span>
        <select className={styles.statusSelect} value={status} onChange={(e) => handleStatusChange(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
        <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Edit' : 'Preview'}</Button>
        <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>

      <div className={styles.slideNav}>
        {slides.map((s, i) => (
          <button key={i} className={`${styles.slideTab} ${i === activeIndex ? styles.slideTabActive : ''}`} onClick={() => setActiveIndex(i)}>
            {s.index}
          </button>
        ))}
        <button className={styles.slideTabAdd} onClick={addSlide}>+</button>
      </div>

      {activeSlide ? (
        showPreview ? (
          <div className={styles.previewCard}>
            <h2 className={styles.previewTitle}>{activeSlide.title}</h2>
            <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: activeSlide.htmlContent }} />
            {activeSlide.notes && <div className={styles.speakerNotes}><strong>Speaker Notes:</strong> {activeSlide.notes}</div>}
          </div>
        ) : (
          <div className={styles.editorCard}>
            <div className={styles.editorGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Slide Title</label>
                <input className={styles.input} value={activeSlide.title} onChange={(e) => updateSlide('title', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Layout</label>
                <select className={styles.select} value={activeSlide.layout} onChange={(e) => updateSlide('layout', e.target.value)}>
                  {LAYOUTS.map(l => <option key={l} value={l}>{l.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Content (HTML)</label>
              <textarea className={styles.editor} value={activeSlide.htmlContent} onChange={(e) => updateSlide('htmlContent', e.target.value)} rows={12} spellCheck={false} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Speaker Notes</label>
              <textarea className={styles.notesArea} value={activeSlide.notes} onChange={(e) => updateSlide('notes', e.target.value)} rows={3} placeholder="Notes for the presenter..." />
            </div>
            <div className={styles.slideFooter}>
              <button className={styles.removeSlideBtn} onClick={() => removeSlide(activeIndex)} disabled={slides.length <= 1}>Remove Slide</button>
            </div>
          </div>
        )
      ) : (
        <div className={styles.empty}>Add a slide to get started.</div>
      )}
    </div>
  );
}
