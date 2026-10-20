# Personal Links - JHT.re

A personal link-in-bio page and URL shortener, built with [Astro](https://astro.build) and hosted on Netlify on a custom domain.

Every link lives in one file, `src/data/links.json`. An entry can show up on the link page, work as a short URL (`/<slug>`), or both. At build time the slugs become Netlify `_redirects` rules, so short links are handled at the CDN edge, with no server, database or serverless functions.

## Adding or changing a link

Edit `src/data/links.json`:

```json
{
  "title": "GitHub",
  "url": "https://github.com/joakimtveter/",
  "slug": "gh",
  "listed": true
}
```

| Field    | Required | Meaning                                                  |
| :------- | :------- | :------------------------------------------------------- |
| `title`  | yes      | Text shown on the link page                              |
| `url`    | yes      | Where the link goes. Must be an absolute `http(s)` URL   |
| `slug`   | no       | Makes `/<slug>` redirect to `url`                        |
| `listed` | yes      | `true` shows the link on the page, `false` hides it      |

So a link can be on the page only (leave out `slug`), a short URL only (`"listed": false`), or both.

The name and bio at the top of the page come from `profile` in the same file.

Then commit and push. Netlify rebuilds and deploys automatically.

### Slug rules

- Lowercase letters, digits and hyphens only, with no hyphen at the start or end.
- Each slug can only be used once.
- Redirects are **302 (temporary)**, so you can point a slug somewhere new at any time without browsers holding on to the old target.
- A real page at the same path takes priority over a redirect, so don't add a page that shares a name with an existing slug.

If any of these rules is broken, the build fails with a list of the problems and Netlify keeps the last working deploy live.

## Commands

Run from the project root:

| Command        | Action                                                           |
| :------------- | :--------------------------------------------------------------- |
| `pnpm install` | Install dependencies                                             |
| `pnpm dev`     | Start the dev server at `localhost:4321`                         |
| `pnpm test`    | Run the tests                                                    |
| `pnpm build`   | Run the tests, build the site to `dist/` and write `dist/_redirects` |
| `pnpm preview` | Preview the built site locally                                   |

Short links only work on Netlify. The local dev and preview servers ignore `_redirects`. To check the generated rules, run `pnpm build` and look at `dist/_redirects`.

## How it works

- `src/pages/index.astro` renders the link page from `links.json`.
- `scripts/redirects.mjs` validates the links and turns slugs into redirect rules.
- `scripts/build-redirects.mjs` runs after `astro build` and writes `dist/_redirects`.
- `scripts/redirects.test.mjs` tests the validation and checks the real `links.json`, using Node's built-in test runner.

## Deploying

Connect the GitHub repo to Netlify. It detects Astro and builds with `pnpm build`, publishing `dist/`. If you set a custom build command, it must be `pnpm build`, not `astro build`, or the redirects won't be generated.
