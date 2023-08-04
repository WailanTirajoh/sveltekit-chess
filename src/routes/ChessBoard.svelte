<script lang="ts">
	import Icon from '@iconify/svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let boardPosition: BoardPosition = {};
	export let activePlayer: Player = 1;
	export let activePiece: ActivePiece | null = null;

	const PLAYER_WHITE: Player = 1;
	const PLAYER_BLACK: Player = 2;

	const VERTICAL_DIRECTION = [1, 2, 3, 4, 5, 6, 7, 8];
	const HORIZONTAL_DIRECTION = [1, 2, 3, 4, 5, 6, 7, 8];
	const VERTICAL_DIRECTION_REVERSE = VERTICAL_DIRECTION.reverse();
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

	function isOdd(number: number) {
		return number % 2 === 0;
	}

	function onCellClick(position: ChessPosition) {
		dispatch('cellClick', {
			position
		});
	}
</script>

<div
	class="
        grid grid-cols-8 w-max h-max rounded-md overflow-hidden bg-white duration-150 mx-auto
        {activePlayer === PLAYER_BLACK ? 'rotate-180' : ''}
    "
>
	{#each VERTICAL_DIRECTION_REVERSE as vertical}
		{#each HORIZONTAL_DIRECTION as horizontal}
			<button
				on:click={() => {
					onCellClick(`${vertical}_${horizontal}`);
				}}
				class="
                    h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 relative flex justify-center items-center transition-width duration-300 transition-border
                    {activePiece?.position === `${vertical}_${horizontal}`
					? '!bg-green-600 !bg-opacity-60 '
					: ''}
                    {isOdd(vertical)
					? 'odd:bg-[#e9edcc] even:bg-[#779954]'
					: 'odd:bg-[#779954] even:bg-[#e9edcc]'} 
                "
			>
				{#if boardPosition[`${vertical}_${horizontal}`] !== undefined}
					<div
						class={boardPosition[`${vertical}_${horizontal}`]?.player === 1
							? 'text-white'
							: 'text-black'}
					>
						<Icon
							icon={boardPosition[`${vertical}_${horizontal}`]?.piece.icon ?? ''}
							class="
                                !w-6 !h-6 md:!w-8 md:!h-8 duration-300 
                                {activePlayer === PLAYER_BLACK ? 'rotate-180' : ''}
                            "
						/>
					</div>
				{/if}
				{#if vertical === 1}
					<div
						class="
                            absolute bottom-1 right-1 text-xs md:text-base
                            {isOdd(horizontal) ? 'text-[#779954]' : 'text-[#e9edcc]'} 
                            {activePlayer === PLAYER_BLACK ? 'rotate-180' : ''} 
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
                            {activePlayer === PLAYER_BLACK ? 'rotate-180' : ''} 
                        "
					>
						{vertical}
					</div>
				{/if}
				<slot name="cell" position={`${vertical}_${horizontal}`} />
			</button>
		{/each}
	{/each}
</div>
