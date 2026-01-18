# Probably Fine Studios

A modern portfolio and showcase website for Probably Fine Studios, built with Astro and Tailwind CSS.

🌐 **Live Site:** [probablyfinestudios.com](https://probablyfinestudios.com)

## Features

- 🚀 Built with Astro for blazing-fast performance
- 🎨 Styled with Tailwind CSS v4
- 📱 Fully responsive design
- 🎯 Portfolio showcase with project cards
- 👥 Team member profiles with social links
- 📧 Contact page with multiple connection options
- ⚡ Optimized for Cloudflare Pages deployment

## Project Structure

```text
/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── ProjectCard.astro
│   │   └── TeamCard.astro
│   ├── data/            # Data files for content
│   │   ├── projects.ts
│   │   └── team.ts
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro
│   ├── pages/           # Site pages (auto-routed)
│   │   ├── index.astro      # Home page
│   │   ├── portfolio.astro  # Projects showcase
│   │   ├── team.astro       # Team members
│   │   ├── about.astro      # About the studio
│   │   └── contact.astro    # Contact page
│   └── styles/
│       └── global.css   # Global styles with Tailwind
├── public/              # Static assets
└── dist/                # Build output (generated)
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start dev server at http://localhost:4321
npm run dev
```

The site will automatically reload when you make changes.

### Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Customization

### Adding Projects

Edit [src/data/projects.ts](src/data/projects.ts) to add your projects:

```typescript
{
  id: 'project-id',
  title: 'Project Name',
  description: 'Project description',
  image: 'https://image-url.com/image.jpg',
  tags: ['React', 'TypeScript', 'Node.js'],
  liveUrl: 'https://project-url.com',
  githubUrl: 'https://github.com/user/repo',
  collaborators: [
    { name: 'Collaborator Name', url: 'https://github.com/username' }
  ]
}
```

### Adding Team Members

Edit [src/data/team.ts](src/data/team.ts) to add team members:

```typescript
{
  id: 'member-id',
  name: 'Member Name',
  role: 'Job Title',
  bio: 'Short bio',
  image: 'https://image-url.com/photo.jpg',
  links: {
    github: 'https://github.com/username',
    twitter: 'https://twitter.com/username',
    linkedin: 'https://linkedin.com/in/username',
    website: 'https://personal-site.com'
  }
}
```

### Updating Colors

The site uses a indigo/purple color scheme. To change it, update the Tailwind classes in the components:

- Primary: `indigo-600`, `indigo-700`
- Accent: `purple-600`, `purple-700`

## Deployment to Cloudflare Pages

See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Push to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy!

## Commands Reference

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Install dependencies                             |
| `npm run dev`          | Start dev server at `localhost:4321`             |
| `npm run build`        | Build production site to `./dist/`               |
| `npm run preview`      | Preview production build locally                 |
| `npm run astro ...`    | Run Astro CLI commands                           |

## Tech Stack

- **Framework:** [Astro](https://astro.build)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com)
- **Language:** TypeScript

## License

© 2026 Probably Fine Studios. All rights reserved.

## Support

For questions or issues, reach out at hello@probablyfinestudios.com

