import { Command } from 'commander';
import { systemPunchTask } from '@workerrr/core';
import { showNotification } from '../utils/notification.mjs';
import { decode } from '../utils/base64.mjs';
import { loadConfig } from '../utils/config.mjs';


export const punchInCommand = new Command('punchIn')
  .description('Execute punch in task')
  .option('-t, --target <target>', 'Punch in target', '')
  .action(async (options) => {
    try {
			if (options.target !== 'systex') {
				throw new Error(`不支援的打卡目標: ${options.target}`);
			}

      const config = await loadConfig();

			if (!config.systex || !config.systex.account || !config.systex.password) {
				throw new Error('尚未設定精誠資訊帳號密碼，請先執行 \'workerrr config\'');
			}

			const account = decode(config.systex.account);
			const password = decode(config.systex.password);

			const result = await systemPunchTask(account, password);

			if (result.punchInStatus) {
				showNotification({ title: 'Workerrr - 打卡成功', message: '精誠資訊打卡成功！' });
			} else {
				showNotification({ title: 'Workerrr - 打卡失敗', message: result.punchInMemo });
			}
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      showNotification({ title: 'Workerrr - 打卡失敗', message: errorMessage });
      process.exit(1);
    }
  });
