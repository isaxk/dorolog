<script lang="ts">
	import ColorPick from '$lib/components/color-pick.svelte';
	import { colors } from '$lib/data';
	import { localStore } from '$lib/localStore.svelte';
	import { Trash2, X } from 'lucide-svelte';

	const tags = localStore<{ name: string; color: string }[]>('tags', []);
</script>

<div class="p-2">
	<div class="text-lg font-semibold">Tags</div>
	<div class="flex flex-col gap-2 py-2">
		{#each tags.value.toSorted((a, b) => a.name.localeCompare(b.name)) as tag}
			<div class="flex items-center gap-2">
				<div style:color={colors[tag.color]?.fg} class="flex grow font-medium">
					#{tag.name}
				</div>
				<div class="h-6 w-6">
					<ColorPick bind:value={tag.color} />
				</div>
				<button
					onclick={() => (tags.value = tags.value.filter((t) => t.name !== tag.name))}
					class="p-1 pr-0"><X size={16} /></button
				>
			</div>
		{/each}
	</div>
</div>
