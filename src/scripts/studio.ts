// The studio: a cutaway diorama of the office, where every object opens real work.
// Furniture is built in code; the props are CC0 scans from Poly Haven (see public/studio/CREDITS.txt).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

interface Item {
	id: string;
	title: string;
	description: string;
	url: string | null;
	playLabel: string | null;
	wip: boolean;
	accent: string;
	screen: string | null;
	embeddable: boolean;
}
interface StudioData {
	games: Item[];
	apps: Item[];
	tools: Item[];
	links: { hire: string; collab: string; hello: string; about: string; work: string };
	portrait: string;
}

type StationId = 'arcade' | 'desk' | 'bench' | 'board' | 'coffee' | 'hiring';
type Vec3 = [number, number, number];
interface Station {
	id: StationId;
	tag: string;
	accent: string;
	/** Where the camera sits and what it looks at when this stop is open. */
	cam: Vec3;
	look: Vec3;
	/** Where the floating tag hangs in the room. */
	tagAt: Vec3;
	group: THREE.Group;
}

// Home sits a little left so the room clears the headline; the intro starts high and wide, outside.
const HOME = { cam: new THREE.Vector3(-0.4, 4.3, 9.8), look: new THREE.Vector3(-0.6, 0.55, -0.8) };
const INTRO = { cam: new THREE.Vector3(7.5, 9.5, 17), look: new THREE.Vector3(0, 1.5, -1.5) };
const WALL_TOP = 4.2;

const C = {
	wall: 0x5552b8,
	wallTrim: 0x1d1c45,
	rug: 0xff7a45,
	wood: 0xe0b07a,
	darkWood: 0x6b4226,
	metal: 0x52525b,
	black: 0x16161a,
	cream: 0xf5ecd7,
	pink: 0xff5fa2,
	cyan: 0x3fe0d0,
	yellow: 0xfcd34d,
	green: 0x86efac,
	purple: 0x8b5cf6,
};

