import { sqliteTable, text, integer, real, primaryKey, index } from 'drizzle-orm/sqlite-core';

export const blogAuthors = sqliteTable('blog_authors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  socialLinks: text('social_links'), // JSON string: { linkedin?, twitter? }
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const blogCategories = sqliteTable('blog_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'), // hex for badge
  sortOrder: integer('sort_order').default(0),
});

export const blogTags = sqliteTable('blog_tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  content: text('content').notNull(), // raw markdown
  coverImage: text('cover_image'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  authorId: text('author_id').references(() => blogAuthors.id),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  seoReadinessScore: integer('seo_readiness_score'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_posts_status').on(table.status),
  index('idx_posts_published_at').on(table.publishedAt),
  index('idx_posts_author').on(table.authorId),
  index('idx_posts_featured').on(table.featured),
]);

export const blogPostCategories = sqliteTable('blog_post_categories', {
  postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => blogCategories.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.postId, table.categoryId] }),
]);

export const blogPostTags = sqliteTable('blog_post_tags', {
  postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.postId, table.tagId] }),
  index('idx_post_tags_tag').on(table.tagId),
]);

export const blogViews = sqliteTable('blog_views', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_views_post').on(table.postId),
  index('idx_views_session').on(table.postId, table.sessionId),
]);

export const blogSubscribers = sqliteTable('blog_subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  status: text('status', { enum: ['active', 'unsubscribed'] }).notNull().default('active'),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).notNull(),
  unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp' }),
});

// ── Admin Users ──

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'editor', 'viewer'] }).notNull().default('editor'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  securityScore: integer('security_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Contact Submissions ──

export const contactSubmissions = sqliteTable('contact_submissions', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company').notNull(),
  role: text('role'),
  industry: text('industry').notNull(),
  interestAreas: text('interest_areas').notNull(), // JSON array
  projectStage: text('project_stage').notNull(),
  budgetRange: text('budget_range'),
  timeline: text('timeline').notNull(),
  message: text('message').notNull(),
  consent: integer('consent', { mode: 'boolean' }).notNull().default(false),
  leadScore: integer('lead_score').default(0),
  leadTier: text('lead_tier', { enum: ['hot', 'warm', 'cool', 'cold'] }).default('cold'),
  status: text('status', { enum: ['new', 'contacted', 'qualified', 'closed'] }).notNull().default('new'),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  sourcePage: text('source_page'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_contact_status').on(table.status),
  index('idx_contact_lead_tier').on(table.leadTier),
  index('idx_contact_industry').on(table.industry),
  index('idx_contact_created_at').on(table.createdAt),
]);

// ── Survey Responses ──

export const surveyResponses = sqliteTable('survey_responses', {
  id: text('id').primaryKey(),
  contactName: text('contact_name'),
  email: text('email'),
  company: text('company'),
  industry: text('industry'),
  companySize: text('company_size'),
  role: text('role'),
  totalScore: integer('total_score').notNull().default(0),
  maturityLevel: text('maturity_level', { enum: ['beginner', 'developing', 'advanced', 'leader'] }).notNull().default('beginner'),
  recommendedPath: text('recommended_path'),
  segmentationTags: text('segmentation_tags'), // JSON array
  outreachPriority: integer('outreach_priority'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_survey_maturity').on(table.maturityLevel),
  index('idx_survey_industry').on(table.industry),
  index('idx_survey_created_at').on(table.createdAt),
]);

export const surveyAnswers = sqliteTable('survey_answers', {
  id: text('id').primaryKey(),
  responseId: text('response_id').notNull().references(() => surveyResponses.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull(),
  answerValue: text('answer_value').notNull(),
  scoreValue: integer('score_value').default(0),
}, (table) => [
  index('idx_survey_answers_response').on(table.responseId),
]);

// ── Site Settings ──

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON string
  updatedBy: text('updated_by'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Audit Log ──

export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'user', 'post', 'contact', 'survey', 'setting', 'video', 'service', 'industry'
  entityId: text('entity_id'),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'login', 'logout'
  userId: text('user_id'),
  metadata: text('metadata'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_audit_entity').on(table.entityType, table.entityId),
  index('idx_audit_user').on(table.userId),
  index('idx_audit_created_at').on(table.createdAt),
]);

// ── Videos ──

export const videos = sqliteTable('videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  videoUrl: text('video_url').notNull(),
  provider: text('provider').default('youtube'), // youtube, vimeo, custom
  thumbnail: text('thumbnail'),
  tags: text('tags'), // JSON array
  category: text('category'),
  duration: text('duration'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  contentScore: integer('content_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Services ──

export const services = sqliteTable('services', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  shortDesc: text('short_desc'),
  longDesc: text('long_desc'),
  icon: text('icon'),
  tags: text('tags'), // JSON array
  useCases: text('use_cases'), // JSON array
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  contentScore: integer('content_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Industries ──

export const industries = sqliteTable('industries', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  contentScore: integer('content_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── RBAC: Roles ──

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).notNull().default(false),
  hygieneScore: integer('hygiene_score'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── RBAC: Permissions ──

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  resource: text('resource').notNull(),
  action: text('action').notNull(),
  description: text('description'),
}, (table) => [
  index('idx_permissions_resource').on(table.resource),
]);

// ── RBAC: Role-Permission mapping ──

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.roleId, table.permissionId] }),
]);

// ── RBAC: User-Role mapping ──

export const userRoles = sqliteTable('user_roles', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.roleId] }),
  index('idx_user_roles_user').on(table.userId),
  index('idx_user_roles_role').on(table.roleId),
]);

