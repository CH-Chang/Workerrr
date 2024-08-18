<script lang="ts">
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { Button } from 'bits-ui'
	import { createMessageBoxStore } from '$lib/components/message-box/store'

	onMount(() => {
		const key = $page.url.searchParams.get('key')
		if (key === null) goto('/error/404')
	})

	const messageBoxStore = createMessageBoxStore()

	const handleCancelClick = () => {
		messageBoxStore.push(
			'提示訊息',
			'請再次確認是否取消今日的打工人打卡排程',
			[
				{ text: '確認', callback: () => { handleCancelConfirmClick() } },
				{ text: '取消'}
			])
	}

	const handleCancelConfirmClick = () => {
	}
</script>

<div>
	<Button.Root on:click={handleCancelClick}>測試</Button.Root>
</div>

<style>
</style>
