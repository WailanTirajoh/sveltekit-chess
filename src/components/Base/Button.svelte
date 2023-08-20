<script lang="ts">
	type ButtonVariant = 'primary' | 'secondary' | 'unstyled';
	export let variant: ButtonVariant = 'primary';
	export let href: string | undefined = undefined;

	const variantClass: Record<ButtonVariant, string> = {
		primary:
			'bg-[#81b64c] hover:bg-[#a2d160] active:bg-[#98c15b] border-b-[#45753c] text-white disabled:bg-[#88ba56]',
		secondary:
			'bg-[#403e3c] hover:bg-[#51504d] active:bg-[#4e4c4a] border-b-[#333230] text-white disabled:bg-[#403e3c]',
		unstyled: ''
	};

	$: component = href === undefined ? 'button' : 'a';
	$: role = component === 'button' ? 'button' : 'link';
</script>

<svelte:element
	this={component}
	{...$$restProps}
	class="{variant === 'unstyled' ? '' : 'p-2 duration-150 rounded-lg border-b-4'} 
	{variantClass[variant]}  
	{$$props.class ?? ''}  
	{$$props.disabled ? '!cursor-not-allowed' : ''} 
	{component === 'a' ? 'inline-block text-center' : ''}"
	{href}
	{role}
	on:click
>
	<slot />
</svelte:element>
