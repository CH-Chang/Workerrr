import { z } from 'zod';
import { readFile, writeFile, access } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_FILE = '.workerrr.json';
const CONFIG_PATH = join(homedir(), CONFIG_FILE);

export const WorkerrrConfigSchema = z.object({
  systex: z.object({
    account: z.string().min(1, '帳號不能為空'),
    password: z.string().min(1, '密碼不能為空')
  }).optional()
});

export type WorkerrrConfig = z.infer<typeof WorkerrrConfigSchema>;

export const existsConfig = async (): Promise<boolean> => {
  try {
    await access(CONFIG_PATH);
    return true;
  } catch (error) {
    return false;
  }
};

export const loadConfig = async (): Promise<WorkerrrConfig> => {
	const data = await readFile(CONFIG_PATH, 'utf-8');
	const parsedData = JSON.parse(data);
	return validateConfig(parsedData);
};

export const saveConfig = async (config: WorkerrrConfig): Promise<void> => {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
};


const validateConfig = (data: unknown): WorkerrrConfig => {
  try {
    return WorkerrrConfigSchema.parse(data);
  } catch (error) {
    throw new Error('配置檔案格式錯誤或無效');
  }
};
