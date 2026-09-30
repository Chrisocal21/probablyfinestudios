# Probably Fine Studios — Project Overview

_A snapshot for handing to another AI/collaborator to help figure out next steps. Written 2026-09-30._

## What this is

Probably Fine Studios is the personal portfolio/studio site for Chris (a solo developer who builds small web apps, games, and tools — often with AI doing a lot of the implementation work). The site's job is to present that body of work — 15 projects ranging from a photography portfolio to a fabrication toolkit — in a way that reads as a professional resume/case-study collection rather than a flashy agency landing page.

- **Live site:** https://probablyfinestudios.com
- **GitHub:** https://github.com/Chrisocal21/probablyfinestudios
- **Author's other GitHub work:** https://github.com/Chrisocal21 (45+ repos total; this portfolio surfaces the ~15 that are real, describable products)

## Tech stack

- **Astro 7** (static site generation, `output: "static"`)
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- No JS framework (React/Vue/etc.) — Astro components + a bit of vanilla `<script>` for interactivity (slider, mobile nav, contact form)
- **Hosting:** Cloudflare Pages, deployed **manually** via `npm run deploy` (`astro build` + `wrangler pages deploy ./dist`) — there is no CI/CD or git-triggered auto-deploy configured. This has caused confusion: commits to `main` do NOT go live until someone runs the deploy command with Cloudflare credentials.
- **Separate backend:** a standalone Cloudflare Worker + D1 database ("Message Hub") that collects contact-form submissions from this site and other Chris-built sites (CookBookVerse, FieldKit) into one inbox, viewable at `/hub`. This is intentionally decoupled from the main site's frontend/framework.

## Site structure

```
/                     — homepage: full-screen slider (hero slide + one slide per project)
/portfolio            — grid of all 15 project cards
/portfolio/[id]       — individual case-study page per project (dynamic route, generated at build time)
/about                — founder bio, studio origin story, "The Work" (auto-generated from project data), contact form + social links (merged; /contact now redirects here via #contact anchor)
/team                 — redirects to /about (legacy)
/hub                  — message inbox UI for the separate Worker/D1 backend (hidden until login)
```

Shared components: `Nav.astro` (hamburger menu at all breakpoints, logo + wordmark), `Footer.astro`, `ProjectCard.astro`, `ProjectSlider.astro`, `ProjectIcon.astro` (custom inline-SVG icon set), `Layout.astro`.

## Data model

Everything project-related lives in one file: `src/data/projects.ts`. Each `Project` has:

- `id`, `title`, `description` (short), `longDescription` (case-study length)
- `role` (e.g. "Solo build"), `stack` (real tech, only filled in when confirmed — not guessed)
- `highlights` (2–4 bullet points)
- `icon` (key into `ProjectIcon.astro`) or `image` (real screenshot path) — every project has one or the other for a visual
- `tags`, `liveUrl`, `githubUrl`, `wip` (shows "In Development" badge), `theme` (per-project gradient/accent/pattern used consistently across card, slide, and case-study page)

`src/data/team.ts` holds the founder's bio/links/tools — currently just one person, rendered as an inline profile section on `/about` (not a modal-gated "team member card," since that pattern didn't make sense for a one-person studio).

## The 15 projects (current roster)

**Polished/shipped** (no "In Development" badge):
ChrisOCPhoto (photography portfolio), FieldKit (field data collection SaaS, Cloudflare D1 + Clerk), CookBookVerse (AI-assisted recipe platform), Davapalooza (event site), TRVLPlay (travel discovery PWA), Scramble (Phaser browser game), WX (weather dashboard), Hang (Supabase-backed multiplayer word game with QR room-joining)

**In development** (early-stage, thinner content, badge shown):
Standalone (parametric fabrication/maker toolkit), Ping (AI companion), SplitNote (bill-splitting utility), Games Collection (Connections-style word puzzle), Burrow (event-trip manager with a 3D globe, PDF itineraries, QR sharing), Wanderlog (travel blog with a canvas editor), ctrII (early rich-text editor on Tiptap)

All tech-stack claims were pulled from the actual GitHub repos (`package.json` dependencies, READMEs) via `gh api` — not guessed — to keep the case studies honest.

