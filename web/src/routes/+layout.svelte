<script>
	import '../app.css';
	import MessageBox from '$lib/components/message-box/components/MessageBox.svelte'
</script>

<div class="app">
	<slot />
	<MessageBox />
</div>

<style>
</style>
