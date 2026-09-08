import type { Metadata } from 'next';
import { getAllVideos } from '@/lib/db/admin-queries';
import { SectionHeader } from '@/components/ui';
import Badge from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Videos',
  description: 'Watch demos, tutorials, and thought leadership from Talents Hill.',
};

export default function VideosPage() {
  const videos = getAllVideos(true);

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Videos" title="Watch & Learn" subtitle="Demos, walkthroughs, and expert insights on AI and robotics." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-8)' }}>
          {videos.map((video) => (
            <div key={video.id} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', background: 'var(--color-surface)' }}>
                <iframe
                  src={video.videoUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                />
              </div>
              <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>{video.title}</h3>
                  {video.duration && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{video.duration}</span>}
                </div>
                {video.summary && (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>{video.summary}</p>
                )}
                {video.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {video.tags.map((t) => <Badge key={t} variant="accent">{t}</Badge>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