// ── RBAC: Groups ──

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── RBAC: Group Members ──

export const groupMembers = sqliteTable('group_members', {
  groupId: text('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.userId] }),
  index('idx_group_members_user').on(table.userId),
]);

// ── Feature Flags ──

export const featureFlags = sqliteTable('feature_flags', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  label: text('label').notNull(),
  description: text('description'),
  module: text('module'),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_feature_flags_key').on(table.key),
  index('idx_feature_flags_module').on(table.module),
]);

export const featureFlagVersions = sqliteTable('feature_flag_versions', {
  id: text('id').primaryKey(),
  flagId: text('flag_id').notNull().references(() => featureFlags.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  config: text('config'), // JSON
  changedBy: text('changed_by'),
  changedAt: integer('changed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_flag_versions_flag').on(table.flagId),
]);

export const featureFlagActive = sqliteTable('feature_flag_active', {
  flagId: text('flag_id').notNull().references(() => featureFlags.id, { onDelete: 'cascade' }).primaryKey(),
  versionId: text('version_id').notNull().references(() => featureFlagVersions.id, { onDelete: 'cascade' }),
  activatedAt: integer('activated_at', { mode: 'timestamp' }).notNull(),
  activatedBy: text('activated_by'),
});

// ── Job Queue ──

export const jobs = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'), // pending, running, completed, failed, cancelled, paused
  payload: text('payload'), // JSON
  priority: integer('priority').default(0),
  maxRetries: integer('max_retries').default(3),
  attempts: integer('attempts').default(0),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  error: text('error'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_jobs_status').on(table.status),
  index('idx_jobs_type').on(table.type),
  index('idx_jobs_scheduled').on(table.scheduledAt),
]);

export const jobRuns = sqliteTable('job_runs', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  attempt: integer('attempt').notNull(),
  status: text('status').notNull(), // running, completed, failed
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  result: text('result'), // JSON
  error: text('error'),
}, (table) => [
  index('idx_job_runs_job').on(table.jobId),
]);

export const jobLogs = sqliteTable('job_logs', {
  id: text('id').primaryKey(),
  jobId: text('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  level: text('level').notNull().default('info'), // info, warn, error
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_job_logs_job').on(table.jobId),
]);

// ── Email Profiles ──

export const emailProfiles = sqliteTable('email_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  fromName: text('from_name').notNull(),
  fromEmail: text('from_email').notNull(),
  replyTo: text('reply_to'),
  signature: text('signature'), // HTML
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  readinessScore: integer('readiness_score'), // real send-readiness score -- a profile with no linked SMTP config silently falls back to env vars (confirmed live in the Compose module)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const smtpConfigs = sqliteTable('smtp_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull().default(587),
  secure: integer('secure', { mode: 'boolean' }).notNull().default(false),
  username: text('username').notNull(),
  password: text('password').notNull(), // encrypted
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const emailProfileSmtp = sqliteTable('email_profile_smtp', {
  profileId: text('profile_id').notNull().references(() => emailProfiles.id, { onDelete: 'cascade' }),
  smtpConfigId: text('smtp_config_id').notNull().references(() => smtpConfigs.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.profileId, table.smtpConfigId] }),
]);

