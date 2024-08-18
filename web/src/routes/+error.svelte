<script>
	import { goto } from '$app/navigation'
    import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store';

    const loaded = writable(false)

    onMount(() => {
        if ($page.status === 404) goto('/error/404')
        loaded.set(true)
    })
</script>

<div class="w-screen h-screen bg-stone-800">
	{#if $loaded}
    <div class="fixed top-20 left-8">
		<p class="text-xl font-noto font-black text-zinc-200">APP<br /> CRASHED!</p>
	</div>
	<div class="fixed bottom-20 right-8">
		<p class="text-xl font-noto font-black text-zinc-200 text-right">APP<br /> CRASHED!</p>
	</div>
	<div class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
		<div class="flex flex-col justify-center items-center">
			<h1 class="text-3xl font-noto font-bold text-zinc-200">QQ.. 打工人葛屁了！</h1>
            <h2 class="text-medium font-noto font-bold text-zinc-200 mt-4">{$page.status} - {$page.error?.message ?? ''}</h2>
		</div>
		<div class="flex flex-row items-center justify-center mt-24 gap-4">
			<a href="/">
				<button
					class="font-noto text-base border-2 border-zinc-200 bg-stone-800 text-zinc-200 py-1 px-4 rounded-md transition-all hover:bg-zinc-200 hover:text-stone-800 active:text-sm"
					>返回首頁</button
				>
			</a>
		</div>
	</div>
	<div class="fixed bottom-5 left-[50%] translate-x-[-50%] font-noto">
		<p class="text-md text-zinc-200">Copyright © 2024 Workerrr. All rights reserved.</p>
	</div>
    {/if}
</div>
