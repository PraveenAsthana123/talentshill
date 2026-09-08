import type { Metadata } from 'next';
import { ContactForm } from '@/features/forms';
import styles from './Contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | Talents Hill',
  description: 'Get in touch with Talents Hill for AI, analytics, and robotics consulting.',
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.info}>
            <h1 className={styles.title}>Let&apos;s Build Something Extraordinary</h1>
            <p className={styles.subtitle}>
              Tell us about your project and our team will get back to you within 24 hours with a tailored approach.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>&#x2709;</div>
                <div>
                  <div className={styles.detailLabel}>Email</div>
                  <a href="mailto:info@talentshill.com" className={styles.detailValue}>info@talentshill.com</a>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>&#x260E;</div>
                <div>
                  <div className={styles.detailLabel}>Phone</div>
                  <span className={styles.detailValue}>+1 (555) 000-0000</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>&#x1F4CD;</div>
                <div>
                  <div className={styles.detailLabel}>Office</div>
                  <span className={styles.detailValue}>Remote-First, Global Delivery</span>
                </div>
              </div>
            </div>

            <div className={styles.trust}>
              <div className={styles.trustItem}>
                <strong>500+</strong>
                <span>Projects Delivered</span>
              </div>
              <div className={styles.trustItem}>
                <strong>50+</strong>
                <span>Enterprise Clients</span>
              </div>
              <div className={styles.trustItem}>
                <strong>24h</strong>
                <span>Response Time</span>
              </div>
            </div>
          </aside>

          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