export const eventRoutes = sqliteTable('event_routes', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull().unique(),
  profileId: text('profile_id').notNull().references(() => emailProfiles.id, { onDelete: 'cascade' }),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ── Media ──

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  alt: text('alt'),
  tags: text('tags'), // JSON array
  folder: text('folder'),
  uploadedBy: text('uploaded_by'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Banners ──

export const banners = sqliteTable('banners', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // HTML
  placement: text('placement').notNull().default('top'), // top, bottom, modal, inline
  severity: text('severity').notNull().default('info'), // info, success, warning, error
  ctaText: text('cta_text'),
  ctaUrl: text('cta_url'),
  mediaId: text('media_id').references(() => media.id),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  priority: integer('priority').default(0),
  healthScore: integer('health_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_banners_placement').on(table.placement),
  index('idx_banners_active').on(table.isActive),
]);

// ── CRM Contacts ──

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  company: text('company'),
  phone: text('phone'),
  source: text('source').notNull().default('manual'), // manual, import, contact_form, survey, booking, newsletter
  tags: text('tags'), // JSON array
  customFields: text('custom_fields'), // JSON
  leadScore: integer('lead_score').default(0),
  status: text('status').notNull().default('active'), // active, unsubscribed, bounced, inactive
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }),
  unsubscribedAt: integer('unsubscribed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_contacts_email').on(table.email),
  index('idx_contacts_status').on(table.status),
  index('idx_contacts_source').on(table.source),
]);

export const contactEvents = sqliteTable('contact_events', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_contact_events_contact').on(table.contactId),
]);

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().default('static'), // static, dynamic
  segmentRules: text('segment_rules'), // JSON for dynamic lists
  memberCount: integer('member_count').default(0),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const listMembers = sqliteTable('list_members', {
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  primaryKey({ columns: [table.listId, table.contactId] }),
  index('idx_list_members_list').on(table.listId),
  index('idx_list_members_contact').on(table.contactId),
]);

// ── Email Templates ──

export const emailTemplates = sqliteTable('email_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  variables: text('variables'), // JSON array of variable names
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const emailTemplateVersions = sqliteTable('email_template_versions', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => emailTemplates.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  changedBy: text('changed_by'),
  changedAt: integer('changed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_template_versions_template').on(table.templateId),
]);

// ── Campaigns ──

export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('email'), // email, sms
  status: text('status').notNull().default('draft'), // draft, scheduled, sending, paused, completed, cancelled
  audienceType: text('audience_type'), // list, segment, all
  audienceId: text('audience_id'),
  audienceCount: integer('audience_count').default(0),
  emailProfileId: text('email_profile_id'),
  templateId: text('template_id'),
  subject: text('subject'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  throttlePerMinute: integer('throttle_per_minute').default(60),
  totalSent: integer('total_sent').default(0),
  totalOpened: integer('total_opened').default(0),
  totalClicked: integer('total_clicked').default(0),
  totalBounced: integer('total_bounced').default(0),
  totalUnsubscribed: integer('total_unsubscribed').default(0),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_campaigns_status').on(table.status),
]);

export const campaignRecipients = sqliteTable('campaign_recipients', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // pending, sent, delivered, opened, clicked, bounced, unsubscribed, failed
  messageId: text('message_id'),
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  openedAt: integer('opened_at', { mode: 'timestamp' }),
  clickedAt: integer('clicked_at', { mode: 'timestamp' }),
  bouncedAt: integer('bounced_at', { mode: 'timestamp' }),
  error: text('error'),
}, (table) => [
  index('idx_campaign_recipients_campaign').on(table.campaignId),
  index('idx_campaign_recipients_contact').on(table.contactId),
  index('idx_campaign_recipients_status').on(table.status),
]);

export const campaignVariants = sqliteTable('campaign_variants', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // 'A', 'B'
  subject: text('subject'),
  templateId: text('template_id'),
  percentage: integer('percentage').default(50),
  recipientCount: integer('recipient_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
}, (table) => [
  index('idx_campaign_variants_campaign').on(table.campaignId),
]);

// ── Email Messages (Tracking) ──

export const emailMessages = sqliteTable('email_messages', {
  id: text('id').primaryKey(),
  recipientId: text('recipient_id').references(() => campaignRecipients.id, { onDelete: 'set null' }),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  profileId: text('profile_id').references(() => emailProfiles.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  status: text('status').notNull().default('queued'), // queued, sent, delivered, bounced, failed
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  messageId: text('message_id'), // SMTP message ID
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_email_messages_contact').on(table.contactId),
  index('idx_email_messages_campaign').on(table.campaignId),
  index('idx_email_messages_status').on(table.status),
]);

export const unsubscribeTokens = sqliteTable('unsubscribe_tokens', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  usedAt: integer('used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_unsubscribe_tokens_token').on(table.token),
  index('idx_unsubscribe_tokens_contact').on(table.contactId),
]);

