# TalentsHill API Reference

## Overview

| Property | Value |
|----------|-------|
| Framework | Next.js 14+ App Router (Route Handlers) |
| Total Route Files | 124 |
| Protocol | RESTful JSON API |
| Base URL | `/api` |
| Admin Prefix | `/api/admin/*` |
| Auth | JWT stored in `admin_session` httpOnly cookie |
| Rate Limiting | Per-IP rate limiting on auth and public form endpoints |

All admin endpoints (`/api/admin/*`) require an authenticated session. The JWT is set as an httpOnly cookie named `admin_session` upon login and verified via middleware on each request.

---

## Authentication

### Session Cookie

Admin endpoints use JWT-based authentication stored in an httpOnly cookie:

- **Cookie name:** `admin_session`
- **Token format:** JWT with payload `{userId, email, name, role, roles[]}`
- **Expiration:** 24 hours
- **Flags:** `httpOnly`, `secure` (production), `sameSite: lax`, `path: /`

### JWT Payload

```typescript
{
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  roles: string[];  // RBAC role names
}
```

---

## Error Response Format

All error responses follow a consistent envelope:

```json
{
  "error": "Human-readable error message",
  "details": {}  // Optional: validation error details (Zod flattened format)
}
```

### Standard HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 202 | Accepted (async processing) |
| 302 | Redirect |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 410 | Gone (expired resource) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `offset` | integer | 0 | Number of items to skip |
| `limit` | integer | 50 | Maximum items to return (max 500) |

Paginated responses include:

```json
{
  "items": [...],
  "total": 150,
  "offset": 0,
  "limit": 50
}
```

Some legacy list endpoints use named arrays (e.g., `contacts`, `campaigns`) instead of `items`.

---

## API Endpoints by Module

### 1. Authentication

#### `POST /api/auth/login`

Authenticate an admin user and set session cookie.

- **Rate Limited:** Yes (per-IP)
- **Request Body:**
  ```json
  { "email": "admin@example.com", "password": "secret" }
  ```
- **Success Response (200):**
  ```json
  {
    "success": true,
    "user": { "id": "uuid", "email": "admin@example.com", "name": "Admin", "role": "admin" }
  }
  ```
  Sets `admin_session` cookie.
- **Error Responses:** 400 (missing fields), 401 (invalid credentials), 403 (inactive account), 429 (rate limited)

#### `POST /api/auth/logout`

Clear the session cookie.

- **Auth Required:** No
- **Success Response (200):**
  ```json
  { "success": true }
  ```

#### `GET /api/auth/session`

Validate the current session and return user info.

- **Auth Required:** Yes (cookie)
- **Success Response (200):**
  ```json
  {
    "user": { "userId": "uuid", "email": "admin@example.com", "name": "Admin", "role": "admin" }
  }
  ```
- **Error Response:** 401 (not authenticated or expired)

---

### 2. Content Management

#### `GET /api/admin/content`

List marketing content with filtering.

- **Query Params:** `offset`, `limit`, `contentType` (article|brochure_text|...), `status` (draft|review|...), `search`
- **Response (200):**
  ```json
  { "items": [...], "total": 42 }
  ```

#### `POST /api/admin/content`

Create new marketing content. Validated with Zod `CreateContentSchema`.

- **Request Body:**
  ```json
  {
    "title": "Article Title",
    "slug": "article-title",
    "contentType": "article",
    "body": "Markdown content...",
    "excerpt": "Short summary",
    "status": "draft",
    "tags": ["ai", "ml"],
    "category": "technology",
    "coverImage": "/images/cover.jpg"
  }
  ```
- **Response (201):** `{ "id": "uuid" }`
- **Error:** 400 (validation failed)

#### `GET /api/admin/content/[id]`

Get content by ID with version history.

- **Response (200):** `{ "content": {...}, "versions": [...] }`
- **Error:** 404

#### `PATCH /api/admin/content/[id]`

Update content fields. Validated with Zod `UpdateContentSchema`.

- **Request Body:** Partial content fields
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/content/[id]`

Delete content by ID.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/content/[id]/publish`

Publish or unpublish content.

- **Request Body:** `{}` to publish, `{ "action": "unpublish" }` to unpublish
- **Response (200):** `{ "success": true }`
- **Error:** 404

#### `GET /api/admin/content/[id]/versions`

List version history for content.

- **Response (200):** `{ "versions": [...] }`

#### `POST /api/admin/content/[id]/versions`

Create a new version snapshot or rollback to a previous version.

- **Create version:**
  ```json
  { "changeNote": "Updated introduction" }
  ```
- **Rollback:**
  ```json
  { "action": "rollback", "versionId": "uuid" }
  ```
- **Response (201):** Version object on create, `{ "success": true }` on rollback

---

### 3. Content Assets

#### `GET /api/admin/assets`

List content assets (brochures, presentations).

- **Query Params:** `offset`, `limit`, `assetType` (brochure|presentation), `status`
- **Response (200):** `{ "items": [...], "total": 15 }`

#### `POST /api/admin/assets`

Create a new content asset. Validated with Zod `CreateAssetSchema`.

- **Request Body:**
  ```json
  {
    "title": "Product Brochure",
    "assetType": "brochure",
    "description": "Q1 product overview",
    "contentId": "uuid",
    "slides": [{"id": "s1", "title": "Cover", "content": "..."}]
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/assets/[id]`

