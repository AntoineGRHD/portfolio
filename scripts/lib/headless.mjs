// Shared by the scripts that render the built site with headless Chrome (CV PDFs, preview images):
// a static server over build/, as GitHub Pages serves it, and a Chrome driven over the DevTools
// protocol. No dependency: Chrome is the system one (override with CHROME=...).
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve, sep } from "node:path";

export const buildDir = resolve("build");

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

export const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// A minimal static server over build/, resolving directory URLs to their index.html.
function serveBuild() {
	const server = createServer(async (request, response) => {
		let path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
		if (path.endsWith("/")) path += "index.html";
		const file = join(buildDir, path);
		if (!file.startsWith(buildDir + sep)) {
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
		"--hide-scrollbars",
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
		const { result, exceptionDetails } = await send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true,
		});
		if (exceptionDetails) throw new Error(exceptionDetails.text);
		return result.value;
	};
	const waitFor = async (expression, what) => {
		for (let attempt = 0; attempt < 100; attempt++) {
			if (await evaluate(expression)) return;
			await sleep(100);
		}
		throw new Error(`Timed out waiting for ${what}.`);
	};
	return { send, evaluate, waitFor, close: () => socket.close() };
}

/**
 * Serves build/, starts Chrome and hands `work` a DevTools page plus the server's origin; cleans
 * everything up afterwards, even if `work` throws.
 */
export async function withBrowser(work) {
	const server = await serveBuild();
	const origin = `http://127.0.0.1:${server.address().port}`;
	const profile = await mkdtemp(join(tmpdir(), "portfolio-chrome-"));
	let chrome;
	try {
		const launched = await launchChrome(profile);
		chrome = launched.chrome;
		const page = await connect(launched.url);
		await page.send("Page.enable");
		try {
			await work({ page, origin });
		} finally {
			page.close();
		}
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
}
