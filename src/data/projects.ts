export interface ProjectTheme {
gradient: string;
accent: string;
pattern?: string;
patternSize?: string;
}

export interface Project {
id: string;
title: string;
description: string;
longDescription?: string;
/** One or two sentences aimed at the people this project would love to hear from. Shown on its case-study page. */
invite?: string;
role?: string;
stack?: string[];
highlights?: string[];
icon?: string;
image: string;
tags: string[];
previewStyle?: 'browser' | 'dashboard';
liveUrl?: string;
/** Shown next to the live link when visitors can't just walk in (for example a private tool). */
liveNote?: string;
/** For apps you install. Leave `url` out until the file is public and the button shows as "coming soon". */
download?: { label: string; url?: string };
githubUrl?: string;
wip?: boolean;
theme?: ProjectTheme;
collaborators?: Array<{ name: string; url: string }>;
}

export const projects: Project[] = [
{
id: 'not-a-cable',
icon: 'cable',
title: 'Not A Cable',
description: 'Photos from your phone to your PC over Wi-Fi. Scan a QR code, pick, send. Because cables are for people who plan ahead.',
longDescription: 'Not A Cable is a small Windows app for getting photos off your phone without the usual options: finding a cable (annoying), emailing them to yourself (embarrassing), or syncing your whole life to a cloud (overkill). Open it, scan the QR code with your phone, pick photos in the browser, and they land in a dated folder on your PC while the window shows each one arriving. There is nothing to install on the phone, and the photos never leave your own Wi-Fi.',
invite: 'Tired of emailing photos to yourself? Ask me for a copy, try it on your own Wi-Fi, and tell me where it breaks.',
role: 'Solo build',
stack: ['Electron', 'Express', 'JavaScript'],
highlights: [
'Scan a QR code and send from the phone browser, with no phone app to install',
'Photos stay on your own Wi-Fi: no cloud, no account',
'Lands in a dated folder you can name, saved anywhere on your PC, and never overwrites a file',
'The desktop window shows each photo as it arrives',
],
image: '',
tags: ['Desktop App', 'Photos', 'Utility'],
liveNote: 'It runs on my desktop every day. The public download is on its way; until then, ask and I will send you a copy.',
download: { label: 'Download for Windows' },
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #0b0a1a 100%)',
accent: '#a5b4fc',
pattern: 'radial-gradient(circle, rgba(165,180,252,0.08) 1px, transparent 1px)',
patternSize: '22px 22px',
},
},
{
id: 'chrisocphoto',
icon: 'camera',
title: 'ChrisOCPhoto',
description: 'A photography portfolio built around one rule: get out of the way of the images. Everything else serves the photos.',
longDescription: 'ChrisOCPhoto is a photography portfolio built around a simple rule: get out of the way of the images. Every layout decision favors fast loading, generous whitespace, and a dark, gallery-like backdrop so the photos carry the page instead of competing with UI chrome. Photos carry their own EXIF and location data, mapped out with Mapbox for a sense of where each shot was taken.',
invite: 'Photographers: if you want a portfolio that gets out of the way of your work, I\'d like to build it.',
role: 'Solo design & build',
stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'AWS S3', 'Mapbox GL'],
highlights: [
'Image-first layout with minimal UI chrome',
'EXIF-aware galleries with Mapbox-powered shoot locations',
'Image pipeline via Sharp, assets served from S3',
],
image: '',
tags: ['Photography', 'Portfolio', 'Web'],
liveUrl: 'https://www.chrisocphoto.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #0a0a0a 100%)',
accent: '#d6d3d1',
pattern: 'radial-gradient(circle, rgba(214,211,209,0.08) 1px, transparent 1px)',
patternSize: '20px 20px',
},
},
{
id: 'fieldkit',
icon: 'clipboard',
title: 'FieldKit',
description: 'Run a small service business without the chaos. Jobs, quotes, invoices, and scheduling in one lightweight app built for crews in the field.',
longDescription: 'FieldKit is a lightweight operations app for contractors, landscapers, and other small service businesses. A job moves from quote to schedule to invoice in one place, with materials, inventory, expenses, and time tracked alongside it. Quotes go out as a share link or a PDF, a branding studio keeps every document looking like the business that sent it, and the whole thing installs as an app and keeps working offline.',
invite: 'If you run a service business with crews in the field, I\'d like to hear how you keep track of jobs today. Real workflows make this better.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Cloudflare Workers', 'Cloudflare D1', 'Clerk', 'PWA'],
highlights: [
'Jobs on a kanban board, from first quote to paid invoice',
'Quotes and invoices as share links and PDFs, with deposits and discounts',
'Clients, team, schedule, materials, and inventory in the same app',
'Installable, works offline, and syncs through Cloudflare Workers + D1',
],
image: '/images/fieldkit-preview-v10.png',
tags: ['Field Service', 'Operations', 'Web App'],
liveUrl: 'https://www.get-fieldkit.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #083344 0%, #0f172a 50%, #042f2e 100%)',
accent: '#22d3ee',
pattern: 'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)',
patternSize: '18px 18px',
},
},
{
id: 'cookbookverse',
icon: 'book',
title: 'CookBookVerse',
description: "A curated world of recipes built for discovery. Tell it what's in your kitchen and it tells you what to cook.",
longDescription: 'CookBookVerse is a discovery-first recipe platform: a curated library you wander through like a good food market, not a search box or a social feed. Keep a running list of what you have at home and it matches that against the library, so dinner stops being a guessing game. An AI assistant and a grocery list are built in, on top of a Postgres-backed recipe store.',
invite: 'Home cooks, recipe writers, food people: tell me what would get you to open this at dinnertime.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Neon Postgres', 'Drizzle ORM', 'OpenAI', 'Clerk'],
highlights: [
'Kitchen list that matches what you have at home against the recipe library',
'Ask AI: an assistant for finding the right recipe, powered by OpenAI',
'A curated library made for browsing, with a grocery list built in',
],
image: '',
tags: ['Recipes', 'Food Tech', 'Web Platform'],
liveUrl: 'https://www.cookbookverse.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #1c0a00 100%)',
accent: '#fb923c',
pattern: 'repeating-linear-gradient(45deg, rgba(251,146,60,0.05) 0, rgba(251,146,60,0.05) 1px, transparent 0, transparent 12px)',
patternSize: '14px 14px',
},
},
{
id: 'davapalooza',
icon: 'ticket',
title: 'Davapalooza',
description: 'An event site built for a moment, not a browsing session. Loud colors, and the what, when, and where right up front.',
longDescription: 'Davapalooza is the site for the South O Block Party, a free community block party in Oceanside, California. It puts the what, when, and where up front with a live countdown, then gives the neighborhood a place to see the lineup, read the news, and submit their own photos to a shared gallery. Submitted photos are screened with AI and then approved from an admin dashboard, and the whole thing runs on Cloudflare.',
invite: 'Got an event that deserves better than a template? This is the kind of site I like building.',
role: 'Solo design & build',
stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Cloudflare Workers', 'Cloudflare D1', 'OpenAI'],
highlights: [
'Event-first layout: date, place, and a countdown above the fold',
'Community photo gallery with AI-assisted moderation',
'Artist lineup, news, and an admin dashboard to run it all',
],
image: '',
tags: ['Events', 'Community', 'Web'],
liveUrl: 'https://davapalooza.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #1d0633 0%, #581c87 48%, #19092b 100%)',
accent: '#f0abfc',
pattern: 'radial-gradient(circle, rgba(240,171,252,0.08) 1px, transparent 1px)',
patternSize: '24px 24px',
},
},
{
id: 'trvlplay',
icon: 'dice',
title: 'TRVLPlay',
description: 'Thinking games for killing time on the road. Four quick games about sorting and spotting patterns, with daily puzzles, friends, and coins to earn.',
longDescription: 'TRVLPlay is a lightweight collection of thinking games for people killing time while traveling or waiting. Four games are live: Sort (group 16 items into 4 categories), Impostor (spot the item that does not belong), Pairs, and Blitz, with daily puzzles to come back for. Around them sit a shared profile, friend codes, and coins you earn by playing. It installs like an app, is built to go easy on a low battery, and lets you play as a guest before you sign in.',
invite: "Puzzle makers and game designers: the puzzles here are hand-curated, and there are more games to build. If you'd like to make one, let's talk.",
role: 'Solo build',
stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Clerk', 'PWA'],
highlights: [
'Four games so far: Sort, Impostor, Pairs, and Blitz, with daily puzzles',
'Profiles, friend codes, and an earn-only coin economy',
'Installable PWA with guest play, no account needed to try it',
],
image: '',
tags: ['Games', 'Puzzles', 'PWA'],
liveUrl: 'https://trvlplay.com',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #082f49 0%, #155e75 45%, #0f172a 100%)',
accent: '#67e8f9',
pattern: 'linear-gradient(rgba(103,232,249,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.06) 1px, transparent 1px)',
patternSize: '22px 22px',
},
},
{
id: 'scramble',
icon: 'egg',
title: 'Scramble',
description: 'A side-scrolling platformer starring an egg. Tight jumps, enemies to stomp, and star ratings to chase, right in the browser.',
longDescription: 'Scramble is a side-scrolling platformer in the spirit of the classics, with an egg as the hero: expressive eyes, squash and stretch, and a lot of charm for something drawn entirely in code. It is built with Phaser and Vite, plays in landscape on a phone with an on-screen gamepad or on a keyboard at a desk, and saves your progress in the browser with no account.',
invite: "Level designers and game artists: I'd like a second brain on levels, enemies, and what makes a run worth replaying.",
role: 'Solo build',
stack: ['Phaser', 'Vite', 'JavaScript'],
highlights: [
'Platforming built around feel: variable jumps, a dash, and three enemy types',
'Star ratings, best times, and a level select',
'Sound effects and music synthesized in code, with no audio files',
],
image: '',
tags: ['Game Dev', 'Browser Game', 'Phaser'],
liveUrl: 'https://scramble-chrisoc.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #1e1b4b 100%)',
accent: '#c084fc',
pattern: 'linear-gradient(rgba(192,132,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.06) 1px, transparent 1px)',
patternSize: '16px 16px',
},
},
{
id: 'wx',
icon: 'weather',
title: 'WX',
description: 'Weather, minus the clutter. What it is doing now and what is about to change, at a glance.',
longDescription: 'WX strips a weather app down to what you actually check it for — current conditions and what is about to change — presented in a dense, dashboard-style layout instead of a scroll of marketing widgets.',
invite: 'Weather nerds: tell me what you check first, and what every other weather app gets wrong.',
role: 'Solo build',
stack: ['React', 'Vite', 'TypeScript', 'Tailwind CSS'],
highlights: [
'Dense, at-a-glance dashboard layout',
'Focused on fast-moving local conditions',
'No clutter — just the numbers that matter',
],
image: '/images/wx-preview-v6.png',
tags: ['Weather', 'Dashboard', 'Web App'],
liveUrl: 'https://wx-chrisoc.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #172554 0%, #1d4ed8 45%, #0f172a 100%)',
accent: '#93c5fd',
pattern: 'repeating-linear-gradient(0deg, rgba(147,197,253,0.05) 0, rgba(147,197,253,0.05) 1px, transparent 0, transparent 10px)',
patternSize: '18px 18px',
},
},
{
id: 'hang',
icon: 'qr',
title: 'Hang',
description: 'Turns any group of phones into a game night. Scan a QR code, join the room, and the whole table is playing.',
longDescription: 'Hang is a browser-based multiplayer game platform for bars and nights out: no app to download, no TV, no setup. One person creates a room and shares a QR code or link, and everyone joins from their own phone. A room stays live all night across games, and venues can set up their own bar room for guests. Would You Rather is playable now, with word games in progress.',
invite: 'Run a bar, a trivia night, or a game night? I\'d like to see this played by a real crowd.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
highlights: [
'Join a room by QR code or link, with no app download',
'Play stays in sync across every phone through Supabase',
'Group rooms for friends, and bar rooms that a venue sets up',
],
image: '/images/hang-preview-v9.png',
tags: ['Party Games', 'Multiplayer', 'Browser'],
liveUrl: 'https://hang-chrisoc.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 48%, #0f172a 100%)',
accent: '#fcd34d',
pattern: 'repeating-linear-gradient(45deg, rgba(252,211,77,0.05) 0, rgba(252,211,77,0.05) 1px, transparent 0, transparent 12px)',
patternSize: '20px 20px',
},
},
{
id: 'standalone',
icon: 'cube',
title: 'Standalone',
description: 'A pile of one-off fabrication scripts turning into one tool: laser-cut boxes, 3D-print enclosures, and CNC feeds and speeds.',
longDescription: 'Standalone is a maker-focused toolkit that turns precise material specs into fabrication-ready output — kerf-compensated SVGs for laser-cut jointed boxes and cylinders, parametric STL enclosures for 3D printing, and chip-thinning-compensated feeds-and-speeds for CNC work. It consolidates several one-off fabrication scripts into a single account-based tool, with dimensions driven by actual material thickness instead of guesswork.',
invite: 'Makers with a laser, a 3D printer, or a CNC: run it on a real job and tell me where the numbers are off.',
role: 'Solo build',
stack: ['Next.js', 'React', 'TypeScript'],
highlights: [
'Multi-joint laser box/cylinder generator with kerf compensation',
'Parametric 3D-print enclosure and spacer generator (STL export)',
'CNC feeds-and-speeds calculator with chip-thinning compensation',
'One account spanning laser, print, and CNC workflows',
],
image: '',
tags: ['Maker Tools', 'Parametric Design', 'Fabrication'],
liveUrl: 'https://standalone-chrisoc.vercel.app/',
liveNote: 'Live and generating files. Like any cut file, run a test piece before you commit the good material.',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #1c1917 0%, #3f3f46 48%, #09090b 100%)',
accent: '#a3e635',
pattern: 'linear-gradient(rgba(163,230,53,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(163,230,53,0.06) 1px, transparent 1px)',
patternSize: '16px 16px',
},
},
{
id: 'ping',
icon: 'chat',
title: 'Ping',
description: 'Somewhere to vent or think out loud. A smart-mouthed AI companion, with no therapy vibes.',
longDescription: 'Ping is a lightweight AI companion built for the moments you just need to vent, think out loud, or get a quick reality check — not a therapy replacement, just a smart, slightly irreverent conversation partner that is always available.',
invite: 'Writers and conversation designers: the personality is the product here. If you have opinions about voice, let\'s talk.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'OpenAI', 'Tailwind CSS'],
highlights: [
'Quick, low-friction conversational check-ins',
'OpenAI-powered responses with a distinct personality',
'Built as a lightweight alternative to heavier wellness apps',
],
image: '',
tags: ['AI', 'Wellness', 'Web App'],
liveUrl: 'https://ping-liard.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #4c0519 0%, #7f1d1d 50%, #1c0a0a 100%)',
accent: '#fb7185',
pattern: 'radial-gradient(circle, rgba(251,113,133,0.08) 1px, transparent 1px)',
patternSize: '20px 20px',
},
},
{
id: 'splitnote',
icon: 'receipt',
title: 'SplitNote',
description: 'Splitting the bill at dinner without the flashy finance-app energy. Just the math.',
longDescription: 'SplitNote is a clean, no-frills bill-splitting and tip calculator — built to feel like a normal utility app rather than a flashy finance tool, for quick math at dinner without extra noise.',
invite: 'This one is small on purpose. If you have a sharp idea for where a no-nonsense money tool goes next, I\'m listening.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
highlights: [
'Even-split and custom-split bill calculations',
'Tip calculator built into the same flow',
'Deliberately plain, utility-app design',
],
image: '',
tags: ['Utility', 'Finance', 'Web App'],
liveUrl: 'https://fiscioapp.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #022c22 0%, #065f46 50%, #010f0c 100%)',
accent: '#34d399',
pattern: 'linear-gradient(rgba(52,211,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.06) 1px, transparent 1px)',
patternSize: '18px 18px',
},
},
{
id: 'games-collection',
icon: 'grid',
title: 'Games Collection',
description: 'A growing shelf of browser games: Connections, Sudoku, Word Search, and more. No installs, no accounts.',
longDescription: 'Games Collection bundles a handful of browser games under one roof. It started with a Connections-style puzzle (group four sets of four related words, across 50 levels with a high-score board) and has grown to include Sudoku, Word Search, a sliding-tile puzzle, and a rebuild-civilization game called RECLAIMED. Browser-based, no installs, no accounts.',
invite: 'Puzzle makers: the shelf is built. Bring the next game.',
role: 'Solo build',
stack: ['Express', 'JavaScript'],
highlights: [
'Five games so far, from Connections to Sudoku',
'Connections has 50 levels, a lives system, and a high-score board',
'Simple, server-rendered browser experience',
],
image: '',
tags: ['Games', 'Puzzles', 'Browser'],
liveUrl: 'https://connections-chrisoc.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1c0a00 100%)',
accent: '#fbbf24',
pattern: 'repeating-linear-gradient(45deg, rgba(251,191,36,0.05) 0, rgba(251,191,36,0.05) 1px, transparent 0, transparent 12px)',
patternSize: '18px 18px',
},
},
{
id: 'burrow',
icon: 'globe',
title: 'Burrow',
description: 'For people who tour with events for a living. Jobs, travel, and messages in one place instead of a dozen apps.',
longDescription: 'Burrow helps touring event professionals manage job trips, travel logistics, and communications without juggling a dozen disconnected tools. It renders travel routes on an interactive 3D globe and can generate PDF itineraries and QR codes for quick sharing on-site.',
invite: 'If you tour with events for a living, tell me what your week actually looks like. That is who this is for.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Three.js', 'OpenAI', 'React PDF'],
highlights: [
'Interactive 3D globe for visualizing job trips and travel routes',
'PDF itinerary generation and QR-code sharing',
'AI-assisted trip and communication support via OpenAI',
],
image: '',
tags: ['Events', 'Travel', 'Productivity'],
liveUrl: 'https://git-chrisoc.vercel.app/',
liveNote: 'Private team tool: the live link opens a team sign-in.',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0a0f1a 100%)',
accent: '#38bdf8',
pattern: 'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
patternSize: '20px 20px',
},
},
{
id: 'wanderlog',
icon: 'map',
title: 'Wanderlog',
description: 'A travel blog built for two people: one writing from the road, one keeping it running. Drag-and-drop instead of CMS forms.',
longDescription: 'Wanderlog is a reusable travel blog platform built for two people — the developer who builds and maintains it, and the blogger who writes and publishes from anywhere in the world — with a visual, drag-and-drop canvas editor instead of a traditional CMS form.',
invite: 'Travel bloggers who are tired of fighting a CMS: this was built for a writer and a developer working as a pair. If that sounds like you, say hi.',
role: 'Solo build',
stack: ['Next.js', 'TypeScript', 'Zustand', 'Tailwind CSS'],
highlights: [
'Visual canvas editor instead of a traditional CMS form',
'Built as a reusable platform for a writer + developer pair',
'Mobile-first, PWA-style travel blogging experience',
],
image: '',
tags: ['Travel', 'Blogging', 'PWA'],
liveUrl: 'https://wanderlog-nine.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #042f2e 0%, #115e59 50%, #0a0f0f 100%)',
accent: '#5eead4',
pattern: 'radial-gradient(circle, rgba(94,234,212,0.08) 1px, transparent 1px)',
patternSize: '20px 20px',
},
},
{
id: 'ctrii',
icon: 'prompt',
title: 'ctrII',
description: 'A new-tab page that works like a command center. Ask it things, keep your links, and capture your thoughts.',
longDescription: "ctrII replaces the browser's new tab with a bare command center: a clock and weather, an AI ask bar, folders of your own links, and a capture stream for notes, checklists, and reminders. It ships empty on purpose, with no opinions about who is using it. Right now it runs as a full demo saved to your browser; accounts and syncing across devices are the next step.",
invite: 'People who live in their browser: tell me what your new tab should do the moment you open it.',
role: 'Solo build',
stack: ['React', 'Vite', 'Tiptap', 'Clerk', 'Tailwind CSS'],
highlights: [
'Ask bar, link folders, and a capture stream on one page',
'A full working demo with no sign-in wall',
'Widgets that track any number from a public JSON endpoint',
],
image: '',
tags: ['Productivity', 'New Tab', 'Web App'],
liveUrl: 'https://ctrii.vercel.app/',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0a0f1a 100%)',
accent: '#94a3b8',
pattern: 'linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)',
patternSize: '18px 18px',
},
},
];

