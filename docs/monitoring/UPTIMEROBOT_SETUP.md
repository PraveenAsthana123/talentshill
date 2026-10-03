# UptimeRobot Setup — TalentsHill Portal

Register the following monitor in UptimeRobot (https://uptimerobot.com).
Use monitor type **HTTP(s)**, check interval **5 minutes**, alert contacts as appropriate.

## Health-check URLs

| Portal         | URL                                    | Notes                  |
|----------------|----------------------------------------|------------------------|
| talentshill    | `http://YOUR_DOMAIN/api/health`        | Primary portal         |

Replace `YOUR_DOMAIN` with the actual production domain (e.g. `talentshill.com`).

## Recommended alert settings

- **Alert threshold:** 2 consecutive failures before alerting
- **Alert contacts:** email + Slack/webhook as configured in UptimeRobot account
- **Keyword monitor (optional):** add a keyword check for `"status":"ok"` on the URL to catch degraded responses that still return HTTP 200

## Expected health-check response

The `/api/health` endpoint should return HTTP 200 with a JSON body, for example:

```json
{ "status": "ok", "timestamp": "2026-01-01T00:00:00.000Z" }
```

If the portal does not yet have a `/api/health` route, add a minimal one:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```
