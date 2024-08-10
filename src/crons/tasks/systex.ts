import { type PunchInTask } from "../share"
import { CookieJar } from 'tough-cookie'
import { loginEip } from './systex/eip'
import { loginBMS } from './systex/bms'
import { punch } from './systex/punch'

const task: PunchInTask = async (punchInAccount: string, punchInPassword: string): Promise<boolean> => {
	const jar = new CookieJar()

	try {
		const { success: eipSuccess } = await loginEip(jar, punchInAccount, punchInPassword)
		if (!eipSuccess) return false

		const { success: bsmSuccess, guid: bsmGuid } = await loginBMS(jar)
		if (!bsmSuccess || typeof bsmGuid !== 'string') return false

		const { success: punchSuccess } = await punch(jar, punchInAccount, bsmGuid)
		if (!punchSuccess) return false

		return true
	} catch (e) {
		console.error(e)
		return false
	}
}

export default task
