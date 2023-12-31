/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { clone } from '$lib/utils/deepClone';

const PLAYER_WHITE: Player = 1;

const PLAYER_BLACK: Player = 2;

const INITIAL_TIME = 3 * 60;

const INITIAL_PLAYER_INFO = {
	1: {
		capturedPieces: [],
		time: INITIAL_TIME
	},
	2: {
		capturedPieces: [],
		time: INITIAL_TIME
	}
};

const CHESS_PIECE: Record<PieceName, Piece> = {
	rook: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'rook',
		icon: 'fa-solid:chess-rook',
		power: 5
	},
	knight: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'knight',
		icon: 'fa6-solid:chess-knight',
		power: 3
	},
	bishop: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'bishop',
		icon: 'tabler:chess-bishop-filled',
		power: 3
	},
	queen: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'queen',
		icon: 'fa6-solid:chess-queen',
		power: 8
	},
	king: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'king',
		icon: 'fa-solid:chess-king',
		power: Infinity
	},
	pawn: {
		possibleMoves: [],
		possibleAttacks: [],
		moveHistory: [],
		name: 'pawn',
		icon: 'fa-solid:chess-pawn',
		power: 1
	}
};

const PIECE_RULE: PieceRule = {
	rook: {
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
			const { board } = chess;
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			if (startHorizontal === finalHorizontal) {
				if (finalVertical > startVertical) {
					let hasEnemyBeforeEnd = false;
					for (let i = startVertical + 1; i < finalVertical; i++) {
						if (
							board[`${i}_${finalHorizontal}`]?.piece.name === 'king' &&
							board[`${i}_${finalHorizontal}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${i}_${finalHorizontal}`]) {
							hasEnemyBeforeEnd = true;
							break;
						}
					}
					return !hasEnemyBeforeEnd;
				}
				if (finalVertical < startVertical) {
					let hasEnemyBeforeEnd = false;
					for (let i = startVertical - 1; i > finalVertical; i--) {
						if (
							board[`${i}_${finalHorizontal}`]?.piece.name === 'king' &&
							board[`${i}_${finalHorizontal}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${i}_${finalHorizontal}`]) {
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
						if (
							board[`${finalVertical}_${i}`]?.piece.name === 'king' &&
							board[`${finalVertical}_${i}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${finalVertical}_${i}`]) {
							hasEnemyBeforeEnd = true;
							break;
						}
					}
					return !hasEnemyBeforeEnd;
				}
				if (finalHorizontal < startHorizontal) {
					let hasEnemyBeforeEnd = false;
					for (let i = startHorizontal - 1; i > finalHorizontal; i--) {
						if (
							board[`${finalVertical}_${i}`]?.piece.name === 'king' &&
							board[`${finalVertical}_${i}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${finalVertical}_${i}`]) {
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
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
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
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
			const { board } = chess;
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
					if (
						board[`${currentVertical}_${currentHorizontal}`]?.piece.name === 'king' &&
						board[`${currentVertical}_${currentHorizontal}`]?.player !== player
					) {
						// Do nothing
					} else if (board[`${currentVertical}_${currentHorizontal}`]) {
						// There is an obstacle in the path, so bishop cannot move
						return false;
					}
					currentVertical += verticalIncrement;
					currentHorizontal += horizontalIncrement;
				}

				// Check if the destination position is empty or has an enemy piece
				const destinationPiece = board[`${finalVertical}_${finalHorizontal}`];
				if (!destinationPiece || destinationPiece.player) {
					// The move is valid if the destination is empty or has an enemy piece
					return true;
				}
			}

			// If none of the conditions are satisfied, the move is not valid for the bishop
			return false;
		}
	},
	queen: {
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
			const { board } = chess;
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
						if (
							board[`${finalVertical}_${i}`]?.piece.name === 'king' &&
							board[`${finalVertical}_${i}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${finalVertical}_${i}`]) {
							// There is an obstacle in the path, so queen cannot move
							return false;
						}
					}
				} else if (startHorizontal === finalHorizontal) {
					// Vertical move
					const increment = finalVertical > startVertical ? 1 : -1;
					for (let i = startVertical + increment; i !== finalVertical; i += increment) {
						if (
							board[`${i}_${finalHorizontal}`]?.piece.name === 'king' &&
							board[`${i}_${finalHorizontal}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${i}_${finalHorizontal}`]) {
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
						if (
							board[`${currentVertical}_${currentHorizontal}`]?.piece.name === 'king' &&
							board[`${currentVertical}_${currentHorizontal}`]?.player !== player
						) {
							// Do nothing
						} else if (board[`${currentVertical}_${currentHorizontal}`]) {
							// There is an obstacle in the path, so queen cannot move
							return false;
						}
						currentVertical += verticalIncrement;
						currentHorizontal += horizontalIncrement;
					}
				}

				// Check if the destination position is empty or has an enemy piece
				// const destinationPiece = board[`${finalVertical}_${finalHorizontal}`];
				// if (!destinationPiece) {
				// 	// The move is valid if the destination is empty or has an enemy piece
				// }
				return true;
			}

			// If none of the conditions are satisfied, the move is not valid for the queen
			return false;
		}
	},
	king: {
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
			const { board } = chess;
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			const castle = (
				player: Player,
				startVertical: number,
				startHorizontal: number,
				finalVertical: number,
				finalHorizontal: number
			) => {
				const king = board[startPosition]!;

				// Prevent castling when king has move history
				if (king.piece.moveHistory.length > 0) return false;

				const enemyPossibleAttacks = Object.entries(
					Object.fromEntries(Object.entries(board).filter(([_, piece]) => piece?.player !== player))
				)
					.map(([_, piece]) => piece?.piece.possibleAttacks)
					.flat();

				if (enemyPossibleAttacks.includes(startPosition)) return false;

				const leftRookPosition = player === PLAYER_WHITE ? '1_1' : '8_1';
				const rightRookPosition = player === PLAYER_WHITE ? '1_8' : '8_8';
				const leftRook = board[leftRookPosition];
				const rightRook = board[rightRookPosition];

				if (
					(player === PLAYER_WHITE && startVertical === 1 && startHorizontal === 5) ||
					(player === PLAYER_BLACK && startVertical === 8 && startHorizontal === 5)
				) {
					const isCastlingLeft = finalHorizontal === 3;
					const isCastlingRight = finalHorizontal === 7;

					// Prevent castling when rook has move history
					if (isCastlingLeft && leftRook && leftRook.piece.moveHistory.length > 0) return false;
					if (isCastlingRight && rightRook && rightRook.piece.moveHistory.length > 0) return false;

					// TODO: Reduce this cognitive complexity.
					// Prevent castling when the rook position isn't ally rook.
					if (
						(leftRook?.piece.name === CHESS_PIECE.rook.name &&
							isCastlingLeft &&
							finalVertical === startVertical &&
							leftRook?.player === player) ||
						(rightRook?.piece.name === CHESS_PIECE.rook.name &&
							isCastlingRight &&
							finalVertical === startVertical &&
							rightRook?.player === player)
					) {
						if (isCastlingRight && !board[`${finalVertical}_6`]) {
							if (
								enemyPossibleAttacks.includes(`${finalVertical}_6`) ||
								enemyPossibleAttacks.includes(`${finalVertical}_7`)
							)
								return false;
							return true;
						}
						if (isCastlingLeft && !board[`${finalVertical}_4`]) {
							if (
								enemyPossibleAttacks.includes(`${finalVertical}_3`) ||
								enemyPossibleAttacks.includes(`${finalVertical}_4`)
							)
								return false;
							return true;
						}
					}
				}
				return false;
			};

			if (castle(player, startVertical, startHorizontal, finalVertical, finalHorizontal)) {
				return true;
			}

			const inCheckAfterMove = Object.entries(
				Object.fromEntries(Object.entries(board).filter(([_, value]) => value?.player !== player))
			)
				.map(([position, piece]) => {
					if (piece?.piece.name === 'king') {
						const [vertical, horizontal] = position.split('_').map(Number);
						const attackOffsets = [-1, 0, 1]; // Possible offsets for attacks

						const possibleAttacks = [];

						for (const vOffset of attackOffsets) {
							for (const hOffset of attackOffsets) {
								if (vOffset === 0 && hOffset === 0) {
									continue; // Skip the current position
								}

								const attackPosition = `${vertical + vOffset}_${horizontal + hOffset}`;
								possibleAttacks.push(attackPosition);
							}
						}
						return possibleAttacks;
					}
					return piece?.piece.possibleAttacks;
				})
				.flat()
				.includes(`${finalVertical}_${finalHorizontal}`);

			if (inCheckAfterMove) return false;

			// Check if the move is one square in any direction
			if (
				Math.abs(finalVertical - startVertical) <= 1 &&
				Math.abs(finalHorizontal - startHorizontal) <= 1
			) {
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
		rule: (chess: ChessInfo, { startPosition, finalPosition, player }: PieceMove) => {
			const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
			let enemy: PlayerPiece | null = null;
			const finalPositionPawn = chess.board[`${finalVertical}_${finalHorizontal}`];
			if (finalPositionPawn) {
				if (finalPositionPawn.player !== player) {
					enemy = finalPositionPawn;
				}
			}

			if (player === PLAYER_WHITE) {
				// Player 1 is white, can only move upward

				// Check if the pawn is moving one square forward
				if (startHorizontal === finalHorizontal && finalVertical - startVertical === 1) {
					// Check if the destination position is empty
					if (!chess.board[`${finalVertical}_${finalHorizontal}`]) {
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
						!chess.board[`${startVertical + 1}_${startHorizontal}`] &&
						!chess.board[`${finalVertical}_${finalHorizontal}`]
					) {
						return true;
					}
				}

				// Check if the pawn can an passant the enemy.
				if (startVertical === 5 && Math.abs(finalHorizontal - startHorizontal) === 1) {
					const pieceOnBoard = chess.board[`${startVertical}_${finalHorizontal}`];
					if (
						finalVertical === 6 &&
						pieceOnBoard &&
						pieceOnBoard.player !== player &&
						pieceOnBoard.piece.name === CHESS_PIECE.pawn.name &&
						pieceOnBoard.piece.moveHistory.length === 1 &&
						pieceOnBoard.piece.moveHistory[0].moveAt === chess.moveHistory.length - 1
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
					if (!chess.board[`${finalVertical}_${finalHorizontal}`]) {
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
						!chess.board[`${startVertical - 1}_${startHorizontal}`] &&
						!chess.board[`${finalVertical}_${finalHorizontal}`]
					) {
						return true;
					}
				}

				// Check if the pawn can an passant the enemy.
				if (startVertical === 4 && Math.abs(finalHorizontal - startHorizontal) === 1) {
					const pieceOnBoard = chess.board[`${startVertical}_${finalHorizontal}`];
					if (
						finalVertical === 3 &&
						pieceOnBoard &&
						pieceOnBoard.player !== player &&
						pieceOnBoard.piece.name === CHESS_PIECE.pawn.name &&
						pieceOnBoard.piece.moveHistory.length === 1 &&
						pieceOnBoard.piece.moveHistory[0].moveAt === chess.moveHistory.length - 1
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

const INITIAL_BOARD_POSITION: Board = {
	// White starting position
	'1_1': {
		id: 'f323344f-028a-4923-ac4a-7cd3bb86e1b2',
		piece: CHESS_PIECE.rook,
		player: PLAYER_WHITE
	},
	'1_2': {
		id: '49a7794f-f66d-4f7a-b000-a4590b2db39c',
		piece: CHESS_PIECE.knight,
		player: PLAYER_WHITE
	},
	'1_3': {
		id: '38c99c88-afdf-4d5b-9035-911eb4f3e2d3',
		piece: CHESS_PIECE.bishop,
		player: PLAYER_WHITE
	},
	'1_4': {
		id: 'b498a47f-5793-4bc6-9922-19e1bf4325b3',
		piece: CHESS_PIECE.queen,
		player: PLAYER_WHITE
	},
	'1_5': {
		id: '4c8e35e7-c985-465d-8781-6e20b0ecfc7b',
		piece: CHESS_PIECE.king,
		player: PLAYER_WHITE
	},
	'1_6': {
		id: '6ac6a394-57ef-472c-9704-a589dbc3d3f2',
		piece: CHESS_PIECE.bishop,
		player: PLAYER_WHITE
	},
	'1_7': {
		id: '801b02ee-43a0-4734-b29c-611b1a22f3df',
		piece: CHESS_PIECE.knight,
		player: PLAYER_WHITE
	},
	'1_8': {
		id: 'bb1ff1ce-a48e-48d6-b83d-51337edc176a',
		piece: CHESS_PIECE.rook,
		player: PLAYER_WHITE
	},
	'2_1': {
		id: 'fde0b9b0-9519-4e55-83c4-e2c655d1c9fc',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_2': {
		id: '5028b1e6-b1e7-4008-9e22-ca5464e3b3f5',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_3': {
		id: '02c8de71-f230-4b98-ab1d-45c7fff69c8d',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_4': {
		id: 'ec84a512-e292-47f9-a4ef-4a2bfc73c7bc',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_5': {
		id: '8babde15-afd2-40c2-8308-1a7cd9f9d77c',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_6': {
		id: '22a33bd5-2c70-4de8-9009-f66e5f879626',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_7': {
		id: 'd91fbf5d-f5b3-451e-911e-d879a3e4d675',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},
	'2_8': {
		id: '5e80b0e0-c60b-4d6c-aa57-84d1a9b84bf5',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_WHITE
	},

	// Black starting position
	'8_1': {
		id: 'a9020920-1cfc-4682-b8cd-2fecb0ab88e5',
		piece: CHESS_PIECE.rook,
		player: PLAYER_BLACK
	},
	'8_2': {
		id: '446e2a06-a274-4df5-8422-1b522d3ce8e5',
		piece: CHESS_PIECE.knight,
		player: PLAYER_BLACK
	},
	'8_3': {
		id: '418918fe-e86f-455a-846e-306b03636263',
		piece: CHESS_PIECE.bishop,
		player: PLAYER_BLACK
	},
	'8_4': {
		id: 'b0e5266a-282b-4fbb-80a5-1bda2eeb7b22',
		piece: CHESS_PIECE.queen,
		player: PLAYER_BLACK
	},
	'8_5': {
		id: '28ef0127-4802-400a-89aa-6f8705f9651d',
		piece: CHESS_PIECE.king,
		player: PLAYER_BLACK
	},
	'8_6': {
		id: '256aa6ad-0b74-4c2c-b1fd-6c391874d63a',
		piece: CHESS_PIECE.bishop,
		player: PLAYER_BLACK
	},
	'8_7': {
		id: '5bf5deb9-2c04-4086-ac6a-a0c81c07df41',
		piece: CHESS_PIECE.knight,
		player: PLAYER_BLACK
	},
	'8_8': {
		id: '0a6a77e8-ae6a-42f5-bcea-33bb9836736e',
		piece: CHESS_PIECE.rook,
		player: PLAYER_BLACK
	},
	'7_1': {
		id: '3114068f-1764-4992-854d-c97f66e3847b',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_2': {
		id: '7a53c8b9-ab64-4329-9c93-26dd523d99f5',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_3': {
		id: '661866b8-0646-4b7f-96e5-0957f3b16617',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_4': {
		id: '8e436f4a-0668-4fc1-82e0-5204f94112bc',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_5': {
		id: 'a9ae5e8d-28e0-46b2-8468-7d6289affc66',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_6': {
		id: 'c9238cc0-b8fa-4928-8a62-828d682dafa8',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_7': {
		id: 'd36e62be-3fc3-4142-b996-7c17904c4f04',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	},
	'7_8': {
		id: '7a668a90-02aa-41c7-9672-d4ae69bb8534',
		piece: CHESS_PIECE.pawn,
		player: PLAYER_BLACK
	}
};

const CHESS_HELPERS = {
	/**
	 * Validate piece move.
	 */
	validatePieceMove: (
		chess: ChessInfo,
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
		if (startPosition === finalPosition) return false;
		return PIECE_RULE[piece.name].rule(chess, {
			startPosition,
			finalPosition,
			player
		});
	},

	/**
	 * Generate piece legal moves.
	 */
	legalMoves: (
		chess: ChessInfo,
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

		// Loop through each cell, and validate if piece can move to there from current position
		for (let vertical = 1; vertical <= 8; vertical++) {
			for (let horizontal = 1; horizontal <= 8; horizontal++) {
				const finalPosition = `${vertical}_${horizontal}`;
				const isValidMove = CHESS_HELPERS.validatePieceMove(chess, {
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

	/**
	 * Generate piece legal attack moves.
	 */
	legalAttackMoves: (
		chess: ChessInfo,
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

		// Loop through each cell, and validate if piece can move to there from current position
		for (let vertical = 1; vertical <= 8; vertical++) {
			for (let horizontal = 1; horizontal <= 8; horizontal++) {
				if (piece.name === 'pawn') {
					const possibleAttacks =
						player === PLAYER_WHITE
							? [`${vertical + 1}_${horizontal - 1}`, `${vertical + 1}_${horizontal + 1}`]
							: [`${vertical - 1}_${horizontal - 1}`, `${vertical - 1}_${horizontal + 1}`];
					return possibleAttacks;
				} else {
					const finalPosition = `${vertical}_${horizontal}`;
					const isValidMove = CHESS_HELPERS.validatePieceMove(chess, {
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
		}

		return validMoves;
	},

	/**
	 * Check whether its a checkmate / stalemate
	 * TODO: Stalemate
	 */
	gameOver: (
		chess: ChessInfo,
		{
			piece,
			startPosition,
			finalPosition,
			player
		}: { piece: Piece; startPosition: ChessPosition; finalPosition: ChessPosition; player: Player }
	) => {
		let { board } = chess;
		const enemyKingPosition = Object.entries(board).find(
			([_, boardPiece]) => boardPiece?.player !== player && boardPiece?.piece.name === 'king'
		)?.[0];

		if (!enemyKingPosition) return true;

		const allyPossibleAttack = Object.entries(
			Object.fromEntries(Object.entries(board).filter(([_, value]) => value?.player === player))
		)
			.map(([_, piece]) => piece?.piece.possibleAttacks)
			.flat();

		if (allyPossibleAttack.includes(enemyKingPosition)) {
			const enemyKing = board[enemyKingPosition]!;

			const enemyKingPossibleMove = CHESS_HELPERS.legalMoves(chess, {
				piece: enemyKing.piece,
				player: enemyKing.player,
				startPosition: enemyKingPosition
			}).filter((kingPosibleMove) => !allyPossibleAttack.includes(kingPosibleMove));

			if (enemyKingPossibleMove.length === 0) {
				board = CHESS_HELPERS.generateAllLegalMoves(chess);
				const opponentCanAttackOurChecker = Object.entries(
					Object.fromEntries(Object.entries(board).filter(([_, value]) => value?.player !== player))
				)
					.map(([_, piece]) => piece?.piece.possibleAttacks)
					.flat();

				// TODO: Opponent can attack our checker but it's also defending from other checker.

				if (!opponentCanAttackOurChecker.includes(finalPosition)) {
					const attackerRoutes = CHESS_HELPERS.generateMoveRoutes(finalPosition, enemyKingPosition);
					const enemyDefender = Object.entries(board).filter(
						([_, boardPiece]) =>
							boardPiece!.player !== player &&
							boardPiece!.piece.possibleMoves.filter((pm) => attackerRoutes.includes(pm)).length > 0
					);

					if (enemyDefender.length === 0) return true;
				}
			}
		}
		return false;
	},

	/**
	 * Generate all piece legal moves & attack move.
	 */
	generateAllLegalMoves: (
		chess: ChessInfo,
		options: {
			checker: Player | undefined;
			checkRoutes: Array<ChessPosition>;
		} = {
			checker: undefined,
			checkRoutes: []
		}
	) => {
		const { board } = chess;
		const { checkRoutes, checker } = options;
		const tempBoard: Board = {};
		for (const position in board) {
			const boardPosition = board[position];
			if (!boardPosition) continue;

			let possibleMoves = CHESS_HELPERS.legalMoves(chess, {
				piece: boardPosition.piece,
				player: boardPosition.player,
				startPosition: position
			});

			if (
				checkRoutes.length > 0 &&
				boardPosition.piece.name !== CHESS_PIECE.king.name &&
				boardPosition.player !== checker
			) {
				possibleMoves = possibleMoves.filter((pm) => checkRoutes.includes(pm));
			}

			if (boardPosition.piece.name === 'pawn') {
				const [vertical, horizontal] = position.split('_').map(Number);
				let possibleAttacks =
					boardPosition.player === PLAYER_WHITE
						? [`${vertical + 1}_${horizontal - 1}`, `${vertical + 1}_${horizontal + 1}`]
						: [`${vertical - 1}_${horizontal - 1}`, `${vertical - 1}_${horizontal + 1}`];

				if (
					checkRoutes.length > 0 &&
					boardPosition.piece.name !== CHESS_PIECE.king.name &&
					boardPosition.player !== checker
				) {
					possibleAttacks = possibleAttacks.filter((pa) => checkRoutes.includes(pa));
				}

				tempBoard[position] = {
					id: boardPosition.id,
					piece: {
						...boardPosition.piece,
						possibleMoves: possibleMoves,
						possibleAttacks: possibleAttacks
					},
					player: boardPosition.player
				};
			} else {
				const possibleAttacks = possibleMoves;
				tempBoard[position] = {
					id: boardPosition.id,
					piece: {
						...boardPosition.piece,
						possibleMoves: possibleMoves,
						possibleAttacks: possibleAttacks
					},
					player: boardPosition.player
				};
			}
		}
		return tempBoard;
	},

	/**
	 * Generate move routes from start position to final position.
	 */
	generateMoveRoutes: (startPosition: ChessPosition, finalPosition: ChessPosition) => {
		const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
		const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
		const routes = [];

		if (startVertical === finalVertical) {
			if (startHorizontal < finalHorizontal) {
				// Vertical Move - Top
				for (let i = startHorizontal + 1; i < finalHorizontal; i++) {
					routes.push(`${startVertical}_${i}`);
				}
			} else {
				// Vertical Move - Bottom
				for (let i = startHorizontal - 1; i > finalHorizontal; i--) {
					routes.push(`${startVertical}_${i}`);
				}
			}
		}

		if (startHorizontal === finalHorizontal) {
			if (startVertical < finalVertical) {
				// Horizontal Move - Right
				for (let i = startVertical + 1; i < finalVertical; i++) {
					routes.push(`${i}_${startHorizontal}`);
				}
			} else {
				// Horizontal Move - Left
				for (let i = startVertical - 1; i > finalVertical; i--) {
					routes.push(`${i}_${startHorizontal}`);
				}
			}
		}

		const verticalDistance = Math.abs(finalVertical - startVertical);
		const horizontalDistance = Math.abs(finalHorizontal - startHorizontal);

		if (verticalDistance === horizontalDistance) {
			if (startVertical < finalVertical) {
				if (startHorizontal < finalHorizontal) {
					// Diagonal Move - Top Right
					let h = startHorizontal + 1;
					for (let v = startVertical + 1; v < finalVertical; v++) {
						routes.push(`${v}_${h}`);
						h++;
					}
				} else {
					// Diagonal Move - Top Left
					let h = startHorizontal - 1;
					for (let v = startVertical + 1; v < finalVertical; v++) {
						routes.push(`${v}_${h}`);
						h--;
					}
				}
			} else {
				if (startHorizontal < finalHorizontal) {
					// Diagonal Move - Bottom Right
					let h = startHorizontal + 1;
					for (let v = startVertical - 1; v > finalVertical; v--) {
						routes.push(`${v}_${h}`);
						h++;
					}
				} else {
					// Diagonal Move - Bottom Left');
					let h = startHorizontal - 1;
					for (let v = startVertical - 1; v > finalVertical; v--) {
						routes.push(`${v}_${h}`);
						h--;
					}
				}
			}
		}
		return routes;
	},

	/**
	 * Prevent move if king can be captured after the move happens.
	 */
	kingCanBeCaputuredAfterMove: (
		chess: ChessInfo,
		{
			piece,
			startPosition,
			finalPosition,
			player
		}: { piece: Piece; finalPosition: ChessPosition; startPosition: ChessPosition; player: Player }
	) => {
		const clonedChess = clone(chess);
		const isValidMove = CHESS_HELPERS.validatePieceMove(clonedChess, {
			piece,
			finalPosition,
			startPosition,
			player
		});
		if (!isValidMove) return false;

		// Update board position
		clonedChess.board[finalPosition] = {
			id: clonedChess.board[startPosition]!.id,
			piece: piece,
			player: player
		};

		delete clonedChess.board[startPosition];

		clonedChess.board = CHESS_HELPERS.generateAllLegalMoves(clonedChess);

		const oponentPieceAvailableMove = Object.entries(
			Object.fromEntries(
				Object.entries(clonedChess.board).filter(([_, value]) => value?.player !== player)
			)
		)
			.map(([_, piece]) => piece?.piece.possibleMoves)
			.flat();

		const ourKingPosition =
			Object.entries(clonedChess.board).find(
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

export {
	CHESS_HELPERS,
	PLAYER_BLACK,
	PLAYER_WHITE,
	CHESS_PIECE,
	INITIAL_BOARD_POSITION,
	INITIAL_TIME,
	INITIAL_PLAYER_INFO
};
