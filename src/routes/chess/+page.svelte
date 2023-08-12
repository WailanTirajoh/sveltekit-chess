<script lang="ts">
	import { goto } from '$app/navigation';
	import { uuidv4 } from '$lib/utils/uuid';
	import { onMount } from 'svelte';
	import Button from '../../components/Base/Button.svelte';
	import { db } from '$lib/firebase/firebase';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import Chess from '../../components/Chess/Chess.svelte';
	import { authStore } from '../../stores/store';
	import ChessBoard from '../../components/Chess/ChessBoard.svelte';

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
				<div class="bg-gray-900 p-2 rounded">
					{#if $authStore.data.email}
						<ChessBoard board={chessGame.board} />
					{/if}
					<div class="">
						<hr />
					</div>
					<div class="p-2 text-center">
						{chessGame.playerWhite?.displayName ?? '-'} VS {chessGame.playerBlack?.displayName ??
							'-'}
					</div>
					<a class="w-full" href={`/chess/${chessGame.id}`}>
						<Button class="w-full">Go</Button>
					</a>
				</div>
			{/each}
		{/if}
	</div>
</div>
