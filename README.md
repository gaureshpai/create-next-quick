<div align="center">
  <img src="./docs/logo.png" alt="create-next-quick logo" width="150">
  <h1>create-next-quick</h1>
  <p>The fastest and most configurable way to spin up a new Next.js project.</p>
  <p>create-next-quick is a CLI tool that lets you instantly create a new Next.js project with a highly customized and clean setup.</p>
  <p>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/npm/v/create-next-quick.svg" alt="npm version"></a>
    <a href="https://github.com/gaureshpai/create-next-quick/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/create-next-quick.svg" alt="license"></a>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/npm/dt/create-next-quick.svg" alt="npm downloads"></a>
    <a href="https://gaureshpai.github.io/create-next-quick/"><img src="https://img.shields.io/badge/documentation-site-green.svg" alt="documentation site"></a>
    <a href="https://www.npmjs.com/package/create-next-quick"><img src="https://img.shields.io/badge/npm-create--next--quick-cb3837.svg" alt="npm package"></a>
    <a href="https://github.com/gaureshpai/create-next-quick"><img src="https://img.shields.io/github/stars/gaureshpai/create-next-quick?style=social" alt="github stars"></a>
  </p>
</div>

## 🛠 Usage

No global installation is needed. Run it instantly with `npx`:

```bash
npx create-next-quick [project-name]
````

If you omit `[project-name]`, the tool will prompt you for it. Use `.` to create in the current directory (must be empty).

### Interactive Prompts

The CLI will guide you through the following options:

| Prompt                | Description                                        | Default |
| --------------------- | -------------------------------------------------- | ------- |
| **Package Manager** | Auto-detects installed `npm`, `yarn`, `pnpm`       | `pnpm`  |
| **TypeScript** | Use TypeScript for type safety                     | `Yes`   |
| **Tailwind CSS** | Use Tailwind CSS for styling                       | `Yes`   |
| **`src/` Directory** | Use the `src/` directory for project structure     | `Yes`   |
| **App Router** | Use the Next.js App Router                         | `Yes`   |
| **Pages** | Enter page names to create (comma-separated)       | `none`  |
| **Linter** | Choose a linter (`ESLint`, `Biome`)                | `none`  |
| **ORM** | Choose an ORM (`Prisma`, `Drizzle`)                | `none`  |
| **Shadcn UI** | Automatically install and set up Shadcn UI         | `Yes`   |

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
✔ Using default for Shadcn UI: Yes
```

## Why create-next-quick?

`create-next-quick` is a powerful, lightweight alternative to `create-next-app`, designed for developers who want more control and speed right from the start.

| Feature                          | `create-next-quick`                                   | `create-next-app` |
| -------------------------------- | ------------------------------------------------------ | ----------------- |
| **Multi-page Generation** | ✅ Yes (e.g., `home, about, contact`)                  | ❌ No             |
| **ORM Support** | ✅ Yes (Prisma, Drizzle)                               | ❌ No             |
| **Linter Choice** | ✅ Yes (ESLint, Biome)                                 | ❌ ESLint only    |
| **Shadcn UI Auto-Setup** | ✅ Yes (non-interactive)                               | ❌ No             |
| **Clean Project Start** | ✅ Yes (removes boilerplate & default assets)          | ❌ No             |
| **Package Manager Detection** | ✅ Yes (npm, yarn, pnpm)                               | ✅ Yes            |
| **Robust Error Handling** | ✅ Yes (retries, cleanup, clear tips)                  | ❌ Basic          |

## Features

### Project Scaffolding
- **CLI Argument for Project Name**: Skip the project name prompt by passing it as an argument.
- **Custom Page Generation**: Create multiple pages at once from the CLI.
- **Clean Project Setup**: Automatically removes the default favicon, clears the public folder, and provides a clean `page.tsx` and `layout.tsx`.
- **Safe Project Creation**: Prevents accidental overwrites by checking if the target directory is empty.
- **Conditional API Route Deletion**: Removes the default `hello.js` API route when not needed.

### Tooling & Integrations
- **Package Manager Detection**: Auto-detects `npm`, `yarn`, and `pnpm`.
- **Linter Support**: Choose between ESLint, Biome, or no linter.
- **ORM Support**: Integrated setup for Prisma or Drizzle.
- **Shadcn UI**: Automatically installs and configures Shadcn UI non-interactively.
- **TypeScript CSS Module Support**: Generates `global.d.ts` to provide type declarations for CSS imports.

### Developer Experience
- **Robust Error Handling**: Automatic retries for failed installs, intelligent cleanup of incomplete projects, and actionable troubleshooting tips.
- **Automated CI/CD Feedback**: Get automated comments on the test status of your Pull Requests.

## Prerequisites

- **Node.js**: `v20.0.0` or higher.

## Available Scripts

Once your project is created, you can use the following commands:

| `pnpm`          | `npm`           | `yarn`          | Description                    |
| --------------- | --------------- | --------------- | ------------------------------ |
| `pnpm dev`      | `npm run dev`   | `yarn dev`      | Starts the development server. |
| `pnpm build`    | `npm run build` | `yarn build`    | Builds the app for production. |
| `pnpm start`    | `npm start`     | `yarn start`    | Starts the production server.  |

## Testing

The test suite is dynamically generated to ensure comprehensive coverage.

1.  **Generate Test Cases:**
    ```bash
    npm run test:generate
    ```
2.  **Run Tests:**
    ```bash
    npm test
    ```

## Contributing

Contributions are welcome! Please fork the repository, create a feature branch, and open a Pull Request.

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature-name`
3.  Commit your changes: `git commit -m "feat: Add some amazing feature"`
4.  Push to the branch: `git push origin feature/your-feature-name`
5.  Open a Pull Request.

## Show Your Support

Give a ⭐️ if this project helped you!

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

## Contributors

<div align="center">
  <a href="https://github.com/gaureshpai/create-next-quick/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=gaureshpai/create-next-quick" />
  </a>
</div>