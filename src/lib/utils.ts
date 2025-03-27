import { browser } from '$app/environment';
import { MAXPRIVATEHASH, MINPRIVATEHASH } from './settings';
import moment from 'moment';
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

export function genUrl(length: number) {
	try {
		if (length > MAXPRIVATEHASH || length < MINPRIVATEHASH) return;

		const arr = new Uint32Array(length);
		let randStr: string[] = [];

		crypto.getRandomValues(arr);

		for (let i of arr) {
			randStr.push(CHARSET[i % CHARSET.length]);
		}

		return randStr.join('');
	} catch (err) {
		return null;
	}
}

export function cnd(condition: boolean, arg: any) {
	return condition ? arg : '';
}

export function formatNumber(num: number) {
	if (num >= 1000) {
		return `${(num / 1000).toFixed(0)}k`;
	}
	return num.toString();
}

export function dateFromNow(date: Date) {
	const now = new Date();
	const diff = new Date(now.getTime() - date.getTime());

	let unit = '';
	let value = 0;

	if (diff.getMinutes() < 60) {
		unit = 'minute';
		value = diff.getMinutes() + 1;
	} else if (diff.getHours() < 24) {
		unit = 'hour';
		value = diff.getHours();
	} else if (diff.getDate() < 30) {
		unit = 'day';
		value = diff.getDate();
	} else if (diff.getMonth() < 12) {
		unit = 'month';
		value = diff.getMonth();
	} else {
		unit = 'year';
		value = diff.getFullYear();
	}

	return `${value === 1 ? (unit === 'hour' ? 'an' : 'a') : value} ${unit}${value === 1 ? '' : 's'} ago`;
}
