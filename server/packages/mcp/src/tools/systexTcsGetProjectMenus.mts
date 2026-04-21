import { z } from "zod";
import { getProjectMenus } from "@workerrr/core";

const decodeBase64 = (str: string): string => Buffer.from(str, 'base64').toString('utf-8');

export const name = "systex-tcs-get-project-menus";
export const description = "Get project and sub-project menus for a specific employee and date in SYSTEX TCS system.";
export const inputSchema = z.object({
    date: z.string().describe("The date (YYYY/M/D)")
});
export const feature = async (options: { date: string }) => {
    const encodedAccount = process.env.WORKERRR_PUNCH_IN_SYSTEX_ACCOUNT;
    const encodedPassword = process.env.WORKERRR_PUNCH_IN_SYSTEX_PASSWORD;

    if (encodedAccount === undefined || encodedPassword === undefined) {
        return {
            content: [{ type: "text", text: "SYSTEX account or password not set." }],
            isError: true
        };
    }

    const account = decodeBase64(encodedAccount);
    const password = decodeBase64(encodedPassword);
    
    try {
        const result = await getProjectMenus(options.date, account, password);
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
