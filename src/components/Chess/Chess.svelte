<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import ChessBoard from './ChessBoard.svelte';
	import ChessTime from './ChessTime.svelte';
	import Modal from '../Base/Modal.svelte';

	import { uuidv4 } from '$lib/utils/uuid';
	import {
		CHESS_PIECE,
		PLAYER_BLACK,
		PLAYER_WHITE,
		CHESS_HELPERS,
		INITIAL_BOARD_POSITION,
		INITIAL_TIME,
		INITIAL_PLAYER_INFO
	} from '$lib/chess/core';

	// Chess Information
	let chessGame: ChessInfo = {
		board: INITIAL_BOARD_POSITION,
		moveHistory: [],
		players: INITIAL_PLAYER_INFO,
		currentPlayer: PLAYER_WHITE,
		moveCount: 1
	};

	// Game Info
	let boardRotateable = false;
	let activePiece: ActivePiece | null = null;
	let winner: Winner = {
		player: null,
		type: null
	};

	function onCellClick(position: ChessPosition) {
		if (winner.player) return;

		let pieceOnPosition = chessGame.board[position];
		if (activePiece && (!pieceOnPosition || pieceOnPosition.player !== chessGame.currentPlayer)) {
			movePiece(activePiece, activePiece.position, position);
		} else {
			if (!pieceOnPosition) return;
			if (pieceOnPosition.player !== chessGame.currentPlayer) return;
			setActivePiece(pieceOnPosition, position);
		}
	}

	function setActivePiece(piece: PlayerPiece, position: ChessPosition) {
		activePiece = { ...piece, position };
		// const pieceOnPosition = board[position]!;
		// pieceOnPosition.piece.possibleMoves = CHESS_HELPERS.legalMoves(board, {
		// 	piece: pieceOnPosition.piece,
		// 	player: pieceOnPosition.player,
		// 	startPosition: position
		// });
	}

	async function movePiece(
		playerPiece: PlayerPiece,
		startPosition: ChessPosition,
		finalPosition: ChessPosition
	) {
		const isValidMove = CHESS_HELPERS.validatePieceMove(chessGame, {
			piece: playerPiece.piece,
			finalPosition,
			startPosition,
			player: playerPiece.player
		});

		if (!isValidMove) return;

		const kingCanBeCapturedAfterMove = CHESS_HELPERS.kingCanBeCaputuredAfterMove(chessGame, {
			piece: playerPiece.piece,
			startPosition,
			finalPosition,
			player: playerPiece.player
		});

		if (kingCanBeCapturedAfterMove) return;

		const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
		const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

		const isEnPassant =
			playerPiece.piece.name === CHESS_PIECE.pawn.name &&
			Math.abs(finalHorizontal - startHorizontal) === 1 &&
			[3, 6].includes(finalVertical);

		const isCastling =
			playerPiece.piece.name === CHESS_PIECE.king.name &&
			Math.abs(startHorizontal - finalHorizontal) === 2;

		const isPromoting =
			playerPiece.piece.name === CHESS_PIECE.pawn.name && [1, 8].includes(finalVertical);

		if (isCastling) {
			const rookStartPosition =
				finalHorizontal - startHorizontal > 0
					? `${startVertical}_${finalHorizontal + 1}`
					: `${startVertical}_${finalHorizontal - 2}`;
			const rookFinalPosition =
				finalHorizontal - startHorizontal > 0
					? `${startVertical}_${startHorizontal + 1}`
					: `${startVertical}_${startHorizontal - 1}`;
			updateCellPosition(rookStartPosition, rookFinalPosition);

			updateCellPosition(startPosition, finalPosition);
		} else if (isPromoting) {
			updateCellPosition(startPosition, finalPosition);
			const newPiece = await choosePromotionPiece();
			swapPiece(finalPosition, newPiece, playerPiece.player);
		} else if (isEnPassant) {
			updateCellPosition(startPosition, finalPosition);
			delete chessGame.board[`${startVertical}_${finalHorizontal}`];
		} else {
			updateCellPosition(startPosition, finalPosition);
		}

		storeMoveHistory({
			startPosition: startPosition,
			finalPosition: finalPosition,
			moveAt: chessGame.moveCount
		});

		// Regenerate all legal moves after piece move.
		chessGame.board = CHESS_HELPERS.generateAllLegalMoves(chessGame);

		const enemyKingPosition = Object.entries(chessGame.board).find(
			([_, boardPiece]) =>
				boardPiece?.player !== chessGame.currentPlayer && boardPiece?.piece.name === 'king'
		)?.[0]!;
		let routeToCheck: Array<ChessPosition> = [];
		if (chessGame.board[finalPosition]?.piece.possibleAttacks.includes(enemyKingPosition)) {
			alert('check');
			routeToCheck = [
				...CHESS_HELPERS.generateMoveRoutes(finalPosition, enemyKingPosition),
				finalPosition,
				enemyKingPosition
			];

			// Regenerate all legal moves after piece move | Update the piece possible move to attack / block the kings.
			chessGame.board = CHESS_HELPERS.generateAllLegalMoves(chessGame, {
				checker: routeToCheck.length > 0 ? playerPiece.player : undefined,
				checkRoutes: routeToCheck
			});

			const isGameOver = CHESS_HELPERS.gameOver(chessGame, {
				piece: playerPiece.piece,
				startPosition,
				finalPosition,
				player: playerPiece.player
			});

			if (isGameOver) {
				onGameOver({
					winnerPlayer: playerPiece.player,
					type: 'checkmate'
				});
				return;
			}
		}

		activePiece = null;
		chessGame.currentPlayer =
			chessGame.currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;

		if (timeinterval) clearInterval(timeinterval);
		timeinterval = setInterval(timeCountDown, 1000);
	}

	function updateCellPosition(startPosition: ChessPosition, finalPosition: ChessPosition) {
		const boardPieceStart = chessGame.board[startPosition];
		if (!boardPieceStart) return;
		const boardPiece = chessGame.board[finalPosition];

		if (boardPiece) {
			chessGame.players[chessGame.currentPlayer].capturedPieces = [
				...chessGame.players[chessGame.currentPlayer].capturedPieces,
				boardPiece.piece
			];
		}

		boardPieceStart.piece.moveHistory = [
			...boardPieceStart.piece.moveHistory,
			{
				finalPosition: finalPosition,
				startPosition: startPosition,
				moveAt: chessGame.moveHistory.length
			}
		];
		chessGame.board[finalPosition] = {
			id: boardPieceStart.id,
			piece: {
				...boardPieceStart.piece
			},
			player: boardPieceStart.player
		};
		delete chessGame.board[startPosition];
	}

	function swapPiece(position: ChessPosition, piece: Piece, player: Player) {
		chessGame.board[position] = {
			id: uuidv4(),
			piece: piece,
			player: player
		};
	}

	function resetBoard() {
		if (timeinterval) clearInterval(timeinterval);
		chessGame.board = { ...INITIAL_BOARD_POSITION };
		chessGame.moveHistory = [];
		activePiece = null;
		chessGame.currentPlayer = PLAYER_WHITE;
		// playersInfo = { ...INITIAL_PLAYER_INFO };
		chessGame.players = {
			1: {
				capturedPieces: [],
				time: INITIAL_TIME
			},
			2: {
				capturedPieces: [],
				time: INITIAL_TIME
			}
		};
		winner.player = null;
		winner.type = null;
	}

	function onGameOver({ winnerPlayer, type }: { winnerPlayer: Player; type: string }) {
		alert('Game Over');
		winner.player = winnerPlayer;
		winner.type = type;
		activePiece = null;
		if (timeinterval) clearInterval(timeinterval);
	}

	// Replay
	// TODO: Replay controls
	async function viewReplay(replayHistory: string) {
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
				setActivePiece(chessGame.board[startPosition]!, startPosition);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
			if (!finalPosition) continue;
			if (activePiece) {
				movePiece(activePiece, activePiece.position, finalPosition);
			}
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
	// End Replay

	// Board History
	// let moveHistories: Array<PieceMoveHistory> = [];
	function storeMoveHistory(pieceMoveHistory: PieceMoveHistory) {
		chessGame.moveHistory = [...chessGame.moveHistory, pieceMoveHistory];
	}
	// End Board History

	// Time
	let timeinterval: NodeJS.Timer;
	function timeCountDown() {
		if (chessGame.players[chessGame.currentPlayer].time === 0) {
			winner.player = chessGame.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
			winner.type = 'On Time';
			activePiece = null;
			clearInterval(timeinterval);
		} else {
			chessGame.players[chessGame.currentPlayer].time =
				chessGame.players[chessGame.currentPlayer].time - 1;
		}
	}
	// End Time

	// Promotion
	let showModalPromotion = false;
	let promotionPieceResolver: (value: Piece) => void;
	function choosePromotionPiece() {
		showModalPromotion = true;
		return new Promise<Piece>((resolve, reject) => {
			promotionPieceResolver = resolve;
		});
	}

	function onChoosePromotionPiece(piece: Piece) {
		promotionPieceResolver(piece);
		showModalPromotion = false;
	}
	// End Promotion

	onMount(() => {
		chessGame.board = CHESS_HELPERS.generateAllLegalMoves(chessGame);
	});

	onDestroy(() => {
		if (timeinterval) clearInterval(timeinterval);
	});
</script>

<Modal bind:showModal={showModalPromotion}>
	<ol class="flex gap-2">
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(CHESS_PIECE.queen);
				}}
			>
				<Icon icon={CHESS_PIECE.queen.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
			</button>
		</li>
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(CHESS_PIECE.rook);
				}}
			>
				<Icon icon={CHESS_PIECE.rook.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
			</button>
		</li>
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(CHESS_PIECE.bishop);
				}}
			>
				<Icon icon={CHESS_PIECE.bishop.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
			</button>
		</li>
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(CHESS_PIECE.knight);
				}}
			>
				<Icon icon={CHESS_PIECE.knight.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
			</button>
		</li>
	</ol>
</Modal>
<div class="relative w-full h-[100svh] flex flex-col justify-between">
	<ChessTime
		timeLeft={chessGame.players[PLAYER_BLACK].time}
		initialTime={INITIAL_TIME}
		player={PLAYER_BLACK}
	/>
	<div class="flex flex-col gap-1 justify-center bg-[#282724] p-1 md:p-4">
		<div class="flex flex-wrap justify-start items-center gap-2 w-full text-white">
			{chessGame.players[PLAYER_BLACK].capturedPieces.reduce((accumulator, currentValue) => {
				return accumulator + currentValue.power;
			}, 0)}
			{#each chessGame.players[PLAYER_BLACK].capturedPieces as capturedPiece}
				<Icon icon={capturedPiece.icon ?? ''} class="w-4 h-4 md:!w-7 md:!h-7 duration-300 " />
			{/each}
		</div>
		<ChessBoard
			on:cellClick={(event) => {
				onCellClick(event.detail.position);
			}}
			activePlayer={chessGame.currentPlayer}
			{activePiece}
			board={chessGame.board}
			rotateable={boardRotateable}
		>
			<div slot="cell" let:position>
				{@const piece = chessGame.board[position]}
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
											{chessGame.currentPlayer === PLAYER_BLACK ? 'rotate-180' : ''}
										"
							/>
						{/if}
					</div>
				{/if}
			</div>
		</ChessBoard>
		<div class="flex flex-row-reverse flex-wrap justify-start items-center gap-2 w-full text-black">
			{chessGame.players[PLAYER_WHITE].capturedPieces.reduce((accumulator, currentValue) => {
				return accumulator + currentValue.power;
			}, 0)}
			{#each chessGame.players[PLAYER_WHITE].capturedPieces as capturedPiece}
				<Icon icon={capturedPiece.icon ?? ''} class="w-4 h-4 md:!w-7 md:!h-7 duration-300" />
			{/each}
		</div>
	</div>
	<ChessTime
		timeLeft={chessGame.players[PLAYER_WHITE].time}
		initialTime={INITIAL_TIME}
		player={PLAYER_WHITE}
	/>
</div>
