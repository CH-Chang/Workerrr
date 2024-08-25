<script lang="ts">
    import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { ssoLogin } from '$lib/apis/v1/member'
    import { createMessageBoxStore } from '$lib/components/message-box/store'
	import { isAxiosError } from 'axios';
	import type { SSOLoginResponse } from '$lib/models/v1/member';

    const messageBoxStore = createMessageBoxStore()

    onMount(async () => {
		const token = $page.url.searchParams.get('token')
		if (token === null) {
            goto('/error/404')
            return
        }

        await doSSOLogin(token)
	})

    const doSSOLogin = async (token: string) => {
        try {
            const ssoLoginResponse = await ssoLogin('schedule', token)

            const { code, message, data } = ssoLoginResponse.data
            if (code !== 0) {
                messageBoxStore.push('提示訊息', message, [{ text: '確認', callback: () => { goto('/error/404') } }])
                return
            }

            const { token: jwtToken } = data
            localStorage.setItem('token', jwtToken)

            goto('/dashboard')
        } catch (e) {
            if (isAxiosError<SSOLoginResponse>(e)) {
                const ssoLoginResponse = e.response
                if (typeof ssoLoginResponse === 'undefined') {
                    messageBoxStore.push('提示訊息', '發生未知錯誤', [{ text: '確認', callback: () => { goto('/error/404') } }])
                    return
                }

                const { code, message } = ssoLoginResponse.data
                if (code !== 0) {
                    messageBoxStore.push('提示訊息', message, [{ text: '確認', callback: () => { goto('/error/404') } }])
                    return
                }
            }

            goto('/error/404')
            return
        }
    }
</script>