// ── Operations Console: Runs ──

export const runs = sqliteTable('runs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // campaign, broadcast, survey, form, import
  entityId: text('entity_id'),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'), // draft, scheduled, active, paused, completed, failed
  config: text('config'), // JSON snapshot
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_runs_type').on(table.type),
  index('idx_runs_status').on(table.status),
  index('idx_runs_entity').on(table.entityId),
]);

export const runEvents = sqliteTable('run_events', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => runs.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_run_events_run').on(table.runId),
]);

// ── Content Overrides ──

export const contentOverrides = sqliteTable('content_overrides', {
  id: text('id').primaryKey(),
  pageSlug: text('page_slug').notNull(),
  section: text('section').notNull(),
  key: text('key').notNull(),
  value: text('value'), // JSON
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  updatedBy: text('updated_by'),
  safetyScore: integer('safety_score'), // pipeline-computed: XSS-pattern + completeness checks on the raw override value
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_content_overrides_page').on(table.pageSlug),
]);

// ── Broadcasts ──

export const broadcasts = sqliteTable('broadcasts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  profileId: text('profile_id').references(() => emailProfiles.id, { onDelete: 'set null' }),
  audienceType: text('audience_type').notNull().default('list'), // list, segment, all
  audienceId: text('audience_id'),
  status: text('status').notNull().default('draft'), // draft, scheduled, sending, paused, completed
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  throttlePerMinute: integer('throttle_per_minute').default(60),
  totalSent: integer('total_sent').default(0),
  totalFailed: integer('total_failed').default(0),
  readinessScore: integer('readiness_score'), // real launch-readiness score -- launchBroadcast() has no audience/sender guard today
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_broadcasts_status').on(table.status),
]);

// ── Email Events (Granular Tracking) ──

export const emailEvents = sqliteTable('email_events', {
  id: text('id').primaryKey(),
  emailMessageId: text('email_message_id').references(() => emailMessages.id, { onDelete: 'set null' }),
  recipientId: text('recipient_id').references(() => campaignRecipients.id, { onDelete: 'set null' }),
  contactId: text('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull(), // sent, delivered, opened, clicked, bounced, complained, unsubscribed
  linkUrl: text('link_url'), // for click events
  metadata: text('metadata'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_email_events_contact').on(table.contactId),
  index('idx_email_events_campaign').on(table.campaignId),
  index('idx_email_events_type').on(table.eventType),
  index('idx_email_events_recipient').on(table.recipientId),
  index('idx_email_events_created').on(table.createdAt),
]);

// ── Import Jobs ──

export const importJobs = sqliteTable('import_jobs', {
  id: text('id').primaryKey(),
  fileName: text('file_name').notNull(),
  totalRows: integer('total_rows').default(0),
  processedRows: integer('processed_rows').default(0),
  importedCount: integer('imported_count').default(0),
  duplicateCount: integer('duplicate_count').default(0),
  errorCount: integer('error_count').default(0),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  columnMapping: text('column_mapping'), // JSON
  errors: text('errors'), // JSON
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
}, (table) => [
  index('idx_import_jobs_status').on(table.status),
  index('idx_import_jobs_created').on(table.createdAt),
]);

// ── Chat Sessions ──

export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  visitorEmail: text('visitor_email'),
  visitorName: text('visitor_name'),
  sessionToken: text('session_token').notNull().unique(),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  status: text('status').notNull().default('active'), // active, closed
  emailCapturedAt: integer('email_captured_at', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON
}, (table) => [
  index('idx_chat_sessions_token').on(table.sessionToken),
  index('idx_chat_sessions_status').on(table.status),
  index('idx_chat_sessions_email').on(table.visitorEmail),
]);

// ── Chat Requests ──

export const chatRequests = sqliteTable('chat_requests', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  contactId: text('contact_id').references(() => contacts.id),
  subject: text('subject'),
  category: text('category'),
  status: text('status').notNull().default('new'), // new, triaged, responding, waiting_user, resolved, closed
  priority: text('priority').notNull().default('medium'), // low, medium, high, urgent
  assignedTo: text('assigned_to').references(() => users.id),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
  responseQualityScore: integer('response_quality_score'), // pipeline-computed from real chat_message_evals checks on the latest admin response
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_chat_requests_session').on(table.sessionId),
  index('idx_chat_requests_status').on(table.status),
  index('idx_chat_requests_assigned').on(table.assignedTo),
  index('idx_chat_requests_priority').on(table.priority),
]);

