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
	export let boardSize: 'xxs' | 'xs' | 'sm' | 'md' | 'default' = 'default';
	export let lastMove: PieceMoveHistory | null = null

	const boardClass: Record<typeof boardSize, string> = {
		xxs: 'w-8 h-8 sm:h-10 sm:w-10 md:h-12 md:w-12',
		xs: 'w-8 h-8 sm:h-11 sm:w-11 md:h-13 md:w-13',
		md: 'w-8 h-8 sm:h-12 sm:w-12 md:h-14 md:w-14',
		sm: 'w-10 h-10 sm:h-13 sm:w-13 md:h-15 md:w-15',
		default: 'w-11 h-11 sm:h-16 sm:w-16 md:h-20 md:w-20'
	};

	const pieceClass: Record<typeof boardSize, string> = {
		xxs: '!w-5 !h-5 sm:!w-5 sm:!h-5 md:!w-6 md:!h-6',
		xs: '!w-5 !h-5 sm:!w-7 sm:!h-7 md:!w-8 md:!h-8',
		md: '!w-5 !h-5 sm:!w-7 sm:!h-7 md:!w-8 md:!h-8',
		sm: '!w-5 !h-5 sm:!w-7 sm:!h-7 md:!w-8 md:!h-8',
		default: '!w-7 !h-7 sm:!w-9 sm:!h-9 md:!w-10 md:!h-10'
	};

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
					aria-label="chess-board-cell-{position}"
					class="
						relative flex justify-center items-center transition-width duration-300 transition-border
						{activePiece?.position === position ? '!bg-green-600 !bg-opacity-60 ' : ''}
						{isOdd(vertical) ? 'odd:bg-[#e9edcc] even:bg-[#779954]' : 'odd:bg-[#779954] even:bg-[#e9edcc]'} 
						{boardClass[boardSize] ?? ''}
						{[lastMove?.startPosition, lastMove?.finalPosition].includes(position) ? '!bg-orange-300' : ''}
					"
					on:click={() => {
						onCellClick(position);
					}}
				>
					{#if piece}
						<div class={piece.player === 1 ? 'text-[#ffffff]' : 'text-[#2c2b2b]'}>
							<Icon icon={piece.piece.icon ?? ''} class="{pieceClass[boardSize]} duration-300 {rotateClass}" />
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
