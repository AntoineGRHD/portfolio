import { baseLocale, locales } from "$codegen/paraglide/runtime.js";
import { pageUrl } from "$lib/site";

export const prerender = true;

/* Each locale's page lists every translation, itself included, as Google expects. */
export function GET(): Response {
	const alternates = [
		...locales.map((locale) => `\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${pageUrl(locale)}"/>`),
		`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(baseLocale)}"/>`,
	].join("\n");
	const urls = locales.map((locale) => `\t<url>\n\t\t<loc>${pageUrl(locale)}</loc>\n${alternates}\n\t</url>`).join("\n");
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
	return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