Get asset by ID with parsed slides JSON.

- **Response (200):** `{ "asset": { ..., "slides": [...] } }`

#### `PATCH /api/admin/assets/[id]`

Update asset metadata, slides, or status.

- **Update slides:**
  ```json
  { "action": "update-slides", "slides": [...] }
  ```
- **Update status:**
  ```json
  { "action": "update-status", "status": "approved" }
  ```
- **Update metadata:** Send partial fields without `action`
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/assets/[id]`

Delete asset by ID.

- **Response (200):** `{ "success": true }`

---

### 4. Share Links

#### `GET /api/admin/links`

List share links.

- **Query Params:** `offset`, `limit`, `isActive` (true|false)
- **Response (200):** `{ "items": [...], "total": 25 }`

#### `POST /api/admin/links`

Create a trackable short link. Validated with Zod `CreateShareLinkSchema`.

- **Request Body:**
  ```json
  {
    "title": "Campaign Link",
    "originalUrl": "https://talentshill.com/solutions",
    "contentId": "uuid",
    "utmSource": "email",
    "utmMedium": "newsletter",
    "utmCampaign": "q1-launch",
    "expiresAt": "2026-12-31T00:00:00Z"
  }
  ```
- **Response (201):** `{ "id": "uuid", "shortCode": "abc123" }`

#### `GET /api/admin/links/[id]`

Get share link by ID.

- **Response (200):** `{ "link": {...} }`

#### `PATCH /api/admin/links/[id]`

Update share link fields.

- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/links/[id]`

Delete share link.

- **Response (200):** `{ "success": true }`

#### `GET /api/s/[code]` (Public)

Resolve a short link, increment click count, and redirect with UTM parameters appended.

- **Response (302):** Redirect to original URL with UTM params
- **Error:** 404 (not found or inactive), 410 (expired)

---

### 5. Marketing Workflows

#### `GET /api/admin/workflows`

List marketing workflows.

- **Query Params:** `offset`, `limit`, `status`
- **Response (200):** `{ "items": [...], "total": 10 }`

#### `POST /api/admin/workflows`

Create a new workflow. Validated with Zod `CreateWorkflowSchema`.

- **Request Body:**
  ```json
  {
    "name": "Q1 Product Launch",
    "contentId": "uuid",
    "assetId": "uuid",
    "listId": "uuid"
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/workflows/[id]`

Get workflow by ID with comments and parsed shareLinkIds.

- **Response (200):** `{ "workflow": {..., "shareLinkIds": [...]}, "comments": [...] }`

#### `PATCH /api/admin/workflows/[id]`

Update workflow step or status.

- **Update step:**
  ```json
  { "action": "update-step", "step": 2, "contentId": "uuid" }
  ```
- **Update status:**
  ```json
  { "action": "update-status", "status": "active" }
  ```
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/workflows/[id]`

Delete workflow.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/workflows/[id]/approve`

Mark workflow as approved by the current user.

- **Response (200):** `{ "success": true }`

#### `GET /api/admin/workflows/[id]/comments`

List comments on a workflow.

- **Response (200):** `{ "comments": [...] }`

#### `POST /api/admin/workflows/[id]/comments`

Add a comment to a workflow. Validated with Zod `WorkflowCommentSchema`.

- **Request Body:**
  ```json
  { "content": "Looks good, minor formatting fix needed.", "stepIndex": 1 }
  ```
- **Response (201):** `{ "id": "uuid" }`

---

### 6. AI Analysis

#### `GET /api/admin/analysis/frameworks`

List all analysis frameworks with assessment counts.

- **Response (200):**
  ```json
  {
    "frameworks": [
      {
        "id": "uuid",
        "categoryKey": "competitive_analysis",
        "categoryName": "Competitive Analysis",
        "analysisTypes": [{"index": 0, "name": "Market Position"}],
        "totalItems": 12,
        "assessmentCount": 5
      }
    ]
  }
  ```

#### `GET /api/admin/analysis/frameworks/[key]`

Get a single framework by categoryKey with all its assessments.

- **Response (200):** `{ "framework": {..., "analysisTypes": [...]}, "assessments": [...] }`
- **Error:** 404

#### `GET /api/admin/analysis/assessments`

List assessments with filtering.

- **Query Params:** `offset`, `limit`, `frameworkId`, `projectName`, `status` (not_started|in_progress|completed)
- **Response (200):** `{ "items": [...], "total": 30 }`

#### `POST /api/admin/analysis/assessments`

Create a new assessment. Validated with Zod `CreateAssessmentSchema`.

- **Request Body:**
  ```json
  { "frameworkId": "uuid", "projectName": "Project Alpha" }
  ```
- **Response (201):** `{ "id": "uuid" }`
- **Error:** 404 (framework not found)

#### `GET /api/admin/analysis/assessments/[id]`

Get assessment by ID with parsed itemScores.

- **Response (200):** `{ "assessment": {..., "itemScores": [...]} }`

#### `PATCH /api/admin/analysis/assessments/[id]`

Update item scores or complete an assessment.

- **Update scores:**
  ```json
  {
    "itemScores": [
      { "itemIndex": 0, "score": 85, "status": "completed", "notes": "Strong position" }
    ]
  }
  ```
