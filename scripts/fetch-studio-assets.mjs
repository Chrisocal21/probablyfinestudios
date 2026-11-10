// Downloads the props and surface textures for /studio from Poly Haven (all CC0) and shrinks them for the web.
//
//   npm run studio-assets
//
// Models land in public/studio/models/<id>/, surface textures in public/studio/textures/<id>/.
// Textures are resized and re-encoded with sharp; the glTF files keep pointing at the same names.
// Already-downloaded assets are skipped, so delete a folder to fetch it again.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = 'public/studio';
const API = 'https://api.polyhaven.com/files';

/** Props, with the longest texture edge they get after shrinking. */
const models = {
	desk_lamp_arm_01: 512,
	potted_plant_02: 512,
	rubber_duck_toy: 256,
	garden_gnome: 512,
	bench_vice_01: 512,
	metal_toolbox: 512,
	measuring_tape_01: 256,
	cross_pein_hammer: 256,
	dartboard: 512,
	wall_clock: 512,
	boombox: 512,
	cardboard_box_01: 512,
	WetFloorSign_01: 512,
	gamepad: 256,
	mid_century_lounge_chair: 512,
};

/** Room surfaces: colour, normal, roughness. */
const textures = {
	wood_floor_worn: 1024,
	painted_plaster_wall: 1024,
	fabric_pattern_07: 1024,
	wood_table_001: 1024,
	plywood: 512,
};

const json = async url => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return response.json();
};
const bytes = async url => {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`${response.status} for ${url}`);
	return Buffer.from(await response.arrayBuffer());
};
const shrink = (buffer, size, quality = 82) => sharp(buffer).resize(size, size, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality, mozjpeg: true }).toBuffer();

let total = 0;
const save = (file, buffer) => {
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, buffer);
	total += buffer.length;
};

for (const [id, size] of Object.entries(models)) {
	const dir = path.join(OUT, 'models', id);
	if (existsSync(path.join(dir, `${id}.gltf`))) {
		console.log(`skip      ${id}`);
		continue;
	}
	try {
		const files = await json(`${API}/${id}`);
		const gltf = files.gltf['1k'].gltf;
		save(path.join(dir, `${id}.gltf`), await bytes(gltf.url));
		for (const [name, info] of Object.entries(gltf.include)) {
			// Keep only plain relative paths inside this model's folder.
			if (name.includes('..') || path.isAbsolute(name)) throw new Error(`unexpected file name ${name}`);
			const data = await bytes(info.url);
			save(path.join(dir, name), /\.(jpe?g|png)$/i.test(name) ? await shrink(data, size) : data);
		}
		console.log(`model     ${id}`);
	} catch (error) {
		console.error(`FAILED    ${id}: ${error.message}`);
	}
}

for (const [id, size] of Object.entries(textures)) {
	const dir = path.join(OUT, 'textures', id);
	if (existsSync(path.join(dir, 'diff.jpg'))) {
		console.log(`skip      ${id}`);
		continue;
	}
	try {
		const files = await json(`${API}/${id}`);
		const maps = { diff: files.Diffuse, nor: files.nor_gl, rough: files.Rough };
		for (const [name, map] of Object.entries(maps)) {
			if (!map) continue;
			save(path.join(dir, `${name}.jpg`), await shrink(await bytes(map['1k'].jpg.url), size, name === 'diff' ? 84 : 78));
		}
		console.log(`texture   ${id}`);
	} catch (error) {
		console.error(`FAILED    ${id}: ${error.message}`);
	}
}

writeFileSync(
	path.join(OUT, 'CREDITS.txt'),
	`Studio props and textures from Poly Haven (https://polyhaven.com), released under CC0.\n\nModels: ${Object.keys(models).join(', ')}\nTextures: ${Object.keys(textures).join(', ')}\n`,
);
console.log(`Done. ${(total / 1024 / 1024).toFixed(1)} MB written this run.`);
