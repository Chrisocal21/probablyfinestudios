# The Checkup

*Is everything still probably fine?*

Every few weeks or months, the whole site gets a slow, careful look: is it accurate, does everything work, does it still sound like Chris, and what should happen next. This file is the checklist for that look and the running record of what each one found.

## How to run one

Open this project in Claude Code, pick Opus with thinking effort at its highest setting, and paste:

> Run the site checkup in CHECKUP.md. Work through every item in the checklist, fix what you can, verify your fixes, and add a dated entry to the log at the bottom. Close any open items that are done and list anything that needs me.

That is the whole ritual. A full checkup takes a while. Let it.

## Ground rules for whoever runs it

- **Check facts at the source.** A project's description comes from that project's own docs and its live site (see the table below), never from its name or its dependencies. The first checkup found eight descriptions that had been guessed, and guessed wrong.
- **Don't invent facts about Chris.** Jobs, dates, numbers, and opinions come from him or from something he wrote. Words written in his voice are drafts until he has read them; say which ones are new.
- **Write like him.** Read [VOICE.md](VOICE.md) first.
- **Prove it.** Build the site, look at the pages at desktop and phone widths, and run the checks. "Should work" is not a finding.
- **Leave his calls to him.** Account settings, spending money, deleting his files, and anything that goes out under his name without his review are his decisions.
- **Nothing goes live until he pushes.** Leave changes uncommitted unless he asks otherwise.

## The checklist

### 1. Is every project described accurately?

For each project in [src/data/projects.ts](src/data/projects.ts), read its source of truth and its live site, then compare the description, highlights, tags, status (`wip`), and tech stack.

| Project | Where the truth lives |
| :--- | :--- |
| ChrisOCPhoto | repo `chrisocphoto` (`BUILD_GUIDE.md`, `PHASE_PLAN.md`); chrisocphoto.com |
| FieldKit | repo `fieldkit` (`fieldkit.md`, `ROADMAP.md`); get-fieldkit.com |
| CookBookVerse | repo `cbv` (`doc/project-brief.md`, `doc/state-of-the-build.md`); cookbookverse.com |
| Davapalooza | repo `davapalooza` (`README.md`, `handoff.md`); davapalooza.com |
| Burrow | repo `git` (`README.md`, `PROJECT.md`, `ROADMAP.md`); the live link is a team sign-in |
| TRVLPlay | repo `trvlplay` (`docs/feature-map.md`, `docs/progress-tracker.md`); trvlplay.com, "Play as Guest" |
| Scramble | repo `scramble` (`documents/feature-map.md`, `documents/progress-tracker.md`) |
| WX | repo `wx` (`README.md`, `FEATURE_MAP.md`) |
| Hang | repo `hang` (`PROJECT_BRIEF.md`, `FEATURE_MAP.md`) |
| Standalone | repo `standalone`; its live homepage describes each tool |
| Ping | repo `ping` (`README.md`, `overview.md`) |
| SplitNote | repo `fiscioapp` (`README.md`) |
| Games Collection | repo `connections` (`README.md`); the live game picker |
| Wanderlog | repo `wanderlog` (`README.md`, `docs/`) |
| ctrII | repo `ctrII` (`FEATURE_MAP.md`, `PROGRESS_TRACKER.md`) |
| Not A Cable | local folder `Documents/code/notacable` (`BRIEF.md`, `PROGRESS.md`); not on GitHub |

Repos are under `github.com/Chrisocal21`. Read a file with `gh api repos/Chrisocal21/<repo>/contents/<path> --jq .content | base64 -d`.

### 2. Is there new work that belongs on the site?

- `gh repo list Chrisocal21 --limit 200` and the folders in `Documents/code/`: anything new, real, and describable that isn't in `projects.ts`?
- Has anything moved from "in development" to shipped, or been abandoned?

### 3. Do all the links work?

```bash
npm run check                              # builds, then checks every internal link and anchor
node scripts/check-links.mjs --external    # also requests every external URL
```

A project link that returns 200 can still be the wrong site (the first checkup found one), so open anything that looks odd.

### 4. Are the screenshots current?

```bash
npm run screens
```

Then look at every image in `src/assets/screens/` before keeping it. Not A Cable's screenshot is supplied by hand (it is a desktop app) and must not show his network address, in the text or in the QR code. Burrow has none (private).

### 5. Does it still sound like Chris?

Read the homepage, About, and two case studies out loud against [VOICE.md](VOICE.md). Look for: jokes that landed on someone other than Chris, "probably fine" used too often, corporate filler, and the phrase "solo studio" creeping back in.

