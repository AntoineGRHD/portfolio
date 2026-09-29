import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		// GitHub Pages serves 404.html for any unknown path; it boots the app, which renders +error.svelte
		adapter: adapter({ fallback: '404.html' }),
		prerender: {
			// nothing links to these, so the crawler would never find them: the French page is
			// only reached through the locale switch, robots and sitemap are read by search engines,
			// and the CV pages are only printed to PDF by scripts/build-cv.mjs
			entries: ['*', '/fr', '/robots.txt', '/sitemap.xml', '/cv', '/fr/cv'],
			// the CV PDFs are printed after the build, so the crawler cannot find them yet;
			// every other broken link still fails the build
			handleHttpError: ({ path, message }) => {
				if (/^\/cv\/[^/]+\.pdf$/.test(path)) return;
				throw new Error(message);
			}
		},
		alias: {
			'$codegen': './src/codegen',
            '$data': './src/data',
		}
	}
};

export default config;
