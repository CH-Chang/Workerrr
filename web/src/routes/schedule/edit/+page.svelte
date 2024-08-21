<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Avatar, Tooltip, DropdownMenu, Collapsible, Pagination, Separator } from 'bits-ui';
	import { createMessageBoxStore } from '$lib/components/message-box/store';
	import { fade, slide } from 'svelte/transition';

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

	const handleAddClick = () => {
		messageBoxStore.push('提示訊息', '打工人開發中，敬請期待！', [
			{
				text: '確認'
			}
		]);
	};

	const handleChangePasswordClick = () => {
		messageBoxStore.push('提示訊息', '打工人開發中，敬請期待！', [
			{
				text: '確認'
			}
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
			<div class="flex flex-row self-end gap-2">
				<button class="flex flex-row gap-2" on:click={handleAddClick}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-6"
					>
						<path
							fill-rule="evenodd"
							d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
							clip-rule="evenodd"
						/>
					</svg>
					新的！
				</button>
			</div>
			<div class="rounded-xl py-8 px-6 bg-stone-800 mt-4 flex flex-col">
				<div class="flex flex-row items-center justify-center py-2">
					<div class="flex-1 px-2">
						<p class="text-zinc-200 text-sm">SYSTEX - 2100396</p>
					</div>
					<div class="px-2 py-2 flex flex-row justify-center items-center bg-zinc-200 rounded-lg">
						<Tooltip.Root openDelay={0}>
							<Tooltip.Trigger class="flex flex-row items-center justify-center gap-1">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-4"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
									/>
								</svg>

								<p class="text-stone-800 text-sm ml-1">等待</p>
							</Tooltip.Trigger>
							<Tooltip.Content transition={fade} sideOffset={15}>
								<div class="bg-zinc-200">
									<Tooltip.Arrow class="rounded-[2px] border-l border-t border-zinc-200" />
								</div>
								<div
									class="flex items-center justify-center p-3 text-sm font-medium shadow-popover outline-none bg-zinc-200 rounded-lg"
								>
									執行時間 2024-08-21 12:00:00
								</div>
							</Tooltip.Content>
						</Tooltip.Root>
					</div>
					<div
						class="px-2 py-2 flex flex-row justify-center items-center bg-zinc-200 rounded-lg ml-4"
					>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-5 text-stone-800 font-bold"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m19.5 8.25-7.5 7.5-7.5-7.5"
									/>
								</svg>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								class="w-full max-w-[180px] rounded-xl bg-zinc-200 py-1.5 shadow-popover overflow-hidden"
								transition={fade}
								sideOffset={15}
							>
								<DropdownMenu.Item
									class="flex flex-row h-10 select-none items-center justify-start rounded-button py-3 pl-3 pr-1.5 text-sm hover:bg-zinc-300 active:bg-zinc-400 transition-all cursor-pointer"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="size-4"
									>
										<path
											fill-rule="evenodd"
											d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
											clip-rule="evenodd"
										/>
										<path
											fill-rule="evenodd"
											d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z"
											clip-rule="evenodd"
										/>
									</svg>
									<p class="flex items-center ml-2">查看細節</p>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="flex flex-row h-10 select-none items-center justify-start rounded-button py-3 pl-3 pr-1.5 text-sm hover:bg-zinc-300 active:bg-zinc-400 transition-all cursor-pointer"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="size-4"
									>
										<path
											fill-rule="evenodd"
											d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
											clip-rule="evenodd"
										/>
									</svg>

									<p class="flex items-center ml-2">更改密碼</p>
								</DropdownMenu.Item>
								<DropdownMenu.Item
									class="flex flex-row h-10 select-none items-center justify-start rounded-button py-3 pl-3 pr-1.5 text-sm hover:bg-zinc-300 active:bg-zinc-400 transition-all cursor-pointer"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="size-4"
									>
										<path
											fill-rule="evenodd"
											d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
											clip-rule="evenodd"
										/>
									</svg>

									<p class="flex items-center ml-2">取消執行</p>
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
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
			<div class="rounded-xl py-8 px-6 bg-stone-800 mt-4 flex flex-col">
				<Collapsible.Root class="w-full">
					<div class="flex items-center justify-between">
						<div class="flex-1">
							<h4 class="text-sm text-zinc-200">2024-08-21</h4>
						</div>
						<Collapsible.Trigger>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-6 text-zinc-200"
							>
								<path
									fill-rule="evenodd"
									d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z"
									clip-rule="evenodd"
								/>
								<path
									fill-rule="evenodd"
									d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z"
									clip-rule="evenodd"
								/>
							</svg>
						</Collapsible.Trigger>
					</div>
					<Collapsible.Content
						transition={slide}
						class="flex flex-col gap-3 bg-zinc-200 mt-2 rounded-lg px-4 py-4"
					>
						<div class="flex flex-row w-full items-center">
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡項目 - SYSTEX</p>
							</div>
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡帳號 - 2100396</p>
							</div>
						</div>
						<div class="flex flex-row w-full items-center">
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡狀態 - 已成功</p>
							</div>
							<div class="flex-1">
								<p class="text-stone-800 text-sm">狀態細節 - 無</p>
							</div>
						</div>
						<div class="flex flex-row w-full items-center">
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡時間 - 2024-08-21 15:00:00</p>
							</div>
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			</div>
			<div class="flex flex-row items-center justify-center py-4">
				<Pagination.Root count={500} perPage={10} let:pages let:range>
					<div class="flex items-center">
						<Pagination.PrevButton
							class="mr-[10px] flex size-8 items-center justify-center bg-stone-800 rounded-xl"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-4 text-zinc-200"
							>
								<path
									fill-rule="evenodd"
									d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
									clip-rule="evenodd"
								/>
							</svg>
						</Pagination.PrevButton>
						<div class="flex items-center gap-2.5">
							{#each pages as page (page.key)}
								{#if page.type === 'ellipsis'}
									<div class="text-sm text-stone-800">...</div>
								{:else}
									<Pagination.Page
										{page}
										class="flex size-8 items-center justify-center rounded-xl text-stone-800"
									>
										{page.value}
									</Pagination.Page>
								{/if}
							{/each}
						</div>
						<Pagination.NextButton
							class="ml-[10px] flex size-8 items-center justify-center bg-stone-800 rounded-xl"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="size-4 text-zinc-200"
							>
								<path
									fill-rule="evenodd"
									d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
									clip-rule="evenodd"
								/>
							</svg>
						</Pagination.NextButton>
					</div>
					<p class="text-center text-sm text-stone-800 mt-2">
						目前顯示第 {range.start} - {range.end} 筆項目
					</p>
				</Pagination.Root>
			</div>
		</div>
	</div>
</div>

<style>
</style>
