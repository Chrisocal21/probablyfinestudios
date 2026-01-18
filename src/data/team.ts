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
		bio: 'Full-stack developer with a passion for creating elegant solutions to complex problems. Photography enthusiast and digital creative.',
		image: '/images/Chris.png',
		links: {
			github: 'https://github.com/Chrisocal21',
			linkedin: 'https://linkedin.com/in/yourusername',
			instagram: 'https://instagram.com/chrisocphoto',
			photography: 'https://chrisocphoto.vercel.app',
			digital: 'https://chrisocdigital.com'
		},
		projects: [
			{ name: 'Cookbookverse', contribution: 'Full-stack Development & Design' },
			{ name: 'TripFldr', contribution: 'Full-stack Development & UX Design' },
			{ name: 'Editly', contribution: 'Full-stack Development & Real-time Collaboration' },
			{ name: 'Anchor CRM', contribution: 'Full-stack Development & Database Architecture' },
			{ name: 'Prodrdy', contribution: 'Full-stack Development & Firebase Integration' },
			{ name: 'Mapit', contribution: 'Full-stack Development & Mapping Integration' },
			{ name: 'URBN Weather', contribution: 'Full-stack Development & Weather API Integration' },
			{ name: 'MerchMaker', contribution: 'Full-stack Development & Stripe Integration' }
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
