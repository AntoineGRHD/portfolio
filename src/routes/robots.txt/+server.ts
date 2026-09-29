import { siteUrl } from "$lib/site";

export const prerender = true;

export function GET(): Response {
	const lines = ["User-agent: *", "Allow: /"];
	if (siteUrl) {
		lines.push("", `Sitemap: ${siteUrl}/sitemap.xml`);
	}
	return new Response(lines.join("\n") + "\n", { headers: { "Content-Type": "text/plain" } });
}
