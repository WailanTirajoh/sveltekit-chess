<script lang="ts">
	import Icon from '@iconify/svelte';
	const boardVerticalSize = [1, 2, 3, 4, 5, 6, 7, 8];

	// Create this with number so its easier to implement with chess rules.
	const boardHorizontalSize = [1, 2, 3, 4, 5, 6, 7, 8];

	// We reverse it for now, latter it will depend on the player perspective (reverse for player 1, and normal for player black)
	const verticalBoardSort = boardVerticalSize.reverse();
	const isOdd = (boardNumber: number) => boardNumber % 2 === 0;

	const horizontalAlias: Record<number, string> = {
		1: 'a',
		2: 'b',
		3: 'c',
		4: 'd',
		5: 'e',
		6: 'f',
		7: 'g',
		8: 'h'
	};

	interface Piece {
		icon: string;
		player: 1 | 2;
	}

	/**
	 * Starting position, latter we create draggable pieces,
	 * and we have to mark the id with '{row}_{col}' so that when we drop,
	 * we update the key on this object
	 */
	let boardPosition: Record<string, Piece> = {
		'1_1': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_2': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_3': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_4': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_5': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_6': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_7': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'1_8': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_1': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_2': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_3': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_4': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_5': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_6': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_7': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		},
		'2_8': {
			icon: 'fa-solid:chess-pawn',
			player: 1
		}
	};
</script>

<!-- Create board UI -->
<div class="flex justify-center">
	<div class="grid grid-cols-8 w-max border-2 border-black rounded overflow-hidden">
		{#each verticalBoardSort as vertical}
			{#each boardHorizontalSize as horizontal}
				<div
					class="{isOdd(vertical)
						? 'odd:bg-[#e9edcc] even:bg-[#779954]'
						: 'odd:bg-[#779954] even:bg-[#e9edcc]'} h-16 w-16 relative flex justify-center items-center"
				>
					{#if Object.keys(boardPosition).includes(`${vertical}_${horizontal}`)}
						<div
							class={boardPosition[`${vertical}_${horizontal}`].player === 1
								? 'text-white'
								: 'text-black'}
						>
							<Icon icon={boardPosition[`${vertical}_${horizontal}`].icon} width="30" height="30" />
						</div>
					{/if}
					{#if vertical === 1}
						<div
							class="absolute bottom-1 right-1 {isOdd(horizontal)
								? 'text-[#779954]'
								: 'text-[#e9edcc]'}"
						>
							{horizontalAlias[horizontal]}
						</div>
					{/if}
					{#if horizontal === 1}
						<div
							class="absolute top-1 left-1 {isOdd(vertical) ? 'text-[#779954]' : 'text-[#e9edcc]'}"
						>
							{vertical}
						</div>
					{/if}
				</div>
			{/each}
		{/each}
	</div>
</div>