### 6. Is the resume current?

- Jobs, titles, and dates in [src/data/profile.ts](src/data/profile.ts) (`experience`, `education`).
- Anything new he has learned that belongs in `beyondCode`.
- Open `/resume/` and print it: it should still fit on two pages.

### 7. Is the live site the latest version?

```bash
git log -1 --oneline
npx wrangler pages deployment list --project-name=probablyfinestudios   # "Source" = the commit that is live
```

If they differ, the `.com` is behind. See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md).

### 8. Does the contact form work end to end?

Send a real test message from `/about/#contact` and confirm it shows up in `/hub`. This is the only way anyone reaches Chris through the site.

### 9. Quality scores

```bash
npm run build && npx astro preview --port 4322
npx lighthouse http://127.0.0.1:4322/ --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new"
```

Run it for `/`, `/about/`, `/portfolio/`, one case study, and `/resume/`. Accessibility, best practices, and SEO should be 100. Also look at each page at phone width (390px) for anything that overflows.

### 10. Housekeeping

- `npm audit`: anything high or critical?
- The GitHub activity on `/about/` reads live data at build time. If the build log says it used the snapshot, find out why.
- Are the docs still true? ([README.md](README.md), [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md), this file.)

### 11. The open items

Go through "Open items" below. Close what is done, and ask Chris about what has been sitting.

## Open items

Things that need Chris, or a decision from him. Tick them off as they close.

- [ ] **Read the words written in your voice.** Homepage, About (including "The fine print" and "The day shift"), the eight rewritten project descriptions, and each project's "who I'd like to hear from" line. They are drafts until you say otherwise.
- [ ] **Work history from LinkedIn.** LinkedIn blocks automated reading, so the resume has only what you said in chat: Swanky Badger (since October 4, 2023) and Davapalooza (since July 2023). Export your profile (LinkedIn → More → Save to PDF) or paste it, and the rest can go in.
- [ ] **Your name on the resume.** It says "Chris". Set `fullName` in `src/data/profile.ts` if you want more.
- [ ] **The AI idea.** Recommended: the "Pitch me an idea" machine (see the log entry below). Needs a yes and an OpenAI key.
- [ ] **Nothing tells you when a message arrives.** The contact form saves to the inbox at `/hub` and stops there. `hello@probablyfinestudios.com` does not receive mail.
- [ ] **Astro security update.** Stop the dev server, then `npm audit fix`.
- [ ] **Not A Cable's download is a placeholder.** The button says "coming soon". When the installer is somewhere public (a GitHub release works), add `url` to its `download` field in `src/data/projects.ts`.
- [ ] **Standalone is listed as shipped; its own tracker disagrees.** The progress tracker in its folder (September 21, 2026) says 26% overall and that nothing has been test-cut on a real machine. Update the tracker or the site, whichever is behind.
- [ ] **The legal page was not written by a lawyer.** `/legal/` (terms, disclaimers, privacy) is a sensible plain-English baseline. Have a lawyer read it once, and ask about forming an LLC: a disclaimer discourages claims, but a company is what keeps a claim away from your personal assets. Keep the page true: if the site ever adds cookies, a newsletter, payments, or an AI feature, update the privacy section and its date.
- [ ] **Who owns the engraving scripts?** The Illustrator and Photoshop scripts on the homepage were written for the day job. Check that offering script work on the side, and describing those scripts, is fine with Swanky Badger.
- [ ] **Unpaid help has rules.** The "eager learners" call says it is not a job offer. Before anyone actually does work, put the arrangement in writing; California is strict about unpaid work for a business.
- [ ] **The Adobe scripts are described, not shown.** The homepage section names two real scripts. A short screen recording of one running would sell it better.
- [ ] **Deploying depends on one computer.** The `.com` updates through a git hook on this machine only.
- [ ] **GitHub repo page.** Its website link still points at the `vercel.app` address and it has no description.
- [ ] **Proof from other people.** No testimonials, user counts, or outcomes anywhere yet.

## The log

Newest first. Each entry: what was checked, what was found, what was fixed, what could not be verified.

### Touch-up — October 1, 2026

Not a full checkup. Changes Chris asked for after reading Checkup 1:

- Not A Cable's screenshot no longer shows his network address (blurred in the text, and the QR code replaced). The original was never committed or published.
- Not A Cable and Standalone moved to shipped. Not A Cable leads the list and has a "download coming soon" button.
- New homepage section for his Illustrator and Photoshop scripts, described from the script files on his machine.
- New "Eager learners" call under the collaborator cards (homepage and About), a matching contact-form topic, and "Hungry to learn" in what he looks for in people.
- The printed resume drops each shipped project's stack line and third and fourth highlights to stay on two pages.

