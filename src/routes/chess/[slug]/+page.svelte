<script lang="ts">
	import Chess from '../../../components/Chess/Chess.svelte';
	import { db } from '$lib/firebase/firebase';
	import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
	import { onDestroy } from 'svelte';
	import Chat from '../../../components/Chat/Chat.svelte';

	export let data;

	let chess: ChessInfo | null = null;
	let chessRef = doc(db, 'chess', data.slug);

	async function syncData() {
		await setDoc(chessRef, { ...chess, updatedAt: serverTimestamp() });
	}

	const unsubscribe = onSnapshot(chessRef, (doc) => {
		chess = doc.data() as ChessInfo;
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

<svelte:head>
	<title>{chess?.playerWhite?.displayName} vs {chess?.playerBlack?.displayName}</title>
</svelte:head>

<div class="grid grid-cols-12 gap-4">
	<div class="col-span-12">
		{#if chess}
			<div class="grid gap-4 grid-cols-12">
				<div class="col-span-12 lg:col-span-8">
					<Chess bind:chessGame={chess} on:move={() => syncData()} on:gameOver={() => syncData()} />
				</div>
				<div class="col-span-12 lg:col-span-4 pb-10">
					<Chat id={data.slug} type="public" />
				</div>
			</div>
		{/if}
	</div>
</div>
