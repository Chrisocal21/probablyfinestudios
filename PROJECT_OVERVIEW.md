# Probably Fine Studios — Project Overview

_A snapshot for handing to another AI/collaborator to help figure out next steps. Written 2026-09-30, revised later the same day after the first site checkup._

## What this is

Probably Fine Studios is the studio site for Chris, who builds small web apps, games, and tools, often with AI doing a lot of the implementation work. The studio **started solo and is looking to grow**; it is not pitched as a "solo studio". The site's job is to present the body of work (16 projects, from a photography portfolio to a fabrication toolkit) as a professional resume and set of case studies, and to turn visitors into collaborators, business partners, and clients.

- **Live site:** https://probablyfinestudios.com
- **GitHub:** https://github.com/Chrisocal21/probablyfinestudios (public; linked from the site footer)
- **Author's other GitHub work:** https://github.com/Chrisocal21 (45+ repos total; this portfolio surfaces the 16 that are real, describable products)

Two companion docs matter as much as this one:

- **[VOICE.md](VOICE.md)** — how the site talks. Chris's humor (smart-ass, warm, laughing at himself first) is part of the brand, and the facts stay straight. Read it before writing any copy.
- **[CHECKUP.md](CHECKUP.md)** — the checklist for the periodic deep review, the log of each one, and the list of open items waiting on Chris.

## Tech stack

- **Astro 7** (static site generation)
- **Tailwind CSS 4** (via `@tailwindcss/vite`); the whole stylesheet is inlined into each page (`build.inlineStylesheets: 'always'`)
- No JS framework (React/Vue/etc.) — Astro components plus small vanilla `<script>` blocks (contact form, project filter, mobile menu)
- **Fonts:** Inter (text) and Sora (headings), self-hosted from `@fontsource-variable/*`, preloaded, with metric-matched fallbacks in `src/styles/global.css`
- **Images:** logo and portrait go through `astro:assets` (resized WebP); `satori` + `sharp` draw the link-preview images at build time
- **Hosting:** Cloudflare Pages (direct upload) serves the `.com`. It is deployed with `npm run deploy` (`astro build` + `wrangler pages deploy ./dist`); pushing to GitHub alone does not update it. A local git `pre-push` hook on Chris's machine runs that deploy on every push to `main`. Vercel also builds each push and serves it at `probablyfinestudios.vercel.app` as a preview. See `CLOUDFLARE_DEPLOYMENT.md`.
- **Analytics:** Cloudflare Web Analytics is already injected on the `.com` by Cloudflare (no code in this repo).
- **Separate backend:** a standalone Cloudflare Worker + D1 database ("Message Hub") that collects contact-form submissions from this site and other Chris-built sites into one inbox, viewable at `/hub`. It does not send or receive email.

## Site structure

```
/                     — homepage: hero with availability pill, shipped projects, "behind the studio" strip, in-progress projects, "work with me" section
/portfolio/           — all 16 project cards, filterable by technology (?tech=Next.js)
/portfolio/[id]/      — case study per project: screenshot, description, highlights, "the door is open" invitation, facts sidebar, previous/next
/about/               — intro, story + timeline, "the day shift" (his jobs), GitHub activity, skills (derived from project stacks), "the fine print" (true things told his way), who Chris wants to work with, contact form
/resume/              — one-page resume generated from the same data; has a print / save-as-PDF layout
/hub/                 — message inbox UI for the separate Worker/D1 backend (noindex)
/404                  — branded not-found page
/contact, /team       — legacy redirects to /about/
/og/[slug].png        — link-preview images (site, about, one per project), generated at build time
/sitemap.xml, /robots.txt
```

Shared pieces: `Layout.astro` (all head tags: canonical, Open Graph/Twitter, icons, font preloads, JSON-LD; also renders the nav, `<main>`, and footer), `Nav.astro` (inline links on desktop, `<details>` menu on mobile), `Footer.astro`, `ProjectCard.astro`, `ProjectSection.astro`, `ProjectIcon.astro`, `OpenTo.astro` (the collaborator / partner / client cards used on the homepage and About).

The live host serves pages with a trailing slash (`/about/`), so internal links and canonical URLs use one.

## Data model

Almost everything is data:

- `src/data/projects.ts` — each `Project` has `id`, `title`, `description` (short), `longDescription`, `invite` (who Chris would like to hear from about this project; shown on the case study), `role`, `stack`, `highlights`, `icon` (key into `src/data/icons.ts`), `tags`, `liveUrl`, optional `liveNote` (shown when the live link is not open to the public, as with Burrow), `githubUrl`, `wip`, and `theme` (gradient/accent/pattern used on the card, case study, and link-preview image). Helpers: `shippedProjects`, `inProgressProjects`, `liveLabel()` (custom domain, or "Live preview" for `*.vercel.app` addresses).
- `src/assets/screens/<id>.webp` — a screenshot of each project's live site, shown on its case study. `npm run screens` (`scripts/capture-screens.mjs`) re-captures them with headless Chrome and records the date in `captured.json`. The older `image` field (a path under `public/`) is only a fallback for a project with no file there.
- `src/data/profile.ts` — everything about Chris: bio, timeline, working principles, "the fine print", what he looks for in people, who he wants to hear from (`openTo`), availability, and work history (`experience`: Swanky Badger since October 2023, Davapalooza since July 2023; `education` and `fullName` are still empty). Each job has plain `points` for the resume and an `aside` in his voice for About. `getSkills()` derives the skills list from every project's `stack`, so adding a project updates `/about/` and `/resume/`.
- `src/data/site.ts` — site name, URL, tagline, description, nav links, and `contactLink()` (builds `/about/?topic=…&project=…#contact`, which the contact form reads to pre-fill itself).
- `src/data/github.ts` — reads the public GitHub contribution calendar at build time (falls back to `contributions-snapshot.json`), cached so it is fetched once per build.

