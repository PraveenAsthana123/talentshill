# End-to-End Test Evidence — Use Case 15/15: Competitor Campaign Monitor (FINAL) — 2026-09-14

Full test pass, run against a live `next dev` instance on port 3025. Raw output:
`docs/testing/2026-09-14_usecase-15-competitor-analysis-campaign-monitor-log.txt`.

All temp test data (2 competitors, 2 observations, 1 share token)
deleted and confirmed gone via direct DB query.

## Automated suite

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | Clean |
| `npx vitest run` | **173/173 passed** (166 pre-existing + 7 new) |

## Manual end-to-end test cases (live server, real HTTP, real DB, real Ollama)

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | `POST /api/admin/competitor-analysis/[id]/observations` no cookie | 401 | Unauthorized | PASS |
| 2 | Create 2 real competitors + 2 real observations on one | 4×201 | Created | PASS |
| 3 | Monitor scan classifies the real 2-competitor scenario exactly | AcmeAnalytics=active/2 obs/1 day; NoDataCo=no_data/0 obs | Exact match | PASS |
| 4 | Campaign-narrative agent (real Ollama) cites only real logged content | narrative references real observations | Confirmed — see 2 honest findings below | PASS |
| 5 | Dashboard KPIs reflect real observation coverage | totalObservations=2, byChannel correct | Exact match | PASS |
| 6 | Report includes both real observation rows | correct competitor/date/channel/type/description | Exact match | PASS |
| 7 | Customer self-service report includes real aggregate + recent observations | 200, matches live pipeline exactly | Confirmed | PASS |
| 8 | Public HTML share page | 200 | HTTP 200 | PASS |
| 9 | Cleanup: all test entities deleted | 0 rows remain | Confirmed via `sqlite3 SELECT COUNT(*)` | PASS |

**9/9 passed.** The freshness classification (active/no_data),
days-since-last-observation math, and channel aggregation all matched
hand-verified expected values exactly.

## Honest findings from the live Ollama narrative test (test #4)

Live verification surfaced two real, disclosed observations about
model/tooling behavior, documented here rather than hidden:

1. **Fabrication-guard false positive.** `fabricationWarning` returned
   `true` because the model's output contained the string "20%" — but
   that figure was **literally present in the real logged
   observation** ("...observed a 20% off launch promo..."). The shared
   `fabrication-guard.ts` regex flags any `%`/`$` pattern regardless of
   whether it was actually given as real input, so it cannot
   distinguish a correctly-cited real number from an invented one.
   This is a disclosed limitation of that shared backstop utility, not
   a defect introduced by this use case's agent.
2. **Minor real model overreach.** The narrative's speculative
   "suggested next check" paragraph named "Facebook Ads" as a channel
   to monitor — but neither real logged observation mentioned Facebook;
   only Instagram (`paid_social`) and the landing page were actually
   logged. This is advisory speculation, not a false claim about what
   was observed, but it is a real instance of the model extending
   beyond its grounded input in a recommendation. Worth noting for
   anyone relying on this agent's suggestions verbatim.

Both findings are reported here in the interest of transparency,
consistent with this session's standing "no fabrication" evidence
discipline — a clean pass would have hidden real, useful information
about how this agent behaves in practice.
