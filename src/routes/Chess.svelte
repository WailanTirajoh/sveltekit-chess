<script lang="ts">
	import Icon from '@iconify/svelte';
	import ChessBoard from './ChessBoard.svelte';
	import ChessMoveHistory from './ChessMoveHistory.svelte';
	import { onMount } from 'svelte';
	import ChessTime from './ChessTime.svelte';
	import {
		CHESS_PIECE,
		CHESS_START_POSITION,
		PLAYER_BLACK,
		PLAYER_WHITE,
		helpers as chessHelper,
		helpers
	} from '$lib/chess';

	// TODO Features:
	/**
	 * - Castling
	 * - En Passant
	 * - Check (Done)
	 * - Game Time
	 * - Game Over
	 * 		- resign
	 * 		- checkmate (Done ~ but need improvement)
	 * 		- time win
	 * - Game Over Draw
	 * 		- piece cant move, but no check
	 * 		- acceptance draw
	 * 		- Insufficient material for checkmate
	 * 		- Lose on time, but enemy insufficient material for checkmate
	 *
	 * After Chess:
	 * - multiplayer (firebase)
	 */

	// Reactive Data
	let activePlayer: Player = PLAYER_WHITE;
	let activePiece: ActivePiece | null = null;
	let winner: Winner = {
		player: null,
		type: null
	};
	let boardRotateable: boolean = false;
	let board: Board = CHESS_START_POSITION;
	let moveHistory: PieceMoveHistory = [];
	let timeLeft: PlayerTime = {
		1: 60,
		2: 60
	};
	let timeinterval: NodeJS.Timer;

	async function pieceMove(piece: ActivePiece, finalPosition: ChessPosition) {
		const tempBoard = board;
		const isValidMove = chessHelper.validateMovingPiece(tempBoard, {
			piece: piece.piece,
			finalPosition,
			startPosition: piece.position,
			player: piece.player
		});
		if (!isValidMove) return;

		// Check if the king is in danger after making the move
		if (
			helpers.kingCanBeCaputuredAfterMove(tempBoard, {
				piece: piece.piece,
				startPosition: piece.position,
				player: piece.player,
				finalPosition
			})
		)
			return false;

		if (!piece) return;

		// TODO: Refactor this logic to castle
		if (piece.piece.name === CHESS_PIECE.king.name) {
			const [startVertical, startHorizontal] = piece.position.split('_').map(Number);
			const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

			if (Math.abs(startHorizontal - finalHorizontal) === 2) {
				if (finalHorizontal - startHorizontal > 0) {
					tempBoard[`${startVertical}_${startHorizontal + 1}`] = {
						piece: {
							...tempBoard[`${startVertical}_${finalHorizontal + 1}`]!.piece
						},
						player: piece.player
					};

					delete tempBoard[`${startVertical}_${finalHorizontal + 1}`];
					// Update board position
					tempBoard[finalPosition] = {
						piece: {
							...piece.piece
						},
						player: piece.player
					};
					delete tempBoard[piece.position];
				} else {
					tempBoard[`${startVertical}_${startHorizontal - 1}`] = {
						piece: {
							...tempBoard[`${startVertical}_${finalHorizontal - 2}`]!.piece
						},
						player: piece.player
					};

					delete tempBoard[`${startVertical}_${finalHorizontal - 2}`];
					// Update board position
					tempBoard[finalPosition] = {
						piece: {
							...piece.piece
						},
						player: piece.player
					};
					delete tempBoard[piece.position];
				}
				// Handle castle
			} else {
				// Update board position
				tempBoard[finalPosition] = {
					piece: {
						...piece.piece
					},
					player: piece.player
				};
				delete tempBoard[piece.position];
			}
		} else {
			// Update board position
			tempBoard[finalPosition] = {
				piece: {
					...piece.piece
				},
				player: piece.player
			};
			delete tempBoard[piece.position];
		}

		moveHistory = [...moveHistory, piece];

		board = chessHelper.allPossibleMove(tempBoard);

		if (
			chessHelper.gameOver(tempBoard, {
				piece: piece.piece,
				startPosition: piece.position,
				finalPosition,
				player: piece.player
			})
		) {
			alert('Game Over');
			winner.player = piece.player;
			winner.type = 'Checkmate';
			activePiece = null;
			if (timeinterval) clearInterval(timeinterval);
			return;
		}

		activePiece = null;
		activePlayer = activePlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;

		if (timeinterval) clearInterval(timeinterval);

		timeinterval = setInterval(timeCountDown, 1000);
	}

	function timeCountDown() {
		if (timeLeft[activePlayer] === 0) {
			winner.player = activePlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
			winner.type = 'On Time';
			activePiece = null;
			clearInterval(timeinterval);
		} else {
			timeLeft[activePlayer] = timeLeft[activePlayer] - 1;
		}
	}

	function setActivePiece(piece: PlayerPiece, startPosition: ChessPosition) {
		activePiece = { ...piece, position: startPosition };
	}

	function onCellClick(position: ChessPosition) {
		let pieceOnPosition = board[position];
		if (winner.player) {
		} else if (activePiece && (!pieceOnPosition || pieceOnPosition.player !== activePlayer)) {
			pieceMove(activePiece, position);
		} else {
			if (!pieceOnPosition) return;
			if (pieceOnPosition.player !== activePlayer) return;
			setActivePiece(pieceOnPosition, position);
			pieceOnPosition.piece.possibleMoves = chessHelper.validPieceMoves(board, {
				piece: pieceOnPosition.piece,
				player: pieceOnPosition.player,
				startPosition: position
			});
		}
	}

	// TODO: Improvement in this area
	/**
	 * Somehow if we update directly to board, we get some random result,
	 * so we need to store it on temp data then store to the real board
	 */
	async function resetAllPossibleMove(test: Board) {
		const tempBoard = chessHelper.allPossibleMove({ ...test });
		board = { ...tempBoard };
	}

	onMount(async () => {
		board = chessHelper.allPossibleMove(board);
		// setActivePiece(board[`3_6`]!, `3_6`);
		// await new Promise((resolve) => setTimeout(resolve, 1000));
		// pieceMove(activePiece!, `7_6`);
	});
</script>

<div class="grid grid-cols-1 justify-center h-full gap-8 p-4 duration-100 max-w-4xl mx-auto">
	<div class="relative w-full flex flex-col gap-2">
		<ChessTime timeLeft={timeLeft[2]} initialTime={60} player={PLAYER_BLACK} />
		<ChessBoard
			on:cellClick={(event) => {
				onCellClick(event.detail.position);
			}}
			{activePlayer}
			{activePiece}
			{board}
			rotateable={boardRotateable}
		>
			<div slot="cell" let:position>
				{#if activePiece?.piece.possibleMoves.includes(position)}
					<div
						class="
								w-4 h-4 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
								{board[position] !== undefined ? '' : 'bg-gray-900 bg-opacity-20'}
							"
					>
						{#if board[position] !== undefined}
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
		<ChessTime timeLeft={timeLeft[1]} initialTime={60} player={PLAYER_WHITE} />
	</div>
	<div class="">
		<!-- <ChessMoveHistory moves={moveHistory} /> -->
	</div>
</div>
<div class="text-white text-center text-2xl font-bold">
	{#if winner.player}
		{winner.player === PLAYER_BLACK ? 'Black' : 'White'} Win! {winner.type}
	{:else}
		{activePlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
	{/if}
</div>
