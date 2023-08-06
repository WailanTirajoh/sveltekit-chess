<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let boardMove: string = '2_5,4_5|7_5,5_5|1_7,3_6|8_2,6_3|1_2,3_3|7_4,6_4|2_4,3_4|8_7,6_6|1_3,5_7|8_6,7_5|1_6,2_5|6_6,4_7|5_7,7_5|8_4,7_5|1_5,1_7|7_5,4_8|2_7,3_7|4_8,3_8|3_6,5_7|3_8,2_8';

	function submitChessMove() {
		dispatch('boardMove', boardMove);
	}
</script>

<div class="">
	<textarea
		bind:value={boardMove}
		cols="30"
		rows="10"
		class="w-full rounded p-2 bg-[#282724] focus:outline-none focus:border-[#151412] border-2 border-[#282724] duration-300 text-white"
		placeholder="Copy board history and insert here to watch the replay!"
	/>
	<button
		class="w-full p-2 bg-[#21201d] hover:bg-[#282724] active:bg-[#151412] duration-150 text-white"
		on:click={() => submitChessMove()}
	>
		View Replay
	</button>
</div>
