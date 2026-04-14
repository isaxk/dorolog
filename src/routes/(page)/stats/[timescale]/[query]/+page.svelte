<script lang="ts">
	import { page } from '$app/state';
	import AnimateHeight from '$lib/components/animate-height.svelte';
	import IconButton from '$lib/components/icon-button.svelte';
	import TabItem from '$lib/components/tabs/tab-item.svelte';
	import TabRow from '$lib/components/tabs/tab-row.svelte';
	import { colors } from '$lib/data';
	import { db } from '$lib/db.js';
	import { LocalStore, localStore } from '$lib/localStore.svelte';
	import { Tooltip } from 'bits-ui';
	import dayjs from 'dayjs';
	import isoWeek from 'dayjs/plugin/isoWeek';
	import { ArrowLeft, ArrowRight, PanelTopBottomDashedIcon } from 'lucide-svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { crossfade, fade, slide } from 'svelte/transition';
	import DayView from './day-view.svelte';
	import HoursMinutes from '$lib/components/hours-minutes.svelte';
	import { flip } from 'svelte/animate';

	dayjs.extend(isoWeek);

	let { data } = $props();

	const tags: LocalStore<{ name: string; color: string }[]> = localStore<
		{ name: string; color: string }[]
	>('tags', []);

	const monday = dayjs().startOf('isoWeek');

	let tag = $state('');
	let started_at = $state('');
	let ended_at = $state('');

	let sql = $state('');

	$effect(() => {
		console.log(scrollY.current);
		if ((scrollY.current ?? 0) > 50) {
			// alert('Hey');
		}
	});

	const [send, receive] = crossfade({ duration: 150 });

	const sessionsTether = Tooltip.createTether<{
		duration: number;
		tag: string;
		start: string;
		end: string;
		color: { fg: string; bg: string };
	}>();
</script>

<div class="pb-2">
	<TabRow>
		<TabItem isActive={data.timescale === 'day'} href="/stats/day/{dayjs().format('YYYY-MM-DD')}">
			Day
		</TabItem>
		<TabItem isActive={data.timescale === 'week'} href="/stats/week/{monday.format('YYYY-MM-DD')}">
			Week
		</TabItem>
		<TabItem isActive={data.timescale === 'month'} href="/stats/month/{dayjs().format('YYYY-MM')}">
			Month
		</TabItem>
	</TabRow>
</div>

<div class="flex items-center border-b border-border pb-1">
	<div class="grow p-2">
		<div class="text-2xl font-bold">
			{data.query_title}
		</div>
	</div>

	<div class="flex w-22 flex-col items-end p-2 pl-0">
		<div class="text-xs font-medium text-zinc-400">Total</div>
		<div class="text-lg/5 font-semibold">
			<HoursMinutes value={data.totalDuration} />
		</div>
	</div>
	<div class="flex items-center gap-1 px-1">
		{#if data.timescale === 'month'}
			{@const [year, month] = data.query.split('-')}
			{@const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1}
			{@const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1}
			<IconButton
				icon={ArrowLeft}
				href="/stats/{data.timescale}/{parseInt(month) === 1
					? parseInt(year) - 1
					: year}-{prevMonth}"
			/>
			<IconButton
				icon={ArrowRight}
				href="/stats/{data.timescale}/{parseInt(month) === 12
					? parseInt(year) + 1
					: year}-{nextMonth}"
			/>
		{:else}
			<IconButton
				icon={ArrowLeft}
				href="/stats/{data.timescale}/{dayjs(data.query)
					.subtract(1, data.timescale === 'day' ? 'day' : 'week')
					.format('YYYY-MM-DD')}"
			/>
			<IconButton
				icon={ArrowRight}
				href="/stats/{data.timescale}/{dayjs(data.query)
					.add(1, data.timescale === 'day' ? 'day' : 'week')
					.format('YYYY-MM-DD')}"
			/>
		{/if}
	</div>
</div>

