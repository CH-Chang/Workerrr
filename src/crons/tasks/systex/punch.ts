import { CookieJar } from 'tough-cookie'
import { BMS_BASE_URL } from './share'
import * as requests from '../../utils/requests'
import qs from 'qs'
import dayjs from 'dayjs'

const errorCodes = [
	'error_1',
	'error_3',
	'error_10',
	'error_99',
	'error_001',
	'error_002',
	'error_003',
]

const errorCodeDescMap: Record<string, string> = {
	error_1: '登入驗證失效，請重新登入EIP',
	error_3: '請使用主身分員編',
	error_10: '通知您已無法透過app或網頁登打出勤紀錄。每日出勤記錄請至內湖大樓洽HR窗口Peggy(# 7335)，進行紙本出勤登記。',
	error_99: '執行失敗',
	error_001: '無班別資料',
	error_002: '非開放時間',
	error_003: '每日只能執行一次',
}

interface QueryResponse {
	errCde: number,
	errMsg: string
	responses: Array<{
		errorCode: string,
		openTimeS: string,
		openTimeE: string,
		sysDate: number,
		queryDate: string,
		userLocation: string,
		queryList: Array<{
			punchDate: string,
			weekDay: string,
			timeS: string | undefined,
			timeE: string | undefined,
			isWF: string | undefined,
			locationType: string | undefined
			location: string | undefined
		}>
		DayCountTime: Array<{
			punchTimeArea: string,
			countTime: number
		}>
		punchLocationBu: Array<{
			value: string
		}>
		punchLocation: Array<{
			value: string
		}>
	}>
}

const query = async (jar: CookieJar, account: string, guid: string): Promise<{ success: boolean, location: string | null, errorCode: string | null }> => {
	const now = dayjs()
	const year = now.year().toString()
	const month = (now.month() + 1).toString()

	const url = `${BMS_BASE_URL}/bms2/service/hr.punchQuery`

	const data = qs.stringify({
		userid: account,
		guid: guid,
		year: year,
		month: month,
	})

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		'Referer': `https://bms.systex.com/bms2/service/app.login?userid=${account}&menuid=193&hash=${guid}`
	}

	const response = await requests.post(jar, url, data, headers)
	if (response.status !== 200) return { success: false, location: null, errorCode: null }

	const responseText = await response.text()
	const parsed = JSON.parse(responseText) as QueryResponse
	if (parsed.errCde !== 0) return { success: false, location: null, errorCode: null }

	return { success: true, location: parsed.responses[0].userLocation, errorCode: parsed.responses[0].errorCode }
}

const doPunch = async (jar: CookieJar, account: string, guid: string, location: string): Promise<{ success: boolean }> => {
	const now = dayjs()
	const weekDay = now.day().toString()

	const url = `${BMS_BASE_URL}/bms2/service/hr.punchSave`

	const data = qs.stringify({
		userid: account,
		guid: guid,
		hours: '9',
		minutes: weekDay,
		locationF: '工作地點',
		locationS: location,
		appName: 'eip',
	})

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
	}

	// TODO: 待測試後啟用
	// const response = await requests.post(jar, url, data, headers)
	// if (response.status !== 200) return { success: false }

	return { success: true }
}

export const punch = async (jar: CookieJar, account: string, guid: string): Promise<{ success: boolean }> => {
	const { success: querySuccess, location, errorCode } = await query(jar, account, guid)
	if (!querySuccess) {
		return { success: false }
	}

	if (typeof location !== 'string') {
		return { success: false }
	}

	if (errorCodes.includes(errorCode ?? '')) {
		console.log('Skip due to ' + errorCodeDescMap[errorCode as string] ?? 'unknown error code')
		return { success: false }
	}

	const { success: doPunchSuccess } = await doPunch(jar, account, guid, location)
	if (!doPunchSuccess) {
		return { success: false }
	}

	return { success: true }
}
