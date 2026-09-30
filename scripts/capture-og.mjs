#!/usr/bin/env node
// Captures the hero of the built site as the 1200x630 social preview image (og:image), one per
// locale, into build/og-<locale>.png. Runs on every deploy after the build, so the images always
// match the live hero. Locally: `npm run capture:og` (builds first). Needs Chrome (CHROME=...).
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildDir, sleep, withBrowser } from "./lib/headless.mjs";

// the page head points og:image at /og-<locale>.png (src/routes/+page.svelte)
const pages = [
	{ locale: "en", path: "/" },
	{ locale: "fr", path: "/fr/" },
];

await withBrowser(async ({ page, origin }) => {
	await page.send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });

	for (const { locale, path } of pages) {
		await page.send("Page.navigate", { url: origin + path });
		await page.waitFor(`document.readyState === "complete"`, `${path} to load`);
		// the hero bands are drawn on a canvas once the page has laid out, and the text needs its fonts
		await page.evaluate(`document.fonts.ready.then(() => true)`);
		await page.waitFor(`document.querySelector(".hero canvas")?.width > 0`, `${path} hero backdrop`);
		await sleep(300);

		const { data } = await page.send("Page.captureScreenshot", { format: "png" });
		const file = join(buildDir, `og-${locale}.png`);
		await writeFile(file, Buffer.from(data, "base64"));
		console.log(`wrote ${file}`);
	}
});
