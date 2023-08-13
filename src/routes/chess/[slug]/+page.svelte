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
	import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import Modal from '../../../components/Base/Modal.svelte';
	import Icon from '@iconify/svelte';
	import Button from '../../../components/Base/Button.svelte';

	export let data;

	let chess: ChessInfo;
	let chessRef = doc(db, 'chess', data.slug);

	async function syncData() {
		await setDoc(chessRef, { ...chess, updatedAt: serverTimestamp() });
	}

	const unsubscribe = onSnapshot(chessRef, (doc) => {
		chess = doc.data() as ChessInfo;
	});

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
		const docRef = doc(db, 'chess', data.slug);
		const docSnap = await getDoc(docRef);
		if (!docSnap.exists()) return;
		chess = docSnap.data() as ChessInfo;
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<div class="grid grid-cols-12 gap-4">
	<div class="col-span-12">
		{#if chess}
			<Chess bind:chessGame={chess} on:move={() => syncData()} on:gameOver={() => syncData()} />
		{/if}
	</div>
</div>
