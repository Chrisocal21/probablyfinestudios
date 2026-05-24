export interface TeamMember {
	id: string;
	name: string;
	role: string;
	bio: string;
	image: string;
	links?: {
		github?: string;
		twitter?: string;
		linkedin?: string;
		instagram?: string;
		website?: string;
		photography?: string;
		digital?: string;
	};
	projects?: Array<{
		name: string;
		contribution: string;
	}>;
	tools?: {
		frontend?: string[];
		backend?: string[];
		devTools?: string[];
		designDeploy?: string[];
		apiIntegration?: string[];
	};
}

export const teamMembers: TeamMember[] = [
	{
		id: 'member-1',
		name: 'Chris',
		role: 'Founder & Lead Developer',
		bio: 'Started with a camera, ended up writing code. ChrisOCPhoto has been home base for years — a photography portfolio built from scratch. ChrisOCDigital grew out of that when the dev side took hold: tools, scripts, sites, programs, experiments. Probably Fine Studios is what it all became. Still one person, still building things that actually interest me.',
		image: '/images/Chris.png',
		links: {
			github: 'https://github.com/Chrisocal21',
			linkedin: 'https://linkedin.com/in/yourusername',
			instagram: 'https://instagram.com/chrisocphoto',
			photography: 'https://chrisocphoto.vercel.app',
			digital: 'https://chrisocdigital.com'
		},
		projects: [
			{ name: 'CookBookVerse', contribution: 'Full-stack Development & Design' },
			{ name: 'Editly', contribution: 'Full-stack Development & AI Integration' },
			{ name: 'FieldKit', contribution: 'Full-stack Development & Platform Architecture' },
			{ name: 'ChrisOCPhoto', contribution: 'Full-stack Development & Photography Portfolio' },
			{ name: 'ChrisOCDigital', contribution: 'Full-stack Development & Digital Creative Portfolio' },
			{ name: 'Wandr', contribution: 'Full-stack Development & Location API Integration' },
			{ name: 'Mapit', contribution: 'Full-stack Development & Mapping Integration' },
			{ name: 'URBN Weather', contribution: 'Full-stack Development & Real-time Data Integration' },
			{ name: 'Scramble', contribution: 'Game Development & Phaser Engine' },
		],
		tools: {
			frontend: ['Next.js', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Material UI', 'Astro', 'HTML/CSS'],
			backend: ['Node.js', 'PostgreSQL', 'MongoDB', 'Prisma', 'Firebase', 'RESTful APIs', 'WebSockets', 'OAuth'],
			devTools: ['Visual Studio Code', 'GitHub', 'Git', 'Claude AI', 'OpenAI', 'npm/yarn'],
			designDeploy: ['Adobe Photoshop', 'Adobe Illustrator', 'Vercel', 'Cloudflare', 'Figma'],
			apiIntegration: ['Google Maps API', 'Mapbox', 'Weather APIs', 'Stripe', 'D3.js', 'Real-time Features']
		}
	},
];
