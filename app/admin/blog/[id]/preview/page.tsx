'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../AdminBlog.module.css';

interface PreviewPost {
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  author: { name: string } | null;
  categories: { name: string }[];
  tags: { name: string }[];
  readingTime: string;
  status: string;
  publishedAt: string | null;
}

export default function PreviewPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<PreviewPost | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/blog/posts/${id}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (d.post) {
          setPost(d.post);
          // Render markdown client-side for preview (basic)
          const content = d.post.content || '';
          const html = content
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
          setHtmlContent(`<p>${html}</p>`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.page}><div className="container section"><div className={styles.empty}>Loading...</div></div></div>;
  if (!post) return <div className={styles.page}><div className="container section"><div className={styles.empty}>Post not found.</div></div></div>;

  return (
    <div className={styles.page}>
      <div className="container section" style={{ maxWidth: 800 }}>
        <Link href={`/admin/blog/${id}`} style={{ display: 'inline-block', marginBottom: 24, color: 'var(--color-heading)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
          &larr; Back to Editor
        </Link>

        <span
          style={{
            display: 'inline-block',
            marginBottom: 16,
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: '0.75rem',
            fontWeight: 600,
            background: post.status === 'published' ? 'rgba(5,150,105,0.1)' : 'rgba(245,158,11,0.1)',
            color: post.status === 'published' ? '#059669' : '#d97706',
          }}
        >
          {post.status.toUpperCase()} PREVIEW
        </span>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: '100%', borderRadius: 16, marginBottom: 24, objectFit: 'cover', maxHeight: 400 }}
          />
        )}

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-heading)', marginBottom: 16 }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          <span>{post.author?.name || 'Talents Hill Team'}</span>
          <span>{post.readingTime}</span>
          {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
        </div>

        {post.categories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {post.categories.map((c) => (
              <span key={c.name} style={{ padding: '4px 12px', borderRadius: 9999, background: 'rgba(30,64,175,0.1)', color: '#1e40af', fontSize: '0.75rem', fontWeight: 600 }}>
                {c.name}
              </span>
            ))}
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--color-text)' }}
        />

        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
            {post.tags.map((t) => (
              <span key={t.name} style={{ padding: '4px 10px', borderRadius: 9999, background: 'var(--color-surface)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                #{t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
