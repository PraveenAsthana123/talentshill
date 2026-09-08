// === Common Types ===

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SocialLinks {
  whatsapp?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

// === Blog ===
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  category: string;
  summary: string;
  coverImage: string;
  author: string;
  readingTime: string;
  content: string;
}

export interface BlogPostMeta extends Omit<BlogPost, 'content'> {}

// === Careers ===
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  posted: string;
  summary: string;
  description: string;
  requirements: string[];
  niceToHave?: string[];
  benefits?: string[];
}

export interface JobApplication {
  jobId: string;
  name: string;
  email: string;
  linkedin?: string;
  portfolio?: string;
  resumeFileName?: string;
  coverLetter?: string;
}

// === Forms ===
export interface ContactFormData {
  name: string;
  email: string;
  company: string;
  industry: string;
  message: string;
  budgetRange: string;
  timeline: string;
}

export interface DemoFormData {
  name: string;
  email: string;
  company: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  useCase: string;
  platform: string;
  notes?: string;
}

export interface NewsletterFormData {
  email: string;
}

// === Chatbot ===
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

// === Survey ===
export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  category: string;
}

export interface SurveyAnswer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResult {
  id: string;
  answers: SurveyAnswer[];
  score: number;
  level: 'beginner' | 'developing' | 'advanced' | 'leader';
  completedAt: string;
}

// === Blog DB Types ===
export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: string | null;
}

export interface BlogSubscriber {
  id: string;
  email: string;
  status: string;
  subscribedAt: string;
}

export interface BlogAdminStats {
  totalPosts: number;
  published: number;
  drafts: number;
  totalViews: number;
  subscriberCount: number;
  topPosts: { title: string; slug: string; views: number }[];
}

// === Admin User ===
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  createdAt: string;
}

// === Contact Submission ===
export interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string;
  role: string | null;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange: string | null;
  timeline: string;
  message: string;
  consent: boolean;
  leadScore: number;
  leadTier: 'hot' | 'warm' | 'cool' | 'cold';
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt: string;
}

// === Survey Response DB ===
export interface SurveyResponseDB {
  id: string;
  contactName: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  companySize: string | null;
  role: string | null;
  totalScore: number;
  maturityLevel: 'beginner' | 'developing' | 'advanced' | 'leader';
  recommendedPath: string | null;
  segmentationTags: string[];
  createdAt: string;
}

// === Audit Log ===
export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  userId: string | null;
  userName?: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// === Site Setting ===
export interface SiteSetting {
  key: string;
  value: unknown;
  updatedBy: string | null;
  updatedAt: string;
}

// === Demo ===
export interface DemoItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  status: 'live' | 'coming-soon' | 'beta';
}

// === Video ===
export interface VideoItem {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  embedUrl: string;
  thumbnail?: string;
  duration?: string;
}

// === RBAC ===
export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  permissionCount?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface UserWithRoles extends AdminUser {
  roles: { id: string; name: string }[];
  permissions?: Permission[];
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  memberCount?: number;
}

// === Feature Flags ===
export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  module: string | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagVersion {
  id: string;
  flagId: string;
  version: number;
  config: string | null;
  changedBy: string | null;
  changedAt: string;
}

// === Job Queue ===
export interface JobRecord {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  payload: string | null;
  priority: number;
  maxRetries: number;
  attempts: number;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface JobRun {
  id: string;
  jobId: string;
  attempt: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  result: string | null;
  error: string | null;
}

export interface JobLog {
  id: string;
  jobId: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata: string | null;
  createdAt: string;
}

// === Email Profiles ===
export interface EmailProfile {
  id: string;
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  signature: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  isActive: boolean;
  createdAt: string;
}

export interface EventRoute {
  id: string;
  eventType: string;
  profileId: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string;
}

// === Media ===
export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  alt: string | null;
  tags: string | null;
  folder: string | null;
  uploadedBy: string | null;
  isActive: boolean;
  createdAt: string;
}

