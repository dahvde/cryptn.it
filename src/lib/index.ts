import { env } from '$env/dynamic/private';
import { cryptoRandomStringAsync } from 'crypto-random-string';
import PocketBase from 'pocketbase';

export type QueryData = {
	title?: string;
	text: string;
	salt?: string;
	password?: boolean;
	zk?: boolean;
	format?: string;
	created?: Date;
};

export type Source = 'browser' | 'cli';

export type QueryResponse = {
	ok: boolean;
	data: QueryData;
};

// export const validHash = /^([A-Z0-9a-z]+$)/;

export const validHash = /\b[A-Fa-f0-9]{64}\b/;

export const pb = new PocketBase(`${env.DBURI}:${env.DBPORT}`);

pb.autoCancellation(false);

export const routesReserved = ['/api', '/raw'];

export async function genURI(len = 4) {
	return await cryptoRandomStringAsync({ length: len, type: 'alphanumeric' });
}

export function APISuccess(json: object, status: number) {
	return new Response(JSON.stringify({ data: { ...json }, status }), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export function APIError(message: string, status: number) {
	return new Response(JSON.stringify({ message, status }), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

export function TEXTResponse(message: string, status: number) {
	return new Response(message, {
		status,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}

export async function getStore(key: string, source: Source = 'browser'): Promise<QueryResponse> {
	try {
		// @ts-ignore
		const query = await pb
			.collection(env.DBCRYPT!)
			.getFirstListItem(pb.filter('hash = {:search}', { search: key }));

		if (!query) throw Error('File not found');

		if (source === 'cli') {
			if (query.zk) throw Error('This is not allowed');
		}

		if (query.burn) {
			// @ts-ignore
			pb.collection(env.DBCRYPT).delete(query.id);
		}

		return {
			ok: true,
			data: {
				title: query.title,
				text: query.text,
				salt: query.salt,
				password: query.password,
				format: query.format,
				created: new Date(query.created),
				zk: query.zk
			}
		};
	} catch (err) {
		return {
			ok: false,
			data: { text: 'Data does not exist' }
		};
	}
}
