import { APIResponse, pb } from '$lib';
import { env } from '$env/dynamic/private';
import CryptoJS from 'crypto-js';

export async function GET(req) {
	const id = req.params.id;
	const query = req.url.searchParams;

	if (!id) return APIResponse('Error', 302);
	const hashed = CryptoJS.SHA256(id).toString();
	let key = id;

	if (query.has('password')) {
		key += query.get('password');
	} else if (query.has('p')) {
		key += query.get('p');
	}

	try {
		// @ts-ignore
		const query = await pb.collection(env.dbCollection).getFullList({
			filter: pb.filter('hash ~ {:search}', { search: hashed })
		});

		if (!query.length) throw Error('File not found');

		const decrypted = CryptoJS.AES.decrypt(query[0].text, key).toString(CryptoJS.enc.Utf8);

		if (!decrypted.length) throw Error('File not found');

		if (query[0].burn) {
			// @ts-ignore
			await pb.collection(env.dbCollection).delete(query[0].id);
		}

		return new Response(decrypted, { status: 200 });
	} catch (err) {
		console.log(err);
		return APIResponse('Data does not exist', 404);
	}
}
