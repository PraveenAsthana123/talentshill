import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talentshill.com';

  const staticPages = [
    '', '/services', '/industries', '/solutions/robotics-ai', '/solutions/genai',
    '/solutions/quantum-ai', '/blog', '/careers', '/contact', '/demo', '/book', '/survey', '/videos',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllPosts();
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // Blog posts may not be available during build
  }

  return [...staticPages, ...blogPages];
}
