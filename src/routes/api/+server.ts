import { genURI, APIResponse, pb } from '$lib';
import { env } from '$env/dynamic/private';
import settings from '$lib/settings.js';
import CryptoJS from 'crypto-js';
import moment from 'moment';

type RequestBody = {
	input: string;
	password?: string;
	hashLength: number;
	expire: number;
	burn: boolean;
	error?: string;
};

type RecordBody = {
	text: string | null;
	hash: string | null;
	password: boolean | null;
	burn: boolean;
	expire: Date | null;
};

const maxPayload = 20000;
const maxExpire = 60 * 24 * 30;
const minExpire = 1;

async function validatePayload(body: RequestBody) {
	try {
		if (body.error) throw body.error;

		if (body.password) {
			if (typeof body.password != 'string') throw '@password does not exist or invalid type';
			if (body.password.length > 24) throw '@password too long';
			if (body.password.length == 0) throw '@password does not exist';
		}

		if (typeof body.expire != 'number') throw '@expire does not exist or invalid type';
		if (body.expire > maxExpire) throw '@expire too long';
		if (body.expire < minExpire) throw '@expire too short';

		if (typeof body.input != 'string') throw '@input does not exist or invalid type';
		if (body.input.length == 0) throw '@input payload is empty';
		if (body.input.length > maxPayload) throw '@input payload too large';

		if (typeof body.hashLength != 'number') throw '@hashLength does not exist or invalid type';
		if (body.hashLength > settings.maxHash) throw '@hashLength too large';
		if (body.hashLength < settings.minHash) throw '@hashLength too small';

		if (typeof body.burn != 'boolean') throw '@burn does not exist or invalid type';

		// Special cases
		if (body.hashLength == 4 && body.expire > 60 * 48)
			throw '@hashLength/expire are not in acceptable range';
	} catch (err) {
		console.log(err);
		return err;
	}

	return null;
}

export async function POST(req) {
	try {
		let body: RequestBody = await req.request.json().catch(() => {
			return { error: '@ALL formatting error' };
		});

		const error = (await validatePayload(body)) as string | null;
		let hashlet = [await genURI(body.hashLength)];

		if (error) {
			return APIResponse(error, 400);
		}

		let dbData: RecordBody = {
			text: null,
			hash: null,
			password: body.password ? true : false,
			burn: body.burn,
			expire: moment().add(body.expire, 'minutes').toDate()
		};

		dbData.hash = CryptoJS.SHA256(hashlet[0]).toString();

		if (body.password) {
			hashlet.push(body.password);
		}

		dbData.text = CryptoJS.AES.encrypt(body.input, hashlet.join('')).toString();

		// @ts-ignore
		await pb.collection(env.dbCollection).create(dbData);

		return APIResponse(hashlet[0], 200);
	} catch (err) {
		// @ts-ignore
		console.error(err);
		return APIResponse('Error', 400);
	}
}
