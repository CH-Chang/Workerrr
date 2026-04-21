#!/usr/bin/env node

import { Command } from 'commander';
import { configCommand } from './commands/config.mjs';
import { punchInCommand } from './commands/punchIn.mjs';
import { tcsCommand } from './commands/tcs.mjs';

const program = new Command();

program
  .name('workerrr')
  .description('Workerrr CLI')
  .version('1.0.0');

program.addCommand(configCommand);
program.addCommand(punchInCommand);
program.addCommand(tcsCommand);

program.parse();
