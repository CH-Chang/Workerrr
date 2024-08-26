<script lang="ts">
	import { Tooltip, DropdownMenu } from 'bits-ui';
	import { createMessageBoxStore } from '$lib/components/message-box/store';
	import { createPunchInStore } from './store/punch-in';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import dayjs from 'dayjs';

	const messageBoxStore = createMessageBoxStore();
	const punchInStore = createPunchInStore();

	onMount(async () => {
		await punchInStore.queryPunchIns();
	});

	const handleRefreshClick = async () => {
		await punchInStore.queryPunchIns();
	};

	const handleAddClick = () => {
		messageBoxStore.push('提示訊息', '打工人開發中，敬請期待！', [
			{
				text: '確認'
			}
		]);
	};

	const handleDetailClick = (punchInId: number) => {
		messageBoxStore.push('提示訊息', '打工人開發中，敬請期待！', [
			{
				text: '確認'
			}
		]);
	};

	const handleCancelClick = (punchInId: number) => {
		messageBoxStore.push('提示訊息', '請再次確認是否取消今日的打工人打卡排程', [
			{
				text: '確認',
				callback: async () => {
					await handleCancelConfirmClick(punchInId);
				}
			},
			{ text: '取消' }
		]);
	};

	const handleChangePasswordClick = (punchInId: number) => {
		messageBoxStore.push('提示訊息', '打工人開發中，敬請期待！', [
			{
				text: '確認'
			}
		]);
	};

	const handleCancelConfirmClick = async (punchInId: number) => {
		await punchInStore.cancelPunchIn(punchInId);
	};
</script>

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
	<div class="flex flex-row self-end gap-4">
		<button
			class="flex flex-row gap-2 items-center justify-center transition-all text-sm hover:text-lg active:text-base"
			on:click={handleAddClick}
		>
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
			創建
		</button>
		<button
			class="flex flex-row gap-2 items-center justify-center transition-all text-sm hover:text-lg active:text-base"
			on:click={handleRefreshClick}
		>
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
					d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
				/>
			</svg>
			刷新
		</button>
	</div>
	<div class="rounded-xl py-8 px-6 bg-stone-800 mt-4 flex flex-col">
		{#if $punchInStore.loading}
			<div class="flex flex-row items-center justify-center">
				<svg
					aria-hidden="true"
					class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-zinc-200"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
				<span class="sr-only">Loading...</span>
			</div>
		{:else}
			{#each $punchInStore.punchIns as punchIn}
				<div class="flex flex-row items-center justify-center py-2">
					<div class="flex-1 px-2">
						<p class="text-zinc-200 text-sm">
							{punchIn.punchInType.toUpperCase()} - {punchIn.punchInAccount}
						</p>
					</div>
					<div class="px-2 py-2 flex flex-row justify-center items-center bg-zinc-200 rounded-lg">
						<Tooltip.Root openDelay={0}>
							<Tooltip.Trigger class="flex flex-row items-center justify-center gap-1">
								{#if punchIn.punchInEnable === 'Y' && punchIn.punchInManualType === '' && punchIn.punchInStatus === ''}
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
									<p class="text-stone-800 text-sm ml-1">等待中</p>
								{:else if punchIn.punchInEnable === 'Y' && punchIn.punchInManualType === '' && punchIn.punchInStatus === 'Success'}
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
											d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
										/>
									</svg>
									<p class="text-stone-800 text-sm ml-1">已成功</p>
								{:else if punchIn.punchInEnable === 'Y' && punchIn.punchInManualType === '' && punchIn.punchInStatus === 'Failed'}
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
											d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
										/>
									</svg>
									<p class="text-stone-800 text-sm ml-1">已失敗</p>
								{:else if punchIn.punchInEnable === 'Y' && punchIn.punchInManualType === 'Cancel'}
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
											d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
										/>
									</svg>
									<p class="text-stone-800 text-sm ml-1">已取消</p>
								{:else if punchIn.punchInEnable === 'N'}
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
											d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
										/>
									</svg>

									<p class="text-stone-800 text-sm ml-1">已禁用</p>
								{:else}
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
											d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
										/>
									</svg>

									<p class="text-stone-800 text-sm ml-1">錯誤</p>
								{/if}
							</Tooltip.Trigger>
							<Tooltip.Content transition={fade} sideOffset={15}>
								{#if punchIn.punchInEnable === 'Y' && punchIn.punchInManualType === ''}
									<div class="bg-zinc-200">
										<Tooltip.Arrow class="rounded-[2px] border-l border-t border-zinc-200" />
									</div>
									<div
										class="flex items-center justify-center p-3 text-sm font-medium shadow-popover outline-none bg-zinc-200 rounded-lg"
									>
										執行時間 {dayjs().format('YYYY-MM-DD')} 15:00:00 起
									</div>
								{/if}
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
									on:click={() => handleDetailClick(punchIn.punchInId)}
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
									on:click={() => handleChangePasswordClick(punchIn.punchInId)}
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
								{#if punchIn.punchInStatus === '' && punchIn.punchInManualType === ''}
									<DropdownMenu.Item
										class="flex flex-row h-10 select-none items-center justify-start rounded-button py-3 pl-3 pr-1.5 text-sm hover:bg-zinc-300 active:bg-zinc-400 transition-all cursor-pointer"
										on:click={() => handleCancelClick(punchIn.punchInId)}
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
								{/if}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
