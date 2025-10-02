#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import { run, deleteFolder, createFolder, deleteFile, fileExists, writeFile } from './lib/utils.js';
import { createPages, createLayout } from './lib/templates.js';

(async () => {
  const availablePackageManagers = ["npm"];
  
  try {
    run("yarn --version", process.cwd(), true);
    availablePackageManagers.push("yarn");
  } catch (error) { }

  try {
    run("pnpm --version", process.cwd(), true);
    availablePackageManagers.push("pnpm");
  } catch (error) { }

  const validateProjectName = (input) => {
    if (input !== input.toLowerCase()) {
      return chalk.red.bold("✖ Project name must be in lowercase.");
    }
    if (input === ".") {
      const files = fs.readdirSync(process.cwd());
      if (files.length > 0) {
        return chalk.red.bold("✖ The current directory is not empty. Please use a different project name.");
      }
    } else {
      if (fs.existsSync(input)) {
        return chalk.red.bold(`✖ A directory named "${chalk.white(input)}" already exists. Please use a different project name.`);
      }
    }
    return true;
  };

  const appName = process.argv[2];
  const answers = {};

  // Display welcome banner
  console.log(chalk.bold.cyan("╔═══════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║") + chalk.bold.white("   🚀 Create Next Quick CLI Tool      ") + chalk.bold.cyan(" ║"));
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════╝"));
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
        type: "input",
        name: "projectName",
        message: chalk.bold.hex("#a6d985")("Enter project name:"),
        filter: (input) => input.trim() === '' ? '.' : input.trim(),
        validate: validateProjectName
      }
    ]);
    answers.projectName = appNameAnswers.projectName;
  }

  const otherAnswers = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: chalk.bold.hex("#c0d9a5")("Choose a package manager:"),
      choices: availablePackageManagers,
      default: "pnpm"
    },
    {
      type: "confirm",
      name: "useTypeScript",
      message: chalk.bold.hex("#c0d9a5")("Do you want to use TypeScript?"),
      default: true
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: chalk.bold.hex("#c0d9a5")("Do you want to use Tailwind CSS?"),
      default: true
    },
    {
      type: "confirm",
      name: "useSrcDir",
      message: chalk.bold.hex("#c0d9a5")("Do you want to use src directory?"),
      default: true
    },
    {
      type: "confirm",
      name: "useAppDir",
      message: chalk.bold.hex("#c0d9a5")("Do you want to use the app directory?"),
      default: true
    },
    {
      type: "input",
      name: "pages",
      message: chalk.bold.hex("#c0d9a5")("Enter pages (comma-separated, default: none):"),
      default: "",
      filter: (input) => input.split(',').map((page) => page.trim()).filter(page => page !== '')
    },
    {
      type: "list",
      name: "linter",
      message: chalk.bold.hex("#c0d9a5")("Choose a linter:"),
      choices: ["none", "eslint", "biome"],
      default: "none"
    },
    {
      type: "list",
      name: "orm",
      message: chalk.bold.hex("#c0d9a5")("Choose an ORM:"),
      choices: ["none", "prisma", "drizzle"],
      default: "none"
    },
    {
      type: "confirm",
      name: "useShadcn",
      message: chalk.bold.hex("#c0d9a5")(" Do you want to use Shadcn UI?"),
      default: false
    }
  ]);

  Object.assign(answers, otherAnswers);

  const { projectName, packageManager, useTypeScript, useTailwind, useAppDir, useSrcDir, pages, linter, orm, useShadcn } = answers;
  const projectPath = path.join(process.cwd(), projectName);

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white(`  🔧 Creating project: ${chalk.hex("#00D9FF")(projectName)}`));
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log();

  let command = `npx --yes create-next-app@latest ${projectName} --use-${packageManager} --yes`;
  if (useTypeScript) {
    command += " --ts";
  } else {
    command += " --js";
  }
  if (useTailwind) {
    command += " --tailwind";
  }
  if (useSrcDir) {
    command += " --src-dir";
  }
  if (useAppDir) {
    command += " --app";
  } else {
    command += " --no-app";
  }

  if (linter === "none") {
    command += " --no-eslint";
  }

  const spinner = ora({
    text: chalk.hex("#8BE9FD")(`Installing dependencies with ${chalk.bold(packageManager)}...`),
    color: "cyan",
    spinner: "dots12"
  }).start();
  
  try {
    run(command);
    spinner.succeed(chalk.bold.hex("#23f0bcff")(" Dependencies installed successfully"));
  } catch (err) {
    spinner.fail(chalk.bold.red(" Failed to install dependencies"));
    process.exit(1);
  }

  const cleanupSpinner = ora({
    text: chalk.hex("#FFB86C")("Cleaning up default files..."),
    color: "yellow",
    spinner: "dots12"
  }).start();

  if (!useAppDir) {
    const apiHelloPath = useSrcDir
      ? path.join(projectPath, "src", "pages", "api", "hello.js")
      : path.join(projectPath, "pages", "api", "hello.js");
    if (fileExists(apiHelloPath)) {
      deleteFile(apiHelloPath);
    }
  }

  const publicPath = path.join(projectPath, "public");
  deleteFolder(publicPath);
  createFolder(publicPath);

  cleanupSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Cleanup complete"));

  const layoutSpinner = ora({
    text: chalk.hex("#BD93F9")("Creating layout files..."),
    color: "magenta",
    spinner: "dots12"
  }).start();

  createLayout(projectPath, projectName, useTypeScript, useAppDir, useSrcDir);

  const pagesPath = useAppDir 
    ? (useSrcDir ? path.join(projectPath, "src", "app") : path.join(projectPath, "app")) 
    : (useSrcDir ? path.join(projectPath, "src", "pages") : path.join(projectPath, "pages"));
  
  createPages(pagesPath, pages, useTypeScript, useAppDir, useSrcDir);

  const faviconPathInAppOrSrc = useAppDir 
    ? (useSrcDir ? path.join(projectPath, "src", "app", "favicon.ico") : path.join(projectPath, "app", "favicon.ico")) 
    : (useSrcDir ? path.join(projectPath, "src", "favicon.ico") : path.join(projectPath, "favicon.ico"));
  
  if (fileExists(faviconPathInAppOrSrc)) {
    deleteFile(faviconPathInAppOrSrc);
  }

  let defaultPagePath;
  if (useAppDir) {
    defaultPagePath = useSrcDir 
      ? path.join(projectPath, "src", "app", useTypeScript ? "page.tsx" : "page.js") 
      : path.join(projectPath, "app", useTypeScript ? "page.tsx" : "page.js");
  } else {
    defaultPagePath = useSrcDir 
      ? path.join(projectPath, "src", "pages", useTypeScript ? "index.tsx" : "index.js") 
      : path.join(projectPath, "pages", useTypeScript ? "index.tsx" : "index.js");
  }

  const emptyPageContent = `export default function Page() {
  return (
    <></>
  );
}`;
  writeFile(defaultPagePath, emptyPageContent);

  const readmePath = path.join(projectPath, "README.md");
  writeFile(readmePath, `# ${projectName}`);

  layoutSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Layout and pages created"));

  if (linter === "biome") {
    const biomeSpinner = ora({
      text: chalk.hex("#FF6E67")("Setting up Biome linter..."),
      color: "red",
      spinner: "dots12"
    }).start();
    
    run(`${packageManager} install --save-dev @biomejs/biome`, projectPath);
    run(`npx @biomejs/biome init`, projectPath);
    
    biomeSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Biome linter configured"));
  }

  if (orm === "prisma") {
    const prismaSpinner = ora({
      text: chalk.hex("#00D9FF")("Setting up Prisma ORM..."),
      color: "cyan",
      spinner: "dots12"
    }).start();
    
    run(`${packageManager} install --save-dev prisma`, projectPath);
    run(`${packageManager} install @prisma/client`, projectPath);
    run(`npx prisma init`, projectPath);

    const prismaLibDir = useSrcDir ? path.join(projectPath, "src", "lib") : path.join(projectPath, "lib");
    createFolder(prismaLibDir);

    const prismaContent = `import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma;`;
    writeFile(path.join(prismaLibDir, "prisma.ts"), prismaContent);
    
    prismaSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Prisma ORM configured"));
  }

  if (orm === "drizzle") {
    const drizzleSpinner = ora({
      text: chalk.hex("#00D9FF")("Setting up Drizzle ORM..."),
      color: "cyan",
      spinner: "dots12"
    }).start();
    
    run(`${packageManager} install drizzle-orm @vercel/postgres`, projectPath);
    run(`${packageManager} install --save-dev drizzle-kit`, projectPath);

    const drizzleConfigContent = `import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;`;
    writeFile(path.join(projectPath, "drizzle.config.ts"), drizzleConfigContent);

    const dbDir = useSrcDir ? path.join(projectPath, "src", "db") : path.join(projectPath, "db");
    createFolder(dbDir);

    const schemaContent = `import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});`;
    writeFile(path.join(dbDir, "schema.ts"), schemaContent);
    
    drizzleSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Drizzle ORM configured"));
  }

  if (useShadcn) {
    const shadcnSpinner = ora({
      text: chalk.hex("#BD93F9")("Setting up Shadcn UI..."),
      color: "magenta",
      spinner: "dots12"
    }).start();
    
    run(`${packageManager} install --save-dev tailwindcss-animate class-variance-authority`, projectPath);
    run(`npx shadcn@latest init`, projectPath);
    
    const componentsJsonPath = path.join(projectPath, "components.json");
    const componentsJsonContent = {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "default",
      "rsc": useAppDir,
      "tsx": useTypeScript,
      "tailwind": {
        "config": useTypeScript ? "tailwind.config.ts" : "tailwind.config.js",
        "css": useAppDir 
          ? (useSrcDir ? "src/app/globals.css" : "app/globals.css") 
          : (useSrcDir ? "src/styles/globals.css" : "styles/globals.css"),
        "baseColor": "slate",
        "cssVariables": true
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
      }
    };
    writeFile(componentsJsonPath, JSON.stringify(componentsJsonContent, null, 2));
    
    shadcnSpinner.succeed(chalk.bold.hex("#23f0bcff")(" Shadcn UI configured"));
  }

  if (orm !== "none") {
    const envContent = `DATABASE_URL="your_db_url"`;
    writeFile(path.join(projectPath, ".env"), envContent);
  }

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white("  ✨ Setup complete! ✨"));
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
    console.log();
    console.log(chalk.bold.white("Next steps:"));
    console.log(chalk.cyan(`  cd ${chalk.bold.white(projectName)}`));
    console.log(chalk.cyan(`  ${packageManager} ${chalk.bold.white("run dev")}`));
    console.log();
    console.log(
    chalk.white.bold(
        `Thank you for using ${chalk.bgBlackBright.white.bold(" create-next-quick ")}!✨`
    )
    );
    console.log();

})();