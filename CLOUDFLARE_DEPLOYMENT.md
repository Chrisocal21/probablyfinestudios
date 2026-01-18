# Cloudflare Pages Deployment Guide

## Automatic Deployment via Cloudflare Dashboard

1. **Connect Your Repository**
   - Go to your Cloudflare dashboard
   - Navigate to Pages
   - Click "Create a project"
   - Connect your GitHub/GitLab account
   - Select this repository

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Build output directory: dist
   ```

3. **Set Custom Domain**
   - After deployment, go to "Custom domains"
   - Add `probablyfinestudios.com` and `www.probablyfinestudios.com`
   - Cloudflare will automatically configure DNS

## Manual Deployment via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=probablyfinestudios
   ```

## Environment Variables

If you need environment variables in the future:
1. Go to Settings → Environment variables in Cloudflare Pages
2. Add variables for both Production and Preview environments

## Notes

- This is a static site build, no server-side rendering required
- Builds typically complete in under 1 minute
- Preview deployments are automatically created for pull requests
- Production deployments trigger on pushes to main branch