// ── Chat Messages ──

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  requestId: text('request_id').references(() => chatRequests.id),
  role: text('role').notNull(), // user, assistant, system
  content: text('content').notNull(),
  metadata: text('metadata'), // JSON
  isEdited: integer('is_edited', { mode: 'boolean' }).default(false),
  editedBy: text('edited_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_chat_messages_session').on(table.sessionId),
  index('idx_chat_messages_request').on(table.requestId),
  index('idx_chat_messages_role').on(table.role),
]);

// ── Chat Message Evaluations ──

export const chatMessageEvals = sqliteTable('chat_message_evals', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull().references(() => chatMessages.id),
  evalType: text('eval_type').notNull(), // pii, toxicity, bias, safety, compliance
  score: integer('score'), // 0-100 scale
  passed: integer('passed', { mode: 'boolean' }).notNull(),
  details: text('details'), // JSON
  evaluatedAt: integer('evaluated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_chat_evals_message').on(table.messageId),
  index('idx_chat_evals_type').on(table.evalType),
]);

// ── Admin Notes ──

export const adminNotes = sqliteTable('admin_notes', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // chat_request, chat_session, contact
  entityId: text('entity_id').notNull(),
  content: text('content').notNull(),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_admin_notes_entity').on(table.entityType, table.entityId),
]);

// ── Integrations ──

export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey(),
  providerKey: text('provider_key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // messaging, social, productivity, data, webhook
  iconUrl: text('icon_url'),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
  configSchema: text('config_schema'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const integrationAccounts = sqliteTable('integration_accounts', {
  id: text('id').primaryKey(),
  integrationId: text('integration_id').notNull().references(() => integrations.id),
  name: text('name').notNull(),
  status: text('status').notNull().default('disconnected'), // connected, disconnected, error
  credentials: text('credentials'), // JSON (encrypted)
  settings: text('settings'), // JSON
  connectedBy: text('connected_by'),
  connectedAt: integer('connected_at', { mode: 'timestamp' }),
  lastSyncAt: integer('last_sync_at', { mode: 'timestamp' }),
  errorMessage: text('error_message'),
}, (table) => [
  index('idx_int_accounts_integration').on(table.integrationId),
  index('idx_int_accounts_status').on(table.status),
]);

export const integrationCredentials = sqliteTable('integration_credentials', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => integrationAccounts.id),
  key: text('key').notNull(),
  value: text('value').notNull(), // encrypted
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
}, (table) => [
  index('idx_int_creds_account').on(table.accountId),
]);

export const integrationLogs = sqliteTable('integration_logs', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => integrationAccounts.id),
  action: text('action').notNull(),
  status: text('status').notNull(), // success, error
  request: text('request'), // JSON
  response: text('response'), // JSON
  durationMs: integer('duration_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_int_logs_account').on(table.accountId),
  index('idx_int_logs_action').on(table.action),
]);

export const webhooks = sqliteTable('webhooks', {
  id: text('id').primaryKey(),
  accountId: text('account_id').references(() => integrationAccounts.id),
  name: text('name').notNull(),
  url: text('url').notNull(),
  secret: text('secret'),
  events: text('events'), // JSON array
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastTriggeredAt: integer('last_triggered_at', { mode: 'timestamp' }),
  failCount: integer('fail_count').default(0),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── RAG Pipeline ──

export const ragDocuments = sqliteTable('rag_documents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sourceType: text('source_type').notNull(), // upload, url, sitepage
  sourceUrl: text('source_url'),
  filePath: text('file_path'),
  mimeType: text('mime_type'),
  size: integer('size'),
  status: text('status').notNull().default('pending'), // pending, ingested, chunked, embedded, failed
  chunkCount: integer('chunk_count').default(0),
  metadata: text('metadata'), // JSON
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_docs_status').on(table.status),
  index('idx_rag_docs_source_type').on(table.sourceType),
]);

export const ragChunks = sqliteTable('rag_chunks', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => ragDocuments.id),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  tokenCount: integer('token_count'),
  metadata: text('metadata'), // JSON: headings, page number
  hash: text('hash'), // for dedup
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_chunks_doc').on(table.documentId),
]);

export const ragEmbeddings = sqliteTable('rag_embeddings', {
  id: text('id').primaryKey(),
  chunkId: text('chunk_id').notNull().references(() => ragChunks.id),
  model: text('model').notNull(),
  dimensions: integer('dimensions').notNull(),
  vector: text('vector').notNull(), // JSON-serialized float array
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_embed_chunk').on(table.chunkId),
]);

