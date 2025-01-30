<script>
	import '../app.css';
	import MessageBox from '$lib/components/message-box/components/MessageBox.svelte'
	import Spinner from '$lib/components/spinner/components/Spinner.svelte'
</script>

<div>
	<slot />
	<MessageBox />
	<Spinner />
</div>

<style>
</style>
