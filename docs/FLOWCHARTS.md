# TalentsHill Admin Portal -- Flowcharts, Sequence Diagrams & Process Flows

> Next.js 14+ App Router | SQLite + Drizzle ORM | 79 tables | 124 API routes | 62 admin pages

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Content Publishing Flow](#2-content-publishing-flow)
3. [Marketing Workflow](#3-marketing-workflow)
4. [Campaign Execution Flow](#4-campaign-execution-flow)
5. [RAG Pipeline Flow](#5-rag-pipeline-flow)
6. [AI Analysis Assessment Flow](#6-ai-analysis-assessment-flow)
7. [Contact Import Flow](#7-contact-import-flow)
8. [Share Link Click Flow](#8-share-link-click-flow)
9. [Chatbot Request Flow](#9-chatbot-request-flow)
10. [Segment Evaluation Flow](#10-segment-evaluation-flow)

---

## 1. Authentication Flow

Admin users authenticate via email/password. The middleware (`middleware.ts`) guards all `/admin/*` routes by verifying a JWT stored in an `admin_session` cookie. Rate limiting is enforced per-IP on the login endpoint.

**Key files:**
- `middleware.ts` -- JWT verification, redirect to `/admin/login` on failure
- `app/api/auth/login/route.ts` -- credential validation, JWT signing, cookie setting
- `lib/security/session.ts` -- `signToken()`, `SESSION_COOKIE_NAME`
- `lib/security/rate-limiter.ts` -- `authLimiter.check(clientIp)`
- `lib/db/rbac-queries.ts` -- `getUserRoles()`

```mermaid
sequenceDiagram
    actor User
    participant Login as /admin/login Page
    participant API as POST /api/auth/login
    participant RL as Rate Limiter
    participant DB as SQLite (users, user_roles)
    participant JWT as JWT Signer
    participant Cookie as Set-Cookie

    User->>Login: Enter email + password
    Login->>API: POST { email, password }

    API->>RL: authLimiter.check(clientIp)
    alt Rate limit exceeded
        RL-->>API: { allowed: false, retryAfter }
        API-->>Login: 429 Too Many Requests
        Login-->>User: "Try again later"
    end

    RL-->>API: { allowed: true }
    API->>API: normalizeEmail(email)
    API->>DB: getUserByEmail(normalizedEmail)

    alt User not found
        DB-->>API: null
        API-->>Login: 401 "Invalid email or password"
        Login-->>User: Show error
    end

    DB-->>API: user record
    API->>API: verifyPassword(password, user.passwordHash)

    alt Invalid password
        API->>DB: logAudit("login_failed", "invalid_password")
        API-->>Login: 401 "Invalid email or password"
        Login-->>User: Show error
    end

    alt Account inactive
        API->>DB: logAudit("login_failed", "account_inactive")
        API-->>Login: 403 "Account deactivated"
        Login-->>User: Show error
    end

    API->>DB: getUserRoles(user.id)
    DB-->>API: RBAC role names[]

    API->>JWT: signToken({ userId, email, name, role, roles })
    JWT-->>API: signed JWT token

    API->>Cookie: Set admin_session cookie (httpOnly, secure, sameSite=lax, maxAge=86400)
    API->>DB: logAudit("login_success", user.id)
    API-->>Login: 200 { success: true, user }
    Login-->>User: Redirect to /admin
```

---

## 2. Content Publishing Flow

Marketing content (`marketingContent` table) follows a lifecycle from draft through review, approval, and publication. Each edit creates a version snapshot in `contentVersions`. Content types include articles, brochure text, presentation text, email copy, social posts, and landing pages.

**Key files:**
- `lib/db/marketing-content-queries.ts` -- CRUD for marketing content
- `lib/db/content-version-queries.ts` -- `createVersion()`, `getVersions()`
- `app/admin/content/editor/` -- content editor admin page
- Schema: `marketingContent` (status: draft/review/approved/published/archived), `contentVersions`

```mermaid
flowchart TD
    A([Author creates content]) --> B[Status: draft]
    B --> C{Edit content?}
    C -- Yes --> D[Update title/body/metadata]
    D --> E[createVersion snapshot]
    E --> B
    C -- No --> F[Submit for review]
    F --> G[Status: review]
    G --> H{Reviewer decision}
    H -- Request changes --> I[Add reviewer comments]
    I --> B
    H -- Approve --> J[Status: approved]
    J --> K{Publish now?}
    K -- Yes --> L[Set publishedAt timestamp]
    L --> M[Status: published]
    K -- Schedule --> N[Set scheduledAt timestamp]
    N --> M
    M --> O{Archive?}
    O -- Yes --> P[Status: archived]
    O -- No --> Q([Content live on site])

    style B fill:#ffd700,color:#000
    style G fill:#87ceeb,color:#000
    style J fill:#90ee90,color:#000
    style M fill:#32cd32,color:#000
    style P fill:#d3d3d3,color:#000
```

### Content Version History

Each save creates an immutable version record:

```mermaid
flowchart LR
    subgraph Content Versions
        V1[v1 - Initial draft] --> V2[v2 - Body edits]
        V2 --> V3[v3 - Title change]
        V3 --> V4[v4 - Final approval edits]
    end
    V4 --> PUB([Published version])
```

---

## 3. Marketing Workflow

The 8-step marketing workflow orchestrates end-to-end content distribution. The `marketingWorkflows` table tracks `currentStep` (0-7), linked entity IDs, and approval state. Each step can have comments via `workflowComments`.

**Key files:**
- `lib/db/marketing-workflow-queries.ts` -- `createWorkflow()`, `updateWorkflowStep()`, `approveWorkflow()`
- `app/admin/marketing/` -- workflow admin UI
- Schema: `marketingWorkflows` (currentStep 0-7), `workflowComments`

```mermaid
flowchart TD
    START([Start Marketing Workflow]) --> S0

    S0["Step 0: Select Content
    Link marketingContent record"] --> S1

    S1["Step 1: Create Asset
    Generate brochure or presentation
    (contentAssets table)"] --> S2

    S2["Step 2: Create Share Links
    Generate short URLs with UTM params
    (shareLinks table)"] --> S3

    S3["Step 3: Select Target List
    Choose static or dynamic list
    (lists table)"] --> S4

    S4["Step 4: Configure Campaign
    Set template, subject, schedule
    (campaigns table)"] --> S5

    S5["Step 5: Submit for Approval
    Status: pending_approval"] --> S6

    S6{Approver reviews}
    S6 -- Reject --> REJ[Add comment, return to step]
    REJ --> S0
    S6 -- Approve --> S7

    S7["Step 6: Monitor Execution
    Track sends, opens, clicks
    Status: active"] --> S8

    S8["Step 7: View Results
    Campaign analytics dashboard
    Status: completed"]

    S8 --> DONE([Workflow Complete])

    style S0 fill:#e6f3ff,color:#000
    style S1 fill:#e6f3ff,color:#000
    style S2 fill:#e6f3ff,color:#000
    style S3 fill:#e6f3ff,color:#000
    style S4 fill:#e6f3ff,color:#000
    style S5 fill:#fff3e6,color:#000
    style S7 fill:#e6ffe6,color:#000
    style S8 fill:#e6ffe6,color:#000
```

---

## 4. Campaign Execution Flow

Campaigns send emails to a targeted audience (list or segment). The system supports A/B testing via `campaignVariants`, throttled sending, and granular event tracking through `emailEvents`. Each recipient gets a row in `campaignRecipients` with individual delivery status.

**Key files:**
- `lib/db/campaign-queries.ts` -- `createCampaign()`, `updateCampaignCounters()`
- `lib/db/email-event-queries.ts` -- `logEmailEvent()`, `getEventStats()`
- `lib/email/` -- email sending infrastructure
- Schema: `campaigns`, `campaignRecipients`, `campaignVariants`, `emailMessages`, `emailEvents`

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Campaign Admin Page
    participant API as /api/admin/campaigns
    participant DB as SQLite
    participant TplAPI as /api/admin/templates
    participant ListAPI as /api/admin/lists
    participant Email as Email Service (SMTP)
    participant Webhook as Webhook Callback
    participant Analytics as Campaign Analytics

    Admin->>UI: Create new campaign
    UI->>API: POST /api/admin/campaigns { name, type: "email" }
    API->>DB: INSERT campaigns (status: "draft")
    DB-->>API: campaign.id
    API-->>UI: Campaign created

    Admin->>UI: Select email template
    UI->>TplAPI: GET /api/admin/templates
    TplAPI-->>UI: Template list
    Admin->>UI: Choose template + edit subject
    UI->>API: PATCH /api/admin/campaigns/:id { templateId, subject }

    Admin->>UI: Select audience
    UI->>ListAPI: GET /api/admin/lists
    ListAPI-->>UI: Available lists
    Admin->>UI: Pick target list
    UI->>API: PATCH { audienceType: "list", audienceId, audienceCount }

    Admin->>UI: Schedule campaign
    UI->>API: PATCH { status: "scheduled", scheduledAt }
    API->>DB: UPDATE campaigns

    Note over API,Email: At scheduledAt time

    API->>DB: SELECT contacts from list_members JOIN contacts
    DB-->>API: Recipient list

    loop For each recipient (throttled)
        API->>DB: INSERT campaignRecipients (status: "pending")
        API->>Email: Send email via SMTP profile
        Email-->>API: messageId
        API->>DB: UPDATE recipient (status: "sent", sentAt, messageId)
        API->>DB: INSERT emailMessages
        API->>DB: UPDATE campaigns totalSent++
    end

    API->>DB: UPDATE campaigns (status: "completed", completedAt)

    Note over Webhook,Analytics: Async event tracking

    Webhook->>API: POST webhook callback (open/click/bounce)
    API->>DB: INSERT emailEvents { eventType, contactId, campaignId }
    API->>DB: UPDATE campaignRecipients status
    API->>DB: UPDATE campaigns counters (totalOpened/totalClicked/totalBounced)

    Admin->>Analytics: View campaign results
    Analytics->>DB: getEventStats(campaignId)
    DB-->>Analytics: { sent, delivered, opened, clicked, bounced }
```

---

## 5. RAG Pipeline Flow

The Retrieval-Augmented Generation pipeline processes documents through ingestion, chunking, and embedding stages. Each document progresses through statuses in `ragDocuments`: pending -> ingested -> chunked -> embedded. Pipeline runs are tracked in `ragRuns` with step-level detail in `ragRunSteps` and quality metrics in `ragRunMetrics`.

**Key files:**
- `lib/rag/ingestion.ts` -- text extraction from uploads/URLs
- `lib/rag/chunking.ts` -- split documents into segments
- `lib/rag/embedding.ts` -- generate vector embeddings
- `lib/rag/retrieval.ts` -- semantic search over embeddings
- `lib/rag/vector-store.ts` -- vector storage and similarity search
- `lib/rag/evaluation.ts` -- faithfulness, relevance, precision metrics
- `lib/rag/pii.ts` -- PII detection in chunks
- `lib/db/rag-document-queries.ts`, `rag-chunk-queries.ts`, `rag-embedding-queries.ts`, `rag-run-queries.ts`, `rag-cache-queries.ts`
- Schema: `ragDocuments`, `ragChunks`, `ragEmbeddings`, `ragRuns`, `ragRunSteps`, `ragRunMetrics`, `ragCache`, `ragConfigs`

```mermaid
flowchart TD
    subgraph Ingestion Phase
        A([Upload Document / Provide URL]) --> B[Create ragDocuments record]
        B --> C[Status: pending]
        C --> D[Ingest: Extract raw text]
        D --> E{Extraction OK?}
        E -- No --> FAIL1[Status: failed]
        E -- Yes --> F[Status: ingested]
    end

    subgraph Chunking Phase
        F --> G[Chunk: Split into segments]
        G --> H[Store ragChunks with metadata]
        H --> I[Compute token counts + hashes]
        I --> J[Update chunkCount on document]
        J --> K[Status: chunked]
    end

    subgraph Embedding Phase
        K --> L[Embed: Generate vectors per chunk]
        L --> M[Store ragEmbeddings]
        M --> N[Status: embedded]
    end

    subgraph Run Tracking
        RT1[Create ragRuns record] --> RT2[Log ragRunSteps per phase]
        RT2 --> RT3[Record ragRunMetrics]
        RT3 --> RT4[faithfulness / relevance / precision / recall / pii_detected / chunk_quality]
    end

    subgraph Retrieval Phase
        Q([User Search Query]) --> R[Compute query embedding]
        R --> S{Cache hit?}
        S -- Yes --> T[Return cached results from ragCache]
        S -- No --> U[Cosine similarity search over ragEmbeddings]
        U --> V[Retrieve top-K ragChunks]
        V --> W[Cache results in ragCache]
        W --> X([Return relevant chunks])
    end

    N -.-> Q

    style C fill:#ffd700,color:#000
    style F fill:#87ceeb,color:#000
    style K fill:#87ceeb,color:#000
    style N fill:#32cd32,color:#000
    style FAIL1 fill:#ff6b6b,color:#fff
```

---

## 6. AI Analysis Assessment Flow

Analysis assessments use predefined frameworks (`analysisFrameworks`) containing categories of analysis types. Each assessment scores individual items on a 0-100 scale, calculates a weighted overall score, and can be exported as JSON.

**Key files:**
- `lib/db/analysis-framework-queries.ts` -- framework definitions
- `lib/db/analysis-assessment-queries.ts` -- `createAssessment()`, `updateItemScores()`, `completeAssessment()`
- `app/admin/analysis/` -- assessment admin UI
- Schema: `analysisFrameworks` (categoryKey, analysisTypes JSON), `analysisAssessments` (itemScores JSON, overallScore)

```mermaid
flowchart TD
    A([Start Assessment]) --> B[Select Analysis Framework]
    B --> C[Load framework analysisTypes]
    C --> D[Create Assessment record]
    D --> E[Status: not_started]
    E --> F[Display scoring grid]

    F --> G{Score items}
    G --> H[Set score 0-100 per item]
    H --> I[updateItemScores in DB]
    I --> J[Status: in_progress]
    J --> K{All items scored?}
    K -- No --> G
    K -- Yes --> L[Calculate overall score]
    L --> M[Weighted average of item scores]
    M --> N[completeAssessment]
    N --> O[Status: completed]

    O --> P{Export?}
    P -- Yes --> Q[Generate JSON export]
    Q --> R([Download assessment report])
    P -- No --> S([View in dashboard])

    subgraph Scoring Detail
        SC1[Item 1: Strategy -- Score 85]
        SC2[Item 2: Operations -- Score 72]
        SC3[Item 3: Technology -- Score 90]
        SC4[Item N: ... -- Score ??]
    end

    style E fill:#d3d3d3,color:#000
    style J fill:#ffd700,color:#000
    style O fill:#32cd32,color:#000
```

---

## 7. Contact Import Flow

CSV contact imports are tracked as `importJobs` with row-level progress counters. The system parses headers, maps columns to contact fields, validates each row, and creates or updates contacts. Duplicate detection uses email uniqueness.

**Key files:**
- `lib/db/import-job-queries.ts` -- `createImportJob()`, `updateImportJob()`
- `lib/db/contact-queries.ts` -- contact upsert logic
- `app/admin/contacts/` -- import UI
- Schema: `importJobs` (totalRows, processedRows, importedCount, duplicateCount, errorCount, columnMapping JSON, errors JSON)

```mermaid
sequenceDiagram
    actor Admin
    participant UI as Contacts Admin Page
    participant API as /api/admin/contacts/import
    participant Parser as CSV Parser
    participant DB as SQLite
    participant Contacts as contacts table
    participant ImportJob as import_jobs table

    Admin->>UI: Upload CSV file
    UI->>API: POST multipart/form-data { file }
    API->>Parser: Parse CSV headers
    Parser-->>API: Column names[]
    API-->>UI: Return detected columns

    Admin->>UI: Map CSV columns to contact fields
    Note over UI: email -> email, first_name -> firstName,<br/>company -> company, etc.
    UI->>API: POST { columnMapping, fileData }

    API->>ImportJob: createImportJob({ fileName, totalRows, columnMapping })
    ImportJob-->>API: importJob.id
    API->>ImportJob: UPDATE status: "processing"

    loop For each CSV row
        API->>API: Apply column mapping
        API->>API: Validate row (email format, required fields)

        alt Validation fails
            API->>ImportJob: errorCount++
            API->>ImportJob: Append error details to errors JSON
        else Email already exists
            API->>Contacts: UPDATE existing contact
            API->>ImportJob: duplicateCount++
        else New contact
            API->>Contacts: INSERT new contact (source: "import")
            API->>ImportJob: importedCount++
        end

        API->>ImportJob: processedRows++
    end

    API->>ImportJob: UPDATE status: "completed", completedAt

    API-->>UI: Import complete

    UI-->>Admin: Display import report
    Note over Admin: Total: 500 rows<br/>Imported: 420<br/>Duplicates: 65<br/>Errors: 15
```

---

## 8. Share Link Click Flow

Share links provide short URLs with UTM parameter injection for marketing attribution. The `shareLinks` table stores the mapping from `shortCode` to `originalUrl` with UTM fields. Each click increments `clickCount` and issues a 302 redirect.

**Key files:**
- `app/api/s/[code]/route.ts` -- short link redirect handler
- `lib/db/share-link-queries.ts` -- `getShareLinkByShortCode()`, `incrementClickCount()`
- Schema: `shareLinks` (shortCode, originalUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, clickCount, isActive, expiresAt)

```mermaid
sequenceDiagram
    actor User as Visitor
    participant Browser
    participant API as GET /api/s/[code]
    participant DB as SQLite (share_links)
    participant Redirect as Target URL

    User->>Browser: Click short link (e.g., /api/s/abc123)
    Browser->>API: GET /api/s/abc123

    API->>DB: getShareLinkByShortCode("abc123")

    alt Link not found
        DB-->>API: null
        API-->>Browser: 404 "Link not found or expired"
    end

    DB-->>API: shareLink record

    alt Link is inactive (isActive = false)
        API-->>Browser: 404 "Link not found or expired"
    end

    alt Link has expired (expiresAt < now)
        API-->>Browser: 410 "Link has expired"
    end

    API->>DB: incrementClickCount(link.id)
    Note over DB: clickCount = clickCount + 1

    API->>API: Build target URL
    API->>API: Append utm_source (if set)
    API->>API: Append utm_medium (if set)
    API->>API: Append utm_campaign (if set)
    API->>API: Append utm_term (if set)
    API->>API: Append utm_content (if set)

    Note over API: Example result:<br/>https://talentshill.com/blog/ai-guide<br/>?utm_source=linkedin<br/>&utm_medium=social<br/>&utm_campaign=q1-launch

    API-->>Browser: 302 Redirect to target URL with UTM params
    Browser->>Redirect: GET target URL
    Redirect-->>User: Landing page loads
```

---

## 9. Chatbot Request Flow

The chatbot widget creates sessions (`chatSessions`), auto-generates support requests (`chatRequests`) for substantive messages, and processes messages through a response engine. Admins view and respond to conversations from the admin dashboard. Messages are evaluated for PII, toxicity, and safety via `chatMessageEvals`.

**Key files:**
- `app/api/chat/route.ts` -- public chat endpoint
- `lib/chat/response-engine.ts` -- `processMessage()` (persist, evaluate, respond)
- `lib/db/chat-queries.ts` -- `createSession()`, `getSessionByToken()`, `createRequest()`
- `lib/db/chat-eval-queries.ts` -- message evaluation storage
- `app/admin/chat/` -- admin chat dashboard
- Schema: `chatSessions`, `chatRequests` (status: new/triaged/responding/waiting_user/resolved/closed, priority), `chatMessages` (role: user/assistant/system), `chatMessageEvals`

```mermaid
sequenceDiagram
    actor Visitor
    participant Widget as Chat Widget
    participant API as POST /api/chat
    participant Engine as Response Engine
    participant DB as SQLite
    participant Eval as Message Evaluator
    participant Admin as Admin Dashboard

    Visitor->>Widget: Open chat widget
    Widget->>API: POST { message: "Hello", sessionToken: null }

    API->>DB: No session token -- create new session
    DB-->>API: { sessionId, sessionToken }

    alt Message > 10 characters
        API->>DB: createRequest({ sessionId, subject, category: "general" })
        DB-->>API: requestId
    end

    API->>Engine: processMessage(message, { sessionId, requestId })

    Engine->>DB: Store user message (role: "user")

    Engine->>Eval: Evaluate user message
    Note over Eval: PII detection, toxicity check,<br/>bias scan, safety, compliance
    Eval->>DB: Store chatMessageEvals results

    Engine->>Engine: Generate AI response
    Engine->>DB: Store assistant message (role: "assistant")

    Engine->>Eval: Evaluate assistant response
    Eval->>DB: Store response evaluations

    Engine-->>API: { responseText }

    API-->>Widget: 200 { response, sessionToken }
    Widget-->>Visitor: Display response

    Note over DB,Admin: Admin side (async)

    Admin->>Admin: View chat requests dashboard
    Admin->>DB: Query chatRequests (status, priority)
    DB-->>Admin: Active conversations list

    Admin->>Admin: Open conversation
    Admin->>DB: Query chatMessages for session
    DB-->>Admin: Full message history + evaluations

    Admin->>DB: Update request status (triaged/responding)
    Admin->>DB: Insert admin response message (role: "assistant", editedBy)
    Admin->>DB: Add adminNotes on request
```

---

## 10. Segment Evaluation Flow

Dynamic list segments use a rule-based query builder. Rules are defined as nested groups with AND/OR logic. The `segment-evaluator.ts` translates rule definitions into SQL WHERE clauses executed against the `contacts` table, returning matching counts and sample IDs.

**Key files:**
- `lib/crm/segment-evaluator.ts` -- `evaluateSegmentRules()`, `buildCondition()`, `buildGroupCondition()`
- `lib/db/list-queries.ts` -- lists with `segmentRules` JSON for dynamic type
- Schema: `lists` (type: static/dynamic, segmentRules JSON), `contacts`
- Supported operators: equals, not_equals, contains, starts_with, greater_than, less_than, is_empty, is_not_empty

```mermaid
flowchart TD
    A([Admin defines segment rules]) --> B[Define Rule Conditions]

    subgraph Rule Definition
        B --> C[Select field<br/>e.g., status, company, leadScore]
        C --> D[Select operator<br/>equals / contains / greater_than / ...]
        D --> E[Set value<br/>e.g., "active", "Acme", 50]
        E --> F{Add more conditions?}
        F -- Yes --> G[Choose AND / OR logic]
        G --> C
        F -- No --> H[Finalize rule group]
    end

    subgraph Nested Groups
        H --> I{Nested sub-group?}
        I -- Yes --> J[Create child RuleGroup]
        J --> K[Set child logic: AND / OR]
        K --> C
        I -- No --> L[Complete rule tree]
    end

    subgraph Query Building
        L --> M[buildGroupCondition]
        M --> N[Recursively process groups]
        N --> O[buildCondition per rule]
        O --> P[Map operator to SQL]
        P --> Q[Join with AND / OR]
        Q --> R[Final SQL WHERE clause]
    end

    subgraph Execution
        R --> S["SELECT COUNT(*) FROM contacts WHERE ..."]
        S --> T[Return total count]
        R --> U["SELECT id FROM contacts WHERE ... LIMIT 10"]
        U --> V[Return sample IDs]
    end

    T --> W([Display: 1,247 contacts match])
    V --> X([Preview: sample contact list])

    style A fill:#e6f3ff,color:#000
    style R fill:#fff3e6,color:#000
    style W fill:#e6ffe6,color:#000
    style X fill:#e6ffe6,color:#000
```

### Rule-to-SQL Operator Mapping

| Rule Operator   | SQL Output                                    |
|-----------------|-----------------------------------------------|
| `equals`        | `"field" = value`                             |
| `not_equals`    | `"field" != value`                            |
| `contains`      | `"field" LIKE '%value%'`                      |
| `starts_with`   | `"field" LIKE 'value%'`                       |
| `greater_than`  | `"field" > value`                             |
| `less_than`     | `"field" < value`                             |
| `is_empty`      | `("field" IS NULL OR "field" = '')`           |
| `is_not_empty`  | `("field" IS NOT NULL AND "field" != '')`     |
