import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JobApplicationForm } from '@/features/careers';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/types';
import jobsData from '@/data/jobs/jobs.json';

const jobs = jobsData as Job[];

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) return {};
  return { title: job.title, description: job.summary };
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section" style={{ maxWidth: '800px' }}>
        <Link href="/careers" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-6)' }}>
          ← Back to Careers
        </Link>

        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>{job.title}</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          <Badge variant="accent">{job.department}</Badge>
          <Badge>{job.location}</Badge>
          <Badge>{job.type}</Badge>
          <Badge>Posted {formatDate(job.posted)}</Badge>
        </div>

        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-8)' }}>{job.description}</p>

        <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>Requirements</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
          {job.requirements.map((req) => (
            <li key={req} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>→</span> {req}
            </li>
          ))}
        </ul>

        {job.niceToHave && (
          <>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>Nice to Have</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {job.niceToHave.map((nt) => (
                <li key={nt} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>+</span> {nt}
                </li>
              ))}
            </ul>
          </>
        )}

        {job.benefits && (
          <>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)' }}>Benefits</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              {job.benefits.map((b) => (
                <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-success)' }}>✓</span> {b}
                </li>
              ))}
            </ul>
          </>
        )}

        <JobApplicationForm jobId={job.id} jobTitle={job.title} />
      </div>
    </div>
  );
}
