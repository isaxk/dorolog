<script lang="ts">
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { Minus, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let window: WebviewWindow | null = null;

	onMount(() => {
		window = new WebviewWindow('main');
	});
</script>

<div class="flex pl-1.5">
	<button class="px-1.5 py-2" on:click={() => window?.minimize()}>
		<Minus size={18} />
	</button>
	<button class="px-1.5 py-2" on:click={() => window?.close()}>
		<X size={18} />
	</button>
</div>
