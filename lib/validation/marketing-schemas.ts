import { z } from 'zod';

export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  subject: z.string().min(1).max(500),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
});

export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  subject: z.string().min(1).max(500).optional(),
  htmlContent: z.string().min(1).optional(),
  textContent: z.string().optional(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['email', 'sms']).default('email'),
  audienceType: z.enum(['list', 'segment', 'all']).optional(),
  audienceId: z.string().optional(),
  emailProfileId: z.string().optional(),
  templateId: z.string().optional(),
  subject: z.string().max(500).optional(),
  throttlePerMinute: z.number().min(1).max(1000).default(60),
});

export const LaunchCampaignSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  enableAbTest: z.boolean().default(false),
  variants: z.array(z.object({
    name: z.string().min(1),
    subject: z.string().optional(),
    templateId: z.string().optional(),
    percentage: z.number().min(1).max(100).default(50),
  })).max(2).optional(),
});

export const TestSendSchema = z.object({
  to: z.string().email(),
  variables: z.record(z.string(), z.string()).optional(),
});

export const ImportContactsSchema = z.object({
  columnMapping: z.record(z.string(), z.string()).optional(),
});
