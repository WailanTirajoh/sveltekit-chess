<script lang="ts">
	export let moves: PieceMoveHistory;
</script>

<div class="bg-[#262522] rounded shadow-inner text-gray-100">
	{#if moves.length === 0}
		<div class="text-center p-2">Let's move the pieces</div>
	{:else}
		<div class="grid grid-cols-2 p-2">
			<div class="">White</div>
			<div class="">Black</div>
		</div>
		<hr class="border border-[#21201d]" />
		<div class="grid grid-cols-2 gap-y-2 p-2">
			{#each moves as move}
				<div class="bg-[#21201d] p-2">
					{move.position}
				</div>
			{/each}
		</div>
	{/if}
</div>
