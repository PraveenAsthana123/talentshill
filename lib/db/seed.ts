import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const DB_PATH = path.join(process.cwd(), 'data', 'talentshill.db');
const BLOG_DIR = path.join(process.cwd(), 'data', 'blog');

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function seed() {
  console.log('Seeding database...');

  // Create default author
  let author = db.select().from(schema.blogAuthors).where(eq(schema.blogAuthors.name, 'Talents Hill Team')).get();
  if (!author) {
    author = db.insert(schema.blogAuthors).values({
      id: randomUUID(),
      name: 'Talents Hill Team',
      bio: 'Expert perspectives on AI, robotics, and enterprise technology from the Talents Hill consulting team.',
      avatarUrl: null,
      socialLinks: JSON.stringify({ linkedin: 'https://linkedin.com/company/talentshill' }),
      createdAt: new Date(),
    }).returning().get();
    console.log('  Created author:', author.name);
  }

  // Create categories
  const categoryDefs = [
    { name: 'AI Strategy', color: '#1e40af', sortOrder: 1 },
    { name: 'Generative AI', color: '#7c3aed', sortOrder: 2 },
    { name: 'Robotics', color: '#059669', sortOrder: 3 },
    { name: 'Quantum Computing', color: '#0891b2', sortOrder: 4 },
    { name: 'Enterprise AI', color: '#dc2626', sortOrder: 5 },
    { name: 'Data Engineering', color: '#d97706', sortOrder: 6 },
  ];

  const categories: Record<string, typeof schema.blogCategories.$inferSelect> = {};
  for (const def of categoryDefs) {
    const slug = slugify(def.name);
    let cat = db.select().from(schema.blogCategories).where(eq(schema.blogCategories.slug, slug)).get();
    if (!cat) {
      cat = db.insert(schema.blogCategories).values({
        id: randomUUID(),
        name: def.name,
        slug,
        description: `Articles about ${def.name.toLowerCase()}`,
        color: def.color,
        sortOrder: def.sortOrder,
      }).returning().get();
      console.log('  Created category:', cat.name);
    }
    categories[def.name] = cat;
  }

  // Import markdown files
  if (!fs.existsSync(BLOG_DIR)) {
    console.log('  No blog directory found, skipping post import.');
    return;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  for (const filename of files) {
    const slug = filename.replace('.md', '');

    // Check if already imported
    const existing = db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug)).get();
    if (existing) {
      console.log(`  Skipping (exists): ${slug}`);
      continue;
    }

    const filePath = path.join(BLOG_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    const postId = randomUUID();
    const publishedAt = data.date ? new Date(data.date) : new Date();

    db.insert(schema.blogPosts).values({
      id: postId,
      title: data.title || slug,
      slug,
      summary: data.summary || '',
      content, // raw markdown
      coverImage: data.coverImage || null,
      status: 'published',
      featured: false,
      authorId: author.id,
      metaTitle: null,
      metaDescription: data.summary || null,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
    }).run();

    // Link category
    const catName = data.category || '';
    const cat = categories[catName];
    if (cat) {
      db.insert(schema.blogPostCategories).values({ postId, categoryId: cat.id }).run();
    }

    // Link tags
    const tags: string[] = data.tags || [];
    for (const tagName of tags) {
      const tagSlug = slugify(tagName);
      let tag = db.select().from(schema.blogTags).where(eq(schema.blogTags.slug, tagSlug)).get();
      if (!tag) {
        tag = db.insert(schema.blogTags).values({
          id: randomUUID(),
          name: tagName,
          slug: tagSlug,
        }).returning().get();
      }
      db.insert(schema.blogPostTags).values({ postId, tagId: tag.id }).run();
    }

    console.log(`  Imported: ${data.title}`);
  }

  // Mark the first post as featured
  const firstPublished = db.select().from(schema.blogPosts)
    .where(eq(schema.blogPosts.status, 'published'))
    .orderBy(schema.blogPosts.publishedAt)
    .limit(1)
    .get();
  if (firstPublished) {
    db.update(schema.blogPosts).set({ featured: true }).where(eq(schema.blogPosts.id, firstPublished.id)).run();
  }

  console.log('Seed complete!');
}

seed();
sqlite.close();
