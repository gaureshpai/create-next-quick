import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const run = (cmd, cwd = process.cwd(), silent = false) => {
    if (!silent) {
        console.log(`\nRunning: ${cmd}`);
    }
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd });
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