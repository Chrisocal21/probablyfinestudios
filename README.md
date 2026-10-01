# Probably Fine Studios

The studio site for Probably Fine Studios: a small product studio (started solo, looking to grow) shipping web apps, tools, and games.

**Live:** [probablyfinestudios.com](https://probablyfinestudios.com)

Built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com). It is a fully static site: no framework runtime, and only a few small scripts (contact form, project filter, mobile menu).

## Pages

| Path | What it is |
| :--- | :--- |
| `/` | Homepage: shipped projects, projects in progress, and how to work with me |
| `/portfolio/` | Every project, filterable by technology (`/portfolio/?tech=Next.js`) |
| `/portfolio/[id]/` | A case study per project |
| `/about/` | Story, GitHub activity, skills, who I want to work with, and the contact form |
| `/resume/` | A one-page resume generated from the same data, with a print / save-as-PDF layout |
| `/hub/` | Private inbox for contact-form messages (not indexed) |

## Where the content lives

Almost everything on the site is data. Edit these files and the pages follow.

| File | What it controls |
| :--- | :--- |
| [src/data/projects.ts](src/data/projects.ts) | Every project: description, case study text, tech stack, links, colors, icon, and the "who I'd like to hear from" line |
| [src/data/profile.ts](src/data/profile.ts) | The About page: bio, timeline, how I work, what I look for in people, availability, and resume extras (experience, education) |
| [src/data/site.ts](src/data/site.ts) | Site name, tagline, description, and the navigation links |
| [src/data/icons.ts](src/data/icons.ts) | The outline icon for each project |

### Adding a project

1. Copy an entry in [src/data/projects.ts](src/data/projects.ts) (or start from `starterProjectTemplate` at the bottom of that file).
2. Give it a unique `id`, a `stack`, and `wip: true` or `false`.
3. Pick an `icon` from [src/data/icons.ts](src/data/icons.ts), or add a new one there.
4. Optional: run `npm run screens -- your-project-id` to capture a screenshot of its live site for the case study.

That is all. The rest updates itself:

- the homepage, projects page, and a new case study page
- the skills list on `/about/` and `/resume/` (built from every project's `stack`)
- a link-preview image for the new page (`/og/[id].png`)
- the sitemap

## What gets generated at build time

- **GitHub activity** on `/about/` is read from the public contribution calendar ([src/data/github.ts](src/data/github.ts)). If GitHub can't be reached, the build falls back to `src/data/contributions-snapshot.json`.
- **Link-preview images** (the card shown when a link is pasted into a chat or LinkedIn) are drawn by [src/lib/og.ts](src/lib/og.ts): one for the site, one for `/about/`, and one per project.
- **`sitemap.xml` and `robots.txt`** come from [src/pages/sitemap.xml.ts](src/pages/sitemap.xml.ts) and [src/pages/robots.txt.ts](src/pages/robots.txt.ts).
- **Favicon and app icons** in `public/` are made from `public/logo-mark.png` by `npm run icons`. Re-run it only if the logo changes.

## Case-study screenshots

Each case study shows a screenshot of the live product when `src/assets/screens/<id>.webp` exists. `npm run screens` opens every project's live site in headless Chrome (or Edge) and saves a fresh one; `npm run screens -- wx hang` does only those projects. Projects that need a click or a location to show something useful have a recipe at the top of [scripts/capture-screens.mjs](scripts/capture-screens.mjs). Look at the images before committing them: they are pictures of whatever the live sites showed at that moment.

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the dev server at `localhost:3000` |
| `npm run build` | Build the site to `./dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run deploy` | Build, then upload `./dist/` to Cloudflare Pages |
| `npm run icons` | Regenerate the favicon and app icons from the logo |
| `npm run screens` | Re-capture the case-study screenshots from the live sites |
| `npm run check` | Build, then check every internal link and anchor |

Requires Node.js 22.12 or newer.

## Deployment

`probablyfinestudios.com` is served by Cloudflare Pages, which is updated by uploading a build, not by pushing to GitHub. See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md).

Vercel also builds every push to `main` and serves it at `probablyfinestudios.vercel.app`, which is useful as a preview. Canonical URLs on every page point at the `.com`.

## Related

- [VOICE.md](VOICE.md) is how the site talks. Read it before writing or editing any copy.
- [CHECKUP.md](CHECKUP.md) is the checklist for the periodic deep review of the site, with a log of each one and the list of open items.
- [message-hub/](message-hub/) is a separate Cloudflare Worker with a D1 database that receives the contact form. It deploys on its own; see [MESSAGE_HUB_PHASE1.md](MESSAGE_HUB_PHASE1.md).
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) has a longer description of the site's structure and design decisions.

## License

© 2026 Probably Fine Studios. All rights reserved.

Questions or ideas: use the contact form at [probablyfinestudios.com/about/#contact](https://probablyfinestudios.com/about/#contact).
