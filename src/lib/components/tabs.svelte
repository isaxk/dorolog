<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		tabs,
		value = $bindable(tabs?.[0]?.value ?? ''),
		children
	}: {
		tabs: {
			value: string;
			title: string;
		}[];
		value?: string;
		children?: Snippet<[string]>;
	} = $props();
</script>

<div class="flex w-full rounded-[10px] bg-zinc-50 p-0.5 drop-shadow-sm">
	{#each tabs as tab (tab.value)}
		<button
			class={[
				'w-full grow rounded-lg p-1 text-sm font-semibold transition-all',
				value === tab.value ? 'bg-zinc-200' : 'bg-transparent hover:bg-zinc-100'
			]}
			onclick={() => (value = tab.value)}
		>
			{tab.title}
		</button>
	{/each}
</div>

{@render children?.(value)}
