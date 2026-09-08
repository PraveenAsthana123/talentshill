import type { Metadata } from 'next';
import { getPublishedPosts, getFeaturedPost, getCategories } from '@/lib/blog';
import { generateBlogListMetadata } from '@/lib/seo';
import BlogListClient from './BlogListClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateBlogListMetadata();
}

export default async function BlogPage() {
  const [{ posts, total }, featured, categories] = await Promise.all([
    getPublishedPosts(),
    getFeaturedPost(),
    getCategories(),
  ]);

  return (
    <BlogListClient
      initialPosts={posts}
      initialTotal={total}
      featuredPost={featured}
      categories={categories}
    />
  );
}
