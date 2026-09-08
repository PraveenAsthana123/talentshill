import { Feed } from 'feed';
import { getAllPosts } from '@/lib/blog';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://talentshill.com';

  const feed = new Feed({
    title: 'Talents Hill Inc — Blog',
    description: 'Insights on AI, GenAI, Robotics, IoT, and enterprise analytics.',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    copyright: `© ${new Date().getFullYear()} Talents Hill Inc`,
    author: { name: 'Talents Hill Team', link: baseUrl },
  });

  try {
    const posts = getAllPosts();
    for (const post of posts) {
      feed.addItem({
        title: post.title,
        id: `${baseUrl}/blog/${post.slug}`,
        link: `${baseUrl}/blog/${post.slug}`,
        description: post.summary,
        date: new Date(post.date),
        author: [{ name: post.author }],
      });
    }
  } catch {
    // Blog posts may not be available
  }

  return new Response(feed.rss2(), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
