import { z } from 'zod';

export const CreateContentSchema = z.object({
  title: z.string().min(1).max(300),
  contentType: z.enum(['article', 'brochure_text', 'ppt_text', 'email_copy', 'social_post', 'landing_page']),
  body: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  coverImage: z.string().max(500).optional(),
});

export const UpdateContentSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  body: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  coverImage: z.string().max(500).optional(),
  status: z.enum(['draft', 'review', 'approved', 'published', 'archived']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CreateAssetSchema = z.object({
  title: z.string().min(1).max(300),
  assetType: z.enum(['brochure', 'presentation']),
  description: z.string().max(1000).optional(),
  contentId: z.string().optional(),
  slides: z.array(z.object({
    index: z.number(),
    title: z.string(),
    htmlContent: z.string(),
    layout: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
});

export const UpdateAssetSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(1000).optional(),
  coverImage: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateAssetSlidesSchema = z.object({
  slides: z.array(z.object({
    index: z.number(),
    title: z.string(),
    htmlContent: z.string(),
    layout: z.string().optional(),
    notes: z.string().optional(),
  })),
});

export const UpdateAssetStatusSchema = z.object({
  status: z.enum(['draft', 'review', 'approved', 'published']),
});

export const CreateShareLinkSchema = z.object({
  title: z.string().min(1).max(300),
  originalUrl: z.string().url().max(2000),
  contentId: z.string().optional(),
  assetId: z.string().optional(),
  campaignId: z.string().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const UpdateShareLinkSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  isActive: z.boolean().optional(),
  utmSource: z.string().max(200).optional(),
  utmMedium: z.string().max(200).optional(),
  utmCampaign: z.string().max(200).optional(),
  utmTerm: z.string().max(200).optional(),
  utmContent: z.string().max(200).optional(),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(300),
  contentId: z.string().optional(),
  assetId: z.string().optional(),
  listId: z.string().optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateWorkflowStepSchema = z.object({
  step: z.number().min(0).max(7),
  contentId: z.string().optional(),
  assetId: z.string().optional(),
  shareLinkIds: z.array(z.string()).optional(),
  listId: z.string().optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateWorkflowStatusSchema = z.object({
  status: z.enum(['draft', 'in_progress', 'pending_approval', 'approved', 'scheduled', 'running', 'completed', 'cancelled']),
});

export const WorkflowCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  stepIndex: z.number().min(0).max(7).optional(),
});

export const CreateAssessmentSchema = z.object({
  frameworkId: z.string().min(1),
  projectName: z.string().min(1).max(200),
});

export const UpdateItemScoresSchema = z.object({
  itemScores: z.array(z.object({
    itemIndex: z.number(),
    itemName: z.string(),
    status: z.enum(['not_started', 'in_progress', 'completed', 'not_applicable']),
    score: z.number().min(0).max(100).nullable(),
    notes: z.string().optional(),
    updatedAt: z.string().optional(),
  })),
});
