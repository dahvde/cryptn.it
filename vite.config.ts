import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		minify: 'esbuild',
		sourcemap: false
	},

	server: {
		port: 3030
	}
});
