#!/usr/bin/env node
// Prints the built /cv page to one-page A4 PDFs, for each locale and theme, into build/cv/.
// Run after `npm run build` (or use `npm run cv`, which does both). Needs Chrome: override the
// binary with CHROME=... Fails if the content no longer fits on a single page.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";

const root = resolve("build");
const outDir = join(root, "cv");
const pages = [
	{ locale: "en", path: "/cv/" },
	{ locale: "fr", path: "/fr/cv/" },
];
const themes = ["light", "dark"];
const contentTypes = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript",
	".css": "text/css",
	".json": "application/json",
	".woff2": "font/woff2",
	".svg": "image/svg+xml",
	".png": "image/png",
	".webp": "image/webp",
};

// the site links to these names through cvPath in src/lib/site.ts: keep the two in sync
const fileName = (locale, theme) => `antoine-gourhand-cv-${locale}-${theme}.pdf`;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// A minimal static server over build/, resolving directory URLs to their index.html.
function serveBuild() {
	const server = createServer(async (request, response) => {
		let path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
		if (path.endsWith("/")) path += "index.html";
		const file = join(root, path);
		if (!file.startsWith(root + sep)) {
			response.writeHead(403).end();
			return;
		}
		try {
			const body = await readFile(file);
			response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" });
			response.end(body);
		} catch {
			response.writeHead(404).end();
		}
	});
	return new Promise((ready) => server.listen(0, "127.0.0.1", () => ready(server)));
}

async function launchChrome(profile) {
	const args = [
		"--headless=new",
		"--disable-gpu",
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-extensions",
		`--user-data-dir=${profile}`,
		"--remote-debugging-port=0",
		"about:blank",
	];
	// CI runners restrict the sandbox's user namespaces; the only page loaded is our own build
	if (process.env.CI) args.unshift("--no-sandbox");
	const chrome = spawn(process.env.CHROME ?? "google-chrome", args, { stdio: "ignore" });

	// Chrome writes the port it picked to DevToolsActivePort once it listens
	for (let attempt = 0; attempt < 100; attempt++) {
		try {
			const port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0];
			const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
			const page = targets.find((target) => target.type === "page");
			if (page) return { chrome, url: page.webSocketDebuggerUrl };
		} catch {
			// not up yet
		}
		await sleep(100);
	}
	chrome.kill();
	throw new Error("Chrome did not start (set CHROME to its binary if it is not google-chrome).");
}

async function connect(url) {
	const socket = new WebSocket(url);
	await new Promise((open, fail) => {
		socket.onopen = open;
		socket.onerror = () => fail(new Error("Could not connect to Chrome."));
	});
	let nextId = 0;
	const pending = new Map();
	socket.onmessage = (event) => {
		const message = JSON.parse(event.data);
		const request = pending.get(message.id);
		if (!request) return;
		pending.delete(message.id);
		if (message.error) request.fail(new Error(message.error.message));
		else request.done(message.result);
	};
	const send = (method, params = {}) =>
		new Promise((done, fail) => {
			const id = ++nextId;
			pending.set(id, { done, fail });
			socket.send(JSON.stringify({ id, method, params }));
		});
	const evaluate = async (expression) => {
		const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true });
		if (exceptionDetails) throw new Error(exceptionDetails.text);
		return result.value;
	};
	return { send, evaluate, close: () => socket.close() };
}

async function waitFor(evaluate, expression, what) {
	for (let attempt = 0; attempt < 100; attempt++) {
		if (await evaluate(expression)) return;
		await sleep(100);
	}
	throw new Error(`Timed out waiting for ${what}.`);
}

const server = await serveBuild();
const origin = `http://127.0.0.1:${server.address().port}`;
const profile = await mkdtemp(join(tmpdir(), "cv-chrome-"));
let chrome;

try {
	const launched = await launchChrome(profile);
	chrome = launched.chrome;
	const page = await connect(launched.url);
	await page.send("Page.enable");
	// measure with the same media the PDF is printed with
	await page.send("Emulation.setEmulatedMedia", { media: "print" });
	await mkdir(outDir, { recursive: true });

	for (const { locale, path } of pages) {
		for (const theme of themes) {
			await page.send("Page.navigate", { url: origin + path });
			await waitFor(page.evaluate, `document.querySelector(".cv")?.dataset.ready === "true"`, `${path} to be ready`);
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
	page.close();
} finally {
	// Chrome keeps writing its profile until it has actually exited
	if (chrome && chrome.exitCode === null) {
		const exited = new Promise((done) => chrome.once("exit", done));
		chrome.kill();
		await exited;
	}
	server.close();
	await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
