<script lang="ts">
	type ButtonVariant = 'default' | 'secondary';
	export let variant: ButtonVariant = 'default';

	const variantClass: Record<ButtonVariant, string> = {
		default: 'bg-[#21201d] hover:bg-[#282724] active:bg-[#151412] text-white',
		secondary: ''
	};
</script>

<button class="p-2 duration-150 {variantClass[variant]} {$$props.class}" on:click>
	<slot />
</button>
