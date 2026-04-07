import { db } from '$lib/db';
import dayjs from 'dayjs';
import type { skipPartiallyEmittedExpressions } from 'typescript';

function getData(timescale: string, query: string) {
	if (timescale === 'day') {
		return db.getSessionsOnDay(query);
	}
	if (timescale === 'week') {
		return db.getSessionsOfWeek(query);
	}
	if (timescale === 'month') {
		return db.getAllSessions();
	}
}

function parseSession(session: any) {
	const duration = dayjs(session.ended_at).diff(dayjs(session.started_at), 'minutes');
	return { ...session, duration };
}

export const load = async ({ params }) => {
	const { timescale, query } = params;

	const data: any[] = (await getData(timescale, query)) ?? [];
	const parsed = data.map(parseSession);
	const totalDuration = parsed.reduce((acc, session) => acc + session.duration, 0);

	let query_title = dayjs(query).format('dddd DD MMMM YYYY');
	if (timescale === 'month') {
		query_title = dayjs()
			.set('year', parseInt(query.split('-')[0]))
			.set('month', parseInt(query.split('-')[1]) - 1)
			.format('MMMM YYYY');
	} else if (timescale === 'week') {
		query_title = dayjs(query).format('w/c DD MMMM YYYY');
	}

	return {
		title: 'Stats',
		sessions: parsed,
		totalDuration,
		timescale,
		query,
		query_title
	};
};
