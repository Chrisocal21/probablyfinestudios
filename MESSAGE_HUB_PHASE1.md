# ProbablyFineStudios - Message Hub (Phase 1: Hub Only)

## What this is

A standalone Cloudflare Worker + D1 database that receives contact-form messages from multiple ProbablyFineStudios properties (cookbookverse, fieldkit, and future sites) and stores them in one place.

This is Phase 1 only. No dashboard, no site integration yet - just prove the hub can receive and store a message correctly.

## Why standalone

ProbablyFineStudios is going through a site overhaul. This hub must not depend on that overhaul's frontend, framework, or CMS. It deploys and runs independently under the ProbablyFineStudios Cloudflare account, on its own subdomain (name TBD, not fixed to "inbox" - a guessable subdomain isn't a security concern since auth will protect the dashboard later, not the URL).

## Stack

- Cloudflare Workers (API/hub logic)
- Cloudflare D1 (SQLite, storage)
- Wrangler for local dev + deploy

## Scope for this phase

In scope:

- Worker project scaffolded with Wrangler
- D1 database created and migrated with the messages table below
- One endpoint: `POST /api/messages` - accepts a message from any site, validates it, stores it
- Shared-secret header check so random bots can't spam the endpoint
- Local testing (`wrangler dev`) confirming a message can be posted and shows up in D1

Out of scope (later phases):

- Connecting cookbookverse/fieldkit forms to this endpoint
- The dashboard UI
- Email notifications on new message
- Reply functionality
- Login/auth system for the dashboard

## Database schema (D1)

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_site TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## API endpoint

`POST /api/messages`

Request body (JSON):

```json
{
  "source_site": "cookbookverse",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hey, love the site..."
}
```

Validation:

- All fields required
- Reject if `message` exceeds ~5000 characters
- Reject if `email` fails a basic email-format check
- `source_site` must match an allow-list of known slugs (start with `cookbookverse`, `fieldkit`) - reject anything not on the list

Response:

- `201` on success, with the created row's `id`
- `400` on validation failure, with a clear error message
- `401` if the shared-secret header is missing or wrong

Abuse protection:

- Require a header (e.g. `X-Hub-Key`) matching a secret value each site's form will send. This isn't for hiding the endpoint - it's inherently visible in each site's page source - it's to filter out blind bot traffic. Store the expected value as a Worker secret via `wrangler secret put`.
- Rate limiting can be added later if spam becomes a real problem - not required for this phase.

## Environment / secrets needed

- `HUB_API_KEY` - shared secret each site's form will send
- D1 database binding configured in `wrangler.toml`

## Deployment target

- Cloudflare account: same account as ProbablyFineStudios (confirm account/team if there's more than one)
- Subdomain: not finalized yet - use a placeholder route for now, rename later without touching the code

## Definition of done for this phase

- `wrangler dev` runs locally without errors
- A test POST to `/api/messages` with valid data + correct header returns `201`, and the row appears in the local D1 database
- Missing/invalid fields return `400` with a clear message
- Requests missing or with a wrong `X-Hub-Key` return `401`
- Nothing about this depends on existing ProbablyFineStudios code or the pending overhaul
