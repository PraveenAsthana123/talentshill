# C4 Architecture Model -- TalentsHill Enterprise Admin Portal

This document describes the TalentsHill platform architecture using the C4 model (Context, Containers, Components, Code). Each level zooms in from the highest-level system view down to implementation detail.

---

## Level 1: System Context Diagram

The system context shows the TalentsHill platform and its relationships with users and external systems.

```mermaid
C4Context
    title TalentsHill Platform - System Context Diagram

    Person(admin, "Admin Users", "Internal staff managing content, campaigns, CRM, analytics, and RAG pipelines")
    Person(public, "Public Users", "Website visitors browsing services, blog, booking demos, completing surveys, and chatting")
    Person(email_recipient, "Email Recipients", "Contacts receiving campaigns, broadcasts, and transactional emails")

    System(talentshill, "TalentsHill Platform", "Enterprise admin portal for content management, CRM, email campaigns, RAG-powered chat, marketing workflows, and analytics")

    System_Ext(smtp, "SMTP Server", "Sends transactional and campaign emails via Nodemailer (configurable per profile)")
    System_Ext(integrations, "Third-party Integrations", "LinkedIn, Facebook, Instagram, Slack, WhatsApp, Gmail, Dropbox, Quora, X, Webhooks")
    System_Ext(cdn, "CDN / CloudFront", "Serves static assets, media files, and cached pages via AWS CloudFront + S3")

    Rel(admin, talentshill, "Manages content, contacts, campaigns, RAG, and settings", "HTTPS")
    Rel(public, talentshill, "Browses site, submits forms, books demos, takes surveys, chats", "HTTPS")
    Rel(talentshill, smtp, "Sends emails", "SMTP/TLS")
    Rel(talentshill, integrations, "Syncs data, posts content, receives webhooks", "HTTPS/REST")
    Rel(talentshill, cdn, "Serves static assets and media", "HTTPS")
    Rel(talentshill, email_recipient, "Delivers campaigns and notifications", "Email")
```

### Actor Descriptions

| Actor | Role | Interaction |
|-------|------|-------------|
| **Admin Users** | Internal team (admin, editor, viewer roles) | Full admin portal access via JWT session cookies |
| **Public Users** | Website visitors | Browse public pages, submit contact/demo forms, take surveys, use chatbot |
| **Email Recipients** | CRM contacts and subscribers | Receive campaign emails, broadcasts, and transactional notifications |

### External System Descriptions

| External System | Purpose | Protocol |
|-----------------|---------|----------|
| **SMTP Server** | Email delivery for campaigns, broadcasts, and transactional emails | SMTP over TLS (port 587) |
| **Third-party Integrations** | 10 providers: LinkedIn, Facebook, Instagram, Slack, WhatsApp, Gmail, Dropbox, Quora, X, Webhooks | REST/HTTPS |
| **CDN / CloudFront** | Static asset delivery, media files, edge caching | HTTPS via AWS CloudFront + S3 |

---

## Level 2: Container Diagram

The container diagram shows the major deployable units within the TalentsHill platform.

```mermaid
C4Container
    title TalentsHill Platform - Container Diagram

    Person(admin, "Admin Users")
    Person(public, "Public Users")

    System_Boundary(platform, "TalentsHill Platform") {
        Container(webapp, "Next.js Web Application", "Next.js 15, React 19, TypeScript", "Server-side rendered pages, API routes, admin portal, and public website")
        ContainerDb(sqlite, "SQLite Database", "better-sqlite3, WAL mode", "79 tables across 12 modules: blog, CRM, campaigns, RAG, chat, RBAC, analytics, and more")
        Container(filestorage, "File Storage", "Local filesystem + S3", "Media uploads, RAG documents, CSV imports, brochure assets")
        Container(zustand, "Client State", "Zustand 5", "7 stores: theme, UI, chatbot, survey, booking, workflow, query cache")
    }

    System_Ext(smtp, "SMTP Server")
    System_Ext(integrations, "Third-party APIs")

    Rel(admin, webapp, "Manages via admin portal", "HTTPS")
    Rel(public, webapp, "Browses public pages", "HTTPS")
    Rel(webapp, sqlite, "Reads/writes data", "better-sqlite3 (synchronous)")
    Rel(webapp, filestorage, "Stores/retrieves files", "Node.js fs")
    Rel(webapp, smtp, "Sends emails", "SMTP via Nodemailer")
    Rel(webapp, integrations, "REST API calls", "HTTPS")
    Rel(webapp, zustand, "Hydrates client state", "React context")
```

