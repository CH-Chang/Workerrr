import type { GetPunchInLogsResponse } from '$lib/models/v1/punchIn'
import { getPunchInLogs } from '$lib/apis/v1/punchIn'
import { isAxiosError } from 'axios'
import { writable } from 'svelte/store'
import { createMessageBoxStore } from '$lib/components/message-box/store'

export interface PunchInLog {
    punchInLogId: number
	punchInType: string
	punchInAccount: string
	punchInStatus: string
	punchInMemo: string
	punchInDatetime: string
}

export interface PunchInLogState {
    loading: boolean
    count: number
    pageCount: number
    punchInLogs: PunchInLog[]
}

const initState: PunchInLogState = {
    loading: true,
    count: 0,
    pageCount: 5,
    punchInLogs: []
}

const store = writable<PunchInLogState>(initState)

export function createPunchInLogStore() {
    return {
        subscribe: store.subscribe,
        queryPunchInLogs: async (page: number, pageCount: number) => {
            const messageBoxStore = createMessageBoxStore()

            try {
                store.update(s => ({ ...s, loading: true }))

                const response = await getPunchInLogs(page, pageCount)
                const { code, data } = response.data
                if (code === 0) {
                    const { count, punchInLogs } = data
                    store.update(s => ({ ...s, count, punchInLogs }))
                    return
                }
            } catch (e) {
                if (isAxiosError<GetPunchInLogsResponse>(e)) {
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
                store.update(s => ({ ...s, loading: false }))
            }

            messageBoxStore.push('提示訊息', '取得打卡紀錄資料發生未知錯誤', [{ text: '確認' }])
            return
        },
    }
}