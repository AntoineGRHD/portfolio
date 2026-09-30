#!/usr/bin/env node
// Prints the built /cv page to one-page A4 PDFs, for each locale and theme, into build/cv/.
// Run after `npm run build` (or use `npm run cv`, which does both). Needs Chrome: override the
// binary with CHROME=... Fails if the content no longer fits on a single page.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildDir, withBrowser } from "./lib/headless.mjs";

const outDir = join(buildDir, "cv");
const pages = [
	{ locale: "en", path: "/cv/" },
	{ locale: "fr", path: "/fr/cv/" },
];
const themes = ["light", "dark"];

// the site links to these names through cvPath in src/lib/site.ts: keep the two in sync
const fileName = (locale, theme) => `antoine-gourhand-cv-${locale}-${theme}.pdf`;

await withBrowser(async ({ page, origin }) => {
	// measure with the same media the PDF is printed with
	await page.send("Emulation.setEmulatedMedia", { media: "print" });
	await mkdir(outDir, { recursive: true });

	for (const { locale, path } of pages) {
		for (const theme of themes) {
			await page.send("Page.navigate", { url: origin + path });
			await page.waitFor(`document.querySelector(".cv")?.dataset.ready === "true"`, `${path} to be ready`);
			await page.evaluate(`document.querySelector(".cv").dataset.theme = ${JSON.stringify(theme)}`);

			// room left between the lowest content of either column and the page's bottom margin
			const room = await page.evaluate(`(() => {
				const cv = document.querySelector(".cv");
				const limit = cv.getBoundingClientRect().bottom - parseFloat(getComputedStyle(cv).paddingBottom);
				const ends = [...cv.querySelectorAll(".side > :last-child, .main > :last-child")].map((el) => el.getBoundingClientRect().bottom);
				return limit - Math.max(...ends);
			})()`);
			const millimetres = Math.round((Math.abs(room) * 25.4) / 96);
			if (room < 0) {
				throw new Error(`The ${locale} CV overflows one A4 page by about ${millimetres} mm. Shorten the content.`);
			}
			if (theme === themes[0]) console.log(`${locale}: fits with ${millimetres} mm to spare`);

			const { data } = await page.send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true });
			const file = join(outDir, fileName(locale, theme));
			await writeFile(file, Buffer.from(data, "base64"));
			console.log(`wrote ${file}`);
		}
	}
});
