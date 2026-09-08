import Link from 'next/link';
import type { Job } from '@/types';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import styles from './Careers.module.css';

export default function JobCard({ job }: { job: Job }) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.tag}>{job.department}</span>
        <span className={styles.tag}>{job.location}</span>
        <span className={styles.tag}>{job.type}</span>
      </div>
      <h3 className={styles.title}>{job.title}</h3>
      <p className={styles.summary}>{job.summary}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          Posted {formatDate(job.posted)}
        </span>
        <Link href={`/careers/${job.id}`}>
          <Button size="sm" variant="outline">View Details</Button>
        </Link>
      </div>
    </div>
  );
}
