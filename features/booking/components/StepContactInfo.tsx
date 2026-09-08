'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookingStore } from '@/store/booking-store';
import { COMPANY_SIZE_OPTIONS } from '@/lib/booking-utils';
import { Input, Select } from '@/components/ui/Input';
import styles from './BookingWizard.module.css';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  companySize: string;
}

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string(),
  company: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  companySize: z.string().min(1, 'Please select company size'),
});

export default function StepContactInfo() {
  const { contactData, updateContactData } = useBookingStore();

  const { register, formState: { errors }, watch } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contactData?.name || '',
      email: contactData?.email || '',
      phone: contactData?.phone || '',
      company: contactData?.company || '',
      jobTitle: contactData?.jobTitle || '',
      companySize: contactData?.companySize || '',
    },
    mode: 'onChange',
  });

  const values = watch();

  useEffect(() => {
    updateContactData({
      name: values.name || '',
      email: values.email || '',
      phone: values.phone || '',
      company: values.company || '',
      jobTitle: values.jobTitle || '',
      companySize: values.companySize || '',
    });
  }, [values.name, values.email, values.phone, values.company, values.jobTitle, values.companySize, updateContactData]);

  return (
    <>
      <h2 className={styles.cardTitle}>Your Contact Details</h2>
      <p className={styles.cardSubtitle}>Tell us about yourself so we can prepare the best experience.</p>

      <div className={styles.formGrid}>
        <Input
          label="Full Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Work Email"
          type="email"
          placeholder="john@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Company"
          placeholder="Acme Inc."
          error={errors.company?.message}
          {...register('company')}
        />
        <Input
          label="Job Title"
          placeholder="VP of Engineering"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />
        <Select
          label="Company Size"
          options={COMPANY_SIZE_OPTIONS}
          placeholder="Select size"
          error={errors.companySize?.message}
          {...register('companySize')}
        />
      </div>
    </>
  );
}
