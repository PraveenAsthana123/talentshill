'use client';

import { useBookingStore } from '@/store/booking-store';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import styles from './BookingWizard.module.css';
import StepServiceSelect from './StepServiceSelect';
import StepDateTime from './StepDateTime';
import StepContactInfo from './StepContactInfo';
import StepRequirements from './StepRequirements';
import StepConfirmation from './StepConfirmation';

const STEPS = [
  { label: 'Service', component: StepServiceSelect },
  { label: 'Schedule', component: StepDateTime },
  { label: 'Contact', component: StepContactInfo },
  { label: 'Details', component: StepRequirements },
  { label: 'Confirm', component: StepConfirmation },
];

function useCanProceed(): boolean {
  const { currentStep, serviceData, dateTimeData, contactData, requirementsData } = useBookingStore();
  switch (currentStep) {
    case 0:
      return !!(serviceData?.category && serviceData?.service);
    case 1:
      return !!(dateTimeData?.date && dateTimeData?.time && dateTimeData?.timezone && dateTimeData?.duration);
    case 2:
      return !!(
        contactData?.name &&
        contactData?.email &&
        contactData?.company &&
        contactData?.jobTitle &&
        contactData?.companySize &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)
      );
    case 3:
      return !!(requirementsData?.useCase && requirementsData?.budget && requirementsData?.timeline);
    default:
      return true;
  }
}

export default function BookingWizard() {
  const { currentStep, isComplete, nextStep, prevStep } = useBookingStore();
  const canProceed = useCanProceed();

  const progress = ((currentStep) / (STEPS.length - 1)) * 100;
  const StepComponent = STEPS[currentStep]?.component;

  if (!StepComponent) return null;

  return (
    <div className={styles.wrapper}>
      {!isComplete && (
        <>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          <div className={styles.stepIndicator}>
            {STEPS.map((step, i) => (
              <div key={step.label} className={styles.stepDot}>
                <div className={cn(
                  styles.dot,
                  i === currentStep && styles.dotActive,
                  i < currentStep && styles.dotCompleted,
                )}>
                  {i < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={cn(styles.stepLabel, i === currentStep && styles.stepLabelActive)}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.card}>
        <StepComponent />

        {!isComplete && currentStep < 4 && (
          <div className={styles.actions}>
            <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={!canProceed}>
              {currentStep === 3 ? 'Review Booking' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
