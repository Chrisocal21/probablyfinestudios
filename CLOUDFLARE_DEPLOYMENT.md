# Deploying to Cloudflare Pages

`probablyfinestudios.com` and `www.probablyfinestudios.com` are served by the Cloudflare Pages project named `probablyfinestudios`.

## How it works

The Pages project is a **direct upload** project. It has no connection to GitHub, so pushing to `main` does not update the live site by itself. The site changes only when a build is uploaded with Wrangler.

## Deploy

```bash
npm run deploy
```

This builds the site and uploads `./dist/` to the production environment. It needs Wrangler to be logged in on the machine (`npx wrangler login`, once).

To check what is live:

```bash
npx wrangler pages deployment list --project-name=probablyfinestudios
```

The "Source" column shows the commit each deployment was built from.

## Deploying automatically on push (optional, per machine)

Git can run the deploy for you every time `main` is pushed. Save this as `.git/hooks/pre-push`:

```sh
#!/bin/sh
# Deploys to Cloudflare Pages whenever main is pushed. Skip with: SKIP_CF_DEPLOY=1 git push
[ -n "$SKIP_CF_DEPLOY" ] && exit 0

deploy=0
while read -r local_ref local_sha remote_ref remote_sha; do
  [ "$remote_ref" = "refs/heads/main" ] && deploy=1
done
[ "$deploy" = 1 ] || exit 0

cd "$(git rev-parse --show-toplevel)" || exit 0
npm run deploy || echo "WARNING: Cloudflare deploy failed. The live site was not updated."
exit 0
```

Git does not store hooks in the repository, so this has to be set up again on each new clone or computer.

## Response headers

[public/_headers](public/_headers) tells Cloudflare Pages to cache the fingerprinted files under `/_astro/` permanently and adds two security headers. It is copied into the build as-is.

## Related

- The contact form's backend (a Worker with a D1 database) is a separate project with its own deploy. See [MESSAGE_HUB_PHASE1.md](MESSAGE_HUB_PHASE1.md).
- Vercel also builds each push to `main` and serves it at `probablyfinestudios.vercel.app`. That copy is a preview; the `.com` is not connected to it.
