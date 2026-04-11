<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { db } from '$lib/db';
	import { tray } from '$lib/tray';
	import { fade } from 'svelte/transition';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/plugin-notification';
	import './layout.css';

	const { children } = $props();

	import { onMount } from 'svelte';

	let mounted = $state(false);

	onMount(() => {
		db.init();
		mounted = true;

		isPermissionGranted().then(async (isGranted) => {
			if (!isGranted) {
				const permission = await requestPermission();
			}
			// sendNotification({ title: 'Tauri', body: 'Tauri is awesome!' });
		});

		return () => {
			tray.clear();
		};
	});
</script>

{#if mounted}
	<div transition:fade={{ duration: 150 }} class="h-screen w-screen">
		{@render children()}
	</div>
{/if}
