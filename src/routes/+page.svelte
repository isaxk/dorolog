<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import Tabs from '../lib/components/tabs.svelte';
	import { ChartColumnBigIcon, Settings } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { tray } from '$lib/tray';
	import TagInput from '$lib/components/tag-input.svelte';
	import type { PageData } from './$types';
	import ColorPick from '$lib/components/color-pick.svelte';
	import { localStore } from '$lib/localStore.svelte';

	let { data }: { data: PageData } = $props();

	const tags = localStore<{ name: string; color: string }[]>('tags', []);

	let timer_duration = $state(25);
	let break_duration = $state(5);
	let tag = $state();

	let type = $derived(data.tab ?? 'timer');

	$effect(() => {
		if (tag === 'break') {
			type = 'break';
			tag = 'maths';
		}
		if (timer_duration <= 0) {
			type = 'stopwatch';
			timer_duration = 25;
		}
	});

	onMount(() => {
		tray.update({
			state: 'idle',
			tags: tags.value.toSorted((a, b) => a.name.localeCompare(b.name)).map((t) => t.name)
		});
	});
</script>

<div class="flex h-screen flex-col">
	<div class="flex h-10 items-center justify-center gap-1 px-2">
		<div class="w-32"></div>
		<div data-tauri-drag-region class="grow text-center text-sm font-semibold text-zinc-400">
			Dorolog
		</div>
		<div class="flex w-32 items-center justify-end">
			<a class="rounded-lg p-1 transition-all hover:bg-zinc-100" href="/stats"
				><ChartColumnBigIcon size={20} /></a
			>
			<a class="rounded-lg p-1 transition-all hover:bg-zinc-100" href="/settings"
				><Settings size={20} /></a
			>
		</div>
	</div>
	<div class="flex grow flex-col items-center gap-2 p-2 pt-0">
		<Tabs
			bind:value={type}
			tabs={[
				{ value: 'timer', title: 'Timer' },
				{ value: 'stopwatch', title: 'Stopwatch' },
				{ value: 'break', title: 'Break' }
			]}
		>
			{#snippet children(value)}
				<div class="grow">
					{#if value !== 'stopwatch'}
						<div
							class="flex h-full flex-col items-center justify-center"
							transition:fade={{ duration: 100 }}
						>
							{#if value === 'timer'}
								<div class="relative flex items-center">
									<input
										type="number"
										min="0"
										max="180"
										class={[
											'pr-9 text-right font-mono text-xl font-bold',
											timer_duration.toString().length > 2
												? 'w-[calc(3ch+40px)]'
												: timer_duration.toString().length > 1
													? 'w-[calc(2ch+40px)]'
													: 'w-[calc(1ch+40px)]'
										]}
										bind:value={timer_duration}
									/>
									<div class="pointer-events-none absolute right-0 bottom-0.5">mins</div>
								</div>

								<input
									type="range"
									step={5}
									class="w-64"
									min={0}
									max={180}
									bind:value={timer_duration}
								/>
							{/if}
							{#if value === 'break'}
								<div class="relative flex items-center">
									<input
										type="number"
										min={0}
										max={30}
										step={1}
										class={[
											'pr-9 text-right text-xl font-bold',
											break_duration.toString().length > 2
												? 'w-[calc(3ch+40px)]'
												: break_duration.toString().length > 1
													? 'w-[calc(2ch+40px)]'
													: 'w-[calc(1ch+40px)]'
										]}
										bind:value={break_duration}
									/>
									<div class="pointer-events-none absolute right-0 bottom-0.5">mins</div>
								</div>

								<input type="range" class="w-64" min={0} max={30} bind:value={break_duration} />
							{/if}
						</div>
					{/if}
				</div>
				{#if value !== 'break'}
					<div class="flex items-center gap-1" transition:slide={{ duration: 100 }}>
						<div class="font-bold">Tag:</div>
						<TagInput bind:value={tag} />
					</div>
				{/if}
			{/snippet}
		</Tabs>

		<a
			href={type === 'break'
				? `/session/break/${break_duration}`
				: type === 'timer'
					? `/session/${tag}/${timer_duration}`
					: `/session/${tag}`}
			class={[
				'w-full rounded-lg bg-blue-500 py-1 text-center text-sm font-bold text-white drop-shadow-sm transition-all hover:opacity-90',
				!tag && type !== 'break' && 'pointer-events-none cursor-not-allowed opacity-50'
			]}>Start</a
		>
	</div>
</div>
