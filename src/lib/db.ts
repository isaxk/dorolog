import Database from '@tauri-apps/plugin-sql';
import dayjs from 'dayjs';

let sql: Database | null = null;

async function initDb() {
	sql = await Database.load('sqlite:sessions.db');
	sql.execute(
		`CREATE TABLE IF NOT EXISTS sessions_3 (id TEXT PRIMARY KEY, tag TEXT, started_at TEXT, ended_at TEXT);`
	);
}

async function createSession(tag: string) {
	if (!sql) return;
	const id = (Math.random() + 1).toString(36).substring(2);
	await sql.execute(
		`INSERT INTO sessions_3 (id, tag, started_at, ended_at) VALUES ($1, $2, $3, $4)`,
		[id, tag, new Date().toISOString(), null]
	);
	return id;
}

async function extendSession(id: string) {
	if (!sql) return;
	console.log(id);
	await sql.execute(`UPDATE sessions_3 SET ended_at = $1 WHERE id = $2`, [
		new Date().toISOString(),
		id
	]);
}

async function getAllSessions() {
	if (!sql) return;
	const result = await sql.select(`SELECT * FROM sessions_3`);
	return result;
}

async function getSessionsOnDay(date: string) {
	if (!sql) return;
	console.log(date);
	const result = await sql.select(`SELECT * FROM sessions_3 WHERE DATE(started_at) = $1`, [date]);
	return result;
}

async function getSessionsOfWeek(date: string) {
	if (!sql) return;
	const endOfWeek = dayjs(date).add(1, 'week').format('YYYY-MM-DD');
	const result = await sql.select(
		`SELECT * FROM sessions_3 WHERE DATE(started_at) BETWEEN $1 AND $2`,
		[date, endOfWeek]
	);
	return result;
}
async function getSessionsOfMonth(q: string) {
	if (!sql) return;
	const split = q.split('-');
	const startOfMonth = dayjs()
		.set('year', parseInt(split[0]))
		.set('month', parseInt(split[1]) - 1)
		.set('date', 1)
		.format('YYYY-MM-DD');
	const endOfMonth = dayjs(startOfMonth).add(1, 'month').format('YYYY-MM-DD');
	const result = await sql.select(
		`SELECT * FROM sessions_3 WHERE DATE(started_at) BETWEEN $1 AND $2`,
		[startOfMonth, endOfMonth]
	);
	return result;
}

async function manualAddSession(tag: string, started_at: string, ended_at: string) {
	if (!sql) return;
	const id = (Math.random() + 1).toString(36).substring(2);
	await sql.execute(
		`INSERT INTO sessions_3 (id, tag, started_at, ended_at) VALUES ($1, $2, $3, $4)`,
		[id, tag, started_at, ended_at]
	);
}

async function execute(q: string) {
	if (!sql) return;
	const result = await sql.execute(q);
	return result;
}

export const db = {
	init: initDb,
	createSession,
	extendSession,
	getAllSessions,
	getSessionsOnDay,
	getSessionsOfWeek,
	getSessionsOfMonth,
	manualAddSession,
	execute
};
