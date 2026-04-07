<script lang="ts">
	import { page } from '$app/state';
	import { LogicalSize } from '@tauri-apps/api/dpi';
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { ArrowLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const mainWindow = new WebviewWindow('main');

		mainWindow.setSize(new LogicalSize(500, 600));

		return () => {
			mainWindow.setSize(new LogicalSize(500, 300));
		};
	});
</script>

<div class="flex h-screen flex-col">
	<div class="flex min-h-10 items-center bg-white text-sm">
		<div class="flex w-32 items-center">
			<div class="w-16"></div>
			<a href="/" class="rounded-lg p-2 transition-all hover:bg-zinc-100"><ArrowLeft size={18} /></a
			>
		</div>
		<div data-tauri-drag-region class="grow text-center font-semibold">{page.data.title}</div>
		<div data-tauri-drag-region class="w-32"></div>
	</div>

	<div class="flex min-h-0 grow flex-col p-2 pt-0">
		{@render children?.()}
	</div>
</div>
