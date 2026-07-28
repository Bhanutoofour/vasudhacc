# Vasudha Commerce Command Center

Internal ecommerce intelligence for Vasudha Foods. Phase A provides the inventory dashboard with typed mock data. Phase B adds the secure Shopify Admin GraphQL integration. Phase C adds Vercel Blob snapshots and a daily cron job; the UI still shows mock data until the live history feed is wired in Phase D.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4
- Shopify Admin GraphQL API `2026-07`
- Recharts
- Vercel deployment; private Vercel Blob snapshots and cron scheduling in Phase C

## Local setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide values there. Never commit `.env.local` or expose the Admin token with a `NEXT_PUBLIC_` prefix.

```dotenv
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your-dev-dashboard-client-id
SHOPIFY_CLIENT_SECRET=your-dev-dashboard-client-secret
SHOPIFY_API_VERSION=2026-07
CRON_SECRET=a-long-random-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

The Shopify Dev Dashboard app needs at least `read_products`, `read_inventory`, and `read_locations` Admin API scopes. Reinstall or update the app after changing scopes so the token receives them.

Create the Blob store as private inside the Vercel project storage settings. When the store is connected to the project, Vercel adds the Blob token env var automatically.

## Test the current-inventory API

Start the app, then call the protected server route:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/inventory
```

The route paginates all variants and all inventory levels, then returns one normalized row per Shopify inventory item and location. Shopify IDs—not SKU—are used as identity. Missing SKUs, images, inventory items, and levels are reported in `diagnostics`.

## Phase C snapshot flow

Vercel Cron calls `GET /api/cron/inventory` once per day at `02:00 UTC`, which is `07:30 IST`.

That route:

- fetches the current Shopify inventory
- writes a private JSON snapshot to `inventory-snapshots/YYYY-MM-DD.json`
- overwrites the same day’s snapshot if it runs again

The comparison reader is available at `GET /api/inventory/history`, which loads the latest three available snapshots from Blob and returns comparison data ready for the dashboard.

## Security

- Shopify requests execute only in server-only modules. Dev Dashboard credentials are exchanged for a short-lived token and refreshed automatically.
- The Admin token is never returned, logged, or included in the client bundle.
- `/api/inventory` requires `CRON_SECRET` as a bearer token and disables caching.
- `/api/cron/inventory` and `/api/inventory/history` also require `CRON_SECRET`.
- Private Blob reads use `BLOB_READ_WRITE_TOKEN`; the store is not public.
- Keep all secrets in `.env.local` locally and in Vercel environment variables in production.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Current limitation

The dashboard still renders mock inventory data. Phase C now stores the real Shopify snapshots and exposes the latest three-day comparison, and Phase D will switch the UI over to those live results.
