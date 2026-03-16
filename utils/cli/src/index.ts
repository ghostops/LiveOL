#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { progressCommand } from './commands/progress';
import { resetCommand } from './commands/reset';

const program = new Command();

program
  .name('livecli')
  .description('CLI for mocking live orienteering results')
  .version('1.0.0');

program.addCommand(createCommand);
program.addCommand(progressCommand);
program.addCommand(resetCommand);

program.parse();
