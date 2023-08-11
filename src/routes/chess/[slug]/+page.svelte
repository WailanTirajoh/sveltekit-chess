<script lang="ts">
	import {
		CHESS_PIECE,
		INITIAL_BOARD_POSITION,
		INITIAL_PLAYER_INFO,
		PLAYER_BLACK,
		PLAYER_WHITE
	} from '$lib/chess/core';
	import { uuidv4 } from '$lib/utils/uuid';
	import Chess from '../../../components/Chess/Chess.svelte';
	import { auth, db } from '$lib/firebase/firebase';
	import {
		DocumentReference,
		doc,
		getDoc,
		setDoc,
		type DocumentData,
		onSnapshot
	} from 'firebase/firestore';
	import { onMount } from 'svelte';
	import { authStore } from '../../../stores/store';
	import Modal from '../../../components/Base/Modal.svelte';
	import Icon from '@iconify/svelte';

	export let data;
	let chess: ChessInfo;
	let chessRef: DocumentReference<DocumentData, DocumentData>;

	onMount(async () => {
		auth.onAuthStateChanged(async (user) => {
			if (user) {
				const docRef = doc(db, 'chess', data.slug);
				const docSnap = await getDoc(docRef);
				chessRef = doc(db, 'chess', data.slug);
				if (!docSnap.exists()) {
					const playAs = await choosePlayAs();
					await setDoc(
						chessRef,
						{
							id: data.slug,
							board: INITIAL_BOARD_POSITION,
							moveHistory: [],
							players: INITIAL_PLAYER_INFO,
							currentPlayer: PLAYER_WHITE,
							playerWhite: playAs === PLAYER_WHITE ? user.email : null,
							playerBlack: playAs === PLAYER_BLACK ? user.email : null,
							moveCount: 1,
							winner: {
								player: null,
								type: null
							}
						},
						{
							merge: false
						}
					);
				} else {
					const chessData = docSnap.data();
					chess = chessData as ChessInfo;
					if (
						(!chess.playerBlack || !chess.playerWhite) &&
						![chess.playerBlack, chess.playerWhite].includes(user.email)
					) {
						const playAs = await choosePlayAs();
						if (playAs === PLAYER_WHITE) {
							chess.playerWhite = user.email;
						} else {
							chess.playerBlack = user.email;
						}
						await setDoc(chessRef, chess, {
							merge: false
						});
					}
				}
			}
			const unsub = onSnapshot(doc(db, 'chess', data.slug), (doc) => {
				chess = doc.data() as ChessInfo;
			});
		});
	});

	async function syncData() {
		chessRef = doc(db, 'chess', data.slug);
		await setDoc(chessRef, chess, { merge: false });
	}

	// Promotion
	let showModalChoosePlayAs = false;
	let playAsResolver: (player: Player) => void;
	function choosePlayAs() {
		showModalChoosePlayAs = true;
		return new Promise<Player>((resolve, reject) => {
			playAsResolver = resolve;
		});
	}

	function onChoosePromotionPiece(player: Player) {
		playAsResolver(player);
		showModalChoosePlayAs = false;
	}
	// End Promotion
</script>

<Modal class="bg-[#302e2b]" bind:showModal={showModalChoosePlayAs}>
	<ol class="flex gap-2">
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(PLAYER_WHITE);
				}}
			>
				<div class="">
					<Icon icon={CHESS_PIECE.king.icon} class="w-20 h-20 duration-300 pt-2 text-white" />
				</div>
				<div class="">
					{chess?.playerWhite ?? 'Choose'}
				</div>
			</button>
		</li>
		<li>
			<button
				on:click={() => {
					onChoosePromotionPiece(PLAYER_BLACK);
				}}
			>
				<div class="">
					<Icon icon={CHESS_PIECE.king.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
				</div>
				<div class="">
					{chess?.playerBlack ?? 'Choose'}
				</div>
			</button>
		</li>
	</ol>
</Modal>
{#if chess}
	{#if !chess.playerWhite || !chess.playerBlack}
		<div class="text-center">Please wait for other player to join.</div>
	{/if}
	<Chess bind:chessGame={chess} on:onMove={() => syncData()} on:gameOver={() => syncData()} />
{/if}
