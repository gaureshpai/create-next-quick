# **create-next-quick** 🚀

[![npm version](https://img.shields.io/npm/v/create-next-quick.svg)](https://www.npmjs.com/package/create-next-quick)  
[![license](https://img.shields.io/github/license/gaureshpai/create-next-quick.svg)](./LICENSE)

A fast and interactive CLI tool to scaffold a new Next.js project with your preferred setup.  
Choose TypeScript, Tailwind CSS, Shadcn UI, Linters, ORMs, and multiple pages in just a few prompts — no boilerplate hassle.

---

## **📑 Table of Contents**

- [Why create-next-quick?](#why-create-next-quick)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Example Walkthrough](#example-walkthrough)
- [Commands](#commands)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contributors](#contributors)

---

## **💡 Why create-next-quick?**

`create-next-quick` is a lightweight and fast alternative to `create-next-app`.

It provides an **interactive setup process** that lets you choose project options such as:

- TypeScript
- Tailwind CSS
- Next.js App Directory
- Shadcn UI
- Linter (ESLint / Biome / None)
- ORM (Prisma / Drizzle / None)

This saves you time when starting a new project.

---

## **✨ Features**

- 🎯 **CLI Argument for Project Name** — skip prompts with `npx create-next-quick my-app`
- 📦 **Package Manager Detection** — supports npm, yarn, pnpm
- 🗂️ **Next.js App Directory** support
- 📑 **Custom Page Generation** — create multiple pages at once
- 🧹 **Clean Project Setup** — removes default favicon & clears public folder
- 🎨 **Shadcn UI** auto-installation with default theme
- 🔍 **Linter Options** — ESLint / Biome / None
- 🛡 **Safe Project Creation** — prevents overwrites in non-empty directories
- ⚡ **ORM Support** — Prisma / Drizzle
- 🔄 **Automated CI/CD Feedback** on PRs

---

## **📥 Installation**

Clone your fork, install dependencies, and run locally:

```bash
git clone https://github.com/<your-username>/create-next-quick.git
cd create-next-quick
npm install
node index.js      # OR npm start
```

**⚠️ Note:** `npx create-next-quick` works only with the published npm package. For your fork, use the commands above.

## 🛠 Usage

You can run `npx create-next-quick` with or without a project name.

#### With a Project Name

- **Published npm package:** `npx create-next-quick my-app`
- **Local fork:** `node index.js my-app`

#### Without a Project Name

- **Published npm package:** `npx create-next-quick`
- **Local fork:** `node index.js`

When you run `npx create-next-quick` without a project name, you will be prompted to:

? Enter project name: my-portfolio
? Do you want to use TypeScript? (Y/n)
? Do you want to use Tailwind CSS? (Y/n)
? Do you want to use the app directory? (Y/n)
? Enter pages (comma-separated): home, about, contact
? Choose a linter: None / ESLint / Biome
? Choose an ORM: None / Prisma / Drizzle
? Do you want to use Shadcn UI? (Y/n)

Example run:

```bash
node index.js
```

### Example Walkthrough

```
? Enter project name: my-portfolio
? Do you want to use TypeScript? Yes
? Do you want to use Tailwind CSS? Yes
? Do you want to use the app directory? Yes
? Enter pages: home, about, contact
? Choose a linter: none
? Choose an ORM: prisma
? Do you want to use Shadcn UI? No
```

**Done! 🎉 Run your project:**

```
cd my-portfolio
npm run dev
```

## Commands

- `npm run dev` → Start development server
- `npm run build` → Build for production
- `npm start` → Run production server

## Testing

The test suite for `create-next-quick` is designed to be dynamic and data-driven. Test cases are automatically generated based on the available options in `index.js`, ensuring comprehensive coverage as the CLI evolves.

To run the tests:

1.  **Generate Test Cases:** First, generate the test cases by running:
    ```bash
    npm run test:generate
    ```
    This script parses `index.js` and creates `test/generated-test-cases.js`.
2.  **Run Tests:** Then, execute the test suite:
    ```bash
    npm test
    ```
    This will run all generated test cases using Mocha.

## Contributing

We welcome contributions! Follow these steps:

1.  Fork & clone repo
2.  Create a new branch: `git checkout -b feature-name`
3.  Commit changes: `git commit -m "Added new feature"`
4.  Push to your branch: `git push origin feature-name`
5.  Open a Pull Request

CI/CD will automatically run tests and comment on your PR.

Before submitting, please ensure:

- Your code follows project style guidelines
- You have tested your changes locally

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributors

<div align="center">
<a href="https://github.com/gaureshpai/create-next-quick/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=gaureshpai/create-next-quick" /> 
</a>
</div>
