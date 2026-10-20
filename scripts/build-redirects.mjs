// Turns slugs in src/data/links.json into Netlify _redirects rules.
// Runs after `astro build` and writes dist/_redirects.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildRedirects } from './redirects.mjs';

const LINKS_FILE = new URL('../src/data/links.json', import.meta.url);
const OUT_FILE = new URL('../dist/_redirects', import.meta.url);

const { links } = JSON.parse(readFileSync(LINKS_FILE, 'utf8'));
const { rules, errors } = buildRedirects(links);

if (errors.length > 0) {
	console.error(`links.json has ${errors.length} error(s):`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}

writeFileSync(OUT_FILE, rules.join('\n') + '\n');
console.log(`Wrote ${rules.length} redirect(s) to dist/_redirects`);
