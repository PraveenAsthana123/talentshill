'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { demoSchema, type DemoFormValues } from '../types/schemas';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';
import styles from './FormStyles.module.css';

const timezoneOptions = [
  { value: 'EST', label: 'Eastern (EST/EDT)' },
  { value: 'CST', label: 'Central (CST/CDT)' },
  { value: 'MST', label: 'Mountain (MST/MDT)' },
  { value: 'PST', label: 'Pacific (PST/PDT)' },
  { value: 'IST', label: 'India (IST)' },
  { value: 'GMT', label: 'GMT/UTC' },
  { value: 'CET', label: 'Central European (CET)' },
];

const platformOptions = [
  { value: 'genai', label: 'Generative AI / LLM' },
  { value: 'robotics', label: 'Robotics & Automation' },
  { value: 'iot', label: 'IoT & Smart Systems' },
  { value: 'quantum', label: 'Quantum Computing' },
  { value: 'analytics', label: 'Analytics & BI' },
  { value: 'other', label: 'Other' },
];

const timeOptions = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
];

export default function DemoForm() {
  const addToast = useUIStore((s) => s.addToast);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<DemoFormValues>({
    resolver: zodResolver(demoSchema),
  });

  const onSubmit = async (data: DemoFormValues) => {
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      addToast({ type: 'success', message: 'Demo request submitted! We will confirm your slot shortly.' });
      reset();
    } catch {
      addToast({ type: 'error', message: 'Failed to submit. Please try again.' });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.row}>
        <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
      </div>
      <Input label="Company" placeholder="Acme Inc." error={errors.company?.message} {...register('company')} />
      <div className={styles.row}>
        <Input label="Preferred Date" type="date" error={errors.preferredDate?.message} {...register('preferredDate')} />
        <Select label="Preferred Time" options={timeOptions} placeholder="Select time" error={errors.preferredTime?.message} {...register('preferredTime')} />
      </div>
      <div className={styles.row}>
        <Select label="Timezone" options={timezoneOptions} placeholder="Select timezone" error={errors.timezone?.message} {...register('timezone')} />
        <Select label="Platform Interest" options={platformOptions} placeholder="Select platform" error={errors.platform?.message} {...register('platform')} />
      </div>
      <Textarea label="Use Case" placeholder="Describe what you'd like to see in the demo..." error={errors.useCase?.message} {...register('useCase')} />
      <Textarea label="Additional Notes (optional)" placeholder="Any specific questions or requirements..." {...register('notes')} />
      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>Book Demo</Button>
      </div>
    </form>
  );
}
