'use client';

import { useState, useCallback } from 'react';
import { SectionHeader } from '@/components/ui';
import { BlogCard, FeaturedPost, BlogFilters, Pagination } from '@/features/blog';
import type { BlogPostMeta, BlogCategory } from '@/types';

const POSTS_PER_PAGE = 12;

interface BlogListClientProps {
  initialPosts: BlogPostMeta[];
  initialTotal: number;
  featuredPost: BlogPostMeta | null;
  categories: BlogCategory[];
}

export default function BlogListClient({
  initialPosts,
  initialTotal,
  featuredPost,
  categories,
}: BlogListClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (page: number, category: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String((page - 1) * POSTS_PER_PAGE),
        limit: String(POSTS_PER_PAGE),
      });
      if (category) params.set('category', category);
      if (q) params.set('search', q);

      const res = await fetch(`/api/blog/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch {
      setPosts([]);
    }
    setLoading(false);
  }, []);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setCurrentPage(1);
    fetchPosts(1, slug, search);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setCurrentPage(1);
    // Debounce would be nice, but keeping simple
    const timeout = setTimeout(() => fetchPosts(1, activeCategory, q), 300);
    return () => clearTimeout(timeout);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, activeCategory, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const catList = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, postCount: c.postCount }));

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Blog" title="Insights & Articles" subtitle="Expert perspectives on AI, robotics, and enterprise technology." />

        {featuredPost && !activeCategory && !search && currentPage === 1 && (
          <FeaturedPost post={featuredPost} />
        )}

        <BlogFilters
          categories={catList}
          activeCategory={activeCategory}
          search={search}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>No articles found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
