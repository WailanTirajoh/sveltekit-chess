<script lang="ts">
	export let moves: Array<PieceMoveHistory>;

	function copy() {
		const positions = moves.map((move) => {
			return `${move.startPosition.position},${move.endPosition.position}`;
		});

		navigator.clipboard.writeText(positions.join('|'));
	}
</script>

<div class="bg-[#262522] rounded shadow-inner text-gray-100 overflow-hidden">
	{#if moves.length === 0}
		<div class="text-center p-2">Let's move the pieces</div>
	{:else}
		<div class="w-full p-2 bg-[#21201d]">Board History</div>
		<div class="grid grid-cols-2 p-2">
			<div class="">White</div>
			<div class="">Black</div>
		</div>
		<hr class="border border-[#21201d]" />
		<div class="grid grid-cols-2 gap-y-2 p-2 max-h-72 overflow-auto">
			{#each moves as move}
				<div class="bg-[#21201d] p-2">
					{move.startPosition.position} - {move.endPosition.position}
				</div>
			{/each}
		</div>
		<button
			class="w-full p-2 bg-[#21201d] hover:bg-[#282724] active:bg-[#151412] duration-150"
			on:click={() => copy()}
		>
			Copy
		</button>
	{/if}
</div>
