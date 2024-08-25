import axios from './base'
import { type SSOLoginResponse, type GetUserResponse } from '../../models/v1/member'

export const ssoLogin = async (type: string, token: string) => await axios.post<SSOLoginResponse>('/member/ssoLogin', { type, token })
export const getUser = async () => await axios.get<GetUserResponse>('/member/user')