<script lang="ts">
	import {
		Disclosure,
		DisclosureButton,
		DisclosurePanel,
		Transition
	} from '@rgossiaux/svelte-headlessui';
	import Button from './Button.svelte';
	import Icon from '@iconify/svelte';

	export let openDisclosure: boolean = false;
</script>

<Disclosure let:open let:close defaultOpen={openDisclosure}>
	<DisclosureButton class="w-full">
		<Button variant="secondary" class="w-full !border-b-0 flex justify-between items-center">
			<slot name="title" />
			<div class="">
				<Icon
					icon="pajamas:chevron-up"
					class="w-8 h-8 duration-300 {open ? 'rotate-0' : 'rotate-180'}"
				/>
			</div>
		</Button>
	</DisclosureButton>
	<Transition
		enter="transition duration-100 ease-out"
		enterFrom="transform scale-95 opacity-0"
		enterTo="transform scale-100 opacity-100"
		leave="transition duration-75 ease-out"
		leaveFrom="transform scale-100 opacity-100"
		leaveTo="transform scale-95 opacity-0"
	>
		<DisclosurePanel>
			<slot {open} {close} />
		</DisclosurePanel>
	</Transition>
</Disclosure>
