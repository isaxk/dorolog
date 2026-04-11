<script lang="ts">
	let { value } = $props();

	const hours = $derived(Math.floor(value / 60));
	const minutes = $derived(Math.floor(value % 60));
</script>

{#if hours > 0}
	{hours}h {minutes}m
{:else}
	{minutes}m
{/if}
