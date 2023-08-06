<script lang="ts">
	import Icon from '@iconify/svelte';
	import ChessBoard from './ChessBoard.svelte';
	import ChessMoveHistory from './ChessMoveHistory.svelte';
	import { onDestroy, onMount } from 'svelte';
	import ChessTime from './ChessTime.svelte';
	import {
		CHESS_PIECE,
		CHESS_START_POSITION,
		PLAYER_BLACK,
		PLAYER_WHITE,
		helpers as chessHelper,
		helpers
	} from '$lib/chess/core';
	import ChessBookMove from './ChessBookMove.svelte';

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

	async function pieceMove(
		playerPiece: PlayerPiece,
		startPosition: ChessPosition,
		finalPosition: ChessPosition
	) {
		let tempBoard = board;
		const isValidMove = chessHelper.validateMovingPiece(tempBoard, {
			piece: playerPiece.piece,
			finalPosition,
			startPosition,
			player: playerPiece.player
		});
		if (!isValidMove) return;

		const kingCanBeCapturedAfterMove = helpers.kingCanBeCaputuredAfterMove(tempBoard, {
			piece: playerPiece.piece,
			startPosition,
			finalPosition,
			player: playerPiece.player
		});
		if (kingCanBeCapturedAfterMove) return false;

		// TODO: Handle King Castle. 2 piece move so we need to create conditions.
		const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
		const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
		if (
			playerPiece.piece.name === CHESS_PIECE.king.name &&
			Math.abs(startHorizontal - finalHorizontal) === 2
		) {
			if (finalHorizontal - startHorizontal > 0) {
				// Move right rook
				tempBoard[`${startVertical}_${startHorizontal + 1}`] = {
					id: tempBoard[`${startVertical}_${finalHorizontal + 1}`]!.id,
					piece: {
						...tempBoard[`${startVertical}_${finalHorizontal + 1}`]!.piece
					},
					player: playerPiece.player
				};
				delete tempBoard[`${startVertical}_${finalHorizontal + 1}`];

				// Move King
				tempBoard[finalPosition] = {
					id: playerPiece.id,
					piece: {
						...playerPiece.piece
					},
					player: playerPiece.player
				};
				delete tempBoard[startPosition];
			} else {
				// Move left rook
				tempBoard[`${startVertical}_${startHorizontal - 1}`] = {
					id: tempBoard[`${startVertical}_${finalHorizontal - 2}`]!.id,
					piece: {
						...tempBoard[`${startVertical}_${finalHorizontal - 2}`]!.piece
					},
					player: playerPiece.player
				};
				delete tempBoard[`${startVertical}_${finalHorizontal - 2}`];

				// Move King
				tempBoard[finalPosition] = {
					id: playerPiece.id,
					piece: {
						...playerPiece.piece
					},
					player: playerPiece.player
				};
				delete tempBoard[startPosition];
			}
		} else {
			// Update board position
			tempBoard[finalPosition] = {
				id: playerPiece.id,
				piece: {
					...playerPiece.piece
				},
				player: playerPiece.player
			};
			delete tempBoard[startPosition];
		}

		// Update move history
		moveHistory = [
			...moveHistory,
			{
				startPosition: {
					...playerPiece,
					position: startPosition
				},
				endPosition: {
					...playerPiece,
					position: finalPosition
				}
			}
		];

		board = chessHelper.generateAllPossibleMoves(tempBoard);

		const isGameOver = chessHelper.gameOver(tempBoard, {
			piece: playerPiece.piece,
			startPosition,
			finalPosition,
			player: playerPiece.player
		});
		if (isGameOver) {
			// Todo: Change alert with custom toast. (We learn store on that toast feature.)
			alert('Game Over');
			winner.player = playerPiece.player;
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
		const pieceOnPosition = board[startPosition]!;
		pieceOnPosition.piece.possibleMoves = chessHelper.validPieceMoves(board, {
			piece: pieceOnPosition.piece,
			player: pieceOnPosition.player,
			startPosition: startPosition
		});
	}

	function onCellClick(position: ChessPosition) {
		if (winner.player) return;

		let pieceOnPosition = board[position];
		if (activePiece && (!pieceOnPosition || pieceOnPosition.player !== activePlayer)) {
			pieceMove(activePiece, activePiece.position, position);
		} else {
			if (!pieceOnPosition) return;
			if (pieceOnPosition.player !== activePlayer) return;
			setActivePiece(pieceOnPosition, position);
		}
	}

	function resetBoard() {
		if (timeinterval) clearInterval(timeinterval);
		board = { ...CHESS_START_POSITION };
		moveHistory = [];
		activePiece = null;
		timeLeft = {
			'1': 60,
			'2': 60
		};
	}

	async function onBoardMove(boardHistory: string) {
		resetBoard();

		const allMove = boardHistory.split('|');
		const movePositions = allMove.map((move) => {
			const [startPosition, finalPosition] = move.split(',');
			return {
				startPosition,
				finalPosition
			};
		});

		for (const movePosition of movePositions) {
			const { startPosition, finalPosition } = movePosition;
			if (startPosition) {
				setActivePiece(board[startPosition]!, startPosition);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
			if (!finalPosition) continue;
			if (activePiece) {
				pieceMove(activePiece, activePiece.position, finalPosition);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	onMount(async () => {
		board = chessHelper.generateAllPossibleMoves(board);
	});

	onDestroy(() => {
		if (timeinterval) clearInterval(timeinterval);
	});
</script>

<div
	class="grid grid-cols-1 lg:grid-cols-2 justify-center h-full gap-8 p-4 duration-100 max-w-6xl mx-auto"
>
	<div class="relative w-full flex flex-col rounded overflow-hidden">
		<ChessTime class="rounded-t" timeLeft={timeLeft[2]} initialTime={60} player={PLAYER_BLACK} />
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
				{@const piece = board[position]}
				{#if activePiece?.piece.possibleMoves.includes(position)}
					<div
						class="
								w-4 h-4 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
								{piece !== undefined ? '' : 'bg-gray-900 bg-opacity-20'}
							"
					>
						{#if piece !== undefined}
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
	<div class="grid gap-2">
		<ChessMoveHistory moves={moveHistory} />
		<ChessBookMove on:boardMove={(event) => onBoardMove(event.detail)} />
	</div>
</div>
<div class="text-white text-center text-2xl font-bold">
	{#if winner.player}
		{winner.player === PLAYER_BLACK ? 'Black' : 'White'} Win! {winner.type}
	{:else}
		{activePlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
	{/if}
</div>
