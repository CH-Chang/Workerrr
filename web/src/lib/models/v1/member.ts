import { type Response } from './base'

export interface SSOLoginRequest {
    type: string
    token: string
}

export interface SSOLoginResponse extends Response {
    data: {
        token: string
    }
}

export interface GetUserResponse extends Response {
    data: {
        userId: string
        name: string
        account: string
        email: string
    }
}