export type PunchInTask = (punchInAccount: string, punchInPassword: string) => Promise<{ punchInStatus: boolean, punchInMemo: string }>