### Container Details

| Container | Technology | Description |
|-----------|-----------|-------------|
| **Next.js Web Application** | Next.js 15.1, React 19, TypeScript 5.7 | Monolithic full-stack app: SSR pages, 124 API route handlers, 62 admin pages |
| **SQLite Database** | better-sqlite3 12.6, Drizzle ORM 0.45 | Single-file database in WAL mode with 79 tables, foreign keys, comprehensive indexes |
| **File Storage** | Local fs + AWS S3 | Media uploads (images, documents), RAG source files, CSV import files |
| **Client State (Zustand)** | Zustand 5.0 with persist middleware | 7 independent stores managing UI, chat, survey, booking, workflow, theme, and server state |

---

## Level 3: Component Diagram -- API Layer

The component diagram shows the internal structure of the Next.js API layer, organized by functional module.

```mermaid
C4Component
    title TalentsHill API Layer - Component Diagram

    Container_Boundary(api, "Next.js API Routes (124 route handlers)") {

        Component(auth, "Auth Component", "middleware.ts, lib/security/", "JWT session management, RBAC, rate limiting, input sanitization")

        Component(content, "Content Module", "14 routes", "Blog posts, categories, tags, views, subscribers, marketing content, versions, assets, overrides")
        Component(crm, "CRM Module", "12 routes", "Contacts CRUD, CSV import/export, lists, segments, contact events")
        Component(campaign, "Campaign Module", "10 routes", "Campaigns, broadcasts, templates, A/B variants, recipient tracking")
        Component(marketing, "Marketing Module", "8 routes", "Workflows, approvals, comments, share links, content-to-campaign pipeline")
        Component(analysis, "Analysis Module", "5 routes", "Frameworks, assessments, scoring, export, dashboard analytics")
        Component(rag, "RAG Module", "10 routes", "Document ingestion, chunking, embedding, retrieval, evaluation, runs, config")
        Component(chat, "Chat Module", "8 routes", "Sessions, messages, requests, notes, evaluations, response engine")
        Component(integration, "Integration Module", "7 routes", "Accounts, credentials, logs, webhooks, provider test, 10 providers")
        Component(analytics, "Analytics Module", "6 routes", "Lead analytics, survey stats, campaign metrics, contact analytics")
        Component(system, "System Module", "9 routes", "Health checks, settings, feature flags, users, roles, RBAC, maintenance, jobs")
        Component(email, "Email Infrastructure", "8 routes", "Profiles, SMTP configs, event routes, compose, templates, tracking pixels")
        Component(public_api, "Public API", "15 routes", "Contact form, survey, chat, newsletter, demo booking, blog, careers, banners, link redirects, tracking")
    }

    ContainerDb(db, "SQLite Database", "79 tables")
    Container(queries, "Query Layer", "lib/db/*-queries.ts", "40+ query files with Drizzle ORM operations")
    Container(validation, "Validation Layer", "lib/validation/", "Zod schemas for request validation")

    Rel(auth, content, "Guards admin routes")
    Rel(auth, crm, "Guards admin routes")
    Rel(auth, campaign, "Guards admin routes")
    Rel(auth, marketing, "Guards admin routes")
    Rel(auth, analysis, "Guards admin routes")
    Rel(auth, rag, "Guards admin routes")
    Rel(auth, chat, "Guards admin routes")
    Rel(auth, integration, "Guards admin routes")
    Rel(auth, analytics, "Guards admin routes")
    Rel(auth, system, "Guards admin routes")
    Rel(auth, email, "Guards admin routes")

    Rel(content, queries, "Invokes queries")
    Rel(crm, queries, "Invokes queries")
    Rel(campaign, queries, "Invokes queries")
    Rel(rag, queries, "Invokes queries")
    Rel(chat, queries, "Invokes queries")
    Rel(queries, db, "Executes SQL via Drizzle")
```

### Module Breakdown

