import { spawn } from 'child_process';
import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { deleteFolder } from '../lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.join(__dirname, '..', 'index.js');

import { testCases } from './test-cases.js';

describe('create-next-quick', function () {
  this.timeout(0);

  let currentProjectName;
  let currentProjectPath;

  beforeEach(() => {
    currentProjectName = `test-project-${Date.now()}`;
    currentProjectPath = path.join(process.cwd(), currentProjectName);
  });

  afterEach(() => {
    deleteFolder(currentProjectPath);
  });

  const runTest = (answers, assertions, done) => {
    deleteFolder(currentProjectPath);
    const child = spawn('node', [cliPath]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      console.log(data.toString());
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(data.toString());
      stderr += data.toString();
    });

    let i = 0;
    const interval = setInterval(() => {
      if (i < answers.length) {
        child.stdin.write(answers[i] + '\n');
        i++;
      } else {
        clearInterval(interval);
        child.stdin.end();
      }
    }, 3000);

    child.on('close', (code) => {
      assert.strictEqual(code, 0, 'CLI should exit with code 0');
      assertions();
      done();
    });
  };

  testCases.forEach((testCase) => {
    it(testCase.description, (done) => {
      const answers = [
        currentProjectName,
        '', // Package manager (default variables)
        testCase.options.useTypeScript ? '' : 'n',
        testCase.options.useTailwind ? '' : 'n',
        testCase.options.useSrcDir ? '' : 'n',
        testCase.options.useAppDir ? '' : 'n',
        testCase.options.pages,
        (testCase.options.linter === 'none' ? '' : (testCase.options.linter === 'eslint' ? '\u001b[B' : '\u001b[B\u001b[B')), // Linter: none (default), eslint (1 down), biome (2 down)
        (testCase.options.orm === 'none' ? '' : (testCase.options.orm === 'prisma' ? '\u001b[B' : '\u001b[B\u001b[B')), // ORM: none (default), prisma (1 down), drizzle (2 down)
        testCase.options.useShadcn ? '' : 'n',
        testCase.options.testing === 'none' ? '' : (testCase.options.testing === 'vitest' ? '\u001b[B' : '\u001b[B\u001b[B'), // testing
        testCase.options.auth === 'none' ? '' : (testCase.options.auth === 'next-auth' ? '\u001b[B' : (testCase.options.auth === 'clerk' ? '\u001b[B\u001b[B' : '\u001b[B\u001b[B\u001b[B')), // auth
        testCase.options.docker ? 'y' : '', // docker (default false, so enter is false. but to be safe, explicit? No, confirm default false means Enter -> false.)
      ];

      const assertions = () => {
        assert.ok(fs.existsSync(currentProjectPath), 'Project directory should exist');
        testCase.assertions(currentProjectPath);
      };

      runTest(answers, assertions, done);
    });
  });
});