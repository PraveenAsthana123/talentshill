'use client';

import { useBookingStore } from '@/store/booking-store';
import { BUDGET_OPTIONS, TIMELINE_OPTIONS, GOAL_OPTIONS } from '@/lib/booking-utils';
import { Textarea } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import styles from './BookingWizard.module.css';

export default function StepRequirements() {
  const { requirementsData, updateRequirementsData } = useBookingStore();

  const budget = requirementsData?.budget || '';
  const timeline = requirementsData?.timeline || '';
  const goals = requirementsData?.goals || [];
  const useCase = requirementsData?.useCase || '';
  const challenges = requirementsData?.challenges || '';

  const update = (partial: Record<string, unknown>) => {
    updateRequirementsData({
      useCase,
      budget,
      timeline,
      goals,
      challenges,
      ...requirementsData,
      ...partial,
    } as NonNullable<typeof requirementsData>);
  };

  const toggleGoal = (goal: string) => {
    const newGoals = goals.includes(goal)
      ? goals.filter((g) => g !== goal)
      : [...goals, goal];
    update({ goals: newGoals });
  };

  return (
    <>
      <h2 className={styles.cardTitle}>Project Requirements</h2>
      <p className={styles.cardSubtitle}>Help us understand your needs so we can tailor the demo.</p>

      <span className={styles.fieldLabel}>Describe Your Use Case</span>
      <Textarea
        placeholder="What problem are you trying to solve? What does your ideal solution look like?"
        value={useCase}
        onChange={(e) => update({ useCase: e.target.value })}
        style={{ marginBottom: 'var(--space-6)' }}
      />

      <span className={styles.fieldLabel}>Budget Range</span>
      <div className={styles.radioCards}>
        {BUDGET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={cn(styles.radioCard, budget === opt.value && styles.radioCardSelected)}
            onClick={() => update({ budget: opt.value })}
          >
            <div className={styles.radioCardLabel}>{opt.label}</div>
            <div className={styles.radioCardDesc}>{opt.description}</div>
          </button>
        ))}
      </div>

      <span className={styles.fieldLabel}>Timeline</span>
      <div className={styles.radioCards}>
        {TIMELINE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={cn(styles.radioCard, timeline === opt.value && styles.radioCardSelected)}
            onClick={() => update({ timeline: opt.value })}
          >
            <div className={styles.radioCardLabel}>{opt.label}</div>
            <div className={styles.radioCardDesc}>{opt.description}</div>
          </button>
        ))}
      </div>

      <span className={styles.fieldLabel}>Goals (select all that apply)</span>
      <div className={styles.checkboxGrid}>
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            className={cn(styles.checkboxOption, goals.includes(goal) && styles.checkboxOptionSelected)}
            onClick={() => toggleGoal(goal)}
          >
            <span className={cn(styles.checkIcon, goals.includes(goal) && styles.checkIconSelected)}>
              {goals.includes(goal) && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </span>
            {goal}
          </button>
        ))}
      </div>

      <span className={styles.fieldLabel}>Current Challenges (optional)</span>
      <Textarea
        placeholder="Any specific pain points, blockers, or challenges we should know about?"
        value={challenges}
        onChange={(e) => update({ challenges: e.target.value })}
      />
    </>
  );
}
