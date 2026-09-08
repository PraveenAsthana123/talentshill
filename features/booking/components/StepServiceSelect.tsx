'use client';

import { useBookingStore } from '@/store/booking-store';
import { SERVICE_CATEGORIES } from '@/lib/booking-utils';
import { cn } from '@/lib/utils';
import styles from './BookingWizard.module.css';

export default function StepServiceSelect() {
  const { serviceData, updateServiceData } = useBookingStore();

  const selectedCategory = SERVICE_CATEGORIES.find((c) => c.id === serviceData?.category);

  return (
    <>
      <h2 className={styles.cardTitle}>What can we help you with?</h2>
      <p className={styles.cardSubtitle}>Select a service category, then choose a specific offering.</p>

      <span className={styles.fieldLabel}>Service Category</span>
      <div className={styles.categoryGrid}>
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={cn(styles.categoryCard, serviceData?.category === cat.id && styles.categoryCardSelected)}
            onClick={() => updateServiceData({ category: cat.id, service: '' })}
          >
            <div className={styles.categoryIcon}>{cat.icon}</div>
            <div className={styles.categoryName}>{cat.name}</div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <>
          <span className={styles.fieldLabel}>Select Service</span>
          <div className={styles.serviceList}>
            {selectedCategory.services.map((svc) => (
              <button
                key={svc.id}
                className={cn(styles.serviceOption, serviceData?.service === svc.id && styles.serviceOptionSelected)}
                onClick={() => updateServiceData({ category: selectedCategory.id, service: svc.id })}
              >
                <div className={styles.serviceName}>{svc.name}</div>
                <div className={styles.serviceDesc}>{svc.description}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