export const starterProjectTemplate: Project = {
id: 'your-project-id',
title: 'Your Project Name',
description: 'A short description of what this project does and why it matters.',
longDescription: 'A longer, 2-3 sentence case-study style description: what problem it solves, who it is for, and what makes it worth a look.',
role: 'Solo build',
stack: ['Astro', 'TypeScript'],
highlights: ['A key feature or decision worth calling out', 'Another highlight'],
image: '',
tags: ['Astro', 'TypeScript'],
previewStyle: 'browser',
liveUrl: 'https://example.com',
githubUrl: 'https://github.com/your-org/your-repo',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #111827 0%, #0f172a 50%, #020617 100%)',
accent: '#38bdf8',
pattern: 'radial-gradient(circle, rgba(56,189,248,0.08) 1px, transparent 1px)',
patternSize: '22px 22px',
},
collaborators: [],
};

/** A project's own domain, or null when it only lives on a *.vercel.app address. */
export function customDomain(project: Pick<Project, 'liveUrl'>): string | null {
if (!project.liveUrl) return null;
const host = new URL(project.liveUrl).hostname.replace(/^www\./, '');
return host.endsWith('.vercel.app') ? null : host;
}

/** Where a project lives, as a short label: its domain, or "Live preview" for vercel.app addresses. */
export function liveLabel(project: Pick<Project, 'liveUrl'>): string | null {
if (!project.liveUrl) return null;
return customDomain(project) ?? 'Live preview';
}

export const shippedProjects = projects.filter(project => !project.wip);
export const inProgressProjects = projects.filter(project => project.wip);
