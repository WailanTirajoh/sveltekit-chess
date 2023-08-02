<script lang="ts">
	import Icon from '@iconify/svelte';
	const boardVerticalSize = [1, 2, 3, 4, 5, 6, 7, 8];

	// Create this with number so its easier to implement with chess rules.
	const boardHorizontalSize = [1, 2, 3, 4, 5, 6, 7, 8];

	// We reverse it for now, latter it will depend on the player perspective (reverse for player 1, and normal for player black)
	const verticalBoardSort = boardVerticalSize.reverse();
	const isOdd = (number: number) => number % 2 === 0;

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

	type Player = 1 | 2;

	// We will create rule interface latter when we get into this (Should be after drag & drop)
	interface Piece {
		name: PieceName;
		icon: string;
		rule: (startPosition: string, finalPosition: string, player: Player) => boolean;
	}

	interface PlayerPiece {
		piece: Piece;
		player: Player;
	}

	type PieceName = 'rook' | 'knight' | 'bishop' | 'queen' | 'king' | 'pawn';
	const PLAYER_WHITE = 1;
	const PLAYER_BLACK = 2;
	const chessPiece: Record<PieceName, Piece> = {
		rook: {
			name: 'rook',
			icon: 'fa-solid:chess-rook',
			rule: () => true
		},
		knight: {
			name: 'knight',
			icon: 'fa6-solid:chess-knight',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

				// left top 1
				if (startHorizontal - finalHorizontal === 2) {
					if (finalVertical - startVertical === 1) return true;
				}
				// left top 2
				if (startHorizontal - finalHorizontal === 1) {
					if (finalVertical - startVertical === 2) return true;
				}
				// right top 1
				if (finalHorizontal - startHorizontal === 2) {
					if (finalVertical - startVertical === 1) return true;
				}
				// right top 2
				if (finalHorizontal - startHorizontal === 1) {
					if (finalVertical - startVertical === 2) return true;
				}
				// left bottom 1
				if (startHorizontal - finalHorizontal === 2) {
					if (startVertical - finalVertical === 1) return true;
				}
				// left bottom 2
				if (startHorizontal - finalHorizontal === 1) {
					if (startVertical - finalVertical === 2) return true;
				}
				// right bottom 1
				if (finalHorizontal - startHorizontal === 2) {
					if (startVertical - finalVertical === 1) return true;
				}
				// right bottom 2
				if (finalHorizontal - startHorizontal === 1) {
					if (startVertical - finalVertical === 2) return true;
				}

				return false;
			}
		},
		bishop: {
			name: 'bishop',
			icon: 'tabler:chess-bishop-filled',
			rule: () => true
		},
		queen: {
			name: 'queen',
			icon: 'fa6-solid:chess-queen',
			rule: () => true
		},
		king: {
			name: 'king',
			icon: 'fa-solid:chess-king',
			rule: () => true
		},
		pawn: {
			name: 'pawn',
			icon: 'fa-solid:chess-pawn',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
				let enemy: PlayerPiece | null = null;
				if (boardPosition[`${finalVertical}_${finalHorizontal}`]) {
					if (boardPosition[`${finalVertical}_${finalHorizontal}`].player !== player) {
						enemy = boardPosition[`${finalVertical}_${finalHorizontal}`];
					}
				}

				if (player === PLAYER_WHITE) {
					// Check up left & up right has enemy or not
					if (finalHorizontal - startHorizontal === 1 || startHorizontal - finalHorizontal === 1) {
						if (finalVertical - startVertical === 1) {
							if (enemy) return true;
						}
					}

					if (startHorizontal === finalHorizontal) {
						// Can only move on the same horizontal position
						// Cant move backwards
						if (startVertical > finalVertical) return false;

						// Can move upward twice on first start
						if (startVertical === 2 && finalVertical - startVertical <= 2) return true;

						// Can move upward once
						if (finalVertical - startVertical === 1) {
							if (!enemy) return true;
						}
					}
				}

				return false;
			}
		}
	};

	/**
	 * Board position with {row_col} as the key
	 */
	let boardPosition: Record<string, PlayerPiece> = {
		// White starting position
		'1_1': {
			piece: chessPiece.rook,
			player: 1
		},
		'1_2': {
			piece: chessPiece.knight,
			player: 1
		},
		'1_3': {
			piece: chessPiece.bishop,
			player: 1
		},
		'1_4': {
			piece: chessPiece.queen,
			player: 1
		},
		'1_5': {
			piece: chessPiece.king,
			player: 1
		},
		'1_6': {
			piece: chessPiece.bishop,
			player: 1
		},
		'1_7': {
			piece: chessPiece.knight,
			player: 1
		},
		'1_8': {
			piece: chessPiece.rook,
			player: 1
		},
		'2_1': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_2': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_3': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_4': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_5': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_6': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_7': {
			piece: chessPiece.pawn,
			player: 1
		},
		'2_8': {
			piece: chessPiece.pawn,
			player: 1
		},

		// Black starting position
		'8_1': {
			piece: chessPiece.rook,
			player: 2
		},
		'8_2': {
			piece: chessPiece.knight,
			player: 2
		},
		'8_3': {
			piece: chessPiece.bishop,
			player: 2
		},
		'8_4': {
			piece: chessPiece.queen,
			player: 2
		},
		'8_5': {
			piece: chessPiece.king,
			player: 2
		},
		'8_6': {
			piece: chessPiece.bishop,
			player: 2
		},
		'8_7': {
			piece: chessPiece.knight,
			player: 2
		},
		'8_8': {
			piece: chessPiece.rook,
			player: 2
		},
		'7_1': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_2': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_3': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_4': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_5': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_6': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_7': {
			piece: chessPiece.pawn,
			player: 2
		},
		'7_8': {
			piece: chessPiece.pawn,
			player: 2
		}
	};

	interface ActivePiece extends PlayerPiece {
		position: string;
	}
	let activePiece: ActivePiece | null = null;

	function moveRule(piece: ActivePiece | null, finalPosition: string) {
		if (!piece) return false;

		// Dont do anything if its on same place
		if (piece.position === finalPosition) return false;

		// Piece cant eat his own piece xD
		if (piece.player === boardPosition[finalPosition]?.player) return false;

		// Stop when violating the rules
		if (!piece.piece.rule(piece.position, finalPosition, piece.player)) return false;

		return true;
	}

	function move(piece: ActivePiece | null, finalPosition: string) {
		if (!moveRule(piece, finalPosition)) return;
		if (!piece) return;
		// Update board position
		boardPosition[finalPosition] = {
			piece: piece.piece,
			player: piece.player
		};

		delete boardPosition[piece.position];

		activePiece = null;
	}

	function setActivePiece(piece: PlayerPiece, startPosition: string) {
		activePiece = { ...piece, position: startPosition };
	}
