#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
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

    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Enter project name:",
            filter: (input) => input.trim() === '' ? '.' : input.trim(),
            validate: (input) => {
                if (input !== input.toLowerCase()) {
                    return "Project name must be in lowercase.";
                }
                if (input === ".") {
                    const files = fs.readdirSync(process.cwd());
                    if (files.length > 0) {
                        return "The current directory is not empty. Please use a different project name.";
                    }
                } else {
                    if (fs.existsSync(input)) {
                        return `A directory named "${input}" already exists. Please use a different project name.`;
                    }
                }
                return true;
            }
        },
        {
            type: "list",
            name: "packageManager",
            message: "Choose a package manager:",
            choices: availablePackageManagers,
            default: "pnpm"
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
            message: "Enter the names of the pages you want to create (comma-separated, default: none):",
            default: "",
            filter: (input) => input.split(',').map((page) => page.trim()).filter(page => page !== '')
        },
        {
            type: "list",
            name: "linter",
            message: "Choose a linter (default: none):",
            choices: ["none", "eslint", "biome"],
            default: "none"
        },
        {
            type: "list",
            name: "orm",
            message: "Choose an ORM (default: none):",
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

    const { projectName, packageManager, useTypeScript, useTailwind, useAppDir, useSrcDir, pages, linter, orm, useShadcn } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`Creating ${projectName}...`);

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

    run(command);

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

    createLayout(projectPath, projectName, useTypeScript, useAppDir, useSrcDir);

    const pagesPath = useAppDir ? (useSrcDir ? path.join(projectPath, "src", "app") : path.join(projectPath, "app")) : (useSrcDir ? path.join(projectPath, "src", "pages") : path.join(projectPath, "pages"));
    createPages(pagesPath, pages, useTypeScript, useAppDir, useSrcDir);

    const faviconPathInAppOrSrc = useAppDir ? (useSrcDir ? path.join(projectPath, "src", "app", "favicon.ico") : path.join(projectPath, "app", "favicon.ico")) : (useSrcDir ? path.join(projectPath, "src", "favicon.ico") : path.join(projectPath, "favicon.ico"));
    if (fileExists(faviconPathInAppOrSrc)) {
        deleteFile(faviconPathInAppOrSrc);
    }

    let defaultPagePath;
    if (useAppDir) {
        defaultPagePath = useSrcDir ? path.join(projectPath, "src", "app", useTypeScript ? "page.tsx" : "page.js") : path.join(projectPath, "app", useTypeScript ? "page.tsx" : "page.js");
    } else {
        defaultPagePath = useSrcDir ? path.join(projectPath, "src", "pages", useTypeScript ? "index.tsx" : "index.js") : path.join(projectPath, "pages", useTypeScript ? "index.tsx" : "index.js");
    }
    const emptyPageContent =
        `export default function Page() {
  return (
    <></>
  );
}
`;
    writeFile(defaultPagePath, emptyPageContent);

    const readmePath = path.join(projectPath, "README.md");
    writeFile(readmePath, `# ${projectName}`);

    if (linter === "biome") {
        run(`${packageManager} install --save-dev @biomejs/biome`, projectPath);
        run(`npx @biomejs/biome init`, projectPath);
    }

    if (orm === "prisma") {
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

export default prisma;
`;
        writeFile(path.join(prismaLibDir, "prisma.ts"), prismaContent);
    }

    if (orm === "drizzle") {
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
} satisfies Config;
`;
        writeFile(path.join(projectPath, "drizzle.config.ts"), drizzleConfigContent);

        const dbDir = useSrcDir ? path.join(projectPath, "src", "db") : path.join(projectPath, "db");
        createFolder(dbDir);

        const schemaContent = `import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});
`;
        writeFile(path.join(dbDir, "schema.ts"), schemaContent);
    }

    if (useShadcn) {
        run(`${packageManager} install --save-dev tailwindcss-animate class-variance-authority`, projectPath);
        run(`npx --yes shadcn@latest init -d`, projectPath);
        const componentsJsonPath = path.join(projectPath, "components.json");
        const componentsJsonContent = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": useAppDir,
            "tsx": useTypeScript,
            "tailwind": {
                "config": useTypeScript ? "tailwind.config.ts" : "tailwind.config.js",
                "css": useAppDir ? (useSrcDir ? "src/app/globals.css" : "app/globals.css") : (useSrcDir ? "src/styles/globals.css" : "styles/globals.css"),
                "baseColor": "slate",
                "cssVariables": true
            },
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils"
            }
        };
        writeFile(componentsJsonPath, JSON.stringify(componentsJsonContent, null, 2));
    }

    if (orm !== "none") {
        const envContent = `DATABASE_URL="your_db_url"`;
        writeFile(path.join(projectPath, ".env"), envContent);
    }

    console.log("Setup complete!");
    console.log(`
Thankyou for using create-next-quick!
Next steps:
cd ${projectName}
${packageManager} run dev`);
})();
