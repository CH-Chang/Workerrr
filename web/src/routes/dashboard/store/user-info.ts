import type { GetUserResponse } from '$lib/models/v1/member'
import { getUser } from '$lib/apis/v1/member'
import { isAxiosError } from 'axios'
import { writable } from 'svelte/store'
import { createMessageBoxStore } from '$lib/components/message-box/store'

export interface UserInfoState {
    name: string
}

const initState: UserInfoState = {
    name: '打工人'
}

const store = writable<UserInfoState>(initState)

export function createUserInfoStore() {
    return {
        subscribe: store.subscribe,
        queryUser: async () => {
            const messageBoxStore = createMessageBoxStore()

            try {
                const response = await getUser()
                const { code, data } = response.data
                if (code === 0) {
                    store.update(s => ({ ...s, ...data }))
                    return
                }
            } catch (e) {
                if (isAxiosError<GetUserResponse>(e)) {
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

            messageBoxStore.push('提示訊息', '取得用戶資料發生未知錯誤', [{ text: '確認' }])
            return
        },
    }
}