export const ragCache = sqliteTable('rag_cache', {
  id: text('id').primaryKey(),
  queryHash: text('query_hash').notNull().unique(),
  query: text('query').notNull(),
  results: text('results').notNull(), // JSON
  hitCount: integer('hit_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
});

export const ragRuns = sqliteTable('rag_runs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // ingestion, embedding, evaluation, retrieval
  status: text('status').notNull().default('pending'), // pending, running, completed, failed
  config: text('config'), // JSON snapshot
  documentIds: text('document_ids'), // JSON array
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  error: text('error'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_runs_type').on(table.type),
  index('idx_rag_runs_status').on(table.status),
]);

export const ragRunSteps = sqliteTable('rag_run_steps', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => ragRuns.id),
  stepName: text('step_name').notNull(),
  status: text('status').notNull(), // pending, running, completed, failed
  input: text('input'), // JSON
  output: text('output'), // JSON
  durationMs: integer('duration_ms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_steps_run').on(table.runId),
]);

export const ragRunMetrics = sqliteTable('rag_run_metrics', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => ragRuns.id),
  metricName: text('metric_name').notNull(), // faithfulness, relevance, precision, recall, pii_detected, chunk_quality
  value: real('value').notNull(), // 0-1 float
  details: text('details'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_rag_metrics_run').on(table.runId),
]);

export const ragConfigs = sqliteTable('rag_configs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  version: integer('version').notNull().default(1),
  config: text('config').notNull(), // JSON: chunkSize, chunkOverlap, embeddingModel, retrievalK, etc.
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  changedBy: text('changed_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ── Marketing Content ──

export const marketingContent = sqliteTable('marketing_content', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  contentType: text('content_type').notNull(), // article, brochure_text, ppt_text, email_copy, social_post, landing_page
  body: text('body').notNull().default(''),
  excerpt: text('excerpt'),
  status: text('status').notNull().default('draft'), // draft, review, approved, published, archived
  tags: text('tags'), // JSON array
  category: text('category'),
  coverImage: text('cover_image'),
  authorId: text('author_id'),
  metadata: text('metadata'), // JSON
  readinessScore: integer('readiness_score'), // real publish-readiness score -- publishContent() has no guard today
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
}, (table) => [
  index('idx_mktg_content_type').on(table.contentType),
  index('idx_mktg_content_status').on(table.status),
  index('idx_mktg_content_slug').on(table.slug),
]);

export const contentVersions = sqliteTable('content_versions', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => marketingContent.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  changedBy: text('changed_by'),
  changeNote: text('change_note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_content_ver_content').on(table.contentId),
]);

// ── Content Assets (Brochures & Presentations) ──

export const contentAssets = sqliteTable('content_assets', {
  id: text('id').primaryKey(),
  contentId: text('content_id').references(() => marketingContent.id),
  assetType: text('asset_type').notNull(), // brochure, presentation
  title: text('title').notNull(),
  description: text('description'),
  slides: text('slides'), // JSON array of slide objects
  status: text('status').notNull().default('draft'), // draft, review, approved, published
  coverImage: text('cover_image'),
  metadata: text('metadata'), // JSON
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_assets_type').on(table.assetType),
  index('idx_assets_status').on(table.status),
]);

// ── Share Links ──

export const shareLinks = sqliteTable('share_links', {
  id: text('id').primaryKey(),
  contentId: text('content_id').references(() => marketingContent.id),
  assetId: text('asset_id').references(() => contentAssets.id),
  campaignId: text('campaign_id'),
  title: text('title').notNull(),
  originalUrl: text('original_url').notNull(),
  shortCode: text('short_code').notNull().unique(),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmTerm: text('utm_term'),
  utmContent: text('utm_content'),
  clickCount: integer('click_count').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_links_short_code').on(table.shortCode),
  index('idx_links_active').on(table.isActive),
]);

// ── Marketing Workflows ──

export const marketingWorkflows = sqliteTable('marketing_workflows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'),
  currentStep: integer('current_step').notNull().default(0),
  contentId: text('content_id').references(() => marketingContent.id),
  assetId: text('asset_id').references(() => contentAssets.id),
  shareLinkIds: text('share_link_ids'), // JSON array
  listId: text('list_id'),
  campaignId: text('campaign_id'),
  approvedBy: text('approved_by'),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  metadata: text('metadata'), // JSON
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_workflows_status').on(table.status),
  index('idx_workflows_step').on(table.currentStep),
]);

