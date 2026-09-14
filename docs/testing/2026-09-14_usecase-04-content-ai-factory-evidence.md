# End-to-End Test Evidence — Use Case 4/15: AI Content Factory — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3014. Raw output:
`docs/testing/2026-09-14_usecase-04-content-ai-factory-log.txt`.

All temp test data (1 persona, 2 topics, 2 generated content items, engagement entries, 1 share
token, all prefixed `__e2e_test_`) deleted immediately after use and confirmed gone via direct DB
query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **69/69 passed** (57 pre-existing + 12 new — 6 written initially, 3 more added for the fabrication-detection backstop found during live testing) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama x3)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `GET /api/admin/content/personas` no cookie | 401 | Unauthorized | PASS |
| 2 | Create persona (CFO persona, real description/tone) | 201 | Created | PASS |
| 3 | Create topic with persona + scheduledDate | status auto-set to 'scheduled' | Confirmed | PASS |
| 4 | Generate draft #1 (real Ollama, article type) | Draft created, grounded in persona | 1031 tokens; correctly referenced CFO persona/tone; **but fabricated "15%/20%/18%/10%" stats and a fake TalentsHill case study despite explicit anti-fabrication instructions** | PASS (generation), REAL MODEL LIMITATION FOUND |
| 5 | Fabrication-warning backstop on draft #1 | fabricationWarning=true, banner prepended | Confirmed | PASS |
| 6 | Generate draft #2 (social_post type, no violation) | fabricationWarning=false | Confirmed, purely qualitative output | PASS |
| 7 | Log engagement: high performer (100 leads / 2000 views) | 201 | Created | PASS |
| 8 | Log engagement: low performer (2 leads / 2000 views) | 201 | Created | PASS |
| 9 | `POST /performance/` | high=produce_more (5%), low=deprioritize (0.1%) | Exact match | PASS |
| 10 | `POST /performance/agentic/` (real Ollama) | Narrative cites only real titles/numbers | Correctly cited both real topics with correct figures and recommendations | PASS |
| 11 | Mint share link, fetch public report, no cookie | 200, scoredContent=2 | Confirmed | PASS |
| 12 | Public HTML share page | 200 | HTTP 200 | PASS |
| 13 | Cleanup: delete persona + 2 topics + 2 content items + engagement + token | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` across all tables | PASS |

**13/13 test cases passed; 1 significant real finding** — the local model does not reliably follow
anti-fabrication instructions on open-ended generation tasks (unlike every prior narration-only
agent this session, which complied reliably). Responded with a deterministic detection backstop,
not just a stronger prompt, since prompting alone was already proven insufficient live.