| Module | Route Files | Key Tables | Admin Pages | Description |
|--------|-------------|------------|-------------|-------------|
| **Auth** | 3 | users, roles, permissions, user_roles, groups, group_members | 3 | JWT sessions, RBAC, rate limiting, sanitization |
| **Content** | 14 | blog_posts, blog_categories, blog_tags, blog_views, blog_subscribers, blog_authors, blog_post_categories, blog_post_tags, marketing_content, content_versions, content_assets, content_overrides | 12 | Blog CMS, marketing content, brochures, presentations, versioning |
| **CRM** | 12 | contacts, contact_events, lists, list_members, import_jobs | 4 | Contact management, segmentation, CSV import/export |
| **Campaign** | 10 | campaigns, campaign_recipients, campaign_variants, email_messages, email_events, unsubscribe_tokens | 5 | Email campaigns, A/B testing, recipient tracking |
| **Marketing** | 8 | marketing_workflows, workflow_comments, share_links | 5 | Content-to-campaign pipeline, approvals, share links |
| **Analysis** | 5 | analysis_frameworks, analysis_assessments | 3 | Assessment frameworks, scoring, export |
| **RAG** | 10 | rag_documents, rag_chunks, rag_embeddings, rag_cache, rag_runs, rag_run_steps, rag_run_metrics, rag_configs | 5 | Document ingestion, chunking, vector embeddings, retrieval |
| **Chat** | 8 | chat_sessions, chat_messages, chat_requests, chat_message_evals, admin_notes | 3 | Visitor chatbot, request triage, message evaluation |
| **Integration** | 7 | integrations, integration_accounts, integration_credentials, integration_logs, webhooks | 2 | 10 providers (LinkedIn, Slack, WhatsApp, etc.), webhooks |
| **Analytics** | 6 | survey_responses, survey_answers, contact_submissions | 3 | Lead analytics, survey insights, campaign metrics |
| **Email Infrastructure** | 8 | email_profiles, smtp_configs, email_profile_smtp, event_routes, email_templates, email_template_versions, broadcasts | 4 | SMTP management, profiles, templates, compose |
| **System** | 9 | site_settings, feature_flags, feature_flag_versions, feature_flag_active, audit_log, jobs, job_runs, job_logs | 7 | Health, settings, feature flags, users, roles, maintenance, jobs |
| **Public API** | 15 | -- (reads from multiple modules) | 0 | Public-facing forms, chat, survey, blog, career applications |

---

### Auth Component Detail

```mermaid
graph LR
    subgraph "Auth Component"
        MW[middleware.ts<br/>JWT verification] --> SESSION[lib/security/session.ts<br/>Session management]
        MW --> RBAC[lib/security/rbac.ts<br/>Permission checks]
        MW --> RATE[lib/security/rate-limiter.ts<br/>Per-IP throttling]
        MW --> SANITIZE[lib/security/sanitize.ts<br/>Input sanitization]
        MW --> PASSWORD[lib/security/password.ts<br/>bcrypt hashing]
    end

    REQUEST[Incoming Request] --> MW
    MW -->|Authenticated| ROUTES[Admin Route Handlers]
    MW -->|401/403| REJECT[Redirect to /admin/login]
```

### Query Layer Detail

```mermaid
graph TD
    subgraph "Query Layer (lib/db/)"
        BQ[blog-queries.ts]
        CQ[contact-queries.ts]
        CCQ[contact-crm-queries.ts]
        LQ[list-queries.ts]
        CAQ[campaign-queries.ts]
        BRQ[broadcast-queries.ts]
        TQ[template-queries.ts]
        MQ[media-queries.ts]
        MCQ[marketing-content-queries.ts]
        MWQ[marketing-workflow-queries.ts]
        CVQ[content-version-queries.ts]
        CAA[content-asset-queries.ts]
        COQ[content-override-queries.ts]
        RDQ[rag-document-queries.ts]
        RCQ[rag-chunk-queries.ts]
        REQ[rag-embedding-queries.ts]
        RRQ[rag-run-queries.ts]
        RAQ[rag-cache-queries.ts]
        CHQ[chat-queries.ts]
        CEQ[chat-eval-queries.ts]
        IQ[integration-queries.ts]
        ILQ[integration-log-queries.ts]
        AQ[admin-queries.ts]
        ANQ[admin-note-queries.ts]
        AFQ[analysis-framework-queries.ts]
        AAQ[analysis-assessment-queries.ts]
        FFQ[feature-flag-queries.ts]
        JQ[job-queries.ts]
        RQ[run-queries.ts]
        SQ[survey-queries.ts]
        SLQ[share-link-queries.ts]
        TRQ[tracking-queries.ts]
        EPQ[email-profile-queries.ts]
        EEQ[email-event-queries.ts]
        IJQ[import-job-queries.ts]
        BNQ[banner-queries.ts]
        WQ[webhook-queries.ts]
        RBQ[rbac-queries.ts]
    end

    subgraph "ORM"
        DRIZZLE[Drizzle ORM<br/>Type-safe SQL builder]
        SCHEMA[schema.ts<br/>79 table definitions]
    end

    BQ & CQ & CAQ & RDQ & CHQ & IQ --> DRIZZLE
    DRIZZLE --> SCHEMA
    SCHEMA --> DB[(SQLite<br/>WAL mode)]
```

