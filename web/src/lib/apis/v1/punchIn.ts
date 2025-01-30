import axios from './base'
import { type ApplyOtpResponse, type GetPunchInLogsResponse, type GetPunchInsResponse } from '../../models/v1/punchIn'
import { type Response } from '$lib/models/v1/base'

export const getPunchIns = async () => await axios.get<GetPunchInsResponse>('/punchIn')
export const getPunchInLogs = async (page: number, pageCount: number) => await axios.get<GetPunchInLogsResponse>('/punchIn/log', { params: { page, pageCount } })
export const cancelPunchIn = async (date: string, punchInId: number) => await axios.put<Response>('/punchIn/cancel', { date, punchInId })
export const applyOtp = async (punchInId: number) => await axios.post<ApplyOtpResponse>('/punchIn/otp', { punchInId })
export const changePassword = async (punchInId: number, otpKey: string, otp: string, newPassword: string) => await axios.put<Response>('/punchIn/password', { punchInId, otpKey, otp, newPassword })