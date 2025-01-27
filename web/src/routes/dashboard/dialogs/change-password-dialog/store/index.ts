import dayjs from 'dayjs'
import { writable } from 'svelte/store'

export interface ChangePasswordDialogState {
    show: boolean
    otpLock: boolean
    otpApplyTime: number
    punchInId: number
    oldPassword: string
    newPassword: string
    otp: string
}


const initState: ChangePasswordDialogState = {
    show: false,
    otpLock: false,
    otpApplyTime: 0,
    punchInId: -1,
    oldPassword: '',
    newPassword: '',
    otp: ''
}

const store = writable<ChangePasswordDialogState>(initState)

export function createChangePasswordDialogStore() {
    return {
        subscribe: store.subscribe,
        show: (punchInId: number) => store.update(s => ({ ...s, punchInId, show: true })),
        applyOtp: async () => {
            store.update(s => ({ ...s, otpLock: true, otpApplyTime: dayjs().unix() }))
        }
    }
}