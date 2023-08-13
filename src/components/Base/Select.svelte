<!-- <script>
	import {
		Listbox,
		ListboxButton,
		ListboxOptions,
		ListboxOption
	} from '@rgossiaux/svelte-headlessui';
	import { fade } from 'svelte/transition';

	const people = [
		{ id: 1, name: 'Durward Reynolds' },
		{ id: 2, name: 'Kenton Towne' },
		{ id: 3, name: 'Therese Wunsch' },
		{ id: 4, name: 'Benedict Kessler' },
		{ id: 5, name: 'Katelyn Rohan' }
	];

	let selectedPerson = people[0];
</script>

<Listbox class="relative" bind:value={selectedPerson} let:open>
	<ListboxButton>{selectedPerson.name}</ListboxButton>
	{#if open}
		<div transition:fade>
			<ListboxOptions class="absolute" static>
				{#each people as person (person.id)}
					<ListboxOption value={person}>
						{person.name}
					</ListboxOption>
				{/each}
			</ListboxOptions>
		</div>
	{/if}
</Listbox> -->
