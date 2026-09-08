import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  company: z.string().min(1, 'Company is required'),
  role: z.string().optional().default(''),
  industry: z.string().min(1, 'Please select an industry'),
  interestAreas: z.array(z.string()).min(1, 'Select at least one interest area'),
  projectStage: z.string().min(1, 'Please select a project stage'),
  budgetRange: z.string().optional().default(''),
  timeline: z.string().min(1, 'Please select a timeline'),
  message: z.string().min(50, 'Message must be at least 50 characters'),
  consent: z.boolean().refine(val => val === true, 'You must agree to proceed'),
});

export const demoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  timezone: z.string().min(1, 'Please select a timezone'),
  useCase: z.string().min(1, 'Please describe your use case'),
  platform: z.string().min(1, 'Please select a platform'),
  notes: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Explicit interface to avoid Zod v4 + react-hook-form resolver type mismatch
export interface ContactFormValues {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange: string;
  timeline: string;
  message: string;
  consent: boolean;
}

export type DemoFormValues = z.infer<typeof demoSchema>;
export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
