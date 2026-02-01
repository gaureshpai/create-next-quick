#!/usr/bin/env node
import inquirer from "./lib/prompts.js";
import path from "node:path";
import fs from "node:fs";
import chalk from "./lib/colors.js";
import { run, deleteFolder, createFolder, deleteFile, fileExists, writeFile } from "./lib/utils.js";
import { createPages, createLayout } from "./lib/templates.js";

const MIN_NODE_VERSION = 20;
const currentNodeVersion = process.versions.node;

if (parseInt(currentNodeVersion.split(".")[0], 10) < MIN_NODE_VERSION) {
  console.error(
    chalk.red.bold(
      `\nError: create-next-quick requires Node.js version ${MIN_NODE_VERSION} or higher.`,
    ),
  );
  console.error(chalk.red.bold(`You are currently using Node.js ${currentNodeVersion}.`));
  console.error(chalk.red.bold(`Please upgrade your Node.js version to proceed.`));
  process.exit(1);
}

const args = process.argv.slice(2);
const isInteractiveMode = args.includes("-i") || args.includes("--interactive");
const appName = args.find((arg) => !arg.startsWith("-"));

if (isInteractiveMode && appName) {
  console.error(
    chalk.red.bold("Error: Project name should not be provided in interactive mode (-i)."),
  );
  console.error(chalk.red.bold("Please run the command in the project's root directory."));
  process.exit(1);
}

let projectPath = null;
let createdProjectDir = false;

