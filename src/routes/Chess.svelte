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
		CHESS_HELPERS,
		INITIAL_TIME,
		INITIAL_PLAYER_INFO
	} from '$lib/chess/core';
	import { uuidv4 } from '$lib/utils/uuid';
	import Modal from './Modal.svelte';

	// BOARD
	let board: Board = CHESS_START_POSITION;
	let boardRotateable = false;

	// PLAYER
	let playersInfo: PlayerInfo = INITIAL_PLAYER_INFO;
	let activePlayer: Player = PLAYER_WHITE;
	let activePiece: ActivePiece | null = null;
	let winner: Winner = {
		player: null,
		type: null
	};

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
		activePiece = { ...piece, position };
	}

	async function movePiece(
		playerPiece: PlayerPiece,
		startPosition: ChessPosition,
		finalPosition: ChessPosition
	) {
		const isValidMove = CHESS_HELPERS.validatePieceMove(board, {
			piece: playerPiece.piece,
			finalPosition,
			startPosition,
			player: playerPiece.player
		});

		if (!isValidMove) return;

		const kingCanBeCapturedAfterMove = CHESS_HELPERS.kingCanBeCaputuredAfterMove(board, {
			piece: playerPiece.piece,
			startPosition,
			finalPosition,
			player: playerPiece.player
		});

		if (kingCanBeCapturedAfterMove) return;

		const [startVertical, startHorizontal] = startPosition.split('_').map(Number);
		const [finalVertical, finalHorizontal] = finalPosition.split('_').map(Number);

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

		board = CHESS_HELPERS.generateAllLegalMoves(board);

		const isGameOver = CHESS_HELPERS.gameOver(board, {
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

		activePiece = null;
		activePlayer = activePlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;

		if (timeinterval) clearInterval(timeinterval);
		timeinterval = setInterval(timeCountDown, 1000);

		board = CHESS_HELPERS.generateAllLegalMoves(board);
	}

	function updateCellPosition(startPosition: ChessPosition, finalPosition: ChessPosition) {
		const boardPiece = board[finalPosition];
		if (boardPiece) {
			playersInfo[activePlayer].capturedPieces = [
				...playersInfo[activePlayer].capturedPieces,
				boardPiece.piece
			];
		}
		board[finalPosition] = {
			id: board[startPosition]!.id,
			piece: {
				...board[startPosition]!.piece
			},
			player: board[startPosition]!.player
		};
		delete board[startPosition];
	}

	function swapPiece(position: ChessPosition, piece: Piece, player: Player) {
		board[position] = {
			id: uuidv4(),
			piece: piece,
			player: player
		};
	}

	function resetBoard() {
		if (timeinterval) clearInterval(timeinterval);
		board = { ...CHESS_START_POSITION };
		moveHistories = [];
		activePiece = null;
		activePlayer = PLAYER_WHITE;
		// playersInfo = { ...INITIAL_PLAYER_INFO };
		playersInfo = {
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
	// End Replay

	// Board History
	let moveHistories: Array<PieceMoveHistory> = [];
	function storeMoveHistory(pieceMoveHistory: PieceMoveHistory) {
		moveHistories = [...moveHistories, pieceMoveHistory];
	}
	// End Board History

	// Time
	let timeinterval: NodeJS.Timer;
	function timeCountDown() {
		if (playersInfo[activePlayer].time === 0) {
			winner.player = activePlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
			winner.type = 'On Time';
			activePiece = null;
			clearInterval(timeinterval);
		} else {
			playersInfo[activePlayer].time = playersInfo[activePlayer].time - 1;
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

	onMount(async () => {
		board = CHESS_HELPERS.generateAllLegalMoves(board);
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
<div
	class="grid grid-cols-1 lg:grid-cols-3 justify-center h-full gap-8 p-4 duration-100 max-w-6xl mx-auto"
>
	<div class="flex flex-col gap-2 lg:col-span-2">
		<div class="relative w-full flex flex-col rounded overflow-hidden">
			<ChessTime
				class="rounded-t"
				timeLeft={playersInfo[PLAYER_BLACK].time}
				initialTime={INITIAL_TIME}
				player={PLAYER_BLACK}
			/>
			<div class="flex justify-center bg-[#282724] p-4 px-8">
				<div class="flex flex-wrap flex-col justify-start items-center gap-2 w-12 text-white">
					{playersInfo[PLAYER_BLACK].capturedPieces.reduce((accumulator, currentValue) => {
						return accumulator + currentValue.power;
					}, 0)}
					{#each playersInfo[PLAYER_BLACK].capturedPieces as capturedPiece}
						<Icon
							icon={capturedPiece.icon ?? ''}
							class="!w-3 !h-3 !sm:w-5 !sm:h-5 md:!w-7 md:!h-7 duration-300 "
						/>
					{/each}
				</div>
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
				<div
					class="flex flex-wrap flex-col-reverse justify-start items-center gap-2 w-12 text-black"
				>
					{playersInfo[PLAYER_WHITE].capturedPieces.reduce((accumulator, currentValue) => {
						return accumulator + currentValue.power;
					}, 0)}
					{#each playersInfo[PLAYER_WHITE].capturedPieces as capturedPiece}
						<Icon
							icon={capturedPiece.icon ?? ''}
							class="!w-3 !h-3 !sm:w-5 !sm:h-5 md:!w-7 md:!h-7 duration-300"
						/>
					{/each}
				</div>
			</div>
			<ChessTime
				class="rounded-b"
				timeLeft={playersInfo[PLAYER_WHITE].time}
				initialTime={INITIAL_TIME}
				player={PLAYER_WHITE}
			/>
		</div>
		<div class="text-white text-center text-2xl font-bold">
			{#if winner.player}
				{winner.player === PLAYER_BLACK ? 'Black' : 'White'} Win! {winner.type}
			{:else}
				{activePlayer === PLAYER_BLACK ? 'Black' : 'White'} to move
			{/if}
		</div>
	</div>
	<div class="grid gap-2">
		<ChessMoveHistory moves={moveHistories} />
		<ChessBookMove on:viewReplay={(event) => viewReplay(event.detail)} />
	</div>
</div>
