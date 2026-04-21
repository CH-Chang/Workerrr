import { z } from "zod";
import { getUnsubmittedReports } from "@workerrr/core";

const decodeBase64 = (str: string): string => Buffer.from(str, 'base64').toString('utf-8');

export const name = "systex-tcs-get-unsubmitted";
export const description = "Get unsubmitted report dates, department ID, and employee ID from SYSTEX TCS system.";
export const inputSchema = z.object({
    startDate: z.string().optional().describe("Start date (YYYY/M/D)"),
    endDate: z.string().optional().describe("End date (YYYY/M/D)")
});
export const feature = async (options: { startDate?: string, endDate?: string }) => {
    const encodedAccount = process.env.WORKERRR_PUNCH_IN_SYSTEX_ACCOUNT;
    const encodedPassword = process.env.WORKERRR_PUNCH_IN_SYSTEX_PASSWORD;

    if (encodedAccount === undefined || encodedPassword === undefined) {
        return {
            content: [{ type: "text", text: "SYSTEX account or password not set (WORKERRR_PUNCH_IN_SYSTEX_ACCOUNT/PASSWORD)." }],
            isError: true
        };
    }

    const account = decodeBase64(encodedAccount);
    const password = decodeBase64(encodedPassword);
    
    try {
        const result = await getUnsubmittedReports(account, password, options.startDate, options.endDate);
        return {
            content: [{
                type: "text",
                text: JSON.stringify(result, null, 2)
            }],
            isError: false
        };
    } catch (e) {
        return {
            content: [{ type: "text", text: String(e) }],
            isError: true
        };
    }
}
