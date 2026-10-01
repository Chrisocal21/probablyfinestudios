import type { APIRoute, GetStaticPaths } from 'astro';
import { projects } from '../../data/projects';
import { renderAboutCard, renderProjectCard, renderSiteCard } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = () => [
	{ params: { slug: 'site' } },
	{ params: { slug: 'about' } },
	...projects.map(project => ({ params: { slug: project.id } })),
];

export const GET: APIRoute = async ({ params }) => {
	const project = projects.find(item => item.id === params.slug);
	const png = project ? await renderProjectCard(project) : params.slug === 'about' ? await renderAboutCard() : await renderSiteCard();

	return new Response(new Uint8Array(png), {
		headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
	});
};
