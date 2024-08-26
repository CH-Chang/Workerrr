<script lang="ts">
	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
</script>

<div class="flex flex-col min-h-screen min-w-screen bg-zinc-100">
	<Header />
	<div class="flex-1 w-full">
		<slot />
	</div>
	<Footer />
</div>
