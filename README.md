# Vasudha Commerce Command Center

Internal Shopify inventory intelligence for Vasudha Foods. The dashboard reads current inventory from Shopify, stores private daily snapshots in Vercel Blob, and compares live stock with the two prior calendar days.

## Stack

- Next.js 16 App Router, React 19, strict TypeScript, and Tailwind CSS 4
- Shopify Admin GraphQL API `2026-07`
- Recharts
- Vercel deployment, private Vercel Blob storage, and Vercel Cron

## Local setup

```bash
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and configure every required value:

```dotenv
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_CLIENT_ID=your-dev-dashboard-client-id
SHOPIFY_CLIENT_SECRET=your-dev-dashboard-client-secret
SHOPIFY_API_VERSION=2026-07

DASHBOARD_USERNAME=vasudha-admin
DASHBOARD_PASSWORD=a-strong-password-with-at-least-12-characters
SESSION_SECRET=at-least-32-random-characters-used-to-sign-sessions

CRON_SECRET=a-long-random-secret
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

Never commit `.env.local`, expose these values through `NEXT_PUBLIC_` variables, or share them in screenshots.

## Shopify app

The installed Shopify Dev Dashboard app requires these Admin API scopes:

```text
read_products,read_inventory,read_locations
```

After changing scopes, release a new app version and approve the updated installation on the store. The app must remain installed for client-credentials authentication to work.

## Dashboard authentication

All dashboard and inventory pages require the configured internal-admin username and password. Successful login creates a signed, HTTP-only, SameSite session cookie that expires after 12 hours. The inventory export route verifies the session independently, and the UI provides a Sign out action.

Use a unique password of at least 12 characters and a cryptographically random `SESSION_SECRET` of at least 32 characters. Change either value in Vercel and redeploy to invalidate or replace access.

## Inventory behavior

- **Today** is fetched live from Shopify whenever the dashboard or inventory page is loaded.
- **Yesterday** uses the snapshot for the exact prior calendar date.
- **Day before** uses the snapshot for the exact date two days earlier.
- Missing snapshots display as unavailable instead of copying current inventory.
- If Shopify is temporarily unavailable, the UI can fall back to the latest saved snapshots.
- CSV and JSON exports reflect the authenticated user's current filtered view.

## Daily snapshots

Vercel Cron calls `GET /api/cron/inventory` at `02:00 UTC`, or `07:30 IST`, every day. The route fetches current Shopify inventory and writes a private document to:

```text
inventory-snapshots/YYYY-MM-DD.json
```

Running the cron more than once on the same day safely replaces that day's snapshot. When `CRON_SECRET` is configured in Vercel, scheduled requests include it as a bearer token.

Protected diagnostic endpoints:

```text
GET /api/inventory
GET /api/inventory/history
GET /api/cron/inventory
```

Each requires `Authorization: Bearer <CRON_SECRET>`.

## Security

- Shopify credentials, access tokens, dashboard credentials, and Blob credentials are server-only.
- Shopify access tokens are short-lived, cached only in server memory, and refreshed automatically.
- Dashboard sessions are signed and stored in Secure/HTTP-only cookies in production.
- Page requests receive an optimistic authentication check, while pages and exports also verify the session close to the data access.
- Private Blob data is never exposed through a public Blob URL.
- Internal inventory and cron endpoints require constant-time bearer-token verification.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Deployment checklist

1. Configure all environment variables for the Vercel Production environment.
2. Connect a private Vercel Blob store to the project.
3. Deploy the application.
4. Confirm an unauthenticated request redirects to `/login`.
5. Sign in and verify current inventory against Shopify.
6. Confirm the next scheduled cron execution returns `200` and creates the dated snapshot.
