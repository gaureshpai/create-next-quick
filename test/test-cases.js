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
      auth: 'none',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, 'package.json')),
        'package.json should exist'
      );
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
      auth: 'none',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, 'jsconfig.json')),
        'jsconfig.json should exist'
      );
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
      auth: 'none',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(
          path.join(projectPath, 'src', 'app', 'about', 'page.tsx')
        ),
        'about page should exist'
      );
    },
  },
  {
    description: 'should create a new project with NextAuth authentication',
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: '',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      auth: 'nextauth',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, 'package.json')),
        'package.json should exist'
      );
      assert.ok(
        fs.existsSync(path.join(projectPath, '.env')),
        '.env file should exist'
      );

      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
      );
      assert.ok(
        packageJson.dependencies && packageJson.dependencies['next-auth'],
        'next-auth should be installed'
      );

      const envContent = fs.readFileSync(
        path.join(projectPath, '.env'),
        'utf8'
      );
      assert.ok(
        envContent.includes('NEXTAUTH_URL'),
        'NEXTAUTH_URL should be in .env'
      );
      assert.ok(
        envContent.includes('NEXTAUTH_SECRET'),
        'NEXTAUTH_SECRET should be in .env'
      );
    },
  },
  {
    description: 'should create a new project with Clerk authentication',
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: '',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      auth: 'clerk',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, 'package.json')),
        'package.json should exist'
      );
      assert.ok(
        fs.existsSync(path.join(projectPath, '.env')),
        '.env file should exist'
      );

      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
      );
      assert.ok(
        packageJson.dependencies && packageJson.dependencies['@clerk/nextjs'],
        '@clerk/nextjs should be installed'
      );

      const envContent = fs.readFileSync(
        path.join(projectPath, '.env'),
        'utf8'
      );
      assert.ok(
        envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should be in .env'
      );
      assert.ok(
        envContent.includes('CLERK_SECRET_KEY'),
        'CLERK_SECRET_KEY should be in .env'
      );
    },
  },
  {
    description: 'should create a new project with Firebase authentication',
    options: {
      useTypeScript: true,
      useTailwind: true,
      useSrcDir: true,
      useAppDir: true,
      pages: '',
      linter: 'none',
      orm: 'none',
      useShadcn: false,
      auth: 'firebase',
    },
    assertions: (projectPath) => {
      assert.ok(
        fs.existsSync(path.join(projectPath, 'package.json')),
        'package.json should exist'
      );
      assert.ok(
        fs.existsSync(path.join(projectPath, '.env')),
        '.env file should exist'
      );

      const packageJson = JSON.parse(
        fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8')
      );
      assert.ok(
        packageJson.dependencies && packageJson.dependencies['firebase'],
        'firebase should be installed'
      );

      const envContent = fs.readFileSync(
        path.join(projectPath, '.env'),
        'utf8'
      );
      assert.ok(
        envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY'),
        'NEXT_PUBLIC_FIREBASE_API_KEY should be in .env'
      );
      assert.ok(
        envContent.includes('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN should be in .env'
      );
    },
  },
];
