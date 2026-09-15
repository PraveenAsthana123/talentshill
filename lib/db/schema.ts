import { sqliteTable, text, integer, real, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

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
  qualificationStage: text('qualification_stage', { enum: ['unqualified', 'mql', 'sql', 'opportunity', 'customer'] }).default('unqualified'),
  assignedTo: text('assigned_to'),
  alertSentAt: integer('alert_sent_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['new', 'contacted', 'qualified', 'closed'] }).notNull().default('new'),
  ipHash: text('ip_hash'),
  userAgent: text('user_agent'),
  sourcePage: text('source_page'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_contact_status').on(table.status),
  index('idx_contact_lead_tier').on(table.leadTier),
  index('idx_contact_qualification_stage').on(table.qualificationStage),
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
  qualityScore: integer('quality_score'),
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
  readinessScore: integer('readiness_score'), // real governance-completeness score -- createFlag() writes no initial version, so a never-toggled flag has empty history
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
  readinessScore: integer('readiness_score'), // real file-integrity score -- a DB row can outlive its real file on disk with nothing catching it
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
  // Real behavioral lifecycle tracking, added 2026-09-14 -- distinct from
  // leadScore, which is a static profile-completeness rubric computed by
  // contact-completeness-pipeline.ts. lifecycleStage/activationScore are
  // computed from real email_events/campaign_recipients engagement
  // history (opens/clicks/recency), never from profile fields.
  lifecycleStage: text('lifecycle_stage', { enum: ['new', 'engaged', 'at_risk', 'churned'] }).default('new'),
  activationScore: integer('activation_score'),
  lastEngagedAt: integer('last_engaged_at', { mode: 'timestamp' }),
  // Real, admin/import-entered fields for occasion-message triggering
  // (birthday/anniversary/location-festival), added 2026-09-14 -- never
  // inferred or guessed, only ever set from a real known value (a CSV
  // import column, a form field, an admin edit). Null means genuinely
  // unknown, not "assume today."
  dateOfBirth: integer('date_of_birth', { mode: 'timestamp' }),
  customerAnniversaryDate: integer('customer_anniversary_date', { mode: 'timestamp' }), // real relationship-start date (defaults to createdAt at write time if not separately known -- never fabricated after the fact)
  country: text('country'), // real, ISO-2 preferred but free text accepted -- drives location-festival matching
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_contacts_email').on(table.email),
  index('idx_contacts_status').on(table.status),
  index('idx_contacts_source').on(table.source),
  index('idx_contacts_lifecycle_stage').on(table.lifecycleStage),
  index('idx_contacts_dob').on(table.dateOfBirth),
  index('idx_contacts_anniversary').on(table.customerAnniversaryDate),
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
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }), // dynamic lists only -- real gap this tracks: listMembers was never auto-materialized from segmentRules before this build
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
  // Real bug fixed 2026-09-14: addCampaignRecipients() calls
  // onConflictDoNothing(), but with no unique constraint on
  // (campaignId, contactId) and a fresh random `id` generated every
  // call, nothing could ever conflict -- re-running recipient
  // materialization would silently duplicate rows for the same contact,
  // which campaign-sender.ts's send loop would then email twice.
  uniqueIndex('uq_campaign_recipients_campaign_contact').on(table.campaignId, table.contactId),
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
  healthScore: integer('health_score'),
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

// ── SMS/WhatsApp Event-Triggered Re-engagement, added 2026-09-14 ──
// No real SMS/WhatsApp gateway integration exists in this build --
// confirmed by repo-wide search before building this (no Twilio/SMS
// library; lib/integrations/providers/whatsapp.ts is a hardcoded stub
// that always reports success, not a real API call, and is never used
// here). Every row is a real, honestly-labeled record of a message
// that WOULD be sent to a real contact for a real, condition-evaluated
// reason -- status is 'logged', never a fabricated 'delivered'/'sent'.
export const reEngagementMessages = sqliteTable('re_engagement_messages', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  channel: text('channel', { enum: ['sms', 'whatsapp'] }).notNull(),
  triggerReason: text('trigger_reason').notNull(), // real, computed description (e.g. "at_risk, 32 days since last engagement")
  messageBody: text('message_body').notNull(), // real, personalized from the admin's own template
  phoneNumberSnapshot: text('phone_number_snapshot'), // real contact.phone at trigger time
  status: text('status', { enum: ['logged', 'failed'] }).notNull().default('logged'),
  failureReason: text('failure_reason'),
  triggeredAt: integer('triggered_at', { mode: 'timestamp' }).notNull(),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_re_engagement_contact').on(table.contactId),
  index('idx_re_engagement_channel').on(table.channel),
  index('idx_re_engagement_triggered_at').on(table.triggeredAt),
]);