const VIGNETTE_GRAIN = {
	uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.035 }, vignette: { value: 0.45 } },
	vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse; uniform float time; uniform float grain; uniform float vignette; varying vec2 vUv;
		float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
		void main() {
			vec4 color = texture2D(tDiffuse, vUv);
			vec2 d = vUv - 0.5;
			color.rgb *= mix(1.0 - vignette, 1.0, smoothstep(0.8, 0.2, length(d * vec2(1.15, 1.0))));
			color.rgb += (hash(vUv * 1000.0 + fract(time) * 100.0) - 0.5) * grain;
			gl_FragColor = color;
		}`,
};

export function startStudio() {
	const root = document.getElementById('studio');
	const canvas = document.getElementById('studio-canvas') as HTMLCanvasElement | null;
	const dataEl = document.getElementById('studio-data');
	if (!root || !canvas || !dataEl) return;
	const data = JSON.parse(dataEl.textContent || '{}') as StudioData;
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const loading = document.getElementById('studio-loading');
	const loadingText = loading?.querySelector('p');

	let renderer: THREE.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
	} catch {
		if (loading) loading.innerHTML = '<p>Your browser would not open the studio door.</p><p class="small"><a href="/portfolio/">See all the work instead →</a></p>';
		return;
	}
	let pixelRatio = Math.min(window.devicePixelRatio, 2);
	renderer.setPixelRatio(pixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.15;
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	RectAreaLightUniformsLib.init();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x07061a);
	scene.fog = new THREE.Fog(0x07061a, 16, 30);
	// Soft studio reflections for every material, without shipping an HDRI.
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environmentIntensity = 0.32;

	const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
	const look = new THREE.Vector3();
	const deepLink = ['arcade', 'desk', 'bench', 'board', 'coffee', 'hiring'].includes(location.hash.slice(1));
	const playIntro = !reducedMotion && !deepLink;
	camera.position.copy(playIntro ? INTRO.cam : HOME.cam);
	look.copy(playIntro ? INTRO.look : HOME.look);
	camera.lookAt(look);

	// ---------- post-processing ----------
	const composer = new EffectComposer(renderer);
	composer.addPass(new RenderPass(scene, camera));
	const gtao = new GTAOPass(scene, camera, 1, 1);
	gtao.blendIntensity = 0.9;
	gtao.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 1.2, scale: 1.1 });
	composer.addPass(gtao);
	const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.55, 0.85);
	composer.addPass(bloom);
	// Tilt-shift: the focus follows whatever the camera is looking at, so the room reads as a miniature.
	const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0016, maxblur: 0.007 });
	composer.addPass(bokeh);
	composer.addPass(new OutputPass());
	const grade = new ShaderPass(VIGNETTE_GRAIN);
	composer.addPass(grade);
	const smaa = new SMAAPass();
	composer.addPass(smaa);

	// ---------- loading ----------
	const manager = new THREE.LoadingManager();
	manager.onProgress = (_url, loaded, total) => {
		if (loadingText) loadingText.textContent = `Unlocking the studio… ${Math.round((loaded / total) * 100)}%`;
	};
	const textures = new THREE.TextureLoader(manager);
	const loadTexture = (url: string, color = true) => {
		const texture = textures.load(url);
		if (color) texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		return texture;
	};
	/** A Poly Haven surface: colour, normal and roughness maps, tiled `repeat` times. */
	const surface = (id: string, repeat: [number, number], params: THREE.MeshStandardMaterialParameters = {}) => {
		const maps = [loadTexture(`/studio/textures/${id}/diff.jpg`), loadTexture(`/studio/textures/${id}/nor.jpg`, false), loadTexture(`/studio/textures/${id}/rough.jpg`, false)];
		for (const map of maps) {
			map.wrapS = map.wrapT = THREE.RepeatWrapping;
			map.repeat.set(...repeat);
		}
		return new THREE.MeshStandardMaterial({ map: maps[0], normalMap: maps[1], roughnessMap: maps[2], ...params });
	};

	// ---------- building blocks ----------
	const materials = new Map<number, THREE.MeshStandardMaterial>();
	const mat = (color: number) => {
		if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.6 }));
		return materials.get(color)!;
	};
	const glossy = (color: number) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.12 });
	const metal = (color: number, roughness = 0.35) => new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness });

	/** A box with softly rounded edges, so it catches light like a real object. */
	const box = (parent: THREE.Object3D, w: number, h: number, d: number, material: number | THREE.Material, x: number, y: number, z: number, radius?: number) => {
		const r = radius ?? Math.min(0.03, Math.min(w, h, d) * 0.25);
		const geometry = r > 0.001 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
		const mesh = new THREE.Mesh(geometry, typeof material === 'number' ? mat(material) : material);
		mesh.position.set(x, y, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		parent.add(mesh);
		return mesh;
	};
	const cylinder = (parent: THREE.Object3D, rTop: number, rBottom: number, h: number, material: number | THREE.Material, x: number, y: number, z: number, segments = 24) => {
		const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), typeof material === 'number' ? mat(material) : material);
		mesh.position.set(x, y, z);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		parent.add(mesh);
		return mesh;
	};

	/** A canvas painted with text, for signs, sticky notes, and the whiteboard. */
	const paint = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
		const el = document.createElement('canvas');
		el.width = w;
		el.height = h;
		const ctx = el.getContext('2d')!;
		draw(ctx, w, h);
		const texture = new THREE.CanvasTexture(el);
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		return texture;
	};
	const font = (weight: number, size: number, family = 'Sora Variable, Sora, Inter, sans-serif') => `${weight} ${size}px ${family}`;
	const hand = (size: number) => `700 ${size}px "Comic Sans MS", "Segoe Print", "Bradley Hand", cursive`;

	const sign = (parent: THREE.Object3D, w: number, h: number, texture: THREE.Texture, x: number, y: number, z: number, glow = false) => {
		const material = glow
			? new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false })
			: new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, transparent: true });
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
		mesh.position.set(x, y, z);
		mesh.receiveShadow = !glow;
		parent.add(mesh);
		return mesh;
	};

	/** A screen that cycles through screenshots, with a sheet of glass in front that catches reflections. */
	let steamPuff: THREE.Mesh | null = null;
	const screens: Array<{ material: THREE.MeshBasicMaterial; maps: THREE.Texture[]; index: number }> = [];
	const screen = (parent: THREE.Object3D, w: number, h: number, urls: string[], x: number, y: number, z: number) => {
		const maps = urls.map(url => loadTexture(url));
		const material = new THREE.MeshBasicMaterial({ color: 0xd8d8d8, map: maps[0] ?? null });
		const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
		mesh.position.set(x, y, z);
		const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.18, clearcoat: 1 }));
		glass.position.z = 0.004;
		mesh.add(glass);
		parent.add(mesh);
		if (maps.length > 1) screens.push({ material, maps, index: 0 });
		return mesh;
	};
	const shots = (items: Item[]) => items.map(item => item.screen).filter((src): src is string => Boolean(src));

	/** A soft rectangle of light, for windows and screens. */
	const panelLight = (parent: THREE.Object3D, color: number, intensity: number, w: number, h: number, at: Vec3, target: Vec3) => {
		const light = new THREE.RectAreaLight(color, intensity, w, h);
		light.position.set(...at);
		parent.add(light);
		light.lookAt(new THREE.Vector3(...target).applyMatrix4(parent.matrixWorld));
		return light;
	};

	// ---------- props from Poly Haven ----------
	const gltf = new GLTFLoader(manager);
	const sizeOf = new THREE.Vector3();
	const centreOf = new THREE.Vector3();
	/**
	 * Loads a prop, scales it so its largest side is `size` metres, and stands it on (or hangs it from) the
	 * returned holder, which is placed straight away so the layout does not wait for the download.
	 */
	const prop = (id: string, size: number, parent: THREE.Object3D, at: Vec3, rotY = 0, anchor: 'bottom' | 'top' | 'center' = 'bottom', tweak?: (object: THREE.Object3D) => void) => {
		const holder = new THREE.Group();
		holder.position.set(...at);
		holder.rotation.y = rotY;
		parent.add(holder);
		gltf.load(`/studio/models/${id}/${id}.gltf`, result => {
			const object = result.scene;
			object.traverse(child => {
				if ((child as THREE.Mesh).isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
			const bounds = new THREE.Box3().setFromObject(object);
			bounds.getSize(sizeOf);
			object.scale.setScalar(size / Math.max(sizeOf.x, sizeOf.y, sizeOf.z));
			bounds.setFromObject(object);
			bounds.getCenter(centreOf);
			object.position.x -= centreOf.x;
			object.position.z -= centreOf.z;
			object.position.y -= anchor === 'bottom' ? bounds.min.y : anchor === 'top' ? bounds.max.y : centreOf.y;
			holder.add(object);
			tweak?.(object);
		});
		return holder;
	};

	// ---------- the room ----------
	const room = new THREE.Group();
	scene.add(room);
	room.updateMatrixWorld();

	const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 9.5), surface('wood_floor_worn', [4, 3.2], { color: 0xd9a77a }));
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	room.add(floor);
	// The base under the cutaway, so the room sits on something like a model on a plinth.
	box(room, 12.6, 0.5, 10.1, C.wallTrim, 0, -0.26, 0.1, 0.06);

	const rug = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), surface('fabric_pattern_07', [3, 3], { color: C.rug }));
	rug.rotation.x = -Math.PI / 2;
	rug.position.set(-1.6, 0.008, 1.2);
	rug.receiveShadow = true;
	// Keep the weave (normal + roughness) but not the fabric's own dark colour.
	(rug.material as THREE.MeshStandardMaterial).map = null;
	room.add(rug);

	const wallMaterial = surface('painted_plaster_wall', [3, 1.2], { color: C.wall });
	const sideWallMaterial = surface('painted_plaster_wall', [2.4, 1.2], { color: C.wall });
	box(room, 12.4, WALL_TOP, 0.3, wallMaterial, 0, WALL_TOP / 2, -4.9, 0.02); // back
	box(room, 0.3, WALL_TOP, 9.8, sideWallMaterial, -6.15, WALL_TOP / 2, 0, 0.02); // left
	box(room, 0.3, WALL_TOP, 9.8, sideWallMaterial, 6.15, WALL_TOP / 2, 0, 0.02); // right
	// Cut edges along the top, like a dollhouse with the roof off.
	box(room, 12.4, 0.04, 0.3, C.cream, 0, WALL_TOP + 0.02, -4.9, 0.01);
	box(room, 0.3, 0.04, 9.8, C.cream, -6.15, WALL_TOP + 0.02, 0, 0.01);
	box(room, 0.3, 0.04, 9.8, C.cream, 6.15, WALL_TOP + 0.02, 0, 0.01);
	// Skirting boards.
	box(room, 12, 0.16, 0.04, C.cream, 0, 0.08, -4.73, 0.01);
	box(room, 0.04, 0.16, 9.5, C.cream, -5.98, 0.08, 0, 0.01);
	box(room, 0.04, 0.16, 9.5, C.cream, 5.98, 0.08, 0, 0.01);

	// A window on the back wall, with a city that is suspiciously well lit for this hour.
	const windowTex = paint(1024, 512, (ctx, w, h) => {
		const sky = ctx.createLinearGradient(0, 0, 0, h);
		sky.addColorStop(0, '#120f3a');
		sky.addColorStop(0.7, '#6d28d9');
		sky.addColorStop(1, '#f472b6');
		ctx.fillStyle = sky;
		ctx.fillRect(0, 0, w, h);
		ctx.fillStyle = '#fff7ed';
		ctx.beginPath();
		ctx.arc(w * 0.78, h * 0.22, 34, 0, Math.PI * 2);
		ctx.fill();
		for (let layer = 0; layer < 2; layer++) {
			for (let i = 0; i < 30; i++) {
				const bw = 28 + Math.random() * 60;
				const bh = (layer ? 120 : 60) + Math.random() * (layer ? 260 : 180);
				const bx = Math.random() * w;
				ctx.fillStyle = layer ? '#0c0a24' : '#2a1e5c';
				ctx.fillRect(bx, h - bh, bw, bh);
				if (!layer) continue;
				ctx.fillStyle = '#fcd34d';
				for (let y = h - bh + 10; y < h - 10; y += 20) for (let x = bx + 6; x < bx + bw - 8; x += 14) if (Math.random() > 0.55) ctx.fillRect(x, y, 6, 9);
			}
		}
	});
	const windowPane = sign(room, 3.2, 1.6, windowTex, 3.6, 2.6, -4.74, true);
	(windowPane.material as THREE.MeshBasicMaterial).color.setScalar(0.85);
	box(room, 3.4, 0.1, 0.16, C.cream, 3.6, 3.45, -4.7, 0.02);
	box(room, 3.4, 0.12, 0.3, C.cream, 3.6, 1.76, -4.65, 0.02);
	box(room, 0.08, 1.6, 0.12, C.cream, 3.6, 2.6, -4.7, 0.02);
	box(room, 0.1, 1.8, 0.16, C.cream, 1.95, 2.6, -4.7, 0.02);
	box(room, 0.1, 1.8, 0.16, C.cream, 5.25, 2.6, -4.7, 0.02);
	panelLight(room, 0xa78bfa, 5, 3.2, 1.6, [3.6, 2.6, -4.6], [3.6, 1.2, 0]);

	// The neon sign. Every studio has one. It is the law.
	const neon = paint(1024, 256, (ctx, w, h) => {
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.font = font(800, 96);
		ctx.shadowColor = '#ff5fa2';
		ctx.shadowBlur = 30;
		ctx.fillStyle = '#ffd1e6';
		ctx.fillText('PROBABLY FINE', w / 2, h * 0.38);
		ctx.font = font(700, 52);
		ctx.shadowColor = '#3fe0d0';
		ctx.fillStyle = '#c9fff9';
		ctx.fillText('S T U D I O S', w / 2, h * 0.78);
	});
	sign(room, 3.6, 0.9, neon, -0.6, 3.4, -4.73, true);
	const neonLight = new THREE.PointLight(C.pink, 5, 6, 1.8);
	neonLight.position.set(-0.6, 3.3, -4.1);
	scene.add(neonLight);

	// Employee of the month. Every month.
	const eotm = new THREE.Group();
	eotm.position.set(-2.9, 2.55, -4.73);
	room.add(eotm);
	box(eotm, 0.95, 1.2, 0.05, glossy(0xe0b100), 0, 0, 0, 0.015);
	sign(eotm, 0.75, 0.75, loadTexture(data.portrait), 0, 0.1, 0.03);
	sign(eotm, 0.85, 0.22, paint(512, 128, (ctx, w) => {
		ctx.fillStyle = '#111';
		ctx.textAlign = 'center';
		ctx.font = font(800, 40);
		ctx.fillText('EMPLOYEE OF THE MONTH', w / 2, 52);
		ctx.font = font(500, 30);
		ctx.fillText('Chris · every month since forever', w / 2, 98);
	}), 0, -0.42, 0.03);

	prop('wall_clock', 0.42, room, [-4.3, 3.35, -4.72], 0, 'center');
	prop('dartboard', 0.55, room, [-5.98, 1.75, -2.7], Math.PI / 2, 'center');
	prop('potted_plant_02', 0.95, room, [-5.35, 0, -4.15]);
	// Boxes in the corner, from the last time something shipped.
	prop('cardboard_box_01', 0.55, room, [-5.45, 0, 3.7], 0.2);
	prop('cardboard_box_01', 0.5, room, [-5.4, 0.37, 3.72], -0.35);
	prop('cardboard_box_01', 0.5, room, [-4.85, 0, 3.95], 1.1);
	prop('mid_century_lounge_chair', 1.15, room, [3.0, 0, 3.75], -2.45);

	// ---------- light ----------
	scene.add(new THREE.HemisphereLight(0xb4b4ff, 0x5a3a20, 0.9));
	const moon = new THREE.DirectionalLight(0xc4b5fd, 0.9);
	moon.position.set(6, 9, 7);
	scene.add(moon);

	/**
	 * A pool of light from above the cutaway, like a stage light on a set: you see where it lands,
	 * never the fixture. No hanging lamps, no glowing bulbs.
	 */
	const beams: THREE.SpotLight[] = [];
	const lamp = (x: number, z: number, color = 0xffd9a0, intensity = 22) => {
		const light = new THREE.SpotLight(color, intensity * 2.2, 14, Math.PI / 6.5, 0.75, 1.4);
		light.position.set(x, WALL_TOP + 1.6, z + 0.6);
		light.target.position.set(x, 0, z);
		light.castShadow = true;
		light.shadow.mapSize.set(2048, 2048);
		light.shadow.bias = -0.0005;
		light.shadow.normalBias = 0.02;
		scene.add(light, light.target);
		beams.push(light);
	};

	// Dust in the light. Every cinematic interior has dust. It is also the law.
	const DUST = 700;
	const dustPositions = new Float32Array(DUST * 3);
	const dustSeeds = new Float32Array(DUST);
	for (let i = 0; i < DUST; i++) {
		dustPositions.set([(Math.random() - 0.5) * 11.5, Math.random() * 3.6, (Math.random() - 0.5) * 9], i * 3);
		dustSeeds[i] = Math.random() * 100;
	}
	const dustGeometry = new THREE.BufferGeometry();
	dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
	const dust = new THREE.Points(
		dustGeometry,
		new THREE.PointsMaterial({
			size: 0.022,
			map: paint(32, 32, (ctx, w) => {
				const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
				g.addColorStop(0, 'rgba(255,240,220,1)');
				g.addColorStop(1, 'rgba(255,240,220,0)');
				ctx.fillStyle = g;
				ctx.fillRect(0, 0, w, w);
			}),
			transparent: true,
			opacity: 0.55,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	scene.add(dust);

	// ---------- stations ----------
	const stations: Station[] = [];
	const station = (id: StationId, tag: string, accent: string, cam: Vec3, lookAt: Vec3, tagAt: Vec3) => {
		const group = new THREE.Group();
		group.userData.station = id;
		room.add(group);
		stations.push({ id, tag, accent, cam, look: lookAt, tagAt, group });
		return group;
	};
	const deskWood = surface('wood_table_001', [1, 1], { color: C.wood });
	const plywood = surface('plywood', [1, 1]);

	// The arcade cabinet: games.
	{
		const g = station('arcade', 'Games (the fun corner)', '#f87171', [-2.75, 1.95, 0.1], [-3.3, 1.3, -3.6], [-4.2, 2.65, -3.7]);
		g.position.set(-4.2, 0, -3.8);
		g.rotation.y = 0.35;
		g.updateMatrixWorld(true);
		const paint1 = glossy(C.purple);
		box(g, 1.0, 1.0, 0.85, paint1, 0, 0.5, 0, 0.04);
		box(g, 1.0, 0.95, 0.6, paint1, 0, 1.45, -0.12, 0.04);
		box(g, 1.04, 0.3, 0.7, glossy(C.black), 0, 2.05, -0.08, 0.03);
		// Side art stripes.
		for (const side of [-0.505, 0.505]) box(g, 0.01, 1.7, 0.08, glossy(C.pink), side, 1.1, 0.25, 0.004);
		const marquee = paint(512, 128, (ctx, w, h) => {
			const gradient = ctx.createLinearGradient(0, 0, w, 0);
			gradient.addColorStop(0, '#ff5fa2');
			gradient.addColorStop(1, '#f97316');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = font(900, 64);
			ctx.fillText('PRESS START', w / 2, h / 2);
		});
		sign(g, 0.98, 0.26, marquee, 0, 2.05, 0.275, true);
		const deck = box(g, 1.0, 0.08, 0.45, glossy(C.black), 0, 1.02, 0.35, 0.02);
		deck.rotation.x = 0.25;
		cylinder(g, 0.025, 0.025, 0.18, metal(0xd4d4d8), -0.25, 1.12, 0.36, 12);
		const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), glossy(0xef4444));
		ball.position.set(-0.25, 1.22, 0.36);
		ball.castShadow = true;
		g.add(ball);
		cylinder(g, 0.05, 0.05, 0.04, glossy(C.yellow), 0.12, 1.08, 0.36);
		cylinder(g, 0.05, 0.05, 0.04, glossy(C.cyan), 0.3, 1.08, 0.32);
		const scr = screen(g, 0.82, 0.55, shots(data.games), 0, 1.5, 0.185);
		scr.rotation.x = -0.12;
		panelLight(g, 0x9f7aea, 6, 0.82, 0.55, [0, 1.5, 0.2], [0, 1.2, 2]);
	}

	// The main desk: apps. Chris's desk, the only occupied one.
	{
		const g = station('desk', 'Chris · every department', '#93c5fd', [0.95, 1.7, -1.1], [0.95, 1.25, -3.8], [0.3, 2.35, -3.7]);
		g.position.set(0.3, 0, -3.7);
		g.updateMatrixWorld(true);
		box(g, 2.4, 0.06, 0.95, deskWood, 0, 0.76, 0, 0.02);
		for (const [x, z] of [[-1.1, -0.38], [1.1, -0.38], [-1.1, 0.38], [1.1, 0.38]]) box(g, 0.05, 0.74, 0.05, metal(C.black, 0.5), x, 0.37, z, 0.01);
		const bezel = glossy(C.black);
		box(g, 1.5, 0.9, 0.05, bezel, 0, 1.4, -0.25, 0.02);
		box(g, 0.08, 0.35, 0.05, metal(0x71717a), 0, 0.95, -0.3, 0.01);
		box(g, 0.4, 0.02, 0.25, metal(0x71717a), 0, 0.79, -0.27, 0.008);
		screen(g, 1.42, 0.82, shots(data.apps), 0, 1.4, -0.222);
		panelLight(g, 0x93c5fd, 5, 1.42, 0.82, [0, 1.4, -0.2], [0, 1.0, 2]);
		const side = new THREE.Group();
		side.position.set(-1.05, 1.15, -0.2);
		side.rotation.y = 0.45;
		g.add(side);
		box(side, 0.75, 0.48, 0.04, bezel, 0, 0, 0, 0.015);
		screen(side, 0.69, 0.42, shots(data.tools), 0, 0, 0.022);
		box(g, 0.7, 0.025, 0.22, mat(C.cream), 0, 0.8, 0.15, 0.008); // keyboard
		box(g, 0.07, 0.03, 0.11, mat(C.cream), 0.5, 0.8, 0.18, 0.012); // mouse
		cylinder(g, 0.055, 0.05, 0.12, glossy(C.pink), 0.85, 0.85, 0.1);
		prop('desk_lamp_arm_01', 0.7, g, [1.0, 0.79, -0.25], -2.3);
		prop('gamepad', 0.2, g, [-0.55, 0.79, 0.22], 0.4);
		// The chair, with the hoodie that lives on it.
		const chair = new THREE.Group();
		chair.position.set(0, 0, 0.9);
		g.add(chair);
		box(chair, 0.58, 0.09, 0.55, C.black, 0, 0.5, 0, 0.04);
		box(chair, 0.56, 0.7, 0.08, C.black, 0, 0.9, 0.26, 0.04);
		box(chair, 0.62, 0.45, 0.12, 0x2563eb, 0, 1.0, 0.33, 0.05); // hoodie
		cylinder(chair, 0.025, 0.025, 0.45, metal(0xa1a1aa), 0, 0.25, 0, 12);
		cylinder(chair, 0.3, 0.3, 0.035, metal(C.black, 0.5), 0, 0.03, 0, 5);
		lamp(0.3, -3.4);
	}

	// The workbench: tools.
	{
		const g = station('bench', 'Tools (built out of spite)', '#a3e635', [2.6, 2.0, -1.4], [5.3, 1.0, -0.4], [5.4, 2.0, -1.0]);
		g.position.set(5.5, 0, -1.0);
		g.updateMatrixWorld(true);
		box(g, 0.9, 0.08, 2.6, plywood, 0, 0.92, 0, 0.015);
		for (const z of [-1.2, 1.2]) for (const x of [-0.38, 0.38]) box(g, 0.06, 0.9, 0.06, metal(0x3f3f46, 0.45), x, 0.45, z, 0.01);
		box(g, 0.85, 0.04, 2.5, plywood, 0, 0.25, 0, 0.01); // lower shelf
		// Pegboard.
		const pegboard = paint(512, 256, (ctx, w, h) => {
			ctx.fillStyle = '#d6b98c';
			ctx.fillRect(0, 0, w, h);
			ctx.fillStyle = '#8b6b44';
			for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
		});
		const board = sign(g, 2.6, 1.3, pegboard, 0.47, 1.75, 0);
		board.rotation.y = -Math.PI / 2;
		box(g, 0.03, 1.32, 2.62, mat(0xb08d5f), 0.49, 1.75, 0, 0.005);
		prop('cross_pein_hammer', 0.32, g, [0.42, 1.95, -0.9], -Math.PI / 2, 'center');
		prop('measuring_tape_01', 0.14, g, [-0.1, 0.96, 0.95], 0.8);
		prop('bench_vice_01', 0.38, g, [-0.25, 0.96, 0.15], Math.PI / 2);
		prop('metal_toolbox', 0.5, g, [0, 0.27, -0.7], Math.PI / 2);
		// A laser-cut box from Standalone, half assembled.
		box(g, 0.35, 0.25, 0.35, plywood, -0.05, 1.085, -0.6, 0.005);
		box(g, 0.35, 0.012, 0.35, plywood, -0.1, 1.27, -0.5, 0.004).rotation.z = 0.5;
		// A little screen running the tools.
		const mon = new THREE.Group();
		mon.position.set(0.15, 1.24, 0.6);
		mon.rotation.y = -Math.PI / 2;
		g.add(mon);
		box(mon, 0.62, 0.42, 0.04, glossy(C.black), 0, 0, -0.02, 0.012);
		screen(mon, 0.56, 0.36, shots(data.tools), 0, 0, 0.002);
		// Not A Cable: a phone, face up.
		box(g, 0.14, 0.012, 0.28, glossy(C.black), -0.15, 0.97, 0.55, 0.01).rotation.y = 0.3;
		lamp(5.2, -1.0, 0xe9ffd0, 16);
	}

	// The whiteboard: the plan, and the story when it is written.
	{
		const g = station('board', 'The Plan™', '#fcd34d', [-2.7, 1.85, -0.2], [-5.8, 1.75, -0.35], [-5.85, 2.75, 0.4]);
		g.position.set(-5.98, 0, 0.4);
		g.rotation.y = Math.PI / 2;
		box(g, 2.8, 1.6, 0.05, metal(0xd4d4d8, 0.4), 0, 1.8, 0, 0.02);
		const board = paint(2048, 1152, (ctx, w, h) => {
			ctx.scale(2, 2);
			w /= 2;
			h /= 2;
			ctx.fillStyle = '#fafaf9';
			ctx.fillRect(0, 0, w, h);
			ctx.lineWidth = 6;
			ctx.lineCap = 'round';
			ctx.fillStyle = '#1d4ed8';
			ctx.font = hand(54);
			ctx.fillText('THE PLAN', 40, 74);
			ctx.font = hand(34);
			ctx.fillStyle = '#111';
			['1. Learn to code', '2. Build 20 things', '3. ???', '4. Hire literally anyone'].forEach((line, i) => ctx.fillText(line, 50, 150 + i * 62));
			ctx.strokeStyle = '#dc2626';
			ctx.beginPath();
			ctx.moveTo(44, 260);
			ctx.lineTo(290, 255);
			ctx.stroke();
			ctx.fillStyle = '#dc2626';
			ctx.font = hand(30);
			ctx.fillText('(working on it)', 300, 265);
			ctx.strokeStyle = '#111';
			ctx.beginPath();
			ctx.moveTo(40, 470);
			ctx.lineTo(w - 40, 470);
			ctx.stroke();
			const marks = ['photos', 'first site', 'games??', 'v0.15'];
			marks.forEach((mark, i) => {
				const x = 90 + i * 270;
				ctx.beginPath();
				ctx.arc(x, 470, 12, 0, Math.PI * 2);
				ctx.fillStyle = i === marks.length - 1 ? '#dc2626' : '#111';
				ctx.fill();
				ctx.font = hand(28);
				ctx.fillText(mark, x - 40, 520);
			});
			ctx.fillStyle = '#dc2626';
			ctx.font = hand(30);
			ctx.fillText('← WE ARE HERE', 760, 440);
			const sticky = (x: number, y: number, color: string, text: string[]) => {
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate((Math.random() - 0.5) * 0.15);
				ctx.shadowColor = 'rgba(0,0,0,0.25)';
				ctx.shadowBlur = 8;
				ctx.shadowOffsetY = 4;
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, 170, 150);
				ctx.shadowColor = 'transparent';
				ctx.fillStyle = '#111';
				ctx.font = hand(24);
				text.forEach((t, i) => ctx.fillText(t, 14, 40 + i * 32));
				ctx.restore();
			};
			sticky(620, 40, '#fde047', ['story goes', 'here. soon.', 'probably.']);
			sticky(820, 70, '#f9a8d4', ['buy more', 'coffee']);
		});
		const surfaceMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.5), new THREE.MeshPhysicalMaterial({ map: board, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
		surfaceMesh.position.set(0, 1.8, 0.03);
		surfaceMesh.receiveShadow = true;
		g.add(surfaceMesh);
		box(g, 2.8, 0.05, 0.15, metal(0xa1a1aa, 0.4), 0, 0.98, 0.08, 0.01); // marker tray
		for (const [i, color] of [0x1d4ed8, 0xdc2626, 0x111111].entries()) {
			const marker = cylinder(g, 0.012, 0.012, 0.13, color, -0.9 + i * 0.18, 1.02, 0.09, 10);
			marker.rotation.z = Math.PI / 2;
		}
	}

	// The coffee machine: contact.
	{
		const g = station('coffee', 'Contact (fuel)', '#fb923c', [1.9, 2.2, 1.3], [5.1, 1.05, 3.4], [5.4, 2.25, 2.8]);
		g.position.set(5.45, 0, 2.8);
		g.updateMatrixWorld(true);
		box(g, 1.0, 0.92, 2.0, mat(C.cream), 0, 0.46, 0, 0.02); // counter
		box(g, 1.05, 0.05, 2.05, deskWood, 0, 0.945, 0, 0.012);
		const machine = glossy(0xb91c1c);
		box(g, 0.5, 0.62, 0.45, machine, 0, 1.28, 0, 0.05);
		box(g, 0.34, 0.1, 0.32, metal(0x3f3f46), -0.1, 1.02, 0, 0.02);
		cylinder(g, 0.045, 0.04, 0.09, mat(C.cream), -0.15, 1.02, 0, 20);
		cylinder(g, 0.03, 0.03, 0.08, metal(0xd4d4d8, 0.2), -0.2, 1.4, 0.1, 12).rotation.z = Math.PI / 2;
		const steam = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }));
		steam.position.set(-0.15, 1.15, 0);
		g.add(steam);
		steamPuff = steam;
		const label = paint(256, 96, (ctx, w, h) => {
			ctx.fillStyle = '#fff';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.font = font(800, 42);
			ctx.fillText('FUEL', w / 2, h / 2);
		});
		const l = sign(g, 0.4, 0.15, label, -0.255, 1.45, 0);
		l.rotation.y = -Math.PI / 2;
		// A row of mugs, for the team. Optimistic.
		[C.pink, C.cyan, C.yellow, C.green].forEach((color, i) => cylinder(g, 0.055, 0.05, 0.11, glossy(color), -0.1, 1.025, 0.5 + i * 0.15));
		prop('boombox', 0.55, g, [0.05, 0.97, -0.68], -Math.PI / 2);
		prop('WetFloorSign_01', 0.62, g, [-1.0, 0, 1.05], -2.2);
		lamp(5.1, 2.8, 0xffc78a, 14);
	}

	// The empty desks: collaborators wanted.
	{
		const g = station('hiring', 'Your desk here?', '#f0abfc', [-1.4, 3.2, 7.4], [-0.45, 0.7, 1.2], [-1.7, 2.1, 1.4]);
		const roles = ['ART DIRECTOR\n(vacant)', '3D ARTIST\n(please)', 'SOMEONE WHO\nLIKES SPREADSHEETS'];
		roles.forEach((role, i) => {
			const d = new THREE.Group();
			d.position.set(-3.4 + i * 1.75, 0, 1.4);
			g.add(d);
			box(d, 1.4, 0.05, 0.75, deskWood, 0, 0.74, 0, 0.015);
			for (const [x, z] of [[-0.62, -0.3], [0.62, -0.3], [-0.62, 0.3], [0.62, 0.3]]) box(d, 0.04, 0.72, 0.04, metal(C.black, 0.5), x, 0.36, z, 0.008);
			// The chair, empty, facing the room. Waiting.
			box(d, 0.5, 0.07, 0.45, C.black, 0, 0.48, 0.65, 0.03);
			box(d, 0.5, 0.55, 0.06, C.black, 0, 0.78, 0.86, 0.03);
			cylinder(d, 0.02, 0.02, 0.45, metal(0xa1a1aa), 0, 0.24, 0.65, 12);
			cylinder(d, 0.24, 0.24, 0.03, metal(C.black, 0.5), 0, 0.03, 0.65, 5);
			const card = paint(512, 256, (ctx, w, h) => {
				ctx.fillStyle = '#fff';
				ctx.fillRect(0, 0, w, h);
				ctx.strokeStyle = '#f0abfc';
				ctx.lineWidth = 14;
				ctx.strokeRect(7, 7, w - 14, h - 14);
				ctx.fillStyle = '#111';
				ctx.textAlign = 'center';
				const parts = role.split('\n');
				ctx.font = font(800, parts[0].length > 12 ? 40 : 54);
				ctx.fillText(parts[0], w / 2, h * 0.42);
				ctx.font = font(500, 40);
				ctx.fillText(parts[1], w / 2, h * 0.72);
			});
			// Taped to the chair back, facing the room, so the joke lands from across it.
			sign(d, 0.5, 0.25, card, 0, 0.82, 0.895);
		});
		// Interim staff.
		prop('garden_gnome', 0.5, g, [-3.4, 0.515, 1.98], 0.15);
		prop('rubber_duck_toy', 0.16, g, [-1.65, 0.765, 1.35], 0.5);
		lamp(-1.7, 1.4, 0xf5d0fe, 16);
	}

	// ---------- tags, hover, clicks ----------
	const tagsEl = document.getElementById('studio-tags')!;
	const tags = new Map<StationId, HTMLButtonElement>();
	for (const s of stations) {
		const tag = document.createElement('button');
		tag.type = 'button';
		tag.className = 'studio-tag is-hidden';
		tag.textContent = s.tag;
		tag.style.setProperty('--tag', s.accent);
		tag.addEventListener('click', () => go(stations.indexOf(s)));
		tagsEl.append(tag);
		tags.set(s.id, tag);
	}

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2(9, 9);
	const parallax = new THREE.Vector2();
	let hovered: Station | null = null;
	const stationFor = (object: THREE.Object3D | null): Station | null => {
		while (object) {
			if (object.userData.station) return stations.find(s => s.id === object!.userData.station) ?? null;
			object = object.parent;
		}
		return null;
	};
	canvas.addEventListener('pointermove', event => {
		const rect = canvas.getBoundingClientRect();
		pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
		parallax.copy(pointer);
	});
	canvas.addEventListener('pointerleave', () => pointer.set(9, 9));
	canvas.addEventListener('click', () => {
		if (hovered) go(stations.indexOf(hovered));
		else if (current !== -1) go(-1);
	});

	// ---------- camera tour ----------
	const intro = document.getElementById('studio-intro')!;
	const panel = document.getElementById('studio-panel')!;
	const panelBody = document.getElementById('studio-panel-body')!;
	const dots = document.getElementById('studio-dots')!;
	let current = -1;
	let introPlaying = playIntro;
	const fromCam = camera.position.clone();
	const fromLook = look.clone();
	const toCam = HOME.cam.clone();
	const toLook = HOME.look.clone();
	let flight = 1;
	let flightSeconds = 1.4;
	let arc = 0.6;
	if (introPlaying) intro.classList.add('is-hidden');
	else tags.forEach(tag => tag.classList.remove('is-hidden'));

	[-1, ...stations.map((_, i) => i)].forEach(index => {
		const li = document.createElement('li');
		const dot = document.createElement('button');
		dot.type = 'button';
		dot.className = 'studio-dot';
		dot.setAttribute('aria-label', index === -1 ? 'The whole room' : stations[index].tag);
		dot.addEventListener('click', () => go(index));
		li.append(dot);
		dots.append(li);
	});
	const syncDots = () => dots.querySelectorAll('button').forEach((dot, i) => (i - 1 === current ? dot.setAttribute('aria-current', 'step') : dot.removeAttribute('aria-current')));
	syncDots();

	const flyTo = (cam: THREE.Vector3, target: THREE.Vector3, seconds: number, lift: number) => {
		fromCam.copy(camera.position);
		fromLook.copy(look);
		toCam.copy(cam);
		toLook.copy(target);
		flightSeconds = reducedMotion ? 0.001 : seconds;
		arc = lift;
		flight = 0;
	};

	function go(index: number) {
		if (introPlaying) return;
		if (index < -1) index = stations.length - 1;
		if (index >= stations.length) index = -1;
		current = index;
		if (index === -1) flyTo(HOME.cam, HOME.look, 1.4, 0.6);
		else flyTo(new THREE.Vector3(...stations[index].cam), new THREE.Vector3(...stations[index].look), 1.4, 0.6);
		intro.classList.toggle('is-hidden', index !== -1);
		tags.forEach(tag => tag.classList.toggle('is-hidden', index !== -1));
		syncDots();
		if (index === -1) closePanel();
		else openPanel(stations[index]);
		history.replaceState(null, '', index === -1 ? location.pathname : `#${stations[index].id}`);
	}

	document.querySelector('[data-tour="prev"]')?.addEventListener('click', () => go(current - 1));
	document.querySelector('[data-tour="next"]')?.addEventListener('click', () => go(current + 1));
	document.getElementById('studio-close')?.addEventListener('click', () => go(-1));
	window.addEventListener('keydown', event => {
		if (!play.hidden) {
			if (event.key === 'Escape') closePlay();
			return;
		}
		if (event.key === 'Escape') go(-1);
		else if (event.key === 'ArrowRight') go(current + 1);
		else if (event.key === 'ArrowLeft') go(current - 1);
	});

	// Scroll steps through the tour, one stop per flick.
	let wheelLock = 0;
	canvas.addEventListener(
		'wheel',
		event => {
			event.preventDefault();
			const now = performance.now();
			if (now < wheelLock || Math.abs(event.deltaY) < 8) return;
			wheelLock = now + 900;
			go(current + (event.deltaY > 0 ? 1 : -1));
		},
		{ passive: false },
	);

	// ---------- panels ----------
	const escape = (text: string) => text.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
	const out = '↗︎';
	const itemList = (items: Item[], kind: 'game' | 'app' | 'tool') =>
		items
			.map(item => {
				const thumb = item.screen ? `<img class="panel-thumb" src="${item.screen}" alt="" loading="lazy" />` : `<div class="panel-thumb" style="background:${item.accent}22"></div>`;
				const buttons = [];
				if (kind === 'game' && item.embeddable && item.url) buttons.push(`<button type="button" class="panel-btn is-primary" data-play="${item.id}">Play here</button>`);
				if (item.url) buttons.push(`<a class="panel-btn${kind !== 'game' || !item.embeddable ? ' is-primary' : ''}" href="${item.url}" target="_blank" rel="noopener noreferrer">${escape(kind === 'game' ? (item.playLabel ?? 'Open') : 'Visit')} ${out}</a>`);
				buttons.push(`<a class="panel-btn" href="/portfolio/${item.id}/">About</a>`);
				return `<div class="panel-item" style="--accent:${item.accent}">${thumb}<div><h3>${escape(item.title)}${item.wip ? '<span class="panel-wip">WIP</span>' : ''}</h3><p>${escape(item.description)}</p><div class="panel-actions">${buttons.join('')}</div></div></div>`;
			})
			.join('');

	const content: Record<StationId, () => string> = {
		arcade: () => `<p class="panel-eyebrow">The arcade · ${data.games.length} games</p><h2 class="panel-title">Press start.</h2><p class="panel-lede">Games that run in your browser. No launcher, no account. Some are finished, most are "finished".</p>${itemList(data.games, 'game')}`,
		desk: () => `<p class="panel-eyebrow">The main desk · ${data.apps.length} apps</p><h2 class="panel-title">Things real people use.</h2><p class="panel-lede">Sites and apps, designed and built at this desk by the head of every department.</p>${itemList(data.apps, 'app')}`,
		bench: () => `<p class="panel-eyebrow">The workbench · ${data.tools.length} tools</p><h2 class="panel-title">Built because I needed them.</h2><p class="panel-lede">Small tools for annoying problems. Most started as "there has to be a better way" at 1am.</p>${itemList(data.tools, 'tool')}`,
		board: () => `<p class="panel-eyebrow">The plan</p><h2 class="panel-title">The story goes here.</h2><p class="panel-lede">A photographer turned developer, one room, and a lot of side projects that got out of hand. The full story is being written. Probably.</p><div class="panel-actions"><a class="panel-btn is-primary" href="${data.links.about}">Read the about page</a><a class="panel-btn" href="${data.links.work}">All the work</a></div>`,
		coffee: () => `<p class="panel-eyebrow">The coffee machine</p><h2 class="panel-title">Need something built?</h2><p class="panel-lede">Sites, apps, games, tools. Tell me what you are working on and I will tell you honestly if I am the right person for it.</p><div class="panel-actions"><a class="panel-btn is-primary" href="${data.links.hire}">Start a project</a><a class="panel-btn" href="${data.links.hello}">Just say hi</a></div>`,
		hiring: () => `<p class="panel-eyebrow">Now hiring (kind of)</p><h2 class="panel-title">These desks are empty.</h2><p class="panel-lede">That is the bit. The studio started solo and is not planning to stay that way. The gnome and the duck are interim staff and doing their best.</p><ul class="panel-roles"><li><b>Art director.</b> Someone with taste, to tell me no. Currently a gnome.</li><li><b>3D artist.</b> Most of this room was built in code. Please.</li><li><b>Someone who likes spreadsheets.</b> You know who you are.</li></ul><div class="panel-actions"><a class="panel-btn is-primary" href="${data.links.collab}">Pull up a chair</a></div>`,
	};

	function openPanel(s: Station) {
		panel.hidden = false;
		panel.style.setProperty('--accent', s.accent);
		panelBody.innerHTML = content[s.id]();
		panel.scrollTop = 0;
		panel.style.animation = 'none';
		void panel.offsetWidth;
		panel.style.animation = '';
	}
	function closePanel() {
		panel.hidden = true;
	}
	panel.addEventListener('wheel', event => event.stopPropagation());

	// ---------- play a game in the room ----------
	const play = document.getElementById('studio-play')!;
	const playFrame = document.getElementById('studio-play-frame') as HTMLIFrameElement;
	const playTitle = document.getElementById('studio-play-title')!;
	const playOpen = document.getElementById('studio-play-open') as HTMLAnchorElement;
	panelBody.addEventListener('click', event => {
		const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-play]');
		if (!button) return;
		const game = data.games.find(g => g.id === button.dataset.play);
		if (!game?.url) return;
		playTitle.textContent = `${game.title} · press Esc or Close to get back to the studio`;
		playOpen.href = game.url;
		playFrame.src = game.url;
		play.hidden = false;
		playFrame.focus();
	});
	function closePlay() {
		play.hidden = true;
		playFrame.src = 'about:blank';
	}
	document.getElementById('studio-play-close')?.addEventListener('click', closePlay);

	// ---------- size ----------
	const resize = () => {
		const { clientWidth: w, clientHeight: h } = root;
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(w, h, false);
		composer.setPixelRatio(pixelRatio);
		composer.setSize(w, h);
		camera.aspect = w / h;
		camera.fov = w / h < 0.9 ? 60 : 42;
		camera.updateProjectionMatrix();
	};
	new ResizeObserver(resize).observe(root);
	resize();

	// ---------- quality ----------
	// Start with everything on; if this machine cannot keep up, drop the costly effects in stages.
	let tier = 3;
	let sampleFrames = 0;
	let sampleTime = 0;
	const lowerQuality = () => {
		tier--;
		if (tier === 2) {
			bokeh.enabled = false;
			pixelRatio = Math.min(pixelRatio, 1.5);
		} else if (tier === 1) {
			gtao.enabled = false;
			pixelRatio = 1;
			for (const light of beams) light.shadow.mapSize.set(1024, 1024);
		} else if (tier === 0) {
			bloom.enabled = false;
			smaa.enabled = false;
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
		}
		resize();
	};

	// ---------- loop ----------
	const projected = new THREE.Vector3();
	const clock = new THREE.Clock();
	let screenTimer = 0;
	let visible = true;
	let ready = false;
	new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(root);
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
	const sway = new THREE.Vector3();
	const scaleTarget = new THREE.Vector3();

	renderer.setAnimationLoop(() => {
		const dt = Math.min(clock.getDelta(), 0.05);
		if (!visible || !play.hidden || !ready) return;
		const t = clock.elapsedTime;

		if (flight < 1) {
			flight = Math.min(1, flight + dt / flightSeconds);
			const k = ease(flight);
			camera.position.lerpVectors(fromCam, toCam, k);
			camera.position.y += Math.sin(k * Math.PI) * arc;
			look.lerpVectors(fromLook, toLook, k);
			if (flight === 1 && introPlaying) {
				introPlaying = false;
				intro.classList.remove('is-hidden');
				tags.forEach(tag => tag.classList.remove('is-hidden'));
			}
		} else if (!reducedMotion) {
			sway.set(parallax.x * (current === -1 ? 0.6 : 0.15), parallax.y * (current === -1 ? 0.3 : 0.08), 0);
			camera.position.lerp(sway.add(toCam), 0.04);
			look.lerp(toLook, 0.08);
		}
		camera.lookAt(look);
		bokeh.uniforms.focus.value = camera.position.distanceTo(look);
		// Shallower focus up close, deeper from across the room.
		bokeh.uniforms.aperture.value = current === -1 ? 0.0011 : 0.0045;

		screenTimer += dt;
		if (screenTimer > 3.2) {
			screenTimer = 0;
			for (const s of screens) {
				s.index = (s.index + 1) % s.maps.length;
				s.material.map = s.maps[s.index];
				s.material.needsUpdate = true;
			}
		}

		let next: Station | null = null;
		if (current === -1 && !introPlaying && pointer.x < 2) {
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObjects(stations.map(s => s.group), true)[0];
			next = hit ? stationFor(hit.object) : null;
		}
		if (next !== hovered) {
			hovered = next;
			canvas.style.cursor = hovered ? 'pointer' : 'default';
			tags.forEach((tag, id) => tag.classList.toggle('is-hot', hovered?.id === id));
		}
		for (const s of stations) {
			const target = hovered === s ? 1.025 : 1;
			s.group.scale.lerp(scaleTarget.setScalar(target), 0.2);
		}

		const { clientWidth: w, clientHeight: h } = root;
		for (const s of stations) {
			projected.set(...s.tagAt).project(camera);
			// Keep every tag fully on screen, and below the floating header.
			const tag = tags.get(s.id)!;
			const half = tag.offsetWidth / 2 + 12;
			const x = Math.min(Math.max(((projected.x + 1) / 2) * w, half), w - half);
			const y = Math.max(((1 - projected.y) / 2) * h, 104);
			tag.style.translate = `${x}px ${y}px`;
		}

		if (!reducedMotion) {
			const positions = dustGeometry.attributes.position as THREE.BufferAttribute;
			for (let i = 0; i < DUST; i++) {
				const seed = dustSeeds[i];
				let y = positions.getY(i) + dt * 0.03;
				if (y > 3.8) y = 0;
				positions.setXYZ(i, positions.getX(i) + Math.sin(t * 0.3 + seed) * dt * 0.02, y, positions.getZ(i) + Math.cos(t * 0.25 + seed) * dt * 0.02);
			}
			positions.needsUpdate = true;
			if (steamPuff) {
				const p = (t * 0.4) % 0.35;
				steamPuff.position.y = 1.15 + p;
				(steamPuff.material as THREE.MeshBasicMaterial).opacity = 0.45 - p * 1.25;
				steamPuff.scale.setScalar(1 + p * 2);
			}
			neonLight.intensity = 5 + (Math.sin(t * 13) > 0.97 ? -2.5 : 0);
		}
		grade.uniforms.time.value = t;

		composer.render(dt);

		// Measure for a couple of seconds once the camera has settled, and step quality down if needed.
		if (!introPlaying && tier > 0) {
			sampleFrames++;
			sampleTime += dt;
			if (sampleFrames >= 90) {
				if (sampleTime / sampleFrames > 1 / 40) lowerQuality();
				sampleFrames = 0;
				sampleTime = 0;
			}
		}
	});

	const begin = () => {
		if (ready) return;
		ready = true;
		loading?.classList.add('is-done');
		clock.getDelta();
		if (deepLink) {
			const index = stations.findIndex(s => `#${s.id}` === location.hash);
			go(index);
			flight = 1;
			camera.position.copy(toCam);
			look.copy(toLook);
		} else if (introPlaying) {
			flyTo(HOME.cam, HOME.look, 3.6, 1.2);
		}
	};
	manager.onLoad = begin;
	// Never keep anyone at the door: open after a few seconds even if a prop is still on its way.
	setTimeout(begin, 6000);
}
