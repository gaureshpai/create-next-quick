import { spawn } from "node:child_process";
import { strict as assert } from "node:assert";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { __testing as promptsTesting } from "../lib/prompts.js";
import { deleteFolder } from "../lib/utils.js";
import { testCases } from "./test-cases.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, "..", "..", "dist", "create-next-quick.js");
const repoRoot = path.join(__dirname, "..", "..");
const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[ -/]*[@-~]`, "g");

const stripAnsi = (value) => value.replace(ansiPattern, "");

const runPromptQuestion = (question, stdinInput = "\n") =>
  new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
          import prompts from "./src/lib/prompts.js";
          const question = JSON.parse(process.argv[1]);
          const result = await prompts.prompt([question]);
          prompts.close();
          console.log("RESULT=" + JSON.stringify(result));
        `,
        JSON.stringify(question),
      ],
      { cwd: repoRoot },
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Prompt runner exited with code ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`,
          ),
        );
        return;
      }

      const cleanOutput = stripAnsi(stdout);
      const resultLine = cleanOutput.split(/\r?\n/).find((line) => line.includes("RESULT="));

      if (!resultLine) {
        reject(new Error(`Prompt runner did not emit result.\nstdout:\n${cleanOutput}`));
        return;
      }

      resolve({
        output: cleanOutput,
        result: JSON.parse(resultLine.slice(resultLine.indexOf("RESULT=") + "RESULT=".length)),
      });
    });

    child.stdin.end(stdinInput);
  });

describe("prompt rendering", () => {
  it("counts wrapped confirm prompts as multiple terminal rows", () => {
    assert.strictEqual(
      promptsTesting.getRenderedRowCount(
        "? Do you want to use TypeScript? (default: Yes) (Y/n) ",
        20,
      ),
      3,
    );
  });

  it("includes typed confirm input in the rendered row count", () => {
    assert.strictEqual(promptsTesting.getRenderedRowCount("? Example prompt (Y/n) yes", 10), 3);
  });

  it("does not duplicate explicit confirm defaults in the rendered prompt", async () => {
    const { output } = await runPromptQuestion({
      type: "confirm",
      name: "useTypeScript",
      message: "Do you want to use TypeScript? (default: Yes)",
      default: true,
    });

    assert.strictEqual(
      (output.match(/\(default: Yes\)/g) || []).length,
      1,
      `Expected a single default label in prompt output.\n${output}`,
    );
    assert.match(output, /\(Y\/n\)/);
    assert.doesNotMatch(output, /\(default: Yes\)\s{2}\(Y\/n\)/);
  });

  it("adds a default suffix when the token appears mid-message", async () => {
    const { output } = await runPromptQuestion({
      type: "confirm",
      name: "useTypeScript",
      message: "Use (default: Yes) as an example",
      default: true,
    });

    assert.strictEqual(
      (output.match(/\(default: Yes\)/g) || []).length,
      2,
      `Expected the default label to be appended at the end.\n${output}`,
    );
  });

  it("supports template-literal characters in question content", async () => {
    const { output } = await runPromptQuestion({
      type: "confirm",
      name: "useExample",
      message: "Use `code` and $" + "{value} literally?",
      default: true,
    });

    assert.match(output, /Use `code` and \$\{value\} literally\?/);
  });

  it("normalizes empty confirm answers to a boolean", async () => {
    const { result } = await runPromptQuestion({
      type: "confirm",
      name: "docker",
      message: "Do you want to add Docker support?",
      default: "false",
    });

    assert.strictEqual(result.docker, false);
    assert.strictEqual(typeof result.docker, "boolean");
  });

  it("treats string true defaults as true", async () => {
    const { result } = await runPromptQuestion({
      type: "confirm",
      name: "docker",
      message: "Do you want to add Docker support?",
      default: "true",
    });

    assert.strictEqual(result.docker, true);
    assert.strictEqual(typeof result.docker, "boolean");
  });
});

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
