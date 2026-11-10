// Captures a screenshot of each project's live site for its case-study page.
//
//   npm run screens              capture every project
//   npm run screens -- wx hang   capture only these project ids
//   npm run screens -- --clip    also record a short looping clip of each project
//
// Clips are animated WebP files in src/assets/clips/<id>.webp: silent, looping, and
// playable anywhere an image is, with no video tools to install.
//
// Images are written to src/assets/screens/<id>.webp, and the capture date to
// src/assets/screens/captured.json. A case study shows its screenshot automatically
// when the file exists. Needs Chrome or Edge installed (set CHROME_PATH to override).
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { projects } from '../src/data/projects.ts';

const WIDTH = 1280;
const HEIGHT = 800;
const OUT_DIR = 'src/assets/screens';
const MANIFEST = path.join(OUT_DIR, 'captured.json');

/**
 * Per-project capture recipes. `null` skips a project. Everything else is optional:
 *   wait   milliseconds to let the page settle after it loads (default 4500)
 *   geo    [latitude, longitude] to report when the site asks for a location
 *   steps  interactions before the screenshot: {click:[x,y]}, {clickText:'...'}, {key:'ArrowRight', hold:ms}, {wait:ms}
 *   clip   for --clip: { seconds (default 6), steps (same kinds, played while recording) }
 */
const recipes = {
	// Private team tool: the live page is only a sign-in screen.
	burrow: null,
	// Skip the sign-in screen and show the games.
	trvlplay: { steps: [{ clickText: 'Play as Guest' }, { wait: 4500 }] },
	// The game draws on a canvas: press PLAY, open level 1-1, take a few steps.
	scramble: { steps: [{ click: [650, 452] }, { wait: 2000 }, { click: [148, 387] }, { wait: 2600 }, { key: 'ArrowRight', hold: 260 }, { wait: 120 }] },
	// Get past the photosensitivity warning to the title menu.
	'zombie-siege': { steps: [{ key: 'Enter' }, { wait: 3500 }] },
	// Without a location the app only shows its welcome screen.
	wx: { geo: [32.7157, -117.1611], wait: 7000 },
};

const chromePath = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
].find(candidate => candidate && existsSync(candidate));

if (!chromePath) {
	console.error('Could not find Chrome or Edge. Set CHROME_PATH to the browser executable.');
	process.exit(1);
}

