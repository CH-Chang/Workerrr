import { Command } from 'commander';
import {
  getUnsubmittedReports,
  getProjectMenus,
  getWorkTypeMenus,
  submitDailyReports,
  searchProjects
} from '@workerrr/core';
import { showNotification } from '../utils/notification.mjs';
import { decode } from '../utils/base64.mjs';
import { loadConfig } from '../utils/config.mjs';
import dayjs from 'dayjs';
import fs from 'node:fs/promises';

const getCredentials = async () => {
  const config = await loadConfig();
  if (!config.systex || !config.systex.account || !config.systex.password) {
    throw new Error('尚未設定精誠資訊帳號密碼，請先執行 \'workerrr config\'');
  }
  return {
    account: decode(config.systex.account),
    password: decode(config.systex.password)
  };
};

export const tcsCommand = new Command('tcs')
  .description('TCS daily report automation commands');

// Default: Check unsubmitted reports
tcsCommand
  .command('check', { isDefault: true })
  .description('Check unsubmitted daily report dates')
  .option('-s, --start-date <date>', 'Start date (YYYY/M/D)')
  .option('-e, --end-date <date>', 'End date (YYYY/M/D)')
  .action(async (options) => {
    try {
      const { account, password } = await getCredentials();
      const { dates } = await getUnsubmittedReports(account, password, options.startDate, options.endDate);

      if (dates.length > 0) {
        const message = `未提交日報日期: ${dates.join(', ')}`;
        console.log(message);
        showNotification({ title: 'Workerrr - TCS 檢查', message });
      } else {
        const message = '所有日報均已提交。';
        console.log(message);
        showNotification({ title: 'Workerrr - TCS 檢查', message });
      }
    } catch (error) {
      console.error('執行失敗:', error instanceof Error ? error.message : '未知錯誤');
      process.exit(1);
    }
  });

// Search Projects
tcsCommand
  .command('search')
  .description('Search projects by keyword')
  .argument('<keyword>', 'The keyword to search for')
  .action(async (keyword) => {
    try {
      const { account, password } = await getCredentials();
      console.log(`正在搜尋專案關鍵字: ${keyword}...`);
      const results = await searchProjects(keyword, account, password);
      console.log(JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('搜尋失敗:', error instanceof Error ? error.message : '未知錯誤');
      process.exit(1);
    }
  });

// List Projects
tcsCommand
  .command('projects')
  .description('List available project and sub-project menus')
  .action(async () => {
    try {
      const { account, password } = await getCredentials();
      const { dates, depid, empid } = await getUnsubmittedReports(account, password);
      const targetDate = dates[0] || dayjs().format('YYYY/M/D');

      console.log(`正在抓取專案選單 (${targetDate})...`);
      const projects = await getProjectMenus(depid, empid, targetDate, account, password);
      console.log(JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error('執行失敗:', error instanceof Error ? error.message : '未知錯誤');
      process.exit(1);
    }
  });

// List Work Types
tcsCommand
  .command('work-types')
  .description('List work type hierarchy for a given project ID')
  .argument('<projectId>', 'The ID of the project')
  .action(async (projectId) => {
    try {
      const { account, password } = await getCredentials();
      console.log(`正在抓取專案 ${projectId} 的工作類別...`);
      const workTypes = await getWorkTypeMenus(projectId, account, password);
      console.log(JSON.stringify(workTypes, null, 2));
    } catch (error) {
      console.error('執行失敗:', error instanceof Error ? error.message : '未知錯誤');
      process.exit(1);
    }
  });

// Submit (Batch or Single)
tcsCommand
  .command('submit')
  .description('Submit daily report entries')
  .option('-f, --file <path>', 'JSON file containing entry array')
  .option('-j, --json <json>', 'JSON string containing entry array')
  .option('-d, --date <date>', 'Target date (YYYY/M/D)')
  .option('-p, --project <project>', 'Project ID (for single entry)')
  .option('-s, --sub-project <subProject>', 'Sub-Project ID (for single entry)', 'None')
  .option('-w, --work-type <workType>', 'Work Type ID (for single entry)')
  .option('-S, --sub-work-type <subWorkType>', 'Sub-Work Type ID (for single entry)')
  .option('-h, --hours <hours>', 'Working hours (for single entry)', '1')
  .option('-m, --memo <memo>', 'Remark text (for single entry)', 'Automated submission')
  .action(async (options) => {
    try {
      const { account, password } = await getCredentials();
      const { dates, depid, empid } = await getUnsubmittedReports(account, password);

      const targetDate = options.date || dates[0];
      if (!targetDate) {
        console.log('沒有需要補交的日期，且未指定日期。');
        return;
      }

      let entries = [];

      if (options.json) {
        entries = JSON.parse(options.json);
      } else if (options.file) {
        const fileContent = await fs.readFile(options.file, 'utf-8');
        entries = JSON.parse(fileContent);
      }

      if (options.json || options.file) {
        if (!Array.isArray(entries)) {
          throw new Error('傳入的 JSON 內容必須為日報項目的陣列');
        }
      } else {
        if (!options.project || !options.workType) {
          throw new Error('未提供專案 ID 或工作類別 ID，請使用 --project 與 --work-type 參數、或提供 --file / --json');
        }
        entries.push({
          projectId: options.project,
          subProjectId: options.subProject,
          workTypeId: options.workType,
          subWorkTypeId: options.subWorkType || options.workType,
          workingHours: parseFloat(options.hours),
          overtimeHours: 0,
          memo: options.memo
        });
      }

      console.log(`正在提交日報 (${targetDate}, 共 ${entries.length} 筆)...`);
      const result = await submitDailyReports(depid, empid, targetDate, entries, account, password);

      console.log(result.memo);
      showNotification({ title: 'Workerrr - TCS 提交', message: result.memo });
    } catch (error) {
      console.error('提交失敗:', error instanceof Error ? error.message : '未知錯誤');
      process.exit(1);
    }
  });
