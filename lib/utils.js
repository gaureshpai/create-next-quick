import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const run = (cmd, cwd = process.cwd(), silent = false) => {
  if (!silent) {
    console.log(`\nRunning: ${cmd}`);
  }
  try {
    execSync(cmd, { stdio: silent ? 'pipe' : 'inherit', cwd });
  } catch (error) {
    throw new Error(`Command failed: ${cmd}\nError: ${error.message}`);
  }
};

export const runWithRetry = async (
  cmd,
  cwd = process.cwd(),
  silent = false,
  maxRetries = 2
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!silent) {
        console.log(
          `\n${attempt > 1 ? `Retry ${attempt - 1}: ` : ''}Running: ${cmd}`
        );
      }
      execSync(cmd, { stdio: silent ? 'pipe' : 'inherit', cwd });
      return; // Success
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        console.log(`\nAttempt ${attempt} failed, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }

  throw new Error(
    `Command failed after ${maxRetries} attempts: ${cmd}\nError: ${lastError.message}`
  );
};

export const writeFile = (filePath, content) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${error.message}`);
  }
};

export const readFile = (filePath) => {
  return fs.readFileSync(filePath, 'utf-8');
};

export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

export const createFolder = (folderPath) => {
  try {
    fs.mkdirSync(folderPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create folder ${folderPath}: ${error.message}`);
  }
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

export const checkPackageAvailability = async (
  packageName,
  packageManager = 'npm'
) => {
  try {
    const command =
      packageManager === 'npm'
        ? `npm view ${packageName} version`
        : packageManager === 'yarn'
        ? `yarn info ${packageName} version`
        : `pnpm view ${packageName} version`;

    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

export const validateEnvironment = () => {
  const errors = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 16) {
    errors.push(`Node.js 16+ required (current: ${nodeVersion})`);
  }

  // Check if npm is available
  try {
    execSync('npm --version', { stdio: 'pipe' });
  } catch (error) {
    errors.push('npm is not installed or not in PATH');
  }

  return errors;
};
