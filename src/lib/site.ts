import { baseLocale, type Locale } from "$codegen/paraglide/runtime.js";

/**
 * Public origin of the deployed site, without a trailing slash (e.g. "https://example.dev").
 * Crawlers ignore relative canonical, hreflang and og:image URLs, so those tags are only
 * rendered once this is set.
 */
export const siteUrl = "https://antoinegourhand.com";

/** Absolute URL of the page in a given locale: the base locale at the root, others under their prefix. */
export function pageUrl(locale: Locale): string {
	return `${siteUrl}/${locale === baseLocale ? "" : `${locale}/`}`;
}
