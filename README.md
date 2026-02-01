# create-next-quick

<div align="center">
  <img src="./docs/logo.png" alt="create-next-quick logo" width="150">
  <h1>create-next-quick</h1>
  <p><strong>The fastest and most configurable way to spin up a new Next.js project</strong></p>
  <p>A powerful CLI tool that lets you instantly create a new Next.js project with a highly customized and clean setup.</p>
  
  <p>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/npm/v/create-next-quick.svg" alt="npm version"></a>
    <a href="https://github.com/gaureshpai/create-next-quick/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/create-next-quick.svg" alt="license"></a>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/npm/dt/create-next-quick.svg" alt="npm downloads"></a>
    <a href="https://gaureshpai.github.io/create-next-quick/"><img src="https://img.shields.io/badge/documentation-site-green.svg" alt="documentation site"></a>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/badge/npm-create--next--quick-cb3837.svg" alt="npm package"></a>
    <a href="https://github.com/gaureshpai/create-next-quick"><img src="https://img.shields.io/github/stars/gaureshpai/create-next-quick?style=social" alt="github stars"></a>
  </p>
</div>

---

## 📋 Table of Contents

- [Why create-next-quick?](#-why-create-next-quick)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
  - [Basic Usage](#basic-usage)
  - [Interactive Mode](#interactive-mode-for-existing-projects)
  - [Interactive Prompts](#interactive-prompts)
  - [Example Walkthrough](#example-walkthrough)
- [Configuration Options](#configuration-options)
- [Advanced Features](#-advanced-features)
  - [Authentication Setup](#authentication-setup)
  - [Testing Frameworks](#testing-frameworks)
  - [Docker Support](#docker-support)
- [Prerequisites](#-prerequisites)
- [Available Scripts](#-available-scripts)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Why create-next-quick?

`create-next-quick` is a powerful, lightweight alternative to `create-next-app`, designed for developers who want **more control and speed** right from the start.

### Comparison with create-next-app

| Feature                        | `create-next-quick`                            | `create-next-app` |
| ------------------------------ | ---------------------------------------------- | ----------------- |
| **Multi-page Generation**      | ✅ Yes (e.g., `home, about, contact`)          | ❌ No             |
| **ORM Support**                | ✅ Yes (Prisma, Drizzle)                       | ❌ No             |
| **Linter Choice**              | ✅ Yes (ESLint, Biome)                         | ❌ ESLint only    |
| **Shadcn UI Auto-Setup**       | ✅ Yes (non-interactive)                       | ❌ No             |
| **Authentication Integration** | ✅ Yes (NextAuth, Clerk, Lucia)                | ❌ No             |
| **Testing Framework Setup**    | ✅ Yes (Vitest, Jest)                          | ❌ No             |
| **Docker Configuration**       | ✅ Yes (Dockerfile + .dockerignore)            | ❌ No             |
| **Clean Project Start**        | ✅ Yes (removes boilerplate & default assets)  | ❌ No             |
| **Package Manager Detection**  | ✅ Yes (npm, yarn, pnpm)                       | ✅ Yes            |
| **Robust Error Handling**      | ✅ Yes (retries, cleanup, clear tips)          | ❌ Basic          |
| **Interactive Mode**           | ✅ Yes (add features to existing projects)     | ❌ No             |

---

## ✨ Features

### 🏗️ Project Scaffolding

- **CLI Argument for Project Name**: Skip the project name prompt by passing it as an argument
- **Custom Page Generation**: Create multiple pages at once from the CLI
- **Clean Project Setup**: Automatically removes the default favicon, clears the public folder, and provides clean `page.tsx` and `layout.tsx` files
- **Safe Project Creation**: Prevents accidental overwrites by checking if the target directory is empty
- **Conditional API Route Deletion**: Removes the default `hello.js` API route when not needed

### 🛠️ Tooling & Integrations

- **Package Manager Detection**: Auto-detects `npm`, `yarn`, and `pnpm`
- **Linter Support**: Choose between ESLint, Biome, or no linter
- **ORM Support**: Integrated setup for Prisma or Drizzle (with TypeScript/JavaScript support)
- **Shadcn UI**: Automatically installs and configures Shadcn UI non-interactively
- **TypeScript CSS Module Support**: Generates `global.d.ts` to provide type declarations for CSS imports
- **Authentication**: Integrated setup for **NextAuth.js**, **Clerk**, or **Lucia** with middleware and API routes
- **Testing**: Ready-to-use configuration for **Vitest** or **Jest** with React Testing Library
- **Docker**: Auto-generated `Dockerfile` and `.dockerignore` for containerized deployments

### 💎 Developer Experience

- **Robust Error Handling**: Automatic retries for failed installs, intelligent cleanup of incomplete projects, and actionable troubleshooting tips
- **Automated CI/CD Feedback**: Get automated comments on the test status of your Pull Requests
- **Interactive Mode**: Add features to existing Next.js projects without starting from scratch
- **Zero External Dependencies**: Uses custom lightweight prompt implementation (no inquirer dependency)

---

## 🎯 Quick Start

No global installation needed. Run it instantly with `npx`:

```bash
npx create-next-quick my-app
cd my-app
pnpm run dev
```

---

## 📖 Usage

### Basic Usage

```bash
npx create-next-quick [project-name]
```

If you omit `[project-name]`, the tool will prompt you for it. Use `.` to create in the current directory (must be empty).

### Interactive Mode (for existing projects)

Already have a Next.js project? Use the `-i` or `--interactive` flag to run `create-next-quick` on your existing project and add new features without starting from scratch.

```bash
cd my-existing-nextjs-project
npx create-next-quick -i
```

When you run in interactive mode, the tool will:
1. **Detect Your Project's Setup**: Automatically detects if you're using TypeScript, the `src` directory, the `app` directory, and Tailwind CSS
2. **Skip Project Creation**: It will not run `create-next-app` or remove any existing files
3. **Prompt for Additions**: It will only ask you what you want to *add* to your project, such as new pages, a linter, an ORM, or Shadcn UI

This is perfect for when you want to add a new feature to your project and want to use the same streamlined setup process.

### Interactive Prompts

The CLI will guide you through the following options:

| Prompt                | Description                                        | Default |
| --------------------- | -------------------------------------------------- | ------- |
| **Package Manager**   | Auto-detects installed `npm`, `yarn`, `pnpm`       | `pnpm`  |
| **TypeScript**        | Use TypeScript for type safety                     | `Yes`   |
| **Tailwind CSS**      | Use Tailwind CSS for styling                       | `Yes`   |
| **`src/` Directory**  | Use the `src/` directory for project structure     | `Yes`   |
| **App Router**        | Use the Next.js App Router                         | `Yes`   |
| **Pages**             | Enter page names to create (comma-separated)       | `none`  |
| **Linter**            | Choose a linter (`ESLint`, `Biome`)                | `none`  |
| **ORM**               | Choose an ORM (`Prisma`, `Drizzle`)                | `none`  |
| **Testing**           | Choose a testing framework (`Vitest`, `Jest`)      | `none`  |
| **Authentication**    | Choose auth solution (`NextAuth`, `Clerk`, `Lucia`)| `none`  |
| **Shadcn UI**         | Automatically install and set up Shadcn UI         | `Yes`   |
| **Docker**            | Add Docker support with Dockerfile                 | `No`    |

### Example Walkthrough

```bash
$ npx create-next-quick my-portfolio

✔ Using default for package manager: pnpm
✔ Using default for TypeScript: Yes
✔ Using default for Tailwind CSS: Yes
✔ Using default for src directory: Yes
✔ Using default for app directory: Yes
? Enter the names of the pages you want to create (comma-separated): home, about, contact
✔ Using default for linter: none
✔ Using default for ORM: none
✔ Using default for testing: none
✔ Using default for authentication: none
✔ Using default for Shadcn UI: Yes
✔ Using default for Docker: No
```

---

## ⚙️ Configuration Options

### Linters

#### ESLint

- Pre-configured with Next.js recommended rules
- Automatically installed if selected

#### Biome

- Fast, modern linter and formatter
- Zero-config setup with `biome.json`
- Includes pre-commit hooks with Husky

### ORMs

#### Prisma

- Automatically installs `prisma` and `@prisma/client`
- Initializes Prisma with `prisma init`
- Creates a singleton Prisma client in `src/lib/prisma.ts` (or `.js`)
- Generates `.env` file with `DATABASE_URL` placeholder
- Supports both TypeScript and JavaScript projects

#### Drizzle

- Installs `drizzle-orm`, `drizzle-kit`, and `@vercel/postgres`
- Creates `drizzle.config.ts` (or `.js`) with PostgreSQL dialect
- Generates example schema in `src/db/schema.ts` (or `.js`)
- Supports both TypeScript and JavaScript projects
- Includes `.env` file with `DATABASE_URL` placeholder

---

## 🔐 Advanced Features

### Authentication Setup

#### NextAuth.js (v5 Beta)

```bash
# Automatically sets up:
- src/lib/auth.ts (or .js) with credentials provider
- src/app/api/auth/[...nextauth]/route.ts (or .js)
```

#### Clerk

```bash
# Automatically sets up:
- middleware.ts (or .js) with Clerk middleware
- .env with NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY placeholders
```

#### Lucia

```bash
# Installs core package
- Provides instructions for adapter setup
```

### Testing Frameworks

#### Vitest

```bash
# Automatically configures:
- vitest.config.ts (or .js) with React plugin
- vitest.setup.ts (or .js) with jest-dom
- package.json test script
- ES module compatible path resolution
```

#### Jest

```bash
# Automatically configures:
- jest.config.js with Next.js integration
- jest.setup.js with jest-dom
- package.json test script
- TypeScript support (if enabled)
```

### Docker Support

Generates production-ready Docker configuration:
- Multi-stage build for optimized image size
- Standalone output mode in `next.config.mjs`
- `.dockerignore` for efficient builds
- Node.js 20 Alpine base image

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or higher

Check your Node.js version:

```bash
node --version
```

---

## 📜 Available Scripts

Once your project is created, you can use the following commands:

| `pnpm`          | `npm`           | `yarn`          | Description                    |
| --------------- | --------------- | --------------- | ------------------------------ |
| `pnpm dev`      | `npm run dev`   | `yarn dev`      | Starts the development server  |
| `pnpm build`    | `npm run build` | `yarn build`    | Builds the app for production  |
| `pnpm start`    | `npm start`     | `yarn start`    | Starts the production server   |
| `pnpm lint`     | `npm run lint`  | `yarn lint`     | Runs the linter (if configured)|
| `pnpm test`     | `npm test`      | `yarn test`     | Runs tests (if configured)     |

---

## 🧪 Testing

The test suite is dynamically generated to ensure comprehensive coverage.

### Generate Test Cases

```bash
npm run test:generate
```

### Run Tests

```bash
npm test
```

### Run Interactive Tests

```bash
npm run test:interactive
```

---

## 🔧 Troubleshooting

### Common Issues

#### Installation Fails

```bash
# Check your internet connection
# Ensure package manager is up to date
npm install -g npm@latest
# or
pnpm add -g pnpm@latest
```

#### Permission Errors

If you encounter permission errors, **avoid using `sudo`** as it can cause npm cache permission issues and create root-owned files in user directories. Instead, try these safer alternatives:

```bash
# Option 1: Use a Node version manager (recommended)
# Install nvm (https://github.com/nvm-sh/nvm) or fnm (https://github.com/Schniz/fnm)
# Then reinstall Node.js through the version manager

# Option 2: Fix npm permissions by setting a user-local prefix
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
# Add to your ~/.bashrc or ~/.zshrc:
# export PATH=~/.npm-global/bin:$PATH

# Option 3: Ensure you're creating the project in a user-owned directory
cd ~/projects  # or any directory you own
npx create-next-quick my-app
```

#### TypeScript Errors After Setup

```bash
# Regenerate types
pnpm run build
```

#### Prisma Client Not Found

```bash
# Generate Prisma client
npx prisma generate
```

#### Port Already in Use

```bash
# Kill the process using port 3000
# On macOS/Linux:
lsof -ti:3000 | xargs kill -9
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a new branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and commit them: `git commit -m "feat: Add some amazing feature"`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Development Setup

```bash
# Clone the repository
git clone https://github.com/gaureshpai/create-next-quick.git
cd create-next-quick

# Install dependencies
pnpm install

# Run tests
pnpm test

# Generate test cases
pnpm run test:generate

# Lint code
pnpm run lint
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test updates

---

## 💖 Show Your Support

Give a ⭐️ if this project helped you!

[![Sponsor on Patreon](https://img.shields.io/badge/sponsor-Patreon-F96854.svg)](https://patreon.com/gaureshpai)

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

## 👥 Contributors

<div align="center">
  <a href="https://github.com/gaureshpai/create-next-quick/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=gaureshpai/create-next-quick" alt="Contributors" />
  </a>
</div>

---

<div align="center">
  <p>
    <a href="https://gaureshpai.github.io/create-next-quick/">Documentation</a> •
    <a href="https://github.com/gaureshpai/create-next-quick/issues">Report Bug</a> •
    <a href="https://github.com/gaureshpai/create-next-quick/issues">Request Feature</a>
  </p>
</div>