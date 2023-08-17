<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authStore } from '../../stores/auth';
	import Button from '../Base/Button.svelte';

	export let chatHistory: ChatHistory;

	$: authUser = $authStore.user;

	$: {
		chatHistory;
		const scrollableElement = document.getElementById('chat-body');
		if (scrollableElement) {
			setTimeout(() => {
				scrollableElement.scrollTo({
					top: scrollableElement.scrollHeight,
					behavior: 'smooth'
				});
			}, 100);
		}
	}

	const dispatch = createEventDispatcher();

	let chat = '';

	function onSubmit() {
		if (!chat || chat === '') return;
		dispatch('submitChat', {
			from: authUser,
			message: chat
		});
		chat = '';
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.shiftKey && event.key === 'Enter') {
			onSubmit();
			event.preventDefault();
		}
	}
</script>

<div class="bg-[#262522] rounded-lg overflow-hidden">
	<header class="p-2 bg-[#21201d] text-xl">Chat History</header>
	<main class="p-2">
		<ul id="chat-body" class="flex flex-col gap-4 h-96 overflow-auto">
			{#if chatHistory?.chats?.length === 0}
				<li class="text-gray-400 text-center italic">Be the first one to chat!</li>
			{:else}
				{#each chatHistory?.chats ?? [] as chat}
					<li>
						<div class="flex gap-4">
							<img src={chat.from.photoURL} alt="Test" class="w-6 h-6 rounded-full" />
							<div class="">
								<div class="">{chat.from.displayName}</div>
								<p class="text-gray-300 max-w-3xl">
									{chat.message}
								</p>
							</div>
						</div>
					</li>
				{/each}
			{/if}
		</ul>
	</main>
	<footer class="p-2 bg-[#21201d]">
		<textarea
			class="w-full bg-[#262522] rounded p-2 text-white focus:outline-none"
			placeholder="Type here . . . (Shift + Enter to submit)"
			bind:value={chat}
			on:keydown={onKeyDown}
		/>
		<Button
			class="block md:hidden w-full"
			on:click={() => {
				onSubmit();
			}}
		>
			Submit
		</Button>
	</footer>
</div>
