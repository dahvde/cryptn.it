import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is 'raw' | 'r' => {
	return param === 'raw' || param === 'r';
}) satisfies ParamMatcher;
