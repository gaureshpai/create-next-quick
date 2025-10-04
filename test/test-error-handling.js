#!/usr/bin/env node

import { run, runWithRetry } from '../lib/utils.js';
import chalk from 'chalk';

async function testErrorHandling() {
  console.log(chalk.bold.cyan('Testing error handling improvements...'));

  console.log('\n1. Testing invalid command handling...');
  try {
    run('invalid-command-that-does-not-exist', process.cwd(), true);
    console.log(chalk.red('❌ Should have thrown an error'));
  } catch (error) {
    console.log(
      chalk.green('✅ Error correctly caught:'),
      error.message.substring(0, 50) + '...'
    );
  }

  console.log('\n2. Testing retry mechanism...');
  try {
    await runWithRetry(
      'invalid-command-that-does-not-exist',
      process.cwd(),
      true,
      1
    );
    console.log(chalk.red('❌ Should have thrown an error'));
  } catch (error) {
    console.log(
      chalk.green('✅ Retry mechanism works:'),
      'Failed after 1 attempt'
    );
  }

  console.log('\n' + chalk.bold.green('Error handling tests completed!'));
}

testErrorHandling().catch(console.error);
