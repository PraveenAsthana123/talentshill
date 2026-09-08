import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  coverImage: z.string().optional().default(''),
  status: z.string().optional().default('draft'),
  featured: z.boolean().optional().default(false),
  authorId: z.string().optional().default(''),
  metaTitle: z.string().optional().default(''),
  metaDescription: z.string().optional().default(''),
  categoryIds: z.array(z.string()).optional().default([]),
  tags: z.string().optional().default(''), // comma-separated, parsed to array
});

export interface BlogPostFormValues {
  title: string;
  slug?: string;
  content: string;
  summary: string;
  coverImage: string;
  status: string;
  featured: boolean;
  authorId: string;
  metaTitle: string;
  metaDescription: string;
  categoryIds: string[];
  tags: string;
}

export const blogCategorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional().default(''),
  color: z.string().optional().default('#1e40af'),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategorySchema>;

export const blogSubscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type BlogSubscriberFormValues = z.infer<typeof blogSubscriberSchema>;
