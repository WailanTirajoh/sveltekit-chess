<script lang="ts">
	import Icon from '@iconify/svelte';
	import ChessBoard from './ChessBoard.svelte';

	/**
	 * TODO Features:
	 * - Castling
	 * - En Passant
	 * - Check
	 * - Game Time
	 * - Game Over (Resign, checkmate, time win)
	 * - Game Over Draw
	 * 		- piece cant move, but no check
	 * 		- acceptance draw
	 * 		- Insufficient material for checkmate
	 * 		- Lose on time, but enemy insufficient material for checkmate
	 * 
	 * After Chess:
	 * - multiplayer (firebase)
	 */
	const PLAYER_WHITE: Player = 1;
	const PLAYER_BLACK: Player = 2;

	const CHESS_PIECE: Record<PieceName, Piece> = {
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

	// Reactive Data
	let activePlayer: Player = PLAYER_WHITE;
	let activePiece: ActivePiece | null = null;

	/**
	 * Board position with {row_col} as the key
	 */
	let boardPosition: BoardPosition = {
		// White starting position
		'1_1': {
			piece: CHESS_PIECE.rook,
			player: 1
		},
		'1_2': {
			piece: CHESS_PIECE.knight,
			player: 1
		},
		'1_3': {
			piece: CHESS_PIECE.bishop,
			player: 1
		},
		'1_4': {
			piece: CHESS_PIECE.queen,
			player: 1
		},
		'1_5': {
			piece: CHESS_PIECE.king,
			player: 1
		},
		'1_6': {
			piece: CHESS_PIECE.bishop,
			player: 1
		},
		'1_7': {
			piece: CHESS_PIECE.knight,
			player: 1
		},
		'1_8': {
			piece: CHESS_PIECE.rook,
			player: 1
		},
		'2_1': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_2': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_3': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_4': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_5': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_6': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_7': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},
		'2_8': {
			piece: CHESS_PIECE.pawn,
			player: 1
		},

		// Black starting position
		'8_1': {
			piece: CHESS_PIECE.rook,
			player: 2
		},
		'8_2': {
			piece: CHESS_PIECE.knight,
			player: 2
		},
		'8_3': {
			piece: CHESS_PIECE.bishop,
			player: 2
		},
		'8_4': {
			piece: CHESS_PIECE.queen,
			player: 2
		},
		'8_5': {
			piece: CHESS_PIECE.king,
			player: 2
		},
		'8_6': {
			piece: CHESS_PIECE.bishop,
			player: 2
		},
		'8_7': {
			piece: CHESS_PIECE.knight,
			player: 2
		},
		'8_8': {
			piece: CHESS_PIECE.rook,
			player: 2
		},
		'7_1': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_2': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_3': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_4': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_5': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_6': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_7': {
			piece: CHESS_PIECE.pawn,
			player: 2
		},
		'7_8': {
			piece: CHESS_PIECE.pawn,
			player: 2
		}
	};

	// ----------------------------------------------------------------
	// TODO: Board position history, so we can create undo and redo feature.
	// Will be triggered on pieceMove function.
	// ----------------------------------------------------------------

	function pieceMoveRule(piece: ActivePiece | null, finalPosition: ChessPosition, player?: 1 | 2) {
		if (!piece) return false;

		// Dont move other player piece
		if (!player) {
			if (piece?.player !== activePlayer) return false;
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
	 * If after the piece move, king can be captured, then board should be reset to previous position with alert.
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

		const opponentPlayer = activePlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
		const oponentPieceAvailableMove = Object.entries(
			Object.fromEntries(
				Object.entries(boardPosition).filter(([key, value]) => value?.player !== piece.player)
			)
		)
			.map(([position, piece]) => validPieceMove(piece!, position, opponentPlayer))
			.flat();

		let ourKingPosition = null;
		for (const [position, piece2] of Object.entries(boardPosition)) {
			if (piece2?.player === piece.player && piece2?.piece.name === 'king') {
				ourKingPosition = position;
				break;
			}
		}

		if (oponentPieceAvailableMove.includes(ourKingPosition!)) {
			// Reset the board with old board.
			boardPosition = { ...oldPosition };
			alert('Invalid Move!');
			return true;
		}
		return false;
	}

	function validPieceMove(
		piece: PlayerPiece,
		startPosition: ChessPosition,
		player?: 1 | 2
	): ChessPosition[] {
		const validMoves: ChessPosition[] = [];

		for (let vertical = 1; vertical <= 8; vertical++) {
			for (let horizontal = 1; horizontal <= 8; horizontal++) {
				const finalPosition = `${vertical}_${horizontal}` as `${number}_${number}`;

				if (
					pieceMoveRule({ ...piece, position: startPosition }, finalPosition, player) &&
					startPosition !== finalPosition
				) {
					const clonedBoardPosition = { ...boardPosition };
					const currentPiece = clonedBoardPosition[startPosition];
					delete clonedBoardPosition[startPosition];
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
		if (kingCanBeCaputuredAfterMove(piece, finalPosition)) {
			// TODO: Check if king has no defender left, then its game over!
			return false;
		}

		if (!piece) return;
		// Update board position
		boardPosition[finalPosition] = {
			piece: piece.piece,
			player: piece.player
		};

		delete boardPosition[piece.position];

		activePiece = null;

		activePlayer = activePlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
	}

	function setActivePiece(piece: PlayerPiece, startPosition: ChessPosition) {
		activePiece = { ...piece, position: startPosition };
	}

	function onCellClick(position: ChessPosition) {
		let pieceOnPosition = boardPosition[position];
		if (activePiece && (!pieceOnPosition || pieceOnPosition.player !== activePlayer)) {
			pieceMove(activePiece, position);
		} else {
			if (!pieceOnPosition) return;
			if (pieceOnPosition.player !== activePlayer) return;
			setActivePiece(pieceOnPosition, position);
		}
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-2 justify-center h-full gap-8 p-4">
	<ChessBoard
		on:cellClick={(event) => {
			onCellClick(event.detail.position);
		}}
		{activePlayer}
		{activePiece}
		{boardPosition}
	>
		<div slot="cell" let:position>
			{#if pieceMoveRule(activePiece, position)}
				<div
					class="
						w-4 h-4 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
						{boardPosition[position] !== undefined ? '' : 'bg-gray-900 bg-opacity-20'}
					"
				>
					{#if boardPosition[position] !== undefined}
						<Icon
							icon="mdi:sword"
							class="
								!w-6 !h-6 md:!w-8 md:!h-8 duration-300 text-red-400 animate-bounce pt-2
								{activePlayer === PLAYER_BLACK ? 'rotate-180' : ''}
							"
						/>
					{/if}
				</div>
			{/if}
		</div>
	</ChessBoard>
</div>
<div class="text-white text-center text-2xl font-bold">
	{activePlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
</div>
