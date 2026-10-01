import { projects } from './projects';

/**
 * Everything on /about that is "about Chris" lives here, so the page can grow
 * like a resume: edit this file (and projects.ts) and the page follows.
 *
 * Voice: see VOICE.md. Short version: smart-ass, warm, laughing at himself first,
 * and the facts stay straight.
 */

export const profile = {
	name: 'Chris',
	/** Shown as the name on /resume when set (for example a full name); otherwise `name` is used. */
	fullName: '',
	role: 'Founder · Developer · Photographer',
	photo: '/images/compressed-Chris.jpg',
	headline: "I'm Chris. I build things until they work.",
	hook: "Photographer turned developer, laser engraver by day, and currently the entire staff of this studio. I ship real products, and I'm looking for people to build the next ones with.",
	bio: [
		"I started with a camera. Building my own photography site pulled me into code, and I never really came back out. Since then it's been a recipe platform, software for service businesses, a weather app, and a platformer about an egg. Whatever idea wouldn't leave me alone.",
		"Probably Fine Studios is the name on all of it. Yes, I named the studio after my quality-assurance process. Nothing here claims to be perfect. It ships, it works, and it's probably fine.",
		'It started as just me, mostly because nobody was around to say "maybe don\'t." It was never supposed to stay that way. I\'m growing this into a real studio, and that takes people who aren\'t me.',
	],
	/** Shown as the status pill on the homepage and in the footer. Set open to false to hide the pill. */
	availability: {
		open: true,
		label: 'Looking for collaborators and partners. Yes, you.',
		note: 'Started solo, looking to grow. Open to collaborators, business partners, eager learners, and the occasional weirdly specific project.',
	},
	githubSince: 2023,
	publicRepos: '45+',
	links: {
		github: 'https://github.com/Chrisocal21',
		linkedin: 'https://www.linkedin.com/in/chrisocphoto',
		instagram: 'https://www.instagram.com/chrisocphoto',
		photography: 'https://www.chrisocphoto.com',
	},
};

/** How I work — short, scannable, first person. */
export const principles = [
	{
		title: 'Ship it, then fix it',
		body: 'A rough version in someone\'s hands beats a perfect plan in my head. I get to "working" fast and improve from real use.',
	},
	{
		title: 'AI is a co-worker, not a party trick',
		body: "AI does the heavy lifting on implementation. I do the part where someone has to decide what to build and whether it's any good.",
	},
	{
		title: 'Always learning in public',
		body: "Every project here taught me something I didn't know when I started it. The skills list below grows because the work does.",
	},
	{
		title: 'The jokes are free. The work is not a joke.',
		body: "I'm a smart-ass, and I'm told it's lovable. The work still gets taken seriously: real deadlines, straight answers, no surprises.",
	},
];

/** "The fine print": true things, told the way Chris would tell them. Swap in your own any time. */
export const finePrint = [
	'My commit messages are version numbers. 0.11, 0.12. Future me loves a mystery.',
	`I have ${profile.publicRepos} repos. I can tell you what most of them do.`,
	'I built a platformer about an egg. The egg has feelings. This felt important.',
	'I named a file-transfer app Not A Cable, because that is what it is.',
	'I engrave things with lasers for a living, then come home and write software. Sleep is on the roadmap.',
	'I am the technical director of a block party. Yes, that is a real title.',
	'My planning team is called The Forge. It is six points of view living in a Claude Project, and its whole job is to argue with me before I write any code.',
	'The studio name is also the quality-assurance policy.',
];

/** What I look for in the people I work with. */
export const lookFor = [
	{
		title: 'Finishers',
		body: 'Ideas are cheap. I get along best with people who would rather ship a rough version than polish a pitch.',
	},
	{
		title: "Honest about what they don't know",
		body: 'The studio is called Probably Fine for a reason. Say "I\'m not sure" early and we\'ll figure it out together.',
	},
	{
		title: 'Curious outside their lane',
		body: 'I came to code from photography, by way of a laser engraver. I like people who wander between disciplines and bring something back.',
	},
	{
		title: 'Low ego, high standards',
		body: 'Care a lot about the work, not about who gets the credit for it.',
	},
	{
		title: 'Hungry to learn',
		body: "Experience is optional. Wanting it is not. I'll take an eager beginner over a bored expert every time.",
	},
	{
		title: 'A sense of humor',
		body: "Non-negotiable. We are going to break things. It helps if that's funny.",
	},
];

