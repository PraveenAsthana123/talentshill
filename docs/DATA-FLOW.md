# TalentsHill Admin Portal -- Data Flow & Network Flow

> Next.js 14+ App Router | SQLite + Drizzle ORM | 79 tables | 124 API routes | 62 admin pages

---

## Table of Contents

1. [System Data Flow Diagram (DFD Level 0)](#1-system-data-flow-diagram-dfd-level-0)
2. [DFD Level 1 -- Content Management](#2-dfd-level-1----content-management)
3. [DFD Level 1 -- CRM & Campaign Engine](#3-dfd-level-1----crm--campaign-engine)
4. [Network Flow](#4-network-flow)
5. [API Request Flow](#5-api-request-flow)
6. [Email Event Data Flow](#6-email-event-data-flow)
7. [Feature Flag Data Flow](#7-feature-flag-data-flow)

---

## 1. System Data Flow Diagram (DFD Level 0)

High-level view of all external entities, major processes, and data stores in the TalentsHill platform.

**External entities:** Website visitors, admin users, email service (SMTP), integration APIs (Slack, webhooks), chatbot visitors.
**Core processes:** Content Management, CRM/Contact Management, Campaign Engine, RAG Pipeline, Chat System, Analytics.
**Data stores:** SQLite database (79 tables via Drizzle ORM), file system (media uploads, RAG documents).

```mermaid
flowchart TB
    subgraph External Entities
        WV([Website Visitors])
        AU([Admin Users])
        ES([Email Service / SMTP])
        INT([Integration APIs<br/>Slack, Webhooks])
        CV([Chat Visitors])
    end

    subgraph "TalentsHill Platform"
        direction TB

        subgraph "Core Processes"
            P1[Content Management<br/>Blog, Marketing, Assets]
            P2[CRM & Contacts<br/>Import, Lists, Segments]
            P3[Campaign Engine<br/>Email Campaigns, Broadcasts]
            P4[RAG Pipeline<br/>Ingest, Chunk, Embed, Retrieve]
            P5[Chat System<br/>Sessions, Requests, Evaluation]
            P6[Analytics & Tracking<br/>Events, Metrics, Audit]
            P7[Auth & RBAC<br/>Users, Roles, Permissions]
            P8[AI Analysis<br/>Frameworks, Assessments]
        end

        subgraph "Data Stores"
            DS1[(SQLite DB<br/>79 tables)]
            DS2[(File System<br/>Media & Documents)]
        end
    end

    WV -->|Contact form,<br/>survey,<br/>newsletter signup| P2
    WV -->|Blog views,<br/>share link clicks| P6
    CV -->|Chat messages| P5
    AU -->|Create/edit content,<br/>manage campaigns| P1
    AU -->|Manage contacts,<br/>import CSV| P2
    AU -->|Configure & launch| P3
    AU -->|Upload docs,<br/>run pipeline| P4
    AU -->|View conversations,<br/>respond| P5
    AU -->|View dashboards| P6
    AU -->|Login, manage users| P7
    AU -->|Score assessments| P8

    P1 -->|Read/write| DS1
    P1 -->|Upload media| DS2
    P2 -->|Read/write| DS1
    P3 -->|Read/write| DS1
    P3 -->|Send emails| ES
    P4 -->|Read/write| DS1
    P4 -->|Store documents| DS2
    P5 -->|Read/write| DS1
    P6 -->|Read/write| DS1
    P7 -->|Read/write| DS1
    P8 -->|Read/write| DS1

    ES -->|Delivery events,<br/>bounces, opens| P6
    INT -->|Webhook callbacks| P6
    INT <-->|Sync data| P2

    P3 -->|Share links,<br/>tracking pixels| WV
    P5 -->|AI responses| CV
```

---

## 2. DFD Level 1 -- Content Management

Detailed data flow for the content management subsystem covering blog posts, marketing content, content assets (brochures/presentations), and content versions.

**Key tables:** `blogPosts`, `blogAuthors`, `blogCategories`, `blogTags`, `blogPostCategories`, `blogPostTags`, `blogViews`, `marketingContent`, `contentVersions`, `contentAssets`, `contentOverrides`, `shareLinks`, `media`

```mermaid
flowchart TD
    subgraph External
        Author([Author / Editor])
        Visitor([Website Visitor])
        Admin([Admin User])
    end

    subgraph "Content Creation"
        CC1[Create / Edit<br/>Marketing Content]
        CC2[Create / Edit<br/>Blog Post]
        CC3[Create / Edit<br/>Content Asset<br/>brochure / presentation]
        CC4[Upload Media<br/>images, files]
    end

    subgraph "Version Control"
        VC1[Create Content<br/>Version Snapshot]
        VC2[Version History<br/>Browse & Compare]
    end

    subgraph "Publishing Pipeline"
        PP1{Review & Approve}
        PP2[Publish Content]
        PP3[Create Share Links<br/>with UTM params]
    end

    subgraph "Data Stores"
        D1[(marketingContent<br/>status, body, slug)]
        D2[(contentVersions<br/>versionNumber, body)]
        D3[(blogPosts<br/>title, content, status)]
        D4[(contentAssets<br/>slides, assetType)]
        D5[(media<br/>filename, path, url)]
        D6[(shareLinks<br/>shortCode, UTM params)]
        D7[(contentOverrides<br/>pageSlug, section, key)]
    end

    subgraph "Public Display"
        PD1[Public Website<br/>Blog Pages]
        PD2[Blog RSS Feed<br/>feed.xml]
        PD3[Shared Content<br/>via short links]
    end

    subgraph "Tracking"
        TR1[(blogViews<br/>postId, sessionId)]
        TR2[(auditLog<br/>entity, action)]
    end

    Author -->|Write| CC1
    Author -->|Write| CC2
    Author -->|Design| CC3
    Admin -->|Upload| CC4

    CC1 -->|Save| D1
    CC1 -->|Snapshot| VC1
    VC1 -->|Store| D2
    VC2 -->|Read| D2

    CC2 -->|Save| D3
    CC3 -->|Save| D4
    CC4 -->|Store file| D5

    D1 -->|Submit| PP1
    PP1 -- Approve --> PP2
    PP1 -- Reject --> CC1

    PP2 -->|Update status: published| D1
    PP2 -->|Update status: published| D3
    PP2 --> PP3
    PP3 -->|Generate| D6

    D1 -->|Serve| PD1
    D3 -->|Serve| PD1
    D3 -->|Generate| PD2
    D6 -->|Redirect| PD3

    Visitor -->|View blog| PD1
    Visitor -->|Click link| PD3
    PD1 -->|Log view| TR1

    Admin -->|Override| D7
    D7 -->|Modify display| PD1

    CC1 -->|Audit trail| TR2
    CC2 -->|Audit trail| TR2
```

---

## 3. DFD Level 1 -- CRM & Campaign Engine

End-to-end data flow from contact acquisition through segmentation, campaign execution, and analytics.

**Key tables:** `contacts`, `contactEvents`, `lists`, `listMembers`, `importJobs`, `campaigns`, `campaignRecipients`, `campaignVariants`, `emailTemplates`, `emailTemplateVersions`, `emailProfiles`, `smtpConfigs`, `emailMessages`, `emailEvents`, `unsubscribeTokens`, `broadcasts`

```mermaid
flowchart TD
    subgraph "Contact Acquisition"
        CA1([CSV File Upload])
        CA2([Contact Form<br/>Submission])
        CA3([Survey Response])
        CA4([Newsletter Signup])
        CA5([Booking Request])
    end

    subgraph "Import Processing"
        IP1[Parse CSV Headers]
        IP2[Map Columns to Fields]
        IP3[Validate Rows]
        IP4[Upsert Contacts]
    end

    subgraph "Contact Store"
        CS1[(contacts<br/>email, name, company,<br/>source, tags, leadScore, status)]
        CS2[(contactEvents<br/>eventType, metadata)]
        CS3[(importJobs<br/>status, counts, errors)]
    end

    subgraph "Segmentation"
        SG1[Define Segment Rules<br/>field / operator / value]
        SG2[AND / OR Groups<br/>Nested logic]
        SG3[Build SQL WHERE clause]
        SG4[Execute against contacts]
    end

    subgraph "List Management"
        LM1[(lists<br/>name, type: static/dynamic,<br/>segmentRules)]
        LM2[(listMembers<br/>listId, contactId)]
    end

    subgraph "Campaign Setup"
        CMP1[Select Email Template]
        CMP2[Select Email Profile]
        CMP3[Select Audience<br/>list / segment / all]
        CMP4[Configure Schedule<br/>& Throttle]
    end

    subgraph "Campaign Store"
        CPD1[(campaigns<br/>status, audience, schedule,<br/>counters)]
        CPD2[(campaignRecipients<br/>contactId, status, sentAt)]
        CPD3[(campaignVariants<br/>A/B test config)]
        CPD4[(emailTemplates<br/>subject, htmlContent)]
        CPD5[(emailProfiles<br/>fromName, fromEmail)]
        CPD6[(smtpConfigs<br/>host, port, credentials)]
    end

    subgraph "Email Delivery"
        ED1[Resolve SMTP Config]
        ED2[Render Template<br/>with contact variables]
        ED3[Send via SMTP]
        ED4[Record messageId]
    end

    subgraph "Event Tracking"
        ET1[(emailMessages<br/>status, messageId)]
        ET2[(emailEvents<br/>eventType: sent/delivered/<br/>opened/clicked/bounced)]
        ET3[(unsubscribeTokens<br/>token, isUsed)]
    end

    subgraph "Analytics"
        AN1[Campaign Dashboard]
        AN2[Open / Click / Bounce rates]
        AN3[A/B Test comparison]
        AN4[Contact engagement timeline]
    end

    subgraph "External"
        SMTP([SMTP Server])
        WH([Webhook Endpoint])
    end

    CA1 --> IP1
    IP1 --> IP2
    IP2 --> IP3
    IP3 --> IP4
    IP4 --> CS1
    IP4 --> CS3

    CA2 -->|source: contact_form| CS1
    CA3 -->|source: survey| CS1
    CA4 -->|source: newsletter| CS1
    CA5 -->|source: booking| CS1

    CS1 --> SG4
    SG1 --> SG2
    SG2 --> SG3
    SG3 --> SG4
    SG4 -->|Static list| LM2
    SG4 -->|Dynamic count| LM1

    LM1 --> CMP3
    LM2 --> CMP3
    CMP1 --> CPD4
    CMP2 --> CPD5
    CMP3 --> CPD1
    CMP4 --> CPD1

    CPD1 -->|Launch| ED1
    CPD5 --> ED1
    CPD6 --> ED1
    CPD4 --> ED2
    CS1 -->|Contact vars| ED2
    ED1 --> ED3
    ED2 --> ED3
    ED3 --> SMTP
    ED3 --> ED4
    ED4 --> ET1
    ED4 --> CPD2

    SMTP -->|Delivery status| WH
    WH -->|open / click / bounce| ET2
    ET2 -->|Update counters| CPD1
    ET2 -->|Update status| CPD2
    ET2 -->|Log event| CS2

    ET1 --> AN1
    ET2 --> AN1
    CPD1 --> AN2
    CPD3 --> AN3
    CS2 --> AN4

    CS1 -->|Unsubscribe link| ET3
    ET3 -->|Mark unsubscribed| CS1
```

---

## 4. Network Flow

Physical network architecture showing protocol-level communication between the browser, Next.js server, database, and external services.

**Infrastructure:** Next.js 14+ App Router running server-side route handlers. SQLite accessed via Drizzle ORM through file I/O (no network hop). SMTP for outbound email. HTTP for webhook callbacks and integration APIs.

```mermaid
flowchart LR
    subgraph "Client Tier"
        B1[Admin Browser<br/>React SPA]
        B2[Visitor Browser<br/>Public Site]
        B3[Chat Widget<br/>Embedded iframe]
    end

    subgraph "Application Tier"
        NJ[Next.js 14+ Server<br/>App Router<br/>Route Handlers]
        MW[Middleware Layer<br/>JWT Auth<br/>Rate Limiting]
    end

    subgraph "Data Tier"
        SQL[(SQLite Database<br/>WAL mode<br/>79 tables)]
        FS[(File System<br/>Media uploads<br/>RAG documents)]
    end

    subgraph "External Services"
        SMTP[SMTP Server<br/>Email delivery]
        INTG[Integration APIs<br/>Slack, webhooks]
        WH[Webhook Endpoints<br/>Email event callbacks]
    end

    B1 <-->|HTTPS<br/>JSON API calls<br/>Cookie: admin_session| MW
    B2 <-->|HTTPS<br/>Page requests<br/>Blog, services| NJ
    B3 <-->|HTTPS<br/>POST /api/chat| NJ

    MW <-->|JWT verify<br/>Rate limit check| NJ

    NJ <-->|Drizzle ORM<br/>File I/O<br/>better-sqlite3| SQL
    NJ <-->|fs read/write<br/>multer uploads| FS

    NJ -->|SMTP/TLS<br/>Port 587<br/>nodemailer| SMTP
    NJ <-->|HTTPS<br/>REST API calls| INTG
    WH -->|HTTPS POST<br/>Event callbacks<br/>open/click/bounce| NJ

    style NJ fill:#0070f3,color:#fff
    style SQL fill:#003366,color:#fff
    style MW fill:#ff6b35,color:#fff
```

### Protocol Details

| Connection | Protocol | Port | Auth Method | Data Format |
|---|---|---|---|---|
| Browser to Next.js | HTTPS | 443 | JWT cookie (`admin_session`) | JSON |
| Next.js to SQLite | File I/O | N/A | Filesystem permissions | SQL via Drizzle |
| Next.js to SMTP | SMTP/TLS | 587 | Username/password (encrypted in DB) | MIME email |
| Webhook to Next.js | HTTPS POST | 443 | HMAC signature / shared secret | JSON payload |
| Next.js to Integrations | HTTPS | 443 | API key / OAuth token | JSON |
| Next.js to File System | File I/O | N/A | Filesystem permissions | Binary files |

---

## 5. API Request Flow

Every API request passes through the Next.js middleware for auth, then the route handler performs Zod validation before calling Drizzle ORM query functions that execute SQL against SQLite.

**Key files:**
- `middleware.ts` -- JWT verification for `/admin/*` routes
- `lib/validation/` -- Zod schemas for request bodies
- `lib/db/index.ts` -- Drizzle ORM database instance
- `lib/db/*-queries.ts` -- query functions per domain (44 query modules)

```mermaid
sequenceDiagram
    actor User as Browser
    participant MW as Next.js Middleware<br/>(middleware.ts)
    participant RH as Route Handler<br/>(app/api/.../route.ts)
    participant ZOD as Zod Validation<br/>(lib/validation/)
    participant QF as Query Function<br/>(lib/db/*-queries.ts)
    participant ORM as Drizzle ORM
    participant DB as SQLite Database

    User->>MW: HTTP Request<br/>(GET/POST/PATCH/DELETE)
    Note over MW: Only guards /admin/* paths

    alt Path starts with /admin
        MW->>MW: Read admin_session cookie
        alt No cookie or invalid JWT
            MW-->>User: 302 Redirect to /admin/login
        end
        MW->>MW: jwtVerify(token, secret)
        MW-->>RH: Request passes through
    else Public path (/api/chat, /api/s/*, /api/contact)
        MW-->>RH: Request passes through (no auth)
    end

    RH->>RH: Parse request body / params
    RH->>ZOD: Validate input schema

    alt Validation fails
        ZOD-->>RH: ZodError with field details
        RH-->>User: 400 { error: "Validation failed", details }
    end

    ZOD-->>RH: Validated & typed data

    RH->>QF: Call domain query function
    Note over QF: e.g., getCampaignById(id),<br/>createContact(data),<br/>evaluateSegmentRules(rules)

    QF->>ORM: Drizzle query builder
    Note over ORM: db.select().from(table)<br/>.where(eq(col, val))<br/>.orderBy(desc(col))<br/>.limit(n).offset(m)

    ORM->>DB: Execute SQL
    Note over DB: better-sqlite3<br/>Synchronous execution<br/>WAL mode

    DB-->>ORM: Raw result rows
    ORM-->>QF: Typed TypeScript objects
    QF-->>RH: Domain data

    RH->>RH: Format response
    RH-->>User: NextResponse.json({ data }, { status: 200 })

    Note over RH: Error handling at each layer:<br/>- Zod: 400 validation error<br/>- Query: 404 not found<br/>- Catch: 500 internal error
```

### Request Pipeline Summary

```mermaid
flowchart LR
    REQ([HTTP Request]) --> MW{Middleware}
    MW -->|/admin/*| AUTH[JWT Check]
    MW -->|Public| RH
    AUTH -->|Valid| RH[Route Handler]
    AUTH -->|Invalid| LOGIN([302 /admin/login])
    RH --> VAL[Zod Validation]
    VAL -->|Valid| QF[Query Function]
    VAL -->|Invalid| ERR400([400 Error])
    QF --> DRIZZLE[Drizzle ORM]
    DRIZZLE --> SQLITE[(SQLite)]
    SQLITE --> RES([JSON Response])
```

---

## 6. Email Event Data Flow

Email events flow from SMTP delivery through webhook callbacks into granular event storage. Events update campaign counters, recipient statuses, and contact activity timelines. The analytics dashboard aggregates events for reporting.

**Key tables:** `emailMessages`, `emailEvents`, `campaignRecipients`, `campaigns`, `contactEvents`
**Key files:** `lib/db/email-event-queries.ts`, `lib/db/campaign-queries.ts`, `app/api/admin/webhooks/route.ts`

```mermaid
flowchart TD
    subgraph "Email Sending"
        S1[Campaign Engine<br/>or Broadcast] --> S2[Render template<br/>with contact data]
        S2 --> S3[Send via SMTP<br/>nodemailer]
        S3 --> S4[Record in emailMessages<br/>status: queued -> sent]
        S3 --> S5[Store messageId<br/>from SMTP response]
    end

    subgraph "SMTP Server"
        SMTP1[Deliver to recipient<br/>mailbox]
        SMTP2[Generate delivery<br/>status notification]
    end

    subgraph "Recipient Actions"
        RA1([Open email])
        RA2([Click link])
        RA3([Bounce / reject])
        RA4([Unsubscribe])
        RA5([Spam complaint])
    end

    subgraph "Webhook Processing"
        WH1[POST /api/admin/webhooks<br/>Receive callback]
        WH2[Validate webhook signature]
        WH3[Parse event payload]
        WH4[Map to eventType<br/>sent / delivered / opened /<br/>clicked / bounced /<br/>complained / unsubscribed]
    end

    subgraph "Event Storage"
        ES1[(emailEvents<br/>eventType, contactId,<br/>campaignId, linkUrl,<br/>metadata, createdAt)]
    end

    subgraph "Counter Updates"
        CU1[Update campaignRecipients<br/>status, openedAt, clickedAt]
        CU2[Update campaigns<br/>totalOpened, totalClicked,<br/>totalBounced, totalUnsubscribed]
        CU3[Log contactEvents<br/>engagement activity]
    end

    subgraph "Analytics Dashboard"
        AD1[Campaign Analytics Page]
        AD2[getEventStats<br/>counts by eventType]
        AD3[getEventTimeline<br/>chronological events]
        AD4[Open rate / Click rate<br/>Bounce rate calculations]
        AD5[Contact engagement<br/>timeline view]
    end

    S3 --> SMTP1
    SMTP1 --> SMTP2
    SMTP2 --> WH1

    RA1 -->|Tracking pixel| WH1
    RA2 -->|Redirect link| WH1
    RA3 --> WH1
    RA4 -->|Unsubscribe link| WH1
    RA5 --> WH1

    WH1 --> WH2
    WH2 --> WH3
    WH3 --> WH4

    WH4 -->|logEmailEvent| ES1

    ES1 --> CU1
    ES1 --> CU2
    ES1 --> CU3

    CU1 --> AD1
    CU2 --> AD1
    ES1 --> AD2
    ES1 --> AD3
    AD2 --> AD4
    CU3 --> AD5

    style ES1 fill:#003366,color:#fff
    style AD1 fill:#0070f3,color:#fff
```

### Event Type Reference

| Event Type | Trigger | Updates |
|---|---|---|
| `sent` | SMTP accepts message | emailMessages status, campaignRecipients status |
| `delivered` | Mailbox delivery confirmed | emailMessages status |
| `opened` | Tracking pixel loaded | campaignRecipients openedAt, campaigns totalOpened |
| `clicked` | Redirect link followed | campaignRecipients clickedAt, campaigns totalClicked, linkUrl recorded |
| `bounced` | Hard/soft bounce | campaignRecipients bouncedAt, campaigns totalBounced, contact status |
| `complained` | Spam report | Contact status flagged |
| `unsubscribed` | Unsubscribe link used | unsubscribeTokens isUsed, contact status: unsubscribed, campaigns totalUnsubscribed |

---

## 7. Feature Flag Data Flow

Feature flags control runtime feature visibility across the application. Admins toggle flags in the admin UI. The API reads flag state from the database. Frontend components conditionally render based on flag status. Version history enables rollback to any previous configuration.

**Key tables:** `featureFlags`, `featureFlagVersions`, `featureFlagActive`
**Key files:** `lib/db/feature-flag-queries.ts` -- `toggleFlag()`, `getEnabledFlagKeys()`, `createFlagVersion()`, `rollbackToVersion()`
**Admin UI:** `app/admin/features/`

```mermaid
flowchart TD
    subgraph "Admin Configuration"
        A1([Admin User]) --> A2[Feature Flags Admin Page<br/>/admin/features]
        A2 --> A3{Action}
        A3 -->|Create| A4[Create new flag<br/>key, label, module]
        A3 -->|Toggle| A5[Toggle isEnabled<br/>true / false]
        A3 -->|Rollback| A6[Rollback to<br/>previous version]
    end

    subgraph "Database Storage"
        D1[(featureFlags<br/>key, label, isEnabled,<br/>module, sortOrder)]
        D2[(featureFlagVersions<br/>flagId, version, config,<br/>changedBy, changedAt)]
        D3[(featureFlagActive<br/>flagId, versionId,<br/>activatedAt)]
    end

    subgraph "Version Management"
        VM1[Create version snapshot<br/>on every toggle]
        VM2[Track version history<br/>per flag]
        VM3[Set active version<br/>pointer]
    end

    subgraph "API Layer"
        API1[GET /api/admin/features<br/>List all flags]
        API2[PATCH /api/admin/features/:id<br/>Toggle flag]
        API3[GET /api/admin/features/:id/history<br/>Version history]
        API4[getEnabledFlagKeys<br/>Cache-friendly query]
    end

    subgraph "Frontend Consumption"
        FE1[API Client fetches<br/>enabled flag keys]
        FE2{Check flag key}
        FE3[Render feature<br/>component]
        FE4[Hide feature<br/>component]
    end

    A4 -->|INSERT| D1
    A5 -->|UPDATE isEnabled| D1
    A5 -->|Create version| VM1
    VM1 -->|INSERT| D2
    VM1 -->|UPSERT| D3
    A6 -->|Read version config| D2
    A6 -->|Apply config| D1
    A6 -->|Update active| D3
    VM2 -->|Read| D2
    VM3 -->|Read/write| D3

    D1 -->|getAllFlags| API1
    D1 -->|toggleFlag| API2
    D2 -->|getFlagHistory| API3
    D1 -->|getEnabledFlagKeys| API4

    API4 -->|string[]| FE1
    FE1 --> FE2
    FE2 -->|Key present| FE3
    FE2 -->|Key absent| FE4

    style D1 fill:#003366,color:#fff
    style FE3 fill:#32cd32,color:#000
    style FE4 fill:#d3d3d3,color:#000
```

### Feature Flag Lifecycle

```mermaid
flowchart LR
    CREATE([Create Flag]) --> V1[Version 1<br/>isEnabled: true]
    V1 --> TOGGLE1[Admin toggles OFF]
    TOGGLE1 --> V2[Version 2<br/>isEnabled: false]
    V2 --> TOGGLE2[Admin toggles ON]
    TOGGLE2 --> V3[Version 3<br/>isEnabled: true]
    V3 --> ROLLBACK[Rollback to V2]
    ROLLBACK --> V2_ACTIVE[V2 re-activated<br/>isEnabled: false]

    style V1 fill:#32cd32,color:#000
    style V2 fill:#ff6b6b,color:#fff
    style V3 fill:#32cd32,color:#000
    style V2_ACTIVE fill:#ff6b6b,color:#fff
```

### Flag Module Grouping

Flags are organized by `module` for logical grouping in the admin UI:

| Module | Example Flags | Purpose |
|---|---|---|
| `blog` | `blog.comments`, `blog.related_posts` | Blog feature toggles |
| `crm` | `crm.lead_scoring`, `crm.auto_import` | CRM behavior toggles |
| `marketing` | `marketing.ab_testing`, `marketing.workflows` | Marketing feature toggles |
| `chat` | `chat.ai_responses`, `chat.pii_detection` | Chat system toggles |
| `rag` | `rag.auto_embed`, `rag.cache_enabled` | RAG pipeline toggles |
| `analytics` | `analytics.realtime`, `analytics.export` | Analytics feature toggles |
