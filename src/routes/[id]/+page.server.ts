import { getStore, type QueryResponse } from '$lib';
import { error } from '@sveltejs/kit';
import { UrlStore } from '$lib/crypt.js';

export async function load(req) {
	const hash = UrlStore.base64(await UrlStore.hash(req.url.pathname.substring(1)));
	const dbRes: QueryResponse = await getStore(hash);

	if (!dbRes.ok) {
		error(404, 'Not found');
	}

	return dbRes.data;
}
