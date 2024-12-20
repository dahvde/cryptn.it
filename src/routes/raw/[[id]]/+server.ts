import { APIResponse, pb } from '$lib';
import CryptoJS from 'crypto-js';

export async function GET(req) {
	const id = req.params.id;
	const query = req.url.searchParams;

	if (!id) return APIResponse('Error', 302);
	const hashed = CryptoJS.SHA256(id).toString();
	let key = id;

	if (query.has('password')) {
		key += query.get('password');
	}

	try {
		const query = await pb.collection('txt').getFullList({
			filter: pb.filter('hash ~ {:search}', { search: hashed })
		});

		if (!query.length) throw Error('File not found');

		const decrypted = CryptoJS.AES.decrypt(query[0].text, key).toString(CryptoJS.enc.Utf8);
		console.log(decrypted);

		return new Response(decrypted, { status: 200 });
	} catch (err) {
		console.error(err);
		return APIResponse('File not found', 400);
	}
}
