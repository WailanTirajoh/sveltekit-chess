<script lang="ts">
	import { goto } from '$app/navigation';
	import { uuidv4 } from '$lib/utils/uuid';
	import { onMount } from 'svelte';
	import Button from '../../components/Base/Button.svelte';
	import { db } from '$lib/firebase/firebase';
	import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
	import { authStore } from '../../stores/store';
	import ChessBoard from '../../components/Chess/ChessBoard.svelte';
	import Icon from '@iconify/svelte';

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

<div class="grid grid-cols-12 gap-4">
	<div class="col-span-12">
		<Button on:click={() => onCreateNewGame()}>
			<div class="flex gap-2 items-center">
				<Icon icon="bxs:chess" />
				Create New Game
			</div>
		</Button>
	</div>
	<div class="col-span-12">
		<div class="grid gap-4">
			<div class="grid sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{#if chessGames.length > 0}
					{#each chessGames as chessGame}
						<div class="bg-[#262522] p-2 rounded flex flex-col gap-4 py-4">
							{#if $authStore.data.email}
								<ChessBoard boardSize="xxs" board={chessGame.board} />
							{/if}
							<div class="">
								<hr class="border-[#3c3b39]" />
							</div>
							<div class="p-2 text-center flex justify-center items-center gap-4">
								<div class="flex flex-col items-center gap-1">
									{#if chessGame.playerWhite}
										<img
											class="w-16 h-16 rounded object-contain"
											src={chessGame.playerWhite.photoUrl}
											alt={chessGame.playerWhite.displayName}
										/>
										<div class="">
											{chessGame.playerWhite.displayName}
											{#if chessGame.playerWhite.uid === $authStore.user?.uid} (You) {/if}
										</div>
									{:else}
										-
									{/if}
								</div>
								<div class="">VS</div>
								<div class="flex flex-col items-center gap-1">
									{#if chessGame.playerBlack}
										<img
											class="w-16 h-16 rounded object-contain"
											src={chessGame.playerBlack.photoUrl}
											alt={chessGame.playerBlack.displayName}
										/>
										<div class="">
											{chessGame.playerBlack.displayName}
											{#if chessGame.playerBlack.uid === $authStore.user?.uid} (You) {/if}
										</div>
									{:else}
										-
									{/if}
								</div>
							</div>
							<a class="w-full" href={`/chess/${chessGame.id}`}>
								<Button class="w-full">Go</Button>
							</a>
						</div>
					{/each}
				{:else}
					<div class="text-center">No Data</div>
				{/if}
			</div>
		</div>
	</div>
</div>
