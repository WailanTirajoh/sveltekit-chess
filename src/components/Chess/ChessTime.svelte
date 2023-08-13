<script lang="ts">
	import { PLAYER_BLACK } from '$lib/chess/core';
	import { formatTime } from '$lib/utils/time';

	export let timeLeft: number;
	export let initialTime: number;
	export let player: Player;

	$: lifetimePercent = (timeLeft / initialTime) * 100;
	$: barStyle = `width: ${lifetimePercent}%`;
</script>

<div
	{...$$restProps}
	class="
		w-full h-6 overflow-hidden duration-500 relative {$$props.class}
		{player === PLAYER_BLACK ? 'bg-black text-white' : 'bg-white text-black'}
	"
	style={barStyle}
>
	<div class="absolute left-2">
		{formatTime(timeLeft)}
	</div>
	{#if lifetimePercent < 20}
		<span
			class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-900 opacity-75"
		/>
	{/if}
</div>
