<script lang="ts">
	import { Collapsible, Pagination } from 'bits-ui';
	import { slide } from 'svelte/transition';
	import { createPunchInLogStore } from './store/punch-in-log';
	import { onMount } from 'svelte';

	const punchInLogStore = createPunchInLogStore();

	onMount(async () => {
		await punchInLogStore.queryPunchInLogs(0, $punchInLogStore.pageCount);
	});

	const handlePageChange = async (page: number) => {
		await punchInLogStore.queryPunchInLogs(page, $punchInLogStore.pageCount);
	};
</script>

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
		{#if $punchInLogStore.loading}
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
			{#each $punchInLogStore.punchInLogs as punchInLog}
				<Collapsible.Root class="w-full py-2">
					<div class="flex items-center justify-between">
						<div class="flex-1">
							<h4 class="text-sm text-zinc-200">{punchInLog.punchInDatetime}</h4>
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
								<p class="text-stone-800 text-sm">
									打卡項目 - {punchInLog.punchInType.toUpperCase()}
								</p>
							</div>
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡帳號 - {punchInLog.punchInAccount}</p>
							</div>
						</div>
						<div class="flex flex-row w-full items-center">
							<div class="flex-1">
								<p class="text-stone-800 text-sm">
									打卡狀態 - {punchInLog.punchInStatus === 'Success' ? '已成功' : '未成功'}
								</p>
							</div>
							<div class="flex-1">
								<p class="text-stone-800 text-sm">
									狀態細節 - {punchInLog.punchInMemo === '' ? '無' : punchInLog.punchInMemo}
								</p>
							</div>
						</div>
						<div class="flex flex-row w-full items-center">
							<div class="flex-1">
								<p class="text-stone-800 text-sm">打卡時間 - {punchInLog.punchInDatetime}</p>
							</div>
						</div>
					</Collapsible.Content>
				</Collapsible.Root>
			{/each}
		{/if}
	</div>
	<div class="flex flex-row items-center justify-center py-4">
		<Pagination.Root
			count={$punchInLogStore.count}
			perPage={$punchInLogStore.pageCount}
			let:pages
			let:range
			onPageChange={handlePageChange}
		>
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
