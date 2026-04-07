<script lang="ts">
	import { db } from '$lib/db';
	import { tray } from '$lib/tray';
	import './layout.css';

	const { children } = $props();

	import { onMount } from 'svelte';

	onMount(() => {
		db.init();

		return () => {
			tray.clear();
		};
	});
</script>

{@render children()}
