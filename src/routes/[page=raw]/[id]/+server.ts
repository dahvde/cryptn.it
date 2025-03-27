import { env } from '$env/dynamic/private';
import { pb, TEXTResponse } from '$lib';
import { UrlStore } from '$lib/crypt.js';

export async function GET(req) {
	try {
		const password = req.url.searchParams.get('password') || req.url.searchParams.get('p') || '';
		const splitUrl = req.url.pathname.split('/');
		const row = await pb.collection(env.DBCRYPT!).getFirstListItem(
			pb.filter('hash = {:search}', {
				search: UrlStore.base64(await UrlStore.hash(splitUrl[2]))
			})
		);

		if (row.zk) throw '@zk is not allowing this';

		const [iv, txt] = row.text.split(':');

		const url = new UrlStore(splitUrl[2], txt, row.title, row.salt, iv, password);
		url.crypto = crypto;
		await url.deriveKey();

		return TEXTResponse(UrlStore.decompress((await url.decrypt(url.text)) as ArrayBuffer), 200);
	} catch (err) {
		if (import.meta.env.DEV) {
			console.error(err);
		}

		if (typeof err === 'string' && err.startsWith('@')) {
			return TEXTResponse(err, 400);
		}

		return TEXTResponse('Resource not found', 400);
	}
}
