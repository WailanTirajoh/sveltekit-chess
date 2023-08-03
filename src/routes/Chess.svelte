<script lang="ts">
	import Icon from '@iconify/svelte';

	const PLAYER_WHITE = 1;
	const PLAYER_BLACK = 2;
	const verticalDirection = [1, 2, 3, 4, 5, 6, 7, 8];
	const horizontalDirection = [1, 2, 3, 4, 5, 6, 7, 8];
	let currentPlayer = PLAYER_WHITE;

	// We reverse it for now, latter it will depend on the player perspective (reverse for player 1, and normal for player black)
	const verticalBoardSort = verticalDirection.reverse();
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
	type ChessPosition = string;
	type BoardPosition = Partial<Record<ChessPosition, PlayerPiece>>;

	interface ActivePiece extends PlayerPiece {
		position: ChessPosition;
	}
	const chessPiece: Record<PieceName, Piece> = {
		rook: {
			name: 'rook',
			icon: 'fa-solid:chess-rook',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

				if (startHorizontal === finalHorizontal) {
					if (finalVertical > startVertical) {
						let hasEnemyBeforeEnd = false;
						for (let i = startVertical + 1; i < finalVertical; i++) {
							if (boardPosition[`${i}_${finalHorizontal}`]) {
								hasEnemyBeforeEnd = true;
								break;
							}
						}
						return !hasEnemyBeforeEnd;
					}
					if (finalVertical < startVertical) {
						let hasEnemyBeforeEnd = false;
						for (let i = startVertical - 1; i > finalVertical; i--) {
							if (boardPosition[`${i}_${finalHorizontal}`]) {
								hasEnemyBeforeEnd = true;
								break;
							}
						}
						return !hasEnemyBeforeEnd;
					}
				}

				if (startVertical === finalVertical) {
					if (finalHorizontal > startHorizontal) {
						let hasEnemyBeforeEnd = false;
						for (let i = startHorizontal + 1; i < finalHorizontal; i++) {
							if (boardPosition[`${finalVertical}_${i}`]) {
								hasEnemyBeforeEnd = true;
								break;
							}
						}
						return !hasEnemyBeforeEnd;
					}
					if (finalHorizontal < startHorizontal) {
						let hasEnemyBeforeEnd = false;
						for (let i = startHorizontal - 1; i > finalHorizontal; i--) {
							if (boardPosition[`${finalVertical}_${i}`]) {
								hasEnemyBeforeEnd = true;
								break;
							}
						}
						return !hasEnemyBeforeEnd;
					}
				}

				return false;
			}
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
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

				// Check if the move is diagonal
				if (
					Math.abs(finalVertical - startVertical) === Math.abs(finalHorizontal - startHorizontal)
				) {
					const verticalIncrement = finalVertical > startVertical ? 1 : -1;
					const horizontalIncrement = finalHorizontal > startHorizontal ? 1 : -1;

					let currentVertical = startVertical + verticalIncrement;
					let currentHorizontal = startHorizontal + horizontalIncrement;

					// Check for obstacles in the path of the bishop
					while (currentVertical !== finalVertical && currentHorizontal !== finalHorizontal) {
						if (boardPosition[`${currentVertical}_${currentHorizontal}`]) {
							// There is an obstacle in the path, so bishop cannot move
							return false;
						}
						currentVertical += verticalIncrement;
						currentHorizontal += horizontalIncrement;
					}

					// Check if the destination position is empty or has an enemy piece
					const destinationPiece = boardPosition[`${finalVertical}_${finalHorizontal}`];
					if (!destinationPiece || destinationPiece.player !== player) {
						// The move is valid if the destination is empty or has an enemy piece
						return true;
					}
				}

				// If none of the conditions are satisfied, the move is not valid for the bishop
				return false;
			}
		},
		queen: {
			name: 'queen',
			icon: 'fa6-solid:chess-queen',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

				// Check if the move is horizontal, vertical, or diagonal
				if (
					startVertical === finalVertical || // Horizontal move
					startHorizontal === finalHorizontal || // Vertical move
					Math.abs(finalVertical - startVertical) === Math.abs(finalHorizontal - startHorizontal) // Diagonal move
				) {
					// Check for obstacles in the path of the queen
					if (startVertical === finalVertical) {
						// Horizontal move
						const increment = finalHorizontal > startHorizontal ? 1 : -1;
						for (let i = startHorizontal + increment; i !== finalHorizontal; i += increment) {
							if (boardPosition[`${finalVertical}_${i}`]) {
								// There is an obstacle in the path, so queen cannot move
								return false;
							}
						}
					} else if (startHorizontal === finalHorizontal) {
						// Vertical move
						const increment = finalVertical > startVertical ? 1 : -1;
						for (let i = startVertical + increment; i !== finalVertical; i += increment) {
							if (boardPosition[`${i}_${finalHorizontal}`]) {
								// There is an obstacle in the path, so queen cannot move
								return false;
							}
						}
					} else {
						// Diagonal move
						const verticalIncrement = finalVertical > startVertical ? 1 : -1;
						const horizontalIncrement = finalHorizontal > startHorizontal ? 1 : -1;

						let currentVertical = startVertical + verticalIncrement;
						let currentHorizontal = startHorizontal + horizontalIncrement;

						while (currentVertical !== finalVertical && currentHorizontal !== finalHorizontal) {
							if (boardPosition[`${currentVertical}_${currentHorizontal}`]) {
								// There is an obstacle in the path, so queen cannot move
								return false;
							}
							currentVertical += verticalIncrement;
							currentHorizontal += horizontalIncrement;
						}
					}

					// Check if the destination position is empty or has an enemy piece
					const destinationPiece = boardPosition[`${finalVertical}_${finalHorizontal}`];
					if (!destinationPiece || destinationPiece.player !== player) {
						// The move is valid if the destination is empty or has an enemy piece
						return true;
					}
				}

				// If none of the conditions are satisfied, the move is not valid for the queen
				return false;
			}
		},
		king: {
			name: 'king',
			icon: 'fa-solid:chess-king',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

				// Check if the move is one square in any direction
				if (
					Math.abs(finalVertical - startVertical) <= 1 &&
					Math.abs(finalHorizontal - startHorizontal) <= 1
				) {
					// Check if the destination position is empty or has an enemy piece
					const destinationPiece = boardPosition[`${finalVertical}_${finalHorizontal}`];
					if (!destinationPiece || destinationPiece.player !== player) {
						return true;
					}
				}

				return false;
			}
		},
		pawn: {
			name: 'pawn',
			icon: 'fa-solid:chess-pawn',
			rule: (startPosition, finalPosition, player: 1 | 2) => {
				const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
				const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
				let enemy: PlayerPiece | null = null;
				const finalPositionPawn = boardPosition[`${finalVertical}_${finalHorizontal}`];
				if (finalPositionPawn) {
					if (finalPositionPawn.player !== player) {
						enemy = finalPositionPawn;
					}
				}

				if (player === 1) {
					// Player 1 is white, can only move upward

					// Check if the pawn is moving one square forward
					if (startHorizontal === finalHorizontal && finalVertical - startVertical === 1) {
						// Check if the destination position is empty
						if (!boardPosition[`${finalVertical}_${finalHorizontal}`]) {
							return true;
						}
					}

					// Check if the pawn is moving two squares forward from the starting position
					if (
						startVertical === 2 &&
						finalVertical - startVertical === 2 &&
						startHorizontal === finalHorizontal
					) {
						// Check if the two squares in front of the pawn are empty
						if (
							!boardPosition[`${startVertical + 1}_${startHorizontal}`] &&
							!boardPosition[`${finalVertical}_${finalHorizontal}`]
						) {
							return true;
						}
					}

					// Check if the pawn is capturing an enemy piece diagonally
					if (
						Math.abs(finalHorizontal - startHorizontal) === 1 &&
						finalVertical - startVertical === 1
					) {
						// Check if there is an enemy piece at the destination position
						if (enemy) {
							return true;
						}
					}
				} else {
					// Player 2 is black, can only move downward

					// Check if the pawn is moving one square forward
					if (startHorizontal === finalHorizontal && startVertical - finalVertical === 1) {
						// Check if the destination position is empty
						if (!boardPosition[`${finalVertical}_${finalHorizontal}`]) {
							return true;
						}
					}

					// Check if the pawn is moving two squares forward from the starting position
					if (
						startVertical === 7 &&
						startVertical - finalVertical === 2 &&
						startHorizontal === finalHorizontal
					) {
						// Check if the two squares in front of the pawn are empty
						if (
							!boardPosition[`${startVertical - 1}_${startHorizontal}`] &&
							!boardPosition[`${finalVertical}_${finalHorizontal}`]
						) {
							return true;
						}
					}

					// Check if the pawn is capturing an enemy piece diagonally
					if (
						Math.abs(finalHorizontal - startHorizontal) === 1 &&
						startVertical - finalVertical === 1
					) {
						// Check if there is an enemy piece at the destination position
						if (enemy) {
							return true;
						}
					}
				}

				// If none of the conditions are satisfied, the move is not valid for the pawn
				return false;
			}
		}
	};

	/**
	 * Board position with {row_col} as the key
	 */
	let boardPosition: BoardPosition = {
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
	let activePiece: ActivePiece | null = null;

	function pieceMoveRule(piece: ActivePiece | null, finalPosition: ChessPosition, player?: 1 | 2) {
		if (!piece) return false;

		// Dont move other player piece
		if(!player) {
			if (piece?.player !== currentPlayer) return false;
		}
		// Dont do anything if its on same place
		if (piece.position === finalPosition) return false;

		// Piece cant eat his own piece xD
		if (piece.player === boardPosition[finalPosition]?.player) return false;

		// Stop when violating the rules
		if (!piece.piece.rule(piece.position, finalPosition, piece.player)) return false;

		return true;
	}

	/**
	 * @param piece
	 * @param finalPosition
	 */
	function kingCanBeCaputuredAfterMove(piece: ActivePiece | null, finalPosition: ChessPosition) {
		const oldPosition = { ...boardPosition };
		if (!pieceMoveRule(piece, finalPosition)) return;
		if (!piece) return;
		// Update board position
		boardPosition[finalPosition] = {
			piece: piece.piece,
			player: piece.player
		};

		delete boardPosition[piece.position];

		const opponentPlayer = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
		const oponentPieceAvailableMove = Object.entries(
			Object.fromEntries(
				Object.entries(boardPosition).filter(([key, value]) => value?.player !== piece.player)
			)
		)
			.map(([position, piece]) => getValidMovesForPiece(piece!, position, opponentPlayer).flat())
			.flat();

		let ourKingPosition = null;
		for (const [position, piece2] of Object.entries(boardPosition)) {
			if (piece2?.player === piece.player && piece2?.piece.name === 'king') {
				ourKingPosition = position;
				break;
			}
		}

		if (!ourKingPosition) {
			// This should not be possible since game is over without king xD
			return true;
		}

		if (oponentPieceAvailableMove.includes(ourKingPosition)) {
			// Reset the board with old board.
			boardPosition = { ...oldPosition };
			alert('Invalid Move!');
			return true;
		}
		return false;
	}

	function getValidMovesForPiece(
		piece: PlayerPiece,
		currentPosition: ChessPosition,
		player?: 1 | 2
	): ChessPosition[] {
		const validMoves: ChessPosition[] = [];

		for (let vertical = 1; vertical <= 8; vertical++) {
			for (let horizontal = 1; horizontal <= 8; horizontal++) {
				const finalPosition = `${vertical}_${horizontal}` as `${number}_${number}`;

				if (
					pieceMoveRule({ ...piece, position: currentPosition }, finalPosition, player) &&
					currentPosition !== finalPosition
				) {
					const clonedBoardPosition = { ...boardPosition };
					const currentPiece = clonedBoardPosition[currentPosition];
					delete clonedBoardPosition[currentPosition];
					clonedBoardPosition[finalPosition] = currentPiece;

					validMoves.push(finalPosition);
				}
			}
		}

		return validMoves;
	}

	function pieceMove(piece: ActivePiece | null, finalPosition: ChessPosition) {
		if (!pieceMoveRule(piece, finalPosition)) return;

		// Check if the king is in danger after making the move
		if (kingCanBeCaputuredAfterMove(piece, finalPosition)) return false;

		if (!piece) return;
		// Update board position
		boardPosition[finalPosition] = {
			piece: piece.piece,
			player: piece.player
		};

		delete boardPosition[piece.position];

		activePiece = null;

		currentPlayer = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
	}

	function setActivePiece(piece: PlayerPiece, startPosition: ChessPosition) {
		activePiece = { ...piece, position: startPosition };
	}
</script>

<!-- Create board UI -->
<div class="flex justify-center h-full gap-8 p-4">
	<div class="grid gap-4">
		<div class="text-left text-white">
			{currentPlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
		</div>
		<div class="text-white">Valid move:</div>
		<div class="text-white">
			<div class="">White</div>
			<div class="grid grid-cols-3 gap-4 w-max h-max">
				{#each Object.entries(Object.fromEntries(Object.entries(boardPosition).filter(([key, value]) => value?.player === PLAYER_WHITE))) as [position, piece]}
					{#if piece && position}
						<div class="border p-2 rounded w-28 h-20">
							<div class="">
								{piece.piece.name}
							</div>
							<div class="">
								{getValidMovesForPiece(piece, position).join(',')}
								<!-- {position} -->
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<div class="text-white">
			<div class="">Black</div>
			<div class="grid grid-cols-3 gap-4 w-max h-max">
				{#each Object.entries(Object.fromEntries(Object.entries(boardPosition).filter(([key, value]) => value?.player === PLAYER_BLACK))) as [position, piece]}
					{#if piece && position}
						<div class="border p-2 rounded w-28 h-20">
							<div class="">
								{piece.piece.name}
							</div>
							<div class="">
								{getValidMovesForPiece(piece, position).join(',')}
								<!-- {position} -->
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
	<div class="grid grid-cols-8 w-max h-max border-2 border-black rounded overflow-hidden bg-white">
		{#each verticalBoardSort as vertical}
			{#each horizontalDirection as horizontal}
				<button
					on:click={() => pieceMove(activePiece, `${vertical}_${horizontal}`)}
					class="{isOdd(vertical)
						? 'odd:bg-[#e9edcc] even:bg-[#779954]'
						: 'odd:bg-[#779954] even:bg-[#e9edcc]'} h-16 w-16 relative flex justify-center items-center {activePiece?.position ===
					`${vertical}_${horizontal}`
						? '!bg-gray-600 !bg-opacity-60'
						: ''}
                        {pieceMoveRule(activePiece, `${vertical}_${horizontal}`)
						? '!bg-green-600 !bg-opacity-30'
						: ''}
                        "
				>
					{#if boardPosition[`${vertical}_${horizontal}`] !== undefined}
						<div
							class={boardPosition[`${vertical}_${horizontal}`]?.player === 1
								? 'text-white'
								: 'text-black'}
						>
							<button
								on:click={() => {
									let position = boardPosition[`${vertical}_${horizontal}`];
									if (!position) return;
									setActivePiece(position, `${vertical}_${horizontal}`);
								}}
							>
								<Icon
									icon={boardPosition[`${vertical}_${horizontal}`]?.piece.icon ?? ''}
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
