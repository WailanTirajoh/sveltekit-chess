<script lang="ts">
	import type { Unsubscribe } from 'firebase/auth';
	import { db } from '$lib/firebase/firebase';
	import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
	import { onDestroy, onMount } from 'svelte';
	import { uuidv4 } from '$lib/utils/uuid';
	import ChatUi from './ChatUi.svelte';

	export let id: string;
	export let type: 'ingame' | 'public';

	const docRef = doc(db, 'chat', id);
	let unsubscribe: Unsubscribe;
	let chatHistory: ChatHistory;

	async function onSubmitChat(customEvent: CustomEvent) {
		chatHistory.chats.push({
			from: customEvent.detail.from,
			message: customEvent.detail.message,
			id: uuidv4(),
			createdAt: new Date().toISOString()
		});

		syncData();
	}

	async function syncData() {
		await setDoc(docRef, { ...chatHistory, updatedAt: serverTimestamp() });
	}

	onMount(async () => {
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			const newChatHistory: ChatHistory = {
				id: id,
				type: type,
				chats: [],
				createdAt: serverTimestamp()
			};
			await setDoc(docRef, newChatHistory);
		}

		unsubscribe = onSnapshot(docRef, (doc) => {
			chatHistory = doc.data() as ChatHistory;
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
</script>

{#if id}
	<ChatUi {chatHistory} on:submitChat={(e) => onSubmitChat(e)} />
{/if}
