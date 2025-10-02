# create-next-quick

⚡ **Fast Next.js project scaffolding with interactive setup**

A lightweight CLI tool that creates Next.js projects with your preferred configuration - TypeScript, Tailwind CSS, ORMs, linters, and more.

📖 **[View Documentation](https://gaureshpai.github.io/create-next-quick/)** | 🚀 **[Quick Start](#installation)**

---

## ✨ Why choose create-next-quick?

- **🚀 Faster setup** - Skip repetitive configuration steps
- **🎯 Interactive prompts** - Choose exactly what you need
- **📄 Multiple pages** - Generate several pages at once
- **🔧 Modern tools** - Built-in support for TypeScript, Tailwind, ORMs
- **🧹 Clean output** - No unnecessary boilerplate files

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Smart Project Names** | Pass project name as argument to skip prompts |
| **Package Manager Detection** | Auto-detects npm, yarn, pnpm |
| **Modern Next.js** | App directory, TypeScript, Tailwind CSS |
| **Multiple Pages** | Generate several pages in one go |
| **Linting Options** | ESLint, Biome, or none |
| **Database Ready** | Prisma, Drizzle ORM integration |
| **UI Components** | Shadcn UI with auto-configuration |
| **Clean Setup** | No unnecessary files or boilerplate |
| **Safe Creation** | Prevents accidental overwrites |

## Installation

You don’t need to install it globally — run it instantly with `npx`:

```bash
npx create-next-quick
```

## 🛠 Usage

You can run `npx create-next-quick` with or without a project name.

### With a Project Name

```bash
npx create-next-quick my-app
```

This will skip the project name prompt and create a new directory named `my-app`.

### Without a Project Name

```bash
npx create-next-quick
```

When you run `npx create-next-quick` without a project name, you will be prompted to:

1.  **Enter Project Name** — e.g., `my-app` (or `.` to create in the current directory). If you use `.` the directory must be empty.
2.  **Choose a package manager** — detects installed package managers (`npm`, `yarn`, `pnpm`) and prompts you to choose.
3.  **Choose to use TypeScript (default: Yes)**
4.  **Choose to use Tailwind CSS (default: Yes)**
5.  **Choose to use the app directory (default: Yes)**
6.  **Enter the names of the pages you want to create (default: none)**
7.  **Choose a linter (default: none)**
8.  **Choose an ORM (default: none)**

Example run:

```bash
npx create-next-quick
```

### Example Walkthrough

```
? Enter project name: my-portfolio
? Do you want to use TypeScript? Yes
? Do you want to use Tailwind CSS? Yes
? Do you want to use the app directory? Yes
? Enter the names of the pages you want to create (comma-separated): home, about, contact
? Choose a linter (default: none): none
? Choose an ORM (default: none): prisma
? Do you want to use Shadcn UI? No
```

## Documentation

For comprehensive documentation, examples, templates, and API reference, visit:

**[https://gaureshpai.github.io/create-next-quick/](https://gaureshpai.github.io/create-next-quick/)**

The documentation includes:
- Detailed usage examples and configurations
- Template references and code samples
- Advanced features and customization options
- Contributing guidelines and development setup
- Complete API reference and troubleshooting

## Commands

-   `npm run dev` — starts the development server.
-   `npm run build` — builds the project for production.
-   `npm start` — starts the production server.

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

## Documentation Development

To work with the documentation locally:

```bash
```bash
# Install dependencies first
npm install

# Serve documentation locally (uses http-server)
npm run docs:serve

# Open documentation in browser
npm run docs:open
```
```

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## Contributing

We welcome contributions! Follow these steps:

1.  Fork the repository
2.  Create a new branch: `git checkout -b feature-name`
3.  Commit your changes: `git commit -m "Added new feature"`
4.  Push to your branch: `git push origin feature-name`
5.  Open a Pull Request

Our CI/CD pipeline will automatically run tests and provide feedback directly on your Pull Request.

Before submitting, please ensure:

-   Your code follows project style guidelines
-   You have tested your changes locally
-   Update documentation if adding new features

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributors

<div align="center">
<a href="https://github.com/gaureshpai/create-next-quick/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=gaureshpai/create-next-quick" /> 
</a>
</div>