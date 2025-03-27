import { APIError, APISuccess, pb, validHash } from '$lib';
import { env } from '$env/dynamic/private';
import settings from '$lib/settings.js';
import moment from 'moment';

type RequestBody = {
	text: string;
	expire: number;
	burn: boolean;
	public: boolean;
	zk: boolean;
	error?: string;
	url: string;
	urlLength?: string;
	title: string;
	password: boolean;
	format: string;
};

type RecordBody = {
	text: string | null;
	hash: string | null;
	burn: boolean;
	title: string | null;
	expire: Date | null;
	salt: string;
	zk: boolean;
	password: boolean;
	format: string;
};

async function validatePayload(body: RequestBody) {
	try {
		if (body.error) throw body.error;

		if (typeof body.expire != 'number') throw '@expire does not exist or invalid type';
		if (body.expire < 0) throw '@expire invalid';
		if (body.expire > settings.MAXEXPIRE) throw '@expire too large';

		if (typeof body.urlLength != 'number') throw '@hashLength does not exist or invalid type';
		if (body.urlLength > settings.MAXPRIVATEHASH) throw '@hashLength too large';
		if (body.urlLength < settings.MINPRIVATEHASH) throw '@hashLength too little';

		if (body.urlLength < 9) {
			if (body.expire > settings.MAXSHORTHASHEXPIRE) throw '@expire too long';
			if (body.expire < settings.MINSHORTHASHEXPIRE) throw '@expire too short';
			if (body.urlLength == 4 && body.expire > settings.MAXSMALLESTHASHEXPIRE)
				throw '@urlLength/expire are not in acceptable range';
		}

		if (typeof body.title != 'string') throw '@title does not exist';
		if (body.title.length > settings.MAXENCRYPTEDTITLELENGTH) throw '@title too long';

		if (typeof body.text != 'string') throw '@text does not exist or invalid type';
		if (body.text.length == 0) throw '@text payload is empty';
		if (body.text.length > settings.MAXCHARS) throw '@text payload too large';

		if (body.public) {
			if (body.zk) throw '@public/zk not allowed together';
			if (body.urlLength > settings.MAXPUBLICHASH || body.urlLength < settings.MAXPRIVATEHASH)
				throw '@public/urlLength not in acceptable range';
		}

		if (body.password && typeof body.password != 'boolean') throw '@password invalid type';

		if (typeof body.burn != 'boolean') throw '@burn does not exist or invalid type';

		if (!settings.ALLOWEDFORMATS.includes(body.format)) throw '@format not allowed';
	} catch (err) {
		return err;
	}

	return null;
}

export async function POST(req) {
	try {
		let body: RequestBody = await req.request.json().catch(() => {
			return { error: '@ALL formatting error' };
		});

		let reservedUrl = await pb.collection(env.DBRESERVED!).getFirstListItem(`url="${body.url}"`);

		if (!reservedUrl) throw '@url not valid';

		if (!(await pb.collection(env.DBRESERVED!).delete(reservedUrl.id))) throw '@url not valid';

		body.urlLength = reservedUrl.length;

		const error = (await validatePayload(body)) as string | null;

		if (error) throw error;

		if (body.expire == 0) {
			body.expire = settings.MAXEXPIRE;
		}

		let dbData: RecordBody = {
			title: body.title,
			text: `${reservedUrl.iv}:${body.text}`,
			hash: reservedUrl.url,
			burn: body.burn,
			expire: moment().add(body.expire, 'minutes').toDate(),
			zk: body.zk,
			salt: reservedUrl.salt,
			password: body.password || false,
			format: body.format || 'raw'
		};

		dbData.hash = reservedUrl.url;

		await pb.collection(env.DBCRYPT!).create(dbData);

		return APISuccess({ message: 'Successfully created text store' }, 200);
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
