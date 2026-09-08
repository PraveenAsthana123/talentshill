import Link from 'next/link';
import type { BlogPostMeta } from '@/types';
import { formatDate } from '@/lib/utils';
import styles from './FeaturedPost.module.css';

interface FeaturedPostProps {
  post: BlogPostMeta;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article className={styles.featured}>
        <div className={styles.imageWrap}>
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className={styles.image} />
          ) : (
            '📝'
          )}
        </div>
        <div className={styles.body}>
          <span className={styles.label}>Featured</span>
          <h2 className={styles.title}>{post.title}</h2>
          <p className={styles.summary}>{post.summary}</p>
          <div className={styles.meta}>
            <span>{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <span className={styles.readLink}>Read Article →</span>
        </div>
      </article>
    </Link>
  );
}
