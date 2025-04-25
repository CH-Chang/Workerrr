import { z } from "zod";
import { systemPunchTask } from "@workerrr/core";

const decodeBase64 = (str: string): string => Buffer.from(str, 'base64').toString('utf-8');

export const name = "systex-punch-in";
export const description = "Clock-in for employees working at SYSTEX Corporation(精誠資訊).";
export const inputSchema = z.object({});
export const feature = async () => {
    const encodedAccount = process.env.WORKERRR_PUNCH_IN_SYSTEX_ACCOUNT;
    const encodedPassword = process.env.WORKERRR_PUNCH_IN_SYSTEX_PASSWORD;

    if (encodedAccount === undefined || encodedPassword === undefined) {
        return {
            content: [{
            type: "text",
            text: "SYSTEX punch in account or password not set."
            }],
            isError: true
        };
    }

    const account = decodeBase64(encodedAccount);
    const password = decodeBase64(encodedPassword);
    
    const result = await systemPunchTask(account, password);

    return {
        content: [{
            type: "text",
            text: result.punchInMemo
        }],
        isError: !result.punchInStatus
    }
}