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
        '\n',
        testCase.options.useTypeScript ? '\n' : 'n\n',
        testCase.options.useTailwind ? '\n' : 'n\n',
        testCase.options.useSrcDir ? '\n' : 'n\n',
        testCase.options.useAppDir ? '\n' : 'n\n',
        testCase.options.pages + '\n',
        testCase.options.linter + '\n',
        testCase.options.orm + '\n',
        testCase.options.useShadcn ? '\n' : 'n\n',
      ];

      const assertions = () => {
        assert.ok(fs.existsSync(currentProjectPath), 'Project directory should exist');
        testCase.assertions(currentProjectPath);
      };

      runTest(answers, assertions, done);
    });
  });
});