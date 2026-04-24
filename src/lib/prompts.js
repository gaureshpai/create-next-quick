import readline from "node:readline";
import chalk from "./colors.js";

let rl;

const getRl = () => {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
};

const ask = (query) => {
  return new Promise((resolve) => getRl().question(query, resolve));
};

const getRenderedRowCount = (text, columns = process.stdout.columns ?? 80) => {
  const safeColumns = Math.max(columns || 80, 1);
  return Math.max(1, Math.ceil(text.length / safeColumns));
};

const resolveConfirmInput = (input, defaultValue) => {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "") return defaultValue;
  if (trimmed === "y" || trimmed === "yes") return true;
  if (trimmed === "n" || trimmed === "no") return false;
  return undefined;
};

const processQuestion = async (question) => {
  let answer;
  const { type, name, message, default: defaultVal, choices, validate, filter } = question;

  const hasDefaultSuffix = /\(default:\s*[^)]+\)\s*$/i.test(message);
  const confirmDefault =
    defaultVal === true ||
    (typeof defaultVal === "string" &&
      ["true", "yes", "1"].includes(defaultVal.trim().toLowerCase()));
  const defaultDisplay = type === "confirm" ? (confirmDefault ? "Yes" : "No") : defaultVal;
  const displayMessage = `${message}${defaultVal !== undefined && !hasDefaultSuffix ? ` (default: ${defaultDisplay})` : ""} `;

  const confirmHint = confirmDefault ? "(Y/n)" : "(y/N)";
  const renderedMessage = displayMessage.trimEnd();
  const renderConfirmSelection = (value, input = "") => {
    if (!process.stdout.isTTY) return;
    const selectedLabel = value ? "Yes" : "No";
    const promptText = `? ${renderedMessage} ${confirmHint} ${input}`;
    const promptRows = getRenderedRowCount(promptText);
    readline.moveCursor(process.stdout, 0, -(promptRows - 1));
    readline.cursorTo(process.stdout, 0);
    readline.clearScreenDown(process.stdout);
    process.stdout.write(
      `${chalk.green("?")} ${chalk.bold(renderedMessage)} ${chalk.cyan(selectedLabel)}\n`,
    );
  };

  const askConfirm = async () => {
    const { stdin, stdout } = process;
    const confirmPrompt = `${chalk.green("?")} ${chalk.bold(renderedMessage)} ${chalk.dim(confirmHint)} `;

    if (!stdin.isTTY || !stdout.isTTY) {
      while (true) {
        const input = await ask(confirmPrompt);
        const resolved = resolveConfirmInput(input, confirmDefault);
        if (resolved !== undefined) return resolved;
      }
    }

    return new Promise((resolve) => {
      let input = "";

      const cleanup = () => {
        stdin.removeListener("keypress", handleKeypress);
        stdin.setRawMode(false);
      };

      const resetPrompt = () => {
        const promptRows = getRenderedRowCount(`? ${renderedMessage} ${confirmHint} ${input}`);
        readline.moveCursor(stdout, 0, -(promptRows - 1));
        readline.cursorTo(stdout, 0);
        readline.clearScreenDown(stdout);
        input = "";
        stdout.write(confirmPrompt);
      };

      const complete = (value) => {
        cleanup();
        renderConfirmSelection(value, input);
        resolve(value);
      };

      const handleKeypress = (str, key) => {
        if (key?.ctrl && key.name === "c") {
          cleanup();
          process.exit(0);
        }

        if (key?.name === "return" || key?.name === "enter") {
          const resolved = resolveConfirmInput(input, confirmDefault);
          if (resolved === undefined) {
            resetPrompt();
            return;
          }

          complete(resolved);
          return;
        }

        if (key?.name === "backspace") {
          if (input.length === 0) return;
          input = input.slice(0, -1);
          readline.moveCursor(stdout, -1, 0);
          readline.clearLine(stdout, 1);
          return;
        }

        if (str && str >= " " && !key?.ctrl && !key?.meta) {
          input += str;
          stdout.write(str);
        }
      };

      stdout.write(confirmPrompt);
      readline.emitKeypressEvents(stdin);
      stdin.setRawMode(true);
      stdin.resume();
      stdin.on("keypress", handleKeypress);
    });
  };

  if (type === "confirm") {
    answer = await askConfirm();
  } else if (type === "list") {
    const { stdin, stdout } = process;

    // Fallback for non-interactive environments
    if (!stdin.isTTY) {
      console.log(`${chalk.green("?")} ${chalk.bold(message)}`);
      choices.forEach((choice, index) => {
        const isDefault = choice === defaultVal;
        console.log(`  ${index + 1}) ${choice} ${isDefault ? chalk.dim("(default)") : ""}`);
      });

      while (true) {
        const input = await ask(`  ${chalk.dim("Answer:")} `);
        const trimmed = input.trim();

        if (trimmed === "" && defaultVal !== undefined) {
          const defaultIndex = choices.indexOf(defaultVal);
          if (defaultIndex !== -1) {
            answer = defaultVal;
            break;
          }
        }

        const num = parseInt(trimmed, 10);
        if (!Number.isNaN(num) && num > 0 && num <= choices.length) {
          answer = choices[num - 1];
          break;
        }

        const matchedChoice = choices.find((c) => c.toLowerCase() === trimmed.toLowerCase());
        if (matchedChoice) {
          answer = matchedChoice;
          break;
        }

        if (trimmed.includes("\u001b[B")) {
          // Naive handling of Down Arrow sequences if piped
          const downCount = trimmed.split("\u001b[B").length - 1;
          let idx = choices.indexOf(defaultVal);
          if (idx === -1) idx = 0;
          idx = (idx + downCount) % choices.length;
          answer = choices[idx];
          break;
        }

        console.log(chalk.red(`  Invalid selection: ${trimmed}`));
        if (defaultVal) {
          answer = defaultVal;
          break;
        }
      }
    } else {
      let selectedIndex = choices.indexOf(defaultVal);
      if (selectedIndex === -1) selectedIndex = 0;

      answer = await new Promise((resolve) => {
        const handleKeypress = (_str, key) => {
          if (key?.ctrl && key.name === "c") {
            stdin.setRawMode(false);
            stdout.write("\x1b[?25h");
            process.exit(0);
          }

          if (key?.name === "up") {
            selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
            readline.moveCursor(stdout, 0, -choices.length);
            renderList();
          } else if (key?.name === "down") {
            selectedIndex = (selectedIndex + 1) % choices.length;
            readline.moveCursor(stdout, 0, -choices.length);
            renderList();
          } else if (key?.name === "return" || key?.name === "enter") {
            stdin.removeListener("keypress", handleKeypress);
            stdin.setRawMode(false);
            stdout.write("\x1b[?25h");

            readline.moveCursor(stdout, 0, -choices.length - 1);
            readline.clearScreenDown(stdout);
            console.log(
              `${chalk.green("?")} ${chalk.bold(message)} ${chalk.cyan(choices[selectedIndex])}`,
            );
            resolve(choices[selectedIndex]);
          }
        };

        const renderList = () => {
          choices.forEach((choice, index) => {
            const isSelected = index === selectedIndex;
            const prefix = isSelected ? chalk.green(">") : " ";
            const indexLabel = chalk.dim(`${index + 1}) `);
            const label = isSelected ? chalk.green(choice) : choice;
            const explanation = choice === defaultVal ? chalk.dim(" (default)") : "";

            readline.clearLine(stdout, 0);
            readline.cursorTo(stdout, 0);
            process.stdout.write(`${prefix} ${indexLabel}${label}${explanation}\n`);
          });
        };

        console.log(`${chalk.green("?")} ${chalk.bold(message)}`);
        stdout.write("\x1b[?25l"); // Hide cursor
        renderList();

        readline.emitKeypressEvents(stdin);
        if (stdin.isTTY) stdin.setRawMode(true);
        stdin.on("keypress", handleKeypress);
      });
    }
  } else {
    // type === 'input' or default
    while (true) {
      const input = await ask(`${chalk.green("?")} ${chalk.bold(displayMessage)}`);
      let val = input.trim();

      if (val === "" && defaultVal !== undefined) {
        val = defaultVal;
      }

      if (filter) {
        val = filter(val);
      }

      const validated = validate ? validate(val) : true;
      if (validated === true) {
        answer = val;
        break;
      } else {
        console.log(typeof validated === "string" ? validated : chalk.red("Invalid input"));
      }
    }
  }

  return { [name]: answer };
};

const prompt = async (questions) => {
  const answers = {};
  for (const question of questions) {
    const answer = await processQuestion(question);
    Object.assign(answers, answer);
  }
  return answers;
};

const close = () => {
  if (rl) {
    rl.close();
    rl = null;
  }
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
};

export default {
  prompt,
  close,
};

export const __testing = {
  getRenderedRowCount,
};
