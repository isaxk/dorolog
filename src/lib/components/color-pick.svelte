<script>
	import { colors } from '$lib/data';
	import { Select } from 'bits-ui';
	import { Check, Pencil } from 'lucide-svelte';

	let { value = $bindable('red'), onOpenChange = () => {} } = $props();
</script>

<Select.Root
	onOpenChange={(open) => {
		onOpenChange(open);
	}}
	type="single"
	bind:value
>
	<Select.Trigger
		class="ml-1 h-full w-full overflow-hidden rounded-lg outline-none"
		style={{ backgroundColor: colors[value]?.fg }}
	>
		<div class="flex h-full w-full items-center justify-center bg-black/10 text-white">
			<Pencil size={12} />
		</div>
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			align="center"
			class="overflow-hidden rounded-lg border border-zinc-100 bg-white p-0.5 drop-shadow-md"
		>
			<div class="grid grid-cols-5 overflow-hidden rounded-md">
				{#each Object.entries(colors) as [color, { fg }]}
					<Select.Item value={color}>
						<div class="h-5 w-5" style:background-color={fg}>
							{#if color === value}
								<div class="flex h-5 w-5 items-center justify-center bg-black/40 text-white">
									<Check size={14} />
								</div>
							{/if}
						</div>
					</Select.Item>
				{/each}
			</div>
		</Select.Content>
	</Select.Portal>
</Select.Root>
