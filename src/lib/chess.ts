/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: Findout where to put this in chess lib.
const PLAYER_WHITE: Player = 1;
const PLAYER_BLACK: Player = 2;
const CHESS_PIECE: Record<PieceName, Piece> = {
	rook: {
		possibleMoves: [],
		name: 'rook',
		icon: 'fa-solid:chess-rook',
		rule: (board: Board, { startPosition, finalPosition }: PieceMove) => {
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			if (startHorizontal === finalHorizontal) {
				if (finalVertical > startVertical) {
					let hasEnemyBeforeEnd = false;
					for (let i = startVertical + 1; i < finalVertical; i++) {
						if (board[`${i}_${finalHorizontal}`]) {
							hasEnemyBeforeEnd = true;
							break;
						}
					}
					return !hasEnemyBeforeEnd;
				}
				if (finalVertical < startVertical) {
					let hasEnemyBeforeEnd = false;
					for (let i = startVertical - 1; i > finalVertical; i--) {
						if (board[`${i}_${finalHorizontal}`]) {
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
						if (board[`${finalVertical}_${i}`]) {
							hasEnemyBeforeEnd = true;
							break;
						}
					}
					return !hasEnemyBeforeEnd;
				}
				if (finalHorizontal < startHorizontal) {
					let hasEnemyBeforeEnd = false;
					for (let i = startHorizontal - 1; i > finalHorizontal; i--) {
						if (board[`${finalVertical}_${i}`]) {
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
		possibleMoves: [],
		name: 'knight',
		icon: 'fa6-solid:chess-knight',
		rule: (board: Board, { startPosition, finalPosition }: PieceMove) => {
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
		possibleMoves: [],
		name: 'bishop',
		icon: 'tabler:chess-bishop-filled',
		rule: (board: Board, { startPosition, finalPosition, player }: PieceMove) => {
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			// Check if the move is diagonal
			if (Math.abs(finalVertical - startVertical) === Math.abs(finalHorizontal - startHorizontal)) {
				const verticalIncrement = finalVertical > startVertical ? 1 : -1;
				const horizontalIncrement = finalHorizontal > startHorizontal ? 1 : -1;

				let currentVertical = startVertical + verticalIncrement;
				let currentHorizontal = startHorizontal + horizontalIncrement;

				// Check for obstacles in the path of the bishop
				while (currentVertical !== finalVertical && currentHorizontal !== finalHorizontal) {
					if (board[`${currentVertical}_${currentHorizontal}`]) {
						// There is an obstacle in the path, so bishop cannot move
						return false;
					}
					currentVertical += verticalIncrement;
					currentHorizontal += horizontalIncrement;
				}

				// Check if the destination position is empty or has an enemy piece
				const destinationPiece = board[`${finalVertical}_${finalHorizontal}`];
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
		possibleMoves: [],
		name: 'queen',
		icon: 'fa6-solid:chess-queen',
		rule: (board: Board, { startPosition, finalPosition, player }: PieceMove) => {
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
						if (board[`${finalVertical}_${i}`]) {
							// There is an obstacle in the path, so queen cannot move
							return false;
						}
					}
				} else if (startHorizontal === finalHorizontal) {
					// Vertical move
					const increment = finalVertical > startVertical ? 1 : -1;
					for (let i = startVertical + increment; i !== finalVertical; i += increment) {
						if (board[`${i}_${finalHorizontal}`]) {
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
						if (board[`${currentVertical}_${currentHorizontal}`]) {
							// There is an obstacle in the path, so queen cannot move
							return false;
						}
						currentVertical += verticalIncrement;
						currentHorizontal += horizontalIncrement;
					}
				}

				// Check if the destination position is empty or has an enemy piece
				const destinationPiece = board[`${finalVertical}_${finalHorizontal}`];
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
		possibleMoves: [],
		name: 'king',
		icon: 'fa-solid:chess-king',
		rule: (board: Board, { startPosition, finalPosition, player }: PieceMove) => {
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			const canCastle = (
				player: Player,
				startVertical: number,
				startHorizontal: number,
				finalVertical: number,
				finalHorizontal: number
			) => {
				// TODO: Prevent castling if king has move history. TODO: Inject move history into this. (optional)
				// const hasMoveHistory = moveHistory.find(
				// 	(move) => move.player === player && move.piece.name === CHESS_PIECE.king.name
				// );

				// if (!hasMoveHistory) {
				if (
					(player === 1 && startVertical === 1 && startHorizontal === 5) ||
					(player !== 1 && startVertical === 8 && startHorizontal === 5)
				) {
					const leftRookPosition = player === 1 ? '1_1' : '8_1';
					const rightRookPosition = player === 1 ? '1_8' : '8_8';

					if (
						(board[leftRookPosition]?.piece.name === CHESS_PIECE.rook.name &&
							[4, 3].includes(finalHorizontal) &&
							finalVertical === startVertical) ||
						(board[rightRookPosition]?.piece.name === CHESS_PIECE.rook.name &&
							[6, 7].includes(finalHorizontal) &&
							finalVertical === startVertical)
					) {
						return true;
					}
				}
				// }
				return false;
			};

			// TODO: castle
			if (canCastle(player, startVertical, startHorizontal, finalVertical, finalHorizontal)) {
				return true;
			}

			// Check if the move is one square in any direction
			if (
				Math.abs(finalVertical - startVertical) <= 1 &&
				Math.abs(finalHorizontal - startHorizontal) <= 1
			) {
				const inCheckAfterMove = Object.entries(
					Object.fromEntries(Object.entries(board).filter(([_, value]) => value?.player !== player))
				)
					.map(([_, piece]) => piece?.piece.possibleMoves)
					.flat()
					.includes(`${finalVertical}_${finalHorizontal}`);

				if (inCheckAfterMove) return false;

				// Check if the destination position is empty or has an enemy piece
				const destinationPiece = board[`${finalVertical}_${finalHorizontal}`];
				if (!destinationPiece || destinationPiece.player !== player) {
					return true;
				}
			}

			return false;
		}
	},
	pawn: {
		possibleMoves: [],
		name: 'pawn',
		icon: 'fa-solid:chess-pawn',
		rule: (board: Board, { startPosition, finalPosition, player }: PieceMove) => {
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
			let enemy: PlayerPiece | null = null;
			const finalPositionPawn = board[`${finalVertical}_${finalHorizontal}`];
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
					if (!board[`${finalVertical}_${finalHorizontal}`]) {
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
						!board[`${startVertical + 1}_${startHorizontal}`] &&
						!board[`${finalVertical}_${finalHorizontal}`]
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
					if (!board[`${finalVertical}_${finalHorizontal}`]) {
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
						!board[`${startVertical - 1}_${startHorizontal}`] &&
						!board[`${finalVertical}_${finalHorizontal}`]
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
const CHESS_START_POSITION = {
	// White starting position
	'1_1': {
		piece: CHESS_PIECE.rook,
		player: PLAYER_WHITE
	},
	'1_2': {
		piece: CHESS_PIECE.knight,
		player: PLAYER_WHITE
	},
	'1_3': {
		piece: CHESS_PIECE.bishop,
		player: PLAYER_WHITE
	},
	'3_6': {
		piece: CHESS_PIECE.queen,
		player: PLAYER_WHITE
	},
	'1_5': {
		piece: CHESS_PIECE.king,
		player: PLAYER_WHITE
	},
	'4_3': {
		piece: CHESS_PIECE.bishop,
		player: PLAYER_WHITE
	},
	'1_7': {
		piece: CHESS_PIECE.knight,
		player: PLAYER_WHITE
	},
	'1_8': {
		piece: CHESS_PIECE.rook,
		player: PLAYER_WHITE
	},
	'2_1': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_2': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_3': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_4': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_5': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_6': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_7': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_8': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},

	// Black starting position
	'8_1': {
		piece: CHESS_PIECE.rook,
		player: PLAYER_BLACK
	},
	'8_2': {
		piece: CHESS_PIECE.knight,
		player: PLAYER_BLACK
	},
	'8_3': {
		piece: CHESS_PIECE.bishop,
		player: PLAYER_BLACK
	},
	'8_4': {
		piece: CHESS_PIECE.queen,
		player: PLAYER_BLACK
	},
	'8_5': {
		piece: CHESS_PIECE.king,
		player: PLAYER_BLACK
	},
	'8_6': {
		piece: CHESS_PIECE.bishop,
		player: PLAYER_BLACK
	},
	'6_8': {
		piece: CHESS_PIECE.knight,
		player: PLAYER_BLACK
	},
	'8_8': {
		piece: CHESS_PIECE.rook,
		player: PLAYER_BLACK
	},
	'7_1': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_2': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_3': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_4': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	// '7_5': {
	// 	piece: CHESS_PIECE.pawn,
	// 	player: PLAYER_BLACK
	// },
	'7_6': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_7': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_8': {
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	}
};

const helpers = {
	validateMovingPiece: (
		board: Board,
		{
			piece,
			player,
			startPosition,
			finalPosition
		}: {
			piece: Piece;
			player: Player;
			startPosition: ChessPosition;
			finalPosition: ChessPosition;
		}
	) => {
		// Dont do anything if its on same place
		if (startPosition === finalPosition) return false;

		// Piece cant eat his own piece xD
		if (player === board[finalPosition]?.player) return false;

		// Stop when violating the rules
		if (
			!piece.rule(board, {
				startPosition,
				finalPosition,
				player
			})
		)
			return false;

		return true;
	},
	validPieceMoves: (
		board: Board,
		{
			piece,
			startPosition,
			player
		}: {
			piece: Piece;
			startPosition: ChessPosition;
			player: Player;
		}
	): ChessPosition[] => {
		const validMoves: ChessPosition[] = [];

		for (let vertical = 1; vertical <= 8; vertical++) {
			for (let horizontal = 1; horizontal <= 8; horizontal++) {
				const finalPosition = `${vertical}_${horizontal}`;
				const isValidMove = helpers.validateMovingPiece(board, {
					piece,
					startPosition,
					finalPosition,
					player
				});
				if (isValidMove) {
					validMoves.push(finalPosition);
				}
			}
		}

		return validMoves;
	},
	gameOver: (
		board: Board,
		{
			piece,
			finalPosition,
			player
		}: { piece: Piece; startPosition: ChessPosition; finalPosition: ChessPosition; player: Player }
	) => {
		let tempBoard = { ...board };
		const enemyKingPosition = Object.entries(tempBoard).find(
			([_, boardPiece]) => boardPiece?.player !== player && boardPiece?.piece.name === 'king'
		)?.[0];

		if (!enemyKingPosition) return true;

		const pieceAllValidMove = helpers.validPieceMoves(tempBoard, {
			piece,
			startPosition: finalPosition,
			player: player
		});

		if (pieceAllValidMove.includes(enemyKingPosition)) {
			const enemyKing = tempBoard[enemyKingPosition];
			if (!enemyKing) return false;
			const enemyKingPossibleMove = helpers
				.validPieceMoves(tempBoard, {
					piece: enemyKing.piece,
					player: enemyKing.player,
					startPosition: enemyKingPosition
				})
				.filter((kingPosibleMove) => !pieceAllValidMove.includes(kingPosibleMove));

			if (enemyKingPossibleMove.length === 0) {
				tempBoard = helpers.allPossibleMove(tempBoard)
				const opponentCanAttackOurChecker = Object.entries(
					Object.fromEntries(
						Object.entries(tempBoard).filter(([_, value]) => value?.player !== player)
					)
				)
					.map(([_, piece]) => piece?.piece.possibleMoves)
					.flat();
				console.log(opponentCanAttackOurChecker, finalPosition)

				if (!opponentCanAttackOurChecker.includes(finalPosition)) {
					// TODO: Check if opponent can stand in checker routes to king
					return true;
				}
			}
		}
		return false;
	},
	allPossibleMove: (board: Board) => {
		const tempBoard: Board = {};
		for (const position in board) {
			const boardPosition = board[position];
			if (boardPosition) {
				if (boardPosition.piece && boardPosition.player) {
					tempBoard[position] = {
						piece: {
							...boardPosition.piece,
							possibleMoves: helpers.validPieceMoves(board, {
								piece: boardPosition.piece,
								player: boardPosition.player,
								startPosition: position
							})
						},
						player: boardPosition.player
					};
				}
			}
		}
		return tempBoard;
	},
	kingCanBeCaputuredAfterMove: (
		board: Board,
		{
			piece,
			startPosition,
			finalPosition,
			player
		}: { piece: Piece; finalPosition: ChessPosition; startPosition: ChessPosition; player: Player }
	) => {
		let tempBoard = { ...board };
		if (!helpers.validateMovingPiece(board, { piece, finalPosition, startPosition, player }))
			return;

		// Update board position
		tempBoard[finalPosition] = {
			piece: piece,
			player: player
		};

		delete tempBoard[startPosition];

		tempBoard = helpers.allPossibleMove(tempBoard);

		const oponentPieceAvailableMove = Object.entries(
			Object.fromEntries(Object.entries(tempBoard).filter(([_, value]) => value?.player !== player))
		)
			.map(([_, piece]) => piece?.piece.possibleMoves)
			.flat();

		const ourKingPosition =
			Object.entries(tempBoard).find(
				([_, boardPiece]) => boardPiece?.player === player && boardPiece?.piece.name === 'king'
			)?.[0] ?? null;

		if (ourKingPosition) {
			if (oponentPieceAvailableMove.includes(ourKingPosition)) {
				return true;
			}
		}
		return false;
	}
};

export { helpers, PLAYER_BLACK, PLAYER_WHITE, CHESS_PIECE, CHESS_START_POSITION };