/**
 * The open call for people who are still breaking in. Shown under the "who should get in touch"
 * cards on the homepage and /about. The Forge is Chris's planning setup: every project gets a
 * brief, a feature map, and a progress tracker before the build starts.
 */
export const helpWanted = {
	id: 'learn',
	label: 'Eager learners',
	accent: '#6ee7b7',
	title: 'Trying to break in? Come learn the way of The Forge.',
	body: "You don't need a resume to get in here. I'm looking for eager learners who are trying to break through and would rather learn by building something real. The Forge is how projects get planned in this studio before any code exists: brief it, map it, argue with it, then build it with AI. I'll show you how it works. Or skip the lesson and lend a hand wherever you're dangerous.",
	waysLabel: 'Hands wanted for',
	ways: ['Code', 'The business side', 'Marketing', 'Testing (breaking my stuff on purpose)', "Whatever you're weirdly good at"],
	cta: 'Raise your hand',
};

/** The Adobe scripting sideline, shown on the homepage. Examples are real scripts in daily use. */
export const scripting = {
	eyebrow: 'Also on the menu',
	title: 'I make Illustrator and Photoshop do the boring part',
	body: "My day job is laser engraving, which means a lot of Illustrator, a lot of Photoshop, and the same twelve clicks over and over. So I write scripts that do the clicks. If your team has a repetitive Adobe job, I can probably make it one button.",
	examples: [
		{
			app: 'Illustrator',
			title: 'Logo placer',
			body: 'Pick a logo and a layout, and it fills a whole engraving sheet: sized, spaced, centered, and mirrored when the job calls for it.',
		},
		{
			app: 'Photoshop',
			title: 'Photo to engrave-ready',
			body: 'Cuts out the subject, crops it to shape, sizes it at 600 DPI, and tunes the contrast for the material. One dialog in, one file out.',
		},
		{
			app: 'Yours',
			title: 'The thing you do by hand every day',
			body: "Describe the clicks. That's usually all I need to tell you whether a script can take them off your plate.",
		},
	],
	cta: 'Ask about a script',
};

/** Who should get in touch, and what each side brings. */
export const openTo = [
	{
		id: 'collaboration',
		label: 'Collaborators',
		accent: '#a5b4fc',
		pitch: "Designers, developers, writers, photographers, people with one oddly specific skill: if you want to make something small and real together, I'm in.",
		youBring: "A craft you're good at and an itch to build.",
		iBring: 'A working product, fast, and the patience to finish it.',
		cta: 'Pitch a collaboration',
	},
	{
		id: 'partnership',
		label: 'Business partners',
		accent: '#f0abfc',
		pitch: 'You know a market, an industry, or a problem from the inside. I can turn that into software people actually use.',
		youBring: 'Domain knowledge, an audience, or the business brain.',
		iBring: 'Design, build, and launch, start to finish.',
		cta: 'Talk partnership',
	},
	{
		id: 'project',
		label: 'Clients & everyone else',
		accent: '#fcd34d',
		pitch: 'Got a project, a product, or a weirdly specific idea that needs building? Or just want to compare notes? Say hi.',
		youBring: 'The idea, however half-baked.',
		iBring: 'A straight answer on whether I can build it. (Usually: probably.)',
		cta: 'Start a conversation',
	},
];

export const timeline = [
	{
		title: 'ChrisOCPhoto',
		tag: 'The original',
		accent: '#d6d3d1',
		body: "It started with photography. I built my own portfolio from scratch because nothing else felt right for the work. It's still running, still home base.",
	},
	{
		title: 'ChrisOCDigital',
		tag: 'Where the code started',
		accent: '#e879f9',
		body: 'Building a better photo site turned into tools, scripts, and experiments. The dev side took hold and a body of work started taking shape.',
	},
	{
		title: 'Probably Fine Studios',
		tag: 'Now',
		accent: '#8b5cf6',
		body: 'When the projects needed a proper home, this became it: one studio name for everything I build, with AI in the loop and real products out the other end. Next up: more people.',
	},
];