---

## Level 4: Code Diagram -- Content Management Example

This level shows the internal code structure for the Content Management subsystem, from HTTP request to database.

```mermaid
graph TD
    subgraph "HTTP Layer"
        ROUTE_LIST["GET /api/admin/content<br/>route.ts → GET handler"]
        ROUTE_ID["GET /api/admin/content/[id]<br/>route.ts → GET handler"]
        ROUTE_CREATE["POST /api/admin/content<br/>route.ts → POST handler"]
        ROUTE_UPDATE["PUT /api/admin/content/[id]<br/>route.ts → PUT handler"]
        ROUTE_DELETE["DELETE /api/admin/content/[id]<br/>route.ts → DELETE handler"]
        ROUTE_PUBLISH["POST /api/admin/content/[id]/publish<br/>route.ts → POST handler"]
        ROUTE_VERSIONS["GET /api/admin/content/[id]/versions<br/>route.ts → GET handler"]
    end

    subgraph "Validation Layer"
        CREATE_SCHEMA["CreateContentSchema<br/>Zod: title, contentType, body,<br/>excerpt, tags, category, coverImage"]
        UPDATE_SCHEMA["UpdateContentSchema<br/>Zod: title?, body?, excerpt?,<br/>tags?, category?, status?"]
    end

    subgraph "Query Layer"
        MCQ_LIST["listMarketingContent()<br/>Paginated list with filters"]
        MCQ_GET["getMarketingContentById()<br/>Single content with metadata"]
        MCQ_CREATE["createMarketingContent()<br/>Insert with slug generation"]
        MCQ_UPDATE["updateMarketingContent()<br/>Update fields, auto-version"]
        MCQ_DELETE["deleteMarketingContent()<br/>Cascade delete"]
        MCQ_PUBLISH["publishMarketingContent()<br/>Status transition + timestamp"]
    end

    subgraph "Version Tracking"
        CVQ_LIST["listContentVersions()<br/>Version history"]
        CVQ_CREATE["createContentVersion()<br/>Snapshot before update"]
    end

    subgraph "Drizzle Schema"
        MC_TABLE["marketingContent table<br/>id, title, slug, contentType,<br/>body, excerpt, status, tags,<br/>category, coverImage, authorId,<br/>metadata, createdAt, updatedAt,<br/>publishedAt"]
        CV_TABLE["contentVersions table<br/>id, contentId, versionNumber,<br/>title, body, changedBy,<br/>changeNote, createdAt"]
    end

    subgraph "Storage"
        SQLITE[(SQLite Database<br/>data/talentshill.db)]
    end

    ROUTE_CREATE --> CREATE_SCHEMA
    ROUTE_UPDATE --> UPDATE_SCHEMA
    CREATE_SCHEMA --> MCQ_CREATE
    UPDATE_SCHEMA --> MCQ_UPDATE
    ROUTE_LIST --> MCQ_LIST
    ROUTE_ID --> MCQ_GET
    ROUTE_DELETE --> MCQ_DELETE
    ROUTE_PUBLISH --> MCQ_PUBLISH
    ROUTE_VERSIONS --> CVQ_LIST
    MCQ_UPDATE --> CVQ_CREATE

    MCQ_LIST & MCQ_GET & MCQ_CREATE & MCQ_UPDATE & MCQ_DELETE & MCQ_PUBLISH --> MC_TABLE
    CVQ_LIST & CVQ_CREATE --> CV_TABLE

    MC_TABLE --> SQLITE
    CV_TABLE --> SQLITE
```

### Request Lifecycle (Content Module)

