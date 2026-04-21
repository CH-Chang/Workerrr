import { z } from "zod";
import { searchProjects } from "@workerrr/core";

const decodeBase64 = (str: string): string => Buffer.from(str, 'base64').toString('utf-8');

export const name = "systex-tcs-search-projects";
export const description = "Search for projects and sub-projects in SYSTEX TCS system by keyword.";
export const inputSchema = z.object({
    keyword: z.string().describe("The keyword to search for projects (e.g. project name or ID)")
});
export const feature = async (options: { keyword: string }) => {
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
        const result = await searchProjects(options.keyword, account, password);
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