const CLIP_DIR = 'src/assets/clips';
const CLIP_WIDTH = 960;
const CLIP_FPS = 10;
const args = process.argv.slice(2);
const recordClips = args.includes('--clip');
const only = args.filter(arg => !arg.startsWith('--'));
const targets = projects.filter(project => project.liveUrl && recipes[project.id] !== null && (only.length === 0 || only.includes(project.id)));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const port = 9300 + Math.floor(Math.random() * 500);
const profileDir = mkdtempSync(path.join(tmpdir(), 'pfs-screens-'));
const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`, 'about:blank'], { stdio: 'ignore' });

async function connect() {
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
			const page = pages.find(item => item.type === 'page');
			if (page) return new WebSocket(page.webSocketDebuggerUrl);
		} catch {}
		await sleep(150);
	}
	throw new Error('The browser did not start.');
}

let failed = 0;
try {
	const socket = await connect();
	await new Promise((resolve, reject) => {
		socket.onopen = resolve;
		socket.onerror = reject;
	});

	let nextId = 1;
	const pending = new Map();
	const waiters = new Map();
	let onFrame = null;
	socket.onmessage = event => {
		const message = JSON.parse(event.data);
		if (message.method === 'Page.screencastFrame') {
			onFrame?.(message.params);
			return;
		}
		if (message.id && pending.has(message.id)) {
			const { resolve, reject } = pending.get(message.id);
			pending.delete(message.id);
			message.error ? reject(new Error(message.error.message)) : resolve(message.result);
		} else if (message.method && waiters.has(message.method)) {
			const resolve = waiters.get(message.method);
			waiters.delete(message.method);
			resolve(message.params);
		}
	};
	const send = (method, params = {}) =>
		new Promise((resolve, reject) => {
			const id = nextId++;
			pending.set(id, { resolve, reject });
			socket.send(JSON.stringify({ id, method, params }));
		});
	const once = (method, timeoutMs) => Promise.race([new Promise(resolve => waiters.set(method, resolve)), sleep(timeoutMs)]);
	const click = async (x, y) => {
		await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
		await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
		await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
	};

	const runSteps = async (steps = []) => {
		for (const step of steps) {
			if (step.click) {
				await click(...step.click);
			} else if (step.clickText) {
				const found = await send('Runtime.evaluate', {
					expression: `(() => { const want = ${JSON.stringify(step.clickText.toLowerCase())}; const el = [...document.querySelectorAll('a,button,[role=button]')].find(e => (e.innerText || '').trim().toLowerCase().includes(want)); if (!el) return null; const r = el.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`,
					returnByValue: true,
				});
				if (!found.result.value) throw new Error(`could not find a button labelled "${step.clickText}"`);
				await click(...found.result.value);
			} else if (step.key) {
				const codes = { ArrowRight: 39, ArrowLeft: 37, ArrowUp: 38, ArrowDown: 40, Enter: 13, Escape: 27 };
				const key = { key: step.key, code: step.key, windowsVirtualKeyCode: codes[step.key] ?? 0 };
				await send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
				await sleep(step.hold ?? 60);
				await send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
			} else if (step.wait) {
				await sleep(step.wait);
			}
		}
	};

	// Records the page for a few seconds while optional steps play, then writes a looping animated WebP.
	const recordClip = async (project, clip = {}) => {
		const frames = [];
		const started = Date.now();
		onFrame = params => {
			frames.push({ at: Date.now() - started, data: params.data });
			send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
		};
		await send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: CLIP_WIDTH, everyNthFrame: 1 });
		const seconds = clip.seconds ?? 6;
		await Promise.all([runSteps(clip.steps), sleep(seconds * 1000)]);
		await send('Page.stopScreencast');
		onFrame = null;
		if (frames.length === 0) throw new Error('no frames recorded');

		// The browser only sends a frame when the page repaints, so resample to a steady frame rate.
		const total = Math.round(seconds * CLIP_FPS);
		const picked = [];
		for (let tick = 0, index = 0; tick < total; tick++) {
			const at = (tick * 1000) / CLIP_FPS;
			while (index + 1 < frames.length && frames[index + 1].at <= at) index++;
			picked.push(frames[index].data);
		}
		const images = await Promise.all(picked.map(data => sharp(Buffer.from(data, 'base64')).resize(CLIP_WIDTH).png().toBuffer()));
		mkdirSync(CLIP_DIR, { recursive: true });
		const file = path.join(CLIP_DIR, `${project.id}.webp`);
		await sharp(images, { join: { animated: true } }).webp({ quality: 70, loop: 0, delay: Array(images.length).fill(1000 / CLIP_FPS) }).toFile(file);
		return frames.length;
	};

	await send('Page.enable');
	await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
	await send('Browser.grantPermissions', { permissions: ['geolocation'] });

	mkdirSync(OUT_DIR, { recursive: true });
	const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
	// Local date as YYYY-MM-DD (the en-CA locale formats dates that way).
	const today = new Date().toLocaleDateString('en-CA');

	for (const project of targets) {
		const recipe = recipes[project.id] ?? {};
		try {
			if (recipe.geo) await send('Emulation.setGeolocationOverride', { latitude: recipe.geo[0], longitude: recipe.geo[1], accuracy: 50 });
			else await send('Emulation.clearGeolocationOverride');

			const loaded = once('Page.loadEventFired', 30000);
			await send('Page.navigate', { url: project.liveUrl });
			await loaded;
			await sleep(recipe.wait ?? 4500);

			await runSteps(recipe.steps);

			const shot = await send('Page.captureScreenshot', { format: 'png' });
			const file = path.join(OUT_DIR, `${project.id}.webp`);
			await sharp(Buffer.from(shot.data, 'base64')).webp({ quality: 86 }).toFile(file);
			manifest[project.id] = today;
			console.log(`captured  ${project.id.padEnd(18)} ${project.liveUrl}`);

			if (recordClips) {
				const painted = await recordClip(project, recipe.clip);
				console.log(`clipped   ${project.id.padEnd(18)} ${painted} repaint(s)${painted < 5 ? ' (barely moves; maybe give it clip steps)' : ''}`);
			}
		} catch (error) {
			failed++;
			console.error(`FAILED    ${project.id.padEnd(18)} ${error.message}`);
		}
	}

	const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
	writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`);
	socket.close();
} catch (error) {
	console.error(error.message);
	failed++;
} finally {
	chrome.kill();
	await sleep(400);
	try {
		rmSync(profileDir, { recursive: true, force: true });
	} catch {}
}

console.log(failed ? `Done, with ${failed} failure(s). Look at each image before committing.` : 'Done. Look at each image before committing.');
process.exit(failed ? 1 : 0);
