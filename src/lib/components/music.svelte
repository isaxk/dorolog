<script lang="ts">
	import {
		MusicIcon,
		PauseIcon,
		Volume2,
		Library,
		Pencil,
		PlayIcon,
		Check,
		PlusIcon
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

	import { DropdownMenu } from 'bits-ui';
	import { tray } from '$lib/tray';

	let channels = ['jfKfPfyJRdk', '4xDzrJKXOOY', '7NOSDKb0HlU'];

	let state = $state();
	let ytWin = $state(null);
	let id = $state('jfKfPfyJRdk');

	onMount(() => {
		WebviewWindow.getByLabel('yt').then((win: WebviewWindow | null) => {
			console.log(win?.window);
			ytWin = win?.window;
		});

		const musicUnsub = tray.subscribeToMusicControl((action) => {
			if (action === 'playpause') {
				togglePlay();
			}
		});

		return () => musicUnsub();

		// console.log(player);
	});

	$effect(() => {
		ytWin?.postMessage({ type: 'load', videoId: id }, '*');
	});

	function togglePlay() {
		if (state === 1) {
			ytWin?.postMessage({ type: 'pause' }, '*');
		} else {
			ytWin?.postMessage({ type: 'play' }, '*');
		}
	}
</script>

<div class="group flex h-max w-24 gap-2 overflow-hidden rounded-full bg-zinc-200 drop-shadow-sm">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			style="background-image: url(https://i.ytimg.com/vi/{id}/sddefault.jpg); background-size: 200%;"
			class="flex w-8 items-center justify-center border-r border-border bg-center"
		>
			<div
				class="flex h-full w-full items-center justify-center bg-black/50 text-white opacity-0 transition-all group-hover:opacity-100"
			>
				<Pencil size={18} />
			</div>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content
				sideOffset={4}
				alignOffset={4}
				align="center"
				class="mr-1 flex flex-col gap-1.5 rounded-xl border border-border bg-zinc-100 p-1.5 drop-shadow outline-none"
			>
				<div class="flex gap-1.5">
					{#each channels as channel, i (i)}
						<button
							class="aspect-square h-12 w-12 overflow-hidden rounded-lg bg-center"
							style:background-image="url(https://i.ytimg.com/vi/{channel}/sddefault.jpg)"
							style:background-size="200%"
							aria-label={channel}
							onclick={() => (id = channel)}
						>
							{#if id === channel}
								<div class="flex h-full w-full items-center justify-center bg-black/40 text-white">
									<Check />
								</div>
							{/if}
						</button>
					{/each}
				</div>
				<div class="flex w-48 gap-1 overflow-hidden rounded-lg border border-border bg-white">
					<input
						placeholder="Enter YouTube URL..."
						type="text"
						class="min-w-0 grow rounded-lg bg-white p-1 px-1.5 text-xs"
						name=""
						id=""
					/>
					<button class="border-l border-border bg-zinc-200 p-1 px-1.5 text-xs">Add</button>
				</div>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
	<div class="flex grow items-center justify-evenly gap-2 py-2 pr-3">
		{#if state !== 2}
			<PauseIcon onclick={togglePlay} size={18} />
		{:else}
			<PlayIcon onclick={togglePlay} size={18} />
		{/if}
		<Volume2 size={16} />
	</div>
</div>
