<script lang="ts">
	import { PLAYER_BLACK } from '$lib/chess/core';
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';

	const VERTICAL_DIRECTION = [1, 2, 3, 4, 5, 6, 7, 8];
	const HORIZONTAL_DIRECTION = [1, 2, 3, 4, 5, 6, 7, 8];
	const HORIZONTAL_ALIAS: Record<number, string> = {
		1: 'a',
		2: 'b',
		3: 'c',
		4: 'd',
		5: 'e',
		6: 'f',
		7: 'g',
		8: 'h'
	};

	const dispatch = createEventDispatcher();

	export let board: Board = {};
	export let activePlayer: Player = 1;
	export let activePiece: ActivePiece | null = null;
	export let rotateable: boolean = true;

	$: rotate = !rotateable ? '' : activePlayer === PLAYER_BLACK ? 'rotate-180' : '';

	const VERTICAL_DIRECTION_REVERSE = VERTICAL_DIRECTION.reverse();

	function isOdd(number: number) {
		return number % 2 === 0;
	}

	function onCellClick(position: ChessPosition) {
		dispatch('cellClick', {
			position
		});
	}
</script>

<div class="bg-black p-2">
	<div
		class="
			grid grid-cols-8 w-max h-max rounded-md overflow-hidden bg-white duration-150 mx-auto
			{rotate}
		"
	>
		{#each VERTICAL_DIRECTION_REVERSE as vertical}
			{#each HORIZONTAL_DIRECTION as horizontal}
				{@const position = `${vertical}_${horizontal}`}
				{@const piece = board[position]}
				<button
					id={position}
					aria-label="chess-board-cell-${position}"
					class="
						h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 relative flex justify-center items-center transition-width duration-300 transition-border
						{activePiece?.position === position ? '!bg-green-600 !bg-opacity-60 ' : ''}
						{isOdd(vertical) ? 'odd:bg-[#e9edcc] even:bg-[#779954]' : 'odd:bg-[#779954] even:bg-[#e9edcc]'} 
					"
					on:click={() => {
						onCellClick(position);
					}}
				>
					{#if piece !== undefined}
						<div class={piece?.player === 1 ? 'text-white' : 'text-black'}>
							<Icon
								icon={piece?.piece.icon ?? ''}
								class="
									!w-7 !h-7 md:!w-9 md:!h-9 duration-300 								
									{rotate}
								"
							/>
						</div>
					{/if}
					{#if vertical === 1}
						<div
							class="
								absolute bottom-1 right-1 text-xs md:text-base
								{isOdd(horizontal) ? 'text-[#779954]' : 'text-[#e9edcc]'} 
								{rotate}
							"
						>
							{HORIZONTAL_ALIAS[horizontal]}
						</div>
					{/if}
					{#if horizontal === 1}
						<div
							class="
								absolute top-1 left-1 text-xs md:text-base
								{isOdd(vertical) ? 'text-[#779954]' : 'text-[#e9edcc]'} 
								{rotate}
							"
						>
							{vertical}
						</div>
					{/if}
					<slot name="cell" {position} />
				</button>
			{/each}
		{/each}
	</div>
</div>
