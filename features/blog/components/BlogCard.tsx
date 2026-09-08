import Link from 'next/link';
import type { BlogPostMeta } from '@/types';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import styles from './Blog.module.css';

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardImage}>
        {post.category === 'AI Strategy' ? '🧠' : post.category === 'Generative AI' ? '🤖' : '⚙️'}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span>{formatDate(post.date)}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.cardSummary}>{post.summary}</p>
        <div className={styles.tags}>
          {post.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="accent">{tag}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