</script>

<!-- Create board UI -->
<pre>activePiece: {activePiece?.player} - {activePiece?.piece.name}</pre>
<div class="flex justify-center">
	<div class="grid grid-cols-8 w-max border-2 border-black rounded overflow-hidden">
		{#each verticalBoardSort as vertical}
			{#each boardHorizontalSize as horizontal}
				<button
					on:click={() => move(activePiece, `${vertical}_${horizontal}`)}
					class="{isOdd(vertical)
						? 'odd:bg-[#e9edcc] even:bg-[#779954]'
						: 'odd:bg-[#779954] even:bg-[#e9edcc]'} h-16 w-16 relative flex justify-center items-center {activePiece?.position ===
					`${vertical}_${horizontal}`
						? '!bg-gray-600 !bg-opacity-60'
						: ''}
                        {moveRule(activePiece, `${vertical}_${horizontal}`)
						? '!bg-green-600 !bg-opacity-30'
						: ''}
                        "
				>
					{#if Object.keys(boardPosition).includes(`${vertical}_${horizontal}`)}
						<div
							class={boardPosition[`${vertical}_${horizontal}`].player === 1
								? 'text-white'
								: 'text-black'}
						>
							<button
								on:click={() =>
									setActivePiece(
										boardPosition[`${vertical}_${horizontal}`],
										`${vertical}_${horizontal}`
									)}
							>
								<Icon
									icon={boardPosition[`${vertical}_${horizontal}`].piece.icon}
									width="30"
									height="30"
								/>
							</button>
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
				</button>
			{/each}
		{/each}
	</div>
</div>
