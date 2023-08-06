<script lang="ts">
	import { PLAYER_BLACK } from '$lib/chess/core';

	export let timeLeft: number;
	export let initialTime: number;
	export let player: Player;

	$: lifetimePercent = (timeLeft / initialTime) * 100;
	$: barStyle = `width: ${lifetimePercent}%`;
</script>

<div
	{...$$restProps }
	class="
		w-full h-6 px-2 overflow-hidden duration-500
		{player === PLAYER_BLACK ? 'bg-black text-white' : 'bg-white text-black'}
	"
	style={barStyle}
>
	{timeLeft}
</div>
