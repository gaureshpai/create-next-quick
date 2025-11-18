import { spawn } from 'child_process';
import { strict as assert } from 'assert';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { deleteFolder, createFolder, writeFile, readFile } from '../lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.join(__dirname, '..', 'index.js');

describe('create-next-quick interactive mode', function () {
  this.timeout(0);

  let currentProjectName;
  let currentProjectPath;

  beforeEach(function (done) {
    currentProjectName = `test-interactive-project-${Date.now()}`;
    currentProjectPath = path.join(process.cwd(), currentProjectName);

    const command = `npx create-next-app@latest ${currentProjectName} --ts --tailwind --src-dir --app --use-npm --yes`;
    const child = spawn(command, { shell: true, stdio: 'inherit' });

    child.on('close', (code) => {
      assert.strictEqual(code, 0, 'create-next-app should exit with code 0');
      done();
    });
  });

  afterEach(() => {
    deleteFolder(currentProjectPath);
  });

  it('should add a new page in interactive mode', (done) => {
    const answers = [
      'about',
      '\n',
      '\n',
      'n\n',
    ];

    const child = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });
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

      const newPagePath = path.join(currentProjectPath, 'src', 'app', 'about', 'page.tsx');
      assert.ok(fs.existsSync(newPagePath), 'New page should be created');

      done();
    });
  });

  it('should add biome linter in interactive mode', (done) => {
    const answers = [
      '',
      'biome\n',
      '\n',
      'n\n',
    ];

    const child = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });

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

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, 'package.json')));
      assert.ok(packageJson.devDependencies['@biomejs/biome'], 'Biome should be in devDependencies');
      assert.ok(fs.existsSync(path.join(currentProjectPath, 'biome.json')), 'biome.json should be created');

      done();
    });
  });

  it('should add prisma orm in interactive mode', (done) => {
    const answers = [
      '',
      '\n',
      'prisma\n',
      'n\n',
    ];

    const child = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });

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

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, 'package.json')));
      assert.ok(packageJson.devDependencies['prisma'], 'Prisma should be in devDependencies');
      assert.ok(packageJson.dependencies['@prisma/client'], 'Prisma client should be in dependencies');
      assert.ok(fs.existsSync(path.join(currentProjectPath, 'prisma', 'schema.prisma')), 'prisma/schema.prisma should be created');

      done();
    });
  });

  it('should add shadcn ui in interactive mode', (done) => {
    const answers = [
      '',
      '\n',
      '\n',
      'y\n',
    ];

    const child = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });

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

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, 'package.json')));
      assert.ok(packageJson.devDependencies['tailwindcss-animate'], 'tailwindcss-animate should be in devDependencies');
      assert.ok(packageJson.devDependencies['class-variance-authority'], 'class-variance-authority should be in devDependencies');
      assert.ok(fs.existsSync(path.join(currentProjectPath, 'components.json')), 'components.json should be created');

      done();
    });
  });

  it('should skip installation if feature already exists', (done) => {
    const firstRunAnswers = [
      '',
      'biome\n',
      '\n', 
      'n\n', 
    ];

    const firstRun = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });

    let i = 0;
    const firstInterval = setInterval(() => {
      if (i < firstRunAnswers.length) {
        firstRun.stdin.write(firstRunAnswers[i] + '\n');
        i++;
      } else {
        clearInterval(firstInterval);
        firstRun.stdin.end();
      }
    }, 3000);

    firstRun.on('close', (code) => {
      assert.strictEqual(code, 0, 'First run should exit with code 0');

      const secondRunAnswers = [
        '',
        'biome\n',
        '\n', 
        'n\n',
      ];

      const secondRun = spawn('node', [cliPath, '-i'], { cwd: currentProjectPath });
      let stdout = '';

      secondRun.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      let j = 0;
      const secondInterval = setInterval(() => {
        if (j < secondRunAnswers.length) {
          secondRun.stdin.write(secondRunAnswers[j] + '\n');
          j++;
        } else {
          clearInterval(secondInterval);
          secondRun.stdin.end();
        }
      }, 3000);

      secondRun.on('close', (secondCode) => {
        assert.strictEqual(secondCode, 0, 'Second run should exit with code 0');
        assert.ok(stdout.includes('Biome is already installed. Skipping setup.'), 'Should show "already installed" message');
        done();
      });
    });
  });
});
