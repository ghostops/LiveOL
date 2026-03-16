import { Command } from 'commander';

export const resetCommand = new Command('reset')
  .description('Remove all mock competitions')
  .action(async () => {
    // Implement removing all mock competitions
  });
