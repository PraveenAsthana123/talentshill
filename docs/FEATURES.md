# TalentsHill Enterprise Admin Portal -- Feature Documentation

> **Stack**: Next.js 14+ (App Router) | SQLite with Drizzle ORM | 79 tables | 124 API routes | 62 admin pages
>
> This document provides comprehensive documentation of every feature in the TalentsHill admin portal.

---

## Table of Contents

1. [Authentication and Access Control](#1-authentication-and-access-control)
2. [Content Management System](#2-content-management-system)
3. [CRM and Contact Management](#3-crm-and-contact-management)
4. [Email Campaign Engine](#4-email-campaign-engine)
5. [Marketing Automation](#5-marketing-automation)
6. [AI Analysis Framework](#6-ai-analysis-framework)
7. [RAG Pipeline](#7-rag-pipeline)
8. [Chatbot Management](#8-chatbot-management)
9. [Integration Hub](#9-integration-hub)
10. [Blog and Media](#10-blog-and-media)
11. [Analytics and Reporting](#11-analytics-and-reporting)
12. [System Administration](#12-system-administration)

---

## 1. Authentication and Access Control

### 1.1 JWT Session Management

Authentication is handled through JWT tokens stored in HTTP-only cookies. The system uses the `jose` library for token signing and verification.

**Session Payload Structure:**

| Field   | Type                            | Description                   |
|---------|---------------------------------|-------------------------------|
| userId  | string                          | Unique user identifier        |
| email   | string                          | User email address            |
| name    | string                          | Display name                  |
| role    | `admin` / `editor` / `viewer`   | Legacy role field             |
| roles   | string[]                        | RBAC role names               |

**Key behaviors:**
- Tokens are signed with HS256 using `SESSION_SECRET` from environment
- Token expiration: 24 hours
- Cookies are set with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production
- The Next.js middleware (`middleware.ts`) intercepts all `/admin/*` paths and redirects unauthenticated users to `/admin/login`
- Public admin paths (`/admin/login`) are excluded from auth checks

**Files:**
- `/middleware.ts` -- Edge middleware for route protection
- `/lib/security/session.ts` -- Token signing, verification, cookie extraction
- `/lib/security/rbac.ts` -- Permission checking, session user ID extraction
- `/app/api/auth/login/route.ts` -- Login endpoint
- `/app/api/auth/logout/route.ts` -- Logout endpoint
- `/app/api/auth/session/route.ts` -- Session validation endpoint

### 1.2 Role-Based Access Control (RBAC)

A full RBAC system with roles, permissions, groups, and user-role mappings.

**Database Tables:**

| Table              | Purpose                                       |
|--------------------|-----------------------------------------------|
| `users`            | Admin users with email, password hash, role    |
| `roles`            | Named roles (e.g., admin, editor, viewer)      |
| `permissions`      | Resource-action pairs (e.g., `contacts:read`)  |
| `role_permissions`  | Maps roles to permissions                     |
| `user_roles`       | Maps users to roles with assignment timestamp  |
| `groups`           | Named groups for organizational grouping       |
| `group_members`    | Maps users to groups                           |

**Permission Model:**
- Permissions are defined as `resource` + `action` pairs
- The `withPermission(resource, action)` higher-order function wraps API route handlers to enforce permissions
- The `hasPermission(userId, resource, action)` function queries the role-permission chain
- System roles (flagged with `isSystem`) cannot be deleted

**Admin Pages:**
- `/admin/users` -- User CRUD, activation/deactivation
- `/admin/roles` -- Role management, permission assignment

### 1.3 Login and Logout

**Login Flow:**
1. Rate limiting check per client IP (`authLimiter`)
2. Email normalization and validation
3. User lookup by email
4. Password verification using bcrypt (`verifyPassword`)
5. Account active status check
6. RBAC role retrieval
7. JWT token generation and cookie set
8. Audit log entry for success or failure

**Failure Responses:**
- `429` -- Too many login attempts (rate limited)
- `400` -- Missing email or password
- `401` -- Invalid credentials
- `403` -- Account deactivated

### 1.4 Audit Logging

Every significant action is recorded in the `audit_log` table.

| Field       | Description                                          |
|-------------|------------------------------------------------------|
| entityType  | `user`, `post`, `contact`, `survey`, `setting`, `video`, `service`, `industry`, `auth` |
| entityId    | ID of the affected entity                            |
| action      | `create`, `update`, `delete`, `login_success`, `login_failed`, `logout` |
| userId      | Who performed the action                             |
| metadata    | JSON string with additional context                  |
| createdAt   | Timestamp of the event                               |

Indexed on `(entityType, entityId)`, `userId`, and `createdAt` for efficient querying.

---

## 2. Content Management System

### 2.1 Content Types

The `marketing_content` table supports six content types:

| Content Type    | Description                                    |
|-----------------|------------------------------------------------|
| `article`       | Long-form written content                      |
| `brochure_text` | Text content destined for brochure assets      |
| `ppt_text`      | Text content destined for presentation assets  |
| `email_copy`    | Email body copy for campaigns                  |
| `social_post`   | Social media post copy                         |
| `landing_page`  | Landing page content                           |

### 2.2 Content Lifecycle

Content follows a five-stage lifecycle:

```
draft --> review --> approved --> published --> archived
```

| Status    | Description                              |
|-----------|------------------------------------------|
| draft     | Initial creation, editable               |
| review    | Submitted for editorial review           |
| approved  | Passed review, ready to publish          |
| published | Live and publicly accessible             |
| archived  | Removed from public but retained in DB   |

**Publishing Endpoint:** `POST /api/admin/content/[id]/publish` transitions content to `published` status and sets `publishedAt`.

### 2.3 Version History with Rollback

Every content edit can be saved as a version in the `content_versions` table.

| Field         | Description                              |
|---------------|------------------------------------------|
| contentId     | Reference to marketing_content           |
| versionNumber | Auto-incremented version counter         |
| title         | Snapshot of title at that version        |
| body          | Snapshot of body at that version         |
| changedBy     | User who created the version             |
| changeNote    | Optional note describing the change      |

**Rollback:** Send `POST /api/admin/content/[id]/versions` with `{ action: "rollback", versionId: "..." }` to restore content to a previous version.

**Files:**
- `/app/api/admin/content/[id]/versions/route.ts` -- Version listing and rollback
- `/lib/db/content-version-queries.ts` -- Database queries for versions

### 2.4 Brochure Builder

The `content_assets` table stores multi-slide brochure assets.

**Asset Structure:**
- `assetType`: `brochure`
- `slides`: JSON array of slide objects, each containing layout template, HTML content, and styling
- `status`: `draft` / `review` / `approved` / `published`
- Linked to `marketing_content` via `contentId`
- Supports cover images and metadata

**Admin Pages:**
- `/admin/content/brochures` -- Brochure listing
- `/admin/content/brochures/[id]` -- Brochure editor with per-slide HTML editing

### 2.5 Presentation Builder

Same `content_assets` table with `assetType: 'presentation'`.

**Features:**
- Slide-by-slide editing with navigation
- Speaker notes support
- Layout templates per slide
- Cover image and metadata

**Admin Pages:**
- `/admin/content/presentations` -- Presentation listing
- `/admin/content/presentations/[id]` -- Slide editor

### 2.6 Share Links with UTM Parameter Builder

The `share_links` table creates trackable short URLs for content distribution.

| Field        | Description                                       |
|--------------|---------------------------------------------------|
| contentId    | Optional link to marketing_content                |
| assetId      | Optional link to content_assets                   |
| campaignId   | Campaign association                              |
| originalUrl  | Full destination URL                              |
| shortCode    | Unique short code for the redirect URL            |
| utmSource    | UTM source parameter (e.g., `linkedin`)           |
| utmMedium    | UTM medium parameter (e.g., `social`)             |
| utmCampaign  | UTM campaign parameter                            |
| utmTerm      | UTM term parameter (keyword targeting)            |
| utmContent   | UTM content parameter (A/B differentiation)       |
| clickCount   | Auto-incremented click counter                    |
| isActive     | Enable/disable toggle                             |
| expiresAt    | Optional expiration timestamp                     |

### 2.7 Short Link Redirect with Click Tracking

**Endpoint:** `GET /api/s/[code]`

**Redirect Flow:**
1. Look up share link by short code
2. Validate link is active and not expired (returns `410 Gone` if expired)
3. Increment `clickCount`
4. Append UTM parameters to the destination URL
5. Return `302` redirect to the full URL with UTM params

**Admin Page:** `/admin/content/links` -- Link management and analytics

**Files:**
- `/app/api/s/[code]/route.ts` -- Short link redirect handler
- `/lib/db/share-link-queries.ts` -- Link CRUD and click tracking

---

## 3. CRM and Contact Management

### 3.1 Contact CRUD

The `contacts` table is the central CRM entity.

| Field        | Type             | Description                                  |
|--------------|------------------|----------------------------------------------|
| email        | string (unique)  | Primary identifier                           |
| firstName    | string           | First name                                   |
| lastName     | string           | Last name                                    |
| company      | string           | Company name                                 |
| phone        | string           | Phone number                                 |
| source       | enum             | `manual`, `import`, `contact_form`, `survey`, `booking`, `newsletter` |
| tags         | JSON array       | Flexible tagging system                      |
| customFields | JSON             | Arbitrary key-value custom fields            |
| leadScore    | integer          | Numeric lead scoring value (default 0)       |
| status       | enum             | `active`, `unsubscribed`, `bounced`, `inactive` |
| subscribedAt | timestamp        | When the contact opted in                    |

**API Endpoints:**
- `GET /api/admin/contacts` -- List with pagination, search, filtering
- `POST /api/admin/contacts` -- Create new contact
- `GET /api/admin/contacts/[id]` -- Get contact detail
- `PATCH /api/admin/contacts/[id]` -- Update contact
- `DELETE /api/admin/contacts/[id]` -- Delete contact
- `GET /api/admin/contacts/export` -- CSV export

### 3.2 Static and Dynamic Lists

The `lists` table supports two types:

| Type    | Description                                            |
|---------|--------------------------------------------------------|
| static  | Manually curated list with explicit member assignments |
| dynamic | Rule-based list with `segmentRules` JSON definition    |

**List Members:** The `list_members` join table maps contacts to static lists with `addedAt` timestamps.

**API Endpoints:**
- `GET /api/admin/lists` -- List all lists
- `POST /api/admin/lists` -- Create list (static or dynamic)
- `GET /api/admin/lists/[id]` -- Get list with members
- `PATCH /api/admin/lists/[id]` -- Update list
- `DELETE /api/admin/lists/[id]` -- Delete list
- `POST /api/admin/lists/[id]/preview` -- Evaluate dynamic segment rules and return count

### 3.3 CSV Import with Field Mapping

Contacts can be bulk-imported from CSV files.

**Import Flow:**
1. Upload CSV file via `POST /api/admin/contacts/import` (multipart form data)
2. Parser auto-detects column headers: `email`, `firstname`/`first_name`, `lastname`/`last_name`, `company`/`organization`, `phone`/`telephone`, `tags`
3. Each row is validated for email format
4. Duplicate detection by email (existing contacts are skipped)
5. Tags are parsed from semicolon-separated values

**Import Result:**

| Field         | Description                      |
|---------------|----------------------------------|
| total         | Total rows in CSV                |
| imported      | Successfully imported count      |
| duplicates    | Skipped duplicate count          |
| errors        | Failed row count                 |
| errorMessages | Per-row error details            |

**Import Job Tracking:** The `import_jobs` table records each import with progress metrics and can be queried via `GET /api/admin/contacts/import/[id]`.

### 3.4 Contact Event Tracking

The `contact_events` table logs all interactions for each contact.

| Field     | Description                                   |
|-----------|-----------------------------------------------|
| contactId | Reference to the contact                      |
| eventType | Type of event (e.g., `email_opened`, `form_submitted`, `page_viewed`) |
| metadata  | JSON with event-specific details              |
| createdAt | Event timestamp                               |

### 3.5 Dynamic Segment Evaluation

The segment evaluator (`/lib/crm/segment-evaluator.ts`) builds SQL conditions from rule definitions.

**Supported Operators:**

| Operator      | SQL Equivalent           | Example                          |
|---------------|--------------------------|----------------------------------|
| `equals`      | `= value`               | `status equals "active"`         |
| `not_equals`  | `!= value`              | `source not_equals "import"`     |
| `contains`    | `LIKE '%value%'`        | `email contains "gmail"`         |
| `starts_with` | `LIKE 'value%'`         | `company starts_with "Tech"`     |
| `greater_than`| `> value`               | `leadScore greater_than 50`      |
| `less_than`   | `< value`               | `leadScore less_than 10`         |
| `is_empty`    | `IS NULL OR = ''`       | `phone is_empty`                 |
| `is_not_empty`| `IS NOT NULL AND != ''` | `company is_not_empty`           |

**Rule Groups:** Conditions can be nested in AND/OR groups for complex segmentation logic.

**Live Preview:** The `POST /api/admin/lists/[id]/preview` endpoint evaluates rules against the contacts table and returns the match count plus a sample of 10 matching contact IDs.

---

## 4. Email Campaign Engine

### 4.1 Template Management

Email templates are stored in the `email_templates` table with full version history.

| Field       | Description                                        |
|-------------|----------------------------------------------------|
| name        | Template display name                              |
| category    | Organizational category                            |
| subject     | Email subject line (supports variables)            |
| htmlContent | Full HTML body (supports variables)                |
| textContent | Plain text fallback                                |
| variables   | JSON array of variable names used in the template  |

**Variable Interpolation:** Templates use `{{variableName}}` syntax. Common variables include:
- `{{firstName}}` -- Contact's first name
- `{{lastName}}` -- Contact's last name
- `{{company}}` -- Contact's company
- `{{email}}` -- Contact's email
- `{{unsubscribeUrl}}` -- Auto-generated unsubscribe link

**Template Versioning:** The `email_template_versions` table stores every revision with version number, content snapshot, and change attribution.

### 4.2 Template Preview and Test Send

**Endpoint:** `POST /api/admin/templates/[id]/test-send`

**Payload:**
```json
{
  "to": "recipient@example.com",
  "variables": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

The test send renders the template with provided variables, prefixes the subject with `[TEST]`, and sends via the configured SMTP transport.

### 4.3 Campaign Creation

The `campaigns` table manages email campaigns.

| Field            | Description                                          |
|------------------|------------------------------------------------------|
| name             | Campaign name                                        |
| type             | `email` or `sms`                                     |
| status           | `draft`, `scheduled`, `sending`, `paused`, `completed`, `cancelled` |
| audienceType     | `list`, `segment`, or `all`                          |
| audienceId       | Reference to the target list or segment              |
| audienceCount    | Calculated audience size                             |
| emailProfileId   | Which email profile to send from                     |
| templateId       | Email template to use                                |
| subject          | Campaign subject line                                |
| scheduledAt      | When to begin sending                                |
| throttlePerMinute| Sending rate limit (default 60/min)                  |

### 4.4 A/B Variant Testing

The `campaign_variants` table supports split testing.

| Field          | Description                            |
|----------------|----------------------------------------|
| campaignId     | Parent campaign                        |
| name           | Variant label (e.g., `A`, `B`)         |
| subject        | Variant-specific subject line          |
| templateId     | Variant-specific template              |
| percentage     | Traffic allocation (default 50%)       |
| recipientCount | Number of recipients in this variant   |
| openCount      | Opens tracked for this variant         |
| clickCount     | Clicks tracked for this variant        |

### 4.5 Broadcast Management

The `broadcasts` table provides a simpler sending mechanism for one-off email blasts.

| Field              | Description                                      |
|--------------------|--------------------------------------------------|
| name               | Broadcast name                                   |
| subject            | Email subject                                    |
| htmlContent        | Inline HTML content (no template reference)      |
| profileId          | Email profile to send from                       |
| audienceType       | `list`, `segment`, or `all`                      |
| status             | `draft`, `scheduled`, `sending`, `paused`, `completed` |
| throttlePerMinute  | Sending rate limit (default 60/min)              |
| totalSent          | Count of emails sent                             |
| totalFailed        | Count of failed sends                            |

### 4.6 Email Event Tracking

Three layers of email tracking:

**1. Campaign Recipients (`campaign_recipients`):**
Per-recipient status tracking within a campaign: `pending` -> `sent` -> `delivered` -> `opened` -> `clicked` -> `bounced` -> `unsubscribed` -> `failed`.

**2. Email Messages (`email_messages`):**
Individual email message records with SMTP message IDs, status, and metadata.

**3. Email Events (`email_events`):**
Granular event log for every interaction:

| Event Type     | How Tracked                                          |
|----------------|------------------------------------------------------|
| `sent`         | Recorded when SMTP accepts the message               |
| `delivered`    | Webhook from email provider                          |
| `opened`       | 1x1 tracking pixel loaded (`GET /api/t/o/[id]`)     |
| `clicked`      | Click-through redirect (`GET /api/t/c/[id]`)         |
| `bounced`      | Webhook from email provider                          |
| `complained`   | Spam complaint webhook                               |
| `unsubscribed` | Unsubscribe link clicked (`POST /api/t/u/[token]`)   |

**Tracking Pixel:** A transparent 1x1 GIF (`/lib/tracking/pixel.ts`) is injected before `</body>` in every sent email. When loaded, it records an open event. The response is served with `Cache-Control: no-store` to ensure accurate tracking.

**Link Rewriting:** All `href` attributes in outgoing HTML are rewritten to pass through `/api/t/c/[recipientId]?url=<encoded>`, which logs the click and redirects to the original URL.

**Unsubscribe:** An unsubscribe link is injected into every email footer. The `unsubscribe_tokens` table maps unique tokens to contacts. When a token is used, the contact status is set to `unsubscribed`.

### 4.7 Campaign Analytics

**Endpoint:** `GET /api/admin/analytics/campaigns`

Returns aggregated metrics:
- Total campaigns, completed campaigns
- Total sent, opened, clicked, bounced
- Open rate, click rate, bounce rate (percentage)
- Top 10 campaigns ranked by open rate
- 10 most recent campaigns with status and counts

---

## 5. Marketing Automation

### 5.1 Eight-Step Workflow Wizard

The marketing workflow guides users through a complete campaign lifecycle.

| Step | Name                | Description                                    |
|------|---------------------|------------------------------------------------|
| 0    | Select Content      | Choose existing marketing content              |
| 1    | Select Asset        | Choose or create a brochure/presentation asset |
| 2    | Create Share Links  | Generate tracked short links with UTM params   |
| 3    | Target Audience     | Select a contact list or define a segment      |
| 4    | Configure Campaign  | Set up the email campaign with template        |
| 5    | Submit for Approval | Submit the workflow for manager approval       |
| 6    | Monitor Progress    | Real-time campaign execution monitoring        |
| 7    | View Results        | Final analytics and reporting                  |

### 5.2 Zustand-Persisted Wizard State

The workflow state is managed client-side using Zustand with `persist` middleware, stored under the key `th-marketing-workflow` in localStorage.

**Persisted State:**

| Field          | Type       | Description                    |
|----------------|------------|--------------------------------|
| currentStep    | number     | Current wizard step (0-7)      |
| workflowId     | string     | Server-side workflow record ID |
| workflowName   | string     | Workflow display name          |
| contentId      | string     | Selected content ID            |
| assetId        | string     | Selected asset ID              |
| shareLinkIds   | string[]   | Generated share link IDs       |
| listId         | string     | Target list ID                 |
| campaignId     | string     | Configured campaign ID         |
| approvalStatus | string     | Current approval state         |

This enables users to close the browser and resume exactly where they left off.

### 5.3 Approval Workflow

The `marketing_workflows` table tracks approval state.

**Workflow Status Transitions:**
```
draft --> pending_approval --> approved --> executing --> completed
                          \-> rejected (with comments)
```

**Approval Endpoint:** `POST /api/admin/workflows/[id]/approve`
- Validates the workflow exists
- Records the approver's user ID and timestamp
- Sets `approvedBy` and `approvedAt` fields

**Comments:** The `workflow_comments` table stores review comments at each step:
- `workflowId` -- The workflow being reviewed
- `userId` -- The commenter
- `content` -- Comment text
- `stepIndex` -- Which step the comment relates to

**Admin Pages:**
- `/admin/marketing/workflow` -- Workflow wizard interface
- `/admin/marketing/approvals` -- Approval queue for reviewers

### 5.4 Campaign Monitoring Dashboard

**Admin Page:** `/admin/marketing/monitor`

Displays real-time campaign execution data:
- Progress bars showing send completion percentage
- Email funnel visualization (sent -> delivered -> opened -> clicked)
- Live event stream from the `email_events` table
- Error counts and failure details

### 5.5 Dynamic Segment Builder with Live Preview

**Admin Page:** `/admin/marketing/segments`

Visual builder for creating dynamic contact segments:
- Add/remove conditions with field, operator, and value selectors
- Group conditions with AND/OR logic
- Nested groups for complex rules
- Live preview count: shows how many contacts match the current rules in real time
- Save as dynamic list for campaign targeting

---

## 6. AI Analysis Framework

### 6.1 Framework Categories

The `analysis_frameworks` table stores 35 analysis categories with approximately 650 total analysis types.

**Table Structure:**

| Field          | Description                                           |
|----------------|-------------------------------------------------------|
| categoryKey    | Unique key (e.g., `reliable_ai`, `trustworthy_ai`)   |
| categoryName   | Display name (e.g., "Reliable AI")                    |
| description    | Category description                                  |
| analysisTypes  | JSON array of `{index, name}` objects                 |
| totalItems     | Count of analysis types in this category              |
| sortOrder      | Display ordering                                      |

**Example Categories:**
- Reliable AI
- Trustworthy AI
- Safe AI
- Accountable AI
- Transparent AI
- Fair AI
- Privacy-Preserving AI
- Robust AI
- And 27 more...

### 6.2 Assessment Lifecycle

Assessments follow a three-stage lifecycle:

```
not_started --> in_progress --> completed
```

**Assessment Table (`analysis_assessments`):**

| Field          | Description                                      |
|----------------|--------------------------------------------------|
| frameworkId    | Reference to the framework category              |
| projectName   | Name of the project being assessed               |
| assessorId    | User performing the assessment                   |
| status        | `not_started`, `in_progress`, `completed`        |
| overallScore  | Average of all scored items (0-100)              |
| completedItems| Count of items that have been scored             |
| totalItems    | Total items requiring scoring                    |
| itemScores    | JSON array of per-item scores                    |

### 6.3 Item-Level Scoring

Each analysis type within a framework is scored individually:

```json
{
  "itemIndex": 0,
  "score": 85,
  "status": "completed",
  "notes": "Strong implementation with minor gaps in documentation"
}
```

- Score range: 0 to 100
- Status per item: indicates completion
- Notes: free-text assessment commentary

### 6.4 Incremental Score Merging

The `PATCH /api/admin/analysis/assessments/[id]` endpoint supports partial saves:
1. Receives a subset of `itemScores`
2. Merges new scores with existing ones (keyed by `itemIndex`)
3. Sorts merged array by index
4. Recalculates `completedItems` count
5. Recalculates `overallScore` as the average of all non-null scores

This means assessors can save progress at any point without losing previous work.

### 6.5 Overall Score Auto-Calculation

When the `{ action: "complete" }` payload is sent:
1. All item scores are loaded from the assessment
2. Items with non-null scores are collected
3. Average is computed: `sum(scores) / count(scored_items)`
4. Result is rounded to 2 decimal places
5. Assessment status is set to `completed`

### 6.6 Project-Level Cross-Framework View

**Admin Page:** `/admin/analysis/projects`

Displays all assessments grouped by project name, allowing comparison across different framework categories for the same project.

### 6.7 JSON Export

**Endpoint:** `GET /api/admin/analysis/assessments/[id]/export`

Returns a downloadable JSON file (`Content-Disposition: attachment`) containing:
- Framework category details
- Project name
- Assessment status and overall score
- Complete item scores array
- Export timestamp

**Admin Pages:**
- `/admin/analysis` -- Framework category listing
- `/admin/analysis/[key]` -- Assessment interface for a specific framework
- `/admin/analysis/projects` -- Cross-framework project view

---

## 7. RAG Pipeline

### 7.1 Document Management

The `rag_documents` table supports three source types:

| Source Type | Description                                 |
|-------------|---------------------------------------------|
| `upload`    | Direct file upload (PDF, DOCX, TXT, etc.)   |
| `url`       | Fetch content from a web URL                |
| `sitepage`  | Crawl a specific site page                  |

**Document Fields:**
- `name`, `sourceType`, `sourceUrl`, `filePath`
- `mimeType`, `size` -- File metadata
- `status` -- Pipeline stage indicator
- `chunkCount` -- Number of chunks generated
- `metadata` -- JSON for additional properties

### 7.2 Pipeline Stages

Documents progress through four stages:

```
pending --> ingested --> chunked --> embedded
                                       |
                                    (failed at any stage)
```

| Stage      | Description                                           |
|------------|-------------------------------------------------------|
| `pending`  | Document uploaded but not yet processed                |
| `ingested` | Raw text has been extracted from the source            |
| `chunked`  | Text has been split into chunks with overlap           |
| `embedded` | Vector embeddings have been generated for all chunks   |
| `failed`   | Processing failed at any stage                        |

**Ingestion Trigger:** `POST /api/admin/rag/documents/[id]/ingest`

### 7.3 Chunk Management

The `rag_chunks` table stores individual text segments.

| Field       | Description                                      |
|-------------|--------------------------------------------------|
| documentId  | Parent document reference                        |
| chunkIndex  | Sequential position within the document          |
| content     | Chunk text content                               |
| tokenCount  | Estimated token count                            |
| metadata    | JSON with headings, page numbers, section info   |
| hash        | Content hash for deduplication                   |

**Chunk API:** `GET /api/admin/rag/documents/[id]/chunks` -- List all chunks for a document.

### 7.4 Search (Hybrid Retrieval)

**Endpoint:** `POST /api/admin/rag/search`

**Payload:**
```json
{
  "query": "search query text",
  "k": 10,
  "vectorWeight": 0.7,
  "keywordWeight": 0.3,
  "rerankEnabled": false,
  "lambda": 0.7
}
```

**Retrieval Pipeline:**
1. **Query Embedding** -- Embed the query using the configured embedding provider
2. **Vector Search** -- Cosine similarity search via `InMemoryVectorStore`
3. **BM25 Keyword Scoring** -- TF-IDF-based keyword scoring with BM25 parameters (k1=1.5, b=0.75)
4. **Reciprocal Rank Fusion (RRF)** -- Combine vector and keyword results with configurable weights (default 70/30)
5. **Optional MMR Reranking** -- Maximal Marginal Relevance for result diversity
6. **Return Top-K** -- Final results with chunk content and fusion scores

### 7.5 Configuration Management

The `rag_configs` table stores pipeline configurations:

| Field    | Description                                                    |
|----------|----------------------------------------------------------------|
| name     | Configuration name                                             |
| version  | Version number                                                 |
| config   | JSON: `chunkSize`, `chunkOverlap`, `embeddingModel`, `retrievalK`, etc. |
| isActive | Whether this is the active configuration                       |

**Admin Page:** `/admin/rag/config`

### 7.6 Run Tracking with Metrics

**Tables:**
- `rag_runs` -- Top-level run records (type: `ingestion`, `embedding`, `evaluation`, `retrieval`)
- `rag_run_steps` -- Individual step records with status, input/output JSON, and duration
- `rag_run_metrics` -- Quality metrics per run (faithfulness, relevance, precision, recall, PII detection, chunk quality)

**RAG Health:** `GET /api/admin/rag/health` -- Pipeline health check.

**Evaluation:** `POST /api/admin/rag/evaluate` -- Run evaluation metrics against the pipeline.

**Admin Pages:**
- `/admin/rag` -- RAG dashboard
- `/admin/rag/documents` -- Document listing
- `/admin/rag/documents/[id]` -- Document detail and chunks
- `/admin/rag/runs` -- Run history
- `/admin/rag/search` -- Interactive search interface
- `/admin/rag/config` -- Configuration management

**Files:**
- `/lib/rag/ingestion.ts` -- Text extraction
- `/lib/rag/chunking.ts` -- Text splitting
- `/lib/rag/embedding.ts` -- Vector embedding generation
- `/lib/rag/retrieval.ts` -- Hybrid search implementation
- `/lib/rag/vector-store.ts` -- In-memory vector storage and similarity search
- `/lib/rag/evaluation.ts` -- Quality metric computation
- `/lib/rag/pii.ts` -- PII detection in content

---

## 8. Chatbot Management

### 8.1 Session Tracking

The `chat_sessions` table tracks visitor chat interactions.

| Field           | Description                              |
|-----------------|------------------------------------------|
| visitorEmail    | Email (captured during or after session) |
| visitorName     | Visitor display name                     |
| sessionToken    | Unique session identifier                |
| ipHash          | Hashed IP for privacy                    |
| userAgent       | Browser user agent string                |
| status          | `active` or `closed`                     |
| emailCapturedAt | When email was provided                  |
| startedAt       | Session start timestamp                  |
| lastMessageAt   | Most recent message timestamp            |

**Public API:**
- `POST /api/chat/session` -- Create new chat session
- `POST /api/chat` -- Send message in a session
- `POST /api/chat/email` -- Capture email during chat

### 8.2 Request and Response Management

The `chat_requests` table enables admin triage of chat conversations.

| Field       | Description                                                          |
|-------------|----------------------------------------------------------------------|
| sessionId   | Parent session                                                       |
| contactId   | Linked CRM contact (if email captured)                               |
| subject     | Auto-generated or admin-set subject                                  |
| category    | Categorization tag                                                   |
| status      | `new`, `triaged`, `responding`, `waiting_user`, `resolved`, `closed` |
| priority    | `low`, `medium`, `high`, `urgent`                                    |
| assignedTo  | Admin user assigned to handle                                        |

### 8.3 Admin Response Interface

**Endpoint:** `POST /api/admin/chat/requests/[id]/respond`

Allows admin users to send responses within a chat session. Messages are stored in the `chat_messages` table with `role: 'assistant'` for bot responses and `role: 'user'` for visitor messages.

**Admin Pages:**
- `/admin/chat` -- Chat request queue
- `/admin/chat/requests/[id]` -- Request detail with conversation thread
- `/admin/chat/sessions/[id]` -- Full session view

### 8.4 Message Evaluation

The `chat_message_evals` table stores quality and safety evaluations for chat messages.

| Eval Type    | Description                        |
|--------------|------------------------------------|
| `pii`        | Personal information detection     |
| `toxicity`   | Harmful content detection          |
| `bias`       | Bias analysis                      |
| `safety`     | General safety assessment          |
| `compliance` | Regulatory compliance check        |

Each evaluation includes a score (0-100), pass/fail status, and detailed results in JSON.

### 8.5 Admin Notes

The `admin_notes` table provides internal note-taking on any entity.

| Field      | Description                                      |
|------------|--------------------------------------------------|
| entityType | `chat_request`, `chat_session`, `contact`        |
| entityId   | ID of the referenced entity                      |
| content    | Note text                                        |
| createdBy  | Admin user who wrote the note                    |

**Endpoint:** `POST /api/admin/chat/requests/[id]/notes` and `GET` for retrieval.

---

## 9. Integration Hub

### 9.1 Third-Party Integration Management

The integration system uses a provider registry pattern to support multiple third-party services.

**Available Providers:**

| Provider   | Category      | Description                    |
|------------|---------------|--------------------------------|
| Slack      | messaging     | Team messaging integration     |
| WhatsApp   | messaging     | WhatsApp Business messaging    |
| Gmail      | messaging     | Gmail API integration          |
| LinkedIn   | social        | LinkedIn API integration       |
| Facebook   | social        | Facebook API integration       |
| Instagram  | social        | Instagram API integration      |
| X (Twitter)| social        | X/Twitter API integration      |
| Quora      | social        | Quora API integration          |
| Dropbox    | data          | File storage integration       |
| Database   | data          | External database connection   |
| Webhook    | webhook       | Custom webhook endpoints       |

**Provider Interface:** Each provider implements:
- `connect(config)` -- Establish connection with credentials
- `disconnect(accountId)` -- Remove connection
- `testConnection(accountId)` -- Verify connectivity
- `sync(accountId)` -- Optional data synchronization
- `getStatus(accountId)` -- Connection status check

### 9.2 Credential Storage

The `integration_credentials` table stores encrypted key-value pairs for each integration account, with optional expiration timestamps.

The `integration_accounts` table tracks:
- Connection status: `connected`, `disconnected`, `error`
- Last sync timestamp
- Error messages for troubleshooting

### 9.3 Connection Testing

**Endpoint:** `POST /api/admin/integrations/[id]/test`

Invokes the provider's `testConnection` method and returns the result. For unregistered providers, returns a stub success message.

### 9.4 Activity Logging

The `integration_logs` table records every API interaction:

| Field      | Description                                |
|------------|--------------------------------------------|
| accountId  | Integration account reference              |
| action     | Action performed (e.g., `send_message`)    |
| status     | `success` or `error`                       |
| request    | JSON of the outgoing request               |
| response   | JSON of the received response              |
| durationMs | Execution time in milliseconds             |

**Endpoint:** `GET /api/admin/integrations/[id]/logs`

### 9.5 Webhooks

The `webhooks` table supports custom webhook endpoints:
- Event subscription filtering (JSON array of event types)
- Shared secret for request signing
- Active/inactive toggle
- Failure count tracking for circuit-breaking
- Last triggered timestamp

**Admin Pages:**
- `/admin/integrations` -- Integration listing and status overview
- `/admin/integrations/[id]` -- Integration detail, credentials, logs

---

## 10. Blog and Media

### 10.1 Blog Posts

The `blog_posts` table supports a full blogging platform.

| Field          | Description                                    |
|----------------|------------------------------------------------|
| title          | Post title                                     |
| slug           | URL-friendly slug (unique)                     |
| summary        | Short excerpt                                  |
| content        | Raw markdown content                           |
| coverImage     | Cover image URL                                |
| status         | `draft`, `published`, `archived`               |
| featured       | Boolean flag for featured posts                |
| authorId       | Reference to `blog_authors`                    |
| metaTitle      | SEO meta title                                 |
| metaDescription| SEO meta description                           |
| publishedAt    | Publication timestamp                          |

### 10.2 Categories and Tags

**Categories (`blog_categories`):** Hierarchical organization with name, slug, description, color (hex for badges), and sort order.

**Tags (`blog_tags`):** Flat taxonomy with name and slug.

**Many-to-Many:** `blog_post_categories` and `blog_post_tags` join tables.

### 10.3 Blog Authors

The `blog_authors` table stores author profiles:
- Name, bio, avatar URL
- Social links (JSON: LinkedIn, Twitter)

### 10.4 Blog Subscribers

The `blog_subscribers` table manages newsletter subscriptions:
- Email (unique)
- Status: `active` or `unsubscribed`
- Subscription and unsubscription timestamps

**Public API:** `POST /api/newsletter` -- Subscribe to blog updates.

### 10.5 View Tracking

The `blog_views` table records page views with session-based deduplication:
- `postId` -- Which post was viewed
- `sessionId` -- Visitor session for dedup
- `viewedAt` -- View timestamp

**Public API:** `POST /api/blog/views` -- Record a page view.
**Stats API:** `GET /api/blog/stats` -- Aggregated blog statistics.

### 10.6 Video Management

The `videos` table manages video content:

| Field    | Description                                 |
|----------|---------------------------------------------|
| title    | Video title                                 |
| summary  | Video description                           |
| videoUrl | Embed URL                                   |
| provider | `youtube`, `vimeo`, or `custom`             |
| thumbnail| Thumbnail image URL                         |
| tags     | JSON array of tags                          |
| category | Video category                              |
| duration | Video duration string                       |
| sortOrder| Display ordering                            |
| isActive | Active/inactive toggle                      |

**Admin Page:** `/admin/videos`

### 10.7 Media Library

The `media` table provides centralized asset management:

| Field        | Description                           |
|--------------|---------------------------------------|
| filename     | Stored filename                       |
| originalName | Original upload filename              |
| mimeType     | MIME type                             |
| size         | File size in bytes                    |
| path         | Server file path                      |
| url          | Public access URL                     |
| alt          | Alt text for accessibility            |
| tags         | JSON array of tags                    |
| folder       | Organizational folder                 |
| uploadedBy   | Uploading user                        |

**API Endpoints:**
- `GET /api/admin/media` -- List media with filtering
- `POST /api/admin/media` -- Upload new media
- `GET /api/admin/media/[id]` -- Get media detail
- `DELETE /api/admin/media/[id]` -- Delete media

**Admin Page:** `/admin/media`

---

## 11. Analytics and Reporting

### 11.1 Lead Tracking

The `contact_submissions` table captures inbound leads from the public website.

| Field         | Description                                          |
|---------------|------------------------------------------------------|
| fullName      | Submitter's full name                                |
| email         | Contact email                                        |
| company       | Company name                                         |
| industry      | Industry vertical                                    |
| interestAreas | JSON array of selected interests                     |
| projectStage  | Current project stage                                |
| budgetRange   | Budget range selection                               |
| timeline      | Project timeline                                     |
| leadScore     | Auto-calculated lead score                           |
| leadTier      | `hot`, `warm`, `cool`, `cold`                        |
| status        | `new`, `contacted`, `qualified`, `closed`            |
| sourcePage    | Which page the submission came from                  |

**Admin Pages:**
- `/admin/leads` -- Lead listing with tier and status filtering
- `/admin/leads/[id]` -- Lead detail view
- `GET /api/admin/leads/export` -- CSV export

### 11.2 Survey Management

**Survey Responses (`survey_responses`):**
- Contact information (name, email, company, industry, role)
- Total score and maturity level: `beginner`, `developing`, `advanced`, `leader`
- Recommended path based on score
- Segmentation tags for marketing targeting

**Survey Answers (`survey_answers`):**
- Per-question answers with score values
- Linked to responses via `responseId`

**Public API:** `POST /api/survey` -- Submit a survey response.
**Admin Page:** `/admin/survey` -- Survey response listing and analysis.

### 11.3 Campaign Analytics Dashboard

**Admin Page:** `/admin/analytics`

**Endpoint:** `GET /api/admin/analytics/campaigns`

Provides:
- Summary metrics (total campaigns, completion rate, aggregate send/open/click/bounce counts)
- Open rate, click rate, and bounce rate percentages
- Top 10 performing campaigns by open rate
- Recent campaign list with status and metrics

### 11.4 Contact Analytics

**Endpoint:** `GET /api/admin/analytics/contacts`

Provides contact database analytics:
- Total contacts, active vs. inactive
- Source distribution breakdown
- Growth trends over time
- Tag frequency analysis

---

## 12. System Administration

### 12.1 Health Monitoring

**Endpoint:** `GET /api/admin/health`

Returns comprehensive system health data:

| Metric         | Description                                      |
|----------------|--------------------------------------------------|
| status         | `healthy` or `unhealthy`                         |
| database.sizeMB| SQLite database file size in megabytes           |
| database.tables| Row counts for key tables (users, posts, contacts, campaigns, etc.) |
| queue          | Job queue statistics (pending, running, completed, failed) |
| recentErrors   | Last 10 error entries from job logs              |
| uptime         | Node.js process uptime in seconds                |
| timestamp      | Current server time (ISO 8601)                   |

**Admin Page:** `/admin/health`

### 12.2 Site Settings

The `site_settings` table stores key-value pairs for global configuration.

| Field      | Description                           |
|------------|---------------------------------------|
| key        | Setting identifier (primary key)      |
| value      | JSON string value                     |
| updatedBy  | Last modifier                         |
| updatedAt  | Last modification timestamp           |

**Admin Page:** `/admin/settings`

### 12.3 Feature Flags with Versioning

**Three tables for feature flag management:**

1. **`feature_flags`** -- Flag definitions with key, label, description, module grouping, and enabled status.

2. **`feature_flag_versions`** -- Version history for each flag: version number, JSON config, change attribution.

3. **`feature_flag_active`** -- Maps each flag to its currently active version.

**Cache Management:**
- Flags are cached in memory for performance (`/lib/feature-flags/cache.ts`)
- `POST /api/admin/features/bust-cache` -- Manually invalidate the cache
- Feature guard (`/lib/feature-flags/guard.ts`) for checking flag status

**Admin Page:** `/admin/features`

### 12.4 Email Profiles and SMTP Configuration

**Email Profiles (`email_profiles`):**
- Named sender profiles with `fromName`, `fromEmail`, `replyTo`
- HTML signature block
- Default profile designation
- Active/inactive toggle

**SMTP Configs (`smtp_configs`):**
- Named SMTP server configurations
- Host, port, secure flag
- Username and encrypted password

**Profile-SMTP Mapping (`email_profile_smtp`):** Links profiles to SMTP configs.

**Event Routes (`event_routes`):** Maps event types to email profiles, controlling which sender identity is used for each type of system email.

**Profile-Based Sending:** The `sendWithProfile` function (`/lib/email/profile-mailer.ts`):
1. Resolves profile from event type via event routes
2. Falls back to default profile
3. Falls back to environment variables
4. Appends profile signature to HTML
5. Sends via Nodemailer transport

**Admin Page:** `/admin/email-profiles`

### 12.5 Banner Management

The `banners` table supports site-wide announcements.

| Field     | Description                                    |
|-----------|------------------------------------------------|
| title     | Banner headline                                |
| content   | HTML body content                              |
| placement | `top`, `bottom`, `modal`, `inline`             |
| severity  | `info`, `success`, `warning`, `error`          |
| ctaText   | Call-to-action button text                     |
| ctaUrl    | Call-to-action URL                             |
| mediaId   | Optional media asset reference                 |
| startDate | When to start showing                          |
| endDate   | When to stop showing                           |
| isActive  | Manual enable/disable                          |
| priority  | Display priority ordering                      |

**Public API:** `GET /api/banners/active` -- Get currently active banners.
**Admin Page:** `/admin/banners`

### 12.6 Content Overrides

The `content_overrides` table allows dynamic content replacement on public pages.

| Field    | Description                                         |
|----------|-----------------------------------------------------|
| pageSlug | Target page identifier                              |
| section  | Section within the page                             |
| key      | Content key to override                             |
| value    | JSON replacement value                              |
| isActive | Enable/disable the override                         |

**Admin Page:** `/admin/content-overrides`

### 12.7 Maintenance Mode

**Endpoint:** `GET/POST /api/admin/maintenance`

- Enable/disable maintenance mode
- Custom maintenance message
- Scheduled end time

When enabled, the maintenance page (`/maintenance`) is shown to public visitors.

**Admin Page:** `/admin/maintenance`

### 12.8 Appointment Management

Appointment scheduling system for demos and consultations.

**API Endpoints:**
- `GET /api/appointments` -- List appointments
- `POST /api/appointments` -- Create appointment
- `GET /api/appointments/[id]` -- Get appointment detail
- `PATCH /api/appointments/[id]` -- Update appointment
- `GET /api/appointments/slots` -- Get available time slots
- `GET /api/appointments/export` -- Export appointments

**Public Page:** `/book` -- Public booking page.
**Admin Pages:**
- `/admin/appointments` -- Appointment listing
- `/admin/appointments/[id]` -- Appointment detail

### 12.9 Job and Run Monitoring

**Job Queue (`jobs`):**
- Type-based job system (e.g., `campaign_send`)
- Status lifecycle: `pending` -> `running` -> `completed` / `failed` / `cancelled` / `paused`
- Priority levels, retry tracking (`maxRetries`, `attempts`)
- Scheduling support (`scheduledAt`)

**Job Runs (`job_runs`):** Per-attempt execution records with status, timing, results, and errors.

**Job Logs (`job_logs`):** Structured log entries per job with levels (`info`, `warn`, `error`) and JSON metadata.

**Operations Runs (`runs`):**
- Higher-level operation tracking for campaigns, broadcasts, surveys, forms, and imports
- Status: `draft`, `scheduled`, `active`, `paused`, `completed`, `failed`
- JSON config snapshot
- Run events table (`run_events`) for granular event logging

**Admin Pages:**
- `/admin/runs` -- Operations run listing
- `/admin/email-compose` -- Ad-hoc email composition

### 12.10 Additional Admin Pages

| Page                    | Description                             |
|-------------------------|-----------------------------------------|
| `/admin`                | Admin dashboard (overview)              |
| `/admin/services`       | Service offering management             |
| `/admin/industries`     | Industry vertical management            |
| `/admin/content/library`| Content library browsing                |
| `/admin/content/editor/new` | New content creation                |
| `/admin/content/editor/[id]` | Content editing                    |
| `/admin/templates`      | Email template listing                  |
| `/admin/templates/[id]` | Template editing                        |
| `/admin/campaigns/new`  | New campaign creation wizard            |
| `/admin/campaigns/[id]` | Campaign detail and management          |

---

## Database Table Summary

The system uses **79 SQLite tables** managed by Drizzle ORM. Key table groups:

| Group                 | Tables | Description                                 |
|-----------------------|--------|---------------------------------------------|
| Blog                  | 7      | Posts, authors, categories, tags, views, subscribers, join tables |
| Auth/RBAC             | 6      | Users, roles, permissions, groups, mappings  |
| CRM                   | 5      | Contacts, events, lists, members, import jobs |
| Email                 | 8      | Templates, versions, profiles, SMTP, events, messages, tokens, routes |
| Campaigns             | 4      | Campaigns, recipients, variants, broadcasts  |
| Marketing             | 6      | Content, versions, assets, share links, workflows, comments |
| AI Analysis           | 2      | Frameworks, assessments                      |
| RAG                   | 8      | Documents, chunks, embeddings, cache, runs, steps, metrics, configs |
| Chatbot               | 5      | Sessions, requests, messages, evaluations, admin notes |
| Integrations          | 5      | Integrations, accounts, credentials, logs, webhooks |
| Operations            | 5      | Jobs, runs, logs, ops runs, events           |
| System                | 8      | Settings, audit log, videos, services, industries, feature flags, versions, active flags, banners, content overrides, media |

---

## API Route Summary

The system exposes **124 API route handlers** across:

| Route Group              | Count | Base Path                      |
|--------------------------|-------|--------------------------------|
| Auth                     | 3     | `/api/auth/*`                  |
| Blog                     | 9     | `/api/blog/*`                  |
| Admin Analysis           | 6     | `/api/admin/analysis/*`        |
| Admin Analytics          | 2     | `/api/admin/analytics/*`       |
| Admin Assets             | 2     | `/api/admin/assets/*`          |
| Admin Banners            | 2     | `/api/admin/banners/*`         |
| Admin Broadcasts         | 2     | `/api/admin/broadcasts/*`      |
| Admin Campaigns          | 5     | `/api/admin/campaigns/*`       |
| Admin Chat               | 7     | `/api/admin/chat/*`            |
| Admin Contacts           | 6     | `/api/admin/contacts/*`        |
| Admin Content            | 5     | `/api/admin/content/*`         |
| Admin Email              | 6     | `/api/admin/email-*` and `smtp-*` |
| Admin Features           | 3     | `/api/admin/features/*`        |
| Admin Integrations       | 4     | `/api/admin/integrations/*`    |
| Admin Jobs               | 2     | `/api/admin/jobs/*`            |
| Admin Leads              | 3     | `/api/admin/leads/*`           |
| Admin Links              | 2     | `/api/admin/links/*`           |
| Admin Lists              | 4     | `/api/admin/lists/*`           |
| Admin Media              | 2     | `/api/admin/media/*`           |
| Admin RAG                | 8     | `/api/admin/rag/*`             |
| Admin Roles              | 2     | `/api/admin/roles/*`           |
| Admin Runs               | 2     | `/api/admin/runs/*`            |
| Admin Services/Industries| 4     | `/api/admin/services/*`, `/api/admin/industries/*` |
| Admin System             | 7     | `/api/admin/health`, `settings`, `maintenance`, etc. |
| Admin Templates          | 3     | `/api/admin/templates/*`       |
| Admin Users              | 2     | `/api/admin/users/*`           |
| Admin Webhooks           | 2     | `/api/admin/webhooks/*`        |
| Admin Workflows          | 5     | `/api/admin/workflows/*`       |
| Public                   | 12    | `/api/contact`, `survey`, `chat/*`, `appointments/*`, `s/*`, `t/*` |

---

## Technology Stack

| Layer          | Technology                                |
|----------------|-------------------------------------------|
| Framework      | Next.js 14+ (App Router)                  |
| Database       | SQLite with WAL mode                      |
| ORM            | Drizzle ORM                               |
| Authentication | JWT (jose library), HTTP-only cookies     |
| Password Hash  | bcrypt                                    |
| State Mgmt     | Zustand with persist middleware           |
| Data Fetching  | React Query (TanStack Query)              |
| Email          | Nodemailer with profile-based routing     |
| Search         | Hybrid BM25 + Vector with RRF fusion      |
| Validation     | Zod schemas                               |
| Rate Limiting  | In-memory per-IP rate limiter             |
| Testing        | Vitest                                    |