(async () => {
  const availablePackageManagers = ["npm"];

  const yarnCheck = await run("yarn --version", process.cwd(), true);
  if (yarnCheck.success) {
    availablePackageManagers.push("yarn");
  }

  const pnpmCheck = await run("pnpm --version", process.cwd(), true);
  if (pnpmCheck.success) {
    availablePackageManagers.push("pnpm");
  }

  const validateProjectName = (input) => {
    if (input !== input.toLowerCase()) {
      return chalk.red.bold("Project name must be in lowercase.");
    }
    if (input === ".") {
      if (!isInteractiveMode) {
        const files = fs.readdirSync(process.cwd());
        if (files.length > 0) {
          return chalk.red.bold(
            "The current directory is not empty. Please use a different project name.",
          );
        }
      }
    } else {
      if (fs.existsSync(input)) {
        return chalk.red.bold(
          `A directory named "${chalk.white(input)}" already exists. Please use a different project name.`,
        );
      }
    }
    return true;
  };

  const answers = {};

  console.log();
  console.log(chalk.bold.cyan("╔═══════════════════════════════════════════╗"));
  console.log(
    chalk.bold.cyan("║") +
      chalk.bold.white("    🚀 Create Next Quick CLI Tool         ") +
      chalk.bold.cyan(" ║"),
  );
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════════╝"));
  console.log();

  if (isInteractiveMode) {
    answers.projectName = ".";
    console.log(
      chalk.bold.cyan("Running in interactive configuration mode on the current project."),
    );

    answers.useTypeScript = fileExists(path.join(process.cwd(), "tsconfig.json"));
    answers.useSrcDir = fileExists(path.join(process.cwd(), "src"));
    answers.useAppDir =
      fileExists(path.join(process.cwd(), "app")) ||
      (answers.useSrcDir && fileExists(path.join(process.cwd(), "src", "app")));
    if (fileExists(path.join(process.cwd(), "yarn.lock"))) {
      answers.packageManager = "yarn";
    } else if (fileExists(path.join(process.cwd(), "pnpm-lock.yaml"))) {
      answers.packageManager = "pnpm";
    } else {
      answers.packageManager = "npm";
    }
    let useTailwind = false;
    try {
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (fileExists(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        useTailwind =
          packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss;
      }
    } catch (_error) {}
    answers.useTailwind = useTailwind;

    console.log(chalk.bold("Detected project configuration:"));
    console.log(`  - TypeScript: ${answers.useTypeScript ? chalk.green("Yes") : chalk.red("No")}`);
    console.log(`  - src directory: ${answers.useSrcDir ? chalk.green("Yes") : chalk.red("No")}`);
    console.log(`  - App directory: ${answers.useAppDir ? chalk.green("Yes") : chalk.red("No")}`);
    console.log(`  - Tailwind CSS: ${answers.useTailwind ? chalk.green("Yes") : chalk.red("No")}`);
    console.log(`  - Package manager: ${chalk.cyan(answers.packageManager)}`);
    console.log();

    const interactiveAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "pages",
        message: "Enter pages to create (comma-separated, default: none):",
        default: "",
        filter: (input) =>
          input
            .split(",")
            .map((page) => page.trim())
            .filter((page) => page !== ""),
      },
      {
        type: "list",
        name: "linter",
        message: "Choose a linter to add:",
        choices: ["none", "eslint", "biome"],
        default: "none",
      },
      {
        type: "list",
        name: "orm",
        message: "Choose an ORM to add:",
        choices: ["none", "prisma", "drizzle"],
        default: "none",
      },
      {
        type: "confirm",
        name: "useShadcn",
        message: "Do you want to add Shadcn UI?",
        default: false,
      },
      {
        type: "list",
        name: "testing",
        message: "Choose a testing framework:",
        choices: ["none", "vitest", "jest"],
        default: "none",
      },
      {
        type: "list",
        name: "auth",
        message: "Choose an authentication solution:",
        choices: ["none", "next-auth", "clerk", "lucia"],
        default: "none",
      },
      {
        type: "confirm",
        name: "docker",
        message: "Do you want to add Docker support?",
        default: false,
      },
    ]);
    Object.assign(answers, interactiveAnswers);
  } else {
    if (appName) {
      const validationResult = validateProjectName(appName);
      if (validationResult !== true) {
        console.error(validationResult);
        process.exit(1);
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
          filter: (input) => (input.trim() === "" ? "." : input.trim()),
          validate: validateProjectName,
        },
      ]);
      answers.projectName = appNameAnswers.projectName;
    }

    const otherAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Choose a package manager:",
        choices: availablePackageManagers,
        default: availablePackageManagers.includes("pnpm")
          ? "pnpm"
          : availablePackageManagers.includes("yarn")
            ? "yarn"
            : "npm",
      },
      {
        type: "confirm",
        name: "useTypeScript",
        message: "Do you want to use TypeScript? (default: Yes)",
        default: true,
      },
      {
        type: "confirm",
        name: "useTailwind",
        message: "Do you want to use Tailwind CSS? (default: Yes)",
        default: true,
      },
      {
        type: "confirm",
        name: "useSrcDir",
        message: "Do you want to use src directory? (default: Yes)",
        default: true,
      },
      {
        type: "confirm",
        name: "useAppDir",
        message: "Do you want to use the app directory? (default: Yes)",
        default: true,
      },
      {
        type: "input",
        name: "pages",
        message: "Enter pages (comma-separated, default: none):",
        default: "",
        filter: (input) =>
          input
            .split(",")
            .map((page) => page.trim())
            .filter((page) => page !== ""),
      },
      {
        type: "list",
        name: "linter",
        message: "Choose a linter:",
        choices: ["none", "eslint", "biome"],
        default: "none",
      },
      {
        type: "list",
        name: "orm",
        message: "Choose an ORM:",
        choices: ["none", "prisma", "drizzle"],
        default: "none",
      },
      {
        type: "confirm",
        name: "useShadcn",
        message: "Do you want to use Shadcn UI? (default: Yes)",
        default: true,
      },
      {
        type: "list",
        name: "testing",
        message: "Choose a testing framework:",
        choices: ["none", "vitest", "jest"],
        default: "none",
      },
      {
        type: "list",
        name: "auth",
        message: "Choose an authentication solution:",
        choices: ["none", "next-auth", "clerk", "lucia"],
        default: "none",
      },
      {
        type: "confirm",
        name: "docker",
        message: "Do you want to add Docker support?",
        default: false,
      },
    ]);

    Object.assign(answers, otherAnswers);
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
    testing,
    auth,
    docker,
  } = answers;

  const displayName = projectName === "." ? path.basename(process.cwd()) : projectName;
  createdProjectDir = false;
  if (projectName === ".") {
    projectPath = process.cwd();
  } else {
    projectPath = path.join(process.cwd(), projectName);
    // Track if we are creating the directory
    if (!fs.existsSync(projectPath)) {
      createdProjectDir = true;
    }
  }

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white(`  Creating project: ${chalk.cyan(projectName)}`));
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log();

  if (!isInteractiveMode) {
    let command = `npx --yes create-next-app@latest ${projectName} --use-${packageManager} --yes --import-alias "@/*"`;
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

    const installResult = await run(command, process.cwd(), false, 3, 2000);

    if (!installResult.success) {
      console.error(chalk.bold.red("Failed to install dependencies."));
      if (installResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(installResult.stderr));
      }
      console.error(chalk.yellow("Troubleshooting tips:"));
      console.error(chalk.yellow("  - Check your internet connection."));
      console.error(
        chalk.yellow(
          "  - Ensure your package manager (npm, yarn, or pnpm) is installed and up to date.",
        ),
      );
      console.error(chalk.yellow("  - Try running the command again."));
      throw new Error("Dependency installation failed.");
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
  }

  if (!isInteractiveMode) {
    console.log(chalk.magenta("Creating layout files..."));
    createLayout(projectPath, displayName, useTypeScript, useAppDir, useSrcDir);
  }

  const pagesPath = useAppDir
    ? useSrcDir
      ? path.join(projectPath, "src", "app")
      : path.join(projectPath, "app")
    : useSrcDir
      ? path.join(projectPath, "src", "pages")
      : path.join(projectPath, "pages");

  if (pages && pages.length > 0) {
    console.log(chalk.magenta("Creating pages..."));
    createPages(pagesPath, pages, useTypeScript, useAppDir, useSrcDir);
  } else {
    if (isInteractiveMode) {
      console.log(chalk.yellow("No pages specified to create."));
    }
  }

  if (!isInteractiveMode) {
    const faviconPathInAppOrSrc = useAppDir
      ? useSrcDir
        ? path.join(projectPath, "src", "app", "favicon.ico")
        : path.join(projectPath, "app", "favicon.ico")
      : useSrcDir
        ? path.join(projectPath, "src", "favicon.ico")
        : path.join(projectPath, "favicon.ico");

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
  }

  const readmePath = path.join(projectPath, "README.md");
  writeFile(readmePath, `# ${displayName}`);

  if (useTypeScript) {
    let globalCssPath;
    if (useAppDir) {
      globalCssPath = useSrcDir
        ? path.join(projectPath, "src", "app")
        : path.join(projectPath, "app");
    } else {
      globalCssPath = useSrcDir
        ? path.join(projectPath, "src", "styles")
        : path.join(projectPath, "styles");
    }
    const globalDtsPath = path.join(globalCssPath, "global.d.ts");
    const globalDtsContent = `declare module '*.css' {\n  interface CSSModule {\n    [className: string]: string\n  }\n  const cssModule: CSSModule\n  export default cssModule\n}`;
    writeFile(globalDtsPath, globalDtsContent);
  }

  console.log(chalk.bold.green("Layout and pages created"));

  if (linter === "biome") {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (
      packageJson.dependencies?.["@biomejs/biome"] ||
      packageJson.devDependencies?.["@biomejs/biome"]
    ) {
      console.log(chalk.yellow("Biome is already installed. Skipping setup."));
    } else {
      console.log(chalk.blue("Setting up Biome linter..."));

      const biomeInstallResult = await run(
        `${packageManager} install --save-dev @biomejs/biome`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!biomeInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Biome dependencies."));
        if (biomeInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(biomeInstallResult.stderr));
        }
        throw new Error("Biome installation failed.");
      }

      const biomeInitResult = await run(`npx @biomejs/biome init`, projectPath, false, 3, 2000);
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
  }

  if (orm === "prisma") {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.dependencies?.prisma || packageJson.devDependencies?.prisma) {
      console.log(chalk.yellow("Prisma is already installed. Skipping setup."));
    } else {
      console.log(chalk.blue("Setting up Prisma ORM..."));

      const prismaInstallDevResult = await run(
        `${packageManager} install --save-dev prisma`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!prismaInstallDevResult.success) {
        console.error(chalk.bold.red("Failed to install Prisma dev dependencies."));
        if (prismaInstallDevResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(prismaInstallDevResult.stderr));
        }
        throw new Error("Prisma dev dependency installation failed.");
      }

      const prismaInstallClientResult = await run(
        `${packageManager} install @prisma/client`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!prismaInstallClientResult.success) {
        console.error(chalk.bold.red("Failed to install Prisma client dependencies."));
        if (prismaInstallClientResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(prismaInstallClientResult.stderr));
        }
        throw new Error("Prisma client dependency installation failed.");
      }

      const prismaInitResult = await run(`npx prisma init`, projectPath, false, 3, 2000);
      if (!prismaInitResult.success) {
        console.error(chalk.bold.red("Failed to initialize Prisma."));
        if (prismaInitResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(prismaInitResult.stderr));
        }
        throw new Error("Prisma initialization failed.");
      }

      const prismaGenerateResult = await run(`npx prisma generate`, projectPath, false, 3, 2000);
      if (!prismaGenerateResult.success) {
        console.error(chalk.bold.red("Failed to generate Prisma client."));
        if (prismaGenerateResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(prismaGenerateResult.stderr));
        }
        // We don't throw here, as it might just need a schema definition first, but it's good practice to try.
        console.warn(
          chalk.yellow(
            "Prisma generate failed, likely due to empty schema. You may need to run 'npx prisma generate' after defining your models.",
          ),
        );
      }

      const prismaLibDir = useSrcDir
        ? path.join(projectPath, "src", "lib")
        : path.join(projectPath, "lib");
      createFolder(prismaLibDir);

      const prismaContent = useTypeScript
        ? `import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
`
        : `import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
`;

      const prismaFileName = useTypeScript ? "prisma.ts" : "prisma.js";
      writeFile(path.join(prismaLibDir, prismaFileName), prismaContent);

      console.log(chalk.bold.green("Prisma ORM configured"));
    }
  }

  if (orm === "drizzle") {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (packageJson.dependencies?.["drizzle-orm"] || packageJson.devDependencies?.["drizzle-orm"]) {
      console.log(chalk.yellow("Drizzle is already installed. Skipping setup."));
    } else {
      console.log(chalk.blue("Setting up Drizzle ORM..."));

      const drizzleInstallResult = await run(
        `${packageManager} install drizzle-orm @vercel/postgres`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!drizzleInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Drizzle ORM dependencies."));
        if (drizzleInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(drizzleInstallResult.stderr));
        }
        throw new Error("Drizzle ORM dependency installation failed.");
      }
      const drizzleKitInstallResult = await run(
        `${packageManager} install --save-dev drizzle-kit`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!drizzleKitInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Drizzle Kit dev dependencies."));
        if (drizzleKitInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(drizzleKitInstallResult.stderr));
        }
        throw new Error("Drizzle Kit dev dependency installation failed.");
      }

      const schemaExt = useTypeScript ? ".ts" : ".js";
      const schemaPath = useSrcDir ? `./src/db/schema${schemaExt}` : `./db/schema${schemaExt}`;

      const drizzleConfigContent = useTypeScript
        ? `import type { Config } from 'drizzle-kit';

export default {
  schema: '${schemaPath}',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;`
        : `/** @type {import('drizzle-kit').Config} */
export default {
  schema: '${schemaPath}',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};`;
      const drizzleConfigFile = useTypeScript ? "drizzle.config.ts" : "drizzle.config.js";
      writeFile(path.join(projectPath, drizzleConfigFile), drizzleConfigContent);

      const dbDir = useSrcDir ? path.join(projectPath, "src", "db") : path.join(projectPath, "db");
      createFolder(dbDir);

      const schemaContent = `import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});`;
      const schemaFile = useTypeScript ? "schema.ts" : "schema.js";
      writeFile(path.join(dbDir, schemaFile), schemaContent);

      console.log(chalk.bold.green("Drizzle ORM configured"));
    }
  }

  if (useShadcn) {
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    if (
      packageJson.dependencies?.["tailwindcss-animate"] ||
      packageJson.devDependencies?.["tailwindcss-animate"]
    ) {
      console.log(chalk.yellow("Shadcn UI seems to be already installed. Skipping setup."));
    } else {
      console.log(chalk.magenta("Setting up Shadcn UI..."));

      const cvaInstallResult = await run(
        `${packageManager} install class-variance-authority`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!cvaInstallResult.success) {
        console.error(chalk.bold.red("Failed to install class-variance-authority."));
        throw new Error("class-variance-authority installation failed.");
      }

      const shadcnInstallResult = await run(
        `${packageManager} install --save-dev tailwindcss-animate`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!shadcnInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Shadcn UI dependencies."));
        if (shadcnInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(shadcnInstallResult.stderr));
        }
        throw new Error("Shadcn UI dependency installation failed.");
      }

      const shadcnInitResult = await run(
        `npx shadcn@latest init --yes`,
        projectPath,
        false,
        3,
        2000,
      );
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
        style: "default",
        rsc: useAppDir,
        tsx: useTypeScript,
        tailwind: {
          config: useTypeScript ? "tailwind.config.ts" : "tailwind.config.js",
          css: useAppDir
            ? useSrcDir
              ? "src/app/globals.css"
              : "app/globals.css"
            : useSrcDir
              ? "src/styles/globals.css"
              : "styles/globals.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          utils: "@/lib/utils",
        },
      };

      const mergedComponentsJsonContent = Object.assign(
        {},
        existingComponentsJson,
        customComponentsJsonContent,
      );
      writeFile(componentsJsonPath, JSON.stringify(mergedComponentsJsonContent, null, 2));

      console.log(chalk.bold.green("Shadcn UI configured"));
    }
  }

  if (orm !== "none") {
    const envPath = path.join(projectPath, ".env");
    const dbUrlLine = `DATABASE_URL="your_db_url"`;

    if (fs.existsSync(envPath)) {
      const existingEnv = fs.readFileSync(envPath, "utf8");
      if (!existingEnv.includes("DATABASE_URL")) {
        fs.appendFileSync(envPath, `\n${dbUrlLine}\n`);
      } else {
        console.warn(chalk.yellow("DATABASE_URL already exists in .env, skipping append."));
      }
    } else {
      writeFile(envPath, dbUrlLine);
    }
  }

  // Docker Setup
  if (docker) {
    console.log(chalk.blue("Setting up Docker..."));
    const dockerfileContent = `# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \\
  if [ -f yarn.lock ]; then yarn run build; \\
  elif [ -f package-lock.json ]; then npm run build; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
`;
    writeFile(path.join(projectPath, "Dockerfile"), dockerfileContent);

    const dockerIgnoreContent = `Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
`;
    writeFile(path.join(projectPath, ".dockerignore"), dockerIgnoreContent);

    // Update next.config.mjs to enable standalone output
    const nextConfigPath = path.join(projectPath, "next.config.mjs");
    if (fileExists(nextConfigPath)) {
      let nextConfig = fs.readFileSync(nextConfigPath, "utf8");
      if (!nextConfig.includes('output: "standalone"')) {
        if (nextConfig.includes("nextConfig = {")) {
          nextConfig = nextConfig.replace(
            "nextConfig = {",
            'nextConfig = {\n  output: "standalone",',
          );
        } else {
          // Fallback for simple configs, though create-next-app usually gives the above
          console.warn(
            chalk.yellow(
              "Could not automatically update next.config.mjs for standalone output. Please add 'output: \"standalone\"' manually.",
            ),
          );
        }
        writeFile(nextConfigPath, nextConfig);
      }
    }
    console.log(chalk.bold.green("Docker configured"));
  }

  // Testing Setup
  if (testing === "vitest") {
    console.log(chalk.blue("Setting up Vitest..."));
    const deps = [
      "vitest",
      "@vitejs/plugin-react",
      "jsdom",
      "@testing-library/react",
      "@testing-library/dom",
    ];
    const installCmd = `${packageManager} install --save-dev ${deps.join(" ")}`;
    const vitestInstallResult = await run(installCmd, projectPath, false, 3, 2000);
    if (!vitestInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Vitest dependencies."));
      if (vitestInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(vitestInstallResult.stderr));
      }
      throw new Error("Vitest dependency installation failed.");
    }

    const vitestConfigContent = `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
 
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.${useTypeScript ? "ts" : "js"}',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '${useSrcDir ? "./src" : "."}')
    },
  },
})`;
    writeFile(
      path.join(projectPath, useTypeScript ? "vitest.config.ts" : "vitest.config.js"),
      vitestConfigContent,
    );
    writeFile(
      path.join(projectPath, useTypeScript ? "vitest.setup.ts" : "vitest.setup.js"),
      "import '@testing-library/jest-dom'",
    );

    // Update package.json scripts
    const pkgPath = path.join(projectPath, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.scripts.test = "vitest";
    writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    console.log(chalk.bold.green("Vitest configured"));
  } else if (testing === "jest") {
    console.log(chalk.blue("Setting up Jest..."));
    const deps = [
      "jest",
      "jest-environment-jsdom",
      "@testing-library/react",
      "@testing-library/jest-dom",
    ];
    if (useTypeScript) {
      deps.push("@types/jest", "ts-node");
    }
    const jestInstallResult = await run(
      `${packageManager} install --save-dev ${deps.join(" ")}`,
      projectPath,
      false,
      3,
      2000,
    );
    if (!jestInstallResult.success) {
      console.error(chalk.bold.red("Failed to install Jest dependencies."));
      if (jestInstallResult.stderr) {
        console.error(chalk.red("Error details:"));
        console.error(chalk.red(jestInstallResult.stderr));
      }
      throw new Error("Jest dependency installation failed.");
    }

    // Skip interactive init, write config manually
    const jestConfig = `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)`;

    writeFile(path.join(projectPath, "jest.config.js"), jestConfig);
    writeFile(path.join(projectPath, "jest.setup.js"), "import '@testing-library/jest-dom'");

    const pkgPath = path.join(projectPath, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.scripts.test = "jest";
    writeFile(pkgPath, JSON.stringify(pkg, null, 2));

    console.log(chalk.bold.green("Jest configured"));
  }

  // Auth Setup
  if (auth !== "none") {
    console.log(chalk.blue(`Setting up Authentication (${auth})...`));
    if (auth === "next-auth") {
      const nextAuthInstallResult = await run(
        `${packageManager} install next-auth@beta`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!nextAuthInstallResult.success) {
        console.error(chalk.bold.red("Failed to install NextAuth.js."));
        if (nextAuthInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(nextAuthInstallResult.stderr));
        }
        throw new Error("NextAuth.js installation failed.");
      }
      const authContent = `import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null
 
        // logic to verify if user exists
        user = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com'
        }
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // return null - this is where you could throw an error
          throw new Error("Invalid credentials.")
        }
 
        // return user object with their profile data
        return user
      },
    }),
  ],
})`;
      const libDir = useSrcDir
        ? path.join(projectPath, "src", "lib")
        : path.join(projectPath, "lib");
      if (!fs.existsSync(libDir)) createFolder(libDir);
      writeFile(path.join(libDir, useTypeScript ? "auth.ts" : "auth.js"), authContent);

      const middlewareContent = `import { auth } from "@/lib/auth"
 
export default auth((req) => {
  // req.auth
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}`;
      const middlewarePath = useSrcDir
        ? path.join(projectPath, "src", useTypeScript ? "middleware.ts" : "middleware.js")
        : path.join(projectPath, useTypeScript ? "middleware.ts" : "middleware.js");
      writeFile(middlewarePath, middlewareContent);

      const routePath = useSrcDir
        ? path.join(projectPath, "src", "app", "api", "auth", "[...nextauth]")
        : path.join(projectPath, "app", "api", "auth", "[...nextauth]");
      createFolder(routePath);

      const routeContent = `import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers`;
      writeFile(path.join(routePath, useTypeScript ? "route.ts" : "route.js"), routeContent);
    } else if (auth === "clerk") {
      const clerkInstallResult = await run(
        `${packageManager} install @clerk/nextjs`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!clerkInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Clerk."));
        if (clerkInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(clerkInstallResult.stderr));
        }
        throw new Error("Clerk installation failed.");
      }

      const middlewareContent = `import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};`;
      const middlewarePath = useSrcDir
        ? path.join(projectPath, "src", useTypeScript ? "middleware.ts" : "middleware.js")
        : path.join(projectPath, useTypeScript ? "middleware.ts" : "middleware.js");
      writeFile(middlewarePath, middlewareContent);

      console.log(chalk.yellow("\n⚠️  Action Required for Clerk:"));
      console.log(chalk.white("1. Creates an account at https://clerk.com"));
      console.log(
        chalk.white("2. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to your .env"),
      );
      console.log(chalk.white("3. Wrap your root layout with <ClerkProvider>"));
    } else if (auth === "lucia") {
      console.log(
        chalk.yellow("Lucia Auth requires a database adapter. Installing core package..."),
      );
      const luciaInstallResult = await run(
        `${packageManager} install lucia`,
        projectPath,
        false,
        3,
        2000,
      );
      if (!luciaInstallResult.success) {
        console.error(chalk.bold.red("Failed to install Lucia."));
        if (luciaInstallResult.stderr) {
          console.error(chalk.red("Error details:"));
          console.error(chalk.red(luciaInstallResult.stderr));
        }
        throw new Error("Lucia installation failed.");
      }
      console.log(
        chalk.yellow(
          "Please follow the docs to set up your specific adapter: https://lucia-auth.com/getting-started/",
        ),
      );
    }
    console.log(chalk.bold.green("Auth dependencies installed"));
  }

  console.log();
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log(chalk.bold.white("  Setup complete!"));
  console.log(chalk.bold.hex("#23f0bcff")("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
  console.log();
  console.log(chalk.bold.white("-> Next steps:"));
  if (projectName !== ".") {
    console.log(chalk.cyan(`  cd ${chalk.bold.white(projectName)}`));
  }
  console.log(chalk.cyan(`  ${packageManager} ${chalk.bold.white(`run dev`)}`));
  console.log();
  console.log(chalk.white.bold(`Thank you for using create-next-quick!`));
  console.log();
  inquirer.close();
  process.exit(0);
})().catch((error) => {
  console.error(chalk.bold.red(`\nAn unexpected error occurred: ${error.message}`));
  if (
    projectPath &&
    fs.existsSync(projectPath) &&
    createdProjectDir &&
    projectPath !== process.cwd()
  ) {
    console.error(chalk.yellow(`Cleaning up incomplete project directory: ${projectPath}`));
    deleteFolder(projectPath);
  } else {
    console.error(
      chalk.yellow(
        `Cleanup skipped or not needed (project directory not created by this process or is CWD).`,
      ),
    );
  }
  process.exit(1);
});
