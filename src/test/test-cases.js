import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";

export const testCases = [
  {
    description: "should create a new project with default options",
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: "",
      linter: "none",
      orm: "none",
      useShadcn: false,
      testing: "none",
      auth: "none",
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(fs.existsSync(path.join(projectPath, "package.json")), "package.json should exist");
      assert.ok(
        !fs.existsSync(path.join(projectPath, "app")),
        "app folder should not exist at root when using src",
      );
      assert.ok(
        fs.existsSync(path.join(projectPath, "src", "app")),
        "app folder should exist in src",
      );
    },
  },
  {
    description: "should create a new project with TypeScript disabled",
    options: {
      useTypeScript: false,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: "",
      linter: "none",
      orm: "none",
      useShadcn: false,
      testing: "none",
      auth: "none",
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, "jsconfig.json")),
        "jsconfig.json should exist",
      );
    },
  },
  {
    description: "should create a new project with a specific page",
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: "about",
      linter: "none",
      orm: "none",
      useShadcn: false,
      testing: "none",
      auth: "none",
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, "src", "app", "about", "page.tsx")),
        "about page should exist",
      );
    },
  },
  {
    description: "should create a new project without src directory",
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: false,
      useAppDir: true,
      pages: "",
      linter: "none",
      orm: "none",
      useShadcn: false,
      testing: "none",
      auth: "none",
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(fs.existsSync(path.join(projectPath, "package.json")), "package.json should exist");
      assert.ok(fs.existsSync(path.join(projectPath, "app")), "app folder should exist at root");
      assert.ok(
        !fs.existsSync(path.join(projectPath, "src", "app")),
        "app folder should not exist in src",
      );
    },
  },
];
