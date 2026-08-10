# ProbablyFineStudios Message Hub

Standalone Cloudflare Worker plus D1 service for ingesting contact messages from multiple sites.

## Phase 1 scope

- One endpoint path: /api/messages
- POST /api/messages to store messages
- GET /api/messages?limit=50 to read inbox rows
- Shared secret auth via X-Hub-Key header
- Admin login endpoint: POST /api/admin/login
- Admin inbox endpoint: GET /api/admin/messages?limit=50
- Admin send endpoint: POST /api/admin/messages
- D1 persistence in messages table

## Allowed source_site slugs

- cookbookverse
- fieldkit
- chrisocphoto
- probablyfinestudios

## Setup

1. Install dependencies
- npm install

2. Create D1 database in Cloudflare
- wrangler d1 create message_hub

3. Update D1 database_id in wrangler.toml
- Replace placeholder 00000000-0000-0000-0000-000000000000

4. Add Worker secrets
- wrangler secret put HUB_API_KEY
- wrangler secret put HUB_DASHBOARD_PASSWORD
- wrangler secret put HUB_ADMIN_SESSION_SECRET

5. Apply migrations locally
- npm run d1:migrate:local

6. Run locally
- npm run dev

## Remote status

- Worker deployed URL: https://mail.probablyfinestudios.com
- API endpoint: https://mail.probablyfinestudios.com/api/messages
- Admin login endpoint: https://mail.probablyfinestudios.com/api/admin/login
- Admin inbox endpoint: https://mail.probablyfinestudios.com/api/admin/messages
- Remote D1 migration 0001_create_messages.sql applied successfully

## Finish production auth setup

Set the production secrets before sending real form traffic or using the inbox dashboard:

- wrangler secret put HUB_API_KEY
- wrangler secret put HUB_DASHBOARD_PASSWORD
- wrangler secret put HUB_ADMIN_SESSION_SECRET

Then redeploy:

- npm run deploy

## Local test request

PowerShell example:

Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8787/api/messages" -Headers @{ "X-Hub-Key" = "your-secret" } -ContentType "application/json" -Body '{"source_site":"cookbookverse","name":"Jane Doe","email":"jane@example.com","message":"Hello from test"}'

Expected success response:
- status 201
- body contains numeric id

## Admin login test

PowerShell example:

Invoke-RestMethod -Method Post -Uri "https://mail.probablyfinestudios.com/api/admin/login" -ContentType "application/json" -Body '{"password":"your-dashboard-password"}'

Expected success response:
- status 200
- body contains token and expires_in
