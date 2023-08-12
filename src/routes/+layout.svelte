<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase/firebase';
	import { authHandlers, authStore, type AuthUserData } from '../stores/store';
	import { doc, getDoc, setDoc } from 'firebase/firestore';
	import Button from '../components/Base/Button.svelte';
	import { page } from '$app/stores';
	import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
	import { createPopperActions } from 'svelte-popperjs';

	const [popperRef, popperContent] = createPopperActions();

	const nonAuthRoutes = ['/'];

	async function handleLogout() {
		try {
			await authHandlers.logout();
		} catch (error) {
			console.log('Error:', error);
		}
	}

	async function handleLoginGoogle() {
		try {
			await authHandlers.loginWithGoogle();
		} catch (error) {
			console.log('Error:', error);
		}
	}

	const popperOptions = {
		placement: 'bottom-end',
		strategy: 'fixed',
		modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
	};

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			const currentPath = $page.url.pathname;

			if (!user && !nonAuthRoutes.includes(currentPath)) {
				window.location.href = '/';
				return;
			}

			if (user && currentPath === '/') {
				window.location.href = '/dashboard';
				return;
			}

			if (!user) return;

			let userStore: AuthUserData;
			const docRef = doc(db, 'users', user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				const userRef = doc(db, 'users', user.uid);
				userStore = {
					email: user.email
				};
				await setDoc(userRef, userStore, {
					merge: true
				});
			} else {
				const userData = docSnap.data();
				userStore = userData;
			}

			authStore.update((curr) => {
				return {
					...curr,
					user,
					data: userStore
				};
			});
		});
	});
</script>

<div class="app">
	<main class="bg-[#302e2b] h-full min-h-[100svh] text-white">
		<header
			class="flex items-center justify-between p-2 bg-[#282724] shadow-inner z-20 fixed top-0 w-full h-11 border-b border-b-[#3c3b39]"
		>
			<div class="" />
			<div class="">
				{#if $authStore.user}
					<Popover style="position: relative;">
						<PopoverButton class="flex items-center" use={[popperRef]}>
							<img
								class="rounded-full w-8 h-8"
								src={$authStore.user.photoURL}
								alt={$authStore.user.displayName}
							/>
						</PopoverButton>

						<PopoverPanel
							class="bg-[#282724] border border-[#3c3b39] rounded shadow overflow-hidden z-20"
							use={[[popperContent, popperOptions]]}
						>
							<ul>
								<li>
									<Button
										variant="unstyled"
										class="w-36 bg-[#282724] hover:bg-[#1c1b19] p-2"
										on:click={handleLogout}
									>
										Logout
									</Button>
								</li>
							</ul>
						</PopoverPanel>
					</Popover>
				{:else}
					<Button on:click={handleLoginGoogle}>Login</Button>
				{/if}
			</div>
		</header>
		<div class="pt-16 md:px-2">
			<slot />
		</div>
	</main>
</div>

<style>
</style>
