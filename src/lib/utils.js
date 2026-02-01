import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import chalk from "./colors.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const run = async (
  cmd,
  cwd = process.cwd(),
  silent = false,
  retries = 0,
  retryDelay = 1000,
) => {
  for (let i = 0; i <= retries; i++) {
    try {
      if (!silent) {
        console.log(`\nRunning: ${cmd}`);
      }
      const output = execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd });
      return { success: true, stdout: output ? output.toString() : "" };
    } catch (error) {
      if (i < retries) {
        console.log(
          chalk.yellow(
            `Command failed. Retrying in ${retryDelay / 1000}s... (Attempt ${i + 1}/${retries})`,
          ),
        );
        await sleep(retryDelay);
      } else {
        return {
          success: false,
          error: error.message,
          stdout: error.stdout ? error.stdout.toString() : "",
          stderr: error.stderr ? error.stderr.toString() : "",
        };
      }
    }
  }
};

export const writeFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
};

export const readFile = (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

export const createFolder = (folderPath) => {
  fs.mkdirSync(folderPath, { recursive: true });
};

export const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const deleteFolder = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
};