```mermaid
sequenceDiagram
    participant Browser
    participant Middleware as middleware.ts
    participant Route as route.ts
    participant Zod as Zod Schema
    participant Query as marketing-content-queries.ts
    participant Drizzle as Drizzle ORM
    participant DB as SQLite

    Browser->>Middleware: POST /api/admin/content
    Middleware->>Middleware: Verify JWT cookie
    Middleware->>Middleware: Check RBAC permissions
    Middleware->>Route: Forward authenticated request

    Route->>Route: Parse request body (JSON)
    Route->>Zod: Validate with CreateContentSchema
    Zod-->>Route: Validated data or 400 error

    Route->>Query: createMarketingContent(data)
    Query->>Query: Generate UUID, slug, timestamps
    Query->>Drizzle: db.insert(marketingContent).values(...)
    Drizzle->>DB: INSERT INTO marketing_content ...
    DB-->>Drizzle: Row inserted
    Drizzle-->>Query: Success
    Query-->>Route: Created content object

    Route-->>Browser: 201 JSON response
```

### Content Module File Map

```
app/api/admin/content/
  route.ts                     # GET (list) + POST (create)
  [id]/
    route.ts                   # GET + PUT + DELETE (single item)
    publish/
      route.ts                 # POST (publish action)
    versions/
      route.ts                 # GET (version history)

lib/validation/
  content-schemas.ts           # CreateContentSchema, UpdateContentSchema (Zod)

lib/db/
  marketing-content-queries.ts # All Drizzle queries for marketing_content table
  content-version-queries.ts   # Version snapshot queries
  content-asset-queries.ts     # Brochure and presentation queries
  content-override-queries.ts  # Page-level override queries

lib/db/schema.ts               # Table definitions:
                               #   marketingContent (12 columns, 3 indexes)
                               #   contentVersions (7 columns, 1 index)
                               #   contentAssets (11 columns, 2 indexes)
                               #   contentOverrides (7 columns, 1 index)
```

---

## Cross-Cutting Concerns

```mermaid
graph TB
    subgraph "Cross-Cutting"
        AUTH[Authentication<br/>JWT + Cookies]
        RBAC[Authorization<br/>Roles + Permissions]
        RATE[Rate Limiting<br/>Per-IP sliding window]
        SANITIZE[Input Sanitization<br/>HTML strip, email normalize]
        AUDIT[Audit Logging<br/>All entity changes]
        FLAGS[Feature Flags<br/>Module-level toggles]
        JOBS[Job Queue<br/>Background processing]
        TRACKING[Email Tracking<br/>Opens, clicks, unsubscribes]
    end

    subgraph "Applied To All Modules"
        M1[Content]
        M2[CRM]
        M3[Campaign]
        M4[RAG]
        M5[Chat]
        M6[Integration]
    end

    AUTH --> M1 & M2 & M3 & M4 & M5 & M6
    RBAC --> M1 & M2 & M3 & M4 & M5 & M6
    AUDIT --> M1 & M2 & M3 & M4 & M5 & M6
    FLAGS --> M1 & M2 & M3 & M4 & M5 & M6
```

---

## Table Count by Module

| Module | Tables | Table Names |
|--------|--------|-------------|
| Blog | 8 | blog_authors, blog_categories, blog_tags, blog_posts, blog_post_categories, blog_post_tags, blog_views, blog_subscribers |
| Users & RBAC | 6 | users, roles, permissions, role_permissions, user_roles, groups, group_members |
| Contacts & CRM | 4 | contacts, contact_events, lists, list_members |
| Email Infrastructure | 6 | email_profiles, smtp_configs, email_profile_smtp, event_routes, email_templates, email_template_versions |
| Campaigns | 5 | campaigns, campaign_recipients, campaign_variants, email_messages, unsubscribe_tokens |
| Email Tracking | 2 | email_events, broadcasts |
| Marketing Content | 4 | marketing_content, content_versions, content_assets, share_links |
| Marketing Workflows | 2 | marketing_workflows, workflow_comments |
| Content Overrides | 1 | content_overrides |
| RAG Pipeline | 8 | rag_documents, rag_chunks, rag_embeddings, rag_cache, rag_runs, rag_run_steps, rag_run_metrics, rag_configs |
| Chat | 4 | chat_sessions, chat_messages, chat_requests, chat_message_evals |
| Integrations | 5 | integrations, integration_accounts, integration_credentials, integration_logs, webhooks |
| Analysis | 2 | analysis_frameworks, analysis_assessments |
| System | 8 | site_settings, audit_log, feature_flags, feature_flag_versions, feature_flag_active, jobs, job_runs, job_logs |
| Other | 7 | contact_submissions, survey_responses, survey_answers, videos, services, industries, media, banners, admin_notes, import_jobs, runs, run_events |

**Total: 79 tables** (78 exported Drizzle schema definitions + junction/mapping tables)
