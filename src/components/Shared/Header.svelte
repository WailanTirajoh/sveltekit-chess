<script>
	import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';

	import Pawn from '../Svg/Pawn.svelte';
	import Button from '../Base/Button.svelte';
	import { authHandlers, authStore } from '../../stores/auth';
	import { createPopperActions } from 'svelte-popperjs';

	async function handleLogout() {
		try {
			await authHandlers.logout();
		} catch (error) {
			console.log('Error:', error);
		}
	}

	// Popover
	const [popperRef, popperContent] = createPopperActions();
	const popperOptions = {
		placement: 'bottom-end',
		strategy: 'fixed',
		modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
	};
	// End Popover
</script>

{#if $authStore.user}
	<header
		class="flex items-center justify-between p-2 bg-[#282724] shadow-inner z-20 fixed top-0 w-full h-11 border-b border-b-[#3c3b39]"
	>
		<a href="/chess">
			<Pawn />
		</a>
		<div class="">
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
		</div>
	</header>
{/if}
