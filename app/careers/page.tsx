import type { Metadata } from 'next';
import { SectionHeader } from '@/components/ui';
import { JobCard } from '@/features/careers';
import type { Job } from '@/types';
import jobsData from '@/data/jobs/jobs.json';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join Talents Hill — open positions in AI, ML, robotics, and analytics.',
};

const jobs = jobsData as Job[];

export default function CareersPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader label="Careers" title="Join Our Team" subtitle="We are building the future of AI. Come build it with us." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}
