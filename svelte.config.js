import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		// GitHub Pages serves 404.html for any unknown path; it boots the app, which renders +error.svelte
		adapter: adapter({ fallback: '404.html' }),
		prerender: {
			// nothing links to these, so the crawler would never find them: the French page is
			// only reached through the locale switch, the other two are read by search engines
			entries: ['*', '/fr', '/robots.txt', '/sitemap.xml']
		},
		alias: {
			'$codegen': './src/codegen',
            '$data': './src/data',
		}
	}
};

export default config;
