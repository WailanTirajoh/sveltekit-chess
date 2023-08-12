<script lang="ts">
	import {
		CHESS_PIECE,
		INITIAL_BOARD_POSITION,
		INITIAL_PLAYER_INFO,
		PLAYER_BLACK,
		PLAYER_WHITE
	} from '$lib/chess/core';
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
	import { onDestroy, onMount } from 'svelte';
	import Modal from '../../../components/Base/Modal.svelte';
	import Icon from '@iconify/svelte';
	import Button from '../../../components/Base/Button.svelte';
	import type { Unsubscribe } from 'firebase/auth';

	export let data;

	let chess: ChessInfo;
	let chessRef: DocumentReference<DocumentData, DocumentData>;
	let unsubscribe: Unsubscribe;

	async function syncData() {
		chessRef = doc(db, 'chess', data.slug);
		await setDoc(chessRef, chess);
	}

	// PlayAs
	let showModalChoosePlayAs = false;
	let playAsResolver: (player: Player) => void;
	function choosePlayAs() {
		showModalChoosePlayAs = true;
		return new Promise<Player>((resolve, reject) => {
			playAsResolver = resolve;
		});
	}

	function onChoosePlayAsPiece(player: Player) {
		playAsResolver(player);
		showModalChoosePlayAs = false;
	}
	// End PlayAs

	onMount(async () => {
		auth.onAuthStateChanged(async (user) => {
			if (!user) return;

			const docRef = doc(db, 'chess', data.slug);
			const docSnap = await getDoc(docRef);
			chessRef = doc(db, 'chess', data.slug);

			const userData: UserInfo = {
				uid: user.uid,
				displayName: user.displayName,
				email: user.email,
				photoUrl: user.photoURL
			};

			if (!docSnap.exists()) {
				const playAs = await choosePlayAs();
				const chessInitialData = {
					id: data.slug,
					board: INITIAL_BOARD_POSITION,
					moveHistory: [],
					players: INITIAL_PLAYER_INFO,
					currentPlayer: PLAYER_WHITE,
					playerWhite: playAs === PLAYER_WHITE ? userData : null,
					playerBlack: playAs === PLAYER_BLACK ? userData : null,
					moveCount: 1,
					winner: {
						player: null,
						type: null
					}
				};
				await setDoc(chessRef, chessInitialData);
			} else {
				const chessData = docSnap.data();
				chess = chessData as ChessInfo;
				if (
					(!chess.playerBlack || !chess.playerWhite) &&
					![chess.playerBlack?.uid, chess.playerWhite?.uid].includes(userData.uid)
				) {
					const playAs = await choosePlayAs();
					if (playAs === PLAYER_WHITE) {
						chess.playerWhite = userData;
					} else {
						chess.playerBlack = userData;
					}
					await setDoc(chessRef, chess);
				}
			}

			unsubscribe = onSnapshot(doc(db, 'chess', data.slug), (doc) => {
				chess = doc.data() as ChessInfo;
			});
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<Modal
	class="bg-[#302e2b] overflow-hidden rounded text-white"
	bind:showModal={showModalChoosePlayAs}
>
	<ol class="flex gap-4">
		<li>
			<Button
				class="grid gap-2 justify-center p-4 w-40 {chess?.playerWhite ? 'bg-[#282724]' : ''}"
				disabled={!!chess?.playerWhite}
				on:click={() => {
					onChoosePlayAsPiece(PLAYER_WHITE);
				}}
			>
				<div class="flex justify-center">
					<Icon icon={CHESS_PIECE.king.icon} class="w-20 h-20 duration-300 pt-2 text-white" />
				</div>
				<div>
					{chess?.playerWhite?.displayName ?? 'Choose'}
				</div>
			</Button>
		</li>
		<li>
			<Button
				class="grid gap-2 justify-center p-4 w-40"
				disabled={!!chess?.playerBlack}
				on:click={() => {
					onChoosePlayAsPiece(PLAYER_BLACK);
				}}
			>
				<div class="flex justify-center">
					<Icon icon={CHESS_PIECE.king.icon} class="w-20 h-20 duration-300 pt-2 text-black" />
				</div>
				<div>
					{chess?.playerBlack?.displayName ?? 'Choose'}
				</div>
			</Button>
		</li>
	</ol>
</Modal>

<div class="grid grid-cols-12 gap-4">
	<div class="col-span-12">
		<a href="/dashboard">
			<Button class="flex gap-2 items-center">
				<Icon icon="pajamas:go-back" />
				Back
			</Button>
		</a>
	</div>
	<div class="col-span-12">
		{#if chess}
			<Chess bind:chessGame={chess} on:onMove={() => syncData()} on:gameOver={() => syncData()} />
		{/if}
	</div>
</div>
