import snapshot from './contributions-snapshot.json';

export const GITHUB_USER = 'Chrisocal21';

export interface ContributionDay {
	date: string;
	count: number;
	/** 0–4, GitHub's own intensity bucket */
	level: number;
}

export interface Contributions {
	days: ContributionDay[];
	/** Columns of the calendar, Sunday-first; missing days are null */
	weeks: (ContributionDay | null)[][];
	total: number;
	activeDays: number;
	longestStreak: number;
	bestDay: ContributionDay | null;
	/** false when the live fetch failed and the committed snapshot was used */
	live: boolean;
}

function parseCalendar(html: string): ContributionDay[] {
	const counts = new Map<string, number>();
	for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*)/g)) {
		const n = m[2].match(/^(\d+) contribution/);
		counts.set(m[1], n ? Number(n[1]) : 0);
	}

	const days: ContributionDay[] = [];
	for (const m of html.matchAll(/<td[^>]*class="ContributionCalendar-day"[^>]*>/g)) {
		const tag = m[0];
		const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
		const id = tag.match(/\bid="([^"]+)"/)?.[1];
		const level = tag.match(/data-level="(\d)"/)?.[1];
		if (!date || !id) continue;
		days.push({ date, count: counts.get(id) ?? 0, level: Number(level ?? 0) });
	}
	return days.sort((a, b) => a.date.localeCompare(b.date));
}

function summarize(days: ContributionDay[], live: boolean): Contributions {
	const weeks: (ContributionDay | null)[][] = [];
	for (const day of days) {
		const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay();
		if (weeks.length === 0 || weekday === 0) weeks.push(Array(7).fill(null));
		weeks[weeks.length - 1][weekday] = day;
	}

	let longestStreak = 0;
	let streak = 0;
	let bestDay: ContributionDay | null = null;
	for (const day of days) {
		streak = day.count > 0 ? streak + 1 : 0;
		longestStreak = Math.max(longestStreak, streak);
		if (day.count > 0 && (!bestDay || day.count > bestDay.count)) bestDay = day;
	}

	return {
		days,
		weeks,
		total: days.reduce((sum, d) => sum + d.count, 0),
		activeDays: days.filter(d => d.count > 0).length,
		longestStreak,
		bestDay,
		live,
	};
}

/**
 * Reads the public contribution calendar from github.com at build time, so the
 * graph refreshes on every deploy. Falls back to contributions-snapshot.json if
 * GitHub is unreachable or changes its markup.
 */
export function getContributions(): Promise<Contributions> {
	// Several pages show these numbers; fetch once per build.
	cached ??= loadContributions();
	return cached;
}

let cached: Promise<Contributions> | undefined;

async function loadContributions(): Promise<Contributions> {
	try {
		const res = await fetch(`https://github.com/users/${GITHUB_USER}/contributions`, {
			headers: { 'x-requested-with': 'XMLHttpRequest' },
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
		const days = parseCalendar(await res.text());
		if (days.length < 300) throw new Error(`only parsed ${days.length} days`);
		return summarize(days, true);
	} catch (error) {
		console.warn(`[github] Using contribution snapshot: ${error instanceof Error ? error.message : error}`);
		const days = (snapshot as [string, number, number][]).map(([date, count, level]) => ({ date, count, level }));
		return summarize(days, false);
	}
}
