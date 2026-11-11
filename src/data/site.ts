/** Site-wide facts used by the layout, nav, footer, sitemap, and social previews. */
export const site = {
	name: 'Probably Fine Studios',
	url: 'https://probablyfinestudios.com',
	/** The site presents the studio as a studio. The founder story (started solo, looking for people) lives on the about page only. */
	tagline: 'Games, apps, and tools. All of them probably fine.',
	description:
		'Probably Fine Studios is a product studio that makes games, apps and sites, and tools with AI in the loop, plus the odd laser-engraving or Adobe-scripting job.',
	repo: 'https://github.com/Chrisocal21/probablyfinestudios',
	nav: [
		{ href: '/games/', label: 'Games' },
		{ href: '/portfolio/', label: 'Projects' },
		{ href: '/about/', label: 'About' },
		{ href: '/resume/', label: 'Resume' },
	],
	contactHref: '/about/#contact',
};

/** Link to the contact form with the topic (and optionally a project) already filled in. */
export function contactLink(options: { topic?: string; project?: string } = {}): string {
	const params = new URLSearchParams();
	if (options.topic) params.set('topic', options.topic);
	if (options.project) params.set('project', options.project);
	const query = params.toString();
	return `/about/${query ? `?${query}` : ''}#contact`;
}
