'use client';

import { use } from 'react';
import { SectionHeader } from '@/components/ui';
import BlogPostEditor from '@/features/blog/components/BlogPostEditor';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Admin" title="Edit Blog Post" subtitle="Update post content, metadata, and settings." />
        <BlogPostEditor postId={id} />
      </div>
    </div>
  );
}
