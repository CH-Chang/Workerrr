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

type TcsSession = { jar: CookieJar, tcsUrl: string }

// TCS 的頁面在 session 失效時不會回錯誤，只會回一個空表單，
// 所以要靠「拿不到 depid/empid」來判斷 session 已經死掉
class StaleTcsSessionError extends Error {
	constructor() {
		super('TCS session 已失效（查無部門/員工資料）')
	}
}

const resolveTarget = async (jar: CookieJar, tcsUrl: string) => {
	const result = await getUnsubmittedReportsRaw(jar, tcsUrl)
	if (!result.depid || !result.empid) throw new StaleTcsSessionError()
	return result
}

// EIP/TCS 的 ASP session 大約 20 分鐘 idle timeout，取一半當保險
const SESSION_TTL_MS = 10 * 60 * 1000

let cache: { key: string, session: TcsSession, createdAt: number } | null = null
let pendingKey: string | null = null
let pendingPromise: Promise<TcsSession> | null = null

const resolveCredentials = (account?: string, password?: string): { user: string, pass: string } => {
	const user = account || process.env.PUNCH_IN_ACCOUNT
	const pass = password || process.env.PUNCH_IN_PASSWORD

	if (!user || !pass) {
		throw new Error('未提供帳號或密碼，且環境變數中亦未設定')
	}

	return { user, pass }
}

const login = async (user: string, pass: string): Promise<TcsSession> => {
	const jar = new CookieJar()

	const { success: eipSuccess, memo: eipMemo } = await loginEip(jar, user, pass)
	if (!eipSuccess) throw new Error(`EIP 登入失敗: ${eipMemo}`)

	const { success: tcsSuccess, memo: tcsMemo, url: tcsUrl } = await loginTCS(jar)
	if (!tcsSuccess) throw new Error(`TCS SSO 登入失敗: ${tcsMemo}`)

	return { jar, tcsUrl }
}

export const invalidateTcsSession = (): void => {
	cache = null
}

const acquireTcsSession = async (account?: string, password?: string): Promise<{ session: TcsSession, fromCache: boolean }> => {
	const { user, pass } = resolveCredentials(account, password)
	const key = `${user}\n${pass}`

	if (cache !== null && cache.key === key && Date.now() - cache.createdAt < SESSION_TTL_MS) {
		return { session: cache.session, fromCache: true }
	}

	// 同一把 key 已有登入流程在跑就一起等，避免併發的 tool call 各自重登一次
	if (pendingPromise !== null && pendingKey === key) {
		return { session: await pendingPromise, fromCache: false }
	}

	pendingKey = key
	pendingPromise = (async () => {
		try {
			const session = await login(user, pass)
			cache = { key, session, createdAt: Date.now() }
			return session
		} finally {
			if (pendingKey === key) {
				pendingKey = null
				pendingPromise = null
			}
		}
	})()

	return { session: await pendingPromise, fromCache: false }
}

// 快取的 session 可能已被 EIP 的重複登入機制踢掉，失敗就重登一次再試。
// retryAnyError = false 時只在確認 session 失效（尚未產生副作用）才重試。
const withTcsSession = async <T,>(
	account: string | undefined,
	password: string | undefined,
	fn: (session: TcsSession) => Promise<T>,
	retryAnyError: boolean = true
): Promise<T> => {
	const { session, fromCache } = await acquireTcsSession(account, password)

	try {
		return await fn(session)
	} catch (e) {
		// 剛登入就失敗代表是真的錯誤，不是 session 過期
		if (!fromCache) throw e

		invalidateTcsSession()
		if (!retryAnyError && !(e instanceof StaleTcsSessionError)) throw e

		const { session: freshSession } = await acquireTcsSession(account, password)
		return await fn(freshSession)
	}
}

export const getUnsubmittedReports = async (account?: string, password?: string, startDate?: string, endDate?: string) => {
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const result = await getUnsubmittedReportsRaw(jar, tcsUrl, startDate, endDate)
		if (!result.depid || !result.empid) throw new StaleTcsSessionError()
		return result
	})
}

export const getProjectMenus = async (date: string, account?: string, password?: string) => {
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const { depid, empid } = await resolveTarget(jar, tcsUrl)
		return getProjectMenusRaw(jar, tcsUrl, depid, empid, date)
	})
}

export const getWorkTypeMenus = async (projectId: string, account?: string, password?: string) => {
	return withTcsSession(account, password, ({ jar, tcsUrl }) =>
		getWorkTypeMenusRaw(jar, tcsUrl, projectId))
}

export const searchProjects = async (keyword: string, account?: string, password?: string) => {
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const { depid } = await resolveTarget(jar, tcsUrl)
		const workdt = dayjs().format('YYYY/M/D')
		return searchProjectsRaw(jar, tcsUrl, depid, workdt, keyword)
	})
}

export const submitDailyReports = async (date: string, entries: DailyReportEntry[], account?: string, password?: string) => {
	// 送出有副作用：只在 POST 之前就確認 session 失效時才重試，避免重複送出
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const { depid, empid } = await resolveTarget(jar, tcsUrl)
		return submitDailyReportsRaw(jar, tcsUrl, depid, empid, date, entries)
	}, false)
}
