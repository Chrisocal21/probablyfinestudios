/**
 * Project icons: the inner markup of a 24x24 outline icon. The wrapper (ProjectIcon.astro
 * on the site, the social-preview renderer for link cards) supplies stroke color and width.
 */
export const projectIcons: Record<string, string> = {
	// ChrisOCPhoto: a camera
	camera: '<path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/>',
	// FieldKit: a checked-off field clipboard
	clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V4a1 1 0 011-1h4a1 1 0 011 1v.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 4.5z"/><path d="M8.5 13.5l2.5 2.5 4.5-5"/>',
	// CookBookVerse: an open cookbook
	book: '<path d="M12 6.5c-1.5-1-3.5-1.5-5-1.5-1 0-2 .1-3 .4v13c1-.3 2-.4 3-.4 1.5 0 3.5.5 5 1.5m0-13c1.5-1 3.5-1.5 5-1.5 1 0 2 .1 3 .4v13c-1-.3-2-.4-3-.4-1.5 0-3.5.5-5 1.5m0-13v13"/>',
	// Davapalooza: an event ticket
	ticket: '<path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v1.5a2.5 2.5 0 000 5V16a2 2 0 01-2 2H6a2 2 0 01-2-2v-1.5a2.5 2.5 0 000-5V8z"/><path d="M14.5 6v12" stroke-dasharray="1.6 2"/>',
	// TRVLPlay: a die, for a collection of thinking games
	dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01" stroke-width="2.4"/>',
	// Scramble: the egg the player controls
	egg: '<path d="M12 3c-3.3 0-6.5 4.8-6.5 10a6.5 6.5 0 0013 0C18.5 7.8 15.3 3 12 3z"/><path d="M9.8 12.2h.01M14.2 12.2h.01" stroke-width="2.2"/><path d="M10 15.6c.6.5 1.3.8 2 .8s1.4-.3 2-.8"/>',
	// WX: sun and cloud
	weather: '<path d="M6.5 20h10A3.5 3.5 0 0 0 17.1 13.05 5 5 0 0 0 7.4 12.2 4 4 0 1 0 6.5 20z"/><circle cx="17.5" cy="6.5" r="2.3"/><path d="M17.5 1.8v1M22.2 6.5h-1M12.8 6.5h1M20.8 3.2l-.7.7M14.2 3.2l.7.7M20.8 9.8l-.7-.7"/>',
	// Hang: the QR code everyone scans to join a room
	qr: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.5v2.5H14zM20 14v1.5M14 20h1.5M19 18.5h1V20"/>',
	// Standalone: a fabricated box
	cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/>',
	// Ping: a chat bubble mid-reply
	chat: '<path d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.2-3.6A7.93 7.93 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="2.2"/>',
	// SplitNote: a receipt split down the middle
	receipt: '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V3z"/><path d="M12 6v10.5" stroke-dasharray="1.5 1.8"/><path d="M8.3 8.5h1.7M14 8.5h1.7M8.3 12.5h1.7M14 12.5h1.7"/>',
	// Games Collection: a puzzle grid
	grid: '<rect x="4" y="4" width="7" height="7" rx="1.2"/><rect x="13" y="4" width="7" height="7" rx="1.2"/><rect x="4" y="13" width="7" height="7" rx="1.2"/><rect x="13" y="13" width="7" height="7" rx="1.2"/>',
	// Burrow: the 3D globe
	globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
	// Wanderlog: a folded travel map
	map: '<path d="M9 4L3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4z"/><path d="M9 4v13.5M15 6.5V20"/>',
	// Not A Cable: a plug, crossed out
	cable: '<path d="M9 7V3M15 7V3"/><path d="M6.5 7h11v4a5.5 5.5 0 01-11 0V7z"/><path d="M12 16.5V21"/><path d="M3.5 20.5l17-17" stroke-width="1.8"/>',
	// ctrII: a command prompt, for the ask bar
	prompt: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7.5 9.5l3 2.5-3 2.5M13 14.5h3.5"/>',
};
