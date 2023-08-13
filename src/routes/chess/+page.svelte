<script lang="ts">
	import { goto } from '$app/navigation';
	import { uuidv4 } from '$lib/utils/uuid';
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase/firebase';
	import {
		collection,
		getDocs,
		limit,
		or,
		query,
		where,
		startAfter,
		Query,
		QuerySnapshot,
		type DocumentData
	} from 'firebase/firestore';
	import { authStore } from '../../stores/auth';
	import ChessBoard from '../../components/Chess/ChessBoard.svelte';
	import Button from '../../components/Base/Button.svelte';
	import Icon from '@iconify/svelte';

	const limitData = 6;
	let chessGames: Array<ChessInfo> = [];
	let querySnapshot: QuerySnapshot<DocumentData, DocumentData>;
	let isFetching: boolean = false;
	
	$: endOfFile = chessGames.length % limitData !== 0;

	function onCreateNewGame() {
		goto(`/chess/create`);
	}

	async function generateData(query: Query<DocumentData, DocumentData>) {
		querySnapshot = await getDocs(query);
		querySnapshot.forEach((doc) => {
			const d = doc.data() as ChessInfo;
			chessGames = [...chessGames, d];
		});
	}

	function loadMore() {
		const q = query(
			collection(db, 'chess'),
			or(
				where('playerBlack.email', '==', $authStore.user?.email),
				where('playerWhite.email', '==', $authStore.user?.email)
			),
			startAfter(querySnapshot.docs[querySnapshot.docs.length - 1]),
			limit(limitData)
		);
		generateData(q);
	}

	onMount(async () => {
		isFetching = true;
		const q = query(
			collection(db, 'chess'),
			or(
				where('playerBlack.email', '==', $authStore.user?.email),
				where('playerWhite.email', '==', $authStore.user?.email)
			),
			limit(limitData)
		);
		await generateData(q);
		isFetching = false;
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
				{#if isFetching}
					<div class="text-center w-full h-44 md:h-96 bg-[#262522] rounded-lg" />
					<div class="text-center w-full h-44 md:h-96 bg-[#262522] rounded-lg" />
					<div class="text-center w-full h-44 md:h-96 bg-[#262522] rounded-lg" />
					<div class="text-center w-full h-44 md:h-96 bg-[#262522] rounded-lg" />
				{:else if chessGames.length === 0}
					<div class="text-center sm:col-span-2 xl:col-span-3">No Data</div>
				{:else}
					{#each chessGames as chessGame}
						<div class="bg-[#262522] p-2 rounded flex flex-col gap-4 py-4">
							<ChessBoard boardSize="xxs" board={chessGame.board} />
							<div class="">
								<hr class="border-[#3c3b39]" />
							</div>
							<div class="p-2 text-center flex justify-center items-center gap-4">
								<div class="flex flex-col items-center gap-1">
									{#if chessGame.playerWhite}
										<img
											class="w-16 h-16 rounded object-contain"
											src={chessGame.playerWhite.photoURL}
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
											src={chessGame.playerBlack.photoURL}
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
				{/if}
			</div>
			<div class="flex justify-center">
				{#if !endOfFile}
					{#if chessGames.length !== 0}
						<Button on:click={() => loadMore()} disabled={endOfFile}>Load More</Button>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
