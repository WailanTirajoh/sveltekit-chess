<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export let boardMove: string = '';

	function viewReplay() {
		dispatch('viewReplay', boardMove);
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
		on:click={() => viewReplay()}
	>
		View Replay
	</button>
</div>
