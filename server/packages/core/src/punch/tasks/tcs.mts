import { CookieJar } from 'tough-cookie'
import dayjs from 'dayjs'
import { loginEip } from './systex/eip.mjs'
import { 
	loginTCS, 
	getUnsubmittedReports as getUnsubmittedReportsRaw, 
	getProjectMenus as getProjectMenusRaw, 
	getWorkTypeMenus as getWorkTypeMenusRaw, 
	submitDailyReports as submitDailyReportsRaw,
	getDailyReportMemos as getDailyReportMemosRaw,
	searchProjects as searchProjectsRaw,
	DailyReportEntry
} from './systex/tcs.mjs'

type TcsSession = { jar: CookieJar, tcsUrl: string }

// session 失效時 TCS 不回錯誤，只回空表單，所以靠拿不到 depid/empid 判斷
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

// ASP session 約 20 分鐘 idle timeout，取一半當保險
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

export const getDailyReportMemos = async (date: string, account?: string, password?: string) => {
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const { depid, empid } = await resolveTarget(jar, tcsUrl)
		return getDailyReportMemosRaw(jar, tcsUrl, depid, empid, date)
	})
}

export const submitDailyReports = async (date: string, entries: DailyReportEntry[], account?: string, password?: string) => {
	return withTcsSession(account, password, async ({ jar, tcsUrl }) => {
		const { depid, empid } = await resolveTarget(jar, tcsUrl)
		return submitAndVerify(jar, tcsUrl, depid, empid, date, entries)
	}, false)
}

const normalizeMemo = (s: string): string => s.replace(/\s+/g, ' ').trim()

const findMangled = (sent: string[], stored: string[]): string[] => {
	const remaining = stored.map(normalizeMemo)
	const mangled: string[] = []

	for (const raw of sent) {
		const a = normalizeMemo(raw)
		// 損壞是等長替換，所以先挑同長度、相同字元最多的那筆配對
		let bestIdx = -1
		let bestScore = -1
		for (let i = 0; i < remaining.length; i++) {
			const b = remaining[i]
			if (b.length !== a.length) continue
			let same = 0
			for (let j = 0; j < a.length; j++) if (a[j] === b[j]) same++
			if (same > bestScore) { bestScore = same; bestIdx = i }
		}
		if (bestIdx < 0) { mangled.push(`整筆對不上: ${a.slice(0, 20)}…`); continue }
		const b = remaining.splice(bestIdx, 1)[0]
		for (let j = 0; j < a.length; j++) {
			if (a[j] !== b[j]) mangled.push(`${a[j]}→${b[j]}`)
		}
	}

	return mangled
}

// TCS 偶發會把備注裡個別中文字換成 ? 或形近字；重送同一天是取代而非追加，所以重試安全
const SUBMIT_VERIFY_ATTEMPTS = 4

const submitAndVerify = async (
	jar: CookieJar, tcsUrl: string, depid: string, empid: string,
	date: string, entries: DailyReportEntry[]
): Promise<{ success: boolean, memo: string }> => {
	const sent = entries.map(e => e.memo || '')
	let lastMangled: string[] = []

	for (let attempt = 1; attempt <= SUBMIT_VERIFY_ATTEMPTS; attempt++) {
		const result = await submitDailyReportsRaw(jar, tcsUrl, depid, empid, date, entries)
		if (!result.success) return result

		const stored = await getDailyReportMemosRaw(jar, tcsUrl, depid, empid, date)
		if (stored.length !== entries.length) {
			return { success: false, memo: `送出後讀回的筆數不符：預期 ${entries.length} 筆，實際 ${stored.length} 筆` }
		}

		lastMangled = findMangled(sent, stored)
		if (lastMangled.length === 0) {
			const note = attempt === 1 ? '' : `（第 ${attempt} 次送出才完整寫入）`
			return { success: true, memo: `日報提交成功，已讀回驗證${note}` }
		}
	}

	return {
		success: false,
		memo: `送出 ${SUBMIT_VERIFY_ATTEMPTS} 次後備注仍被 TCS 改字，請改寫用字後重試。最後一次的差異：${lastMangled.join('、')}`
	}
}