export const workflowComments = sqliteTable('workflow_comments', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull().references(() => marketingWorkflows.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  content: text('content').notNull(),
  stepIndex: integer('step_index'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_wf_comments_workflow').on(table.workflowId),
]);

// ── Analysis Frameworks ──

export const analysisFrameworks = sqliteTable('analysis_frameworks', {
  id: text('id').primaryKey(),
  categoryKey: text('category_key').notNull().unique(),
  categoryName: text('category_name').notNull(),
  description: text('description'),
  analysisTypes: text('analysis_types').notNull(), // JSON array of {index, name}
  totalItems: integer('total_items').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_frameworks_key').on(table.categoryKey),
]);

export const analysisAssessments = sqliteTable('analysis_assessments', {
  id: text('id').primaryKey(),
  frameworkId: text('framework_id').notNull().references(() => analysisFrameworks.id),
  projectName: text('project_name').notNull(),
  assessorId: text('assessor_id'),
  status: text('status').notNull().default('not_started'), // not_started, in_progress, completed
  overallScore: real('overall_score'),
  completedItems: integer('completed_items').notNull().default(0),
  totalItems: integer('total_items').notNull(),
  itemScores: text('item_scores').notNull(), // JSON array
  metadata: text('metadata'), // JSON
  healthScore: integer('health_score'), // pipeline-computed: completion % + recency, not a quality judgment on overallScore
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_assessments_framework').on(table.frameworkId),
  index('idx_assessments_project').on(table.projectName),
  index('idx_assessments_status').on(table.status),
]);

// ── Analytics Program Health Snapshots ──
// Unlike other modules' pipelines (which score one mutable entity),
// analytics has no single entity of its own -- it's a rollup over
// campaigns + contacts. Each pipeline run inserts a new timestamped
// snapshot row instead of updating a record in place, so program health
// can be tracked over time.
export const analyticsSnapshots = sqliteTable('analytics_snapshots', {
  id: text('id').primaryKey(),
  healthScore: integer('health_score').notNull(),
  openRateScore: integer('open_rate_score').notNull(),
  clickRateScore: integer('click_rate_score').notNull(),
  bounceRateScore: integer('bounce_rate_score').notNull(),
  contactHealthScore: integer('contact_health_score').notNull(),
  inputSnapshot: text('input_snapshot').notNull(), // JSON: raw rates/counts used
  triggeredBy: text('triggered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_analytics_snapshots_created').on(table.createdAt),
]);

// Module Understanding registry -- real, queryable backing for the mandatory
// Module Understanding Standard policy. One row per real module (this app's
// 39 RBAC resources, see lib/db/seed-rbac.ts's RESOURCES), matching the
// pattern sohamyoga-frontend's own module_registry table already uses (that
// one runs on Postgres; this is the SQLite/Drizzle equivalent, same shape).
// A module with no row is "not yet cataloged" -- the UI must say so
// honestly, never omit it or imply it's fine.
export const moduleRegistry = sqliteTable('module_registry', {
  id: text('id').primaryKey(),
  moduleKey: text('module_key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  builtStatus: text('built_status', { enum: ['real', 'partial', 'not_built', 'not_yet_cataloged'] }).notNull().default('not_yet_cataloged'),
  apiRouteCount: integer('api_route_count').notNull().default(0),
  hasAdminUi: integer('has_admin_ui', { mode: 'boolean' }).notNull().default(false),
  missingItems: text('missing_items'),
  sourceDoc: text('source_doc'),
  lastVerifiedAt: integer('last_verified_at', { mode: 'timestamp' }),
  verifiedBy: text('verified_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_module_registry_status').on(table.builtStatus),
]);

// Operation Run -- generic, reusable run-tracking for the Operational
// Portal Page & Tab Standard's 3 execution modes (Manual/Pipeline/
// Agentic), pilot module: competitor_analysis. Named generically
// (moduleKey-scoped, not competitor-analysis-specific) so other modules
// can reuse this same table when they adopt the 10-tab standard, instead
// of each module growing its own bespoke run table.
export const operationRun = sqliteTable('operation_run', {
  id: text('id').primaryKey(),
  moduleKey: text('module_key').notNull(), // e.g. 'competitor_analysis', ties to module_registry.moduleKey
  operationName: text('operation_name').notNull(), // e.g. 'research_competitor'
  executionMode: text('execution_mode', { enum: ['manual', 'pipeline', 'agentic'] }).notNull(),
  status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] }).notNull().default('pending'),
  inputPayload: text('input_payload'), // JSON
  outputPayload: text('output_payload'), // JSON
  errorMessage: text('error_message'),
  tokensUsed: integer('tokens_used'),
  triggeredBy: text('triggered_by'), // userId, or 'system' for scheduled pipeline runs
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_operation_run_module').on(table.moduleKey),
  index('idx_operation_run_status').on(table.status),
  index('idx_operation_run_mode').on(table.executionMode),
]);

