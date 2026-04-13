<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Music from '$lib/components/music.svelte';
	import { tray } from '$lib/tray';
	import { db } from '$lib/db';
	import { colors } from '$lib/data';
	import { localStore } from '$lib/localStore.svelte';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/plugin-notification';
	import { isMac } from '$lib/platform';
	import WindowControls from '$lib/components/window-controls.svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { listen } from '@tauri-apps/api/event';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	let startTime: number | undefined = $state();
	let timeRemaining = $derived(data.info.duration);
	let timeElapsed = $state(0);
	let sessionId: string | null = $state(null);
	let chimePlayed = $state(false);
	let audioElm: HTMLAudioElement | null = $state(null);

	const tags = localStore<{ name: string; color: string }[]>('tags', []);

	const timeRemainingFormatted = $derived.by(() => {
		if (!timeRemaining) return '';
		const totalSeconds = Math.abs(timeRemaining / 1000);
		const hours = Math.floor(totalSeconds / (60 * 60));
		const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
		const seconds = Math.floor(totalSeconds % 60);
		return (
			(timeRemaining < 0 ? '-' : '') +
			`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
		);
	});

	const timeElapsedFormatted = $derived.by(() => {
		const totalSeconds = Math.abs(timeElapsed / 1000);
		const hours = Math.floor(totalSeconds / (60 * 60));
		const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
		const seconds = Math.floor(totalSeconds % 60);
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	});

	onMount(() => {
		startTime = Date.now();

		if (data.info.type !== 'break') {
			db.createSession(data.info.tag ?? '').then((id) => {
				sessionId = id ?? null;
				invoke('start_timer', {
					duration: data.info.duration,
					tag: data.info.type === 'break' ? 'break' : (data.info.tag ?? ''),
					sessionId: id
				});
			});
		} else {
			invoke('start_timer', {
				duration: data.info.duration,
				tag: 'break',
				sessionId: null
			});
		}

		// const extentSessionInterval = setInterval(() => {
		// 	if (data.info.type !== 'break') {
		// 		if (sessionId) {
		// 			db.extendSession(sessionId);
		// 		} else {
		// 			db.createSession(data.info.tag ?? '').then((id) => {
		// 				sessionId = id ?? null;
		// 				console.log(id);
		// 			});
		// 		}
		// 	}
		// }, 30000);

		listen('timer_done', () => {
			// audioElm?.play();
			if (sessionId) db.extendSession(sessionId);
			// clearInterval(extentSessionInterval);
		});

		listen('timer_sync_db', (event) => {
			const sessionId = event.payload as string;
			db.extendSession(sessionId);
			console.log(`DB Updated for session: ${sessionId}`);
		});

		const interval = setInterval(() => {
			if (startTime) {
				timeElapsed = Math.floor(Date.now() - startTime);

				if (data.info.duration) {
					timeRemaining = data.info.duration - timeElapsed;
					// if (timeRemaining < 1 && !chimePlayed) {
					// 	chimePlayed = true;
					// 	audioElm?.play();

					// 	if (data.info.type === 'break') {
					// 		sendNotification({ title: 'Break over!', body: "Let's start a new session" });
					// 	} else {
					// 		sendNotification({
					// 			title: `#${data.info.tag ?? 'Session'} | ${Math.floor(data.info.duration / (1000 * 60))}m complete!`,
					// 			body: 'You are now gaining overtime, keep working or end the session'
					// 		});
					// 	}
					// }
				}
			}
		}, 100);
		return () => {
			clearInterval(interval);
			// clearInterval(extentSessionInterval);
			if (timeElapsed > 300000 && sessionId) {
				db.extendSession(sessionId);
			}
		};
	});

	$effect(() => {
		const time = (data.info.type === 'stopwatch' ? timeElapsed : timeRemaining) ?? 0;

		const hours = Math.floor(time / (1000 * 60 * 60));
		const minutes = Math.floor((time / (1000 * 60)) % 60);

		if (hours > 0) {
			tray.update({
				state: data.info.type === 'stopwatch' ? 'stopwatch' : 'timer',
				tag: data.info.type === 'break' ? 'break' : (data.info.tag ?? ''),
				time: `${hours.toString()}h ${minutes.toString()}m`
			});
		} else {
			tray.update({
				state: data.info.type === 'stopwatch' ? 'stopwatch' : 'timer',
				tag: data.info.type === 'break' ? 'break' : (data.info.tag ?? ''),
				time: `${minutes.toString()}m`
			});
		}
	});
</script>

<audio src="/chime.mp3" bind:this={audioElm} class="hidden"></audio>

<!-- <pre>
    {JSON.stringify(data.info, null, 2)}
</pre> -->

<div class="flex h-screen flex-col items-center justify-center">
	<!-- <a href="/">Home</a> -->
	<div class="flex h-10 w-full p-1">
		{#if isMac}
			<div class="w-32"></div>
		{/if}
		<div class="h-12 grow" data-tauri-drag-region></div>
		{#if !isMac}
			<WindowControls />
		{/if}
	</div>
	<div class="-mt-5 flex grow flex-col items-center justify-center gap-2">
		{#if data.info.type === 'break'}
			<div class="font-semibold text-zinc-500">Break session</div>
		{:else}
			<div class="flex items-center gap-2">
				<div
					class="rounded-lg px-2 py-1 font-semibold drop-shadow-sm"
					style:background-color={colors[tags.value.find((t) => t.name === data.info.tag)?.color]
						?.bg}
					style:color={colors[tags.value.find((t) => t.name === data.info.tag)?.color]?.fg}
				>
					#{data.info.tag}
				</div>
			</div>
		{/if}
		{#if (timeRemaining ?? 0) < 0}
			<div class="text-sm font-semibold text-zinc-500">
				Overtime - {data.info.duration / (1000 * 60)}m complete!
			</div>
		{/if}
		<div class={['font-mono  font-bold', (timeRemaining ?? 0) < 0 ? 'text-4xl/6' : 'text-5xl']}>
			{#if data.info.type === 'stopwatch' || (timeRemaining ?? 0) < 0}
				{timeElapsedFormatted}
			{:else}
				{timeRemainingFormatted}
			{/if}
		</div>
	</div>
	<div class="w-full p-2">
		<a
			href={`/`}
			class={[
				'block w-full rounded-lg py-1 text-center text-sm font-bold text-white drop-shadow-sm',
				timeRemaining < 0 ? 'bg-green-700' : 'bg-red-500'
			]}>End</a
		>
	</div>
</div>
