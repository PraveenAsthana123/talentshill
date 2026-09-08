import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostWithMeta, getRelatedPosts } from '@/lib/blog';
import { generateBlogPostMetadata, generateJsonLd, getCanonicalUrl } from '@/lib/seo';
import { BlogCard, TableOfContents, ShareButtons, NewsletterCTA, ViewTracker } from '@/features/blog';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { SectionHeader } from '@/components/ui';
import blogStyles from '@/features/blog/components/Blog.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostWithMeta(slug);
  if (!post) return {};
  return generateBlogPostMetadata({
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    coverImage: post.coverImage,
    author: post.author,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    tags: post.tags,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, postMeta] = await Promise.all([
    getPostBySlug(slug),
    getPostWithMeta(slug),
  ]);

  if (!post || !postMeta) notFound();

  const related = getRelatedPosts(slug, post.tags);
  const articleUrl = getCanonicalUrl(`/blog/${slug}`);

  const jsonLd = generateJsonLd({
    title: postMeta.title,
    slug: postMeta.slug,
    summary: postMeta.summary,
    content: postMeta.content,
    coverImage: postMeta.coverImage,
    author: postMeta.author,
    publishedAt: postMeta.publishedAt,
    updatedAt: postMeta.updatedAt,
    readingTime: postMeta.readingTime,
  });

  return (
    <div className={blogStyles.article}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewTracker postId={postMeta.id} />

      <div className="container section">
        <Link href="/blog" className={blogStyles.backLink}>
          &larr; Back to Blog
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 'var(--space-8)', maxWidth: 1080, margin: '0 auto' }}>
          {/* Main content */}
          <div>
            <div className={blogStyles.articleHeader}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {post.tags.map((tag) => <Badge key={tag} variant="accent">{tag}</Badge>)}
              </div>

              <h1 className={blogStyles.articleTitle}>{post.title}</h1>

              <div className={blogStyles.articleMeta}>
                <span>{post.author}</span>
                <span>·</span>
                <span>{formatDate(post.date)}</span>
                <span>·</span>
                <span>{post.readingTime}</span>
              </div>

              <ShareButtons url={articleUrl} title={post.title} />
            </div>

            {post.coverImage && (
              <img
                src={post.coverImage}
                alt={post.title}
                style={{ width: '100%', borderRadius: 16, marginBottom: 'var(--space-8)', objectFit: 'cover', maxHeight: 420 }}
              />
            )}

            <div
              className={blogStyles.articleContent}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div style={{ marginTop: 'var(--space-8)' }}>
              <ShareButtons url={articleUrl} title={post.title} />
            </div>

            <NewsletterCTA />
          </div>

          {/* Sidebar — TOC */}
          <aside>
            <TableOfContents htmlContent={post.content} />
          </aside>
        </div>

        {related.length > 0 && (
          <div className={blogStyles.related}>
            <SectionHeader label="Related" title="Related Articles" />
            <div className={blogStyles.grid}>
              {related.map((p) => <BlogCard key={p.slug} post={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
