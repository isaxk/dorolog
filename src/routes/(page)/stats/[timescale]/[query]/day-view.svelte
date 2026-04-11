<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import dayjs from 'dayjs';

	let { sessions, sessionsTether } = $props();

	const start = $derived(Math.max(0, dayjs(sessions[0]?.started_at).subtract(1, 'hours').hour()));
	const end = $derived(Math.min(24, dayjs(sessions[sessions.length - 1]?.ended_at).hour() + 2));

	const hours = $derived(
		Array(end - start + 1)
			.fill(0)
			.map((_, i) => i + start)
	);
</script>

<div class="py-5">
	<div class="relative flex flex-col">
		{#each hours as hour}
			<div class="h-11">
				<div class="flex items-center gap-2 px-8">
					<div class="w-10 text-center text-sm text-zinc-500">
						{(hour === 24 ? 0 : hour).toString().padStart(2, '0')}:00
					</div>
					<div class="h-px grow bg-border/50"></div>
				</div>
			</div>
		{/each}
		{#each sessions as session}
			<Tooltip.Trigger
				tether={sessionsTether}
				payload={{
					tag: session.tag,
					duration: session.minutes,
					start: dayjs(session.started_at).format('HH:mm'),
					end: dayjs(session.ended_at).format('HH:mm'),
					color: session.color
				}}
				class="group absolute right-20 left-32 min-h-1"
				style={{
					top: `${
						(dayjs(session.started_at).hour() - start) * 44 +
						(dayjs(session.started_at).minute() / 60) * 44 +
						10
					}px`,

					height: `${(session.minutes / 60) * 40}px`
				}}
			>
				<div
					style:background-color={session.color.fg}
					class="h-full w-full rounded-[5px] bg-black text-white transition-all group-hover:translate-y-px group-hover:scale-98"
				></div>
			</Tooltip.Trigger>
		{/each}
	</div>
</div>
