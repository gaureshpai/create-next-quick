import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { deleteFolder, readFile } from "../lib/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.join(__dirname, "..", "index.js");

describe("create-next-quick interactive mode", function () {
  this.timeout(300000);

  let currentProjectName;
  let currentProjectPath;

  beforeEach((done) => {
    currentProjectName = `test-interactive-project-${Date.now()}`;
    currentProjectPath = path.join(process.cwd(), currentProjectName);

    const command = `npx create-next-app@latest ${currentProjectName} --ts --tailwind --src-dir --app --use-npm --yes`;
    const child = spawn(command, { shell: true, stdio: "inherit" });

    child.on("close", (code) => {
      assert.strictEqual(code, 0, "create-next-app should exit with code 0");
      done();
    });
  });

  afterEach(() => {
    try {
      deleteFolder(currentProjectPath);
    } catch (error) {
      console.error(`Failed to cleanup project directory: ${currentProjectPath}`, error);
    }
  });

  it("should add a new page in interactive mode", (done) => {
    const answers = ["about", "", "", "n"];

    const child = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });
    let i = 0;
    const interval = setInterval(() => {
      if (i < answers.length) {
        child.stdin.write(`${answers[i]}\n`);
        i++;
      } else {
        clearInterval(interval);
        child.stdin.end();
      }
    }, 8000);

    child.on("close", (code) => {
      assert.strictEqual(code, 0, "CLI should exit with code 0");

      const newPagePath = path.join(currentProjectPath, "src", "app", "about", "page.tsx");
      assert.ok(fs.existsSync(newPagePath), "New page should be created");

      done();
    });
  });

  it("should add biome linter in interactive mode", (done) => {
    const answers = ["", "\x1b[B\x1b[B", "", "n"]; // Choose biome (2 down from none)

    const child = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });

    let i = 0;
    const interval = setInterval(() => {
      if (i < answers.length) {
        child.stdin.write(`${answers[i]}\n`);
        i++;
      } else {
        clearInterval(interval);
        child.stdin.end();
      }
    }, 8000);

    child.on("close", (code) => {
      assert.strictEqual(code, 0, "CLI should exit with code 0");

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, "package.json")));
      assert.ok(
        packageJson.devDependencies["@biomejs/biome"],
        "Biome should be in devDependencies",
      );
      assert.ok(
        fs.existsSync(path.join(currentProjectPath, "biome.json")),
        "biome.json should be created",
      );

      done();
    });
  });

  it("should add prisma orm in interactive mode", (done) => {
    const answers = ["", "", "\x1b[B", "n"]; // Choose prisma (1 down from none)

    const child = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });

    let i = 0;
    const interval = setInterval(() => {
      if (i < answers.length) {
        child.stdin.write(`${answers[i]}\n`);
        i++;
      } else {
        clearInterval(interval);
        child.stdin.end();
      }
    }, 8000);

    child.on("close", (code) => {
      assert.strictEqual(code, 0, "CLI should exit with code 0");

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, "package.json")));
      assert.ok(packageJson.devDependencies.prisma, "Prisma should be in devDependencies");
      assert.ok(
        packageJson.dependencies["@prisma/client"],
        "Prisma client should be in dependencies",
      );
      assert.ok(
        fs.existsSync(path.join(currentProjectPath, "prisma", "schema.prisma")),
        "prisma/schema.prisma should be created",
      );

      done();
    });
  });

  it("should add shadcn ui in interactive mode", (done) => {
    const answers = ["", "", "", "y"];

    const child = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });

    let i = 0;
    const interval = setInterval(() => {
      if (i < answers.length) {
        child.stdin.write(`${answers[i]}\n`);
        i++;
      } else {
        clearInterval(interval);
        child.stdin.end();
      }
    }, 8000);

    child.on("close", (code) => {
      assert.strictEqual(code, 0, "CLI should exit with code 0");

      const packageJson = JSON.parse(readFile(path.join(currentProjectPath, "package.json")));
      assert.ok(
        packageJson.devDependencies["tailwindcss-animate"],
        "tailwindcss-animate should be in devDependencies",
      );
      assert.ok(
        packageJson.devDependencies["class-variance-authority"],
        "class-variance-authority should be in devDependencies",
      );
      assert.ok(
        fs.existsSync(path.join(currentProjectPath, "components.json")),
        "components.json should be created",
      );

      done();
    });
  });

  it("should skip installation if feature already exists", (done) => {
    const firstRunAnswers = ["", "\x1b[B\x1b[B", "", "n"];

    const firstRun = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });

    let i = 0;
    const firstInterval = setInterval(() => {
      if (i < firstRunAnswers.length) {
        firstRun.stdin.write(`${firstRunAnswers[i]}\n`);
        i++;
      } else {
        clearInterval(firstInterval);
        firstRun.stdin.end();
      }
    }, 8000);

    firstRun.on("close", (code) => {
      assert.strictEqual(code, 0, "First run should exit with code 0");

      const secondRunAnswers = ["", "\x1b[B\x1b[B", "", "n"];

      const secondRun = spawn("node", [cliPath, "-i"], { cwd: currentProjectPath });
      let stdout = "";

      secondRun.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      let j = 0;
      const secondInterval = setInterval(() => {
        if (j < secondRunAnswers.length) {
          secondRun.stdin.write(`${secondRunAnswers[j]}\n`);
          j++;
        } else {
          clearInterval(secondInterval);
          secondRun.stdin.end();
        }
      }, 8000);

      secondRun.on("close", (secondCode) => {
        assert.strictEqual(secondCode, 0, "Second run should exit with code 0");
        assert.ok(
          stdout.includes("Biome is already installed. Skipping setup."),
          'Should show "already installed" message',
        );
        done();
      });
    });
  });
});
