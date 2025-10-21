#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { run, deleteFolder, createFolder, deleteFile, fileExists, writeFile } from './lib/utils.js';
import { createPages, createLayout } from './lib/templates.js';

const MIN_NODE_VERSION = 18;
const currentNodeVersion = process.versions.node;

if (parseInt(currentNodeVersion.split('.')[0]) <= MIN_NODE_VERSION) {
  console.error(chalk.red.bold(`\nError: create-next-quick requires Node.js version ${MIN_NODE_VERSION} or higher.`));
  console.error(chalk.red.bold(`You are currently using Node.js ${currentNodeVersion}.`));
  console.error(chalk.red.bold(`Please upgrade your Node.js version to proceed.`));
  process.exit(1);
}

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
      return chalk.red.bold("Project name must be in lowercase.");
    }
    if (input === ".") {
      const files = fs.readdirSync(process.cwd());
      if (files.length > 0) {
        return chalk.red.bold("The current directory is not empty. Please use a different project name.");
      }
    } else {
      if (fs.existsSync(input)) {
        return chalk.red.bold(`A directory named "${chalk.white(input)}" already exists. Please use a different project name.`);
      }
    }
    return true;
  };

  const appName = process.argv[2];
  const answers = {};

  console.log();
  console.log(chalk.bold.cyan("╔═══════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║") + chalk.bold.white("    🚀 Create Next Quick CLI Tool         ") + chalk.bold.cyan(" ║"));
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════════╝"));
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
        message: "Enter project name:",
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
      message: "Choose a package manager:",
      choices: availablePackageManagers,
      default: "pnpm" || "npm" || "yarn",
    },
    {
      type: "confirm",
      name: "useTypeScript",
      message: "Do you want to use TypeScript? (default: Yes)",
      default: true
    },
    {
      type: "confirm",
      name: "useTailwind",
      message: "Do you want to use Tailwind CSS? (default: Yes)",
      default: true
    },
    {
      type: "confirm",
      name: "useSrcDir",
      message: "Do you want to use src directory? (default: Yes)",
      default: true
    },
    {
      type: "confirm",
      name: "useAppDir",
      message: "Do you want to use the app directory? (default: Yes)",
      default: true
    },
    {
      type: "input",
      name: "pages",
      message: "Enter pages (comma-separated, default: none):",
      default: "",
      filter: (input) => input.split(',').map((page) => page.trim()).filter(page => page !== '')
    },
    {
      type: "list",
      name: "linter",
      message: "Choose a linter:",
      choices: ["none", "eslint", "biome"],
      default: "none"
    },
    {
      type: "list",
      name: "orm",
      message: "Choose an ORM:",
      choices: ["none", "prisma", "drizzle"],
      default: "none"
    },
    {
      type: "confirm",
      name: "useShadcn",
      message: "Do you want to use Shadcn UI? (default: Yes)",
      default: true
    }
  ]);

  Object.assign(answers, otherAnswers);

  const { projectName, packageManager, useTypeScript, useTailwind, useAppDir, useSrcDir, pages, linter, orm, useShadcn } = answers;

  const displayName = projectName === '.' ? path.basename(process.cwd()) : projectName;
  const projectPath = projectName === '.' ? process.cwd() : path.join(process.cwd(), projectName);

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white(`  Creating project: ${chalk.cyan(projectName)}`));
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

  console.log(chalk.cyan(`Installing dependencies with ${chalk.bold(packageManager)}...`));

  const installResult = run(command, process.cwd(), false, 3, 2000); // 3 retries, 2-second delay

  if (!installResult.success) {
    console.error(chalk.bold.red("Failed to install dependencies."));
    if (installResult.stderr) {
      console.error(chalk.red("Error details:"));
      console.error(chalk.red(installResult.stderr));
    }
    console.error(chalk.yellow("Troubleshooting tips:"));
    console.error(chalk.yellow("  - Check your internet connection."));
    console.error(chalk.yellow("  - Ensure your package manager (npm, yarn, or pnpm) is installed and up to date."));
    console.error(chalk.yellow("  - Try running the command again."));
    throw new Error("Dependency installation failed."); // Throw to trigger cleanup
  }

  console.log(chalk.bold.green("Dependencies installed successfully"));

  console.log(chalk.yellow("Cleaning up default files..."));

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

  console.log(chalk.bold.green("Cleanup complete"));

  console.log(chalk.magenta("Creating layout files..."));

  createLayout(projectPath, displayName, useTypeScript, useAppDir, useSrcDir);

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
  writeFile(readmePath, `# ${displayName}`);

  if (useTypeScript) {
    let globalCssPath;
    if (useAppDir) {
      globalCssPath = useSrcDir ? path.join(projectPath, "src", "app") : path.join(projectPath, "app");
    } else {
      globalCssPath = useSrcDir ? path.join(projectPath, "src", "styles") : path.join(projectPath, "styles");
    }
    const globalDtsPath = path.join(globalCssPath, "global.d.ts");
    const globalDtsContent = `declare module '*.css' {\r\n  interface CSSModule {\r\n    [className: string]: string\r\n  }\r\n  const cssModule: CSSModule\r\n  export default cssModule\r\n}`;
    writeFile(globalDtsPath, globalDtsContent);
  }

  console.log(chalk.bold.green("Layout and pages created"));

  if (linter === "biome") {
    console.log(chalk.blue("Setting up Biome linter..."));

    const biomeInstallResult = run(`${packageManager} install --save-dev @biomejs/biome`, projectPath, false, 3, 2000);
    if (!biomeInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Biome dependencies."));
      if (biomeInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(biomeInstallResult.stderr));
      }
      throw new Error("Biome installation failed.");
    }

    const biomeInitResult = run(`npx @biomejs/biome init`, projectPath, false, 3, 2000);
    if (!biomeInitResult.success) {
      console.error(chalk.bold.red("Failed to initialize Biome."));
      if (biomeInitResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(biomeInitResult.stderr));
      }
      throw new Error("Biome initialization failed.");
    }

    console.log(chalk.bold.green("Biome linter configured"));
  }

  if (orm === "prisma") {
    console.log(chalk.blue("Setting up Prisma ORM..."));

    const prismaInstallDevResult = run(`${packageManager} install --save-dev prisma`, projectPath, false, 3, 2000);
    if (!prismaInstallDevResult.success) {
      console.error(chalk.bold.red("Failed to install Prisma dev dependencies."));
      if (prismaInstallDevResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(prismaInstallDevResult.stderr));
      }
      throw new Error("Prisma dev dependency installation failed.");
    }

    const prismaInstallClientResult = run(`${packageManager} install @prisma/client`, projectPath, false, 3, 2000);
    if (!prismaInstallClientResult.success) {
      console.error(chalk.bold.red("Failed to install Prisma client dependencies."));
      if (prismaInstallClientResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(prismaInstallClientResult.stderr));
      }
      throw new Error("Prisma client dependency installation failed.");
    }

    const prismaInitResult = run(`npx prisma init`, projectPath, false, 3, 2000);
    if (!prismaInitResult.success) {
      console.error(chalk.bold.red("Failed to initialize Prisma."));
      if (prismaInitResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(prismaInitResult.stderr));
      }
      throw new Error("Prisma initialization failed.");
    }

    const prismaLibDir = useSrcDir ? path.join(projectPath, "src", "lib") : path.join(projectPath, "lib");
    createFolder(prismaLibDir);

    const prismaContent = `import { PrismaClient } from '@prisma/client'\n\n    declare global {\n      var prisma: PrismaClient | undefined\n    }\n\n    const prisma = global.prisma || new PrismaClient()\n\n    if (process.env.NODE_ENV !== 'production') global.prisma = prisma\n\n    export default prisma;`;
    writeFile(path.join(prismaLibDir, "prisma.ts"), prismaContent);

    console.log(chalk.bold.green("Prisma ORM configured"));
  }

  if (orm === "drizzle") {
    console.log(chalk.blue("Setting up Drizzle ORM..."));

    const drizzleInstallResult = run(`${packageManager} install drizzle-orm @vercel/postgres`, projectPath, false, 3, 2000);
    if (!drizzleInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Drizzle ORM dependencies."));
      if (drizzleInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(drizzleInstallResult.stderr));
      }
      throw new Error("Drizzle ORM dependency installation failed.");
    }
    const drizzleKitInstallResult = run(`${packageManager} install --save-dev drizzle-kit`, projectPath, false, 3, 2000);
    if (!drizzleKitInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Drizzle Kit dev dependencies."));
      if (drizzleKitInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(drizzleKitInstallResult.stderr));
      }
      throw new Error("Drizzle Kit dev dependency installation failed.");
    }

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

    console.log(chalk.bold.green("Drizzle ORM configured"));
  }

  if (useShadcn) {
    console.log(chalk.magenta("Setting up Shadcn UI..."));

    const shadcnInstallResult = run(`${packageManager} install --save-dev tailwindcss-animate class-variance-authority`, projectPath, false, 3, 2000);
    if (!shadcnInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Shadcn UI dependencies."));
      if (shadcnInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(shadcnInstallResult.stderr));
      }
      throw new Error("Shadcn UI dependency installation failed.");
    }

    const shadcnInitResult = run(`cmd /C "echo y | npx shadcn@latest init --yes"`, projectPath, false, 3, 2000);
    if (!shadcnInitResult.success) {
      console.error(chalk.bold.red("Failed to initialize Shadcn UI."));
      if (shadcnInitResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(shadcnInitResult.stderr));
      }
      throw new Error("Shadcn UI initialization failed.");
    }

    const componentsJsonPath = path.join(projectPath, "components.json");
    let existingComponentsJson = {};
    if (fs.existsSync(componentsJsonPath)) {
      existingComponentsJson = JSON.parse(fs.readFileSync(componentsJsonPath, "utf8"));
    }

    const customComponentsJsonContent = {
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

    const mergedComponentsJsonContent = Object.assign({}, existingComponentsJson, customComponentsJsonContent);
    writeFile(componentsJsonPath, JSON.stringify(mergedComponentsJsonContent, null, 2));

    console.log(chalk.bold.green("Shadcn UI configured"));
  }

  if (orm !== "none") {
    const envContent = `DATABASE_URL="your_db_url"`;
    writeFile(path.join(projectPath, ".env"), envContent);
  }

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white("  Setup complete!"));
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log();
  console.log(chalk.bold.white("-> Next steps:"));
  if (projectName !== '.') {
    console.log(chalk.cyan(`  cd ${chalk.bold.white(projectName)}`));
  }
  console.log(chalk.cyan(`  ${packageManager} ${chalk.bold.white(`run dev`)}`));
  console.log();
  console.log(chalk.white.bold(`Thank you for using create-next-quick!`));
  console.log();
})().catch((error) => {
  console.error(chalk.bold.red(`\nAn unexpected error occurred: ${error.message}`));
  if (projectPath && fs.existsSync(projectPath)) {
    console.error(chalk.yellow(`Cleaning up incomplete project directory: ${projectPath}`));
    deleteFolder(projectPath);
  }
  process.exit(1);
});
