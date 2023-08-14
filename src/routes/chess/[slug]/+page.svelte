<script lang="ts">
	import Chess from '../../../components/Chess/Chess.svelte';
	import { db } from '$lib/firebase/firebase';
	import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
	import { onDestroy } from 'svelte';

	export let data;

	let chess: ChessInfo;
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

<div class="grid grid-cols-12 gap-4">
	<div class="col-span-12">
		{#if chess}
			<Chess bind:chessGame={chess} on:move={() => syncData()} on:gameOver={() => syncData()} />
		{/if}
	</div>
</div>
