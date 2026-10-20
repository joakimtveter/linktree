// Validates links and turns their slugs into Netlify _redirects rules.

// Lowercase letters, digits and hyphens, not starting or ending with a hyphen.
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function buildRedirects(links) {
	const errors = [];
	const seen = new Set();
	const rules = [];

	for (const link of links) {
		if (link.slug === undefined) continue;

		const { slug, url } = link;
		const label = `"${link.title ?? slug}"`;

		if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
			errors.push(`${label}: invalid slug "${slug}" (use a-z, 0-9 and -)`);
			continue;
		}
		if (seen.has(slug)) {
			errors.push(`${label}: duplicate slug "${slug}"`);
			continue;
		}
		seen.add(slug);

		if (!URL.canParse(url) || !/^https?:$/.test(new URL(url).protocol)) {
			errors.push(`${label}: url must be an absolute http(s) URL, got "${url}"`);
			continue;
		}

		rules.push(`/${slug}  ${url}  302`);
	}

	return { rules, errors };
}
