<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import WindowControls from './window-controls.svelte';
	import { isMac } from '$lib/platform';

	let {
		showBackButton = false,
		title = '',
		right
	}: {
		showBackButton?: boolean;
		title?: string | Snippet;
		right?: Snippet;
	} = $props();
</script>

<div class="flex h-10 min-h-10 items-center bg-background text-sm">
	<div class={['flex items-center', isMac ? 'w-32' : 'px-2']}>
		{#if isMac}
			<div class="w-21"></div>
		{/if}
		{#if showBackButton}
			<a href="/" class="rounded-lg p-2 transition-all hover:bg-muted"><ArrowLeft size={18} /></a>
		{/if}
	</div>
	<div data-tauri-drag-region class={['grow font-semibold', isMac && 'text-center']}>
		{#if typeof title === 'function'}
			{@render title()}
		{:else}
			{title}
		{/if}
	</div>
	<div data-tauri-drag-region class="flex w-32 items-center justify-end gap-1 pr-2">
		{@render right?.()}
		{#if right && !isMac}
			<div class="h-6 border-r border-border pr-1"></div>
		{/if}
		<WindowControls />
	</div>
</div>
