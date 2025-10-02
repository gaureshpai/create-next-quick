#!/usr/bin/env node

// Comprehensive test for create-next-quick error handling
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, '..', 'index.js');

console.log(chalk.bold.cyan('🧪 Testing create-next-quick error handling'));
console.log(
  chalk.gray('This will test various error scenarios and recovery mechanisms\n')
);

async function runCLITest(projectName, inputs, expectSuccess = true) {
  return new Promise((resolve) => {
    console.log(chalk.blue(`Testing: ${projectName}`));

    const child = spawn('node', [cliPath, projectName]);
    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Send inputs
    let inputIndex = 0;
    const sendInput = () => {
      if (inputIndex < inputs.length) {
        setTimeout(() => {
          child.stdin.write(inputs[inputIndex] + '\n');
          inputIndex++;
          sendInput();
        }, 500);
      } else {
        setTimeout(() => {
          child.stdin.end();
        }, 1000);
      }
    };
    sendInput();

    child.on('close', (code) => {
      const projectPath = path.join('/tmp', projectName);

      // Clean up
      if (fs.existsSync(projectPath)) {
        fs.rmSync(projectPath, { recursive: true, force: true });
      }

      if (expectSuccess && code === 0) {
        console.log(chalk.green(`✅ ${projectName}: Passed`));
      } else if (!expectSuccess && code !== 0) {
        console.log(chalk.green(`✅ ${projectName}: Failed as expected`));
      } else {
        console.log(
          chalk.red(`❌ ${projectName}: Unexpected result (code: ${code})`)
        );
        if (errorOutput) {
          console.log(
            chalk.gray('Error output:'),
            errorOutput.substring(0, 200)
          );
        }
      }

      resolve({ code, output, errorOutput });
    });

    // Handle timeout
    setTimeout(() => {
      child.kill();
      console.log(chalk.yellow(`⏰ ${projectName}: Timed out`));
      resolve({ code: -1, output, errorOutput });
    }, 30000); // 30 second timeout
  });
}

async function runTests() {
  const tests = [
    {
      name: 'test-basic-npm',
      inputs: ['npm', 'n', 'n', 'y', 'y', '', 'none', 'none', 'n'],
      expectSuccess: true,
    },
    {
      name: 'test-with-prisma',
      inputs: ['npm', 'y', 'y', 'y', 'y', '', 'none', 'prisma', 'n'],
      expectSuccess: true,
    },
    {
      name: 'test-shadcn-without-tailwind',
      inputs: ['npm', 'y', 'n', 'y', 'y', '', 'none', 'none', 'y'],
      expectSuccess: true, // Should work with warnings
    },
  ];

  console.log(
    chalk.yellow(
      'Note: These tests will create and delete temporary projects in /tmp\n'
    )
  );

  for (const test of tests) {
    try {
      await runCLITest(test.name, test.inputs, test.expectSuccess);
    } catch (error) {
      console.log(
        chalk.red(`❌ ${test.name}: Error running test - ${error.message}`)
      );
    }
    console.log(''); // spacing
  }

  console.log(chalk.bold.green('🎉 Error handling tests completed!'));
}

// Change to /tmp directory for testing
process.chdir('/tmp');
runTests().catch(console.error);
