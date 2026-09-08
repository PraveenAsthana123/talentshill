'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { blogPostSchema, type BlogPostFormValues } from '@/features/blog/types/schemas';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import { slugify } from '@/lib/utils';
import styles from './BlogPostEditor.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogPostEditorProps {
  postId?: string;
}

export default function BlogPostEditor({ postId }: BlogPostEditorProps) {
  const router = useRouter();
  const isEdit = !!postId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(blogPostSchema) as any,
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      summary: '',
      coverImage: '',
      status: 'draft',
      featured: false,
      authorId: '',
      metaTitle: '',
      metaDescription: '',
      categoryIds: [],
      tags: '',
    },
  });

  const content = watch('content');
  const title = watch('title');

  // Load categories
  useEffect(() => {
    fetch('/api/blog/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Load post for editing
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/blog/posts/${postId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.post) {
          const p = d.post;
          reset({
            title: p.title,
            slug: p.slug,
            content: p.content,
            summary: p.summary,
            coverImage: p.coverImage || '',
            status: p.status,
            featured: p.featured || false,
            authorId: p.authorId || '',
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            categoryIds: p.categories?.map((c: Category) => c.id) || [],
            tags: p.tags?.map((t: { name: string }) => t.name).join(', ') || '',
          });
        }
      })
      .catch(() => {});
  }, [postId, reset]);

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title));
    }
  }, [title, isEdit, setValue]);

  // Preview content
  useEffect(() => {
    if (!content) {
      setPreviewHtml('');
      return;
    }
    // Simple markdown preview using the API would be heavy;
    // do a basic client-side conversion for preview
    const html = content
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    setPreviewHtml(`<p>${html}</p>`);
  }, [content]);

  const onSubmit = async (data: BlogPostFormValues) => {
    setSaving(true);
    setSavedMsg('');

    const body = {
      ...data,
      tags: data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      const url = isEdit ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setSavedMsg(`Error: ${err.error || 'Failed to save'}`);
        setSaving(false);
        return;
      }

      const result = await res.json();
      setSavedMsg(isEdit ? 'Saved!' : 'Created!');

      if (!isEdit && result.post?.id) {
        router.push(`/admin/blog/${result.post.id}`);
      }
    } catch {
      setSavedMsg('Error saving post');
    }
    setSaving(false);
  };

  const selectedCategoryIds = watch('categoryIds') || [];

  const handleCategoryToggle = (catId: string) => {
    const current = selectedCategoryIds;
    const next = current.includes(catId)
      ? current.filter((id) => id !== catId)
      : [...current, catId];
    setValue('categoryIds', next);
  };

  return (
    <div className={styles.editor}>
      <Link href="/admin/blog" className={styles.backLink}>
        &larr; Back to Dashboard
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Title */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Title</label>
          <input className={styles.input} placeholder="Post title..." {...register('title')} />
          {errors.title && <span className={styles.error}>{errors.title.message}</span>}
        </div>

        {/* Slug */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Slug</label>
            <input className={styles.input} placeholder="post-url-slug" {...register('slug')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Cover Image URL</label>
            <input className={styles.input} placeholder="https://..." {...register('coverImage')} />
          </div>
        </div>

        {/* Summary */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Summary</label>
          <textarea
            className={styles.textarea}
            style={{ minHeight: 80 }}
            placeholder="Brief summary for cards and SEO..."
            {...register('summary')}
          />
          {errors.summary && <span className={styles.error}>{errors.summary.message}</span>}
        </div>

        {/* Content with preview */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Content (Markdown)</label>
          <Tabs
            tabs={[
              {
                id: 'write',
                label: 'Write',
                content: (
                  <textarea
                    className={styles.textarea}
                    placeholder="Write your post in Markdown..."
                    {...register('content')}
                  />
                ),
              },
              {
                id: 'preview',
                label: 'Preview',
                content: (
                  <div
                    className={styles.previewPane}
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color: var(--color-text-muted)">Nothing to preview yet.</p>' }}
                  />
                ),
              },
            ]}
          />
          {errors.content && <span className={styles.error}>{errors.content.message}</span>}
        </div>

        {/* Categories */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Categories</label>
          <div className={styles.checkboxGrid}>
            {categories.map((cat) => (
              <label key={cat.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Tags (comma-separated)</label>
          <input className={styles.input} placeholder="AI, Machine Learning, Strategy" {...register('tags')} />
        </div>

        {/* Status & Featured */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Status</label>
            <select className={styles.select} {...register('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.checkboxLabel} style={{ marginTop: 28 }}>
              <input type="checkbox" {...register('featured')} />
              Featured Post
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className={styles.seoSection}>
          <div className={styles.seoTitle}>SEO Settings</div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Meta Title</label>
              <input className={styles.input} placeholder="Custom title for search engines..." {...register('metaTitle')} />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Meta Description</label>
              <input className={styles.input} placeholder="Custom description for search engines..." {...register('metaDescription')} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>
            Cancel
          </Button>
          {savedMsg && <span className={styles.savedMsg}>{savedMsg}</span>}
        </div>
      </form>
    </div>
  );
}
