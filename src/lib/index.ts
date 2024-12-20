import { databaseURI } from '$env/static/private';
import PocketBase from 'pocketbase';

export const pb = new PocketBase(databaseURI);

export function genURI(len = 4) {
	const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let res = [];

	for (let i = 0; i < len; i++) {
		res.push(alpha[Math.floor(Math.random() * alpha.length)]);
	}

	return res.join('');
}

export function APIResponse(message: string, status: number) {
	return new Response(JSON.stringify({ message, status }), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