- **Complete assessment:**
  ```json
  { "action": "complete" }
  ```
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/analysis/assessments/[id]`

Delete assessment.

- **Response (200):** `{ "success": true }`

#### `GET /api/admin/analysis/assessments/[id]/export`

Export assessment as downloadable JSON file.

- **Response (200):** JSON file download with `Content-Disposition: attachment` header
  ```json
  {
    "framework": { "categoryKey": "...", "categoryName": "..." },
    "projectName": "...",
    "status": "completed",
    "overallScore": 78.5,
    "itemScores": [...],
    "exportedAt": "2026-01-15T10:30:00Z"
  }
  ```

#### `GET /api/admin/analysis/dashboard`

Get analysis dashboard summary stats.

- **Response (200):**
  ```json
  {
    "stats": {
      "totalFrameworks": 8,
      "totalAssessments": 45,
      "byStatus": { "notStarted": 10, "inProgress": 15, "completed": 20 }
    },
    "recentAssessments": [...]
  }
  ```

---

### 7. Campaigns

#### `GET /api/admin/campaigns`

List all campaigns.

- **Response (200):** `{ "campaigns": [...] }`

#### `POST /api/admin/campaigns`

Create a new email campaign.

- **Request Body:**
  ```json
  {
    "name": "Q1 Newsletter",
    "type": "email",
    "audienceType": "list",
    "audienceId": "uuid",
    "emailProfileId": "uuid",
    "templateId": "uuid",
    "subject": "January Newsletter",
    "throttlePerMinute": 60
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/campaigns/[id]`

Get campaign by ID with A/B test variants.

- **Response (200):** `{ "campaign": {...}, "variants": [...] }`

#### `PATCH /api/admin/campaigns/[id]`

Update campaign fields. Dates are parsed from ISO strings.

- **Request Body:** Partial campaign fields
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/campaigns/[id]`

Delete campaign.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/campaigns/[id]/launch`

Launch a campaign (creates a background job for sending).

- **Preconditions:** Campaign must be in `draft` or `paused` status
- **Response (200):** `{ "success": true, "message": "Campaign launched" }`
- **Error:** 400 (invalid status), 404 (not found)

#### `GET /api/admin/campaigns/[id]/recipients`

List campaign recipients with delivery status.

- **Query Params:** `offset`, `limit`, `status` (pending|sent|delivered|opened|clicked|bounced|failed)
- **Response (200):** `{ "recipients": [...], "total": 500 }`

---

### 8. Contacts (CRM)

#### `GET /api/admin/contacts`

List contacts with filtering.

- **Query Params:** `offset`, `limit`, `search`, `status` (active|unsubscribed|bounced|inactive), `source` (manual|import|contact_form|survey|booking|newsletter)
- **Response (200):** `{ "contacts": [...], "total": 1200 }`

#### `POST /api/admin/contacts`

Create a single contact or perform bulk operations.

- **Single create:**
  ```json
  { "email": "user@example.com", "firstName": "John", "lastName": "Doe", "company": "Acme" }
  ```
- **Bulk delete:**
  ```json
  { "action": "bulk-delete", "ids": ["uuid1", "uuid2"] }
  ```
- **Bulk tag:**
  ```json
  { "action": "bulk-tag", "ids": ["uuid1"], "tags": ["vip", "partner"] }
  ```
- **Response:** 201 (create) or 200 (bulk actions)

#### `GET /api/admin/contacts/[id]`

Get contact by ID with event timeline.

- **Response (200):** `{ "contact": {...}, "events": [...] }`

#### `PATCH /api/admin/contacts/[id]`

Update contact fields.

- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/contacts/[id]`

Delete contact.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/contacts/import`

Import contacts from CSV file.

- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (CSV file)
- **Response (200):**
  ```json
  {
    "result": { "imported": 150, "duplicates": 10, "errors": 2, "total": 162 }
  }
  ```

#### `GET /api/admin/contacts/import/[id]`

Get import job status and details.

- **Response (200):**
  ```json
  {
    "id": "uuid",
    "fileName": "contacts.csv",
    "status": "completed",
    "totalRows": 162,
    "importedCount": 150,
    "duplicateCount": 10,
    "errorCount": 2,
    "columnMapping": {...},
    "errors": [...]
  }
  ```

#### `GET /api/admin/contacts/export`

Export all contacts as CSV file download.

- **Response (200):** CSV file with `Content-Disposition: attachment` header

---

### 9. Lists

#### `GET /api/admin/lists`

List all contact lists.

- **Response (200):** `{ "lists": [...] }`

#### `POST /api/admin/lists`

Create a new list (static or dynamic).

- **Request Body:**
  ```json
  {
    "name": "VIP Contacts",
    "description": "High-value leads",
    "type": "static",
    "segmentRules": null
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/lists/[id]`

Get list by ID with paginated members.

- **Query Params:** `offset`, `limit`
- **Response (200):** `{ "list": {...}, "members": [...] }`

#### `PATCH /api/admin/lists/[id]`

Update list metadata or manage members.

- **Update metadata:**
  ```json
  { "name": "Updated Name", "description": "Updated description" }
  ```
- **Add members:**
  ```json
  { "action": "add-members", "contactIds": ["uuid1", "uuid2"] }
  ```
- **Remove members:**
  ```json
  { "action": "remove-members", "contactIds": ["uuid1"] }
  ```
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/lists/[id]`

Delete list and all member associations.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/lists/[id]/preview`

Preview dynamic segment rule evaluation.

- **Request Body:**
  ```json
  {
    "rules": {
      "logic": "AND",
      "conditions": [
        { "field": "status", "operator": "equals", "value": "active" }
      ]
    }
  }
  ```
- **Response (200):** Matching contacts and count

---

### 10. Email Templates

#### `GET /api/admin/templates`

List all email templates.

- **Response (200):** `{ "templates": [...] }`

#### `POST /api/admin/templates`

Create a new email template.

- **Request Body:**
  ```json
  {
    "name": "Welcome Email",
    "description": "New subscriber welcome",
    "category": "onboarding",
    "subject": "Welcome, {{firstName}}!",
    "htmlContent": "<h1>Welcome</h1>...",
    "textContent": "Welcome...",
    "variables": ["firstName", "company"]
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/templates/[id]`

Get template by ID with version history.

- **Response (200):** `{ "template": {...}, "versions": [...] }`

#### `PATCH /api/admin/templates/[id]`

Update template, create version, or preview with variables.

- **Update fields:** Send partial template fields
- **Create version:**
  ```json
  { "action": "create-version", "subject": "...", "htmlContent": "...", "textContent": "..." }
  ```
- **Preview with variables:**
  ```json
  { "action": "preview", "variables": { "firstName": "John" } }
  ```
  Response: `{ "html": "<rendered html>" }`
- **Response (200):** `{ "success": true }` or `{ "versionId": "uuid" }`

#### `DELETE /api/admin/templates/[id]`

Delete template.

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/templates/[id]/test-send`

Send a test email using the template. Validated with Zod `TestSendSchema`.

- **Request Body:**
  ```json
  { "to": "test@example.com", "variables": { "firstName": "Test" } }
  ```
- **Response (200):** `{ "success": true, "messageId": "smtp-id" }`

---

### 11. Broadcasts

#### `GET /api/admin/broadcasts`

List all broadcasts.

- **Response (200):** `{ "broadcasts": [...] }`

#### `POST /api/admin/broadcasts`

Create a new broadcast.

- **Request Body:**
  ```json
  {
    "name": "Product Update",
    "subject": "New Feature Release",
    "htmlContent": "<h1>Exciting News</h1>...",
    "profileId": "uuid",
    "audienceType": "list",
    "audienceId": "uuid",
    "throttlePerMinute": 100
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/broadcasts/[id]`

Get broadcast by ID.

- **Response (200):** `{ "broadcast": {...} }`

#### `PATCH /api/admin/broadcasts/[id]`

Update broadcast or launch it.

- **Launch:**
  ```json
  { "action": "launch" }
  ```
- **Update fields:** Send partial broadcast fields
- **Response (200):** `{ "success": true }`

#### `DELETE /api/admin/broadcasts/[id]`

Delete broadcast.

- **Response (200):** `{ "success": true }`

---

### 12. Chat (Admin)

#### `GET /api/admin/chat/sessions`

List chat sessions.

- **Query Params:** `offset`, `limit`, `status` (active|closed)
- **Response (200):** `{ "sessions": [...], "total": 50, "offset": 0, "limit": 50 }`

#### `GET /api/admin/chat/sessions/[id]`

Get session with full conversation and message evaluations.

- **Response (200):**
  ```json
  {
    "session": {...},
    "messages": [{ ..., "evals": [{...}] }],
    "request": {...}
  }
  ```

#### `GET /api/admin/chat/requests`

List chat support requests.

- **Query Params:** `offset`, `limit`, `status` (new|triaged|responding|waiting_user|resolved|closed), `priority` (low|medium|high|urgent)
- **Response (200):** `{ "requests": [...], "total": 25, "offset": 0, "limit": 50 }`

#### `GET /api/admin/chat/requests/[id]`

Get chat request details.

- **Response (200):** Request object with session and messages

#### `PATCH /api/admin/chat/requests/[id]`

Update request status or assignment.

- **Request Body:**
  ```json
  { "status": "responding", "assignedTo": "user-uuid" }
  ```
- **Response (200):** Updated request object

#### `POST /api/admin/chat/requests/[id]/respond`

Send an admin response to a chat request (saves message and sends email if visitor email is captured).

- **Request Body:**
  ```json
  { "content": "Thank you for reaching out. Here is the information..." }
  ```
- **Response (200):** `{ "messageId": "uuid", "emailSent": true }`

#### `GET /api/admin/chat/requests/[id]/notes`

List admin notes for a chat request.

- **Response (200):** Array of note objects

#### `POST /api/admin/chat/requests/[id]/notes`

Add an internal admin note to a chat request.

- **Request Body:** `{ "content": "Follow up required next week" }`
- **Response (201):** `{ "id": "uuid" }`

---

### 13. RAG Pipeline

#### `GET /api/admin/rag/documents`

List RAG documents.

- **Query Params:** `offset`, `limit`, `status` (pending|ingested|chunked|embedded|failed), `sourceType` (upload|url|sitepage|text|api)
- **Response (200):** `{ "items": [...], "total": 20, "offset": 0, "limit": 50 }`

#### `POST /api/admin/rag/documents`

Create a new RAG document record.

- **Request Body:**
  ```json
  {
    "name": "Product FAQ",
    "sourceType": "url",
    "sourceUrl": "https://example.com/faq",
    "mimeType": "text/html",
    "metadata": { "category": "support" }
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/rag/documents/[id]`

Get document with chunk and embedding counts.

- **Response (200):** `{ "document": {...}, "chunkCount": 45, "embeddingCount": 45 }`

#### `PATCH /api/admin/rag/documents/[id]`

Update document status.

- **Request Body:**
  ```json
  { "status": "ingested", "chunkCount": 45 }
  ```
- **Response (200):** `{ "document": {...} }`

#### `DELETE /api/admin/rag/documents/[id]`

Delete document with cascade (embeddings, chunks, then document).

- **Response (200):** `{ "success": true }`

#### `POST /api/admin/rag/documents/[id]/ingest`

Trigger document ingestion (creates a background job).

- **Response (202):** `{ "jobId": "uuid", "documentId": "uuid" }`
- **Error:** 409 (document already processed)

#### `GET /api/admin/rag/documents/[id]/chunks`

List document chunks with content.

- **Query Params:** `offset`, `limit`
- **Response (200):**
  ```json
  {
    "items": [{ "id": "uuid", "chunkIndex": 0, "contentPreview": "...", "content": "...", "tokenCount": 128 }],
    "total": 45,
    "documentId": "uuid"
  }
  ```

#### `GET /api/admin/rag/runs`

List RAG pipeline runs.

- **Query Params:** `offset`, `limit`, `type` (ingest|chunk|embed|full_pipeline|evaluation), `status`
- **Response (200):** `{ "items": [...], "total": 15, "offset": 0, "limit": 50 }`

#### `POST /api/admin/rag/runs`

Create a new pipeline run.

- **Request Body:**
  ```json
  {
    "type": "full_pipeline",
    "documentIds": ["uuid1", "uuid2"],
    "config": { "chunkSize": 512 }
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/rag/runs/[id]`

Get run details with steps and metrics.

- **Response (200):** `{ "run": {...}, "steps": [...], "metrics": [...] }`

#### `POST /api/admin/rag/search`

Perform hybrid semantic + keyword search over the RAG index.

- **Request Body:**
  ```json
  {
    "query": "How does the product handle data privacy?",
    "k": 10,
    "vectorWeight": 0.7,
    "keywordWeight": 0.3,
    "rerankEnabled": false
  }
  ```
- **Response (200):**
  ```json
  {
    "query": "...",
    "config": {...},
    "results": [{ "content": "...", "score": 0.89, "documentId": "...", "chunkIndex": 3 }],
    "totalResults": 10
  }
  ```

#### `POST /api/admin/rag/evaluate`

Run RAGAS-style evaluation on retrieval quality.

- **Request Body:**
  ```json
  {
    "query": "What are the pricing tiers?",
    "referenceAnswer": "We offer three pricing tiers..."
  }
  ```
- **Response (200):**
  ```json
  {
    "query": "...",
    "retrievalConfig": {...},
    "retrievedChunks": 10,
    "metrics": { "faithfulness": 0.85, "relevance": 0.92, "precision": 0.78 },
    "chunks": [...]
  }
  ```

#### `GET /api/admin/rag/config`

Get active RAG configuration and version history.

- **Response (200):** `{ "active": {...} | null, "history": [...] }`

#### `POST /api/admin/rag/config`

Create a new configuration version.

- **Request Body:**
  ```json
  {
    "name": "v2 - larger chunks",
    "config": { "chunkSize": 1024, "chunkOverlap": 100, "embeddingModel": "text-embedding-3-small", "retrievalK": 15 }
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `PATCH /api/admin/rag/config`

Activate a specific configuration version.

- **Request Body:** `{ "id": "config-uuid" }`
- **Response (200):** `{ "active": {...} }`

#### `GET /api/admin/rag/health`

Get RAG system health metrics.

- **Response (200):**
  ```json
  {
    "documents": { "total": 20, "byStatus": {...} },
    "totalEmbeddings": 450,
    "cache": { "total": 100, "hitRate": 0.75 },
    "lastRun": { "id": "uuid", "type": "full_pipeline", "status": "completed" }
  }
  ```

---

### 14. Integrations

#### `GET /api/admin/integrations`

List all available integrations with their connected accounts.

- **Response (200):** Array of integration objects with `accounts` nested

#### `GET /api/admin/integrations/[id]`

Get integration by ID with connected accounts.

- **Response (200):** `{ ...integration, "accounts": [...] }`

#### `POST /api/admin/integrations/[id]`

Create a new connected account for an integration.

- **Request Body:**
  ```json
  {
    "name": "Production Slack",
    "credentials": { "webhook_url": "https://hooks.slack.com/..." },
    "settings": { "channel": "#notifications" }
  }
  ```
- **Response (201):** `{ "id": "uuid" }`

#### `DELETE /api/admin/integrations/[id]?accountId=uuid`

Delete a connected account.

- **Query Param:** `accountId`
- **Response (200):** `{ "success": true }`

#### `POST /api/admin/integrations/[id]/test`

Test connectivity for an integration.

- **Response (200):** `{ "success": true, "message": "Connection verified" }`

#### `GET /api/admin/integrations/[id]/logs`

List API call logs for an integration account.

- **Query Params:** `offset`, `limit`
- **Response (200):** `{ "logs": [...], "total": 100, "offset": 0, "limit": 50 }`

---

### 15. Analytics

#### `GET /api/admin/analytics/campaigns`

Get campaign analytics dashboard data.

- **Response (200):**
  ```json
  {
    "summary": {
      "totalCampaigns": 25,
      "completedCampaigns": 18,
      "totalSent": 15000,
      "totalOpened": 6000,
      "totalClicked": 900,
      "totalBounced": 150,
      "openRate": "40.0",
      "clickRate": "6.0",
      "bounceRate": "1.0"
    },
    "topCampaigns": [...],
    "recentCampaigns": [...]
  }
  ```

#### `GET /api/admin/analytics/contacts`

Get contact analytics with source and lead score distributions.

- **Response (200):**
  ```json
  {
    "summary": { "totalContacts": 1200, "activeContacts": 1050, "unsubscribed": 100, "bounced": 50 },
    "sourceDistribution": [{ "source": "contact_form", "count": 500 }],
    "scoreDistribution": [{ "bucket": "Hot (80+)", "count": 120 }]
  }
  ```

---

### 16. System & Admin

#### `GET /api/admin/dashboard`

Get admin dashboard summary statistics.

- **Response (200):** `{ "stats": {...} }`

#### `GET /api/admin/activity`

Get recent audit log activity (last 15 entries).

- **Response (200):** `{ "entries": [...] }`

#### `GET /api/admin/health`

System health check with database stats, queue status, and recent errors.

- **Response (200):**
  ```json
  {
    "status": "healthy",
    "database": { "sizeMB": 12.5, "tables": { "users": 5, "blog_posts": 42, ... } },
    "queue": { "pending": 3, "running": 1, "completed": 150, "failed": 2 },
    "recentErrors": [...],
    "uptime": 86400,
    "timestamp": "2026-01-15T10:30:00Z"
  }
  ```

#### `GET /api/admin/settings`

Get all site settings.

- **Response (200):** `{ "settings": [...] }`

#### `PUT /api/admin/settings`

Create or update a site setting. Audit logged.

- **Request Body:** `{ "key": "site_name", "value": "TalentsHill" }`
- **Response (200):** `{ "success": true }`

#### `GET /api/admin/maintenance`

Get maintenance mode status.

- **Response (200):** `{ "enabled": false, "message": null, "scheduledEnd": null }`

#### `POST /api/admin/maintenance`

Enable or disable maintenance mode.

- **Request Body:**
  ```json
  { "enabled": true, "message": "Scheduled maintenance in progress", "scheduledEnd": "2026-01-15T12:00:00Z" }
  ```
- **Response (200):** `{ "success": true }`

#### `POST /api/admin/email-compose`

Send an ad-hoc email via the default broadcast profile.

- **Request Body:**
  ```json
  { "to": "recipient@example.com", "subject": "Quick Note", "html": "<p>Hello</p>" }
  ```
- **Response (200):** `{ "success": true }`

---

### 17. Users

#### `GET /api/admin/users`

List admin users.

- **Response (200):** Array of user objects

#### `POST /api/admin/users`

Create a new admin user.

- **Response (201):** `{ "id": "uuid" }`

#### `GET /api/admin/users/[id]`

Get user by ID.

#### `PATCH /api/admin/users/[id]`

Update user fields (name, role, isActive).

#### `DELETE /api/admin/users/[id]`

Delete user.

---

### 18. Roles (RBAC)

#### `GET /api/admin/roles`

List all roles with permissions.

#### `POST /api/admin/roles`

Create a new role with permissions.

#### `GET /api/admin/roles/[id]`

Get role by ID with assigned permissions.

#### `PATCH /api/admin/roles/[id]`

Update role name, description, or permissions.

#### `DELETE /api/admin/roles/[id]`

Delete role (system roles cannot be deleted).

---

### 19. Feature Flags

#### `GET /api/admin/features`

List all feature flags.

#### `POST /api/admin/features`

Create a new feature flag.

#### `GET /api/admin/features/[id]`

Get feature flag by ID with version history.

#### `PATCH /api/admin/features/[id]`

Toggle flag or update configuration.

#### `DELETE /api/admin/features/[id]`

Delete feature flag.

#### `POST /api/admin/features/bust-cache`

Bust the server-side feature flag cache (forces reload from database).

- **Response (200):** `{ "success": true }`

---

### 20. Email Profiles & SMTP

#### `GET /api/admin/email-profiles`

List all email sender profiles.

#### `POST /api/admin/email-profiles`

Create a new email profile.

#### `GET /api/admin/email-profiles/[id]`

Get profile by ID with linked SMTP configs.

#### `PATCH /api/admin/email-profiles/[id]`

Update profile fields.

#### `DELETE /api/admin/email-profiles/[id]`

Delete profile.

#### `GET /api/admin/smtp-configs`

List SMTP configurations.

#### `POST /api/admin/smtp-configs`

Create a new SMTP configuration (password is encrypted before storage).

#### `GET /api/admin/smtp-configs/[id]`

Get SMTP config by ID.

#### `PATCH /api/admin/smtp-configs/[id]`

Update SMTP config.

#### `DELETE /api/admin/smtp-configs/[id]`

Delete SMTP config.

#### `GET /api/admin/event-routes`

List email event routes (maps event types to sender profiles).

#### `POST /api/admin/event-routes`

Create or update event route.

---

### 21. Media

#### `GET /api/admin/media`

List uploaded media files.

#### `POST /api/admin/media`

Upload a new media file.

- **Content-Type:** `multipart/form-data`
- **Response (201):** `{ "id": "uuid", "url": "/uploads/..." }`

#### `GET /api/admin/media/[id]`

Get media item by ID.

#### `PATCH /api/admin/media/[id]`

Update media metadata (alt text, tags, folder).

#### `DELETE /api/admin/media/[id]`

Delete media file.

---

### 22. Banners

#### `GET /api/admin/banners`

List all banners.

#### `POST /api/admin/banners`

Create a new banner.

#### `GET /api/admin/banners/[id]`

Get banner by ID.

#### `PATCH /api/admin/banners/[id]`

Update banner.

#### `DELETE /api/admin/banners/[id]`

Delete banner.

---

### 23. Content Overrides

#### `GET /api/admin/content-overrides`

List content overrides (CMS overrides for page sections).

#### `POST /api/admin/content-overrides`

Create or update a content override.

---

### 24. Videos

#### `GET /api/admin/videos`

List all videos.

#### `POST /api/admin/videos`

Create a new video entry.

#### `GET /api/admin/videos/[id]`

Get video by ID.

#### `PATCH /api/admin/videos/[id]`

Update video fields.

#### `DELETE /api/admin/videos/[id]`

Delete video.

---

### 25. Services & Industries

#### `GET /api/admin/services`

List all services.

#### `POST /api/admin/services`

Create a new service.

#### `GET /api/admin/services/[id]`

Get service by ID.

#### `PATCH /api/admin/services/[id]`

Update service fields.

#### `DELETE /api/admin/services/[id]`

Delete service.

#### `GET /api/admin/industries`

List all industries.

#### `POST /api/admin/industries`

Create a new industry.

#### `GET /api/admin/industries/[id]`

Get industry by ID.

#### `PATCH /api/admin/industries/[id]`

Update industry fields.

#### `DELETE /api/admin/industries/[id]`

Delete industry.

---

### 26. Jobs & Runs

#### `GET /api/admin/jobs`

List background jobs.

- **Query Params:** `offset`, `limit`, `status`, `type`

#### `GET /api/admin/jobs/[id]`

Get job by ID with runs and logs.

#### `PATCH /api/admin/jobs/[id]`

Update job status (cancel, pause, retry).

#### `GET /api/admin/runs`

List operations runs (campaign sends, imports, etc.).

#### `GET /api/admin/runs/[id]`

Get run by ID with event log.

---

### 27. Webhooks

#### `GET /api/admin/webhooks`

List configured webhooks.

#### `POST /api/admin/webhooks`

Create a new webhook.

#### `GET /api/admin/webhooks/[id]`

Get webhook by ID.

#### `PATCH /api/admin/webhooks/[id]`

Update webhook configuration.

#### `DELETE /api/admin/webhooks/[id]`

Delete webhook.

---

### 28. Leads (Contact Submissions)

#### `GET /api/admin/leads`

List contact form submissions (leads).

- **Query Params:** `offset`, `limit`, `status`, `leadTier`, `industry`

#### `GET /api/admin/leads/[id]`

Get lead by ID.

#### `PATCH /api/admin/leads/[id]`

Update lead status.

#### `GET /api/admin/leads/export`

Export leads as CSV file.

---

### 29. Survey (Admin)

#### `GET /api/admin/survey`

List survey responses with filtering.

- **Query Params:** `maturityLevel`, `industry`

---

## Public Endpoints (No Auth Required)

### 30. Contact Form

#### `POST /api/contact`

Submit public contact form. Rate limited. Validated with Zod. Triggers lead scoring, persists to DB, sends admin notification and user confirmation emails.

- **Rate Limited:** Yes
- **Request Body:**
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "role": "CTO",
    "industry": "technology",
    "interestAreas": ["ai-consulting", "data-analytics"],
    "projectStage": "evaluating",
    "budgetRange": "50k-100k",
    "timeline": "3-6-months",
    "message": "We are interested in...",
    "consent": true
  }
  ```
- **Response (201):**
  ```json
  { "success": true, "message": "Your message has been sent...", "id": "uuid" }
  ```

### 31. Survey

#### `POST /api/survey`

Submit an AI maturity assessment survey. Rate limited. Triggers scoring, segmentation, and optional email.

- **Rate Limited:** Yes
- **Request Body:**
  ```json
  {
    "answers": [{ "questionId": "q1", "value": "option-a", "scoreValue": 5 }],
    "contactName": "Jane Doe",
    "email": "jane@example.com",
    "company": "Acme",
    "industry": "technology",
    "companySize": "50-200",
    "role": "CTO"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "id": "uuid",
    "score": 72,
    "level": "advanced",
    "recommendedPath": "ai-integration",
    "segmentationTags": ["tech-advanced", "mid-market"]
  }
  ```

### 32. Newsletter

#### `POST /api/newsletter`

Subscribe to blog newsletter.

- **Request Body:** `{ "email": "user@example.com" }`
- **Response (201):** `{ "success": true }` or 409 (already subscribed)

### 33. Demo Request

#### `POST /api/demo`

Submit a demo request (creates an appointment).

- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Acme Corp",
    "platform": "genai",
    "preferredDate": "2026-02-20",
    "preferredTime": "14:00",
    "useCase": "Customer support automation",
    "notes": "Interested in enterprise plan"
  }
  ```
- **Response (200):** `{ "success": true, "message": "Demo request submitted", "appointmentId": "uuid" }`

### 34. Appointments

#### `GET /api/appointments`

List appointments with optional filters.

- **Query Params:** `status`, `date`, `search`, `stats=true` (returns stats only)
- **Response (200):** `{ "appointments": [...], "total": 15 }` or `{ "stats": {...} }`

#### `POST /api/appointments`

Create an appointment booking with lead scoring.

- **Request Body:** Full appointment object (service, dateTime, contact, requirements)
- **Response (201):** `{ "appointment": {...}, "leadScore": 75, "leadTier": "warm" }`

#### `GET /api/appointments/[id]`

Get appointment by ID.

#### `PATCH /api/appointments/[id]`

Update appointment status.

- **Request Body:** `{ "status": "confirmed" }`
- **Valid statuses:** `pending`, `confirmed`, `completed`, `cancelled`

#### `DELETE /api/appointments/[id]`

Delete appointment.

#### `GET /api/appointments/slots`

Get available booking time slots for a date.

- **Query Param:** `date` (YYYY-MM-DD, required)
- **Response (200):** `{ "date": "2026-02-20", "available": ["09:00", "10:00", ...], "booked": ["14:00"] }`

#### `GET /api/appointments/export`

Export all appointments as CSV file.

### 35. Chat (Public)

#### `POST /api/chat`

Send a chat message (creates session if needed, processes via AI response engine).

- **Request Body:**
  ```json
  { "message": "What services do you offer?", "sessionToken": "uuid-or-null" }
  ```
- **Response (200):** `{ "response": "AI-generated response...", "sessionToken": "uuid" }`

#### `GET /api/chat/session?token=uuid`

Get chat session by token.

#### `POST /api/chat/session`

Create a new chat session explicitly.

- **Request Body:** `{ "email": "visitor@example.com", "name": "Visitor" }`
- **Response (200):** `{ "id": "uuid", "sessionToken": "uuid" }`

#### `POST /api/chat/email`

Capture visitor email during a chat session (links to CRM contact if exists).

- **Request Body:**
  ```json
  { "sessionToken": "uuid", "email": "visitor@example.com", "name": "Visitor" }
  ```
- **Response (200):** `{ "success": true, "contactLinked": true }`

### 36. Blog (Public)

#### `GET /api/blog/posts`

List published blog posts (or all posts with `admin=true`).

- **Query Params:** `offset`, `limit` (default 12), `category`, `tag`, `search`, `status`, `admin=true`
- **Response (200):** `{ "posts": [...], "total": 42, "offset": 0, "limit": 12 }`

#### `POST /api/blog/posts`

Create a blog post.

- **Request Body:** `{ "title": "...", "content": "...", "summary": "...", ... }`
- **Response (201):** `{ "post": {...} }`

#### `GET /api/blog/posts/[id]`

Get blog post by ID or slug.

- **Response (200):** `{ "post": {...} }`

#### `PATCH /api/blog/posts/[id]`

Update blog post fields.

#### `DELETE /api/blog/posts/[id]`

Delete blog post.

#### `POST /api/blog/posts/[id]/publish`

Publish or unpublish a blog post.

#### `GET /api/blog/categories`

List blog categories.

#### `GET /api/blog/tags`

List blog tags.

#### `GET /api/blog/stats`

Get blog statistics (post count, view count, subscriber count).

#### `POST /api/blog/views`

Track a blog post view.

- **Request Body:** `{ "postId": "uuid", "sessionId": "visitor-session-id" }`

#### `POST /api/blog/subscribers`

Subscribe to blog newsletter (alias for `/api/newsletter`).

### 37. Banners (Public)

#### `GET /api/banners/active`

Get currently active banners for the public site.

- **Query Params:** `placement` (top|bottom|modal|inline)
- **Response (200):** `{ "banners": [...] }`

### 38. Careers

#### `POST /api/careers`

Submit a job application.

- **Request Body:** `{ "email": "...", "jobId": "...", ... }`
- **Response (200):** `{ "success": true, "message": "Application submitted" }`

### 39. Email Tracking (Transparent)

#### `GET /api/t/o/[id]`

Email open tracking pixel. Returns a 1x1 GIF and logs the open event.

- **Response (200):** 1x1 transparent GIF (`image/gif`)

#### `GET /api/t/c/[id]?url=encoded-url`

Click tracking redirect. Logs the click event and redirects to the target URL.

- **Query Param:** `url` (URL-encoded destination)
- **Response (302):** Redirect to decoded URL

#### `GET /api/t/u/[token]`

Validate an unsubscribe token.

- **Response (200):** `{ "valid": true, "contactId": "uuid" }`
- **Error:** 404 (invalid or expired)

#### `POST /api/t/u/[token]`

Execute unsubscribe using a one-time token.

- **Response (200):** `{ "success": true, "message": "Successfully unsubscribed" }`
