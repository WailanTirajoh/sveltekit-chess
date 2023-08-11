<script lang="ts">
	import { CHESS_PIECE } from '$lib/chess/core';
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
	export let activePiece: ActivePiece | null = null;
	export let rotate: boolean = true;

	$: rotateClass = !rotate ? 'rotate-180' : '';

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

<div>
	<div
		class="
			grid grid-cols-8 w-max h-max rounded-md overflow-hidden bg-white duration-700 mx-auto
			{rotateClass}
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
						w-11 h-11 sm:h-14 sm:w-14 md:h-16 md:w-16 relative flex justify-center items-center transition-width duration-300 transition-border
						{activePiece?.position === position ? '!bg-green-600 !bg-opacity-60 ' : ''}
						{isOdd(vertical) ? 'odd:bg-[#e9edcc] even:bg-[#779954]' : 'odd:bg-[#779954] even:bg-[#e9edcc]'} 
					"
					on:click={() => {
						onCellClick(position);
					}}
				>
					{#if piece}
						<div class={piece.player === 1 ? 'text-white' : 'text-black'}>
							<Icon
								icon={piece.piece.icon ?? ''}
								class="
								!w-6 !h-6 sm:!w-8 sm:!h-8 md:!w-9 md:!h-9 duration-300 								
									{rotateClass} {piece.piece.name === CHESS_PIECE.bishop.name
									? '!w-8 !h-8 sm:!w-10 sm:!h-10 md:!w-11 md:!h-11'
									: ''}
								"
							/>
						</div>
					{/if}
					{#if vertical === 1}
						<div
							class="
								absolute bottom-1 right-1 text-xs md:text-base
								{isOdd(horizontal) ? 'text-[#779954]' : 'text-[#e9edcc]'} 
								{rotateClass}
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
								{rotateClass}
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
