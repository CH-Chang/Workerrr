<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Avatar, Button } from 'bits-ui';
	import { createMessageBoxStore } from '$lib/components/message-box/store';

	onMount(() => {
		const key = $page.url.searchParams.get('key');
		if (key === null) goto('/error/404');
	});

	const messageBoxStore = createMessageBoxStore();

	const handleCancelClick = () => {
		messageBoxStore.push('提示訊息', '請再次確認是否取消今日的打工人打卡排程', [
			{
				text: '確認',
				callback: () => {
					handleCancelConfirmClick();
				}
			},
			{ text: '取消' }
		]);
	};

	const handleCancelConfirmClick = () => {};
</script>

<div class="flex flex-col w-full max-w-screen-xl m-auto">
	<div class="flex flex-row items-center justify-end gap-4">
		
		<div>
			<h2>親愛的打工人您好！</h2>
		</div>
		<div>
			<Avatar.Root class="h-12 w-12 rounded-full border border-foreground">
				<div
					class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent"
				>
					<Avatar.Image />
					<Avatar.Fallback class="border border-muted"
						><svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-6"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
							/>
						</svg>
					</Avatar.Fallback>
				</div>
			</Avatar.Root>
		</div>
	</div>
	<div class="rounded-2xl mt-8 px-6 py-6 flex flex-col">
		<div class="flex flex-col">
			<div class="flex flex-row gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
					/>
				</svg>
				<h3>即將執行</h3>
			</div>
			<div class="rounded-xl py-8 px-6 bg-stone-800 mt-4 flex flex-row">
				<table class="flex-1">
					<tr>
						<td class="text-zinc-200 text-sm font-bold py-2">打卡項目</td>
						<td class="text-zinc-200 text-sm font-bold py-2">打卡帳號</td>
						<td class="text-zinc-200 text-sm font-bold py-2">執行時間</td>
						<td class="text-zinc-200 text-sm font-bold py-2">相關操作</td>
					</tr>
					<tr>
						<td class="text-zinc-200 text-sm font-normal py-2">SYSTEX</td>
						<td class="text-zinc-200 text-sm font-normal py-2">1234567</td>
						<td class="text-zinc-200 text-sm font-normal py-2">2024-08-19 15:00:00</td>
						<td class="text-zinc-200 text-sm font-normal py-2">
							<Button.Root class="bg-zinc-200 text-stone-800 py-1 px-2 rounded-md border-2 border-zinc-200 hover:bg-stone-800 hover:text-zinc-200 transition-all">取消執行</Button.Root>
							<Button.Root class="bg-zinc-200 text-stone-800 py-1 px-2 rounded-md border-2 border-zinc-200 hover:bg-stone-800 hover:text-zinc-200 transition-all">變更密碼</Button.Root>
						</td>
					</tr>
				</table>
			</div>
		</div>
		<div class="mt-8">
			<div class="flex flex-row gap-2">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
					/>
				</svg>
				<h3>我的打卡記錄</h3>
			</div>
		</div>
	</div>
</div>

<style>
</style>
