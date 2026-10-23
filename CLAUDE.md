# CLAUDE.md

@AGENTS.md

## What this is

A static link-in-bio page and URL shortener, built with Astro and deployed on Netlify on a custom domain. There is no server, database or serverless function: short links are Netlify `_redirects` rules generated at build time and handled at the CDN edge. Pushing to GitHub triggers a Netlify rebuild and deploy.

## Commands

Use pnpm.

- `pnpm build`: runs the tests, then `astro build`, then writes `dist/_redirects`. Any failing step stops the build, which is what blocks a bad deploy on Netlify.
- `pnpm test`: runs the tests with Node's built-in runner (`node --test`, no test dependencies).
- One test file: `node --test scripts/redirects.test.mjs`
- One test by name: `node --test --test-name-pattern="same slug"`

## Architecture

`src/data/links.json` is the only data source. It has a `profile` (name, bio) and a `links` array. A link entry can do two things, independently:

- `listed: true` shows it on the link page (`src/pages/index.astro`, which imports the JSON directly).
- `slug` makes `/<slug>` redirect to its `url`.

The redirect pipeline lives in `scripts/`:

- `redirects.mjs`: `buildRedirects(links)` is a pure function that returns `{ rules, errors }`. It validates slugs (lowercase `a-z`, `0-9`, `-`, with no hyphen at either end), rejects duplicate slugs, and requires absolute `http(s)` URLs.
- `build-redirects.mjs`: runs after `astro build`, calls `buildRedirects` on `links.json`, prints the errors and exits 1 if there are any, and otherwise writes `dist/_redirects`.
- `redirects.test.mjs`: unit tests for `buildRedirects`, plus a test that checks the real `links.json` for duplicate slugs.

Things to keep in mind when changing this:

- All redirects are 302 (temporary) on purpose, so a slug can later point somewhere else without browsers caching the old target.
- `_redirects` is written straight into `dist/` after the build, never into `public/`, so nothing generated gets committed.
- On Netlify, a real file or page at a path takes priority over a redirect rule. Adding a page whose path matches an existing slug silently breaks that short link.

## Security

- `public/_headers` sets a strict Content-Security-Policy (`default-src 'none'`, same-origin styles and images only). Adding JavaScript, an inline style or any third-party resource means updating the CSP too. `build.inlineStylesheets: 'never'` in `astro.config.mjs` exists so CSS stays in files that `style-src 'self'` allows.
- `pnpm-workspace.yaml` holds the supply-chain settings: `minimumReleaseAge` (3 days) and `trustPolicy: no-downgrade`. Dependabot's `cooldown` in `.github/dependabot.yml` must stay at or above `minimumReleaseAge`.
- pnpm is pinned through `packageManager` in `package.json` and recorded in the lockfile. Netlify and CI both use that version.
- GitHub Actions in `.github/workflows/` are pinned to commit SHAs with a version comment. Keep that form when adding or changing one.
