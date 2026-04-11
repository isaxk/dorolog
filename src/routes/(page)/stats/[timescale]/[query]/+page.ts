import { colors } from '$lib/data.js';
import { db } from '$lib/db';
import { localStore } from '$lib/localStore.svelte.js';
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
		return db.getSessionsOfMonth(query);
	}
}

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}

export const load = async ({ params }) => {
	const tags = JSON.parse(localStorage.getItem('tags') ?? '[]');

	const { timescale, query } = params;

	const data: any[] = (await getData(timescale, query)) ?? [];
	const parsed = data.map(parseSession);
	const totalDuration = parsed.reduce((acc, session) => acc + session.seconds, 0) / 60;

	function parseSession(session: any) {
		const seconds = session.ended_at
			? (dayjs(session.ended_at).diff(dayjs(session.started_at), 'seconds') ?? 0)
			: 0;
		const minutes = Math.round(seconds / 60);
		const tag = tags.find((t) => t.name === session.tag.replace('#', ''));
		const color = tag ? colors[tag.color] : null;

		return { ...session, seconds, minutes, color };
	}

	let dates = [];

	let query_title = dayjs(query).format('dddd DD MMM YYYY');
	if (timescale === 'month') {
		query_title = dayjs()
			.set('year', parseInt(query.split('-')[0]))
			.set('month', parseInt(query.split('-')[1]) - 1)
			.format('MMMM YYYY');
		dates = Array.from(
			{ length: daysInMonth(parseInt(query.split('-')[1]), parseInt(query.split('-')[0])) },
			(_, i) => i
		).map((day) => {
			const sessions = parsed.filter((session) => {
				const sessionDate = dayjs(session.started_at);
				return sessionDate.date() === day + 1;
			});
			const duration = sessions.reduce((acc, session) => acc + session.seconds, 0) / 60;
			const date = dayjs(query).add(day, 'day');
			console.log(sessions);
			return { day: day + 1, sessions, duration, date: date.format('YYYYMMDD') };
		});
	} else if (timescale === 'week') {
		query_title = dayjs(query).format('w/c DD MMMM YYYY');
		dates = Array.from({ length: 7 }, (_, i) => i).map((day) => {
			const sessions = parsed.filter((session) => {
				const sessionDate = dayjs(session.started_at);

				return session.ended_at && sessionDate.isSame(dayjs(query).add(day, 'day'), 'day');
			});
			const duration = sessions.reduce((acc, session) => acc + (session.seconds ?? 0), 0) / 60;
			const date = dayjs(query).add(day, 'day');
			return { day: date.format('ddd DD'), sessions, duration, date: date.format('YYYYMMDD') };
		});
	}

	const byTags = tags
		.toSorted((a, b) => a.name.localeCompare(b.name))
		.map((tag) => {
			const sessions = parsed.filter((session) => session.tag.replace('#', '') === tag.name);
			console.log(sessions);
			const duration = sessions.reduce((acc, session) => acc + session.seconds, 0) / 60;
			const color = colors[tag.color];
			return { name: tag.name, sessions, duration, color };
		})
		.toSorted((a, b) => b.duration - a.duration);

	if (timescale === 'month' || timescale === 'week') {
		return {
			title: 'Stats',
			sessions: parsed,
			totalDuration,
			timescale,
			query,
			query_title,
			dates,
			tags: byTags
		};
	} else {
		return {
			title: 'Stats',
			sessions: parsed,
			totalDuration,
			timescale,
			query,
			query_title,
			tags: byTags
		};
	}
};
