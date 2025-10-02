# create-next-quick

**create-next-quick** is a CLI tool that lets you instantly create a new Next.js project with your choice of options.

## Why create-next-quick?

`create-next-quick` is a lightweight and fast alternative to `create-next-app`. It provides an interactive setup process that lets you choose the options you want for your project, such as TypeScript, Tailwind CSS, and the Next.js app directory. It also lets you create multiple pages at once, which can save you a lot of time when starting a new project.

## Features

- **CLI Argument for Project Name** — skip the project name prompt by passing the app name as a CLI argument.
- **Package Manager Detection** — automatically detects installed package managers (`npm`, `yarn`, `pnpm`) and only prompts with available options.
- **Next.js App Directory** — support for the new Next.js app directory.
- **Custom Page Generation** — create multiple pages at once.
- **Linter Support** — choose between no linter, ESLint, and Biome.
- **Shadcn UI** — automatically installs and configures Shadcn UI with a default style and color.
- **Clean Project Setup** — removes default favicon and clears public folder.
- **Empty Default Page** — overwrites the default `page.tsx` or `index.tsx` with an empty template.
- **Dynamic Metadata** — always overwrites the `layout.tsx` or `layout.jsx` with a minimal template.
- **Conditional API Route Deletion** — deletes the default `api/hello.js` route if using the `src` directory and not the `app` directory.
- **Safe Project Creation** — checks if the current directory is empty when creating a project in the current directory (`.`) and prevents accidental overwrites.
- **ORM Support** — choose between no ORM, Prisma, and Drizzle.
- **Authentication Providers** — integrated support for NextAuth.js, Clerk, and Firebase Auth with automatic package installation and environment setup.
- **Automated CI/CD Feedback** — Pull Requests now receive automated comments on test status.

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
9.  **Do you want to use Shadcn UI? (default: No)**
10. **Choose an authentication provider (default: none)** — NextAuth.js, Clerk, or Firebase Auth

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
? Choose an authentication provider (default: none): nextauth
```

## Commands

- `npm run dev` — starts the development server.
- `npm run build` — builds the project for production.
- `npm start` — starts the production server.

## Authentication Providers

create-next-quick supports several popular authentication providers out of the box:

### NextAuth.js

- **Package**: `next-auth`
- **Setup**: Automatic package installation and environment variable configuration
- **Environment Variables**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`

### Clerk

- **Package**: `@clerk/nextjs`
- **Setup**: Automatic package installation and environment variable configuration
- **Environment Variables**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

### Firebase Auth

- **Package**: `firebase`
- **Setup**: Automatic package installation and environment variable configuration
- **Environment Variables**: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

When you select an authentication provider, the CLI will:

1. Install the required package automatically
2. Create a `.env` file with placeholder environment variables
3. Leave your project ready for authentication setup

**Note**: You'll need to replace the placeholder values in the `.env` file with your actual API keys and configuration from your chosen provider.

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

1.  Fork the repository
2.  Create a new branch: `git checkout -b feature-name`
3.  Commit your changes: `git commit -m "Added new feature"`
4.  Push to your branch: `git push origin feature-name`
5.  Open a Pull Request

Our CI/CD pipeline will automatically run tests and provide feedback directly on your Pull Request.

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
