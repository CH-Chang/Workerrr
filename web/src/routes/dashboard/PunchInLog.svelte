<script lang="ts">
    import { Collapsible, Pagination } from 'bits-ui'
	import { slide } from 'svelte/transition'
    import { createPunchInLogStore } from './store/punch-in-log'
	import { onMount } from 'svelte'

    const punchInLogStore = createPunchInLogStore()

    onMount(async () => {
        await punchInLogStore.queryPunchInLogs(0, $punchInLogStore.pageCount)
    })

    const handlePageChange = async (page: number) => {
        await punchInLogStore.queryPunchInLogs(page, $punchInLogStore.pageCount)
    }
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
        {#each $punchInLogStore.punchInLogs as punchInLog}
        <Collapsible.Root class="w-full py-2">
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
                        <p class="text-stone-800 text-sm">打卡項目 - {punchInLog.punchInType.toUpperCase()}</p>
                    </div>
                    <div class="flex-1">
                        <p class="text-stone-800 text-sm">打卡帳號 - {punchInLog.punchInAccount}</p>
                    </div>
                </div>
                <div class="flex flex-row w-full items-center">
                    <div class="flex-1">
                        <p class="text-stone-800 text-sm">打卡狀態 - {punchInLog.punchInStatus === 'Y' ? '已成功' : '未成功'}</p>
                    </div>
                    <div class="flex-1">
                        <p class="text-stone-800 text-sm">狀態細節 - {punchInLog.punchInMemo === '' ? '無' : punchInLog.punchInMemo}</p>
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
    </div>
    <div class="flex flex-row items-center justify-center py-4">
        <Pagination.Root count={$punchInLogStore.count} perPage={$punchInLogStore.pageCount} let:pages let:range onPageChange={handlePageChange}>
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