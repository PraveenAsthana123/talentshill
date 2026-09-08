# Business Requirements Document (BRD)

## TalentsHill -- Enterprise AI & Marketing Platform

| Field | Value |
|-------|-------|
| Document Version | 1.0 |
| Date | 2026-02-14 |
| Status | Approved |
| Platform | Next.js 15 / TypeScript / SQLite / Drizzle ORM |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Stakeholders](#3-stakeholders)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Success Metrics](#6-success-metrics)
7. [Constraints and Assumptions](#7-constraints-and-assumptions)

---

## 1. Executive Summary

TalentsHill is a comprehensive enterprise platform designed for an AI consulting firm to manage its entire digital operations from a single self-hosted application. The platform consolidates the following capabilities under one roof:

- A public-facing marketing website with blog, services, industries, and solutions pages
- A full-featured Content Management System for articles, brochures, and presentations
- A CRM with contact management, lead scoring, segmentation, and campaign orchestration
- An email marketing engine with multi-profile SMTP, A/B testing, broadcasts, and granular event tracking
- An 8-step marketing automation workflow with approval chains and real-time monitoring
- A RAG (Retrieval-Augmented Generation) pipeline for document ingestion, embedding, and semantic search
- An AI analysis framework covering 35 assessment categories across AI governance, safety, ethics, and operations
- A chatbot system with AI-powered responses, session management, and message safety evaluation
- An integration hub connecting 11 third-party services (Slack, WhatsApp, LinkedIn, Facebook, Instagram, X, Gmail, Dropbox, Quora, Database, Webhook)
- A complete admin portal with 62 pages, role-based access control, feature flags, audit logging, and system health monitoring

The platform is built as a monolithic Next.js application backed by SQLite (via Drizzle ORM), comprising 79 database tables and 124 API routes. This architecture enables rapid deployment, simplified operations, and full data ownership.

---

## 2. Business Objectives

| ID | Objective | Description |
|----|-----------|-------------|
| BO-1 | Digital Marketing Automation | Automate the end-to-end marketing lifecycle from content creation through campaign delivery, tracking, and performance analysis, reducing manual effort and increasing campaign velocity. |
| BO-2 | AI Analysis & Consulting Tools | Provide structured frameworks for assessing AI systems across 35 categories (reliability, trustworthiness, safety, fairness, governance, etc.) to support consulting engagements and deliverables. |
| BO-3 | Content Management & Publishing | Centralize all content creation, versioning, and publishing across blogs, brochures, presentations, email templates, and social media copy. |
| BO-4 | CRM & Lead Management | Capture, score, segment, and nurture leads from multiple channels (contact forms, surveys, booking, newsletter, chat) with automated lead tiering and lifecycle tracking. |
| BO-5 | Client Engagement | Enable multi-channel client engagement through chatbot, WhatsApp, email, appointment booking, and AI readiness surveys. |
| BO-6 | Knowledge Management | Build and maintain a searchable knowledge base using RAG pipeline technology for powering chatbot responses and internal document retrieval. |
| BO-7 | Operational Efficiency | Provide a unified admin portal that eliminates the need for multiple SaaS tools, reducing subscription costs and data fragmentation. |
| BO-8 | Data Ownership & Privacy | Maintain full ownership of all client and operational data by self-hosting the platform with SQLite, avoiding third-party data dependencies. |

---

## 3. Stakeholders

| Role | Responsibility |
|------|---------------|
| Executive Leadership | Strategic direction, budget approval, ROI oversight |
| Marketing Team | Content creation, campaign execution, performance analysis, brand management |
| Sales Team | Lead follow-up, appointment management, CRM pipeline management |
| AI Consulting Team | Framework assessments, project scoring, client deliverable creation |
| Engineering Team | Platform development, maintenance, deployment, integration management |
| Content Authors | Blog posts, articles, brochure text, social media copy |
| System Administrators | User management, RBAC configuration, system health, feature flags |
| External Clients | Public website visitors, survey respondents, chatbot users, appointment bookers |

---

## 4. Functional Requirements

### FR-1: User Authentication & Role-Based Access Control

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Admin users must authenticate via email and password with bcrypt hashing | P0 |
| FR-1.2 | Sessions must use JWT tokens stored in secure HTTP-only cookies | P0 |
| FR-1.3 | All `/admin/*` routes must be protected by middleware-level authentication | P0 |
| FR-1.4 | The system must support three base user roles: admin, editor, viewer | P0 |
| FR-1.5 | RBAC must support custom roles with granular resource-action permissions | P0 |
| FR-1.6 | Users must be assignable to multiple roles | P0 |
| FR-1.7 | Groups must be supported for bulk role assignment | P1 |
| FR-1.8 | System roles (admin, editor, viewer) must be protected from deletion | P0 |
| FR-1.9 | Audit log must record all login, logout, and access events | P0 |
| FR-1.10 | Public admin paths (login page) must bypass authentication | P0 |

**Database tables:** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `groups`, `group_members`

---

### FR-2: Content Management System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Marketing content must support types: article, brochure_text, ppt_text, email_copy, social_post, landing_page | P0 |
| FR-2.2 | All content must follow a lifecycle: draft, review, approved, published, archived | P0 |
| FR-2.3 | Content versioning must track every edit with version number, author, and change notes | P0 |
| FR-2.4 | Brochures and presentations must be built as slide-based assets with a visual editor | P1 |
| FR-2.5 | Content assets must support draft, review, approved, and published statuses | P0 |
| FR-2.6 | Share links must be generated with unique short codes and full UTM parameter support (source, medium, campaign, term, content) | P0 |
| FR-2.7 | Share links must track click counts and support expiration dates | P0 |
| FR-2.8 | Content overrides must allow admin users to override any section of any public page without code changes | P1 |
| FR-2.9 | A media library must support file uploads with MIME type validation, tagging, folder organization, and metadata | P0 |
| FR-2.10 | The rich text editor must support HTML content with image embedding from the media library | P1 |

**Database tables:** `marketingContent`, `contentVersions`, `contentAssets`, `shareLinks`, `contentOverrides`, `media`

---

### FR-3: CRM & Contact Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Contacts must store email, name, company, phone, source, tags, custom fields, and lead score | P0 |
| FR-3.2 | Contact sources must be tracked: manual, import, contact_form, survey, booking, newsletter | P0 |
| FR-3.3 | Contacts must have lifecycle status: active, unsubscribed, bounced, inactive | P0 |
| FR-3.4 | Contact events must be logged for all interactions (email sent, opened, clicked, form submitted, etc.) | P0 |
| FR-3.5 | Static lists must allow manual addition and removal of contacts | P0 |
| FR-3.6 | Dynamic lists must support rule-based segmentation that auto-evaluates membership | P1 |
| FR-3.7 | CSV import must support column mapping, duplicate detection, and error reporting | P0 |
| FR-3.8 | Import jobs must track progress: total rows, processed, imported, duplicates, errors | P0 |
| FR-3.9 | Contacts must be searchable by email, name, company, status, source, and tags | P0 |
| FR-3.10 | Lead scoring must be automated based on engagement signals and contact attributes | P1 |

**Database tables:** `contacts`, `contactEvents`, `lists`, `listMembers`, `importJobs`

---

### FR-4: Email Campaign Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Email templates must support HTML content with variable substitution (merge tags) | P0 |
| FR-4.2 | Templates must be versioned with full change history | P0 |
| FR-4.3 | Campaigns must target audiences by list, segment, or all contacts | P0 |
| FR-4.4 | Campaigns must support A/B variant testing with configurable split percentages | P1 |
| FR-4.5 | Campaign lifecycle: draft, scheduled, sending, paused, completed, cancelled | P0 |
| FR-4.6 | Per-recipient tracking must record: pending, sent, delivered, opened, clicked, bounced, unsubscribed, failed | P0 |
| FR-4.7 | Email sending must support throttling (configurable messages per minute) | P0 |
| FR-4.8 | Broadcasts must support one-time email blasts with scheduling | P0 |
| FR-4.9 | Email profiles must support multiple SMTP configurations with from-name, from-email, reply-to, and signature | P0 |
| FR-4.10 | Event routing must map email event types to specific sender profiles | P1 |
| FR-4.11 | Unsubscribe must use tokenized one-click links that update contact status | P0 |
| FR-4.12 | Granular email events must be logged: sent, delivered, opened, clicked, bounced, complained, unsubscribed | P0 |
| FR-4.13 | Email compose must allow ad-hoc email sending outside of campaigns | P1 |

**Database tables:** `emailTemplates`, `emailTemplateVersions`, `campaigns`, `campaignRecipients`, `campaignVariants`, `emailMessages`, `emailEvents`, `broadcasts`, `unsubscribeTokens`, `emailProfiles`, `smtpConfigs`, `emailProfileSmtp`, `eventRoutes`

---

### FR-5: Marketing Automation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Marketing workflows must follow an 8-step wizard process | P0 |
| FR-5.2 | Step 1 -- Content: Create or select marketing content from the library | P0 |
| FR-5.3 | Step 2 -- Asset: Design brochure or presentation assets linked to the content | P0 |
| FR-5.4 | Step 3 -- Links: Generate share links with UTM parameters for the content/assets | P0 |
| FR-5.5 | Step 4 -- Audience: Select target list or segment for distribution | P0 |
| FR-5.6 | Step 5 -- Campaign: Build the email campaign with template and subject line | P0 |
| FR-5.7 | Step 6 -- Approval: Submit the workflow for approval by authorized users | P0 |
| FR-5.8 | Step 7 -- Schedule: Set the campaign delivery date and time | P0 |
| FR-5.9 | Step 8 -- Monitor: Track real-time delivery, opens, clicks, and performance metrics | P0 |
| FR-5.10 | Workflow comments must be supported at each step for collaboration | P1 |
| FR-5.11 | Approval chains must record approver identity and timestamp | P0 |
| FR-5.12 | Workflows must track current step, status, and all linked entity IDs | P0 |
| FR-5.13 | Dynamic audience segments must evaluate contact rules for targeting | P1 |

**Database tables:** `marketingWorkflows`, `workflowComments`

---

### FR-6: AI Analysis Framework

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | The system must support 35 analysis framework categories | P0 |
| FR-6.2 | Each framework must define a set of named analysis types (assessment items) | P0 |
| FR-6.3 | Framework categories must cover the following domains: | P0 |
| | -- Reliability: Reliable AI (18 items) | |
| | -- Trust: Trustworthy AI, Trust AI (18 items each) | |
| | -- Safety: Safe AI, Threat AI (18 items each) | |
| | -- Accountability: Accountable AI (18 items) | |
| | -- Auditability: Auditable AI (18 items) | |
| | -- Lifecycle: Model Lifecycle, Fine-Tuning Analysis (18 items each) | |
| | -- Monitoring: Monitoring & Drift (18 items) | |
| | -- Sustainability: Sustainable/Green AI, Energy-Efficient AI, Environmental Impact AI | |
| | -- Responsible AI: Responsible GenAI, Responsible AI, Ethical AI | |
| | -- Debugging: Debug AI (18 items) | |
| | -- Portability: Portability AI (18 items) | |
| | -- Explainability: Interpretable AI, Explainable AI, Interpretability AI | |
| | -- Fairness: Fairness AI (18 items) | |
| | -- Causality: Mechanistic & Causal AI (18 items) | |
| | -- Human Factors: Human-Centered AI, Human-in-the-Loop AI | |
| | -- Transparency: Transparent Data AI (18 items) | |
| | -- Social Impact: Social AI (18 items) | |
| | -- Compliance: Compliance AI (18 items) | |
| | -- Privacy: Privacy-Preserving AI (18 items) | |
| | -- Risk: Long-Term Risk AI, Sensitivity Analysis AI | |
| | -- Governance: Governance AI (18 items) | |
| | -- Security: Secure AI (18 items) | |
| | -- Accuracy: Hallucination Prevention AI (18 items) | |
| | -- Research: Hypothesis AI (18 items) | |
| FR-6.4 | Assessments must be created per project, linked to a specific framework | P0 |
| FR-6.5 | Each assessment must track item-level scores (JSON array) with overall score computation | P0 |
| FR-6.6 | Assessment status must follow: not_started, in_progress, completed | P0 |
| FR-6.7 | Assessments must track assessor identity, completed items vs total items, and metadata | P0 |
| FR-6.8 | The analysis hub must display all 35 frameworks with item counts and descriptions | P0 |
| FR-6.9 | Project view must list all assessments for a given project across frameworks | P1 |

**Database tables:** `analysisFrameworks`, `analysisAssessments`

---

### FR-7: RAG Pipeline

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Document ingestion must support three source types: file upload, URL, and site page | P0 |
| FR-7.2 | Documents must track status through the pipeline: pending, ingested, chunked, embedded, failed | P0 |
| FR-7.3 | Text chunking must be configurable (chunk size, overlap) with token counting and content deduplication via hashing | P0 |
| FR-7.4 | Embedding must support multiple models with dimension tracking | P0 |
| FR-7.5 | Vector storage must serialize embeddings as JSON float arrays | P0 |
| FR-7.6 | Semantic search must retrieve relevant chunks based on query embedding similarity | P0 |
| FR-7.7 | Query caching must store results by query hash with hit counting and TTL-based expiration | P1 |
| FR-7.8 | Pipeline runs must track type (ingestion, embedding, evaluation, retrieval), status, and duration | P0 |
| FR-7.9 | Each run must log individual steps with status, input/output, and duration | P0 |
| FR-7.10 | Run metrics must capture: faithfulness, relevance, precision, recall, PII detection, chunk quality (0-1 scale) | P0 |
| FR-7.11 | PII detection must scan document content before storage | P0 |
| FR-7.12 | Pipeline configuration must be versioned with activation tracking | P1 |
| FR-7.13 | The admin RAG dashboard must show document counts, run history, and search interface | P0 |

**Database tables:** `ragDocuments`, `ragChunks`, `ragEmbeddings`, `ragCache`, `ragRuns`, `ragRunSteps`, `ragRunMetrics`, `ragConfigs`

---

### FR-8: Chatbot Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-8.1 | Visitor chat sessions must be created with unique session tokens | P0 |
| FR-8.2 | Sessions must capture visitor email, name, IP hash, and user agent | P0 |
| FR-8.3 | Chat requests must be created within sessions with subject, category, priority, and assignment | P0 |
| FR-8.4 | Request lifecycle: new, triaged, responding, waiting_user, resolved, closed | P0 |
| FR-8.5 | Priority levels must be supported: low, medium, high, urgent | P0 |
| FR-8.6 | Messages must track role (user, assistant, system) with edit history | P0 |
| FR-8.7 | AI responses must be generated using the RAG pipeline for context-aware answers | P1 |
| FR-8.8 | Message evaluations must score on: PII detection, toxicity, bias, safety, compliance (0-100 scale with pass/fail) | P0 |
| FR-8.9 | Admin notes must be attachable to chat requests and sessions | P1 |
| FR-8.10 | Chat requests must be assignable to admin users | P0 |
| FR-8.11 | The public chatbot widget must be embeddable on all public pages | P0 |

**Database tables:** `chatSessions`, `chatRequests`, `chatMessages`, `chatMessageEvals`, `adminNotes`

---

### FR-9: Integration Hub

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-9.1 | The system must support 11 integration providers: Slack, WhatsApp, LinkedIn, Facebook, Instagram, X (Twitter), Gmail, Dropbox, Quora, Database, Webhook | P0 |
| FR-9.2 | Each provider must define a configuration schema (JSON) for setup parameters | P0 |
| FR-9.3 | Integration accounts must track connection status: connected, disconnected, error | P0 |
| FR-9.4 | Credentials must be stored encrypted with expiration date tracking | P0 |
| FR-9.5 | All integration API calls must be logged with action, status, request/response payload, and duration | P0 |
| FR-9.6 | Webhooks must support event filtering, secret-based authentication, failure counting, and active/inactive status | P1 |
| FR-9.7 | Provider adapters must implement a common interface defined in the integration registry | P0 |
| FR-9.8 | Integration categories must be supported: messaging, social, productivity, data, webhook | P0 |
| FR-9.9 | Integration accounts must record last sync timestamp and error messages | P0 |

**Database tables:** `integrations`, `integrationAccounts`, `integrationCredentials`, `integrationLogs`, `webhooks`

---

### FR-10: Blog & Content Publishing

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-10.1 | Blog posts must support Markdown content with front-matter metadata | P0 |
| FR-10.2 | Posts must have lifecycle status: draft, published, archived | P0 |
| FR-10.3 | Posts must support categories (with color badges), tags, and author attribution | P0 |
| FR-10.4 | Featured posts must be flaggable for homepage promotion | P1 |
| FR-10.5 | Blog views must be tracked per post and session for analytics | P0 |
| FR-10.6 | Newsletter subscribers must be managed with subscribe/unsubscribe lifecycle | P0 |
| FR-10.7 | RSS feed must be auto-generated from published posts | P0 |
| FR-10.8 | SEO metadata (meta title, meta description) must be configurable per post | P0 |
| FR-10.9 | Videos must be managed with title, summary, URL, provider, thumbnail, tags, category, and sort order | P0 |
| FR-10.10 | Services and industries must support admin CRUD with slug-based routing, descriptions, icons, and sort order | P0 |

**Database tables:** `blogPosts`, `blogAuthors`, `blogCategories`, `blogTags`, `blogPostCategories`, `blogPostTags`, `blogViews`, `blogSubscribers`, `videos`, `services`, `industries`

---

### FR-11: Analytics & Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-11.1 | Lead dashboard must display all contact form submissions with lead score, tier, status, and industry filters | P0 |
| FR-11.2 | Lead scoring must automatically assign tiers: hot, warm, cool, cold | P0 |
| FR-11.3 | Lead lifecycle must track: new, contacted, qualified, closed | P0 |
| FR-11.4 | Survey analytics must aggregate responses by maturity level, industry, and company size | P0 |
| FR-11.5 | AI readiness survey must calculate total score and maturity level (beginner, developing, advanced, leader) | P0 |
| FR-11.6 | Campaign analytics must show: total sent, opened, clicked, bounced, unsubscribed per campaign | P0 |
| FR-11.7 | Email event analytics must support time-series views of delivery, engagement, and bounce rates | P1 |
| FR-11.8 | The admin dashboard must display aggregated KPIs: total contacts, active campaigns, recent leads, pending chat requests | P0 |
| FR-11.9 | Audit log must record all create, update, delete, login, and logout events with entity type, entity ID, user, and metadata | P0 |
| FR-11.10 | Share link analytics must track click counts per link with UTM attribution | P1 |

**Database tables:** `contactSubmissions`, `surveyResponses`, `surveyAnswers`, `emailEvents`, `emailMessages`, `auditLog`, `blogViews`, `shareLinks`

---

### FR-12: System Administration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-12.1 | System health endpoint must report database connectivity and application status | P0 |
| FR-12.2 | Site settings must be stored as key-value pairs with update tracking | P0 |
| FR-12.3 | Feature flags must support module-level toggles with versioning and activation history | P0 |
| FR-12.4 | Feature flags must support: key, label, description, module, enabled/disabled, sort order | P0 |
| FR-12.5 | Feature flag guard middleware must cache flag state and check before rendering protected features | P0 |
| FR-12.6 | Banners must support placement (top, bottom, modal, inline), severity (info, success, warning, error), scheduling, and CTA | P1 |
| FR-12.7 | Maintenance mode must be toggleable from admin with a dedicated public maintenance page | P1 |
| FR-12.8 | Job queue must support: priority, max retries, scheduling, pause/resume, and per-run logging | P0 |
| FR-12.9 | Job types must include: campaign sending, broadcast sending, contact import, RAG pipeline execution | P0 |
| FR-12.10 | Operations console (Runs) must provide a unified view of all running operations: campaigns, broadcasts, imports, surveys | P0 |
| FR-12.11 | Run events must log each milestone in an operation's lifecycle | P0 |
| FR-12.12 | Appointment management must support status tracking: pending, confirmed, completed, cancelled | P1 |
| FR-12.13 | Tracking pixel API must capture email open events via 1x1 transparent image | P0 |
| FR-12.14 | Link redirect API must capture click events and redirect to original URLs | P0 |

**Database tables:** `siteSettings`, `featureFlags`, `featureFlagVersions`, `featureFlagActive`, `banners`, `jobs`, `jobRuns`, `jobLogs`, `runs`, `runEvents`

---

## 5. Non-Functional Requirements

### NFR-1: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-1.1 | Public page load time (server-rendered) | < 2 seconds |
| NFR-1.2 | Admin API response time (CRUD operations) | < 500ms |
| NFR-1.3 | Email campaign throughput | Configurable throttle (default 60/min) |
| NFR-1.4 | RAG semantic search latency | < 3 seconds per query |
| NFR-1.5 | Database must use WAL mode for concurrent read performance | Required |
| NFR-1.6 | All database query columns used in WHERE and ORDER BY must be indexed | Required |
| NFR-1.7 | All list API endpoints must support pagination (offset + limit) | Required |

### NFR-2: Security

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-2.1 | Passwords must be hashed with bcrypt | Required |
| NFR-2.2 | Admin sessions must use JWT with configurable secret | Required |
| NFR-2.3 | Integration credentials must be stored encrypted | Required |
| NFR-2.4 | SMTP passwords must be stored encrypted | Required |
| NFR-2.5 | IP addresses must be stored as hashes (never plaintext) | Required |
| NFR-2.6 | Rate limiting must be enforced on public form submission endpoints | Required |
| NFR-2.7 | Input sanitization must be applied to all user-submitted content | Required |
| NFR-2.8 | RBAC must be enforced at the API route level | Required |
| NFR-2.9 | Unsubscribe links must use unique, single-use tokens | Required |

### NFR-3: Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-3.1 | Database must support up to 100,000 contacts | Required |
| NFR-3.2 | Email campaign must support up to 50,000 recipients per campaign | Required |
| NFR-3.3 | RAG pipeline must handle documents up to 50MB per file | Required |
| NFR-3.4 | Blog must support up to 10,000 published posts | Required |
| NFR-3.5 | Audit log must support retention policy for long-term storage | Recommended |

### NFR-4: Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-4.1 | Application must be deployable as a single Node.js process | Required |
| NFR-4.2 | SQLite database must be backed up daily | Recommended |
| NFR-4.3 | Failed background jobs must retry with configurable max attempts | Required |
| NFR-4.4 | Maintenance mode must gracefully redirect all public traffic | Required |
| NFR-4.5 | Chat sessions must persist across page navigations | Required |

### NFR-5: Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-5.1 | Admin portal must be responsive (desktop + tablet) | Required |
| NFR-5.2 | Admin sidebar must support collapsible navigation groups | Required |
| NFR-5.3 | Public site must support dark/light theme toggle | Required |
| NFR-5.4 | All forms must provide real-time validation feedback (Zod schemas) | Required |
| NFR-5.5 | Toast notifications must be used for all success/error feedback | Required |
| NFR-5.6 | Cookie consent must be displayed to all first-time visitors (GDPR) | Required |

### NFR-6: Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-6.1 | All database operations must go through typed Drizzle ORM queries | Required |
| NFR-6.2 | Query files must be organized by domain (one file per table group) | Required |
| NFR-6.3 | TypeScript strict mode must be enforced | Required |
| NFR-6.4 | Schema changes must be managed through Drizzle Kit migrations | Required |
| NFR-6.5 | Seed files must be idempotent (safe to re-run) | Required |
| NFR-6.6 | Unit tests must be maintained with Vitest | Required |

---

## 6. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Marketing campaign delivery rate | > 95% | Campaign analytics (sent vs failed) |
| Email open rate | > 20% | Email event tracking |
| Email click-through rate | > 3% | Email event tracking |
| Lead capture from public forms | > 50 leads/month | Contact submissions count |
| Survey completion rate | > 40% of starters | Survey responses vs page visits |
| Chatbot resolution rate | > 60% auto-resolved | Chat requests closed without human |
| Admin portal page load | < 3 seconds | Browser performance monitoring |
| RAG retrieval relevance | > 0.7 (faithfulness + relevance) | RAG run metrics |
| AI assessment completion rate | > 80% per project | Analysis assessment progress |
| System uptime | > 99.5% | Health endpoint monitoring |
| Content publishing cadence | > 4 blog posts/month | Blog post creation tracking |
| Integration connectivity | > 95% uptime per connected account | Integration log success rate |

---

## 7. Constraints and Assumptions

### Constraints

| ID | Constraint |
|----|-----------|
| C-1 | The platform must run as a single Node.js process (no distributed architecture required). |
| C-2 | SQLite is the only supported database engine; no PostgreSQL or MySQL migration is planned. |
| C-3 | The platform is designed for a single-tenant deployment (one organization per instance). |
| C-4 | Email sending depends on external SMTP servers; no built-in mail transfer agent is included. |
| C-5 | AI chatbot responses require an external LLM API provider (OpenAI or compatible). |
| C-6 | RAG vector search uses brute-force similarity on JSON-serialized vectors; no dedicated vector database is used. |
| C-7 | File uploads are stored on the local filesystem; no cloud storage integration (S3) is included in initial release. |
| C-8 | The admin portal is client-side rendered (CSR); it is not optimized for SEO. |
| C-9 | The platform does not include payment processing or e-commerce functionality. |
| C-10 | Maximum concurrent admin users is limited by SQLite write concurrency (WAL mode mitigates but does not eliminate). |

### Assumptions

| ID | Assumption |
|----|-----------|
| A-1 | The organization has access to at least one SMTP server for email delivery. |
| A-2 | Admin users have modern browsers (Chrome, Firefox, Safari, Edge -- last 2 major versions). |
| A-3 | The deployment environment provides Node.js 18+ runtime. |
| A-4 | The organization will provide content (blog posts, service descriptions, industry pages) for the initial launch. |
| A-5 | Integration provider API credentials (Slack tokens, social media API keys) will be obtained by the organization. |
| A-6 | The AI analysis frameworks (35 categories) are seeded during initial deployment and updated via code releases. |
| A-7 | The RAG pipeline's embedding model will be selected based on the organization's AI infrastructure (self-hosted or cloud API). |
| A-8 | Survey questions are maintained in a static JSON file and updated through code releases. |
| A-9 | Appointment scheduling uses JSON file storage; high-volume booking scenarios may require migration to SQLite. |
| A-10 | The public website will be served over HTTPS in production with a valid SSL certificate. |

---

## Appendix A: Database Table Summary

The platform uses 79 SQLite tables organized into the following domains:

| Domain | Tables | Count |
|--------|--------|-------|
| Blog | blog_authors, blog_categories, blog_tags, blog_posts, blog_post_categories, blog_post_tags, blog_views, blog_subscribers | 8 |
| Users & RBAC | users, roles, permissions, role_permissions, user_roles, groups, group_members | 7 |
| CRM Contacts | contacts, contact_events, lists, list_members, import_jobs | 5 |
| Email Campaigns | campaigns, campaign_recipients, campaign_variants, email_messages, email_events, broadcasts, unsubscribe_tokens | 7 |
| Email Config | email_templates, email_template_versions, email_profiles, smtp_configs, email_profile_smtp, event_routes | 6 |
| Marketing | marketing_content, content_versions, content_assets, share_links, marketing_workflows, workflow_comments | 6 |
| RAG Pipeline | rag_documents, rag_chunks, rag_embeddings, rag_cache, rag_runs, rag_run_steps, rag_run_metrics, rag_configs | 8 |
| Chat | chat_sessions, chat_requests, chat_messages, chat_message_evals, admin_notes | 5 |
| AI Analysis | analysis_frameworks, analysis_assessments | 2 |
| Integrations | integrations, integration_accounts, integration_credentials, integration_logs, webhooks | 5 |
| Jobs & Operations | jobs, job_runs, job_logs, runs, run_events | 5 |
| System | site_settings, audit_log, feature_flags, feature_flag_versions, feature_flag_active, media, banners, content_overrides | 8 |
| Public | contact_submissions, survey_responses, survey_answers, videos, services, industries | 6 |
| **Total** | | **79** |

---

## Appendix B: API Route Summary

The platform exposes 124 API routes organized as follows:

| Category | Prefix | Description |
|----------|--------|-------------|
| Authentication | `/api/auth/*` | Login, logout, session check |
| Public | `/api/blog/*`, `/api/contact/*`, `/api/newsletter/*`, `/api/survey/*`, `/api/chat/*`, `/api/careers/*`, `/api/demo/*`, `/api/appointments/*` | Public-facing form submissions and data access |
| Tracking | `/api/t/*`, `/api/s/*` | Email pixel tracking and share link redirects |
| Admin CRUD | `/api/admin/*` | Protected endpoints for all admin operations (contacts, campaigns, content, RAG, analysis, integrations, settings, etc.) |
| Banners | `/api/banners/*` | Public banner retrieval |

All admin API routes require a valid JWT session token in the `admin_session` cookie.
