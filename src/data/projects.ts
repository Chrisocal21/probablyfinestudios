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
previewStyle?: 'browser' | 'dashboard';
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
description: 'A photography-first portfolio built to present visual work with clarity, speed, and a focused art direction.',
image: '',
tags: ['Photography', 'Portfolio', 'Web'],
liveUrl: 'https://www.chrisocphoto.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 50%, #0a0a0a 100%)',
accent: '#d6d3d1',
pattern: 'radial-gradient(circle, rgba(214,211,209,0.08) 1px, transparent 1px)',
patternSize: '20px 20px',
},
},
{
id: 'fieldkit',
title: 'FieldKit',
description: 'A practical toolkit experience for teams collecting and organizing information in the field without workflow friction.',
image: '/images/fieldkit-preview-v10.png',
tags: ['Productivity', 'Data Collection', 'Web App'],
liveUrl: 'https://www.get-fieldkit.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #083344 0%, #0f172a 50%, #042f2e 100%)',
accent: '#22d3ee',
pattern: 'linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)',
patternSize: '18px 18px',
},
},
{
id: 'cookbookverse',
title: 'CookBookVerse',
description: 'A digital cookbook platform designed to make recipes feel usable, lively, and easy to revisit daily.',
image: '',
tags: ['Recipes', 'Food Tech', 'Web Platform'],
liveUrl: 'https://www.cookbookverse.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #1c0a00 100%)',
accent: '#fb923c',
pattern: 'repeating-linear-gradient(45deg, rgba(251,146,60,0.05) 0, rgba(251,146,60,0.05) 1px, transparent 0, transparent 12px)',
patternSize: '14px 14px',
},
},
{
id: 'davapalooza',
title: 'Davapalooza',
description: 'A personality-led event and brand site built to feel energetic, promotional, and easy to navigate when attention is short.',
image: '',
tags: ['Events', 'Brand Site', 'Web'],
liveUrl: 'https://davapalooza.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #1d0633 0%, #581c87 48%, #19092b 100%)',
accent: '#f0abfc',
pattern: 'radial-gradient(circle, rgba(240,171,252,0.08) 1px, transparent 1px)',
patternSize: '24px 24px',
},
},
{
id: 'trvlplay',
title: 'TRVLPlay',
description: 'A travel-forward concept focused on discovery, planning, and playful trip inspiration in one lightweight web experience.',
image: '',
tags: ['Travel', 'Discovery', 'Web App'],
liveUrl: 'https://trvlplay.com',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #082f49 0%, #155e75 45%, #0f172a 100%)',
accent: '#67e8f9',
pattern: 'linear-gradient(rgba(103,232,249,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.06) 1px, transparent 1px)',
patternSize: '22px 22px',
},
},
{
id: 'scramble',
title: 'Scramble',
description: 'A browser game project built around quick loops, playful challenge, and a lightweight mobile-friendly experience.',
image: '',
tags: ['Game Dev', 'Browser Game', 'Phaser'],
liveUrl: 'https://scramble-chrisoc.vercel.app/',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #1e1b4b 100%)',
accent: '#c084fc',
pattern: 'linear-gradient(rgba(192,132,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(192,132,252,0.06) 1px, transparent 1px)',
patternSize: '16px 16px',
},
},
{
id: 'wx',
title: 'WX',
description: 'A weather-focused interface for checking fast-moving local conditions with a cleaner, more direct dashboard feel.',
image: '/images/wx-preview-v6.png',
tags: ['Weather', 'Dashboard', 'Web App'],
liveUrl: 'https://wx-chrisoc.vercel.app/',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #172554 0%, #1d4ed8 45%, #0f172a 100%)',
accent: '#93c5fd',
pattern: 'repeating-linear-gradient(0deg, rgba(147,197,253,0.05) 0, rgba(147,197,253,0.05) 1px, transparent 0, transparent 10px)',
patternSize: '18px 18px',
},
},
{
id: 'hang',
title: 'Hang',
description: 'A lightweight casual word-game style project designed for quick sessions, simple interaction, and shareable play.',
image: '/images/hang-preview-v9.png',
tags: ['Game', 'Word Play', 'Browser'],
liveUrl: 'https://hang-chrisoc.vercel.app/',
wip: false,
theme: {
gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 48%, #0f172a 100%)',
accent: '#fcd34d',
pattern: 'repeating-linear-gradient(45deg, rgba(252,211,77,0.05) 0, rgba(252,211,77,0.05) 1px, transparent 0, transparent 12px)',
patternSize: '20px 20px',
},
},
];

export const starterProjectTemplate: Project = {
id: 'your-project-id',
title: 'Your Project Name',
description: 'A short description of what this project does and why it matters.',
image: '',
tags: ['Astro', 'TypeScript'],
previewStyle: 'browser',
liveUrl: 'https://example.com',
githubUrl: 'https://github.com/your-org/your-repo',
wip: true,
theme: {
gradient: 'linear-gradient(135deg, #111827 0%, #0f172a 50%, #020617 100%)',
accent: '#38bdf8',
pattern: 'radial-gradient(circle, rgba(56,189,248,0.08) 1px, transparent 1px)',
patternSize: '22px 22px',
},
collaborators: [],
};