## The 16 projects (current roster)

**Shipped** (`wip: false`): Not A Cable, ChrisOCPhoto, FieldKit, CookBookVerse, Davapalooza, Standalone, Burrow.

**In development** (`wip: true`): TRVLPlay, Scramble, WX, Hang, Ping, SplitNote, Games Collection, Wanderlog, ctrII.

Chris decides what counts as shipped. On 2026-10-01 he moved Not A Cable (in daily use on his desktop) and Standalone (far enough along) up.

Not A Cable is the only one that is not a website: it is a Windows desktop app (Electron) that lives in a local folder, not on GitHub, so it has no live link. Its `download` field has a label and no `url`, which shows a "coming soon" button; add the `url` when the installer is public. Its screenshot was supplied by Chris and edited for privacy: the local network address is blurred after "192", and the QR code (which encoded the same address) was replaced with one that opens the project page. Do the same to any new screenshot of it.

Besides projects, the homepage advertises two things from `src/data/profile.ts`: `scripting` (Illustrator and Photoshop scripts Chris writes for laser-engraving production, offered as a service) and `helpWanted` (the open call for eager learners; "The Forge" is the name of his planning setup, a Claude Project that briefs and maps each project before the build).

Tech-stack claims were pulled from the actual repos (`package.json` dependencies, READMEs), not guessed. All 15 live URLs were checked on 2026-09-30 and respond; the Games Collection link was corrected (it had pointed at an unrelated placeholder site).

**Descriptions were re-verified on 2026-09-30.** Several had been guessed from a project's name or dependencies and were wrong about what the product is. Eight were rewritten from each project's own planning docs (feature maps, briefs, READMEs in its repo) and its live site:

| Project | It had said | It actually is |
| :--- | :--- | :--- |
| FieldKit | field data collection | an operations app for small service businesses (jobs, quotes, invoices, scheduling) |
| CookBookVerse | a personal recipe collection | a discovery-first recipe platform with kitchen-list matching and an AI assistant |
| Davapalooza | AI used for content generation | the South O Block Party site; AI screens community photo submissions |
| TRVLPlay | a trip-discovery app | a collection of thinking games for travelers (Sort, Impostor, Pairs, Blitz) |
| Scramble | a word puzzle | a side-scrolling platformer starring an egg |
| Hang | a word-guessing game | a multiplayer bar-game platform joined by QR code |
| Games Collection | word games only | five browser games (Connections, Sudoku, Word Search, Tile Quest, RECLAIMED) |
| ctrII | a writing tool | a new-tab command center ("ask, save, capture") |

When a project changes, check its repo docs and live site before editing its description here.

## Design system

- Dark theme throughout: `bg-black` / `bg-zinc-950` cards, `border-zinc-800`, `rounded-2xl`
- Sora for headings, Inter for everything else
- Every project has a distinct accent color + gradient + subtle pattern, applied to its card, case-study hero, and link-preview image
- "Eyebrow" labels: small uppercase, letter-spaced text above headings — the main unifying motif
- Project cards all use an icon panel (no screenshots on cards); real screenshots appear on the case-study pages (15 of 16; Burrow is a private team tool and has none)
- Small text uses `zinc-400` or lighter on dark backgrounds to meet contrast guidelines
- Logo: `public/logo-mark.png` (the "PFS" mark). The favicon is the "P" alone, because three letters are unreadable at 16px; `npm run icons` regenerates the icon set.

## Quality baseline

Measured with Lighthouse (mobile profile) on 2026-09-30:

| | Before (live site) | After (local build) |
| :--- | :--- | :--- |
| Accessibility | 88–90 | 100 |
| SEO | 92 | 100 |
| Best practices | 100 | 100 |
| Performance | 95–97 | 99–100 (local server, so not directly comparable) |

## Known gaps / open questions

The live list of open items, with checkboxes, is in [CHECKUP.md](CHECKUP.md). The ones that shape the site most:

- **Copy written on Chris's behalf needs his review.** Nearly every sentence on the homepage and About, the per-project `invite` lines, and the eight rewritten project descriptions are drafts in his voice.
- **Work history is partial.** It has the two jobs Chris described in chat. LinkedIn refuses automated readers, so nothing was imported from it; the resume has no education and shows only a first name.
- **No working email.** `hello@probablyfinestudios.com` has no mail records and was removed from the site. The contact form (Message Hub) is the only channel, and nothing notifies Chris when a message arrives.
- **Deploy still depends on one machine.** The `.com` updates through a local git hook. A GitHub Action or moving the domain to Vercel would remove that dependency.
- **Screenshots are single stills.** A few are only a landing or sign-in screen (Ping, Hang). Short screen recordings, or stills from inside the product, would show more.
- **No testimonials or outcomes yet** (users, results, feedback) on any case study.
- **An AI feature is proposed but not built:** a "pitch me an idea" machine that turns a visitor's one-line idea into a mock project card. Details in CHECKUP.md.
