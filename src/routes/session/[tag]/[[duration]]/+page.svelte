<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	import Music from '$lib/components/music.svelte';
	import { tray } from '$lib/tray';
	import { db } from '$lib/db';
	import { colors } from '$lib/data';
	import { localStore } from '$lib/localStore.svelte';

	let {
		data
	}: {
		data: PageData;
	} = $props();

	let startTime: number | undefined = $state();
	let timeRemaining = $derived(data.info.duration);
	let timeElapsed = $state(0);
	let sessionId: string | null = $state(null);

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

		const extentSessionInterval = setInterval(() => {
			if (data.info.type !== 'break') {
				if (sessionId) {
					db.extendSession(sessionId);
				} else {
					db.createSession(data.info.tag ?? '').then((id) => {
						sessionId = id ?? null;
						console.log(id);
					});
				}
			}
		}, 30000);

		const interval = setInterval(() => {
			if (startTime) {
				timeElapsed = Math.floor(Date.now() - startTime);
				if (data.info.duration) {
					timeRemaining = data.info.duration - timeElapsed;
				}
			}
		}, 100);
		return () => {
			clearInterval(interval);
			clearInterval(extentSessionInterval);
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

<!-- <pre>
    {JSON.stringify(data.info, null, 2)}
</pre> -->

<div class="flex h-screen flex-col items-center justify-center">
	<!-- <a href="/">Home</a> -->
	<div class="flex h-10 w-full p-1">
		<div class="w-32"></div>
		<div class="grow" data-tauri-drag-region></div>
		<Music />
	</div>
	<div class="-mt-5 flex grow flex-col items-center justify-center gap-2">
		{#if data.info.type === 'break'}
			<div class="font-semibold text-zinc-500">Break session</div>
		{:else}
			<div
				class="rounded-lg px-2 py-1 font-semibold drop-shadow-sm"
				style:background-color={colors[tags.value.find((t) => t.name === data.info.tag)?.color]?.bg}
				style:color={colors[tags.value.find((t) => t.name === data.info.tag)?.color]?.fg}
			>
				#{data.info.tag}
			</div>
		{/if}
		<div class="font-mono text-5xl font-bold">
			{#if data.info.type === 'stopwatch'}
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
