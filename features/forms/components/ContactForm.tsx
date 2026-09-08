'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormValues } from '../types/schemas';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import styles from './FormStyles.module.css';

const industryOptions = [
  { value: 'banking', label: 'Banking & Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'agritech', label: 'AgriTech' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'technology', label: 'Technology' },
  { value: 'other', label: 'Other' },
];

const interestOptions = [
  'Marketing Analytics',
  'Customer Analytics',
  'Data Integration',
  'Generative AI',
  'Robotics & Automation',
  'IoT & Smart Systems',
  'Quantum Computing',
  'AI Strategy Consulting',
];

const projectStageOptions = [
  { value: 'just-exploring', label: 'Just Exploring' },
  { value: 'research-phase', label: 'Research Phase' },
  { value: 'building-business-case', label: 'Building Business Case' },
  { value: 'evaluating-vendors', label: 'Evaluating Vendors' },
  { value: 'ready-to-start', label: 'Ready to Start' },
];

const budgetOptions = [
  { value: '10k-25k', label: '$10K - $25K' },
  { value: '25k-50k', label: '$25K - $50K' },
  { value: '50k-100k', label: '$50K - $100K' },
  { value: '100k-250k', label: '$100K - $250K' },
  { value: '250k+', label: '$250K+' },
];

const timelineOptions = [
  { value: 'immediate', label: 'Immediate (< 1 month)' },
  { value: '1-3months', label: '1 - 3 months' },
  { value: '3-6months', label: '3 - 6 months' },
  { value: '6months+', label: '6+ months' },
  { value: 'exploring', label: 'Just exploring' },
];

export default function ContactForm() {
  const addToast = useUIStore((s) => s.addToast);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema) as any,
    defaultValues: {
      fullName: '', email: '', phone: '', company: '', role: '',
      industry: '', interestAreas: [], projectStage: '', budgetRange: '',
      timeline: '', message: '', consent: false,
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setServerError('Too many submissions. Please try again later.');
          return;
        }
        throw new Error(result.error || 'Failed');
      }
      addToast({ type: 'success', message: 'Message sent successfully! We will get back to you within 24 hours.' });
      reset();
    } catch {
      addToast({ type: 'error', message: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className={styles.serverError}>{serverError}</div>}

      <div className={styles.row}>
        <Input label="Full Name *" placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Work Email *" type="email" placeholder="john@company.com" error={errors.email?.message} {...register('email')} />
      </div>

      <div className={styles.row}>
        <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" error={errors.phone?.message} {...register('phone')} />
        <Input label="Company *" placeholder="Acme Inc." error={errors.company?.message} {...register('company')} />
      </div>

      <div className={styles.row}>
        <Input label="Role / Title" placeholder="CTO, VP Engineering, etc." error={errors.role?.message} {...register('role')} />
        <Select label="Industry *" options={industryOptions} placeholder="Select industry" error={errors.industry?.message} {...register('industry')} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Interest Areas * <span className={styles.fieldHint}>(select all that apply)</span></label>
        <Controller
          name="interestAreas"
          control={control}
          render={({ field }) => (
            <div className={styles.checkboxGrid}>
              {interestOptions.map((opt) => (
                <label key={opt} className={cn(styles.checkboxItem, field.value?.includes(opt) && styles.checkboxItemSelected)}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={field.value?.includes(opt) || false}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...(field.value || []), opt]
                        : (field.value || []).filter((v: string) => v !== opt);
                      field.onChange(updated);
                    }}
                  />
                  <span className={styles.checkboxLabel}>{opt}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.interestAreas?.message && <span className={styles.fieldError} role="alert">{errors.interestAreas.message}</span>}
      </div>

      <div className={styles.row}>
        <Select label="Project Stage *" options={projectStageOptions} placeholder="Select stage" error={errors.projectStage?.message} {...register('projectStage')} />
        <Select label="Budget Range" options={budgetOptions} placeholder="Select budget (optional)" error={errors.budgetRange?.message} {...register('budgetRange')} />
      </div>

      <Select label="Timeline *" options={timelineOptions} placeholder="Select timeline" error={errors.timeline?.message} {...register('timeline')} />

      <Textarea label="Message *" placeholder="Tell us about your project, goals, and how we can help... (min 50 characters)" rows={5} error={errors.message?.message} {...register('message')} />

      <label className={styles.consentRow}>
        <input type="checkbox" className={styles.consentCheckbox} {...register('consent')} />
        <span className={styles.consentText}>
          I agree to Talents Hill processing my data to respond to my inquiry. *
        </span>
      </label>
      {errors.consent?.message && <span className={styles.fieldError} role="alert">{errors.consent.message}</span>}

      <p className={styles.captchaNote}>Protected by spam detection (placeholder for Turnstile/reCAPTCHA)</p>

      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting}>Send Message</Button>
      </div>
    </form>
  );
}
