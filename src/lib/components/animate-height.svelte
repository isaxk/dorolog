<script lang="ts">
	import { onMount } from 'svelte';
	import { quadInOut, quadOut, quartIn, quartInOut, quartOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	let clientHeight: number = $state(0);

	let { children, class: className = '' } = $props();

	const height = new Tween(0, { duration: 100, easing: quadOut });

	onMount(() => {
		height.set(clientHeight, { duration: 0 });
	});

	$effect(() => {
		height.set(clientHeight);
	});
</script>

<div class={['overflow-hidden', className]} style:height="{height.current}px">
	<div bind:clientHeight>
		{@render children?.()}
	</div>
</div>
