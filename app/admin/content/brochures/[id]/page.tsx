'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminBrochureBuilder.module.css';

interface Slide { index: number; title: string; htmlContent: string; layout: string; notes: string; }

const LAYOUTS = ['full', 'two-column', 'image-left', 'image-right'];

export default function AdminBrochureBuilderPage({ params }: { params: Promise<{ id: string }> }) {
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

  const moveSlide = (idx: number, dir: number) => {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const updated = [...slides];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setSlides(updated.map((s, i) => ({ ...s, index: i + 1 })));
    setActiveIndex(target);
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

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading builder...</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Brochure Builder" subtitle={title} />
      <Link href="/admin/content/brochures" className={styles.backLink}>&larr; Back to Brochures</Link>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.toolbar}>
        <input className={styles.titleInput} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brochure title..." />
        <select className={styles.statusSelect} value={status} onChange={(e) => handleStatusChange(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
        </select>
        <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Edit' : 'Preview'}</Button>
        <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>

      <div className={styles.builder}>
        <div className={styles.slidePanel}>
          <div className={styles.slidePanelHeader}>
            <span className={styles.slideCount}>{slides.length} slides</span>
            <button className={styles.addBtn} onClick={addSlide}>+ Add</button>
          </div>
          <div className={styles.slideList}>
            {slides.map((s, i) => (
              <div key={i} className={`${styles.slideThumb} ${i === activeIndex ? styles.slideThumbActive : ''}`} onClick={() => setActiveIndex(i)}>
                <span className={styles.slideNum}>{s.index}</span>
                <span className={styles.slideTitle}>{s.title}</span>
                <div className={styles.slideActions}>
                  <button className={styles.moveBtn} onClick={(e) => { e.stopPropagation(); moveSlide(i, -1); }} disabled={i === 0}>&uarr;</button>
                  <button className={styles.moveBtn} onClick={(e) => { e.stopPropagation(); moveSlide(i, 1); }} disabled={i === slides.length - 1}>&darr;</button>
                  <button className={styles.removeBtn} onClick={(e) => { e.stopPropagation(); removeSlide(i); }} disabled={slides.length <= 1}>&times;</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.editorArea}>
          {activeSlide ? (
            showPreview ? (
              <div className={styles.previewArea}>
                <h2 className={styles.previewTitle}>{activeSlide.title}</h2>
                <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: activeSlide.htmlContent }} />
              </div>
            ) : (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Slide Title</label>
                  <input className={styles.input} value={activeSlide.title} onChange={(e) => updateSlide('title', e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Layout</label>
                  <div className={styles.layoutOptions}>
                    {LAYOUTS.map(l => (
                      <button key={l} className={`${styles.layoutBtn} ${activeSlide.layout === l ? styles.layoutBtnActive : ''}`} onClick={() => updateSlide('layout', l)}>
                        {l.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>HTML Content</label>
                  <textarea className={styles.editor} value={activeSlide.htmlContent} onChange={(e) => updateSlide('htmlContent', e.target.value)} rows={14} spellCheck={false} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Notes</label>
                  <textarea className={styles.notesArea} value={activeSlide.notes} onChange={(e) => updateSlide('notes', e.target.value)} rows={3} placeholder="Internal notes..." />
                </div>
              </>
            )
          ) : (
            <div className={styles.empty}>Add a slide to get started.</div>
          )}
        </div>
      </div>
    </div>
  );
}
