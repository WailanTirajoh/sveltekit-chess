<script lang="ts">
	import Chat from '../../../components/Chat/Chat.svelte';

	export let data;
</script>

<div class="">
	<Chat id={data.slug} type="public" />
</div>
