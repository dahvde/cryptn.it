import { env } from '$env/dynamic/private';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import PocketBase from 'pocketbase';

export const pb = new PocketBase(`${env.dbURI}:${env.dbPORT}`);

export async function genURI(len = 4) {
	return await cryptoRandomStringAsync({ length: len, type: 'alphanumeric' });
}

export function APIResponse(message: string, status: number) {
	return new Response(JSON.stringify({ message, status }), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
