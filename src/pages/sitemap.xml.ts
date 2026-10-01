import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { site } from '../data/site';

/** Public pages only: the inbox (/hub) and the redirect pages (/contact, /team) are left out on purpose. */
export const GET: APIRoute = () => {
	const today = new Date().toISOString().slice(0, 10);
	const paths = ['/', '/portfolio/', '/about/', '/resume/', '/legal/', ...projects.map(project => `/portfolio/${project.id}/`)];
	const urls = paths
		.map(path => `  <url>\n    <loc>${site.url}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
	);
};
