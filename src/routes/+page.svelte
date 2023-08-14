<script lang="ts">
	import Button from '../components/Base/Button.svelte';
	import { authHandlers } from '../stores/auth';

	async function handleLoginGoogle() {
		await authHandlers.loginWithGoogle();
	}
</script>

<svelte:head>
	<title>Svelte Chess</title>
	<meta name="description" content="Simple chess, to learn svelte" />
</svelte:head>

<section class="h-screen w-full flex items-center justify-center">
	<div class="bg-[#282724] p-2 -mt-64 w-96">
		<Button class="w-full" on:click={() => handleLoginGoogle()}>Login With Google</Button>
	</div>
</section>
