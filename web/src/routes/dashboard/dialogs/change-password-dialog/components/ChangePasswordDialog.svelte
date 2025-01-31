<script lang="ts">
	import { Dialog, Label, Button } from 'bits-ui';
	import { fade } from 'svelte/transition';
	import { createChangePasswordDialogStore } from '../store/';
	import { createMessageBoxStore } from '$lib/components/message-box/store/';
	const state = createChangePasswordDialogStore();
	const messageBoxStore = createMessageBoxStore();

	const onConfirmClicked = async () => {
		if ($state.otpKey.length <= 0) {
			messageBoxStore.push('提示', '請申請 Email 一次性密碼', [{ text: '確認' }]);
			return;
		}

		if ($state.otp.length <= 0) {
			messageBoxStore.push('提示', '請輸入 Email 一次性密碼', [{ text: '確認' }]);
			return;
		}

		if ($state.newPassword.length <= 0) {
			messageBoxStore.push('提示', '請輸入新打卡密碼', [{ text: '確認' }]);
			return;
		}

		if ($state.newPasswordCheck.length <= 0) {
			messageBoxStore.push('提示', '請再次輸入新打卡密碼', [{ text: '確認' }]);
			return;
		}

		if ($state.newPassword !== $state.newPasswordCheck) {
			messageBoxStore.push('提示', '請確認兩次輸入的新打卡密碼不相同', [{ text: '確認' }]);
			return;
		}

		await state.changePassword();
	};

	const onCancelClicked = () => {
		state.reset();
	};

	const onApplyOtpClicked = async () => {
		if ($state.otpLock) {
			messageBoxStore.push('提示', '請勿頻繁申請 Email 一次性密碼', [{ text: '確認' }]);
			return;
		}

		await state.applyOtp();
	};
</script>

<Dialog.Root open={$state.show}>
	<Dialog.Portal>
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed z-5 inset-0 bg-black/60"
		/>
		<Dialog.Content
			class="flex flex-col gap-2 fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 min-w-[80%] min-h-[20%] md:min-w-[30%] bg-slate-200 px-8 py-6 rounded-2xl"
		>
			<div class="flex flex-col">
				<Dialog.Title class="text-lg font-medium font-noto">更改密碼</Dialog.Title>
			</div>
			<div class="flex-1 flex flex-col">
				<Dialog.Description class="text-xs font-normal font-noto">
					請通過 Email OTP 驗證驗證後，進行新打卡登入密碼之變更。
				</Dialog.Description>
			</div>
			<div class="flex flex-col items-start gap-1 mt-2">
				<Label.Root for="otp" class="text-sm font-noto">Email 一次性密碼</Label.Root>
				<div class="w-full flex flex-col gap-2 items-center justify-center">
					<input
						id="otp"
						class="w-full font-noto text-base px-2 py-1 rounded-l"
						placeholder="請輸入 Email 一次性密碼"
						autocomplete="off"
						bind:value={$state.otp}
					/>
					<Button.Root
						on:click={onApplyOtpClicked}
						disabled={$state.otpLock}
						class="w-full text-base font-normal font-noto border-2 border-stone-800 text-stone-800 rounded-xl py-1 px-2 transition-all hover:bg-stone-800 hover:text-slate-200"
					>
						{#if $state.otpLock}
							等待 {$state.otpCDRemaining.toString().padStart(3, '0')} 秒後重試
						{:else}
							申請一次性密碼
						{/if}
					</Button.Root>
				</div>
			</div>
			<div class="flex flex-col items-start gap-1">
				<Label.Root for="newPassword" class="text-sm font-noto">新打卡密碼</Label.Root>
				<div class="w-full">
					<input
						id="newPassword"
						class="w-full font-noto text-base px-2 py-1 rounded-l"
						placeholder="請輸入新打卡密碼"
						type="password"
						autocomplete="off"
						bind:value={$state.newPassword}
					/>
				</div>
			</div>
			<div class="flex flex-col items-start gap-1">
				<Label.Root for="newPasswordCheck" class="text-sm font-noto">再次確認新打卡密碼</Label.Root>
				<div class="w-full">
					<input
						id="newPasswordCheck"
						class="w-full font-noto text-base px-2 py-1 rounded-l"
						placeholder="請再次輸入新打卡密碼"
						type="password"
						autocomplete="off"
						bind:value={$state.newPasswordCheck}
					/>
				</div>
			</div>
			<div class="flex w-full items-center justify-center gap-2 mt-10">
				<Button.Root
					on:click={onConfirmClicked}
					class="inline-flex w-full items-center justify-center text-base font-normal font-noto border-2 border-stone-800 text-stone-800 rounded-xl py-1 transition-all hover:bg-stone-800 hover:text-slate-200"
				>
					確認更改
				</Button.Root>
				<Button.Root
					on:click={onCancelClicked}
					class="inline-flex w-full items-center justify-center text-base font-normal font-noto border-2 border-stone-800 text-stone-800 rounded-xl py-1 transition-all hover:bg-stone-800 hover:text-slate-200"
				>
					取消更改
				</Button.Root>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
