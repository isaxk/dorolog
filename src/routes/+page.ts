import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const tab = url.searchParams.get('tab') ?? 'timer';
	return {
		tab
	};
};