{#if data.totalDuration < 1}
	<div class="flex grow items-center justify-center">
		<div class="text-zinc-400">No sessions</div>
	</div>
{:else}
	<Tooltip.Provider>
		<div class="min-h-0 grow overflow-y-scroll">
			<AnimateHeight class="border-b border-border">
				<div class="flex flex-col py-5">
					{#each data.tags.filter((tag) => tag.duration > 1) as tag, i}
						<div class={['flex items-center gap-2 px-2 py-0.5 text-sm']}>
							<div class="w-4">{i + 1}.</div>
							<div class="relative min-w-0 grow">
								<div
									style:color={tag.color.fg}
									class="absolute top-0 bottom-0 left-0 z-20 flex items-center p-1 px-1.5 font-medium"
								>
									#{tag.name}
								</div>
								<div
									class="h-6 rounded-lg opacity-40 brightness-95 drop-shadow-xs transition-all"
									style:background={tag.color.bg}
									style:width="{(tag.duration /
										data.tags.reduce((a, b) => (b.duration > a ? b.duration : a), 0)) *
										100}%"
								></div>
							</div>
							<div>
								<HoursMinutes value={tag.duration} />
							</div>
						</div>
					{/each}
					<div class="flex items-center gap-2 px-2 text-sm opacity-50">
						<div class="min-w-4"></div>
						<div class="flex min-w-0 grow flex-wrap gap-x-1 px-1.5 py-1 text-xs/3">
							{#each data.tags.filter((tag) => tag.duration < 1) as tag, i}
								<div class="text-nowrap" style:color={tag.color?.fg}>
									#{tag.name}{#if i < data.tags.filter((tag) => tag.duration < 1).length - 1},{/if}
								</div>
							{/each}
						</div>
						<div class="min-w-10 text-right text-xs">0m</div>
					</div>
				</div>
			</AnimateHeight>
			{#if (data.dates?.length ?? 0) > 0}
				<div class="flex flex-col gap-1 py-5">
					{#each data.dates as day (day.day)}
						<a
							href="/stats/day/{dayjs(day.date).format('YYYY-MM-DD')}"
							class={[
								'flex items-center gap-2 px-2 transition-all hover:bg-muted/50',
								data.timescale === 'week' ? 'h-5 text-sm' : 'h-3 text-xs',
								day.duration < 1 && 'opacity-20'
							]}
						>
							<div class={[data.timescale === 'week' ? 'w-14' : 'w-6']}>
								{#if data.timescale === 'month'}
									{#if Math.floor(day.day / 10) !== 1 && day.day % 10 < 4}
										{#if day.day % 10 === 1}
											{day.day}<span class="text-[10px] text-zinc-500">st</span>
										{:else if day.day % 10 === 2}
											{day.day}<span class="text-[10px] text-zinc-500">nd</span>
										{:else if day.day % 10 === 3}
											{day.day}<span class="text-[10px] text-zinc-500">rd</span>
										{:else}
											{day.day}<span class="text-[10px] text-zinc-500">th</span>
										{/if}
									{:else}
										{day.day}<span class="text-[10px] text-zinc-500">th</span>
									{/if}
								{:else if data.timescale === 'week'}
									{day.day}
								{/if}
							</div>
							<div class={['flex grow gap-0.5', data.timescale === 'week' ? 'h-3.5' : 'h-3']}>
								{#each day.sessions as session}
									{#if session.minutes > 0}
										<Tooltip.Trigger
											tether={sessionsTether}
											payload={{
												id: session.id,
												tag: session.tag,
												duration: session.minutes,
												start: dayjs(session.started_at).format('HH:mm'),
												end: dayjs(session.ended_at).format('HH:mm'),
												color: session.color
											}}
											class="h-full"
										>
											<div
												class="h-full rounded bg-black drop-shadow-xs transition-all hover:translate-y-px hover:scale-95"
												style:width="{session.minutes}px"
												style:background={session.color?.fg}
											></div>
										</Tooltip.Trigger>
									{/if}
								{/each}
							</div>

							<div>
								<HoursMinutes value={day.duration} />
							</div>
						</a>
					{/each}
				</div>
			{:else if data.timescale === 'day'}
				<DayView sessions={data.sessions} {sessionsTether} />
			{/if}
		</div>
		<Tooltip.Root tether={sessionsTether} delayDuration={250}>
			{#snippet children({ payload })}
				<Tooltip.Portal>
					<Tooltip.Content
						class="overflow-hidden rounded-lg border bg-white drop-shadow-sm transition-all animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
						style={{ borderColor: payload?.color?.fg, background: payload?.color?.bg }}
					>
						<div class="px-2 py-1.5">
							<div class="text-base/5 font-bold">
								{#if payload?.duration}
									{#if (payload?.duration ?? 0) > 60}
										{Math.floor(payload?.duration / 60)}h {Math.floor(payload?.duration % 60)}m
									{:else}
										{Math.floor(payload?.duration)}m
									{/if}
								{/if}
							</div>
							<div class="flex items-center gap-1 text-xs">
								<!-- {payload?.id} -->
								<div>
									{payload?.start} - {payload?.end}
								</div>
								{#if payload?.color}
									<div style:color={payload.color?.fg} class="text-sm font-medium transition-all">
										#{payload.tag.replace('#', '')}
									</div>
								{/if}
							</div>
						</div>
					</Tooltip.Content>
				</Tooltip.Portal>
			{/snippet}
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
<!-- <pre>
    {JSON.stringify(data, null, 2)}
</pre> -->

<!-- <div class="pt-4">
	{#each Array(24), i}
		<div class="h-10 px-2">
			<div class="flex items-center gap-2">
				<div class="font-mono text-sm font-medium text-zinc-400">
					{i.toString().padStart(2, '0')}:00
				</div>
				<div class="h-px grow bg-zinc-200"></div>
			</div>
		</div>
	{/each}
</div> -->

<!-- <div class="text-xl">Manual add session</div>
<input type="text" bind:value={tag} placeholder="#tag" />
<input type="text" bind:value={started_at} placeholder="Start: YYYY-MM-DD HH:MM:SS" />
<input type="text" bind:value={ended_at} placeholder="End: YYYY-MM-DD HH:MM:SS" />
<button
	onclick={() => {
		db.manualAddSession(tag, started_at, ended_at);
	}}>Add</button
>

<input type="text" bind:value={sql} /><button
	onclick={() => {
		db.execute(sql);
	}}>Execute</button
> -->
