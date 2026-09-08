'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './EngagementFlow.module.css';

const STEPS = [
  { id: 'input', icon: '📥', label: 'Input', desc: 'Data & Requirements', detail: 'We start by understanding your data landscape, business goals, and technical requirements. Our team conducts stakeholder interviews and data audits.' },
  { id: 'process', icon: '⚙️', label: 'Process', desc: 'AI/ML Pipeline', detail: 'Our engineers design and build custom AI/ML pipelines — from data preprocessing to model training, evaluation, and optimization.' },
  { id: 'output', icon: '📊', label: 'Output', desc: 'Models & Insights', detail: 'Trained models, dashboards, and actionable insights delivered. Every output includes documentation, performance metrics, and business interpretation.' },
  { id: 'monitor', icon: '📡', label: 'Monitor', desc: 'Performance Tracking', detail: 'Continuous monitoring of model performance, data drift, and business KPIs. Automated alerts for any degradation or anomalies.' },
  { id: 'quality', icon: '✅', label: 'Quality', desc: 'Validation & Testing', detail: 'Rigorous testing: A/B testing, shadow deployments, bias checks, and security audits before and after production deployment.' },
  { id: 'decision', icon: '🚦', label: 'Go / No-Go', desc: 'Launch Decision', detail: 'Final review with stakeholders. Clear Go/No-Go criteria based on quality metrics, business impact, and risk assessment.' },
];

export default function EngagementFlow() {
  const [activeStep, setActiveStep] = useState(STEPS[0].id);
  const active = STEPS.find((s) => s.id === activeStep);

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHeader
          label="Our Process"
          title="Engagement Flow"
          subtitle="A structured approach from data ingestion to production deployment."
        />

        <div className={styles.flow}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div
                className={cn(styles.step, activeStep === step.id && styles.stepActive)}
                onClick={() => setActiveStep(step.id)}
              >
                <div className={styles.stepIcon}>{step.icon}</div>
                <div className={styles.stepLabel}>{step.label}</div>
                <div className={styles.stepDesc}>{step.desc}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={styles.connector}>
                  <div className={styles.dots}>
                    <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {active && (
          <div className={styles.detail} key={active.id}>
            <h3 className={styles.detailTitle}>{active.icon} {active.label}: {active.desc}</h3>
            <p className={styles.detailText}>{active.detail}</p>
          </div>
        )}
      </div>
    </section>
  );
}