// === Banner ===
export interface Banner {
  id: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'modal' | 'inline';
  severity: 'info' | 'success' | 'warning' | 'error';
  ctaText: string | null;
  ctaUrl: string | null;
  mediaId: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  priority: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// === CRM ===
export interface CrmContact {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  phone: string | null;
  source: string;
  tags: string | null;
  customFields: string | null;
  leadScore: number;
  status: 'active' | 'unsubscribed' | 'bounced' | 'inactive';
  subscribedAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactEvent {
  id: string;
  contactId: string;
  eventType: string;
  metadata: string | null;
  createdAt: string;
}

export interface ContactList {
  id: string;
  name: string;
  description: string | null;
  type: 'static' | 'dynamic';
  segmentRules: string | null;
  memberCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Email Templates ===
export interface EmailTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  variables: string | null;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  changedBy: string | null;
  changedAt: string;
}

// === Campaigns ===
export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'cancelled';
  audienceType: 'list' | 'segment' | 'all';
  audienceId: string | null;
  audienceCount: number;
  emailProfileId: string | null;
  templateId: string | null;
  subject: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  throttlePerMinute: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  contactId: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'failed';
  messageId: string | null;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  error: string | null;
}

export interface CampaignVariant {
  id: string;
  campaignId: string;
  name: string;
  subject: string | null;
  templateId: string | null;
  percentage: number;
  recipientCount: number;
  openCount: number;
  clickCount: number;
}

// === Email Tracking ===
export interface EmailMessage {
  id: string;
  recipientId: string | null;
  contactId: string;
  campaignId: string | null;
  profileId: string | null;
  subject: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'failed';
  sentAt: string | null;
  messageId: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface UnsubscribeToken {
  id: string;
  contactId: string;
  token: string;
  campaignId: string | null;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
}

// === Operations ===
export interface Run {
  id: string;
  type: string;
  entityId: string | null;
  name: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  config: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface RunEvent {
  id: string;
  runId: string;
  eventType: string;
  message: string;
  metadata: string | null;
  createdAt: string;
}

export interface ContentOverride {
  id: string;
  pageSlug: string;
  section: string;
  key: string;
  value: string | null;
  isActive: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

// === Email Events ===
export interface EmailEvent {
  id: string;
  emailMessageId: string | null;
  recipientId: string | null;
  contactId: string;
  campaignId: string | null;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  linkUrl: string | null;
  metadata: string | null;
  createdAt: string;
}

// === Import Jobs ===
export interface ImportJob {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  importedCount: number;
  duplicateCount: number;
  errorCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  columnMapping: string | null;
  errors: string | null;
  createdBy: string | null;
  createdAt: string;
  completedAt: string | null;
}

// === Chat ===
export interface ChatSession {
  id: string;
  visitorEmail: string | null;
  visitorName: string | null;
  sessionToken: string;
  ipHash: string | null;
  userAgent: string | null;
  status: 'active' | 'closed';
  emailCapturedAt: string | null;
  startedAt: string;
  lastMessageAt: string | null;
  metadata: string | null;
}

export interface ChatRequest {
  id: string;
  sessionId: string;
  contactId: string | null;
  subject: string | null;
  category: string | null;
  status: 'new' | 'triaged' | 'responding' | 'waiting_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDB {
  id: string;
  sessionId: string;
  requestId: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: string | null;
  isEdited: boolean;
  editedBy: string | null;
  createdAt: string;
}

export interface ChatMessageEval {
  id: string;
  messageId: string;
  evalType: 'pii' | 'toxicity' | 'bias' | 'safety' | 'compliance';
  score: number | null;
  passed: boolean;
  details: string | null;
  evaluatedAt: string;
}

export interface AdminNote {
  id: string;
  entityType: 'chat_request' | 'chat_session' | 'contact';
  entityId: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

// === Broadcasts ===
export interface Broadcast {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  profileId: string | null;
  audienceType: string;
  audienceId: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed';
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  throttlePerMinute: number;
  totalSent: number;
  totalFailed: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// === Integrations ===
export interface Integration {
  id: string;
  providerKey: string;
  name: string;
  description: string | null;
  category: 'messaging' | 'social' | 'productivity' | 'data' | 'webhook';
  iconUrl: string | null;
  isAvailable: boolean;
  configSchema: string | null;
  createdAt: string;
}

export interface IntegrationAccount {
  id: string;
  integrationId: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  credentials: string | null;
  settings: string | null;
  connectedBy: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  errorMessage: string | null;
}

export interface IntegrationCredential {
  id: string;
  accountId: string;
  key: string;
  value: string;
  expiresAt: string | null;
}

export interface IntegrationLog {
  id: string;
  accountId: string;
  action: string;
  status: 'success' | 'error';
  request: string | null;
  response: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface Webhook {
  id: string;
  accountId: string | null;
  name: string;
  url: string;
  secret: string | null;
  events: string | null;
  isActive: boolean;
  lastTriggeredAt: string | null;
  failCount: number;
  createdBy: string | null;
  createdAt: string;
}

// ── RAG Pipeline ──

export interface RagDocument {
  id: string;
  name: string;
  sourceType: 'upload' | 'url' | 'sitepage';
  sourceUrl: string | null;
  filePath: string | null;
  mimeType: string | null;
  size: number | null;
  status: 'pending' | 'ingested' | 'chunked' | 'embedded' | 'failed';
  chunkCount: number;
  metadata: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RagChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number | null;
  metadata: string | null;
  hash: string | null;
  createdAt: string;
}

export interface RagEmbedding {
  id: string;
  chunkId: string;
  model: string;
  dimensions: number;
  vector: string;
  createdAt: string;
}

export interface RagCache {
  id: string;
  queryHash: string;
  query: string;
  results: string;
  hitCount: number;
  createdAt: string;
  expiresAt: string | null;
}

export interface RagRun {
  id: string;
  type: 'ingestion' | 'embedding' | 'evaluation' | 'retrieval';
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: string | null;
  documentIds: string | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface RagRunStep {
  id: string;
  runId: string;
  stepName: string;
  status: string;
  input: string | null;
  output: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface RagRunMetric {
  id: string;
  runId: string;
  metricName: string;
  value: number;
  details: string | null;
  createdAt: string;
}

export interface RagConfig {
  id: string;
  name: string;
  version: number;
  config: string;
  isActive: boolean;
  changedBy: string | null;
  createdAt: string;
}

export interface PiiMatch {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'ip';
  value: string;
  start: number;
  end: number;
}

// ── Marketing Content ──

export interface MarketingContent {
  id: string;
  title: string;
  slug: string;
  contentType: 'article' | 'brochure_text' | 'ppt_text' | 'email_copy' | 'social_post' | 'landing_page';
  body: string;
  excerpt: string | null;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  tags: string[];
  category: string | null;
  coverImage: string | null;
  authorId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface ContentVersion {
  id: string;
  contentId: string;
  versionNumber: number;
  title: string;
  body: string;
  changedBy: string | null;
  changeNote: string | null;
  createdAt: Date;
}

export interface ContentAssetSlide {
  index: number;
  title: string;
  htmlContent: string;
  layout: 'full' | 'two-column' | 'image-left' | 'image-right';
  notes?: string;
}

export interface ContentAsset {
  id: string;
  contentId: string | null;
  assetType: 'brochure' | 'presentation';
  title: string;
  description: string | null;
  slides: ContentAssetSlide[];
  status: 'draft' | 'review' | 'approved' | 'published';
  coverImage: string | null;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLink {
  id: string;
  contentId: string | null;
  assetId: string | null;
  campaignId: string | null;
  title: string;
  originalUrl: string;
  shortCode: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickCount: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface MarketingWorkflow {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'pending_approval' | 'approved' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  currentStep: number;
  contentId: string | null;
  assetId: string | null;
  shareLinkIds: string[];
  listId: string | null;
  campaignId: string | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowComment {
  id: string;
  workflowId: string;
  userId: string | null;
  content: string;
  stepIndex: number | null;
  createdAt: Date;
}

// ── Analysis Frameworks ──

export interface AnalysisFramework {
  id: string;
  categoryKey: string;
  categoryName: string;
  description: string | null;
  analysisTypes: { index: number; name: string }[];
  totalItems: number;
  sortOrder: number;
  createdAt: Date;
}

export interface AnalysisItemScore {
  itemIndex: number;
  itemName: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'not_applicable';
  score: number | null;
  notes: string;
  updatedAt: string | null;
}

export interface AnalysisAssessment {
  id: string;
  frameworkId: string;
  projectName: string;
  assessorId: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  overallScore: number | null;
  completedItems: number;
  totalItems: number;
  itemScores: AnalysisItemScore[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
