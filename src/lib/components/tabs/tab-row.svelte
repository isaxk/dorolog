<script lang="ts">
	let { children } = $props();
</script>

<div class="flex w-full rounded-[10px] bg-muted p-0.5 drop-shadow-sm">
	{@render children?.()}
</div>
