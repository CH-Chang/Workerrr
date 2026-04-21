import { CookieJar } from 'tough-cookie'
import dayjs from 'dayjs'
import { loginEip } from './systex/eip.mjs'
import { 
	loginTCS, 
	getUnsubmittedReports as getUnsubmittedReportsRaw, 
	getProjectMenus as getProjectMenusRaw, 
	getWorkTypeMenus as getWorkTypeMenusRaw, 
	submitDailyReports as submitDailyReportsRaw,
	searchProjects as searchProjectsRaw,
	DailyReportEntry
} from './systex/tcs.mjs'

const getAuthenticatedTcsSession = async (account?: string, password?: string) => {
	const jar = new CookieJar()
	const user = account || process.env.PUNCH_IN_ACCOUNT
	const pass = password || process.env.PUNCH_IN_PASSWORD

	if (!user || !pass) {
		throw new Error('未提供帳號或密碼，且環境變數中亦未設定')
	}

	const { success: eipSuccess, memo: eipMemo } = await loginEip(jar, user, pass)
	if (!eipSuccess) throw new Error(`EIP 登入失敗: ${eipMemo}`)

	const { success: tcsSuccess, memo: tcsMemo, url: tcsUrl } = await loginTCS(jar)
	if (!tcsSuccess) throw new Error(`TCS SSO 登入失敗: ${tcsMemo}`)

	return { jar, tcsUrl }
}

export const getUnsubmittedReports = async (account?: string, password?: string, startDate?: string, endDate?: string) => {
	const { jar, tcsUrl } = await getAuthenticatedTcsSession(account, password)
	return getUnsubmittedReportsRaw(jar, tcsUrl, startDate, endDate)
}

export const getProjectMenus = async (depid: string, empid: string, date: string, account?: string, password?: string) => {
	const { jar, tcsUrl } = await getAuthenticatedTcsSession(account, password)
	return getProjectMenusRaw(jar, tcsUrl, depid, empid, date)
}

export const getWorkTypeMenus = async (projectId: string, account?: string, password?: string) => {
	const { jar, tcsUrl } = await getAuthenticatedTcsSession(account, password)
	return getWorkTypeMenusRaw(jar, tcsUrl, projectId)
}

export const searchProjects = async (keyword: string, account?: string, password?: string) => {
	const { jar, tcsUrl } = await getAuthenticatedTcsSession(account, password)
	const { depid } = await getUnsubmittedReportsRaw(jar, tcsUrl)
	const workdt = dayjs().format('YYYY/M/D')
	return searchProjectsRaw(jar, tcsUrl, depid, workdt, keyword)
}

export const submitDailyReports = async (depid: string, empid: string, date: string, entries: DailyReportEntry[], account?: string, password?: string) => {
	const { jar, tcsUrl } = await getAuthenticatedTcsSession(account, password)
	return submitDailyReportsRaw(jar, tcsUrl, depid, empid, date, entries)
}
