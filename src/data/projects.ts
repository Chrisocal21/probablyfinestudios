export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	tags: string[];
	liveUrl?: string;
	githubUrl?: string;
	collaborators?: Array<{ name: string; url: string }>;
}

export const projects: Project[] = [
	{
		id: 'cookbookverse',
		title: 'Cookbookverse',
		description: 'A digital cookbook platform for discovering, saving, and sharing recipes.',
		image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
		tags: ['Next.js', 'React', 'TypeScript', 'PostgreSQL'],
		liveUrl: 'https://cookbookverse.com',
		githubUrl: 'https://github.com/yourusername/cookbookverse',
	},
	{
		id: 'tripfldr',
		title: 'TripFldr',
		description: 'Travel planning and itinerary management application for seamless trip organization.',
		image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop',
		tags: ['React', 'Node.js', 'MongoDB', 'Maps API'],
		liveUrl: 'https://tripfldr.com',
		githubUrl: 'https://github.com/yourusername/tripfldr',
	},
	{
		id: 'editly',
		title: 'Editly',
		description: 'Collaborative content editing and management platform built for teams.',
		image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
		tags: ['React', 'TypeScript', 'Real-time', 'Tailwind CSS'],
		liveUrl: 'https://geteditly.com',
		githubUrl: 'https://github.com/yourusername/editly',
	},
	{
		id: 'anchor-crm',
		title: 'Anchor CRM',
		description: 'Customer relationship management system designed for modern businesses.',
		image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
		tags: ['Next.js', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
		liveUrl: 'https://crm-chrisoc.vercel.app',
		githubUrl: 'https://github.com/yourusername/anchor-crm',
	},
	{
		id: 'prodrdy',
		title: 'Prodrdy',
		description: 'Product readiness tracking and launch management platform.',
		image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
		tags: ['React', 'TypeScript', 'Firebase', 'Material UI'],
		liveUrl: 'https://prodrdy.vercel.app', // Update with actual Vercel URL
		githubUrl: 'https://github.com/yourusername/prodrdy',
	},
	{
		id: 'mapit',
		title: 'Mapit',
		description: 'Interactive mapping and location-based data visualization tool.',
		image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&h=600&fit=crop',
		tags: ['React', 'Mapbox', 'D3.js', 'Node.js'],
		liveUrl: 'https://mapit-chrisoc.vercel.app/',
		githubUrl: 'https://github.com/yourusername/mapit',
	},
	{
		id: 'urbn-weather',
		title: 'URBN Weather',
		description: 'Emergency weather tracking and alert system for urban areas.',
		image: 'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?w=800&h=600&fit=crop',
		tags: ['React', 'Weather API', 'Real-time', 'TypeScript'],
		liveUrl: 'https://emergency-urbn.vercel.app',
		githubUrl: 'https://github.com/yourusername/urbn-weather',
	},
	{
		id: 'merchmaker',
		title: 'MerchMaker',
		description: 'Custom merchandise design and ordering platform.',
		image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=600&fit=crop',
		tags: ['Next.js', 'React', 'Stripe', 'TypeScript'],
		liveUrl: 'https://merchmaker.vercel.app',
		githubUrl: 'https://github.com/yourusername/merchmaker',
	},
];
