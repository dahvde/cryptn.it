const routes = ['/api'];

/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
	if (url.pathname == '/') return url.pathname;
	if (routes.find((e) => url.pathname.startsWith(e))) return url.pathname;

	return '/raw' + url.pathname;
}
