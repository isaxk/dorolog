<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		onclick = () => {},
		href,
		children,
		isActive = false
	}: {
		onclick?: () => void;
		href?: string;
		children?: Snippet;
		isActive?: boolean;
	} = $props();
</script>

{#if href}
	<a
		class={[
			'block w-full grow rounded-lg p-1 text-center text-sm font-semibold transition-all',
			isActive ? 'bg-tab-selected' : 'bg-transparent hover:bg-tab-selected/50 '
		]}
		{onclick}
		{href}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		class={[
			'w-full grow rounded-lg p-1 text-sm font-semibold transition-all',
			isActive ? 'bg-tab-selected' : 'bg-transparent hover:bg-tab-selected/50 '
		]}
		{onclick}
	>
		{@render children?.()}
	</button>
{/if}
