<script lang="ts">
	import { goto } from '$app/navigation';
	import { uuidv4 } from '$lib/utils/uuid';
	import { onMount } from 'svelte';
	import Button from '../../components/Base/Button.svelte';
	import { db } from '$lib/firebase/firebase';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import Chess from '../../components/Chess/Chess.svelte';

	function onCreateNewGame() {
		goto(`/chess/${uuidv4()}`);
	}

	let chessGames: Array<ChessInfo> = [];
	onMount(async () => {
		const q = collection(db, 'chess');

		const querySnapshot = await getDocs(q);
		querySnapshot.forEach((doc) => {
			const d = doc.data() as ChessInfo;
			chessGames = [...chessGames, d];
		});
	});
</script>

<div class="grid gap-4">
	<Button on:click={onCreateNewGame}>Create New Game</Button>

	<div class="flex flex-wrap gap-4">
		{#if chessGames.length > 0}
			{#each chessGames as chessGame}
				<!-- <Chess {chessGame} /> -->
				<a href={`/chess/${chessGame.id}`}>
					{chessGame.id}
				</a>
			{/each}
		{/if}
	</div>
</div>
