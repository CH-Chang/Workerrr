import { CookieJar, Cookie } from 'tough-cookie'

export const get = async (jar: CookieJar, url: string, headers?: Record<string, string>): Promise<ReturnType<typeof fetch>> => {
	const cookies = await jar.getCookies(url)
	const cookie = cookies.map(c => `${c.key}=${c.value}`).join('; ')

	headers = {
		...(headers ?? {}),
		...(cookie === '' ? {} : { Cookie: cookie }),
	}

	const response = await fetch(
		url,
		{
			method: 'get',
			headers: headers,
			redirect: 'manual'
		})

	const responseHeader = response.headers
	const responseHeaderSetCookies = responseHeader.getSetCookie()
	for (const responseHeaderSetCookie of responseHeaderSetCookies) {
		const parsedResponseHeaderSetCookie = Cookie.parse(responseHeaderSetCookie)
		if (parsedResponseHeaderSetCookie !== undefined) {
			await jar.setCookie(responseHeaderSetCookie, url)
		}
	}

	return response
}

export const post = async (jar: CookieJar, url: string, data?: string, headers?: Record<string, string>): Promise<ReturnType<typeof fetch>> => {
	const cookies = await jar.getCookies(url)
	const cookie = cookies.map(c => `${c.key}=${c.value}`).join('; ')

	headers = {
		...(headers ?? {}),
		...(cookie === '' ? {} : { Cookie: cookie })
	}

	const response = await fetch(
		url,
		{
			method: 'post',
			body: data,
			headers: headers,
			redirect: 'manual'
		})

	const responseHeader = response.headers
	const responseHeaderSetCookies = responseHeader.getSetCookie()
	for (const responseHeaderSetCookie of responseHeaderSetCookies) {
		const parsedResponseHeaderSetCookie = Cookie.parse(responseHeaderSetCookie)
		if (parsedResponseHeaderSetCookie !== undefined) {
			await jar.setCookie(responseHeaderSetCookie, url)
		}
	}

	return response
}
