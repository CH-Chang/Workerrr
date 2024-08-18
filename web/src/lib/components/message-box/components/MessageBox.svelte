<script lang="ts">
	import { AlertDialog } from 'bits-ui'
	import { fade } from 'svelte/transition'
	import { createMessageBoxStore } from '../store'

	const state = createMessageBoxStore()

	const onActionClick = (callback?: (...args: any[]) => void | Promise<void>, ...args: any[]) =>
		() => {
			state.pop()
			callback?.(...args)
		}
</script>

<AlertDialog.Root open={$state.messageBoxes.length > 0}>
	<AlertDialog.Portal>
		<AlertDialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed z-50 inset-0 bg-black/60"
		/>
		<AlertDialog.Content
			class="flex flex-col gap-2 fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 min-w-[30%] min-h-[20%] bg-slate-200 px-8 py-6 rounded-2xl"
		>
			<div class="flex flex-col">
				<AlertDialog.Title class="text-lg font-medium font-noto"
					>{$state.messageBoxes[0].title}</AlertDialog.Title
				>
			</div>
			<div class="flex-1 flex flex-col">
				<AlertDialog.Description class="text-base font-normal font-noto">
					{$state.messageBoxes[0].message}
				</AlertDialog.Description>
			</div>
			<div class="flex w-full items-center justify-center gap-2">
				{#each $state.messageBoxes[0].buttons as button}
					<AlertDialog.Action on:click={onActionClick(button.callback)} class="inline-flex w-full items-center justify-center text-base font-normal font-noto border-2 border-stone-800 text-stone-800 rounded-xl py-1 transition-all hover:bg-stone-800 hover:text-slate-200">
						{button.text}
					</AlertDialog.Action>
				{/each}
			</div>
		</AlertDialog.Content>
	</AlertDialog.Portal>
</AlertDialog.Root>