// Regenerates the favicon and app icons in public/ from public/logo-mark.png.
// Run with: npm run icons   (only needed if the logo changes)
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const LOGO = 'public/logo-mark.png';
const BACKGROUND = '#000000';

// The "P" on its own: the letters lean right, so the cut between P and F is slanted too.
async function extractP() {
	const { data, info } = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width, height, channels } = info;
	const slant = 0.2;
	const cut = 304.5 * (width / 793);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (x + slant * (y - height / 2) >= cut) data[(y * width + x) * channels + 3] = 0;
		}
	}
	return sharp(data, { raw: { width, height, channels } }).trim().png().toBuffer();
}

/** A square icon: `glyph` centered on a dark tile, filling `fill` of the width. */
async function icon(glyph, size, { fill, rounded }) {
	const meta = await sharp(glyph).metadata();
	const scale = Math.min((size * fill) / meta.width, (size * fill) / meta.height);
	const width = Math.max(1, Math.round(meta.width * scale));
	const height = Math.max(1, Math.round(meta.height * scale));
	const resized = await sharp(glyph).resize(width, height).png().toBuffer();
	const radius = rounded ? Math.round(size * 0.22) : 0;
	const tile = Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BACKGROUND}"/></svg>`,
	);
	return sharp(tile)
		.composite([{ input: resized, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
		.png()
		.toBuffer();
}

/** Wraps a PNG in a single-image .ico container. */
function ico(png, size) {
	const header = Buffer.alloc(22);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: icon
	header.writeUInt16LE(1, 4); // image count
	header.writeUInt8(size, 6); // width
	header.writeUInt8(size, 7); // height
	header.writeUInt8(0, 8); // palette
	header.writeUInt8(0, 9); // reserved
	header.writeUInt16LE(1, 10); // color planes
	header.writeUInt16LE(32, 12); // bits per pixel
	header.writeUInt32LE(png.length, 14); // image size
	header.writeUInt32LE(22, 18); // image offset
	return Buffer.concat([header, png]);
}

const letter = await extractP();
const mark = await sharp(LOGO).trim().png().toBuffer();

// Small sizes use the single letter (three letters turn to mush at 16px); large sizes use the full mark.
const favicon48 = await icon(letter, 48, { fill: 0.66, rounded: true });
await writeFile('public/favicon.ico', ico(favicon48, 48));
await writeFile('public/favicon-32.png', await icon(letter, 32, { fill: 0.66, rounded: true }));
await writeFile('public/icon-192.png', await icon(mark, 192, { fill: 0.8, rounded: true }));
await writeFile('public/icon-512.png', await icon(mark, 512, { fill: 0.8, rounded: true }));
await writeFile('public/apple-touch-icon.png', await icon(mark, 180, { fill: 0.78, rounded: false }));

console.log('Icons written to public/: favicon.ico, favicon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png');
