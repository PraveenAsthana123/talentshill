'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <span className={styles.label}>AI-Powered Consulting</span>
          <h1 className={styles.heading}>
            Intelligent Analytics.{' '}
            <span className={styles.headingAccent}>Intelligently Delivered.</span>
          </h1>
          <p className={styles.subtitle}>
            Enterprise AI, Robotics, IoT, and Quantum computing solutions that transform data into decisions and ideas into impact.
          </p>
          <div className={styles.actions}>
            <Link href="/demo"><Button size="lg">Book a Demo</Button></Link>
            <Link href="/survey"><Button size="lg" variant="outline">AI Readiness Assessment</Button></Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>50+</span>
              <span className={styles.statLabel}>Enterprise Clients</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>200+</span>
              <span className={styles.statLabel}>Projects Delivered</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>98%</span>
              <span className={styles.statLabel}>Client Satisfaction</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.orb} />
          <div className={styles.floatingCards}>
            <div className={styles.floatingCard}>GenAI Copilot</div>
            <div className={styles.floatingCard}>Predictive Analytics</div>
            <div className={styles.floatingCard}>Quantum Optimization</div>
          </div>
        </div>
      </div>
    </section>
  );
}
