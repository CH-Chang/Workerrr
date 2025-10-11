import { Command } from 'commander';
import prompts from 'prompts';
import { existsConfig, saveConfig, type WorkerrrConfig } from '../utils/config.mjs';
import { encode } from '../utils/base64.mjs';

const { loadConfig } = await import('../utils/config.mjs');

const setupSystexAccount = async (config: WorkerrrConfig): Promise<WorkerrrConfig> => {
  const { systexAccount } = await prompts({
    type: 'text',
    name: 'systexAccount',
    message: '請輸入帳號:',
    validate: value => value ? true : '帳號不能為空'
  });

  const { systexPassword } = await prompts({
    type: 'password',
    name: 'systexPassword',
    message: '請輸入密碼:',
    validate: value => value ? true : '密碼不能為空'
  });

  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `請確認設定帳號 ${systexAccount} ?`,
    initial: false
  });

  if (!confirm) {
    throw new Error('設定已取消');
  }

  config.systex = {
    account: encode(systexAccount),
    password: encode(systexPassword)
  };

  return config;
};

export const configCommand = new Command('config')
  .description('Configure workerrr')
	.option('-t, --target <target>', 'Punch in target', '')
  .action(async (options) => {
		if (options.target !== 'systex') {
			throw new Error(`不支援的打卡目標: ${options.target}`);
		}

		const config: WorkerrrConfig = await existsConfig()
			? await loadConfig()
			: {};

		const nextConfig = await setupSystexAccount(config);
		await saveConfig(nextConfig);
  });
