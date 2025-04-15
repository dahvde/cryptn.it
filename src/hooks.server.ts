// src/hooks.server.js
import { getStore, TEXTResponse, type QueryData } from '$lib';
import { error, text } from '@sveltejs/kit';
import { UrlStoreDecrypt, UrlStore } from '$lib/crypt';

const routes = ['/api', '/raw', '/r/'];
const validUrl = /^([A-Z0-9a-z]+$)/;

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	if (event.url.pathname === '/') return resolve(event);
	if (routes.find((e) => event.url.pathname.startsWith(e))) return resolve(event);

	const userAgent = event.request.headers.get('user-agent')?.toLowerCase() || '';
	const isBot =
		userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('curl');

	// if (!validUrl.test(event.url.pathname.substring(1))) throw error(400, "Not Found")

	if (isBot) {
		try {
			let password =
				event.url.searchParams.get('p') || event.url.searchParams.get('password') || '';

			const dbRes = await getStore(
				UrlStore.base64(await UrlStore.hash(event.url.pathname.substring(1))),
				'cli'
			);

			if (!dbRes.ok) throw dbRes.data.text;

			if (dbRes.data.zk) throw 'This is not allowed';

			const [iv, encText] = dbRes.data.text.split(':');
			const decrypted = await UrlStoreDecrypt(
				event.url.pathname,
				encText,
				dbRes.data.title as string,
				dbRes.data.salt as string,
				iv,
				password
			);

			if (typeof decrypted === 'string') throw decrypted;

			return text(decrypted[0], {
				headers: {
					'Content-Type': 'text-plain'
				}
			});
		} catch (err) {
			return error(400, typeof err === 'string' ? err : 'Unexpected error');
		}
	}

	return resolve(event);
}

// Disable all error logging
export function handleError({ error, event }) {
	// @ts-ignore
	return { message: error.status };
}

declare global {
	namespace App {
		interface Platform {}
	}
}

export {};
