# create-next-quick

**create-next-quick** is a CLI tool that lets you instantly create a new Next.js project with your choice of options.

## Why create-next-quick?

`create-next-quick` is a lightweight and fast alternative to `create-next-app`. It provides an interactive setup process that lets you choose the options you want for your project, such as TypeScript, Tailwind CSS, and the Next.js app directory. It also lets you create multiple pages at once, which can save you a lot of time when starting a new project.

## Features

- **Package Manager Detection** — automatically detects installed package managers (`npm`, `yarn`, `pnpm`) and only prompts with available options.
- **Next.js App Directory** — support for the new Next.js app directory.
- **Custom Page Generation** — create multiple pages at once.
- **Linter Support** — choose between no linter, ESLint, and Biome.
- **Shadcn UI** — automatically install and configure Shadcn UI.
- **Clean Project Setup** — removes default favicon and clears public folder.
- **Empty Default Page** — overwrites the default `page.tsx` or `index.tsx` with an empty template.
- **Dynamic Metadata** — always overwrites the `layout.tsx` or `layout.jsx` with a minimal template.
- **Conditional API Route Deletion** — deletes the default `api/hello.js` route if using the `src` directory and not the `app` directory.
- **Flexible Project Naming** — allows using `.` to create the project in the current directory.
- **ORM Support** — choose between no ORM, Prisma, and Drizzle.

## Installation

You don’t need to install it globally — run it instantly with `npx`:

```bash
npx create-next-quick
```

## 🛠 Usage

When you run `npx create-next-quick`, you will be prompted to:

1. **Enter Project Name** — e.g., `my-app` (or `.` to create in the current directory). If you use `.` the directory must be empty.
2. **Choose a package manager** — detects installed package managers (`npm`, `yarn`, `pnpm`) and prompts you to choose.
3. **Choose to use TypeScript (default: Yes)**
4. **Choose to use Tailwind CSS (default: Yes)**
5. **Choose to use the app directory (default: Yes)**
6. **Enter the names of the pages you want to create (default: none)**
7. **Choose a linter (default: none)**
8. **Choose an ORM (default: none)**
9. **Choose to use Shadcn UI (default: Yes)**

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
? Do you want to use Shadcn UI? Yes
```

## Commands

- `npm run dev` — starts the development server.
- `npm run build` — builds the project for production.
- `npm start` — starts the production server.
- `npm run lint` — lints the project.

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m "Added new feature"`
4. Push to your branch: `git push origin feature-name`
5. Open a Pull Request

Before submitting, please ensure:

- Your code follows project style guidelines
- You have tested your changes locally

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

> Credits: Special thanks to [@harshgupta20](https://github.com/harshgupta20) for the idea and inspiration for this project.