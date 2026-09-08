# TalentsHill Enterprise Admin Portal -- Business Process Flows

> This document contains Mermaid diagrams illustrating the core business processes in the TalentsHill admin portal.
> Each diagram maps to actual database tables, API endpoints, and UI flows documented in [FEATURES.md](./FEATURES.md).

---

## Table of Contents

1. [Content Creation Process](#1-content-creation-process)
2. [Lead Generation Process](#2-lead-generation-process)
3. [Email Campaign Process](#3-email-campaign-process)
4. [Marketing Workflow Process](#4-marketing-workflow-process)
5. [AI Assessment Process](#5-ai-assessment-process)
6. [RAG Knowledge Base Process](#6-rag-knowledge-base-process)
7. [Contact Lifecycle Process](#7-contact-lifecycle-process)
8. [Approval Process](#8-approval-process)
9. [Integration Setup Process](#9-integration-setup-process)
10. [Incident/Issue Process](#10-incidentissue-process)

---

## 1. Content Creation Process

This flow covers the lifecycle of marketing content from creation through publication.

```mermaid
flowchart TD
    A[Author creates content] --> B{Select content type}
    B --> B1[Article]
    B --> B2[Brochure Text]
    B --> B3[PPT Text]
    B --> B4[Email Copy]
    B --> B5[Social Post]
    B --> B6[Landing Page]

    B1 & B2 & B3 & B4 & B5 & B6 --> C[Content saved as DRAFT]

    C --> D[Author edits content<br/>in /admin/content/editor]
    D --> E[Version snapshot created<br/>in content_versions table]
    E --> F[Author submits for review<br/>status: draft -> review]

    F --> G{Editor reviews content}
    G -->|Changes needed| H[Editor adds comments<br/>Content returned to author]
    H --> D
    G -->|Content acceptable| I[Editor approves<br/>status: review -> approved]

    I --> J{Manager approval}
    J -->|Rejected| K[Manager adds feedback<br/>Status reverted to draft]
    K --> D
    J -->|Approved| L[Manager approves<br/>status: approved -> published]

    L --> M[System sets publishedAt timestamp<br/>POST /api/admin/content/id/publish]
    M --> N[Content live on public site]
    N --> O{Content still relevant?}
    O -->|Yes| N
    O -->|No| P[Admin archives content<br/>status: published -> archived]

    style A fill:#e1f5fe
    style C fill:#fff3e0
    style F fill:#fff3e0
    style I fill:#e8f5e9
    style L fill:#e8f5e9
    style N fill:#c8e6c9
    style P fill:#ffcdd2
```

**Key Database Tables:** `marketing_content`, `content_versions`, `content_assets`

**Key API Endpoints:**
- `POST /api/admin/content` -- Create content
- `PATCH /api/admin/content/[id]` -- Update content and status
- `POST /api/admin/content/[id]/publish` -- Publish content
- `POST /api/admin/content/[id]/versions` -- Create version or rollback

---

## 2. Lead Generation Process

This flow shows how visitors become contacts and enter the marketing pipeline.

```mermaid
flowchart TD
    A[Visitor lands on<br/>public page] --> B{Interaction type}

    B -->|Contact form| C[Fills out contact form<br/>POST /api/contact]
    B -->|Survey| D[Completes AI readiness survey<br/>POST /api/survey]
    B -->|Newsletter| E[Subscribes to newsletter<br/>POST /api/newsletter]
    B -->|Book demo| F[Schedules appointment<br/>POST /api/appointments]
    B -->|Chat| G[Starts chat session<br/>POST /api/chat/session]

    C --> H[contact_submissions record created<br/>Lead score auto-calculated]
    D --> I[survey_responses record created<br/>Maturity level assigned]
    E --> J[blog_subscribers record created<br/>or contacts record]
    F --> K[Appointment record created]
    G --> L[chat_sessions record created]

    H --> M[Lead scored and tiered<br/>hot / warm / cool / cold]
    I --> M
    J --> N[Contact created in CRM<br/>source: newsletter]
    K --> N2[Contact created in CRM<br/>source: booking]
    L --> L2{Email captured during chat?}
    L2 -->|Yes| N3[Contact created in CRM<br/>source: chat]
    L2 -->|No| L3[Session tracked<br/>without contact record]

    M --> O[Contact created in CRM<br/>contacts table<br/>source: contact_form or survey]
    O --> P[Auto-tagged based on<br/>industry, interests, maturity]
    N --> P
    N2 --> P
    N3 --> P

    P --> Q{Matches dynamic<br/>segment rules?}
    Q -->|Yes| R[Added to dynamic list<br/>segment_evaluator runs]
    Q -->|No| S[Available for manual<br/>list assignment]

    R --> T[Contact receives<br/>targeted campaign]
    S --> T

    T --> U[contact_events logged<br/>email_opened, clicked, etc.]

    style A fill:#e1f5fe
    style M fill:#fff3e0
    style P fill:#e8f5e9
    style T fill:#c8e6c9
```

**Key Database Tables:** `contact_submissions`, `survey_responses`, `contacts`, `contact_events`, `lists`, `list_members`

**Key API Endpoints:**
- `POST /api/contact` -- Contact form submission
- `POST /api/survey` -- Survey submission
- `POST /api/newsletter` -- Newsletter signup
- `POST /api/appointments` -- Appointment booking

---

## 3. Email Campaign Process

This flow details the full email campaign lifecycle from template to analytics.

```mermaid
flowchart TD
    A[Create email template<br/>/admin/templates] --> B[Define subject and HTML body<br/>with variable placeholders]
    B --> C[Add variables<br/>firstName, lastName, company, etc.]
    C --> D[Save template<br/>POST /api/admin/templates]

    D --> E[Send test email<br/>POST /api/admin/templates/id/test-send]
    E --> F{Test looks good?}
    F -->|No| B
    F -->|Yes| G[Create campaign<br/>/admin/campaigns/new]

    G --> H[Select audience<br/>list / segment / all contacts]
    H --> I[Choose email profile<br/>sender identity and SMTP]
    I --> J[Select template<br/>and set subject line]
    J --> K{A/B testing?}

    K -->|Yes| L[Create variants<br/>Different subjects or templates<br/>Set traffic split percentages]
    K -->|No| M[Single variant campaign]

    L --> N[Configure schedule<br/>and throttle rate]
    M --> N

    N --> O[Campaign saved as DRAFT<br/>campaigns table]

    O --> P[Launch campaign<br/>POST /api/admin/campaigns/id/launch]
    P --> Q[Status: draft -> scheduled<br/>Job created: campaign_send]

    Q --> R[Job queue processes recipients]
    R --> S[For each recipient:]
    S --> S1[Render template with<br/>contact variables]
    S1 --> S2[Inject tracking pixel<br/>1x1 transparent GIF]
    S2 --> S3[Rewrite links for<br/>click tracking]
    S3 --> S4[Inject unsubscribe link<br/>with unique token]
    S4 --> S5[Send via SMTP<br/>using email profile]
    S5 --> S6[Record in email_messages<br/>and campaign_recipients]

    S6 --> T[Track events in real time]
    T --> T1[Open: pixel loaded<br/>GET /api/t/o/recipientId]
    T --> T2[Click: link redirect<br/>GET /api/t/c/recipientId?url=...]
    T --> T3[Unsubscribe: token used<br/>POST /api/t/u/token]
    T --> T4[Bounce: webhook callback]

    T1 & T2 & T3 & T4 --> U[email_events table updated]
    U --> V[Campaign analytics generated<br/>GET /api/admin/analytics/campaigns]

    V --> W[Dashboard shows:<br/>Open rate, Click rate<br/>Bounce rate, Top campaigns]

    style A fill:#e1f5fe
    style O fill:#fff3e0
    style P fill:#e8f5e9
    style T fill:#c8e6c9
    style W fill:#c8e6c9
```

**Key Database Tables:** `email_templates`, `campaigns`, `campaign_recipients`, `campaign_variants`, `email_messages`, `email_events`, `unsubscribe_tokens`

**Key API Endpoints:**
- `POST /api/admin/templates` -- Create template
- `POST /api/admin/templates/[id]/test-send` -- Test send
- `POST /api/admin/campaigns` -- Create campaign
- `POST /api/admin/campaigns/[id]/launch` -- Launch campaign
- `GET /api/t/o/[id]` -- Open tracking pixel
- `GET /api/t/c/[id]` -- Click tracking redirect
- `POST /api/t/u/[token]` -- Unsubscribe

---

## 4. Marketing Workflow Process

This flow represents the 8-step marketing automation wizard.

```mermaid
flowchart TD
    A[Start marketing workflow<br/>/admin/marketing/workflow] --> B[Step 0: Select Content<br/>Choose from marketing_content]

    B --> C[Step 1: Select Asset<br/>Choose or create brochure/presentation<br/>from content_assets]

    C --> D[Step 2: Create Share Links<br/>Generate short URLs with UTM params<br/>in share_links table]

    D --> E[Step 3: Target Audience<br/>Select contact list or<br/>build dynamic segment]

    E --> F[Step 4: Configure Campaign<br/>Set template, subject,<br/>email profile, throttle]

    F --> G[Step 5: Submit for Approval<br/>POST /api/admin/workflows/id<br/>status: pending_approval]

    G --> H{Reviewer reviews<br/>/admin/marketing/approvals}
    H -->|Comments added| I[Reviewer posts comments<br/>workflow_comments table]
    I --> H
    H -->|Rejected| J[Status: rejected<br/>Workflow returned to Step 0]
    J --> B
    H -->|Approved| K[Approver approves<br/>POST /api/admin/workflows/id/approve<br/>approvedBy + approvedAt set]

    K --> L[Step 6: Monitor Progress<br/>/admin/marketing/monitor]
    L --> M[Campaign executes<br/>Emails sent, tracked]
    M --> N[Real-time monitoring:<br/>Progress bars<br/>Email funnel visualization<br/>Live event stream]

    N --> O[Step 7: View Results<br/>Final campaign analytics]
    O --> P[Workflow status: completed]

    subgraph "Zustand Persistence"
        direction TB
        Z1[Browser localStorage<br/>key: th-marketing-workflow]
        Z2[Stores: currentStep,<br/>workflowId, contentId,<br/>assetId, shareLinkIds,<br/>listId, campaignId]
        Z1 --- Z2
    end

    style A fill:#e1f5fe
    style G fill:#fff3e0
    style K fill:#e8f5e9
    style O fill:#c8e6c9
    style P fill:#c8e6c9
```

**Key Database Tables:** `marketing_workflows`, `workflow_comments`, `marketing_content`, `content_assets`, `share_links`, `lists`, `campaigns`

**Key API Endpoints:**
- `POST /api/admin/workflows` -- Create workflow
- `PATCH /api/admin/workflows/[id]` -- Update workflow step
- `POST /api/admin/workflows/[id]/approve` -- Approve workflow
- `POST /api/admin/workflows/[id]/comments` -- Add comments

**State Management:** Zustand store with `persist` middleware in `/store/workflow-store.ts`

---

## 5. AI Assessment Process

This flow covers the AI analysis framework assessment lifecycle.

```mermaid
flowchart TD
    A[Admin opens Analysis page<br/>/admin/analysis] --> B[Browse 35 framework categories<br/>~650 total analysis types]

    B --> C[Select a category<br/>e.g., Reliable AI, Safe AI]
    C --> D[View category analysis types<br/>/admin/analysis/categoryKey]

    D --> E[Create new assessment<br/>POST /api/admin/analysis/assessments]
    E --> F[Set project name<br/>and assessor]
    F --> G[Assessment created<br/>status: not_started<br/>itemScores: empty array]

    G --> H[Begin scoring items<br/>status: not_started -> in_progress]

    H --> I[Score individual item<br/>Score: 0-100<br/>Status: completed<br/>Notes: free text]

    I --> J[Save partial scores<br/>PATCH /api/admin/analysis/assessments/id]

    J --> K[Incremental merge:<br/>1. Load existing scores<br/>2. Merge by itemIndex<br/>3. Recalculate completedItems<br/>4. Recalculate overallScore]

    K --> L{More items to score?}
    L -->|Yes| I
    L -->|No| M[All items scored]

    M --> N[Complete assessment<br/>PATCH with action: complete]
    N --> O[System calculates:<br/>overallScore = avg of all scores<br/>status: in_progress -> completed]

    O --> P{What next?}
    P --> Q[Export assessment<br/>GET /api/admin/analysis/assessments/id/export<br/>Downloads JSON file]
    P --> R[Compare across projects<br/>/admin/analysis/projects<br/>Cross-framework view]
    P --> S[Create new assessment<br/>for another category]

    style A fill:#e1f5fe
    style G fill:#fff3e0
    style H fill:#fff3e0
    style O fill:#e8f5e9
    style Q fill:#c8e6c9
    style R fill:#c8e6c9
```

**Key Database Tables:** `analysis_frameworks`, `analysis_assessments`

**Key API Endpoints:**
- `GET /api/admin/analysis/frameworks` -- List all frameworks
- `GET /api/admin/analysis/frameworks/[key]` -- Get framework detail
- `POST /api/admin/analysis/assessments` -- Create assessment
- `PATCH /api/admin/analysis/assessments/[id]` -- Update scores or complete
- `GET /api/admin/analysis/assessments/[id]/export` -- Export as JSON
- `GET /api/admin/analysis/dashboard` -- Dashboard overview

---

## 6. RAG Knowledge Base Process

This flow illustrates the complete RAG (Retrieval-Augmented Generation) pipeline.

```mermaid
flowchart TD
    A[Admin opens RAG management<br/>/admin/rag] --> B{Select source type}

    B -->|File upload| C[Upload document<br/>PDF, DOCX, TXT, etc.]
    B -->|URL| D[Provide web URL<br/>for content fetching]
    B -->|Site page| E[Select site page<br/>for content extraction]

    C & D & E --> F[Document record created<br/>rag_documents table<br/>status: pending]

    F --> G[Trigger ingestion<br/>POST /api/admin/rag/documents/id/ingest]

    G --> H[Stage 1: Ingest<br/>Extract raw text from source<br/>lib/rag/ingestion.ts]
    H --> H2[status: pending -> ingested]

    H2 --> I[Stage 2: Chunk<br/>Split text into overlapping segments<br/>lib/rag/chunking.ts]
    I --> I2[Chunks stored in rag_chunks<br/>with tokenCount and hash<br/>status: ingested -> chunked]

    I2 --> J[Stage 3: Embed<br/>Generate vector embeddings<br/>lib/rag/embedding.ts]
    J --> J2[Embeddings stored in rag_embeddings<br/>with model and dimensions<br/>status: chunked -> embedded]

    J2 --> K[Document ready for search]

    K --> L[User performs search<br/>POST /api/admin/rag/search]

    L --> M[Step 1: Embed query<br/>Generate query vector]
    M --> N[Step 2: Vector search<br/>Cosine similarity via<br/>InMemoryVectorStore]
    N --> O[Step 3: BM25 keyword scoring<br/>TF-IDF with k1=1.5, b=0.75]
    O --> P[Step 4: Reciprocal Rank Fusion<br/>Combine vector + keyword results<br/>Default weight: 70/30]
    P --> Q{Reranking enabled?}
    Q -->|Yes| R[Step 5: MMR reranking<br/>Maximal Marginal Relevance<br/>for result diversity]
    Q -->|No| S[Skip reranking]
    R & S --> T[Return top-K results<br/>with chunk content and scores]

    subgraph "Run Tracking"
        direction TB
        RT1[rag_runs: top-level run record]
        RT2[rag_run_steps: per-step status]
        RT3[rag_run_metrics: quality scores<br/>faithfulness, relevance,<br/>precision, recall, PII]
        RT1 --- RT2 --- RT3
    end

    subgraph "Pipeline Failure"
        direction TB
        PF1[Any stage can fail]
        PF2[status set to: failed]
        PF3[Error recorded in run]
        PF1 --- PF2 --- PF3
    end

    style A fill:#e1f5fe
    style F fill:#fff3e0
    style K fill:#e8f5e9
    style T fill:#c8e6c9
```

**Key Database Tables:** `rag_documents`, `rag_chunks`, `rag_embeddings`, `rag_cache`, `rag_runs`, `rag_run_steps`, `rag_run_metrics`, `rag_configs`

**Key API Endpoints:**
- `POST /api/admin/rag/documents` -- Upload document
- `POST /api/admin/rag/documents/[id]/ingest` -- Trigger ingestion
- `GET /api/admin/rag/documents/[id]/chunks` -- View chunks
- `POST /api/admin/rag/search` -- Hybrid search
- `GET /api/admin/rag/runs` -- List pipeline runs
- `POST /api/admin/rag/evaluate` -- Run evaluation metrics
- `GET /api/admin/rag/health` -- Pipeline health check

---

## 7. Contact Lifecycle Process

This flow shows the complete lifecycle of a contact from lead to retained customer.

```mermaid
flowchart TD
    A[New Lead Arrives] --> B[Contact created in CRM<br/>contacts table]

    B --> C{Source}
    C -->|Contact form| C1[source: contact_form<br/>Lead score calculated]
    C -->|Survey| C2[source: survey<br/>Maturity level assigned]
    C -->|Import| C3[source: import<br/>CSV bulk upload]
    C -->|Newsletter| C4[source: newsletter<br/>Blog subscription]
    C -->|Booking| C5[source: booking<br/>Demo scheduled]
    C -->|Manual| C6[source: manual<br/>Admin entry]

    C1 & C2 & C3 & C4 & C5 & C6 --> D[Contact status: active<br/>Lead score: 0-100]

    D --> E[Tags applied<br/>industry, interests, source]
    E --> F[Custom fields set<br/>JSON key-value pairs]

    F --> G{Segment evaluation<br/>Dynamic list rules}
    G -->|Matches segment| H[Added to dynamic list<br/>Available for campaigns]
    G -->|No match| I[Available for<br/>manual list assignment]

    H & I --> J[Targeted by campaign<br/>Email sent with tracking]

    J --> K[Engagement tracked<br/>contact_events table]
    K --> K1[email_opened]
    K --> K2[email_clicked]
    K --> K3[page_viewed]
    K --> K4[form_submitted]

    K1 & K2 & K3 & K4 --> L[Lead score updated<br/>based on engagement]

    L --> M{Engagement level}
    M -->|High engagement| N[Lead tier: HOT<br/>Priority follow-up]
    M -->|Moderate| O[Lead tier: WARM<br/>Continue nurturing]
    M -->|Low| P[Lead tier: COOL<br/>Re-engagement campaign]
    M -->|None| Q[Lead tier: COLD<br/>Archive or remove]

    N --> R[Converted to customer<br/>Status updated]
    O --> J
    P --> J
    Q --> S{Unsubscribed?}
    S -->|Yes| T[status: unsubscribed<br/>No further emails]
    S -->|Bounced| U[status: bounced<br/>Email marked invalid]
    S -->|Inactive| V[status: inactive<br/>Dormant contact]
    S -->|No| J

    R --> W[Retained customer<br/>Ongoing communication<br/>through targeted campaigns]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style N fill:#e8f5e9
    style R fill:#c8e6c9
    style W fill:#c8e6c9
    style T fill:#ffcdd2
    style U fill:#ffcdd2
```

**Key Database Tables:** `contacts`, `contact_events`, `lists`, `list_members`, `contact_submissions`, `survey_responses`

**Contact Statuses:** `active` -> `unsubscribed` / `bounced` / `inactive`

**Lead Tiers:** `hot`, `warm`, `cool`, `cold`

---

## 8. Approval Process

This flow details the generic approval workflow used across content and marketing workflows.

```mermaid
flowchart TD
    A[Requestor creates item<br/>Content, Workflow, or Campaign] --> B[Item saved with<br/>status: draft]

    B --> C[Requestor completes<br/>required fields and configuration]
    C --> D[Requestor submits for review<br/>status: draft -> pending_approval]

    D --> E[Reviewer receives notification<br/>/admin/marketing/approvals]

    E --> F{Reviewer examines item}
    F --> G[Reviewer adds comments<br/>POST /api/admin/workflows/id/comments]

    G --> H{Reviewer decision}
    H -->|Needs changes| I[Comments posted with<br/>stepIndex and content]
    I --> J[Requestor notified<br/>Status: pending_approval<br/>Requestor revises item]
    J --> C

    H -->|Ready for approval| K[Reviewer forwards<br/>to approver]

    K --> L{Approver decision}
    L -->|Approve| M[POST /api/admin/workflows/id/approve<br/>approvedBy: userId<br/>approvedAt: timestamp]
    M --> N[status: approved<br/>Item proceeds to execution]

    L -->|Reject| O[Rejection recorded<br/>with reason in comments]
    O --> P[status: rejected<br/>Requestor must revise]
    P --> C

    N --> Q[Execution begins<br/>Campaign launched,<br/>content published, etc.]

    Q --> R[Requestor and approver<br/>can monitor progress]

    subgraph "Audit Trail"
        direction TB
        AT1[audit_log records:<br/>every status change,<br/>every comment,<br/>every approval/rejection]
        AT2[workflow_comments:<br/>timestamped comments<br/>linked to specific steps]
        AT1 --- AT2
    end

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style M fill:#e8f5e9
    style N fill:#c8e6c9
    style O fill:#ffcdd2
    style P fill:#ffcdd2
```

**Key Database Tables:** `marketing_workflows`, `workflow_comments`, `audit_log`

**Key API Endpoints:**
- `POST /api/admin/workflows/[id]/approve` -- Approve workflow
- `POST /api/admin/workflows/[id]/comments` -- Add review comments
- `PATCH /api/admin/workflows/[id]` -- Update workflow status

---

## 9. Integration Setup Process

This flow shows how third-party integrations are configured and monitored.

```mermaid
flowchart TD
    A[Admin opens Integrations<br/>/admin/integrations] --> B[Browse available providers<br/>integrations table]

    B --> C{Select provider}
    C --> C1[Slack]
    C --> C2[LinkedIn]
    C --> C3[Gmail]
    C --> C4[WhatsApp]
    C --> C5[Dropbox]
    C --> C6[Webhook]
    C --> C7[Other providers...]

    C1 & C2 & C3 & C4 & C5 & C6 & C7 --> D[View provider config schema<br/>/admin/integrations/id]

    D --> E[Enter credentials<br/>API keys, tokens, secrets]
    E --> F[Credentials encrypted<br/>and stored in<br/>integration_credentials table]

    F --> G[Create integration account<br/>integration_accounts table<br/>status: disconnected]

    G --> H[Test connection<br/>POST /api/admin/integrations/id/test]

    H --> I{Connection test result}
    I -->|Success| J[status: disconnected -> connected<br/>connectedAt timestamp set]
    I -->|Failure| K[Error message stored<br/>in errorMessage field]
    K --> L[Admin reviews error<br/>and corrects credentials]
    L --> E

    J --> M[Integration enabled<br/>and operational]

    M --> N[Integration executes actions<br/>Sends messages, syncs data, etc.]
    N --> O[Every action logged<br/>integration_logs table]

    O --> P{Action result}
    P -->|Success| Q[Log: status=success<br/>Request/response captured<br/>Duration recorded]
    P -->|Error| R[Log: status=error<br/>Error details captured]

    R --> S{Repeated failures?}
    S -->|Yes| T[status: connected -> error<br/>Admin alerted via<br/>/admin/health dashboard]
    S -->|No| U[Transient error<br/>Continue monitoring]

    T --> V[Admin investigates<br/>Reviews integration_logs]
    V --> W{Root cause found?}
    W -->|Credentials expired| X[Update credentials<br/>Re-test connection]
    X --> H
    W -->|Provider issue| Y[Wait for provider<br/>to resolve]
    W -->|Config change needed| Z[Update settings<br/>Re-test connection]
    Z --> H

    subgraph "Webhook Support"
        direction TB
        WH1[webhooks table]
        WH2[Event subscription filtering]
        WH3[Shared secret for signing]
        WH4[Failure count tracking]
        WH1 --- WH2 --- WH3 --- WH4
    end

    style A fill:#e1f5fe
    style G fill:#fff3e0
    style J fill:#e8f5e9
    style M fill:#c8e6c9
    style T fill:#ffcdd2
    style K fill:#ffcdd2
```

**Key Database Tables:** `integrations`, `integration_accounts`, `integration_credentials`, `integration_logs`, `webhooks`

**Key API Endpoints:**
- `GET /api/admin/integrations` -- List integrations
- `POST /api/admin/integrations` -- Create integration
- `POST /api/admin/integrations/[id]/test` -- Test connection
- `GET /api/admin/integrations/[id]/logs` -- View activity logs
- `PATCH /api/admin/integrations/[id]` -- Update integration

**Provider Interface Methods:** `connect()`, `disconnect()`, `testConnection()`, `sync()`, `getStatus()`

---

## 10. Incident/Issue Process

This flow covers system health monitoring and incident resolution.

```mermaid
flowchart TD
    A[System health check runs<br/>GET /api/admin/health] --> B{Health status}

    B -->|Healthy| C[Dashboard shows green<br/>All metrics normal]
    C --> A

    B -->|Unhealthy| D[Issue detected]

    D --> E{Issue type}
    E -->|Database| F[DB size exceeds threshold<br/>or table query fails]
    E -->|Job queue| G[Jobs stuck in pending/running<br/>Error count rising]
    E -->|Integration| H[Integration status: error<br/>Connection failures logged]
    E -->|Email| I[High bounce rate<br/>SMTP delivery failures]
    E -->|Application| J[Process uptime anomaly<br/>or unhandled errors]

    F & G & H & I & J --> K[Admin views health dashboard<br/>/admin/health]

    K --> L[Admin reviews details]
    L --> L1[Check database.sizeMB<br/>and table row counts]
    L --> L2[Check queue stats:<br/>pending, running, failed counts]
    L --> L3[Check recentErrors:<br/>Last 10 error log entries]

    L1 & L2 & L3 --> M[Admin investigates root cause]

    M --> N{Investigation findings}

    N -->|Failed jobs| O[Review job logs<br/>/admin/runs<br/>job_logs table]
    O --> P[Identify failing job type<br/>and error pattern]
    P --> Q[Fix: retry job,<br/>update config, or<br/>fix code and redeploy]

    N -->|Integration down| R[Review integration logs<br/>/admin/integrations/id]
    R --> S[Check credentials,<br/>test connection,<br/>verify provider status]
    S --> T[Fix: update credentials,<br/>reconfigure, or wait<br/>for provider recovery]

    N -->|Email issues| U[Review email events<br/>and SMTP config]
    U --> V[Check bounce reasons,<br/>SMTP connectivity,<br/>sender reputation]
    V --> W[Fix: update SMTP config,<br/>clean bounce list,<br/>adjust throttle rate]

    N -->|DB issues| X[Check WAL file size,<br/>run VACUUM,<br/>verify indexes]
    X --> Y[Fix: optimize queries,<br/>add indexes, archive<br/>old data]

    Q & T & W & Y --> Z[Apply fix]
    Z --> AA[Verify fix<br/>Re-run health check]
    AA --> AB{Health restored?}
    AB -->|Yes| AC[Mark incident resolved<br/>Update audit_log]
    AB -->|No| M

    AC --> AD[Enable maintenance mode<br/>if extended fix needed<br/>POST /api/admin/maintenance]
    AD --> AE[Public site shows<br/>maintenance page]
    AE --> AF[Fix applied and verified]
    AF --> AG[Disable maintenance mode<br/>Site restored to normal]

    style A fill:#e1f5fe
    style D fill:#ffcdd2
    style K fill:#fff3e0
    style Z fill:#e8f5e9
    style AC fill:#c8e6c9
    style AG fill:#c8e6c9
```

**Key Database Tables:** `jobs`, `job_runs`, `job_logs`, `runs`, `run_events`, `integration_logs`, `audit_log`

**Key API Endpoints:**
- `GET /api/admin/health` -- System health check
- `GET /api/admin/jobs` -- Job listing
- `GET /api/admin/jobs/[id]` -- Job detail with logs
- `GET /api/admin/runs` -- Operation run listing
- `GET /api/admin/runs/[id]` -- Run detail with events
- `GET/POST /api/admin/maintenance` -- Maintenance mode toggle

**Health Check Returns:**
- Database file size (MB)
- Row counts for 14 key tables
- Job queue statistics (pending, running, completed, failed)
- Last 10 error entries from job logs
- Process uptime
- Server timestamp

---

## Cross-Process Dependencies

The following diagram shows how the major processes interconnect.

```mermaid
flowchart LR
    subgraph Content["Content Management"]
        CM[Create Content]
        CV[Version History]
        CA[Create Assets]
    end

    subgraph CRM["CRM"]
        CC[Manage Contacts]
        CL[Manage Lists]
        CS[Build Segments]
    end

    subgraph Email["Email Engine"]
        ET[Manage Templates]
        EC[Create Campaign]
        EB[Send Broadcast]
    end

    subgraph Marketing["Marketing Automation"]
        MW[8-Step Workflow]
        MA[Approval Process]
    end

    subgraph Analytics["Analytics"]
        AN[Campaign Analytics]
        AL[Lead Tracking]
    end

    subgraph AI["AI Analysis"]
        AF[Analysis Frameworks]
        AA[Assessments]
    end

    subgraph RAG["RAG Pipeline"]
        RD[Documents]
        RS[Search]
    end

    subgraph System["System Admin"]
        SH[Health Monitor]
        SJ[Job Queue]
        SI[Integrations]
    end

    CM --> MW
    CA --> MW
    CL --> MW
    ET --> MW
    EC --> MW
    MW --> MA
    MA --> EC

    CC --> CL
    CC --> CS
    CS --> CL
    CL --> EC
    CL --> EB

    EC --> AN
    EB --> AN
    CC --> AL

    EC --> SJ
    EB --> SJ
    SJ --> SH
    SI --> SH

    CM -.->|content for| RD
    RD --> RS

    style Content fill:#e3f2fd
    style CRM fill:#f3e5f5
    style Email fill:#e8f5e9
    style Marketing fill:#fff3e0
    style Analytics fill:#fce4ec
    style AI fill:#f1f8e9
    style RAG fill:#e0f7fa
    style System fill:#fafafa
```

---

## Legend

| Color            | Meaning                  |
|------------------|--------------------------|
| Blue (#e1f5fe)   | Process entry point      |
| Orange (#fff3e0) | In-progress / pending    |
| Green (#e8f5e9)  | Approved / successful    |
| Dark Green (#c8e6c9) | Completed / final state |
| Red (#ffcdd2)    | Error / rejected state   |
