'use client';

import { SectionHeader } from '@/components/ui';
import BlogPostEditor from '@/features/blog/components/BlogPostEditor';

export default function NewPostPage() {
  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Admin" title="New Blog Post" subtitle="Create a new article for the blog." />
        <BlogPostEditor />
      </div>
    </div>
  );
}
