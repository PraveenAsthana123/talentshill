import Link from 'next/link';
import { SERVICES } from '@/lib/constants';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './ServicesPreview.module.css';

export default function ServicesPreview() {
  return (
    <section id="services" className={styles.section}>
      <div className="container">
        <SectionHeader
          label="What We Do"
          title="Enterprise-Grade Solutions"
          subtitle="From analytics to quantum computing, we deliver end-to-end AI solutions tailored to your industry."
        />
        <div className={styles.categories}>
          {SERVICES.map((cat) => (
            <div key={cat.category}>
              <div className={styles.categoryLabel}>{cat.category}</div>
              <div className={styles.grid}>
                {cat.items.map((service) => (
                  <div key={service.id} className={styles.card}>
                    <h3 className={styles.cardTitle}>{service.name}</h3>
                    <p className={styles.cardDesc}>{service.description}</p>
                    <div className={styles.useCases}>
                      {service.useCases.map((uc) => (
                        <span key={uc} className={styles.useCase}>{uc}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.cta}>
          <Link href="/services"><Button variant="outline" size="lg">View All Services</Button></Link>
        </div>
      </div>
    </section>
  );
}
