import { CookieJar } from 'tough-cookie'
import { EIP_BASE_URL } from './share'
import urlParse from 'url-parse'
import qs from 'qs'
import * as requests from '../../utils/requests'
import * as cheerio from 'cheerio'

const prepareHomeHeaders = (): Record<string, string> => {
	return {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
	}
}

const prepareBMSSSOData = async (jar: CookieJar): Promise<string> => {
	const homeHeaders = prepareHomeHeaders()
	const homeResponse = await requests.get(jar, `${EIP_BASE_URL}/UOF/Homepage.aspx`, homeHeaders)

	const content = await homeResponse.text()

	const $ = cheerio.load(content)

	const data: Record<string, string> = {}

	$('script').each((i, element) => {
		const scriptSrc = $(element).attr('src')
		if (scriptSrc === undefined) return true

		const parsedScriptSrc = urlParse(scriptSrc)
		const parsedScriptSrcQuery = qs.parse(parsedScriptSrc.query, { ignoreQueryPrefix: true })
		const parsedScriptSrcQueryKeys = Object.keys(parsedScriptSrcQuery)
		if (!parsedScriptSrcQueryKeys.includes('_TSM_CombinedScripts_')) return true

		data['ctl00_ScriptManager1_TSM'] = parsedScriptSrcQuery['_TSM_CombinedScripts_'] as string
	})

	$('link').each((idx, element) => {
		const linkSrc = $(element).attr('href')
		if (linkSrc === undefined) return true

		const parsedLinkSrc = urlParse(linkSrc)
		const parsedLinkSrcQuery = qs.parse(parsedLinkSrc.query, { ignoreQueryPrefix: true })
		const parsedLinkSrcQueryKeys = Object.keys(parsedLinkSrcQuery)
		if (!parsedLinkSrcQueryKeys.includes('_TSM_CombinedScripts_')) return true

		data['ctl00_RadStyleSheetManager1_TSSM'] = parsedLinkSrcQuery['_TSM_CombinedScripts_'] as string
	})

	$('input').each((idx, element) => {
		const name = $(element).attr('name')
		const value = $(element).attr('value')

		if (name !== undefined) {
			data[name] = value === undefined ? '' : value
		}
	})

	data['ctl00$ScriptManager1'] = 'ctl00$ContentPlaceHolder1$RadDock6d688bcd6342410e9d935e715e08173e$C$widget$UpdatePanel1|ctl00$ContentPlaceHolder1$RadDock6d688bcd6342410e9d935e715e08173e$C$widget$btnCHECKIN'

	return qs.stringify(data)
}

const prepareBMSSSOHeaders = (): Record<string, string> => {
	return {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	}
}

const login = async (jar: CookieJar): Promise<{ success: boolean, guid: string | null }> => {
	const bmsSSOData = await prepareBMSSSOData(jar)
	const bmsSSOHeaders = prepareBMSSSOHeaders()
	const bmsSSOResponse = await requests.post(jar, `${EIP_BASE_URL}/UOF/Homepage.aspx`, bmsSSOData, bmsSSOHeaders)
	if (bmsSSOResponse.status !== 200) return { success: false, guid: null }

	const bmsSSOResponseText = await bmsSSOResponse.text()
	const bmsUrlMatched = new RegExp('window\\.open\\(\\\'(.*)\\\'\\)').exec(bmsSSOResponseText)
	const bmsUrl = bmsUrlMatched?.[1]
	if (typeof bmsUrl !== 'string') return { success: false, guid: null }

	const parsedBMSUrl = urlParse(bmsUrl)
	const parsedBMSUrlQuery = qs.parse(parsedBMSUrl.query, { ignoreQueryPrefix: true })
	const guid = parsedBMSUrlQuery.hash
	if (typeof guid !== 'string') return { success: false, guid: null }

	const loginBMSResponse = await requests.get(jar, bmsUrl)
	if (loginBMSResponse.status !== 200) return { success: false, guid: null }

	return { success: true, guid: guid }
}

export const loginBMS = login
