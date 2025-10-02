#!/usr/bin/env node
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import {
  run,
  runWithRetry,
  deleteFolder,
  createFolder,
  deleteFile,
  fileExists,
  writeFile,
} from './lib/utils.js';
import { createPages, createLayout } from './lib/templates.js';

// Function to validate package compatibility
const validatePackageCompatibility = (answers) => {
  const { useShadcn, useTailwind, useTypeScript, orm } = answers;
  const warnings = [];

  // Shadcn requires Tailwind
  if (useShadcn && !useTailwind) {
    warnings.push({
      type: 'compatibility',
      message: 'Shadcn UI requires Tailwind CSS to be enabled',
      suggestion: 'Consider enabling Tailwind CSS or disabling Shadcn UI',
    });
  }

  // Prisma TypeScript warning
  if (orm === 'prisma' && !useTypeScript) {
    warnings.push({
      type: 'recommendation',
      message: 'Prisma works best with TypeScript',
      suggestion: 'Consider enabling TypeScript for better Prisma experience',
    });
  }

  return warnings;
};

(async () => {
  // Validate Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    console.log(chalk.bold.red('Error: Node.js 16 or higher is required'));
    console.log(chalk.yellow(`Current version: ${nodeVersion}`));
    console.log(chalk.yellow('Please upgrade Node.js: https://nodejs.org/'));
    process.exit(1);
  }

  const availablePackageManagers = ['npm'];

  try {
    run('yarn --version', process.cwd(), true);
    availablePackageManagers.push('yarn');
  } catch (error) {}

  try {
    run('pnpm --version', process.cwd(), true);
    availablePackageManagers.push('pnpm');
  } catch (error) {}

  // Validate at least npm is available
  if (availablePackageManagers.length === 0) {
    console.log(chalk.bold.red('Error: No package manager found'));
    console.log(chalk.yellow('Please install npm, yarn, or pnpm'));
    process.exit(1);
  }

  const validateProjectName = (input) => {
    if (input !== input.toLowerCase()) {
      return chalk.red.bold('Project name must be in lowercase.');
    }
    if (input === '.') {
      const files = fs.readdirSync(process.cwd());
      if (files.length > 0) {
        return chalk.red.bold(
          'The current directory is not empty. Please use a different project name.'
        );
      }
    } else {
      if (fs.existsSync(input)) {
        return chalk.red.bold(
          `A directory named "${chalk.white(
            input
          )}" already exists. Please use a different project name.`
        );
      }
    }
    return true;
  };

  const appName = process.argv[2];
  const answers = {};

  console.log();
  console.log(chalk.bold.cyan('╔═══════════════════════════════════════════╗'));
  console.log(
    chalk.bold.cyan('║') +
      chalk.bold.white('    🚀 Create Next Quick CLI Tool         ') +
      chalk.bold.cyan(' ║')
  );
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════╝'));
  console.log();

  if (appName) {
    const validationResult = validateProjectName(appName);
    if (validationResult !== true) {
      console.error(validationResult);
    } else {
      answers.projectName = appName;
    }
  }

  if (!answers.projectName) {
    const appNameAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter project name:',
        filter: (input) => (input.trim() === '' ? '.' : input.trim()),
        validate: validateProjectName,
      },
    ]);
    answers.projectName = appNameAnswers.projectName;
  }

  const otherAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Choose a package manager:',
      choices: availablePackageManagers,
      default: 'pnpm',
    },
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: 'Do you want to use TypeScript?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useTailwind',
      message: 'Do you want to use Tailwind CSS?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useSrcDir',
      message: 'Do you want to use src directory?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'useAppDir',
      message: 'Do you want to use the app directory?',
      default: true,
    },
    {
      type: 'input',
      name: 'pages',
      message: 'Enter pages (comma-separated, default: none):',
      default: '',
      filter: (input) =>
        input
          .split(',')
          .map((page) => page.trim())
          .filter((page) => page !== ''),
    },
    {
      type: 'list',
      name: 'linter',
      message: 'Choose a linter:',
      choices: ['none', 'eslint', 'biome'],
      default: 'none',
    },
    {
      type: 'list',
      name: 'orm',
      message: 'Choose an ORM:',
      choices: ['none', 'prisma', 'drizzle'],
      default: 'none',
    },
    {
      type: 'confirm',
      name: 'useShadcn',
      message: 'Do you want to use Shadcn UI?',
      default: false,
    },
  ]);

  Object.assign(answers, otherAnswers);

  // Validate package compatibility
  const warnings = validatePackageCompatibility(answers);
  if (warnings.length > 0) {
    console.log();
    console.log(chalk.bold.yellow('⚠️  Compatibility Warnings:'));
    warnings.forEach((warning) => {
      console.log(chalk.yellow(`• ${warning.message}`));
      console.log(chalk.gray(`  ${warning.suggestion}`));
    });
    console.log();
  }

  const {
    projectName,
    packageManager,
    useTypeScript,
    useTailwind,
    useAppDir,
    useSrcDir,
    pages,
    linter,
    orm,
    useShadcn,
  } = answers;
  const projectPath = path.join(process.cwd(), projectName);

  console.log();
  console.log(
    chalk.bold.hex('#23f0bcff')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  );
  console.log(
    chalk.bold.white(`  Creating project: ${chalk.cyan(projectName)}`)
  );
  console.log(
    chalk.bold.hex('#23f0bcff')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  );
  console.log();

  let command = `npx --yes create-next-app@latest ${projectName} --use-${packageManager} --yes`;
  if (useTypeScript) {
    command += ' --ts';
  } else {
    command += ' --js';
  }
  if (useTailwind) {
    command += ' --tailwind';
  }
  if (useSrcDir) {
    command += ' --src-dir';
  }
  if (useAppDir) {
    command += ' --app';
  } else {
    command += ' --no-app';
  }

  if (linter === 'none') {
    command += ' --no-eslint';
  }

  console.log(
    chalk.cyan(`Installing dependencies with ${chalk.bold(packageManager)}...`)
  );

  try {
    await runWithRetry(command);
    console.log(chalk.bold.green('Dependencies installed successfully'));
  } catch (err) {
    console.log(chalk.bold.red('Failed to install dependencies'));
    console.log(chalk.red(`Error: ${err.message}`));

    // Clean up failed project directory
    if (fs.existsSync(projectPath)) {
      console.log(chalk.yellow('Cleaning up failed installation...'));
      deleteFolder(projectPath);
    }

    console.log(chalk.yellow('\nTroubleshooting tips:'));
    console.log(chalk.white('• Check your internet connection'));
    console.log(chalk.white('• Verify Node.js and npm are properly installed'));
    console.log(chalk.white('• Try running the command manually:'));
    console.log(chalk.gray(`  ${command}`));
    process.exit(1);
  }

  console.log(chalk.yellow('Cleaning up default files...'));

  try {
    if (!useAppDir) {
      const apiHelloPath = useSrcDir
        ? path.join(projectPath, 'src', 'pages', 'api', 'hello.js')
        : path.join(projectPath, 'pages', 'api', 'hello.js');
      if (fileExists(apiHelloPath)) {
        deleteFile(apiHelloPath);
      }
    }

    const publicPath = path.join(projectPath, 'public');
    deleteFolder(publicPath);
    createFolder(publicPath);

    console.log(chalk.bold.green('Cleanup complete'));
  } catch (error) {
    console.log(chalk.bold.yellow('Warning: Some cleanup operations failed'));
    console.log(chalk.red(`Error: ${error.message}`));
  }

  console.log(chalk.magenta('Creating layout files...'));

  try {
    createLayout(projectPath, projectName, useTypeScript, useAppDir, useSrcDir);

    const pagesPath = useAppDir
      ? useSrcDir
        ? path.join(projectPath, 'src', 'app')
        : path.join(projectPath, 'app')
      : useSrcDir
      ? path.join(projectPath, 'src', 'pages')
      : path.join(projectPath, 'pages');

    createPages(pagesPath, pages, useTypeScript, useAppDir, useSrcDir);

    const faviconPathInAppOrSrc = useAppDir
      ? useSrcDir
        ? path.join(projectPath, 'src', 'app', 'favicon.ico')
        : path.join(projectPath, 'app', 'favicon.ico')
      : useSrcDir
      ? path.join(projectPath, 'src', 'favicon.ico')
      : path.join(projectPath, 'favicon.ico');

    if (fileExists(faviconPathInAppOrSrc)) {
      deleteFile(faviconPathInAppOrSrc);
    }

    let defaultPagePath;
    if (useAppDir) {
      defaultPagePath = useSrcDir
        ? path.join(
            projectPath,
            'src',
            'app',
            useTypeScript ? 'page.tsx' : 'page.js'
          )
        : path.join(projectPath, 'app', useTypeScript ? 'page.tsx' : 'page.js');
    } else {
      defaultPagePath = useSrcDir
        ? path.join(
            projectPath,
            'src',
            'pages',
            useTypeScript ? 'index.tsx' : 'index.js'
          )
        : path.join(
            projectPath,
            'pages',
            useTypeScript ? 'index.tsx' : 'index.js'
          );
    }

    const emptyPageContent = `export default function Page() {
    return (
      <></>
    );
  }`;

    writeFile(defaultPagePath, emptyPageContent);

    const readmePath = path.join(projectPath, 'README.md');
    writeFile(readmePath, `# ${projectName}`);

    console.log(chalk.bold.green('Layout and pages created'));
  } catch (error) {
    console.log(
      chalk.bold.yellow('Warning: Failed to create some layout files')
    );
    console.log(chalk.red(`Error: ${error.message}`));
  }

  if (linter === 'biome') {
    console.log(chalk.blue('Setting up Biome linter...'));

    try {
      await runWithRetry(
        `${packageManager} install --save-dev @biomejs/biome`,
        projectPath
      );
      await runWithRetry(`npx @biomejs/biome init`, projectPath);
      console.log(chalk.bold.green('Biome linter configured'));
    } catch (error) {
      console.log(chalk.bold.yellow('Warning: Failed to set up Biome linter'));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log(
        chalk.yellow('You can manually install Biome later by running:')
      );
      console.log(
        chalk.gray(`  ${packageManager} install --save-dev @biomejs/biome`)
      );
      console.log(chalk.gray(`  npx @biomejs/biome init`));
    }
  }

  if (orm === 'prisma') {
    console.log(chalk.blue('Setting up Prisma ORM...'));

    try {
      await runWithRetry(
        `${packageManager} install --save-dev prisma`,
        projectPath
      );
      await runWithRetry(
        `${packageManager} install @prisma/client`,
        projectPath
      );
      await runWithRetry(`npx prisma init`, projectPath);

      const prismaLibDir = useSrcDir
        ? path.join(projectPath, 'src', 'lib')
        : path.join(projectPath, 'lib');
      createFolder(prismaLibDir);

      const prismaContent = `import { PrismaClient } from '@prisma/client'

    declare global {
      var prisma: PrismaClient | undefined
    }

    const prisma = global.prisma || new PrismaClient()

    if (process.env.NODE_ENV !== 'production') global.prisma = prisma

    export default prisma;`;
      writeFile(path.join(prismaLibDir, 'prisma.ts'), prismaContent);

      console.log(chalk.bold.green('Prisma ORM configured'));
    } catch (error) {
      console.log(chalk.bold.yellow('Warning: Failed to set up Prisma ORM'));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log(
        chalk.yellow('You can manually install Prisma later by running:')
      );
      console.log(chalk.gray(`  ${packageManager} install --save-dev prisma`));
      console.log(chalk.gray(`  ${packageManager} install @prisma/client`));
      console.log(chalk.gray(`  npx prisma init`));
    }
  }

  if (orm === 'drizzle') {
    console.log(chalk.blue('Setting up Drizzle ORM...'));

    try {
      await runWithRetry(
        `${packageManager} install drizzle-orm @vercel/postgres`,
        projectPath
      );
      await runWithRetry(
        `${packageManager} install --save-dev drizzle-kit`,
        projectPath
      );

      const drizzleConfigContent = `import type { Config } from 'drizzle-kit';

    export default {
      schema: './src/db/schema.ts',
      out: './drizzle',
      driver: 'pg',
      dbCredentials: {
        connectionString: process.env.DATABASE_URL!,
      },
    } satisfies Config;`;
      writeFile(
        path.join(projectPath, 'drizzle.config.ts'),
        drizzleConfigContent
      );

      const dbDir = useSrcDir
        ? path.join(projectPath, 'src', 'db')
        : path.join(projectPath, 'db');
      createFolder(dbDir);

      const schemaContent = `import { pgTable, serial, text } from 'drizzle-orm/pg-core';

    export const users = pgTable('users', {
      id: serial('id').primaryKey(),
      name: text('name').notNull(),
    });`;
      writeFile(path.join(dbDir, 'schema.ts'), schemaContent);

      console.log(chalk.bold.green('Drizzle ORM configured'));
    } catch (error) {
      console.log(chalk.bold.yellow('Warning: Failed to set up Drizzle ORM'));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log(
        chalk.yellow('You can manually install Drizzle later by running:')
      );
      console.log(
        chalk.gray(`  ${packageManager} install drizzle-orm @vercel/postgres`)
      );
      console.log(
        chalk.gray(`  ${packageManager} install --save-dev drizzle-kit`)
      );
    }
  }

  if (useShadcn) {
    console.log(chalk.magenta('Setting up Shadcn UI...'));

    try {
      // Check if Tailwind is enabled for compatibility
      if (!useTailwind) {
        console.log(
          chalk.bold.yellow('Warning: Shadcn UI requires Tailwind CSS')
        );
        console.log(
          chalk.yellow(
            'Skipping Shadcn UI setup. Please enable Tailwind CSS to use Shadcn UI.'
          )
        );
      } else {
        await runWithRetry(
          `${packageManager} install --save-dev tailwindcss-animate class-variance-authority clsx tailwind-merge`,
          projectPath
        );

        // Create components.json configuration
        const componentsJsonPath = path.join(projectPath, 'components.json');
        const componentsJsonContent = {
          $schema: 'https://ui.shadcn.com/schema.json',
          style: 'default',
          rsc: useAppDir,
          tsx: useTypeScript,
          tailwind: {
            config: useTypeScript ? 'tailwind.config.ts' : 'tailwind.config.js',
            css: useAppDir
              ? useSrcDir
                ? 'src/app/globals.css'
                : 'app/globals.css'
              : useSrcDir
              ? 'src/styles/globals.css'
              : 'styles/globals.css',
            baseColor: 'slate',
            cssVariables: true,
          },
          aliases: {
            components: '@/components',
            utils: '@/lib/utils',
          },
        };
        writeFile(
          componentsJsonPath,
          JSON.stringify(componentsJsonContent, null, 2)
        );

        // Create lib/utils.ts for Shadcn
        const libDir = useSrcDir
          ? path.join(projectPath, 'src', 'lib')
          : path.join(projectPath, 'lib');
        createFolder(libDir);

        const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;
        const utilsFilename = useTypeScript ? 'utils.ts' : 'utils.js';
        writeFile(path.join(libDir, utilsFilename), utilsContent);

        console.log(chalk.bold.green('Shadcn UI configured'));
        console.log(
          chalk.cyan(
            'You can now add components using: npx shadcn@latest add <component>'
          )
        );
      }
    } catch (error) {
      console.log(chalk.bold.yellow('Warning: Failed to set up Shadcn UI'));
      console.log(chalk.red(`Error: ${error.message}`));
      console.log(
        chalk.yellow('You can manually install Shadcn UI later by running:')
      );
      console.log(
        chalk.gray(
          `  ${packageManager} install --save-dev tailwindcss-animate class-variance-authority clsx tailwind-merge`
        )
      );
      console.log(chalk.gray(`  npx shadcn@latest init`));
    }
  }

  if (orm !== 'none') {
    try {
      const envContent = `DATABASE_URL="your_db_url"`;
      writeFile(path.join(projectPath, '.env'), envContent);
    } catch (error) {
      console.log(chalk.bold.yellow('Warning: Failed to create .env file'));
      console.log(
        chalk.yellow('Please manually create a .env file with DATABASE_URL')
      );
    }
  }

  console.log();
  console.log(
    chalk.bold.hex('#23f0bcff')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  );
  console.log(chalk.bold.white('  Setup complete!'));
  console.log(
    chalk.bold.hex('#23f0bcff')('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  );
  console.log();
  console.log(chalk.bold.white('-> Next steps:'));
  console.log(chalk.cyan(`  cd ${chalk.bold.white(projectName)}`));
  console.log(chalk.cyan(`  ${packageManager} ${chalk.bold.white(`run dev`)}`));
  console.log();
  console.log(chalk.white.bold(`Thank you for using create-next-quick!✨`));
  console.log();
})();