### Checkup 1 — September 30, 2026

The first one, and a big one: it turned a decent portfolio into a complete site. Done in two rounds on the same day.

**Round one: make it complete and professional**

*The biggest finding was accuracy.* Eight of the then-15 project descriptions were wrong about what the product is. They had been guessed from project names. All were rewritten from each project's own docs and live site:

| Project | The site said | It actually is |
| :--- | :--- | :--- |
| FieldKit | field data collection | an operations app for small service businesses: jobs, quotes, invoices, scheduling |
| CookBookVerse | a personal recipe collection | a recipe discovery platform that matches what's in your kitchen |
| Davapalooza | AI writes its content | the South O Block Party site, where AI screens community photo submissions |
| TRVLPlay | a trip-discovery app | a collection of thinking games for travelers |
| Scramble | a word puzzle | a platformer starring an egg |
| Hang | a word-guessing game | a multiplayer bar-game platform joined by QR code |
| Games Collection | word games only | five browser games |
| ctrII | a writing tool | a new-tab command center |

Also found and fixed:

- The Games Collection button linked to someone else's blank placeholder site.
- The favicon pointed at a file that did not exist.
- Mistyped addresses showed the homepage instead of a not-found page.
- There was no sitemap or robots file, and no link-preview image for sharing.
- The menu could not be opened with a keyboard, and small gray text was too faint to pass contrast guidelines.
- The docs described a deploy process and pages that no longer existed.

Built:

- **Homepage** that says who Chris is and that he is looking for people, with a "work with me" section.
- **Case studies** with a real screenshot of the live product, a line naming who Chris would like to hear from, and a button that opens the contact form already filled in for that project.
- **`/resume/`**, generated from the projects and skills, printing to two pages.
- **Project filter** by technology; skills on About link to the projects that prove them.
- **Link previews**: a branded card for every page, drawn at build time.
- **Typefaces**: Sora for headings and Inter for text, in place of each device's default font.
- **`npm run screens`** to re-capture screenshots, and **`npm run check`** to check links.

Scores (Lighthouse, mobile profile):

| | Before (live site) | After (local build) |
| :--- | :--- | :--- |
| Accessibility | 88–90 | 100 |
| SEO | 92 | 100 |
| Best practices | 100 | 100 |
| Performance | 95–97 | 99–100 (local server, so not a fair comparison) |

**Round two: make it sound like Chris**

- **Voice.** The whole site was rewritten to the brief in [VOICE.md](VOICE.md): smart-ass, warm, laughing at himself first, facts kept straight.
- **Positioning.** No longer a "solo studio". It is a studio that started solo and is looking to grow: "Started solo. Not planning to stay that way."
- **Work history.** Swanky Badger (production manager, on-site travel manager, senior engraver, plus logistics, warehouse, R&D, and development) and Davapalooza (technical director) are on About ("The day shift") and on the resume.
- **Character.** About has a new section, "The fine print": seven true things, told the way Chris would tell them.
- **Not A Cable** added as project 16, using Chris's own screenshot and the wording from its project brief.
- **This file and VOICE.md** were written.

**An idea on the table: AI on the site**

Chris asked what OpenAI could do here that is clever and funny and not a chatbot. The recommendation:

> **The "pitch me an idea" machine.** A visitor types one sentence, any idea, however bad. A few seconds later they get a mock Probably Fine Studios project card for it: a name, a one-line pitch in Chris's voice, a believable tech stack drawn from his real skills, three features, and a "probably fine" rating. Two buttons: roll again, or "let's actually build this", which opens the contact form with their idea already in it.

It is one input and one result, so it is not a chatbot. It is funny, it shows exactly what the studio does (turn an idea into a product with AI), and it hands Chris a lead with the idea written down. It would run through the existing message-hub Worker so the OpenAI key stays private, with a per-visitor limit, a content check on what people type, and a spending cap. A no-typing companion, "smash two of my projects together", could be generated ahead of time and cost nothing per visitor.

Not built. It needs a yes and an OpenAI key.

**Could not be verified**

- Vercel's build of these changes. It only runs after a push.
- Performance on the real host. The "after" number is from a local server.
- LinkedIn: it refuses automated readers, so nothing was imported from it and its link could not be checked.
- The contact form end to end. The backend answers, but no test message was sent.
