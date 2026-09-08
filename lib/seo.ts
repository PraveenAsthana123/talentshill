import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://talentshill.com';
const SITE_NAME = 'Talents Hill Inc';

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function generateBlogPostMetadata(post: {
  title: string;
  slug: string;
  summary: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  coverImage?: string | null;
  author?: { name: string } | null;
  publishedAt?: Date | null;
  updatedAt?: Date;
  tags?: { name: string }[];
}): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.summary;
  const canonical = getCanonicalUrl(`/blog/${post.slug}`);
  const ogImage = post.coverImage || `${SITE_URL}/images/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: post.author ? [post.author.name] : [SITE_NAME],
      tags: post.tags?.map((t) => t.name),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export function generateBlogListMetadata(category?: string): Metadata {
  const title = category ? `${category} Articles — ${SITE_NAME} Blog` : `Blog — ${SITE_NAME}`;
  const description = category
    ? `Expert insights on ${category} from the ${SITE_NAME} consulting team.`
    : 'Insights on AI, GenAI, Robotics, IoT, and enterprise analytics from Talents Hill.';

  return {
    title,
    description,
    alternates: { canonical: getCanonicalUrl('/blog') },
    openGraph: { title, description, url: getCanonicalUrl('/blog'), siteName: SITE_NAME },
  };
}

export function generateJsonLd(post: {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  author?: { name: string } | null;
  publishedAt?: Date | null;
  updatedAt?: Date;
  readingTime: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    image: post.coverImage || `${SITE_URL}/images/og-default.png`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getCanonicalUrl(`/blog/${post.slug}`),
    },
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${parseInt(post.readingTime) || 5}M`,
  };
}