// ── AI Webinar-to-Pipeline Engine, added 2026-09-14 ──
// The pre-existing `appointments` module (lib/appointments-db.ts, a
// flat JSON file, not this DB) models only 1:1 consultation bookings --
// no group/event entity existed anywhere in this codebase before this.
// No real webinar-platform integration exists (confirmed via
// repo-wide search: zero Zoom/Calendly hits) -- attendance and
// engagement notes are real, admin-entered observations, never a
// fabricated join-duration/engagement number.
export const webinars = sqliteTable('webinars', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
  durationMinutes: integer('duration_minutes'),
  status: text('status', { enum: ['scheduled', 'completed', 'cancelled'] }).notNull().default('scheduled'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_webinars_status').on(table.status),
]);

export const webinarRegistrants = sqliteTable('webinar_registrants', {
  id: text('id').primaryKey(),
  webinarId: text('webinar_id').notNull().references(() => webinars.id),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  company: text('company'),
  consent: integer('consent', { mode: 'boolean' }).notNull().default(false),
  registeredAt: integer('registered_at', { mode: 'timestamp' }).notNull(),
  attended: integer('attended', { mode: 'boolean' }), // null until an admin records the real outcome
  engagementNotes: text('engagement_notes'), // real, admin-entered observation (e.g. "asked pricing question, requested demo")
  qualificationScore: integer('qualification_score'), // 0-100, computed from real attended+engagement signals, never LLM-estimated
  qualificationTier: text('qualification_tier', { enum: ['hot', 'warm', 'cool', 'cold'] }),
  contactSubmissionId: text('contact_submission_id').references(() => contactSubmissions.id), // real link into the pre-existing leads pipeline, only written for a real qualifying registrant
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_webinar_registrants_webinar').on(table.webinarId),
  index('idx_webinar_registrants_tier').on(table.qualificationTier),
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
  // ── AI Conversational Sales Assistant, added 2026-09-14 -- computed
  // from real keyword-detected buying signals in the real conversation,
  // never LLM-estimated ──
  qualificationScore: integer('qualification_score'), // 0-100 composite
  qualificationTier: text('qualification_tier', { enum: ['cold', 'warm', 'hot'] }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_chat_requests_session').on(table.sessionId),
  index('idx_chat_requests_status').on(table.status),
  index('idx_chat_requests_assigned').on(table.assignedTo),
  index('idx_chat_requests_priority').on(table.priority),
  index('idx_chat_requests_qualification_tier').on(table.qualificationTier),
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
  readinessScore: integer('readiness_score'), // real connection-readiness score
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
  readinessScore: integer('readiness_score'),
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

// ── AI Content Factory (personas, editorial calendar, performance) ──
// Targets marketingContent (the internal multi-channel content library),
// not the separate public blogPosts table -- no bridge/sync exists
// between the two, disclosed rather than faked. Promoting factory output
// to the public blog remains a separate, manual human decision.

export const contentPersonas = sqliteTable('content_personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(), // real, admin-written target-audience description
  toneNotes: text('tone_notes'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const contentTopics = sqliteTable('content_topics', {
  id: text('id').primaryKey(),
  personaId: text('persona_id').references(() => contentPersonas.id),
  title: text('title').notNull(),
  targetContentType: text('target_content_type').notNull(), // reuses marketingContent.contentType values
  scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
  status: text('status', { enum: ['proposed', 'scheduled', 'generated', 'published'] }).notNull().default('proposed'),
  generatedContentId: text('generated_content_id').references(() => marketingContent.id),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_content_topics_status').on(table.status),
]);

// Real, manually-entered engagement metrics per published content item --
// no analytics-platform integration exists, same honesty boundary as
// every other metrics table added this session.
export const contentEngagementMetrics = sqliteTable('content_engagement_metrics', {
  id: text('id').primaryKey(),
  contentId: text('content_id').notNull().references(() => marketingContent.id, { onDelete: 'cascade' }),
  recordedDate: integer('recorded_date', { mode: 'timestamp' }).notNull(),
  views: integer('views').default(0),
  leadsGenerated: integer('leads_generated').default(0),
  enteredBy: text('entered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_content_engagement_content').on(table.contentId),
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
  readinessScore: integer('readiness_score'), // real consistency score -- update-status accepts any status with no validation, so 'approved' can be set with no approvedBy, etc.
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
  driftScore: integer('drift_score'),
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

// ── Competitor Campaign Monitor, added 2026-09-14 ──
// No real competitive-intelligence/ad-library/scraping API integration
// exists anywhere in this build -- confirmed via repo-wide search
// before building this. Each row is a real, admin-entered observation
// of a specific competitor's dated activity (a promo, a new creative,
// a pricing change) -- never an "auto-detected" claim or a simulated
// scrape result, same honesty discipline as the parent
// competitor_analysis table's own schema comment.
export const competitorCampaignObservations = sqliteTable('competitor_campaign_observations', {
  id: text('id').primaryKey(),
  competitorId: text('competitor_id').notNull().references(() => competitorAnalysis.id, { onDelete: 'cascade' }),
  observedAt: integer('observed_at', { mode: 'timestamp' }).notNull(),
  channel: text('channel', { enum: ['paid_social', 'search', 'email', 'landing_page', 'organic_social', 'pr', 'other'] }).notNull(),
  campaignType: text('campaign_type', { enum: ['promotion', 'new_creative', 'pricing_change', 'messaging_shift', 'product_launch', 'other'] }).notNull(),
  description: text('description').notNull(), // real, what was actually observed
  evidenceUrl: text('evidence_url'), // real link/screenshot reference, if available
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_competitor_campaign_obs_competitor').on(table.competitorId),
  index('idx_competitor_campaign_obs_observed_at').on(table.observedAt),
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

// ── System Health Snapshots ──
// Health has no persisted entity of its own (it's a live status
// rollup). Each Pipeline run inserts a new timestamped row so overall
// system health can be tracked over time, same pattern as
// analytics_snapshots.
export const healthSnapshots = sqliteTable('health_snapshots', {
  id: text('id').primaryKey(),
  healthScore: integer('health_score').notNull(),
  jobRunnerScore: integer('job_runner_score').notNull(),
  recentErrorsScore: integer('recent_errors_score').notNull(),
  jobFailureRateScore: integer('job_failure_rate_score').notNull(),
  dbSizeScore: integer('db_size_score').notNull(),
  inputSnapshot: text('input_snapshot').notNull(), // JSON: raw metrics used
  triggeredBy: text('triggered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_health_snapshots_created').on(table.createdAt),
]);

// ── Maintenance Enforcement Checks ──
// Real self-test snapshots: each run reads the actual maintenance_mode
// setting and makes a real HTTP request to a live public page to
// confirm the middleware enforcement fix (see middleware.ts) is
// actually behaving as expected, not just that the setting exists.
export const maintenanceChecks = sqliteTable('maintenance_checks', {
  id: text('id').primaryKey(),
  score: integer('score').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull(),
  enforcementMatchesExpected: integer('enforcement_matches_expected', { mode: 'boolean' }).notNull(),
  observedStatusCode: integer('observed_status_code'),
  scheduledEndValid: integer('scheduled_end_valid', { mode: 'boolean' }),
  messageSubstantive: integer('message_substantive', { mode: 'boolean' }).notNull(),
  triggeredBy: text('triggered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_maintenance_checks_created').on(table.createdAt),
]);

// ── 8 new module concepts (2026-09-09) ──
// Real local CRUD + Operational Portal 10-tab standard for each. Every
// third-party integration (ad-platform spend sync, Adobe/CapCut/HeyGen,
// YouTube Data API, voice-cloning APIs) is deliberately NOT built here
// -- disclosed honestly per module's Governance tab and module_registry
// row rather than faked with placeholder API clients.

export const adCampaigns = sqliteTable('ad_campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  platform: text('platform', { enum: ['google', 'meta', 'linkedin', 'tiktok', 'other'] }).notNull(),
  status: text('status', { enum: ['draft', 'active', 'paused', 'completed'] }).notNull().default('draft'),
  objective: text('objective'),
  budget: real('budget'),
  spend: real('spend').default(0),
  targetAudience: text('target_audience'),
  creativeUrl: text('creative_url'),
  startDate: integer('start_date', { mode: 'timestamp' }),
  endDate: integer('end_date', { mode: 'timestamp' }),
  notes: text('notes'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_ad_campaigns_platform').on(table.platform),
  index('idx_ad_campaigns_status').on(table.status),
]);

// Real, manually-entered performance metrics per campaign per period. No
// ad-platform API sync exists (disclosed in ads_management Governance/
// monitoring) -- these rows are entered by a human from the actual ad
// platform's own reporting UI, same honesty boundary as adCampaigns.spend.
export const adCampaignMetrics = sqliteTable('ad_campaign_metrics', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => adCampaigns.id, { onDelete: 'cascade' }),
  recordedDate: integer('recorded_date', { mode: 'timestamp' }).notNull(),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  revenue: real('revenue').default(0),
  spendForPeriod: real('spend_for_period').default(0),
  enteredBy: text('entered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_ad_campaign_metrics_campaign').on(table.campaignId),
  index('idx_ad_campaign_metrics_date').on(table.recordedDate),
]);

// Shared customer-self-service infrastructure, reused across every module.
// TalentsHill has no customer-login portal -- a token gates a read-only
// report view instead of a customer account. Tokens are opaque random
// strings (32+ bytes), never sequential IDs, and can be revoked/expired.
export const reportShareTokens = sqliteTable('report_share_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  moduleKey: text('module_key').notNull(),
  reportType: text('report_type').notNull(),
  entityId: text('entity_id'),
  createdBy: text('created_by'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  revoked: integer('revoked', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_report_share_tokens_token').on(table.token),
  index('idx_report_share_tokens_module').on(table.moduleKey),
]);

export const videoProjects = sqliteTable('video_projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  tool: text('tool', { enum: ['adobe_premiere', 'adobe_after_effects', 'capcut', 'heygen', 'other'] }).notNull(),
  status: text('status', { enum: ['planning', 'in_progress', 'review', 'published'] }).notNull().default('planning'),
  strategyNotes: text('strategy_notes'), // viral/VFX/editing-dos-and-donts guidance per this module's real scope
  outputUrl: text('output_url'),
  durationSeconds: integer('duration_seconds'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_video_projects_status').on(table.status),
]);

// ── Video Repurposing Factory, added 2026-09-14 ──
// No real video-processing/transcoding integration (e.g. FFmpeg)
// exists anywhere in this codebase -- confirmed via repo-wide search
// before building this. A clip plan is a real, admin-entered planning
// record (which real timestamp range of a real source video, for
// which real target platform/aspect ratio) -- never a fabricated
// render/transcode. status is limited to planning states; 'delivered'
// means an admin manually attached a real outputUrl they produced
// externally, never an automatic "processing complete."
export const videoClipPlans = sqliteTable('video_clip_plans', {
  id: text('id').primaryKey(),
  sourceProjectId: text('source_project_id').notNull().references(() => videoProjects.id),
  title: text('title').notNull(),
  startSeconds: integer('start_seconds').notNull(),
  endSeconds: integer('end_seconds').notNull(),
  targetPlatform: text('target_platform', { enum: ['instagram_reels', 'tiktok', 'youtube_shorts', 'linkedin', 'other'] }).notNull(),
  targetAspectRatio: text('target_aspect_ratio', { enum: ['9:16', '1:1', '16:9', '4:5'] }).notNull(),
  status: text('status', { enum: ['planned', 'ready_for_edit', 'delivered'] }).notNull().default('planned'),
  outputUrl: text('output_url'), // real, admin-entered -- only meaningful once status='delivered'
  notes: text('notes'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_video_clip_plans_source').on(table.sourceProjectId),
  index('idx_video_clip_plans_status').on(table.status),
]);

export const voiceAssets = sqliteTable('voice_assets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  type: text('type', { enum: ['script', 'recording', 'transcript'] }).notNull(),
  status: text('status', { enum: ['draft', 'recorded', 'approved'] }).notNull().default('draft'),
  content: text('content'), // script/transcript text
  filePath: text('file_path'), // real local file, for uploaded recordings
  durationSeconds: integer('duration_seconds'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_voice_assets_type').on(table.type),
]);

// ── Voice AI Lead Qualification, added 2026-09-14 ──
// No telephony integration exists in this build (no Twilio/SIP/IVR --
// confirmed by repo-wide search before building this). The transcript
// is real, admin-entered text describing what was actually said on a
// real call, the same honesty pattern as brand_mentions (branding) and
// campaignFeedbackNotes (influencer_video) -- never a simulated or
// auto-generated transcript.
export const voiceCallLogs = sqliteTable('voice_call_logs', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  direction: text('direction', { enum: ['inbound', 'outbound'] }).notNull(),
  phoneNumber: text('phone_number'),
  transcript: text('transcript').notNull(), // real, admin-entered -- what was actually said
  durationSeconds: integer('duration_seconds'),
  callDate: integer('call_date', { mode: 'timestamp' }).notNull(),
  qualificationScore: integer('qualification_score'), // 0-100, computed from real BANT+next-step signals in the transcript
  qualificationTier: text('qualification_tier', { enum: ['cold', 'warm', 'hot'] }),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_voice_call_logs_contact').on(table.contactId),
  index('idx_voice_call_logs_tier').on(table.qualificationTier),
  index('idx_voice_call_logs_date').on(table.callDate),
]);

export const marketResearchBriefs = sqliteTable('market_research_briefs', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  sourceNotes: text('source_notes'), // real input the analyst provides -- never fabricated market data
  findings: text('findings'), // human-written or agent-synthesized from sourceNotes only
  status: text('status', { enum: ['draft', 'in_review', 'published'] }).notNull().default('draft'),
  readinessScore: integer('readiness_score'),
  // ── Opportunity Scoring inputs (all real, analyst-entered estimates --
  // never inferred or fabricated by an agent) ──
  somEstimateUsd: integer('som_estimate_usd'), // analyst's own Serviceable Obtainable Market estimate
  competitionLevel: text('competition_level', { enum: ['low', 'medium', 'high'] }),
  riskLevel: text('risk_level', { enum: ['low', 'medium', 'high'] }),
  strategicFitScore: integer('strategic_fit_score'), // 0-100, analyst's own judgment input
  // ── Computed (deterministic pipeline output, never LLM-generated) ──
  opportunityScore: integer('opportunity_score'), // 0-100 composite
  opportunityRank: integer('opportunity_rank'), // rank among all scored+published briefs, 1=best
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_market_research_status').on(table.status),
  index('idx_market_research_opportunity_score').on(table.opportunityScore),
]);

export const brandAssets = sqliteTable('brand_assets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category', { enum: ['logo', 'color_palette', 'typography', 'guideline_doc', 'template', 'other'] }).notNull(),
  filePath: text('file_path'),
  description: text('description'),
  version: integer('version').notNull().default(1),
  status: text('status', { enum: ['draft', 'approved', 'deprecated'] }).notNull().default('draft'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_brand_assets_category').on(table.category),
]);

// ── AI Brand Perception Dashboard ──
// Real, manually-entered mention data -- no social-listening/news/review
// API integration exists in this environment (same honesty boundary as
// every other "no third-party data source" disclosure this session). An
// admin logs a real excerpt they found; sentiment is then computed from
// that real text via Ollama, never fabricated from nothing.
export const brandMentions = sqliteTable('brand_mentions', {
  id: text('id').primaryKey(),
  source: text('source', { enum: ['social', 'review', 'news', 'survey'] }).notNull(),
  sourceName: text('source_name'), // e.g. "Twitter", "Google Reviews", "TechCrunch"
  excerpt: text('excerpt').notNull(),
  url: text('url'),
  collectedAt: integer('collected_at', { mode: 'timestamp' }).notNull(),
  sentiment: text('sentiment', { enum: ['positive', 'neutral', 'negative'] }),
  sentimentExplanation: text('sentiment_explanation'),
  topics: text('topics'), // JSON array, real-extracted, nullable until scored
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_brand_mentions_source').on(table.source),
  index('idx_brand_mentions_sentiment').on(table.sentiment),
]);

// A point-in-time real aggregate over brandMentions -- campaignId links
// a snapshot to a real campaign for before/after lift measurement (two
// snapshots, one pre- and one post-campaign, diffed by the pipeline;
// this table does not compute lift itself).
export const brandHealthSnapshots = sqliteTable('brand_health_snapshots', {
  id: text('id').primaryKey(),
  snapshotDate: integer('snapshot_date', { mode: 'timestamp' }).notNull(),
  healthScore: integer('health_score').notNull(),
  totalMentions: integer('total_mentions').notNull().default(0),
  positiveMentions: integer('positive_mentions').notNull().default(0),
  neutralMentions: integer('neutral_mentions').notNull().default(0),
  negativeMentions: integer('negative_mentions').notNull().default(0),
  competitorsTracked: integer('competitors_tracked').notNull().default(0),
  campaignId: text('campaign_id').references(() => campaigns.id),
  label: text('label'), // e.g. "pre-campaign", "post-campaign", or free text
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_brand_health_snapshots_campaign').on(table.campaignId),
]);

export const influencerCampaigns = sqliteTable('influencer_campaigns', {
  id: text('id').primaryKey(),
  influencerName: text('influencer_name').notNull(),
  platform: text('platform', { enum: ['instagram', 'youtube', 'tiktok', 'linkedin', 'other'] }).notNull(),
  status: text('status', { enum: ['prospecting', 'negotiating', 'active', 'completed', 'cancelled'] }).notNull().default('prospecting'),
  deliverables: text('deliverables'), // JSON array of {description, dueDate, delivered}
  agreedFee: real('agreed_fee'),
  contactEmail: text('contact_email'),
  readinessScore: integer('readiness_score'),
  // Manually assessed 0-100 fit between the creator's stated audience and
  // the target audience -- real human judgment entered at prospecting
  // time, not a fabricated third-party audience-data lookup.
  audienceFitScore: integer('audience_fit_score'),
  // Real qualitative feedback/comments about the campaign (client notes,
  // audience comment excerpts) -- grounds the Ollama sentiment agent so
  // it classifies real text instead of inventing a sentiment score.
  campaignFeedbackNotes: text('campaign_feedback_notes'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_influencer_campaigns_status').on(table.status),
]);

// Real per-period performance metrics per creator campaign, manually
// entered from the platform's own analytics (no third-party creator/
// social-analytics API integration exists -- same honesty boundary as
// ads_management's ad_campaign_metrics).
export const influencerCampaignMetrics = sqliteTable('influencer_campaign_metrics', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').notNull().references(() => influencerCampaigns.id, { onDelete: 'cascade' }),
  recordedDate: integer('recorded_date', { mode: 'timestamp' }).notNull(),
  reach: integer('reach').default(0),
  clicks: integer('clicks').default(0),
  sales: integer('sales').default(0),
  revenue: real('revenue').default(0),
  enteredBy: text('entered_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_influencer_campaign_metrics_campaign').on(table.campaignId),
]);

export const reels = sqliteTable('reels', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  platform: text('platform', { enum: ['instagram', 'tiktok', 'youtube_shorts', 'other'] }).notNull(),
  status: text('status', { enum: ['idea', 'scripted', 'filmed', 'edited', 'scheduled', 'published'] }).notNull().default('idea'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  assetUrl: text('asset_url'),
  caption: text('caption'),
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_reels_status').on(table.status),
  index('idx_reels_platform').on(table.platform),
]);

export const youtubeVideos = sqliteTable('youtube_videos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['planned', 'recorded', 'edited', 'scheduled', 'published'] }).notNull().default('planned'),
  externalVideoId: text('external_video_id'), // real YouTube video ID, once actually synced -- null until the Data API integration exists
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  tags: text('tags'), // JSON array
  readinessScore: integer('readiness_score'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_youtube_videos_status').on(table.status),
]);

// ── YouTube Channel Growth Engine, added 2026-09-14 ──
// No real YouTube Data API/OAuth integration exists anywhere in this
// build -- confirmed via repo-wide search before building this (every
// existing mention of "YouTube Data API" in the codebase is a
// disclosure that it's absent). Channel-level metrics are real,
// admin-entered snapshots copied from the admin's own real YouTube
// Studio dashboard -- never a live API fetch, never a simulated
// number. Growth is always a deterministic diff between two real
// snapshots, never a fabricated trend.
export const youtubeChannelSnapshots = sqliteTable('youtube_channel_snapshots', {
  id: text('id').primaryKey(),
  snapshotDate: integer('snapshot_date', { mode: 'timestamp' }).notNull(),
  subscriberCount: integer('subscriber_count').notNull(),
  totalViews: integer('total_views').notNull(),
  totalWatchTimeMinutes: integer('total_watch_time_minutes'),
  notes: text('notes'),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_youtube_channel_snapshots_date').on(table.snapshotDate),
]);

// ── Customer Occasion Messaging, added 2026-09-14 ──
// Admin-level: admins manage the festival calendar + standard template
// library, and trigger/review sends -- not a customer self-service flow.
// Same honesty boundary as broadcasts/re_engagement_messages: no real
// SMS/WhatsApp/email gateway exists in this build (confirmed via the
// same repo-wide search re-engagement's schema comment already
// documents), so every send here is a real, logged INTENT to send a
// real, personalized message to a real contact -- status is 'logged'
// or 'failed', never a fabricated 'delivered'/'sent'. Deliberately no
// LLM involved in composing occasion messages -- these are always a
// real standard template (deterministically personalized) or a real
// admin-typed custom message, never model-generated, so a birthday
// message can never invent a wrong name or a wrong number of years.

export const festivalCalendar = sqliteTable('festival_calendar', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. 'christmas_2026', 'diwali_2026' -- lunar/shifting festivals are dated per real calendar year, not computed, and must be re-seeded each year (disclosed limitation, not automated)
  name: text('name').notNull(),
  occasionDate: integer('occasion_date', { mode: 'timestamp' }).notNull(),
  country: text('country'), // null = global (applies to every contact regardless of country); set = only contacts with a matching real country
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_festival_calendar_date').on(table.occasionDate),
  index('idx_festival_calendar_country').on(table.country),
]);

export const occasionTemplates = sqliteTable('occasion_templates', {
  id: text('id').primaryKey(),
  occasionType: text('occasion_type', { enum: ['birthday', 'anniversary', 'festival'] }).notNull(), // 'custom' is deliberately not a template type -- a custom message is authored ad hoc at send time, never saved as a reusable "standard" template by definition
  festivalCode: text('festival_code').references(() => festivalCalendar.code), // required when occasionType='festival', null otherwise
  channel: text('channel', { enum: ['email', 'sms', 'whatsapp'] }).notNull(),
  name: text('name').notNull(),
  subject: text('subject'), // email only
  body: text('body').notNull(), // supports {{firstName}} -- same personalizeMessage() pattern as re-engagement-trigger-pipeline.ts
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_occasion_templates_type').on(table.occasionType),
  index('idx_occasion_templates_festival').on(table.festivalCode),
]);

export const occasionMessages = sqliteTable('occasion_messages', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  occasionType: text('occasion_type', { enum: ['birthday', 'anniversary', 'festival', 'custom'] }).notNull(),
  festivalCode: text('festival_code').references(() => festivalCalendar.code),
  templateId: text('template_id').references(() => occasionTemplates.id), // null for a custom message
  channel: text('channel', { enum: ['email', 'sms', 'whatsapp'] }).notNull(),
  subject: text('subject'),
  messageBody: text('message_body').notNull(), // real, personalized final text actually associated with this send
  status: text('status', { enum: ['logged', 'failed'] }).notNull().default('logged'),
  failureReason: text('failure_reason'),
  triggeredAt: integer('triggered_at', { mode: 'timestamp' }).notNull(),
  triggeredDate: text('triggered_date').notNull(), // real 'YYYY-MM-DD' derived from triggeredAt, held separately purely so the unique index below can dedupe by calendar day regardless of time-of-day
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_occasion_messages_contact').on(table.contactId),
  index('idx_occasion_messages_type').on(table.occasionType),
  index('idx_occasion_messages_triggered_at').on(table.triggeredAt),
  // Real bug class this session already fixed once in campaign_recipients
  // (see schema comment there): prevents the same real occasion firing
  // twice for the same contact on the same real calendar day if the
  // trigger pipeline runs more than once in a day.
  uniqueIndex('uq_occasion_messages_contact_type_day').on(table.contactId, table.occasionType, table.festivalCode, table.triggeredDate),
]);

// ── Evidence Ledger, added 2026-09-14 -- gap-analysis backlog #1/25 ──
// Real claim-classification with mandatory source traceability, so any
// number this app later surfaces (a KPI, a score, a brief) can be traced
// back to what kind of evidence it actually is. `sourceRef` must always
// point at a real row somewhere else in this DB (e.g. "contact_submissions:<id>")
// -- recordEvidence() in lib/evidence/evidence-ledger.ts throws if it's empty.
export const evidenceRecord = sqliteTable('evidence_record', {
  id: text('id').primaryKey(),
  moduleKey: text('module_key').notNull(), // ties to module_registry.moduleKey, e.g. 'leads'
  claimClass: text('claim_class', { enum: ['fact', 'estimate', 'inference', 'hypothesis', 'unknown'] }).notNull(),
  claimText: text('claim_text').notNull(), // the actual claim, e.g. "Lead scored 72 (hot tier)"
  sourceRef: text('source_ref').notNull(), // required, e.g. "contact_submissions:<id>", "operation_run:<id>"
  sourceTable: text('source_table'), // optional, real table name the sourceRef points into
  confidence: text('confidence', { enum: ['low', 'medium', 'high'] }),
  observedAt: integer('observed_at', { mode: 'timestamp' }).notNull(),
  validUntil: integer('valid_until', { mode: 'timestamp' }), // null = no known expiry
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_evidence_record_module').on(table.moduleKey),
  index('idx_evidence_record_class').on(table.claimClass),
  index('idx_evidence_record_source').on(table.sourceRef),
]);

// ── KPI Engine, added 2026-09-14 -- gap-analysis backlog #2/25 ──
// Real, explainable KPI dimensions computed from real tables (contact_submissions,
// campaign_recipients, webinar_registrants, ad_campaign_metrics, operation_run).
// Every snapshot carries its own real sampleSize and a confidence derived
// from it (see lib/kpi/kpi-engine.ts's confidenceForSampleSize) -- a
// dimension with zero real samples is NULL, never a fabricated 0.
export const kpiSnapshot = sqliteTable('kpi_snapshot', {
  id: text('id').primaryKey(),
  dimension: text('dimension', { enum: ['lead_generation', 'lead_quality', 'email_engagement', 'webinar_engagement', 'ad_efficiency', 'operational_health'] }).notNull(),
  periodStart: integer('period_start', { mode: 'timestamp' }).notNull(),
  periodEnd: integer('period_end', { mode: 'timestamp' }).notNull(),
  value: real('value'), // null when sampleSize is 0 -- never fabricated
  sampleSize: integer('sample_size').notNull().default(0),
  confidence: text('confidence', { enum: ['unknown', 'low', 'medium', 'high'] }).notNull().default('unknown'),
  unit: text('unit').notNull(), // e.g. 'percent', 'count', 'score_0_100', 'ratio'
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_kpi_snapshot_dimension').on(table.dimension),
  index('idx_kpi_snapshot_period').on(table.periodStart, table.periodEnd),
]);

// ── Opportunity & Benchmark Engine, added 2026-09-14 -- backlog #3/25 ──
// Ranks real gaps found in kpi_snapshot (a dimension below a disclosed
// threshold, or with zero real data = an instrumentation gap) by real
// impact x feasibility x confidence, and points each at a real existing
// module as remediation. THRESHOLDS/SOLUTION_MAP in
// lib/opportunity/opportunity-engine.ts are disclosed, hardcoded business
// judgment -- not derived data -- same honesty pattern as SohamYoga's
// OpportunityEngine.
export const opportunityCandidate = sqliteTable('opportunity_candidate', {
  id: text('id').primaryKey(),
  dimension: text('dimension').notNull(), // ties to kpi_snapshot.dimension
  gapType: text('gap_type', { enum: ['below_threshold', 'no_data'] }).notNull(),
  kpiSnapshotId: text('kpi_snapshot_id').references(() => kpiSnapshot.id),
  impactScore: integer('impact_score').notNull(), // 1-10, disclosed hardcoded weight per dimension
  feasibilityScore: integer('feasibility_score').notNull(), // 1-10, disclosed hardcoded weight per dimension
  confidenceWeight: real('confidence_weight').notNull(), // derived from the real kpi_snapshot confidence
  rankScore: real('rank_score').notNull(), // impact x feasibility x confidenceWeight
  recommendedModuleKey: text('recommended_module_key').notNull(), // ties to module_registry.moduleKey, a real existing module
  rationale: text('rationale').notNull(),
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_opportunity_candidate_dimension').on(table.dimension),
  index('idx_opportunity_candidate_rank').on(table.rankScore),
]);

// ── Competitor Benchmark (numeric), added 2026-09-14 -- backlog #4/25 ──
// Extends the pre-existing competitor_analysis table (qualitative research)
// with structured, admin-entered 0-100 scores per dimension, for both a
// real competitor AND TalentsHill itself (subjectType='self') on the same
// dimensions -- enabling a real head-to-head gap, not just narrative
// observations. Same honest "admin-entered, not scraped" discipline as
// competitor_campaign_observations.
export const competitorBenchmarkScore = sqliteTable('competitor_benchmark_score', {
  id: text('id').primaryKey(),
  subjectType: text('subject_type', { enum: ['competitor', 'self'] }).notNull(),
  competitorId: text('competitor_id').references(() => competitorAnalysis.id, { onDelete: 'cascade' }), // null when subjectType='self'
  dimension: text('dimension', { enum: ['pricing_value', 'service_breadth', 'digital_presence', 'thought_leadership', 'client_trust_signals', 'delivery_speed', 'innovation_ai_adoption', 'market_reach'] }).notNull(),
  score: integer('score').notNull(), // 0-100, real admin judgment
  notes: text('notes'),
  scoredBy: text('scored_by'),
  scoredAt: integer('scored_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_competitor_benchmark_score_competitor').on(table.competitorId),
  index('idx_competitor_benchmark_score_dimension').on(table.dimension),
  uniqueIndex('uq_competitor_benchmark_score_subject_dim').on(table.subjectType, table.competitorId, table.dimension),
]);

// ── Lead Next-Best-Action, added 2026-09-14 -- backlog #6/25 ──
// Structured, deterministic, stored recommendation -- distinct from the
// existing lead-qualification-agent.ts's free-text LLM narrative. One
// real row per real scoring run, computed by a real rule lookup in
// lib/contact/next-best-action.ts (never LLM-estimated).
export const leadNextBestAction = sqliteTable('lead_next_best_action', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull().references(() => contactSubmissions.id, { onDelete: 'cascade' }),
  action: text('action', { enum: ['schedule_call', 'send_pricing', 'request_budget_info', 'nurture_email', 'no_action_cold'] }).notNull(),
  reason: text('reason').notNull(),
  tier: text('tier').notNull(),
  score: integer('score').notNull(),
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_lead_nba_submission').on(table.submissionId),
  index('idx_lead_nba_action').on(table.action),
]);

// ── Growth Readiness Score, added 2026-09-14 -- backlog #7/25 ──
// Company-wide confidence-weighted composite over ALL real kpi_snapshot
// dimensions (extends the pre-existing analytics-health-pipeline.ts
// composite, which is scoped to the email/contact program only).
// Normalization targets in lib/kpi/growth-readiness.ts are disclosed,
// hardcoded business judgment.
export const growthReadinessSnapshot = sqliteTable('growth_readiness_snapshot', {
  id: text('id').primaryKey(),
  score: real('score'), // null when zero dimensions have real data
  dimensionsIncluded: integer('dimensions_included').notNull(),
  dimensionsExcluded: integer('dimensions_excluded').notNull(),
  confidence: text('confidence', { enum: ['unknown', 'low', 'medium', 'high'] }).notNull(),
  computedAt: integer('computed_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_growth_readiness_computed').on(table.computedAt),
]);

// ── GEO Visibility, added 2026-09-14 -- backlog #9/25 ──
// Real, admin-observed AI-answer-engine mention tracking. No AI-search-engine
// API integration exists or is invoked here -- confirmed absent via repo
// search before building. An admin manually runs a real query against a
// real AI engine and logs what they actually saw.
export const geoMentionObservation = sqliteTable('geo_mention_observation', {
  id: text('id').primaryKey(),
  engine: text('engine', { enum: ['chatgpt', 'perplexity', 'gemini', 'copilot', 'other'] }).notNull(),
  queryText: text('query_text').notNull(), // the real prompt the admin actually typed
  talentshillMentioned: integer('talentshill_mentioned', { mode: 'boolean' }).notNull(),
  mentionPosition: integer('mention_position'), // real 1-indexed position in the answer, null if not mentioned
  competitorsAlsoMentioned: text('competitors_also_mentioned'), // JSON array of real competitor names seen in the same answer
  notes: text('notes'),
  observedAt: integer('observed_at', { mode: 'timestamp' }).notNull(),
  observedBy: text('observed_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_geo_mention_engine').on(table.engine),
  index('idx_geo_mention_observed').on(table.observedAt),
]);
