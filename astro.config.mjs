// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Used for canonical URLs, social previews, and the sitemap.
  site: 'https://probablyfinestudios.com',
  build: {
    // The whole stylesheet is ~7 KB gzipped; inlining it removes a render-blocking request.
    inlineStylesheets: 'always'
  },
  redirects: {
    '/contact': '/about/#contact'
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
