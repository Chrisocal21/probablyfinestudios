export interface ProjectTheme {
gradient: string;
accent: string;
pattern?: string;
patternSize?: string;
}

export interface Project {
id: string;
title: string;
description: string;
image: string;
tags: string[];
liveUrl?: string;
githubUrl?: string;
wip?: boolean;
theme?: ProjectTheme;
collaborators?: Array<{ name: string; url: string }>;
}

export const projects: Project[] = [
{
id: 'chrisocphoto',
title: 'ChrisOCPhoto',
description: "This one's personal. A space for my photography that I built entirely myself — because a creative portfolio should be as intentional as the work inside it.",
image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
tags: ['Next.js', 'React', 'Photography', 'Cloudflare R2'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #0a0a0a 100%)',
accent: '#d6d3d1',
pattern: 'radial-gradient(circle, rgba(214,211,209,0.1) 1px, transparent 1px)',
patternSize: '20px 20px',
},
liveUrl: 'https://chrisocphoto.vercel.app',
},
{
id: 'chrisocdigital',
title: 'ChrisOCDigital',
description: "Same eye, different medium. ChrisOCDigital is where the work goes beyond the still frame — the digital side of the same creative instinct, built into its own space.",
image: '',
tags: ['Next.js', 'React', 'Digital Art', 'Creative Portfolio'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #1a0a1a 0%, #2d0a3d 50%, #0a0a1a 100%)',
accent: '#e879f9',
pattern: 'radial-gradient(circle, rgba(232,121,249,0.08) 1px, transparent 1px)',
patternSize: '24px 24px',
},
liveUrl: 'https://chrisocdigital.com',
},
{
id: 'cookbookverse',
title: 'CookBookVerse',
description: 'I wanted a place where recipes felt alive — not just a list, but a real digital cookbook you actually want to open. So I built one.',
image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
tags: ['Next.js', 'React', 'TypeScript', 'PostgreSQL'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #1c0a00 100%)',
accent: '#fb923c',
pattern: 'repeating-linear-gradient(45deg, rgba(251,146,60,0.05) 0, rgba(251,146,60,0.05) 1px, transparent 0, transparent 50%)',
patternSize: '14px 14px',
},
liveUrl: 'https://cookbookverse.com',
},
{
id: 'fieldkit',
title: 'FieldKit',
description: "Data collection doesn't have to be clunky. FieldKit came from a belief that the tools you use in the field should be as sharp as the work you're doing.",
image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
tags: ['Next.js', 'TypeScript', 'React', 'TailwindCSS'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0f172a 50%, #042f2e 100%)',
accent: '#22d3ee',
pattern: 'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)',
patternSize: '20px 20px',
},
liveUrl: 'https://get-fieldkit.com',
},
{
id: 'mapit',
title: 'Mapit',
description: 'Maps tell stories when the data is right. I built Mapit to make that story easier to see — turning location-based data into something visual and actually useful.',
image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop',
tags: ['React', 'Mapbox', 'D3.js', 'Node.js'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #0f2557 0%, #1e1b4b 50%, #0a0a1a 100%)',
accent: '#818cf8',
pattern: 'linear-gradient(rgba(129,140,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.06) 1px, transparent 1px)',
patternSize: '60px 60px',
},
liveUrl: 'https://mapit-chrisoc.vercel.app/',
},
{
id: 'urbn-weather',
title: 'URBN Weather',
description: "Living in a city means a lot can go wrong at once. URBN Weather is my answer to that — one place to know what's happening around you before it becomes a problem.",
image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=800&h=600&fit=crop',
tags: ['React', 'TypeScript', 'Weather API', 'Real-time', 'Geolocation'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #18181b 0%, #1c1917 50%, #0a0a0a 100%)',
accent: '#fbbf24',
pattern: 'repeating-linear-gradient(-45deg, rgba(251,191,36,0.04) 0, rgba(251,191,36,0.04) 1px, transparent 0, transparent 8px)',
},
liveUrl: 'https://emergency-urbn.vercel.app',
},
{
id: 'wandr',
title: 'Wandr',
description: "I kept opening apps that showed me places I'd already been. Wandr started as a frustration and turned into something I actually use every time I'm somewhere new.",
image: 'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f?w=800&h=600&fit=crop',
tags: ['React', 'TypeScript', 'Location API', 'Maps'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #022c22 0%, #134e4a 50%, #0f172a 100%)',
accent: '#34d399',
pattern: 'radial-gradient(circle, rgba(52,211,153,0.1) 1px, transparent 1px)',
patternSize: '28px 28px',
},
liveUrl: 'https://wandr-chrisoc.vercel.app',
},
{
id: 'scramble',
title: 'Scramble',
description: 'I just wanted to build a real game. Tight levels, real physics, a little egg character with way too much personality. So I did — and it runs in your browser.',
image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
tags: ['Phaser', 'JavaScript', 'Game Dev', 'Mobile-first', 'Canvas'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 50%, #1e1b4b 100%)',
accent: '#c084fc',
pattern: 'linear-gradient(rgba(192,132,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.06) 1px, transparent 1px)',
patternSize: '16px 16px',
},
liveUrl: 'https://scramble-chrisoc.vercel.app',
},
{
id: 'editly',
title: 'Editly',
description: 'Photo editing tools that actually think with you. I built Editly to give photographers a smarter, more intuitive workflow — where the AI adapts to your eye, not the other way around.',
image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
tags: ['Next.js', 'React', 'AI', 'TypeScript', 'Tailwind CSS'],
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #0c1445 0%, #1e1b4b 50%, #000000 100%)',
accent: '#60a5fa',
pattern: 'repeating-linear-gradient(0deg, rgba(96,165,250,0.04) 0, rgba(96,165,250,0.04) 1px, transparent 0, transparent 4px)',
},
liveUrl: 'https://geteditly.com',
},
];
