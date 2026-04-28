# Agentic Customer Analytics

Customer analytics demo app with an Express API, a Next.js dashboard, Prisma, Postgres, and Redis.

## App Layout

- `apps/api` - Express API for event ingestion, dashboard summaries, and agent actions.
- `apps/web` - Next.js web app with the dashboard and demo store.
- `packages/database` - Prisma schema, migrations, and shared Prisma client.
- `packages/shared` - Shared event constants and types.
- `docker-compose.dev.yml` - Local Postgres and Redis services.

## Local URLs

- Web app: `http://localhost:3000`
- API: `http://localhost:4000`
- API health: `http://localhost:4000/health`
- Postgres: `localhost:5433`
- Redis: `localhost:6380`

## Environment

Root `.env` should include:

```env
DATABASE_URL="postgresql://aca_user:aca_password@localhost:5433/aca_db"
API_PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

`apps/web/.env.local` should include:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## First-Time Setup

Install dependencies from the repo root:

```powershell
npm install
```

Start local infrastructure:

```powershell
npm run dev:infra
```

In another terminal, apply database migrations:

```powershell
npm run db:migrate
```

Start the API:

```powershell
npm run dev:api
```

Start the web app:

```powershell
npm run dev:web
```

## Normal Start Sequence

Use three terminals from the repo root:

```powershell
npm run dev:infra
```

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

Then open `http://localhost:3000`.

## Clean Restart Sequence

Use this when ports are stuck, the API is stale, or Docker services need a fresh start.

1. Stop any running dev terminals with `Ctrl+C`.

2. Stop processes using the API and web ports:

```powershell
netstat -ano | Select-String ':4000'
netstat -ano | Select-String ':3000'
```

If either command shows a `LISTENING` process, stop it by PID:

```powershell
Stop-Process -Id <PID>
```

Example:

```powershell
Stop-Process -Id 3552
```

3. Restart Docker services:

```powershell
npm run down
npm run dev:infra
```

4. In a new terminal, run migrations:

```powershell
npm run db:migrate
```

5. In a new terminal, start the API:

```powershell
npm run dev:api
```

6. In a new terminal, start the web app:

```powershell
npm run dev:web
```

7. Verify the API:

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/health" -Method GET
```

Expected response includes:

```text
success: True
status: ok
service: aca-api
```

## Test Event Ingestion

With the API running:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:4000/events" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "anonymousId": "demo-user-001",
    "userId": "customer-001",
    "sessionId": "session-001",
    "eventName": "product_view",
    "pageUrl": "/products/nike-shoes",
    "productId": "sku-001",
    "category": "Shoes",
    "metadata": {
      "device": "desktop",
      "source": "demo"
    }
  }'
```

Check dashboard summary:

```powershell
Invoke-RestMethod -Uri "http://localhost:4000/dashboard/summary" -Method GET
```

## Common Issue: `EADDRINUSE`

If `npm run dev:api` fails with:

```text
Error: listen EADDRINUSE: address already in use :::4000
```

Something is already running on API port `4000`.

Find the process:

```powershell
netstat -ano | Select-String ':4000'
```

Stop it:

```powershell
Stop-Process -Id <PID>
```

Then restart:

```powershell
npm run dev:api
```

If `http://localhost:4000/health` already returns `aca-api`, the API is already running and you can use it without starting another copy.
