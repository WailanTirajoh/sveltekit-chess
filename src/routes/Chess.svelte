<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import ChessBoard from './ChessBoard.svelte';
	import ChessMoveHistory from './ChessMoveHistory.svelte';
	import ChessTime from './ChessTime.svelte';
	import ChessBookMove from './ChessBookMove.svelte';
	import {
		CHESS_PIECE,
		CHESS_START_POSITION,
		PLAYER_BLACK,
		PLAYER_WHITE,
		helpers as chessHelper
	} from '$lib/chess/core';

	// Reactive Data
	let activePlayer: Player = PLAYER_WHITE;
	let activePiece: ActivePiece | null = null;
	let winner: Winner = {
		player: null,
		type: null
	};
	let boardRotateable = false;
	let board: Board = CHESS_START_POSITION;

	function onCellClick(position: ChessPosition) {
		if (winner.player) return;

		let pieceOnPosition = board[position];
		if (activePiece && (!pieceOnPosition || pieceOnPosition.player !== activePlayer)) {
			movePiece(activePiece, activePiece.position, position);
		} else {
			if (!pieceOnPosition) return;
			if (pieceOnPosition.player !== activePlayer) return;
			setActivePiece(pieceOnPosition, position);
		}
	}

	function setActivePiece(piece: PlayerPiece, position: ChessPosition) {
		activePiece = { ...piece, position: position };
		const pieceOnPosition = board[position]!;
		pieceOnPosition.piece.possibleMoves = chessHelper.validPieceMoves(board, {
			piece: pieceOnPosition.piece,
			player: pieceOnPosition.player,
			startPosition: position
		});
	}

	async function movePiece(
		playerPiece: PlayerPiece,
		startPosition: ChessPosition,
		finalPosition: ChessPosition
	) {
		const isValidMove = chessHelper.validateMovingPiece(board, {
			piece: playerPiece.piece,
			finalPosition,
			startPosition,
			player: playerPiece.player
		});
		if (!isValidMove) return;

		const kingCanBeCapturedAfterMove = chessHelper.kingCanBeCaputuredAfterMove(board, {
			piece: playerPiece.piece,
			startPosition,
			finalPosition,
			player: playerPiece.player
		});
		if (kingCanBeCapturedAfterMove) return false;

		const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
		const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);
		const isCastling =
			playerPiece.piece.name === CHESS_PIECE.king.name &&
			Math.abs(startHorizontal - finalHorizontal) === 2;
		if (isCastling) {
			if (finalHorizontal - startHorizontal > 0) {
				// Move right rook
				const rookStartPosition = `${startVertical}_${finalHorizontal + 1}`;
				const rookFinalPosition = `${startVertical}_${startHorizontal + 1}`;
				updateCellPosition(rookStartPosition, rookFinalPosition);

				// Move King
				updateCellPosition(startPosition, finalPosition);
			} else {
				// Move left rook
				const rookStartPosition = `${startVertical}_${finalHorizontal - 2}`;
				const rookFinalPosition = `${startVertical}_${startHorizontal - 1}`;
				updateCellPosition(rookStartPosition, rookFinalPosition);

				// Move King
				updateCellPosition(startPosition, finalPosition);
			}
		} else {
			updateCellPosition(startPosition, finalPosition);
		}

		storeMoveHistory({
			startPosition: {
				...playerPiece,
				position: startPosition
			},
			endPosition: {
				...playerPiece,
				position: finalPosition
			}
		});

		board = chessHelper.generateAllPossibleMoves(board);

		const isGameOver = chessHelper.gameOver(board, {
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

	function updateCellPosition(startPosition: ChessPosition, finalPosition: ChessPosition) {
		board[finalPosition] = {
			id: board[startPosition]!.id,
			piece: {
				...board[startPosition]!.piece
			},
			player: board[startPosition]!.player
		};
		delete board[startPosition];
	}

	function resetBoard() {
		if (timeinterval) clearInterval(timeinterval);
		board = { ...CHESS_START_POSITION };
		moveHistories = [];
		activePiece = null;
		timeLeft = {
			'1': 60,
			'2': 60
		};
	}

	async function onViewReplay(replayHistory: string) {
		resetBoard();

		const allMove = replayHistory.split('|');
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
				movePiece(activePiece, activePiece.position, finalPosition);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	// Board History
	let moveHistories: Array<PieceMoveHistory> = [];
	function storeMoveHistory(pieceMoveHistory: PieceMoveHistory) {
		moveHistories = [...moveHistories, pieceMoveHistory];
	}
	// End Board History

	// Time
	let timeLeft: PlayerTime = {
		1: 60,
		2: 60
	};
	let timeinterval: NodeJS.Timer;
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
	// End Time

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
				{#if activePiece?.piece.possibleMoves.includes(position) && activePiece.player !== piece?.player}
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
		<ChessMoveHistory moves={moveHistories} />
		<ChessBookMove on:viewReplay={(event) => onViewReplay(event.detail)} />
	</div>
</div>
<div class="text-white text-center text-2xl font-bold">
	{#if winner.player}
		{winner.player === PLAYER_BLACK ? 'Black' : 'White'} Win! {winner.type}
	{:else}
		{activePlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
	{/if}
</div>
