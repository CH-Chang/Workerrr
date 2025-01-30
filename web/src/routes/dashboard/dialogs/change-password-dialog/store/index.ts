import { writable, get } from 'svelte/store'
import { applyOtp, changePassword } from '$lib/apis/v1/punchIn'
import { createMessageBoxStore } from '$lib/components/message-box/store'
import { createSpinnerStore } from '$lib/components/spinner/store'
import { isAxiosError } from 'axios'
import type { ApplyOtpResponse } from '$lib/models/v1/punchIn'

export interface ChangePasswordDialogState {
    show: boolean
    otpLock: boolean
    otpCounter: null | NodeJS.Timeout
    otpCDRemaining: number
    otpKey: string
    punchInId: number
    newPassword: string
    newPasswordCheck: string
    otp: string
}


const initState: ChangePasswordDialogState = {
    show: false,
    otpLock: false,
    otpCounter: null,
    otpCDRemaining: 0,
    otpKey: '',
    punchInId: -1,
    newPassword: '',
    newPasswordCheck: '',
    otp: ''
}

const store = writable<ChangePasswordDialogState>(initState)

export function createChangePasswordDialogStore() {
    return {
        subscribe: store.subscribe,
        show: (punchInId: number) => store.update(s => ({ ...s, punchInId, show: true })),
        hide: () => store.update(s => ({ ...s, show: false })),
        reset: () => store.update(s => ({ ...s, ...initState })),
        changePassword: async () => {
            const { punchInId, otpKey, otp, newPassword } = get(store)

            // TODO: new password rsa encryption

            const spinnerStore = createSpinnerStore()
            const messageBoxStore = createMessageBoxStore()

            try {
                const response = await spinnerStore.spinner(async () => await changePassword(punchInId, otpKey, otp, newPassword), '密碼變更中')
                const { code } = response.data
                if (code === 0) {
                    messageBoxStore.push('提示訊息', '密碼變更成功', [{ text: '確認' }])
                    return
                }
            } catch (e) {
                if (isAxiosError<ApplyOtpResponse>(e)) {
                    const response = e.response
                    if (typeof response !== 'undefined') {
                        const { code } = response.data
                        if (code !== 0) {
                            messageBoxStore.push('提示訊息', response.data.message, [{ text: '確認' }])
                            return
                        }
                    }
                }
            }

            messageBoxStore.push('提示訊息', '發送 Email 一次性驗證發生未知錯誤', [{ text: '確認' }])
            return
        },
        applyOtp: async () => {
            const { punchInId } = get(store)

            const spinnerStore = createSpinnerStore()
            const messageBoxStore = createMessageBoxStore()

            try {
                const response = await spinnerStore.spinner(async () => await applyOtp(punchInId), '一次性 Email 密碼申請中')
                const { code } = response.data
                const { otpKey } = response.data.data
                if (code === 0) {
                    store.update(s => ({ ...s, otpKey, otpLock: true, otpCDRemaining: 180 }))

                    const otpCounter = setInterval(() => {
                        const state = get(store)

                        if (state.otpCDRemaining <= 0) {
                            clearInterval(state.otpCounter as NodeJS.Timeout)
                            store.update(s => ({ ...s, otpLock: false, otpCDRemaining: 0, otpCounter: null }))
                            return
                        }

                        store.update(s => ({ ...s, otpCDRemaining: s.otpCDRemaining - 1 }))
                    }, 1000)

                    store.update(s => ({ ...s, otpKey, otpCounter }))

                    return
                }
            } catch (e) {
                if (isAxiosError<ApplyOtpResponse>(e)) {
                    const response = e.response
                    if (typeof response !== 'undefined') {
                        const { code } = response.data
                        if (code !== 0) {
                            messageBoxStore.push('提示訊息', response.data.message, [{ text: '確認' }])
                            return
                        }
                    }
                }
            }

            messageBoxStore.push('提示訊息', '發送 Email 一次性驗證發生未知錯誤', [{ text: '確認' }])
            return
        }
    }
}