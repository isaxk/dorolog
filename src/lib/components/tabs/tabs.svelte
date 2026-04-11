<script lang="ts">
	import type { Snippet } from 'svelte';
	import TabRow from './tab-row.svelte';
	import TabItem from './tab-item.svelte';

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

<TabRow>
	{#each tabs as tab (tab.value)}
		<TabItem isActive={value === tab.value} onclick={() => (value = tab.value)}>
			{tab.title}
		</TabItem>
	{/each}
</TabRow>

{@render children?.(value)}
