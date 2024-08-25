import { type Response } from './base'

export interface GetPunchInsResponse extends Response {
    data: {
        punchIns: Array<{
            punchInId: number
            punchInType: string
            punchInAccount: string
            punchInEnable: string
            punchInManualType: string
            punchInStatus: string
        }>
    }
}

export interface GetPunchInLogsResponse extends Response {
    data: {
        count: number
        punchInLogs: Array<{
            punchInLogId: number
            punchInType: string
            punchInAccount: string
            punchInStatus: string
            punchInMemo: string
            punchInDatetime: string
        }>
    }
}