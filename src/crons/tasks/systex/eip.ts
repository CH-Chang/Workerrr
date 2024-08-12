import { CookieJar } from 'tough-cookie'
import { EIP_BASE_URL } from './share'
import urlParse from 'url-parse'
import qs from 'qs'
import * as requests from '../../utils/requests'
import * as cheerio from 'cheerio'

const prepareLoginData = async (jar: CookieJar, punchInAccount: string, punchInPassword: string): Promise<string> => {
	const response = await requests.get(jar, `${EIP_BASE_URL}/UOF/Login.aspx?ReturnUrl=/UOF/`, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36' })
	const content = await response.text()

	const $ = cheerio.load(content)

	const scriptManager1 = 'UpdatePanel1|btnSubmit'
	const ddiCulture = 'zh-TW'
	const txtAccount2 = ''
	const lastFocus = ''
	const eventTarget = ''
	const eventArgument = ''
	const txtAccount = punchInAccount
	const txtPwd = punchInPassword
	const asyncPost = 'true'
	const btnSubmit = '登入'
	const viewState = $('input[name="__VIEWSTATE"]').val() as string
	const viewStateGenerator = $('input[name="__VIEWSTATEGENERATOR"]').val() as string
	const viewStateEncrypted = $('input[name="__VIEWSTATEENCRYPTED"]').val() as string
	const hdFlag = $('input[name="hdflag"]').val() as string
	const hfIsAdAuth = $('input[name="hfIsAdAuth"]').val() as string
	const hfUserGuid = ''

	let scriptManager1TSM = ''

	$('script').each((idx, elem) => {
		const scriptSrc = $(elem).attr('src')
		if (scriptSrc === undefined) return true

		const parsedScriptSrc = urlParse(scriptSrc)
		const parsedScriptSrcQuery = qs.parse(parsedScriptSrc.query, { ignoreQueryPrefix: true })

		const parsedScriptSrcQueryKeys = Object.keys(parsedScriptSrcQuery)
		if (!parsedScriptSrcQueryKeys.includes('_TSM_CombinedScripts_')) return true

		scriptManager1TSM = parsedScriptSrcQuery['_TSM_CombinedScripts_'] as string
	})

	const data = {
		'ScriptManager1': scriptManager1,
		'ScriptManager1_TSM': scriptManager1TSM,
		'__EVENTTARGET': eventTarget,
		'__EVENTARGUMENT': eventArgument,
		'__LASTFOCUS': lastFocus,
		'__VIEWSTATE': viewState,
		'__VIEWSTATEGENERATOR': viewStateGenerator,
		'__VIEWSTATEENCRYPTED': viewStateEncrypted,
		'ddlCulture': ddiCulture,
		'txtAccount': txtAccount,
		'txtPwd': txtPwd,
		'txtAccount2': txtAccount2,
		'hdflag': hdFlag,
		'hfIsAdAuth': hfIsAdAuth,
		'hfUserGuid': hfUserGuid,
		'__ASYNCPOST': asyncPost,
		'btnSubmit': btnSubmit
	}

	return qs.stringify(data)
}

const prepareLoginHeaders = (): Record<string, string> => {
	return {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	}
}

const prepareAuthHeaders = (): Record<string, string> => {
	return {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
	}
}

const prepareOverLoginData = async (jar: CookieJar, loginData: string, loginResponseText: string): Promise<string> => {
	const parsed = qs.parse(loginData, { ignoreQueryPrefix: true })

	parsed['ScriptManager1'] = 'UpdatePanel11|btnRemoveRepeatLogin'
	parsed['txtPwd'] = ''
	parsed['__VIEWSTATE'] = new RegExp('__VIEWSTATE\\|([^|]+)').exec(loginResponseText)?.[1]

	return qs.stringify(parsed)
}

const prepareOverLoginHeaders = (): Record<string, string> => {
	return {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	}
}

const login = async (jar: CookieJar, punchInAccount: string, punchInPassword: string): Promise<{ success: boolean, memo: string }> => {
	const loginData = await prepareLoginData(jar, punchInAccount, punchInPassword)
	const loginHeaders = prepareLoginHeaders()
	const loginResponse = await requests.post(jar, `${EIP_BASE_URL}/UOF/Login.aspx?ReturnUrl=/UOF`, loginData, loginHeaders)
	const loginResponseText = await loginResponse.text()
	if (loginResponse.status !== 200) return { success: false, memo: 'EIP登入回傳非200的狀態碼' }

	if (!loginResponseText.includes('Authentication.aspx'))
	{
		const overLoginData = await prepareOverLoginData(jar, loginData, loginResponseText)
		const overLoginHeaders = prepareOverLoginHeaders()
		const overLoginResponse = await requests.post(jar, `${EIP_BASE_URL}/UOF/Login.aspx?ReturnUrl=/UOF`, overLoginData, overLoginHeaders)
		const overLoginResponseText = await overLoginResponse.text()
		if (overLoginResponse.status !== 200) return { success: false, memo: 'EIP重複登入回傳非200的狀態碼' }
		if (!overLoginResponseText.includes('Authentication.aspx')) return { success: false, memo: 'EIP重複登入回傳失敗' }
	}

	const authHeaders = prepareAuthHeaders()
	const authResponse = await requests.get(jar, `${EIP_BASE_URL}/UOF/Login/Authentication.aspx`, authHeaders)
	if (authResponse.status !== 302) return { success: false, memo: 'EIP授權回傳非302的狀態碼' }

	return { success: true, memo: '' }
}

export const loginEip = login