// Status history for operation_run -- section 3 of the Operational Portal
// standard requires a status history, not just a current-value field.
export const operationRunStatusHistory = sqliteTable('operation_run_status_history', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => operationRun.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  changedAt: integer('changed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_run_status_history_run').on(table.runId),
]);

// Agent execution steps -- the real plan/search/act/execute/complete loop
// for agentic-mode operation_run rows. Each row is one real step an agent
// took, not a summary -- this IS the "not a black box" requirement from
// the Operational Portal standard's Agentic tab.
export const agentExecutionStep = sqliteTable('agent_execution_step', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull().references(() => operationRun.id, { onDelete: 'cascade' }),
  stepIndex: integer('step_index').notNull(),
  phase: text('phase', { enum: ['plan', 'search', 'act', 'execute', 'complete'] }).notNull(),
  agentRole: text('agent_role').notNull(), // e.g. 'researcher', 'analyst'
  input: text('input'),
  output: text('output'),
  tokensUsed: integer('tokens_used'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_agent_step_run').on(table.runId),
  index('idx_agent_step_phase').on(table.phase),
]);

// Real, persisted test-tracking for the Operational Portal 10-tab
// standard's Testing tab -- replaces per-module hardcoded arrays with a
// real, queryable record. Every row is a real verification that actually
// happened (test data used, raw log/evidence captured, actual result),
// not a planned/hypothetical test case.
export const testExecution = sqliteTable('test_execution', {
  id: text('id').primaryKey(),
  moduleKey: text('module_key').notNull(),
  executionMode: text('execution_mode', { enum: ['manual', 'pipeline', 'agentic', 'cross-module'] }),
  caseName: text('case_name').notNull(),
  description: text('description'),
  expectedResult: text('expected_result').notNull(),
  actualResult: text('actual_result').notNull(),
  status: text('status', { enum: ['pass', 'fail'] }).notNull(),
  testData: text('test_data'), // JSON -- the real input/fixture used
  logOutput: text('log_output'), // raw captured evidence (curl output, DB query result, etc.)
  executedAt: integer('executed_at', { mode: 'timestamp' }).notNull(),
  executedBy: text('executed_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_test_execution_module').on(table.moduleKey),
  index('idx_test_execution_status').on(table.status),
]);

// Competitor Analysis -- admin-only market-research intelligence, per
// service. NOT exposed on any public route. Tracks who else is offering a
// comparable service, how they position it, and what TalentsHill would
// offer to differentiate. This is a research tool for the team to fill in
// with real findings -- it must never be seeded with invented competitor
// names, pricing, or claims presented as real research. A template row
// (isTemplate=true) demonstrates the intended structure without claiming
// to be real intelligence.
export const competitorAnalysis = sqliteTable('competitor_analysis', {
  id: text('id').primaryKey(),
  serviceId: text('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
  competitorName: text('competitor_name').notNull(),
  competitorWebsite: text('competitor_website'),
  offeringSummary: text('offering_summary'),
  pricingNotes: text('pricing_notes'),
  strengthsWeaknesses: text('strengths_weaknesses'),
  sampleDeliverables: text('sample_deliverables'), // JSON array of {name, description} -- what TalentsHill would produce as a sample/template deliverable for this service
  status: text('status', { enum: ['needs_research', 'researched', 'monitoring'] }).notNull().default('needs_research'),
  isTemplate: integer('is_template', { mode: 'boolean' }).notNull().default(false),
  lastResearchedAt: integer('last_researched_at', { mode: 'timestamp' }),
  researchedBy: text('researched_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_competitor_analysis_service').on(table.serviceId),
  index('idx_competitor_analysis_status').on(table.status),
]);

// ── Email Compose Log ──
// Compose has no persisted draft entity -- it's a one-shot send action.
// This table gives it a real, queryable audit trail: every send
// attempt, its pre-send readiness score, and whether it actually sent.
export const emailComposeLog = sqliteTable('email_compose_log', {
  id: text('id').primaryKey(),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  htmlLength: integer('html_length').notNull(),
  profileId: text('profile_id'),
  readinessScore: integer('readiness_score'),
  sent: integer('sent', { mode: 'boolean' }).notNull().default(false),
  errorMessage: text('error_message'),
  triggeredBy: text('triggered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_email_compose_log_created').on(table.createdAt),
]);
