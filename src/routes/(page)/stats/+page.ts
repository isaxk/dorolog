import { redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';

export const load = async () => {
	return redirect(307, `/stats/day/${dayjs().format('YYYY-MM-DD')}`);
};
