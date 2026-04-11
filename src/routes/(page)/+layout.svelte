<script lang="ts">
	import { page } from '$app/state';
	import WindowHeader from '$lib/components/window-header.svelte';
	import { LogicalSize } from '@tauri-apps/api/dpi';
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { ArrowLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const mainWindow = new WebviewWindow('main');

		mainWindow.setSize(new LogicalSize(500, 650));

		return () => {
			mainWindow.setSize(new LogicalSize(500, 300));
		};
	});
</script>

<div class="flex h-screen flex-col">
	<WindowHeader showBackButton={true} title={page.data.title} />

	<div class="flex min-h-0 grow flex-col p-2 pt-0">
		{@render children?.()}
	</div>
</div>
