'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';
import styles from './Careers.module.css';

const applicationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  linkedin: z.string().optional(),
  portfolio: z.string().optional(),
  coverLetter: z.string().optional(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export default function JobApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const addToast = useUIStore((s) => s.addToast);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationValues) => {
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, jobId }),
      });
      if (!res.ok) throw new Error('Failed');
      addToast({ type: 'success', message: `Application for ${jobTitle} submitted successfully!` });
      reset();
    } catch {
      addToast({ type: 'error', message: 'Failed to submit application. Please try again.' });
    }
  };

  return (
    <div className={styles.applySection}>
      <h3 className={styles.sectionTitle}>Apply for this Position</h3>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className={styles.formGrid}>
          <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="john@example.com" error={errors.email?.message} {...register('email')} />
        </div>
        <div className={styles.formGrid}>
          <Input label="LinkedIn Profile (optional)" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
          <Input label="Portfolio URL (optional)" placeholder="https://portfolio.com" {...register('portfolio')} />
        </div>
        <div className={styles.uploadArea}>
          Resume upload (placeholder — drag & drop or click to upload)
        </div>
        <Textarea label="Cover Letter (optional)" placeholder="Tell us why you're interested in this role..." {...register('coverLetter')} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" loading={isSubmitting}>Submit Application</Button>
        </div>
      </form>
    </div>
  );
}