## Design system

- Dark theme throughout: `bg-black` / `bg-zinc-950` cards, `border-zinc-800`, `rounded-2xl`
- Every project has a distinct accent color + gradient + subtle pattern, applied consistently to its card, its slide, and its case-study hero
- "Eyebrow" labels: small uppercase, letter-spaced, accent-colored text above headings (used everywhere — hero, About sections, contact, case studies) — this is the main unifying visual motif
- Resume/case-study tone: role, tags-as-pills, highlights as bullet lists, stack as chips — deliberately looks like a portfolio/resume, not a marketing site
- Logo: cropped from a provided "PFS" wordmark image (`public/logo-mark.png`), paired with a two-line "Probably Fine / STUDIOS" text lockup in the nav

## Recent history (this session, chronological)

1. Removed fake "live view" screenshots (WordPress mshots API) from project cards/slider — replaced with a monogram box, then with a resume-style text layout, then finally with real screenshots (where they exist) or custom category icons
2. Added Standalone project (fetched from its live site)
3. Built out full case-study detail pages (`/portfolio/[id]`) with longDescription/highlights/stack
4. Fixed mobile nav (was a bespoke, wrapping text header on the homepage only) — unified on one `Nav.astro` with a hamburger menu at all breakpoints
5. Merged `/contact` into `/about#contact`; fixed wrong/placeholder social links (GitHub was `github.com/chrisoc`, should be `Chrisocal21`; LinkedIn/Instagram were "coming soon" placeholders)
6. Redesigned the homepage hero (removed generic AI-template gradient-text look) and gave every slide full case-study depth
7. Researched the author's other ~44 GitHub repos and added 6 more real (if early-stage) projects: Ping, SplitNote, Games Collection, Burrow, Wanderlog, ctrII
8. Overhauled `/about`: fixed a broken-looking CSS joke (absolute-positioned strikethrough text), replaced click-to-reveal team modal with an inline founder profile, made "The Work" section pull live from `projects.ts` instead of hardcoded (stale) text, unified all card styling to match the rest of the site
9. Diagnosed why changes weren't appearing live: **git commits were fine; Cloudflare Pages deploy is manual and nobody had run it.** Ran `npm run deploy` successfully — site is now live and current as of this writing
10. Added visuals back to every slide/card per the user's ask ("feed the people who need visuals, not just text") — real screenshots where they exist, custom SVG category icons everywhere else

## Known gaps / open questions worth discussing

- **Deploy process is fragile** — manual `npm run deploy`, no CI. Worth considering: connect Cloudflare Pages' native GitHub integration for auto-deploy on push to `main`, or at minimum document/automate the step so it's not forgotten again.
- **6 of the 15 projects are thin** (Ping, SplitNote, Games Collection, Burrow, Wanderlog, ctrII) — their live URLs haven't been click-verified, and their descriptions were written from README/package.json inspection rather than actually using the products.
- **No images for most projects** — only FieldKit, WX, and Hang have real screenshots; everything else relies on the new icon system. Real screenshots would likely look more credible than icons for the polished/shipped projects especially (ChrisOCPhoto, CookBookVerse, Davapalooza, TRVLPlay, Scramble).
- **Team/founder page is solo-only** — `TeamCard`/`TeamMemberModal` components were deleted since unused; if the studio ever adds people, that pattern would need to be rebuilt.
- **The Message Hub** (`/hub`, separate Worker+D1) is a distinct in-progress system, phase 1 of a longer plan (dashboard, auth, email notifications, reply functionality are all explicitly out of scope so far) — not really part of the marketing/portfolio surface but lives in the same nav.
- **No analytics/SEO pass** has been done in this session — meta descriptions exist per-page but nothing has been checked for structured data, sitemap, OG images, etc.
- **Brand voice**: The "Probably Fine Studios" self-deprecating pun is core to the identity and was intentionally kept; only visually-broken execution of jokes (like the CSS strikethrough bug) was fixed, not the tone itself. Worth deciding explicitly whether this voice is helping or hurting first impressions for a resume-style portfolio.
