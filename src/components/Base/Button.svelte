<script lang="ts">
	type ButtonVariant = 'default' | 'secondary' | 'unstyled';
	export let variant: ButtonVariant = 'default';

	const variantClass: Record<ButtonVariant, string> = {
		default: 'bg-[#21201d] hover:bg-[#282724] active:bg-[#151412] text-white',
		secondary: '',
		unstyled: ''
	};
</script>

<button
	{...$$restProps}
	class="{variant === 'unstyled' ? '' : 'p-2 duration-150 rounded'} {variantClass[
		variant
	]} {$$props.class} {$$props.disabled ? '!cursor-not-allowed' : ''}"
	on:click
>
	<slot />
</button>
