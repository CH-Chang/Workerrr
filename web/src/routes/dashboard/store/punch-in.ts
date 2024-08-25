import type { GetPunchInsResponse } from '$lib/models/v1/punchIn'
import { cancelPunchIn, getPunchIns } from '$lib/apis/v1/punchIn'
import { isAxiosError } from 'axios'
import { writable } from 'svelte/store'
import { createMessageBoxStore } from '$lib/components/message-box/store'
import dayjs from 'dayjs'

export interface PunchIn {
    punchInId: number
	punchInType: string
	punchInAccount: string
	punchInEnable: string
	punchInManualType: string
}

export interface PunchInState {
    punchIns: PunchIn[]
}

const initState: PunchInState = {
    punchIns: []
}

const store = writable<PunchInState>(initState)

export function createPunchInStore() {
    return {
        subscribe: store.subscribe,
        cancelPunchIn: async (punchInId: number) => {
            const messageBoxStore = createMessageBoxStore()
            const punchInStore = createPunchInStore()

            try {
                const date = dayjs().format('YYYY-MM-DD')
                const response = await cancelPunchIn(date, punchInId)
                const { code } = response.data
                if (code === 0) {
                    return
                }
            } catch (e) {
                if (isAxiosError<GetPunchInsResponse>(e)) {
                    const response = e.response
                    if (typeof response !== 'undefined') {
                        const { code } = response.data
                        if (code !== 0) {
                            messageBoxStore.push('提示訊息', response.data.message, [{ text: '確認' }])
                            return
                        }
                    }
                }
            } finally {
                await punchInStore.queryPunchIns()
            }

            messageBoxStore.push('提示訊息', '取消打卡發生未知錯誤', [{ text: '確認' }])
            return
        },
        queryPunchIns: async () => {
            const messageBoxStore = createMessageBoxStore()

            try {
                const response = await getPunchIns()
                const { code, data } = response.data
                if (code === 0) {
                    const { punchIns } = data
                    store.update(s => ({ ...s, punchIns }))
                    return
                }
            } catch (e) {
                if (isAxiosError<GetPunchInsResponse>(e)) {
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

            messageBoxStore.push('提示訊息', '取得打卡資料發生未知錯誤', [{ text: '確認' }])
            return
        },
    }
}