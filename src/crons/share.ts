export interface PunchInRow {
	punchInId: number
	userId: number
	punchInType: string
	punchInAccount: string
	punchInPassword: string
	notifyEmail: string
}

export type PunchInTask = (punchInAccount: string, punchInPassword: string) => Promise<boolean>
