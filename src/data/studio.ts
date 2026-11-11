// The words for each stop in the studio. The studio is presented as a studio here; the founder story lives on the about page.
// The 3D room (desktop) and the phone page both read from here,
// so the copy only lives in one place.

export type StopId = 'arcade' | 'desk' | 'bench' | 'board' | 'coffee' | 'services';

export interface StopCopy {
	/** Where it is in the room. */
	place: string;
	/** The short name used in the directory and the phone tabs. */
	short: string;
	title: string;
	lede: string;
	accent: string;
}

export const stops: Record<StopId, StopCopy> = {
	arcade: {
		place: 'The arcade',
		short: 'Games',
		title: 'Press start.',
		lede: 'Games that run in your browser. No launcher, no account. Some are finished, most are "finished".',
		accent: '#f87171',
	},
	desk: {
		place: 'The main desk',
		short: 'Apps',
		title: 'Things real people use.',
		lede: 'Sites and apps, designed and built here. Most are live. A few are still being argued with.',
		accent: '#93c5fd',
	},
	bench: {
		place: 'The workbench',
		short: 'Tools',
		title: 'Built out of spite.',
		lede: 'Small tools for annoying problems. Most started as "there has to be a better way" at 1am.',
		accent: '#a3e635',
	},
	board: {
		place: 'The plan',
		short: 'Story',
		title: 'Where this is all going.',
		lede: 'How a photography site turned into a studio, and what it is building next. The whole story lives on the about page.',
		accent: '#fcd34d',
	},
	coffee: {
		place: 'The coffee machine',
		short: 'Contact',
		title: 'Need something built?',
		lede: 'Sites, apps, games, and tools. Say what you are working on and get an honest answer about whether this is the right studio for it.',
		accent: '#fb923c',
	},
	services: {
		place: 'The project desks',
		short: 'Services',
		title: 'Pull up a chair.',
		lede: 'One desk for each kind of work the studio takes on. Pick the one that fits, or the one closest to it.',
		accent: '#f0abfc',
	},
};

/** What the studio takes on, one project desk each. */
export const services: { name: string; note: string }[] = [
	{ name: 'Sites and apps.', note: 'Marketing sites, web apps, and the dashboards behind them.' },
	{ name: 'Games.', note: 'Browser games that run on a link. No launcher, no install.' },
	{ name: 'Tools and scripts.', note: 'Desktop tools, automation, and the odd Adobe script or laser-engraving job.' },
];
