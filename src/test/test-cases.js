
import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

export const testCases = [
  {
    description: 'should create a new project with default options',
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: '',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      testing: 'none',
      auth: 'none',
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(fs.existsSync(path.join(projectPath, 'package.json')), 'package.json should exist');
    },
  },
  {
    description: 'should create a new project with TypeScript disabled',
    options: {
      useTypeScript: false,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: '',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      testing: 'none',
      auth: 'none',
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(fs.existsSync(path.join(projectPath, 'jsconfig.json')), 'jsconfig.json should exist');
    },
  },
  {
    description: 'should create a new project with a specific page',
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: 'about',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      testing: 'none',
      auth: 'none',
      docker: false,
    },
    assertions: (projectPath) => {
      assert.ok(fs.existsSync(path.join(projectPath, 'src', 'app', 'about', 'page.tsx')), 'about page should exist');
    },
  },
];
