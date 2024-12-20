import { genURI, APIResponse, pb } from '$lib';
import settings from "$lib/settings.js"
import CryptoJS from 'crypto-js';

type RequestBody = {
	input: string;
	password?: string;
	hashLength: number;
	error?: string;
};

type RecordBody = {
	text: string | null;
	hash: string | null;
	password: string | null;
};

const maxPayload = 20000;

async function validateBody(body: RequestBody) {
	try {
		if (body.error) throw body.error;

		if (body.password) {
			if (typeof body.password != 'string') throw '@password does not exist or invalid type';
			if (body.password.length > 24) throw '@password too long';
			if (body.password.length == 0) throw '@password does not exist';
		}

		if (typeof body.input != 'string') throw '@input does not exist or invalid type';
		if (body.input.length > maxPayload) throw '@input payload too large';

		if (typeof body.hashLength != 'number') throw '@hashLength does not exist or invalid type';
		if (body.hashLength > settings.maxHash) throw '@hashLength too large';
		if (body.hashLength < settings.minHash) throw '@hashLength too small';
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

		const error = (await validateBody(body)) as string | null;
		let hashlet = [genURI(body.hashLength)];

		if (error) {
			return APIResponse(error, 400);
		}

		let dbData: RecordBody = {
			text: null,
			hash: null,
			password: null
		};

		dbData.hash = CryptoJS.SHA256(hashlet[0]).toString();

		if (body.password) {
			dbData.password = CryptoJS.SHA256(body.password).toString();
			hashlet.push(body.password);
		}

		dbData.text = CryptoJS.AES.encrypt(body.input, hashlet.join('')).toString();
		await pb.collection('txt').create(dbData);

		return APIResponse(hashlet[0], 200);
	} catch (err) {
		// @ts-ignore
		console.error(err.response);
		return APIResponse('Error', 400);
	}
}
