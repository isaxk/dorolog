import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { Menu, type MenuOptions } from '@tauri-apps/api/menu';
import { goto } from '$app/navigation';

import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Image } from '@tauri-apps/api/image';

let trayInstance: TrayIcon | null = null;

const timerLengths = [5, 10, 15, 20, 30, 45, 60, 90, 180];
const breakLengths = [1, 2, 3, 4, 5, 7, 10, 15, 20];
const tags = [
	'maths',
	'chemistry',
	'physics',
	'biology',
	'english-lit',
	'english-lang',
	'french',
	'geography'
];

async function clearTray() {
	if (trayInstance) {
		await trayInstance.close();
		trayInstance = null;
	}
}

type TrayStateOptions =
	| {
			state: 'idle';
			tags: string[];
	  }
	| {
			state: 'timer' | 'stopwatch';
			tag: string;
			time?: string;
	  };

function createIdleMenu(tags: string[]): MenuOptions {
	return {
		items: [
			{
				id: 'timer',
				text: 'New timer',

				items: [
					...tags.map((tag) => ({
						text: `#${tag}`,
						items: [
							...timerLengths.map((length) => ({
								text: `${length}m`,

								action: () => {
									goto(`/session/${tag}/${length}`);
								}
							})),
							{
								text: 'Custom',
								action: async () => {
									const mainWindow = new WebviewWindow('main');
									goto('/?tab=timer');
									await mainWindow.show();
									await mainWindow.setFocus();
								}
							}
						]
					})),
					{
						text: 'New tag',
						action: async () => {
							const mainWindow = new WebviewWindow('main');
							goto('/?tab=timer');
							await mainWindow.show();
							await mainWindow.setFocus();
						}
					}
				]
			},
			{
				id: 'stopwatch',
				text: 'New stopwatch',
				items: [
					...tags.map((tag) => ({
						text: `#${tag}`,
						action: () => {
							goto(`/session/${tag}`);
						}
					})),
					{
						text: 'Other tag',
						action: async () => {
							const mainWindow = new WebviewWindow('main');
							goto('/?tab=stopwatch');
							await mainWindow.show();
							await mainWindow.setFocus();
						}
					}
				]
			},
			{
				id: 'break',
				text: 'New break',
				items: breakLengths.map((length) => ({
					text: `${length}m`,
					action: () => {
						goto(`/session/break/${length}`);
					}
				}))
			},
			{
				item: 'Separator'
			},
			{
				id: 'show',
				text: 'Show Dorolog',
				action: async () => {
					const mainWindow = new WebviewWindow('main');
					await mainWindow.show();
					await mainWindow.setFocus();
				}
			},
			{
				id: 'quit',
				item: 'Quit',
				text: 'Quit Dorolog'
			}
		]
	};
}

async function update(options: TrayStateOptions) {
	const menu = await Menu.new(
		options.state === 'idle'
			? createIdleMenu(options.tags)
			: {
					items: [
						{
							text: `#${options.tag} | ${options.time} ${options.state === 'stopwatch' ? 'elapsed' : 'remaining'}`,
							action: async () => {
								const mainWindow = new WebviewWindow('main');

								await mainWindow.show();
								await mainWindow.setFocus();
							}
						},
						{
							item: 'Separator'
						},
						{
							text: 'Toggle music playback',
							action: async () => {
								musicSubscriptions.forEach(({ callback }) => callback('playpause'));
							}
						},
						{
							text: 'End session',
							action: () => {
								goto('/');
							}
						},
						{
							item: 'Separator'
						},
						{
							id: 'quit',
							item: 'Quit',
							text: 'Quit Dorolog'
						}
					]
				}
	);

	if (trayInstance) {
		await trayInstance.setMenu(menu);
	} else {
		const options = {
			icon: await defaultWindowIcon(),
			menu
		};
		if (trayInstance !== null) {
			await trayInstance.setMenu(menu);
		} else {
			trayInstance = await TrayIcon.new(options);
		}
	}
}

let musicSubscriptions: {
	id: string;
	callback: (action: 'playpause') => void;
}[] = [];

export const tray = {
	clear: clearTray,
	subscribeToMusicControl: (callback: () => void) => {
		const id = Math.random().toString().substring(36);
		musicSubscriptions.push({ id, callback });
		return () => {
			musicSubscriptions = musicSubscriptions.filter((s) => s.id !== id);
		};
	},
	update
};
