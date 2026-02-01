import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { deleteFolder } from "../lib/utils.js";
import { testCases } from "./test-cases.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, "..", "index.js");

describe("create-next-quick", function () {
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

  /**
   * Maps a desired boolean value to the appropriate confirm prompt answer string.
   * For confirm prompts:
   * - If desiredValue matches defaultValue: return "" (press Enter to accept default)
   * - If desiredValue is true and defaultValue is false: return "y"
   * - If desiredValue is false and defaultValue is true: return "n"
   */
  const mapConfirmAnswer = (desiredValue, defaultValue) => {
    if (desiredValue === defaultValue) {
      return "";
    }
    return desiredValue ? "y" : "n";
  };

  const runTest = (answers, assertions, done) => {
    deleteFolder(currentProjectPath);
    const child = spawn("node", [cliPath]);
    let _stdout = "";
    let _stderr = "";
    let interval = null;

    child.stdout.on("data", (data) => {
      console.log(data.toString());
      _stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      console.error(data.toString());
      _stderr += data.toString();
    });

    // Error handler for child process
    child.on("error", (err) => {
      if (interval) clearInterval(interval);
      console.error("Child process error:", err);
      done(err);
    });

    // Error handler for stdin
    child.stdin.on("error", (err) => {
      if (interval) clearInterval(interval);
      console.error("Child stdin error:", err);
    });

    let i = 0;
    interval = setInterval(() => {
      if (i < answers.length) {
        // Check if child is still alive and stdin is writable
        if (!child.killed && child.stdin && child.stdin.writable) {
          try {
            child.stdin.write(`${answers[i]}\n`);
            i++;
          } catch (err) {
            console.error("Error writing to stdin:", err);
            clearInterval(interval);
          }
        } else {
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
        child.stdin?.end();
      }
    }, 3000);

    child.on("close", (code) => {
      if (interval) clearInterval(interval);
      if (code !== 0) {
        console.log("Full stdout:", _stdout);
        console.error("Full stderr:", _stderr);
      }
      assert.strictEqual(code, 0, "CLI should exit with code 0");
      assertions();
      done();
    });

    child.on("exit", () => {
      if (interval) clearInterval(interval);
    });
  };

  testCases.forEach((testCase) => {
    it(testCase.description, (done) => {
      const answers = [
        currentProjectName,
        "", // Package manager (default variables)
        mapConfirmAnswer(testCase.options.useTypeScript, true),
        mapConfirmAnswer(testCase.options.useTailwind, true),
        mapConfirmAnswer(testCase.options.useSrcDir, true),
        mapConfirmAnswer(testCase.options.useAppDir, true),
        testCase.options.pages,
        testCase.options.linter === "none"
          ? ""
          : testCase.options.linter === "eslint"
            ? "\u001b[B"
            : "\u001b[B\u001b[B", // Linter: none (default), eslint (1 down), biome (2 down)
        testCase.options.orm === "none"
          ? ""
          : testCase.options.orm === "prisma"
            ? "\u001b[B"
            : "\u001b[B\u001b[B", // ORM: none (default), prisma (1 down), drizzle (2 down)
        mapConfirmAnswer(testCase.options.useShadcn, true),
        testCase.options.testing === "none"
          ? ""
          : testCase.options.testing === "vitest"
            ? "\u001b[B"
            : "\u001b[B\u001b[B", // testing
        testCase.options.auth === "none"
          ? ""
          : testCase.options.auth === "next-auth"
            ? "\u001b[B"
            : testCase.options.auth === "clerk"
              ? "\u001b[B\u001b[B"
              : "\u001b[B\u001b[B\u001b[B", // auth
        mapConfirmAnswer(testCase.options.docker, false),
      ];

      const assertions = () => {
        assert.ok(fs.existsSync(currentProjectPath), "Project directory should exist");
        testCase.assertions(currentProjectPath);
      };

      runTest(answers, assertions, done);
    });
  });
});