export interface ResumeEntry {
	title: string;
	org: string;
	url?: string;
	/** e.g. "October 2023 to present" */
	period: string;
	/** Plain resume language, shown on /resume. */
	points?: string[];
	/** The same job the way Chris would say it out loud, shown on /about. */
	aside?: string;
}

/**
 * Work history and education. Add jobs, courses, or certifications here as life
 * goes on; an empty list hides its section on /resume and /about.
 */
export const experience: ResumeEntry[] = [
	{
		title: 'Production Manager, On-site Travel Manager, Senior Engraver',
		org: 'Swanky Badger',
		url: 'https://www.swankybadger.com',
		period: 'October 2023 to present',
		points: [
			'Manage in-house production of custom laser-engraved gifts and work as senior engraver',
			'Lead on-site engraving jobs at events, including the travel and logistics for each one',
			'Also cover warehouse, logistics, R&D, and software development',
		],
		aside: 'Officially: production manager, on-site travel manager, senior engraver. Also: logistics, warehouse, R&D, and developer. I am told this is called wearing many hats. I call it Tuesday.',
	},
	{
		title: 'Technical Director',
		org: 'Davapalooza (South O Block Party)',
		url: 'https://davapalooza.com',
		period: 'July 2023 to present',
		points: ['Run the technical side of a free community block party in Oceanside, California, including the event website and its community photo gallery'],
		aside: 'A free community block party in Oceanside, California. I run the technical side, including the website in the project list.',
	},
];
export const education: ResumeEntry[] = [];

/** Skills that don't show up in a project's tech stack. */
export const beyondCode = [
	'Photography',
	'Laser engraving',
	'Production management',
	'Event logistics',
	'Adobe Photoshop',
	'Adobe Illustrator',
	'Illustrator and Photoshop scripting',
	'Figma',
	'Product design',
	'AI-assisted development',
];

const skillGroups: Record<string, string[]> = {
	'Languages & frameworks': ['TypeScript', 'JavaScript', 'Next.js', 'React', 'Astro', 'Vite', 'Tailwind CSS', 'Express', 'Electron', 'Zustand', 'PWA'],
	'Data & infrastructure': ['Cloudflare Workers', 'Cloudflare D1', 'Neon Postgres', 'Drizzle ORM', 'Supabase', 'AWS S3', 'Clerk'],
	'AI': ['OpenAI'],
	'Maps, graphics & games': ['Mapbox GL', 'Three.js', 'Phaser', 'React PDF', 'Tiptap'],
};

export interface Skill {
	name: string;
	/** number of projects in projects.ts that use it */
	count: number;
	/** true when it has only been used in in-progress projects so far */
	learning: boolean;
}

/**
 * The skills section is derived from the real tech stacks in projects.ts, so
 * adding a project automatically updates the resume. Anything not listed in
 * skillGroups above lands in "Also used".
 */
export function getSkills(): { group: string; skills: Skill[] }[] {
	const usage = new Map<string, { count: number; shipped: number }>();
	for (const project of projects) {
		for (const tech of project.stack ?? []) {
			const entry = usage.get(tech) ?? { count: 0, shipped: 0 };
			entry.count += 1;
			if (!project.wip) entry.shipped += 1;
			usage.set(tech, entry);
		}
	}

	const toSkills = (names: string[]): Skill[] =>
		names
			.filter(name => usage.has(name))
			.map(name => ({ name, count: usage.get(name)!.count, learning: usage.get(name)!.shipped === 0 }))
			.sort((a, b) => b.count - a.count);

	const grouped = new Set(Object.values(skillGroups).flat());
	const ungrouped = [...usage.keys()].filter(name => !grouped.has(name));

	return [
		...Object.entries(skillGroups).map(([group, names]) => ({ group, skills: toSkills(names) })),
		{ group: 'Also used', skills: toSkills(ungrouped) },
	].filter(g => g.skills.length > 0);
}
