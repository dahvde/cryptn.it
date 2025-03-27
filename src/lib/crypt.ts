import { browser } from '$app/environment';
import { Buffer } from 'buffer';
import lz from 'lz-string';

export class UrlStore {
	static encoder = new TextEncoder();
	crypto: Crypto;
	text: string;
	title: string;
	zk: boolean;
	public: boolean;
	url: string;
	salt: Uint8Array;
	iv: Uint8Array;
	password: string;
	burn?: boolean;
	key?: CryptoKey;
	expire: number;

	constructor(
		url: string,
		text: string,
		title: string,
		salt: string | Uint8Array,
		iv: string | Uint8Array,
		password?: string,
		expire?: number,
		zk?: boolean,
		pub?: boolean,
		burn?: boolean
	) {
		this.text = text;
		this.public = pub !== undefined ? pub : false;
		this.zk = zk !== undefined ? zk : true;
		this.url = url;
		this.title = title;
		this.salt = typeof salt == 'string' ? UrlStore.baseToBuffer(salt) : salt;
		this.iv = typeof iv == 'string' ? UrlStore.baseToBuffer(iv) : iv;

		this.password = password || '';
		this.burn = burn !== undefined ? burn : false;
		this.expire = expire || 0;
		this.crypto = crypto || window.crypto;
	}

	async deriveKey() {
		const base = await this.crypto.subtle.importKey(
			'raw',
			UrlStore.encoder.encode(this.url + this.password),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);

		this.key = await this.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: this.salt,
				iterations: 100000,
				hash: 'SHA-256'
			},
			base,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt']
		);
	}

	async json() {
		return {
			title: UrlStore.base64((await this.encrypt(this.title, true)) as ArrayBuffer),
			text: UrlStore.base64((await this.encrypt(this.text, true)) as ArrayBuffer),
			url: UrlStore.base64((await UrlStore.hash(this.url)) as ArrayBuffer),
			zk: this.zk,
			public: this.public,
			burn: this.burn,
			expire: this.expire,
			password: this.password === '' ? false : true
		};
	}

	async encrypt(text: string, compress: boolean = false) {
		if (!this.key) {
			return null;
		}

		return await this.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: this.iv },
			this.key!,
			UrlStore.encoder.encode(compress ? UrlStore.compress(text) : text)
		);
	}

	async decrypt(text: string, decompress: boolean = false) {
		if (!this.key) {
			return null;
		}

		let decrypted = await this.crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: this.iv },
			this.key!,
			UrlStore.baseToBuffer(text)
		);

		return decompress ? UrlStore.decompress(decrypted) : decrypted;
	}

	/**
	 * Decrypts the title and text of the URL store.
	 * @returns An object containing the decrypted title and text.
	 */
	async fullDecrypt() {
		return {
			title: (await this.decrypt(this.title, true)) as string,
			text: (await this.decrypt(this.text, true)) as string
		};
	}

	static compress(text: string) {
		return lz.compressToEncodedURIComponent(text);
	}

	static decompress(text: ArrayBuffer | string) {
		if (typeof text === 'string') {
			return lz.decompressFromEncodedURIComponent(text);
		}

		return lz.decompressFromEncodedURIComponent(this.utf8(text));
	}

	static utf8(buffer: ArrayBuffer) {
		return Buffer.from(buffer).toString('utf8');
	}

	static base64(buffer: ArrayBuffer) {
		return Buffer.from(buffer).toString('base64');
	}

	static baseToBuffer(base64: string) {
		let binaryString = atob(base64) || window.atob(base64);
		let binaryLength = binaryString.length;

		let bytes = new Uint8Array(binaryLength);

		for (let i = 0; i < binaryLength; i++) {
			let ascii = binaryString.charCodeAt(i);
			bytes[i] = ascii;
		}
		return bytes;
	}

	static async hash(url: string) {
		const crypt: Crypto = !browser ? crypto : window.crypto;

		return await crypt.subtle.digest('SHA-256', UrlStore.encoder.encode(url));
	}
}

export async function UrlStoreDecrypt(
	url: string,
	text: string,
	title: string,
	salt: string,
	iv: string,
	password?: string
) {
	try {
		url = url.startsWith('/') ? url.substring(1) : url;

		const urlStore = new UrlStore(url, text, title, salt, iv, password);
		await urlStore.deriveKey();

		const rawText = UrlStore.decompress((await urlStore.decrypt(text)) as ArrayBuffer);
		const rawTitle = UrlStore.decompress((await urlStore.decrypt(title)) as ArrayBuffer);

		return [rawText, rawTitle];
	} catch (err) {
		return 'Error occured';
	}
}
