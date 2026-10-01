/**
 * Social preview cards (the image shown when a link is pasted into a message, LinkedIn, etc.).
 * Rendered at build time: one for the site, one for /about, and one per project.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { projectIcons } from '../data/icons';
import { shippedProjects, inProgressProjects, liveLabel, type Project } from '../data/projects';
import { profile } from '../data/profile';
import { site } from '../data/site';

const WIDTH = 1200;
const HEIGHT = 630;

type Child = Node | string | null | false | undefined;
interface Node {
	type: string;
	props: Record<string, unknown>;
}

const fromRoot = (relative: string) => readFile(path.join(process.cwd(), relative));
const dataUri = (buffer: Buffer, mime: string) => `data:${mime};base64,${buffer.toString('base64')}`;

/** A flex container; satori requires an explicit display on any element with several children. */
function box(style: Record<string, unknown>, ...children: Child[]): Node {
	return { type: 'div', props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) } };
}

function image(src: string, width: number, height: number, style: Record<string, unknown> = {}): Node {
	return { type: 'img', props: { src, width, height, style } };
}

/** "#22d3ee" + 0.2 -> "rgba(34, 211, 238, 0.2)" */
function alpha(hex: string, opacity: number): string {
	const value = hex.replace('#', '');
	const [r, g, b] = [0, 2, 4].map(start => parseInt(value.slice(start, start + 2), 16));
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

let assets: Promise<{ fonts: { name: string; weight: 400 | 600 | 700 | 800; style: 'normal'; data: Buffer }[]; logo: string; portrait: string }> | undefined;

function loadAssets() {
	assets ??= (async () => {
		const font = async (name: string, weight: 400 | 600 | 700 | 800, file: string) => ({
			name,
			weight,
			style: 'normal' as const,
			data: await fromRoot(`node_modules/@fontsource/${file}`),
		});
		const [fonts, logo, portrait] = await Promise.all([
			Promise.all([
				font('Inter', 400, 'inter/files/inter-latin-400-normal.woff'),
				font('Inter', 600, 'inter/files/inter-latin-600-normal.woff'),
				font('Sora', 700, 'sora/files/sora-latin-700-normal.woff'),
				font('Sora', 800, 'sora/files/sora-latin-800-normal.woff'),
			]),
			sharp(path.join(process.cwd(), 'public/logo-mark.png')).resize({ width: 600 }).png().toBuffer(),
			sharp(path.join(process.cwd(), 'src/assets/chris.jpg')).resize(680, 850, { fit: 'cover', position: 'top' }).jpeg({ quality: 88 }).toBuffer(),
		]);
		return { fonts, logo: dataUri(logo, 'image/png'), portrait: dataUri(portrait, 'image/jpeg') };
	})();
	return assets;
}

async function render(node: Node): Promise<Buffer> {
	const { fonts } = await loadAssets();
	const svg = await satori(node as never, { width: WIDTH, height: HEIGHT, fonts });
	return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

const LOGO_RATIO = 793 / 259;
const logoImage = (src: string, height: number) => image(src, Math.round(height * LOGO_RATIO), height);

function pill(label: string, color = '#e4e4e7', dot?: string): Node {
	return box(
		{
			alignItems: 'center',
			gap: 12,
			fontSize: 24,
			color,
			border: '2px solid rgba(255, 255, 255, 0.18)',
			backgroundColor: 'rgba(255, 255, 255, 0.06)',
			borderRadius: 999,
			padding: '10px 24px',
		},
		dot ? box({ width: 14, height: 14, borderRadius: 999, backgroundColor: dot }) : null,
		label,
	);
}

export async function renderSiteCard(): Promise<Buffer> {
	const { logo } = await loadAssets();
	return render(
		box(
			{ width: WIDTH, height: HEIGHT, position: 'relative', backgroundColor: '#000000', fontFamily: 'Inter', color: '#ffffff' },
			box({
				position: 'absolute',
				top: 0,
				left: 0,
				width: WIDTH,
				height: HEIGHT,
				backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(99, 59, 200, 0.5) 0%, rgba(0, 0, 0, 0) 70%)',
			}),
			box(
				{ position: 'relative', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: WIDTH, height: HEIGHT, padding: 64 },
				logoImage(logo, 92),
				box({ fontFamily: 'Sora', fontWeight: 800, fontSize: 78, letterSpacing: -2.5, marginTop: 40 }, site.name),
				box({ fontSize: 34, color: '#e4e4e7', marginTop: 18 }, site.tagline),
				box(
					{ gap: 16, marginTop: 48 },
					pill(`${shippedProjects.length} shipped`),
					pill(`${inProgressProjects.length} in the works`),
					profile.availability.open ? pill('Looking for collaborators', '#ffffff', '#34d399') : null,
				),
			),
		),
	);
}

export async function renderAboutCard(): Promise<Buffer> {
	const { logo, portrait } = await loadAssets();
	return render(
		box(
			{ width: WIDTH, height: HEIGHT, position: 'relative', backgroundColor: '#000000', fontFamily: 'Inter', color: '#ffffff' },
			box({
				position: 'absolute',
				top: 0,
				left: 0,
				width: WIDTH,
				height: HEIGHT,
				backgroundImage: 'radial-gradient(ellipse 60% 70% at 75% 40%, rgba(99, 59, 200, 0.42) 0%, rgba(0, 0, 0, 0) 70%)',
			}),
			box(
				{ position: 'relative', alignItems: 'center', width: WIDTH, height: HEIGHT, padding: '60px 64px', gap: 60 },
				image(portrait, 340, 425, { borderRadius: 28, border: '2px solid #3f3f46' }),
				box(
					{ flexDirection: 'column', flex: 1 },
					box({ fontSize: 20, fontWeight: 600, letterSpacing: 5, color: '#a5b4fc', textTransform: 'uppercase' }, profile.role),
					box({ fontFamily: 'Sora', fontWeight: 800, fontSize: 60, lineHeight: 1.1, letterSpacing: -2, marginTop: 22 }, profile.headline),
					box(
						{ fontSize: 28, lineHeight: 1.4, color: '#d4d4d8', marginTop: 24 },
						'Photographer turned developer. Started this studio solo. Looking for people to grow it with.',
					),
					box(
						{ alignItems: 'center', gap: 16, marginTop: 38 },
						logoImage(logo, 30),
						box({ fontSize: 22, color: '#a1a1aa' }, `${site.url.replace('https://', '')}/about`),
					),
				),
			),
		),
	);
}

export async function renderProjectCard(project: Project): Promise<Buffer> {
	const { logo } = await loadAssets();
	const accent = project.theme?.accent ?? '#a5b4fc';
	const gradient = project.theme?.gradient ?? 'linear-gradient(135deg, #312e81, #1e1b4b)';
	const where = liveLabel(project);
	const iconMarkup = project.icon ? projectIcons[project.icon] : undefined;
	const icon = iconMarkup
		? dataUri(
				Buffer.from(
					`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="${accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconMarkup}</svg>`,
				),
				'image/svg+xml',
			)
		: null;

	return render(
		box(
			{ width: WIDTH, height: HEIGHT, position: 'relative', backgroundColor: '#000000', backgroundImage: gradient, fontFamily: 'Inter', color: '#ffffff' },
			box({
				position: 'absolute',
				top: 0,
				left: 0,
				width: WIDTH,
				height: HEIGHT,
				backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.86) 100%)',
			}),
			box(
				{ position: 'relative', flexDirection: 'column', justifyContent: 'space-between', width: WIDTH, height: HEIGHT, padding: '52px 64px 56px' },
				box(
					{ justifyContent: 'space-between', alignItems: 'center' },
					box({ alignItems: 'center', gap: 18 }, logoImage(logo, 34), box({ fontFamily: 'Sora', fontWeight: 700, fontSize: 26 }, site.name)),
					box(
						{
							fontSize: 19,
							fontWeight: 600,
							letterSpacing: 2.5,
							textTransform: 'uppercase',
							color: accent,
							border: `2px solid ${alpha(accent, 0.55)}`,
							backgroundColor: alpha(accent, 0.12),
							borderRadius: 999,
							padding: '9px 22px',
						},
						project.wip ? 'In development' : 'Shipped and live',
					),
				),
				box(
					{ flexDirection: 'column' },
					box(
						{ alignItems: 'center', gap: 30 },
						icon
							? box(
									{
										width: 116,
										height: 116,
										borderRadius: 30,
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: alpha(accent, 0.14),
										border: `2px solid ${alpha(accent, 0.5)}`,
									},
									image(icon, 62, 62),
								)
							: null,
						box(
							{ fontFamily: 'Sora', fontWeight: 800, fontSize: project.title.length > 13 ? 76 : 92, letterSpacing: -3, lineHeight: 1.05 },
							project.title,
						),
					),
					box({ fontSize: 32, lineHeight: 1.42, color: '#e4e4e7', marginTop: 30, maxWidth: 1040 }, project.description),
				),
				box(
					{ justifyContent: 'space-between', alignItems: 'center', fontSize: 21 },
					box(
						{ color: accent, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase' },
						[project.role ?? project.tags[0], where].filter(Boolean).join(' · '),
					),
					box({ color: '#a1a1aa' }, site.url.replace('https://', '')),
				),
			),
		),
	);
}
