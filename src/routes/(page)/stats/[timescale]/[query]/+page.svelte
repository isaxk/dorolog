<script>
	import Tabs from '$lib/components/tabs.svelte';
	import { db } from '$lib/db.js';
	import dayjs from 'dayjs';
	import isoWeek from 'dayjs/plugin/isoWeek';

	dayjs.extend(isoWeek);

	let { data } = $props();

	const monday = dayjs().startOf('isoWeek');

	let tag = $state('');
	let started_at = $state('');
	let ended_at = $state('');

	let sql = $state('');
</script>

<div class="pb-2">
	<div class="flex w-full rounded-[10px] bg-zinc-50 p-0.5 drop-shadow-sm">
		<a
			class={[
				'block w-full grow rounded-lg p-1 text-center text-sm font-semibold transition-all',
				data.timescale === 'day' ? 'bg-zinc-200' : 'bg-transparent hover:bg-zinc-50'
			]}
			href="/stats/day/{dayjs().format('YYYY-MM-DD')}"
		>
			Day
		</a>
		<a
			class={[
				'block w-full grow rounded-lg p-1 text-center text-sm font-semibold transition-all',
				data.timescale === 'week' ? 'bg-zinc-200' : 'bg-transparent hover:bg-zinc-50'
			]}
			href="/stats/week/{monday.format('YYYY-MM-DD')}"
		>
			Week
		</a>
		<a
			class={[
				'block w-full grow rounded-lg p-1 text-center text-sm font-semibold transition-all',
				data.timescale === 'month' ? 'bg-zinc-200' : 'bg-transparent hover:bg-zinc-50'
			]}
			href="/stats/month/{dayjs().format('YYYY-MM')}"
		>
			Month
		</a>
	</div>
</div>

<div class="min-h-0 grow overflow-y-scroll">
	<div class="flex pt-2">
		<div class="grow p-2">
			<div class="text-lg font-semibold">
				{data.query_title}
			</div>
		</div>
		<div class="flex flex-col items-end p-2">
			<div class="text-sm font-medium text-zinc-400">Total</div>
			<div class="text-xl font-semibold">
				{Math.floor(data.totalDuration / 60)}h {Math.floor(data.totalDuration % 60)}m
			</div>
		</div>
	</div>

	<pre>
    {JSON.stringify(data, null, 2)}
</pre>
</div>

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

<div class="text-xl">Manual add session</div>
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
>
