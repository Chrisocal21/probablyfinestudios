// Checks every link, anchor, and asset reference in the built site.
//
//   npm run check                         build, then check internal links
//   node scripts/check-links.mjs --external   also request every external URL
//
// Run `npm run build` first if you call it directly; it reads ./dist.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');
if (!existsSync(dist)) {
	console.error('No dist/ folder. Run `npm run build` first.');
	process.exit(1);
}

const pages = [];
(function walk(dir) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(full);
		else if (entry.name.endsWith('.html')) pages.push(full);
	}
})(dist);

const cache = new Map();
const read = file => {
	if (!cache.has(file)) cache.set(file, readFileSync(file, 'utf8'));
	return cache.get(file);
};

function resolveInternal(urlPath) {
	const clean = decodeURIComponent(urlPath);
	const direct = path.join(dist, clean);
	if (existsSync(direct) && statSync(direct).isFile()) return direct;
	const index = path.join(dist, clean, 'index.html');
	return existsSync(index) ? index : null;
}

const escapeForRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const problems = [];
const missingSlash = new Set();
const external = new Map();
let checked = 0;

for (const page of pages) {
	const html = read(page);
	const from = '/' + path.relative(dist, page).replace(/\\/g, '/');
	const refs = [];
	for (const match of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) refs.push(match[1]);
	for (const match of html.matchAll(/\ssrcset="([^"]*)"/g)) {
		for (const part of match[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
	}

	for (const raw of refs) {
		const ref = raw.replace(/&amp;/g, '&');
		if (!ref || /^(data:|mailto:|tel:|javascript:)/.test(ref)) continue;
		if (/^https?:\/\//.test(ref)) {
			if (!external.has(ref)) external.set(ref, from);
			continue;
		}

		checked++;
		const [beforeHash, hash] = ref.split('#');
		const urlPath = beforeHash.split('?')[0];
		let target = page;
		if (urlPath) {
			if (!urlPath.startsWith('/')) {
				problems.push(`${from}: relative link "${ref}"`);
				continue;
			}
			target = resolveInternal(urlPath);
			if (!target) {
				problems.push(`${from}: broken link "${ref}"`);
				continue;
			}
			// The live host redirects /about to /about/, so links should already have the slash.
			if (target.endsWith('index.html') && !urlPath.endsWith('/')) missingSlash.add(`${from} -> ${ref}`);
		}
		if (hash && target.endsWith('.html') && !new RegExp(`\\sid="${escapeForRegex(hash)}"`).test(read(target))) {
			problems.push(`${from}: anchor "#${hash}" not found (link "${ref}")`);
		}
	}
}

console.log(`${pages.length} pages, ${checked} internal references checked.`);
console.log(problems.length ? `PROBLEMS:\n  ${problems.join('\n  ')}` : 'No broken internal links or anchors.');
if (missingSlash.size) console.log(`Links missing a trailing slash:\n  ${[...missingSlash].join('\n  ')}`);

let externalFailures = 0;
if (process.argv.includes('--external')) {
	console.log(`\n${external.size} external URLs:`);
	for (const [url, from] of external) {
		let status;
		try {
			const response = await fetch(url, {
				redirect: 'follow',
				headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
				signal: AbortSignal.timeout(20000),
			});
			status = response.status;
		} catch (error) {
			status = `ERR ${error.message}`;
		}
		// LinkedIn answers 999 to anything that is not a logged-in browser; that is not a broken link.
		const ok = status === 200 || status === 999;
		if (!ok) externalFailures++;
		console.log(`  ${ok ? ' ' : '!'} ${String(status).padEnd(5)} ${url}   (first seen on ${from})`);
	}
}

process.exit(problems.length || externalFailures ? 1 : 0);
