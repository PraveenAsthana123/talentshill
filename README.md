# TalentsHill -- Enterprise AI & Marketing Platform

A full-stack Next.js platform powering the digital operations of an enterprise AI consulting firm. TalentsHill combines content management, CRM, email campaigns, marketing automation, RAG-powered chatbot, AI analysis frameworks, and a complete admin portal into a single, self-hosted application backed by SQLite.

---

## Platform at a Glance

| Metric | Count |
|--------|-------|
| Database tables | 80 (verified via `sqlite_master`, 2026-09-09) |
| Admin API routes | 96, all RBAC-gated (verified 2026-09-09, see [Testing & Evidence](#testing--evidence)) |
| Admin pages | 64 |
| Public pages | 27 (17 original + 10 new solutions pages, 2026-09-09) |
| Query files | 38 |
| Reusable UI components | 9 |
| Zustand stores | 7 |
| AI analysis frameworks | 35 |
| Integration providers | 11 |
| Solutions pages | 13 (genai, robotics-ai, quantum-ai + 10 digital-marketing/AI pages) |
| Blog posts | 7 (3 original + 4 added 2026-09-09) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| React | React 19 |
| Database | SQLite (via better-sqlite3) |
| ORM | Drizzle ORM |
| Client state | Zustand 5 |
| Server state | TanStack React Query 5 |
| Styling | CSS Modules, Framer Motion |
| Forms | react-hook-form + Zod 4 validation |
| Auth | JWT sessions (jose), bcryptjs, RBAC |
| Email | Nodemailer (multi-profile SMTP) |
| Blog engine | Database-backed (`blog_posts` table). `gray-matter` + the `data/blog/*.md` files were the original one-time seed source (`lib/db/seed.ts`) -- the running app reads exclusively from the DB, not from those files, on every request (`lib/blog.ts` → `lib/db/blog-queries.ts`). Content itself is Markdown, rendered to HTML via `remark` at request time. |
| RSS | feed package |
| RAG pipeline | Custom chunking, embedding, retrieval |
| Testing | Vitest |
| Build | Next.js static export capable |

---

## Feature Modules

### Content Management
- **Blog engine** -- Authors, categories, tags, markdown posts, view tracking, subscriber management
- **Videos** -- Video library with YouTube/Vimeo support, categories, tags
- **Services & Industries** -- Dynamic service catalog and industry pages with admin CRUD
- **Content overrides** -- Override any public page section from the admin panel
- **Banners** -- Scheduled, prioritized announcement banners with CTA support

### Marketing & Content Operations
- **Content library** -- Articles, brochure text, presentation text, email copy, social posts, landing pages
- **Brochures & presentations** -- Slide-based asset builder with versioning
- **Share links** -- Branded short URLs with full UTM parameter tracking
- **Marketing workflow** -- 8-step wizard: content creation, asset design, link generation, audience selection, campaign build, approval, scheduling, monitoring
- **Approval chains** -- Review and approve marketing workflows before launch
- **Segments** -- Dynamic audience segments based on contact rules

### CRM & Campaigns
- **Contacts** -- Full contact management with lead scoring, status tracking, custom fields, tags
- **Lists** -- Static and dynamic (rule-based) contact lists
- **Email templates** -- Versioned HTML email templates with variable support
- **Campaigns** -- Multi-step email campaigns with A/B variant testing, throttling, recipient tracking
- **Broadcasts** -- One-time email blasts to lists or segments with scheduling
- **Email tracking** -- Granular open/click/bounce/unsubscribe event tracking
- **Import/Export** -- CSV contact import with column mapping and error reporting

### RAG Pipeline
- **Document ingestion** -- Upload, URL, or sitepage source types
- **Chunking** -- Configurable text chunking with token counting and deduplication
- **Embedding** -- Multi-model vector embedding with dimension tracking
- **Retrieval** -- Semantic search with configurable retrieval parameters
- **Query cache** -- Hash-based result caching with hit counting and TTL
- **Evaluation** -- Run metrics: faithfulness, relevance, precision, recall, PII detection, chunk quality
- **Pipeline runs** -- Step-by-step run tracking with metrics and error reporting
- **Configuration** -- Versioned pipeline configs (chunk size, overlap, model, retrieval K)

### AI Analysis Framework
- **35 framework categories** covering: Reliable AI, Trustworthy AI, Safe AI, Accountable AI, Auditable AI, Model Lifecycle, Monitoring & Drift, Sustainable/Green AI, Responsible GenAI, Debug AI, Portability AI, Interpretable AI, Trust AI, Responsible AI, Explainable AI, Fairness AI, Mechanistic & Causal AI, Human-Centered AI, Human-in-the-Loop AI, Transparent Data AI, Social AI, Compliance AI, Privacy-Preserving AI, Long-Term Risk AI, Environmental Impact AI, Ethical AI, Sensitivity Analysis AI, Governance AI, Secure AI, Energy-Efficient AI, Hallucination Prevention AI, Hypothesis AI, Threat AI, Fine-Tuning Analysis, Interpretability AI
- **Scoring assessments** -- Per-project assessment with item-level scoring and overall scoring
- **Project tracking** -- Assessment status, assessor assignment, progress tracking

### Chatbot
- **Session management** -- Token-based visitor sessions with email capture
- **Chat requests** -- Ticketing system with status, priority, category, assignment
- **Response engine** -- AI-powered response generation with RAG context
- **Message evaluation** -- PII detection, toxicity, bias, safety, compliance scoring
- **Admin notes** -- Internal notes on sessions and requests

### Integrations
- **11 providers** -- Slack, WhatsApp, LinkedIn, Facebook, Instagram, X (Twitter), Gmail, Dropbox, Quora, Database, Webhook
- **Credential management** -- Encrypted credential storage with expiry tracking
- **Integration logs** -- Request/response logging with duration tracking
- **Webhooks** -- Configurable webhook endpoints with event filtering and failure tracking

### Analytics & Leads
- **Lead management** -- Contact form submissions with automated lead scoring and tiering
- **Survey analytics** -- AI readiness assessment results with maturity level analysis
- **Campaign analytics** -- Open rates, click rates, bounce rates, unsubscribe tracking
- **Blog analytics** -- View tracking per post and session
- **Audit log** -- Complete entity-level audit trail for all admin actions

### System Administration
- **RBAC** -- Roles, permissions, groups, user-role mapping, group membership
- **Users** -- Admin user management with bcrypt password hashing
- **Feature flags** -- Module-level feature toggles with versioning and activation history
- **Email profiles** -- Multi-profile SMTP configuration with event routing
- **Media library** -- File upload management with tagging and folder organization
- **Site settings** -- Key-value configuration store
- **Health dashboard** -- System health monitoring
- **Maintenance mode** -- Configurable maintenance mode
- **Job queue** -- Background job processing with retries, priority, logging

### Appointments
- **Booking system** -- Service-based appointment scheduling
- **Lead scoring** -- Automated lead tier assignment based on booking details

---

## Project Structure

```
talentshill/
|-- app/
|   |-- (public pages)          # 17 public routes
|   |   |-- page.tsx            # Homepage
|   |   |-- blog/               # Blog listing + [slug] detail
|   |   |-- careers/            # Job listings + [id] detail
|   |   |-- contact/            # Contact form
|   |   |-- demo/               # Demo showcase + booking
|   |   |-- services/           # Services listing
|   |   |-- industries/         # Industries grid
|   |   |-- solutions/          # Robotics AI, GenAI, Quantum AI
|   |   |-- survey/             # AI Readiness assessment
|   |   |-- videos/             # Video library
|   |   |-- book/               # Appointment booking
|   |   |-- unsubscribe/        # Email unsubscribe
|   |   |-- maintenance/        # Maintenance page
|   |   |-- sitemap.ts          # Dynamic sitemap generation
|   |   |-- robots.ts           # Robots.txt generation
|   |   +-- feed.xml/           # RSS feed
|   |-- admin/                  # 62 admin pages
|   |   |-- layout.tsx          # Admin sidebar + navigation
|   |   |-- page.tsx            # Dashboard
|   |   |-- analysis/           # AI Analysis hub + projects
|   |   |-- analytics/          # Campaign analytics
|   |   |-- appointments/       # Appointment management
|   |   |-- banners/            # Banner management
|   |   |-- blog/               # Blog post CRUD
|   |   |-- broadcasts/         # Email broadcasts
|   |   |-- campaigns/          # Campaign management
|   |   |-- chat/               # Chat sessions + requests
|   |   |-- contacts/           # CRM contacts
|   |   |-- content/            # Content library, brochures, presentations, links
|   |   |-- content-overrides/  # Page content overrides
|   |   |-- email-compose/      # Email composer
|   |   |-- email-profiles/     # SMTP profile config
|   |   |-- features/           # Feature flag management
|   |   |-- health/             # System health
|   |   |-- industries/         # Industry CRUD
|   |   |-- integrations/       # Integration hub
|   |   |-- leads/              # Lead management
|   |   |-- lists/              # Contact list management
|   |   |-- login/              # Admin login
|   |   |-- maintenance/        # Maintenance mode
|   |   |-- marketing/          # Workflow, approvals, segments, monitor
|   |   |-- media/              # Media library
|   |   |-- rag/                # RAG dashboard, documents, runs, config, search
|   |   |-- roles/              # Role & permission management
|   |   |-- runs/               # Operations console
|   |   |-- services/           # Service CRUD
|   |   |-- settings/           # Site settings
|   |   |-- survey/             # Survey analytics
|   |   |-- templates/          # Email template management
|   |   |-- users/              # User management
|   |   +-- videos/             # Video CRUD
|   +-- api/                    # 124 API routes
|       |-- admin/              # Protected admin endpoints
|       |   |-- activity/       # Audit log
|       |   |-- analysis/       # Framework + assessment APIs
|       |   |-- analytics/      # Campaign + email analytics
|       |   |-- banners/        # Banner CRUD
|       |   |-- broadcasts/     # Broadcast management
|       |   |-- campaigns/      # Campaign CRUD + recipients
|       |   |-- chat/           # Chat session + request APIs
|       |   |-- contacts/       # Contact CRUD + events
|       |   |-- content/        # Marketing content CRUD
|       |   |-- content-overrides/
|       |   |-- dashboard/      # Dashboard stats
|       |   |-- email-compose/  # Send composed emails
|       |   |-- email-profiles/ # Profile + SMTP config
|       |   |-- event-routes/   # Email event routing
|       |   |-- features/       # Feature flag APIs
|       |   |-- health/         # Health check
|       |   |-- industries/     # Industry CRUD
|       |   |-- integrations/   # Integration + account APIs
|       |   |-- jobs/           # Job queue management
|       |   |-- leads/          # Lead management
|       |   |-- links/          # Share link APIs
|       |   |-- lists/          # List CRUD + members
|       |   |-- maintenance/    # Maintenance toggle
|       |   |-- media/          # File upload + management
|       |   |-- rag/            # RAG document, run, config APIs
|       |   |-- roles/          # RBAC APIs
|       |   |-- runs/           # Operations run APIs
|       |   |-- services/       # Service CRUD
|       |   |-- settings/       # Site settings API
|       |   |-- smtp-configs/   # SMTP config CRUD
|       |   |-- survey/         # Survey data APIs
|       |   |-- templates/      # Email template CRUD
|       |   |-- users/          # User management APIs
|       |   |-- videos/         # Video CRUD
|       |   +-- webhooks/       # Webhook management
|       |-- appointments/       # Public booking API
|       |-- auth/               # Login, logout, session
|       |-- blog/               # Public blog API
|       |-- careers/            # Public careers API
|       |-- chat/               # Public chat API
|       |-- contact/            # Contact form submission
|       |-- demo/               # Demo request API
|       |-- newsletter/         # Newsletter subscribe
|       |-- s/                  # Share link redirect
|       |-- survey/             # Survey submission
|       +-- t/                  # Tracking pixel + link click
|-- components/
|   |-- Navbar.tsx              # Public site navigation
|   |-- Footer.tsx              # Site footer
|   |-- HeroSection.tsx         # Landing hero
|   |-- ServicesPreview.tsx     # Services showcase
|   |-- IndustriesPreview.tsx   # Industries showcase
|   |-- EngagementFlow.tsx      # Engagement CTA section
|   |-- ThemeProvider.tsx       # Dark/light theme provider
|   |-- ThemeToggle.tsx         # Theme toggle switch
|   |-- BackToTop.tsx           # Scroll-to-top button
|   |-- CookieConsent.tsx       # GDPR cookie consent banner
|   |-- WhatsAppWidget.tsx      # Floating WhatsApp button
|   +-- ui/                     # 9 reusable UI components
|       |-- Accordion.tsx
|       |-- Badge.tsx
|       |-- Button.tsx
|       |-- Card.tsx
|       |-- Input.tsx
|       |-- Modal.tsx
|       |-- SectionHeader.tsx
|       |-- Tabs.tsx
|       +-- Toast.tsx
|-- features/
|   |-- blog/                   # Blog card components
|   |-- booking/                # Appointment booking wizard
|   |-- careers/                # Job listing + application
|   |-- chatbot/                # AI chatbot widget + service
|   |-- demo/                   # Demo request flow
|   |-- forms/                  # Contact, demo, newsletter forms
|   +-- survey/                 # AI Readiness assessment wizard
|-- lib/
|   |-- db/
|   |   |-- schema.ts           # 79 Drizzle ORM table definitions
|   |   |-- index.ts            # Database connection
|   |   |-- *-queries.ts        # 38 query files (one per domain)
|   |   |-- seed.ts             # Master seed runner
|   |   |-- seed-admin.ts       # Admin user seeding
|   |   |-- seed-analysis-frameworks.ts  # 35 AI analysis frameworks
|   |   |-- seed-flags.ts       # Default feature flags
|   |   |-- seed-integrations.ts # Integration provider catalog
|   |   +-- seed-rbac.ts        # Default roles & permissions
|   |-- chat/                   # Chat evaluators + response engine
|   |-- contact/                # Lead scoring engine
|   |-- crm/                    # CSV import + segment evaluator
|   |-- email/                  # Nodemailer + profile-based sending + templates
|   |-- feature-flags/          # Flag cache + guard middleware
|   |-- integrations/           # Provider registry + 11 provider adapters
|   |-- jobs/                   # Job queue runner + typed handlers
|   |-- media/                  # File upload handling
|   |-- ops/                    # Maintenance mode
|   |-- rag/                    # Chunking, embedding, evaluation, ingestion, PII, retrieval, vector store
|   |-- security/               # Password hashing, rate limiter, RBAC, sanitization, sessions
|   |-- survey/                 # Survey scoring engine
|   |-- tracking/               # Link click + pixel tracking
|   |-- validation/             # Zod schemas for content + marketing
|   |-- appointments-db.ts      # Appointment JSON storage
|   |-- blog.ts                 # Markdown blog engine
|   |-- booking-utils.ts        # Booking utility functions
|   |-- constants.ts            # App constants
|   |-- seo.ts                  # SEO utilities
|   +-- utils.ts                # Shared helpers
|-- store/
|   |-- booking-store.ts        # Appointment booking state
|   |-- chatbot-store.ts        # Chatbot widget state
|   |-- query-provider.tsx      # React Query provider
|   |-- survey-store.ts         # Survey wizard state
|   |-- theme-store.ts          # Dark/light theme state
|   |-- ui-store.ts             # UI state (modals, toasts)
|   +-- workflow-store.ts       # Marketing workflow wizard state
|-- types/
|   +-- index.ts                # Shared TypeScript interfaces
|-- styles/
|   +-- globals.css             # CSS design system (variables, reset, utilities)
|-- data/
|   |-- appointments.json       # Appointment records
|   |-- jobs/                   # Job listing JSON data
|   |-- survey-questions.json   # Survey question bank
|   |-- blog/                   # Markdown blog posts
|   +-- talentshill.db          # SQLite database
|-- tests/
|   |-- setup.ts                # Test setup
|   +-- unit/                   # Unit test suites
|-- terraform/                  # Infrastructure-as-code
|-- middleware.ts               # JWT auth guard for /admin/* routes
|-- drizzle.config.ts           # Drizzle ORM configuration
|-- next.config.js              # Next.js configuration
|-- package.json                # Dependencies and scripts
|-- tsconfig.json               # TypeScript configuration
+-- vitest.config.mts           # Vitest test runner configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repo-url> talentshill
cd talentshill

# Install dependencies
npm install

# Copy environment config
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Push the database schema
npx drizzle-kit push

# Seed the database (admin user, RBAC, feature flags, frameworks, integrations)
npx tsx lib/db/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

---

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Purpose | Example |
|----------|---------|---------|
| `SESSION_SECRET` | JWT signing secret for admin sessions | `your-secret-key-min-32-chars` |
| `NEXT_PUBLIC_SITE_URL` | Production site URL (SEO, sitemap, RSS) | `https://talentshill.com` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp widget phone number | `+1234567890` |
| `NEXT_PUBLIC_LINKEDIN_URL` | LinkedIn company page URL | `https://linkedin.com/company/...` |
| `NEXT_PUBLIC_FACEBOOK_URL` | Facebook page URL | `https://facebook.com/...` |
| `CHAT_API_PROVIDER` | Chatbot AI provider | `openai` or `placeholder` |
| `CHAT_API_KEY` | AI provider API key | `sk-...` |
| `CHAT_API_BASE_URL` | AI provider base URL | `https://api.openai.com/v1` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `user@example.com` |
| `SMTP_PASS` | SMTP password | `app-password` |

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npx drizzle-kit push` | Push schema changes to SQLite database |
| `npx drizzle-kit studio` | Open Drizzle Studio (database GUI) |
| `npx tsx lib/db/seed.ts` | Run all database seeders |

---

## Architecture Overview

```
Browser
  |
  v
Next.js App Router
  |
  |-- Public Pages (SSR/SSG)  --> lib/blog.ts, lib/seo.ts, data/
  |-- Admin Pages (CSR)       --> fetch(/api/admin/*)
  |-- API Routes              --> lib/db/*-queries.ts --> Drizzle ORM --> SQLite
  |
  v
Middleware Layer
  |-- middleware.ts            JWT session validation for /admin/* routes
  |-- lib/security/            Password hashing, RBAC, rate limiting, sanitization
  |-- lib/feature-flags/       Feature flag guard + caching
  |
  v
Data Layer
  |-- lib/db/schema.ts         79 table definitions (Drizzle ORM)
  |-- lib/db/*-queries.ts      38 domain-specific query files
  |-- data/talentshill.db      SQLite database (WAL mode)
  |
  v
Service Layer
  |-- lib/email/               Multi-profile SMTP email delivery
  |-- lib/rag/                 Document ingestion, chunking, embedding, retrieval
  |-- lib/chat/                AI response engine + message evaluators
  |-- lib/crm/                 CSV import, segment evaluation
  |-- lib/integrations/        11 third-party provider adapters
  |-- lib/jobs/                Background job queue with retries
  |-- lib/tracking/            Link click + email pixel tracking
```

### Data Flow

1. **Public site** -- Server-rendered pages fetch data from query files or static JSON/Markdown.
2. **Admin portal** -- Client-side pages call protected `/api/admin/*` endpoints.
3. **API routes** call domain query files (e.g., `contact-queries.ts`, `campaign-queries.ts`).
4. **Query files** use Drizzle ORM to read/write the SQLite database.
5. **Background jobs** (email sending, imports, RAG pipeline) run through the job queue system.
6. **Tracking** -- Email opens/clicks are captured via tracking pixel and link redirect APIs.

### Authentication

- Admin authentication uses JWT tokens stored in `admin_session` cookies.
- The `middleware.ts` file guards all `/admin/*` routes (except `/admin/login`).
- RBAC is implemented with roles, permissions, groups, and user-role mappings.
- Public API endpoints (contact form, newsletter, chat, booking) are unauthenticated.

### Database

- SQLite with WAL mode for concurrent read performance.
- 79 tables defined in a single Drizzle ORM schema file.
- Extensive indexing on status, type, foreign key, and timestamp columns.
- 38 query files organized by domain (one file per table group).
- 6 seed files for initial data: admin user, RBAC roles, feature flags, analysis frameworks, integrations.

---

## Public Routes

| Path | Description |
|------|-------------|
| `/` | Homepage |
| `/services` | Services listing |
| `/industries` | Industries grid |
| `/solutions/robotics-ai` | Robotics & AI solutions |
| `/solutions/genai` | Generative AI solutions |
| `/solutions/quantum-ai` | Quantum AI solutions |
| `/solutions/digital-marketing` | Digital marketing overview |
| `/solutions/ads-management` | Paid search/social/programmatic ads |
| `/solutions/market-research` | Competitive intelligence & audience research |
| `/solutions/performance-marketing` | Conversion/CAC/LTV optimization |
| `/solutions/seo-geo` | SEO + generative engine optimization |
| `/solutions/ai-automation` | AI-driven marketing ops automation |
| `/solutions/ai-strategy` | AI readiness, roadmap, governance advisory |
| `/solutions/agentic-ai` | Multi-agent systems & workflow automation |
| `/solutions/enterprise-rag` | Enterprise RAG (added 2026-09-09) |
| `/solutions/creator-video-marketing` | Influencer, video & viral growth |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post detail |
| `/careers` | Job openings |
| `/careers/[id]` | Job detail + apply |
| `/contact` | Contact form |
| `/demo` | Demo showcase + booking |
| `/book` | Appointment booking |
| `/survey` | AI Readiness assessment |
| `/videos` | Video library |
| `/unsubscribe` | Email unsubscribe |
| `/maintenance` | Maintenance page |

---

## Admin Portal Navigation

| Group | Pages |
|-------|-------|
| **Dashboard** | Overview with key metrics |
| **Content** | Blog, Videos, Services, Industries |
| **Marketing** | Content Library, Brochures, Presentations, Share Links, Segments, Workflow, Approvals, Monitor |
| **CRM** | Contacts, Lists, Templates, Campaigns, Broadcasts |
| **Chat** | Conversations (sessions + requests) |
| **Integrations** | Hub (provider management) |
| **Operations** | Runs, Email Compose, Banners, Media, Maintenance, Content Overrides |
| **RAG Pipeline** | Dashboard, Documents, Runs, Config, Search |
| **AI Analysis** | Hub (35 frameworks), Projects (assessments) |
| **Analytics** | Leads, Survey, Campaign Analytics |
| **System** | Health, Module Registry, Roles & Users, Users, Features, Email Profiles, Appointments, Settings |
| **Market Research** (under Marketing) | Competitor Analysis -- admin-only, never on any public route (see [Known Issues & Deliberate Gaps](#known-issues--deliberate-gaps)) |

---

## Adding Blog Posts

**The `data/blog/*.md` files are NOT read by the running app** -- this was true even before
2026-09-09, but the README previously said otherwise. Verified by tracing `app/blog/page.tsx` →
`lib/blog.ts` → `lib/db/blog-queries.ts`: every blog read goes straight to the `blog_posts` SQLite
table. `gray-matter` (frontmatter parsing) is only used by `lib/db/seed.ts`, a one-time import
script -- the markdown files were the original seed source, already imported once, and adding a
new one today does nothing until it's separately imported.

To add a post today, either:
1. **Write a seed script** (see `lib/db/seed-marketing-blog.ts` for a real, working example --
   idempotent, creates the category/tags/author links correctly), or
2. **Use `lib/db/blog-queries.ts`'s `createPost()`** directly from a one-off script or (once built)
   an admin UI form.

```ts
import { createPost } from '@/lib/db/blog-queries';
createPost({
  title: 'Your Post Title',
  content: 'Your content here, in Markdown -- rendered to HTML at request time.',
  summary: 'Short description',
  status: 'published',
  categoryIds: [/* real category id from blog_categories */],
  tags: ['AI', 'GenAI'],
});
```

---

## AI Agents, Skills & Automation

TalentsHill's own product surface sells "Agentic AI" as a service (`/solutions/agentic-ai`) --
this section is about the agents used to *build* this codebase, which is a different thing and
should not be confused with a claim that the running app itself has agent infrastructure.

- This codebase was built and is maintained across sessions using Claude Code, including
  background sub-agents for large mechanical fan-out work (e.g., wiring RBAC into all 96 admin
  routes was split across 9 parallel batch agents, each independently verified, then a lead agent
  re-derived the final resource/action mapping from the actual code rather than trusting agent
  prose -- see `git log` for the commit that documents this).
- No agent runs unsupervised against production data. Every schema change, permission change, or
  bulk edit in this repo's history was followed by a live verification step (a real curl test, a
  real `tsc` run, a real temp-user creation/deletion cycle) before being committed -- not asserted
  as working.
- There is currently no in-app agent runtime (no LangChain/agent-framework dependency in
  `package.json`, no `lib/agents/` directory). The `/solutions/agentic-ai` and
  `/solutions/enterprise-rag` pages describe consulting/service offerings TalentsHill would deliver
  *for a client*, not a capability already running inside this app.

## Tool, API & MCP Integration Status

Honest status, not aspirational -- checked via `grep -rli mcp` across `lib/` and `app/` on
2026-09-09:

| Claimed/discussed | Real status |
|---|---|
| MCP (Model Context Protocol) integration | **Not implemented.** Only referenced in the `agentic-ai` solutions page's marketing copy as a service TalentsHill would build for a client. No MCP server, client, or gateway code exists in this repo. |
| RAG pipeline (`lib/rag/`, `rag_*` tables) | **Schema and routes are real** (10 admin API routes, all RBAC-gated), but `rag_documents`/`rag_chunks`/`rag_embeddings`/`rag_runs` all have zero real rows as of this check -- the pipeline has never been exercised with a real document. |
| 11 third-party integration providers (`lib/integrations/`) | Real provider adapter code exists for each; live-credential connectivity has not been independently re-verified this session. |
| OAuth (Google/Microsoft) admin login | Real code, `tsc`-clean, fail-closed path verified live. The actual provider token-exchange flow is unverified -- no real Google Cloud Console / Azure AD app is registered yet. |
| Vitest unit suite | Real, 23 tests across 5 files, passing as of 2026-09-09 (see [Testing & Evidence](#testing--evidence)). |

## Known Issues & Deliberate Gaps

| Issue | Status |
|---|---|
| All 3 `videos` table rows point to the same YouTube ID (`dQw4w9WgXcQ`, the Rickroll placeholder), presented as real demo content | **Known, not fixed.** Flagged explicitly; real video URLs to be supplied later rather than adding more placeholders. |
| RAG pipeline has real schema/routes but zero real usage | **Known.** Needs a real document ingested and a real retrieval run before it can be called functional, not just schema-complete -- see this workspace's RAG+Ollama mandatory policy. |
| SMTP-configs `POST` originally shared one permission gate between "create a config" and "test an existing config's connection" | **Fixed** 2026-09-08 (commit `78f81d1`) -- now checked per-branch. |
| `broadcasts` launch action was gated the same as a plain field edit | **Fixed** 2026-09-08 (same commit) -- launch now requires `manage`, not just `update`. |
| Admin role's description said "except role management" while actually having full role CRUD | **Description corrected** 2026-09-08 (commit `292981b`); the underlying grant was intentional, not a bug. |
| `competitor_analysis` is admin-only by design (market-research intelligence, never customer-facing) | **Intentional**, not a gap -- verified via grep that it's referenced nowhere outside `app/admin/` and `app/api/admin/`. |

## Fallback Behavior

- **OAuth without configured credentials**: `/api/auth/oauth/{google,microsoft}` return `503` with
  a clear "not configured" message rather than crashing or silently proceeding. The login page
  shows both buttons in a disabled state until the status API confirms credentials exist.
- **OAuth login for an unrecognized email**: fails closed with a redirect + error message. No
  account is ever auto-created from an OAuth login -- verified via grep, no `createUser` call
  exists anywhere in the OAuth code path.
- **RBAC**: every admin route requires both a valid session (401 if missing) and the specific
  resource:action permission (403 if insufficient) -- verified live for read, write, and delete
  operations across multiple roles (see [Testing & Evidence](#testing--evidence)).
- **Missing `DATABASE_URL`-equivalent** (SQLite file path issues): the app reads from
  `data/talentshill.db` via `better-sqlite3`; if the file is missing, `better-sqlite3` will create
  an empty one on first connection rather than crashing -- meaning a misconfigured deployment fails
  silently into an empty database rather than erroring loudly. **Not yet hardened** -- a real gap
  worth a startup-time check that the expected tables exist.

## Deployment

Not yet deployed anywhere persistent as of 2026-09-09 -- no systemd service, no Docker container,
no fixed port, confirmed via process check. Before deploying:

- **Hosting requirement**: this is a Next.js app with server-side API routes, a persistent
  background job runner (`lib/jobs/`), and a file-based SQLite database needing durable write
  access. It needs a real, persistent Node.js process (a VPS, a container platform, or a
  Node.js-capable PaaS) -- standard shared/cPanel hosting without SSH/Node.js process control will
  not run this.
- **Disk footprint** (measured 2026-09-09): source ~17MB, production build output (`.next/server` +
  `.next/static` + manifests) ~26MB, full `node_modules` (incl. dev tools) 715MB, SQLite DB
  currently 1.4MB. Enabling `output: 'standalone'` in `next.config` (not yet done) would trim the
  deployable `node_modules` footprint to roughly 80-150MB. Budget ~1-2GB total on the host to be
  comfortable, not the bare minimum.
- **Before first deploy**: run `npx drizzle-kit push` against the target database, then the seed
  scripts in `lib/db/seed-*.ts` (admin user, RBAC, module registry, marketing services/blog,
  competitor-analysis template) in the order they were introduced (check `git log --diff-filter=A
  -- lib/db/seed-*.ts` for the real order).
- **Backups**: `scripts/backup-database.sh` produces a real gzipped SQLite snapshot (verified live,
  14-day retention). Not yet scheduled via cron/systemd-timer.
- **Health monitoring**: `scripts/health-monitor.sh` checks the real `/api/health` and
  `/admin/login` endpoints (verified live). Not yet scheduled -- there's no persistent deployment
  to monitor yet, so scheduling it today would just log expected failures.

## Testing & Evidence

- **Automated**: `npm test` (Vitest, 5 files / 23 tests) -- real, passing.
- **Manual end-to-end pass**: full test-case table, raw command log, and known-defects list at
  [`docs/testing/2026-09-09_e2e-test-evidence.md`](docs/testing/2026-09-09_e2e-test-evidence.md)
  (write-up) and
  [`docs/testing/2026-09-09_e2e-test-log.txt`](docs/testing/2026-09-09_e2e-test-log.txt) (raw
  captured output). Covers RBAC enforcement across roles, OAuth fail-closed paths, all 13 solution
  pages, the blog, the services catalog, and both operational scripts -- 12/12 manual cases passed.
- Every commit message in this repo's history is written as a self-contained evidence record
  (what was verified, how, and what the real output was) -- `git log` is a legitimate second source
  of truth alongside the docs above, not just change descriptions.

---

## License

Proprietary. All rights reserved.
