import { type PunchInTask } from "../share"
import { CookieJar } from 'tough-cookie'
import { loginEip } from './systex/eip'
import { loginBMS } from './systex/bms'
import { punch } from './systex/punch'

const task: PunchInTask = async (punchInAccount: string, punchInPassword: string): Promise<{ punchInStatus: boolean, punchInMemo: string }> => {
	const jar = new CookieJar()

	try {
		const { success: eipSuccess, memo: eipMemo } = await loginEip(jar, punchInAccount, punchInPassword)
		if (!eipSuccess) return { punchInStatus: false, punchInMemo: eipMemo }

		const { success: bsmSuccess, memo: bmsMemo, guid: bsmGuid } = await loginBMS(jar)
		if (!bsmSuccess) return { punchInStatus: false, punchInMemo: bmsMemo }

		const { success: punchSuccess, memo: punchMemo } = await punch(jar, punchInAccount, bsmGuid)
		if (!punchSuccess) return { punchInStatus: false, punchInMemo: punchMemo }

		return { punchInStatus: true, punchInMemo: '' }
	} catch (e) {
		return { punchInStatus: false, punchInMemo: '發生未知錯誤' + (e instanceof Error ? ': ' +e.message : '') }
	}
}

export default task
