import type { PageLoad } from './$types';

type SessionInfo =
	| {
			type: 'break';
			duration: number;
	  }
	| {
			type: 'timer';
			duration: number;
			tag: string;
	  }
	| {
			type: 'stopwatch';
			tag: string;
	  };

export const load: PageLoad<{ info: SessionInfo }> = ({ params }) => {
	if (params.tag === 'break') {
		return {
			info: {
				type: 'break',
				duration: parseFloat(params.duration ?? '5') * 60 * 1000
			}
		};
	} else if (params.duration) {
		return {
			info: {
				type: 'timer',
				duration: parseFloat(params.duration ?? '25') * 60 * 1000,
				tag: params.tag
			}
		};
	} else {
		return {
			info: {
				type: 'stopwatch',
				tag: params.tag
			}
		};
	}
};
