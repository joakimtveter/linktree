import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildRedirects } from './redirects.mjs';

test('rejects two links with the same slug', () => {
	const { errors } = buildRedirects([
		{ title: 'First', url: 'https://example.com/a', slug: 'same' },
		{ title: 'Second', url: 'https://example.com/b', slug: 'same' },
	]);

	assert.deepEqual(errors, ['"Second": duplicate slug "same"']);
});

test('links.json has no duplicate slugs', () => {
	const { links } = JSON.parse(
		readFileSync(new URL('../src/data/links.json', import.meta.url), 'utf8'),
	);
	const { errors } = buildRedirects(links);

	assert.deepEqual(
		errors.filter((error) => error.includes('duplicate slug')),
		[],
	);
});
