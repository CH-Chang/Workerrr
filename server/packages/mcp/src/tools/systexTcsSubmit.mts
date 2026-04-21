import { z } from "zod";
import { submitDailyReports } from "@workerrr/core";

const decodeBase64 = (str: string): string => Buffer.from(str, 'base64').toString('utf-8');

export const name = "systex-tcs-submit";
export const description = "Submit daily reports to SYSTEX TCS system.";
export const inputSchema = z.object({
    depid: z.string().describe("Department ID"),
    empid: z.string().describe("Employee ID"),
    date: z.string().describe("The date of the report (YYYY/M/D)"),
    entries: z.array(z.object({
        projectId: z.string(),
        subProjectId: z.string(),
        workTypeId: z.string(),
        subWorkTypeId: z.string(),
        workingHours: z.number(),
        overtimeHours: z.number(),
        memo: z.string()
    })).describe("List of report entries")
});
export const feature = async (options: { depid: string, empid: string, date: string, entries: any[] }) => {
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
        const result = await submitDailyReports(options.depid, options.empid, options.date, options.entries, account, password);
        return {
            content: [{
                type: "text",
                text: result.memo
            }],
            isError: !result.success
        };
    } catch (e) {
        return {
            content: [{ type: "text", text: String(e) }],
            isError: true
        };
    }
}
