import Link from 'next/link';
import { INDUSTRIES } from '@/lib/constants';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './IndustriesPreview.module.css';

export default function IndustriesPreview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          label="Industries We Serve"
          title="Domain Expertise"
          subtitle="Deep vertical knowledge combined with cutting-edge AI to solve industry-specific challenges."
        />
        <div className={styles.grid}>
          {INDUSTRIES.map((ind) => (
            <div key={ind.id} className={styles.card}>
              <div className={styles.icon}>{ind.icon}</div>
              <h3 className={styles.name}>{ind.name}</h3>
              <p className={styles.desc}>{ind.description}</p>
            </div>
          ))}
        </div>
        <div className={styles.cta}>
          <Link href="/industries"><Button variant="outline">Explore All Industries</Button></Link>
        </div>
      </div>
    </section>
  );
}
