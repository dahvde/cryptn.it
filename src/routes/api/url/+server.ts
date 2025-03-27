import { env } from '$env/dynamic/private';
import { APIError, APISuccess, pb } from '$lib';
import { MAXPRIVATEHASH, MINPRIVATEHASH } from '$lib/settings';
import { UrlStore } from '$lib/crypt';
import type { RequestEvent } from '@sveltejs/kit';
import moment from 'moment';
import { genUrl } from '$lib/utils';

interface Body {
	length: number;
}

async function validateBody(req: Body) {
	try {
		if (typeof req.length != 'number') throw '@length not valid';
		if (req.length > MAXPRIVATEHASH) throw '@length too large';
		if (req.length < MINPRIVATEHASH) throw '@length too little';
	} catch (err) {
		return err;
	}
}

async function isUnique(url: string) {
	// @ts-ignore
	const data = await pb
		.collection(env.DBCRYPT!)
		.getFirstListItem(
			pb.filter('hash = {:search}', {
				search: Buffer.from(await UrlStore.hash(url)).toString('base64')
			})
		)
		.then(() => false)
		.catch(() => true);

	return data;
}

export async function POST(req: RequestEvent) {
	try {
		let body: Body = await req.request.json().catch(() => {
			return { error: '@ALL formatting error' };
		});

		let err = await validateBody(body);

		if (err) throw err;

		let attempts = 0;
		let url = '';

		do {
			if (attempts > 15) throw '@url could not be generated';
			url = genUrl(body.length) as string;
			attempts++;
		} while (!(await isUnique(url)));

		let data = {
			url: Buffer.from(await UrlStore.hash(url)).toString('base64'),
			length: body.length,
			salt: Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64'),
			iv: Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64'),
			expire: moment().add(1, 'minute').toDate()
		};

		// @ts-ignore
		await pb.collection(env.DBRESERVED).create(data);

		return APISuccess({ url, salt: data.salt, iv: data.iv }, 200);
	} catch (err) {
		if (import.meta.env.DEV) {
			console.error(err);
		}

		if (typeof err === 'string' && err.startsWith('@')) {
			return APIError(err, 400);
		}

		return APIError('Error', 400);
	}
}
