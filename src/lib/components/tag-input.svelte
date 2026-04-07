<script lang="ts">
	import { colors } from '$lib/data';
	import { localStore } from '$lib/localStore.svelte';
	import { tray } from '$lib/tray';
	import ColorPick from './color-pick.svelte';

	const tags = localStore<{ name: string; color: string }[]>('tags', []);

	let { value = $bindable() } = $props();

	let q = $state('');
	let input: HTMLInputElement | undefined = $state();
	let focused = $state(false);

	let currentTag = $derived(tags.value.findIndex((tag) => tag.name === value));

	let timeout: NodeJS.Timeout | undefined;

	const results = $derived(
		tags.value
			.toSorted((a, b) => a.name.localeCompare(b.name))
			.filter((tag) => tag.name.startsWith(q))
	);

	function addTag() {
		value = q;
		tags.value.push({ name: q, color: 'red' });
	}

	$effect(() => {
		tray.update({
			state: 'idle',
			tags: tags.value.toSorted((a, b) => a.name.localeCompare(b.name)).map((t) => t.name)
		});
	});
</script>

<form
	tabindex="-1"
	onsubmit={(e) => {
		e.preventDefault();
		console.log(results);
		if (results.length === 0 && q.length > 1) {
			addTag();
		} else {
			if (results.length > 0) {
				value = results[0].name;
				q = results[0].name;
			}
		}
		input?.blur();
		focused = false;
	}}
	class="relative flex items-center"
>
	<input
		autocorrect="off"
		bind:value={q}
		bind:this={input}
		onkeydown={() => (value = null)}
		type="text"
		style:background-color={colors[tags.value.find((tag) => tag.name === value)?.color]?.bg ??
			'inherit'}
		style:color={colors[tags.value.find((tag) => tag.name === value)?.color]?.fg ?? 'inherit'}
		style:border-color={colors[tags.value.find((tag) => tag.name === value)?.color]?.fg ??
			'#e4e4e7'}
		style:outline-color={colors[tags.value.find((tag) => tag.name === value)?.color]?.fg ??
			'#2b7fff'}
		class={[
			'w-32 rounded-lg border border-zinc-200 py-0.5 pl-4.5 outline-none focus:outline-2 focus:outline-solid',
			tags.value.find((tag) => tag.name === value) && q === value ? 'font-bold' : ''
		]}
		onfocus={() => {
			focused = true;
		}}
		onblur={() => {
			if (q.length < 1 || value === q)
				setTimeout(() => {
					focused = false;
				}, 150);
		}}
	/>
	<div class="absolute left-2">
		<div
			class="font-bold"
			style:color={colors[tags.value.find((tag) => tag.name === value)?.color]?.fg ?? 'inherit'}
		>
			#
		</div>
	</div>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={[
			'absolute bottom-9 max-h-32 w-48 transform-gpu overflow-scroll  rounded-lg border border-zinc-200 bg-white text-sm drop-shadow',
			focused ? 'opacity-100' : 'opacity-0'
		]}
	>
		<div class="h-max transform-gpu">
			{#if results.length > 0}
				{#each results as tag, index}
					<div
						style:color={colors[tag.color]?.fg}
						class={[
							'flex w-full truncate py-0.5 pr-0.5 pl-2',
							index === 0 ? 'bg-zinc-100 font-bold' : ''
						]}
					>
						<div class="grow">
							#{tag.name}
						</div>
					</div>
				{/each}
			{/if}
			{#if q.length > 0 && !tags.value.some((t) => t.name === q)}
				<button
					type="button"
					onclick={() => {
						addTag();
						focused = false;
					}}
					class={[
						results.length === 0 ? 'bg-zinc-100 font-bold' : 'text-xs text-zinc-500',
						'w-full truncate py-0.5 pl-2 text-left'
					]}
				>
					Add #{q}
				</button>
			{/if}
			{#if q.length === 0}
				<a href="/settings" class="px-2 py-1 text-xs text-zinc-500 underline">Manage tags</a>
			{/if}
		</div>
	</div>
	{#if tags.value[currentTag]}
		<div class="h-7.5 w-7.5">
			<ColorPick bind:value={tags.value[currentTag].color} />
		</div>
	{/if}
</form>
