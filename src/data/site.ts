/** Site-wide facts used by the layout, nav, footer, sitemap, and social previews. */
export const site = {
	name: 'Probably Fine Studios',
	url: 'https://probablyfinestudios.com',
	/** The studio started as one person and is meant to grow; it is not pitched as a "solo studio". */
	tagline: 'Started solo. Not planning to stay that way.',
	description:
		'Probably Fine Studios is a product studio started by Chris, a photographer turned developer who ships web apps, tools, and games with AI in the loop. Started solo, looking to grow: collaborators and business partners welcome.',
	repo: 'https://github.com/Chrisocal21/probablyfinestudios',
	nav: [
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
